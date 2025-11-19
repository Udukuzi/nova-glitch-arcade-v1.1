-- Payment System Database Schema
-- Run this in Supabase SQL Editor

-- 1. Transactions Table (All platform payments)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  type TEXT NOT NULL, -- 'tournament_prize', 'referral_commission', 'achievement_reward', 'entry_fee', 'withdrawal'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NAG',
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  transaction_hash TEXT, -- Blockchain transaction hash
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 2. Platform Revenue Table (Track platform fees)
CREATE TABLE IF NOT EXISTS platform_revenue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source TEXT NOT NULL, -- 'tournament', 'betting', 'swap_fee'
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NAG',
  tournament_id UUID REFERENCES tournaments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Pending Payouts Table (Queue for automated payouts)
CREATE TABLE IF NOT EXISTS pending_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'NAG',
  reason TEXT NOT NULL, -- 'tournament_prize', 'referral_commission', 'achievement_reward'
  reference_id TEXT, -- Tournament ID, Referral ID, Achievement ID
  priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  status TEXT DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. User Balances Table (Track NAG balances)
CREATE TABLE IF NOT EXISTS user_balances (
  wallet TEXT PRIMARY KEY,
  nag_balance NUMERIC DEFAULT 0,
  usdc_balance NUMERIC DEFAULT 0,
  sol_balance NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_withdrawn NUMERIC DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_wallet ON transactions(wallet);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_pending_payouts_wallet ON pending_payouts(wallet);
CREATE INDEX IF NOT EXISTS idx_pending_payouts_status ON pending_payouts(status);
CREATE INDEX IF NOT EXISTS idx_pending_payouts_scheduled ON pending_payouts(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_platform_revenue_source ON platform_revenue(source);
CREATE INDEX IF NOT EXISTS idx_user_balances_wallet ON user_balances(wallet);

-- Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Transactions viewable by owner" ON transactions;
CREATE POLICY "Transactions viewable by owner" ON transactions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Transactions insertable by everyone" ON transactions;
CREATE POLICY "Transactions insertable by everyone" ON transactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Platform revenue viewable by everyone" ON platform_revenue;
CREATE POLICY "Platform revenue viewable by everyone" ON platform_revenue FOR SELECT USING (true);

DROP POLICY IF EXISTS "Platform revenue insertable by everyone" ON platform_revenue;
CREATE POLICY "Platform revenue insertable by everyone" ON platform_revenue FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Pending payouts viewable by owner" ON pending_payouts;
CREATE POLICY "Pending payouts viewable by owner" ON pending_payouts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Pending payouts insertable by everyone" ON pending_payouts;
CREATE POLICY "Pending payouts insertable by everyone" ON pending_payouts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Pending payouts updatable by everyone" ON pending_payouts;
CREATE POLICY "Pending payouts updatable by everyone" ON pending_payouts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "User balances viewable by owner" ON user_balances;
CREATE POLICY "User balances viewable by owner" ON user_balances FOR SELECT USING (true);

DROP POLICY IF EXISTS "User balances insertable by everyone" ON user_balances;
CREATE POLICY "User balances insertable by everyone" ON user_balances FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "User balances updatable by everyone" ON user_balances;
CREATE POLICY "User balances updatable by everyone" ON user_balances FOR UPDATE USING (true);

-- Function to update user balance
DROP FUNCTION IF EXISTS update_user_balance CASCADE;
CREATE OR REPLACE FUNCTION update_user_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user balance
  INSERT INTO user_balances (wallet, nag_balance, total_earned)
  VALUES (
    NEW.wallet,
    CASE WHEN NEW.type IN ('tournament_prize', 'referral_commission', 'achievement_reward') 
      THEN NEW.amount 
      ELSE 0 
    END,
    CASE WHEN NEW.type IN ('tournament_prize', 'referral_commission', 'achievement_reward') 
      THEN NEW.amount 
      ELSE 0 
    END
  )
  ON CONFLICT (wallet)
  DO UPDATE SET
    nag_balance = user_balances.nag_balance + CASE 
      WHEN NEW.type IN ('tournament_prize', 'referral_commission', 'achievement_reward') THEN NEW.amount
      WHEN NEW.type = 'withdrawal' THEN -NEW.amount
      ELSE 0
    END,
    total_earned = user_balances.total_earned + CASE 
      WHEN NEW.type IN ('tournament_prize', 'referral_commission', 'achievement_reward') THEN NEW.amount
      ELSE 0
    END,
    total_withdrawn = user_balances.total_withdrawn + CASE 
      WHEN NEW.type = 'withdrawal' THEN NEW.amount
      ELSE 0
    END,
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user balance on transaction
DROP TRIGGER IF EXISTS trigger_update_user_balance ON transactions;
CREATE TRIGGER trigger_update_user_balance
  AFTER INSERT ON transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_user_balance();

-- Function to auto-distribute prizes when tournament completes
DROP FUNCTION IF EXISTS auto_distribute_tournament_prizes CASCADE;
CREATE OR REPLACE FUNCTION auto_distribute_tournament_prizes()
RETURNS TRIGGER AS $$
DECLARE
  participant RECORD;
  prize_amount NUMERIC;
  rank_key TEXT;
BEGIN
  -- Only trigger when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Create pending payouts for all winners
    FOR participant IN 
      SELECT * FROM tournament_participants 
      WHERE tournament_id = NEW.id 
      AND final_rank IS NOT NULL
      ORDER BY final_rank ASC
    LOOP
      -- Determine rank key
      rank_key := CASE
        WHEN participant.final_rank = 1 THEN '1st'
        WHEN participant.final_rank = 2 THEN '2nd'
        WHEN participant.final_rank = 3 THEN '3rd'
        WHEN participant.final_rank = 4 THEN '4th'
        WHEN participant.final_rank = 5 THEN '5th'
        WHEN participant.final_rank BETWEEN 6 AND 10 THEN '6th-10th'
        WHEN participant.final_rank BETWEEN 11 AND 20 THEN '11th-20th'
        WHEN participant.final_rank BETWEEN 21 AND 50 THEN '21st-50th'
        ELSE 'unplaced'
      END;
      
      -- Get prize amount from distribution
      prize_amount := (NEW.prize_distribution->>rank_key)::NUMERIC;
      
      -- If there's a prize, queue payout
      IF prize_amount IS NOT NULL AND prize_amount > 0 THEN
        INSERT INTO pending_payouts (
          wallet,
          amount,
          currency,
          reason,
          reference_id,
          priority
        ) VALUES (
          participant.wallet,
          prize_amount,
          'NAG',
          'tournament_prize',
          NEW.id::TEXT,
          10 - participant.final_rank -- Higher rank = higher priority
        );
      END IF;
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-distribute prizes
DROP TRIGGER IF EXISTS trigger_auto_distribute_prizes ON tournaments;
CREATE TRIGGER trigger_auto_distribute_prizes
  AFTER UPDATE ON tournaments
  FOR EACH ROW
  EXECUTE FUNCTION auto_distribute_tournament_prizes();

-- Success message
SELECT 'Payment system tables created successfully!' as message;
