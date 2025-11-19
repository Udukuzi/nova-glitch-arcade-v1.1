-- Referral System Database Schema
-- Run this in Supabase SQL Editor

-- 1. User Referral Codes Table
CREATE TABLE IF NOT EXISTS user_referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_referrals INTEGER DEFAULT 0,
  total_earnings NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- 2. Referrals Table (tracks who referred whom)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_wallet TEXT NOT NULL,
  referred_wallet TEXT NOT NULL UNIQUE, -- A user can only be referred once
  referral_code TEXT NOT NULL,
  referred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending', -- pending, active, completed
  total_earnings NUMERIC DEFAULT 0, -- How much the referrer earned from this referral
  games_played INTEGER DEFAULT 0,
  swaps_completed INTEGER DEFAULT 0,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Referral Earnings Table (tracks individual earnings)
CREATE TABLE IF NOT EXISTS referral_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_wallet TEXT NOT NULL,
  referred_wallet TEXT NOT NULL,
  earning_type TEXT NOT NULL, -- game_fee, swap_fee, etc.
  amount NUMERIC NOT NULL,
  transaction_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_codes_wallet ON user_referral_codes(wallet);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON user_referral_codes(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_wallet);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_earnings_referrer ON referral_earnings(referrer_wallet);
CREATE INDEX IF NOT EXISTS idx_earnings_created ON referral_earnings(created_at DESC);

-- Row Level Security
ALTER TABLE user_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_earnings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Referral codes viewable by everyone" ON user_referral_codes;
CREATE POLICY "Referral codes viewable by everyone" ON user_referral_codes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own referral code" ON user_referral_codes;
CREATE POLICY "Users can insert own referral code" ON user_referral_codes FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Referrals viewable by everyone" ON referrals;
CREATE POLICY "Referrals viewable by everyone" ON referrals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Referrals insertable by everyone" ON referrals;
CREATE POLICY "Referrals insertable by everyone" ON referrals FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Earnings viewable by everyone" ON referral_earnings;
CREATE POLICY "Earnings viewable by everyone" ON referral_earnings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Earnings insertable by everyone" ON referral_earnings;
CREATE POLICY "Earnings insertable by everyone" ON referral_earnings FOR INSERT WITH CHECK (true);

-- Function to update referrer stats when new referral is added
DROP FUNCTION IF EXISTS update_referrer_stats CASCADE;
CREATE OR REPLACE FUNCTION update_referrer_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total referrals count
  UPDATE user_referral_codes 
  SET total_referrals = (
    SELECT COUNT(*) FROM referrals WHERE referrer_wallet = NEW.referrer_wallet
  )
  WHERE wallet = NEW.referrer_wallet;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update stats
DROP TRIGGER IF EXISTS trigger_update_referrer_stats ON referrals;
CREATE TRIGGER trigger_update_referrer_stats
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION update_referrer_stats();

-- Function to update earnings when new earning is added
DROP FUNCTION IF EXISTS update_referrer_earnings CASCADE;
CREATE OR REPLACE FUNCTION update_referrer_earnings()
RETURNS TRIGGER AS $$
BEGIN
  -- Update total earnings in user_referral_codes
  UPDATE user_referral_codes 
  SET total_earnings = (
    SELECT COALESCE(SUM(amount), 0) FROM referral_earnings WHERE referrer_wallet = NEW.referrer_wallet
  )
  WHERE wallet = NEW.referrer_wallet;
  
  -- Update earnings for this specific referral
  UPDATE referrals
  SET total_earnings = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM referral_earnings 
    WHERE referrer_wallet = NEW.referrer_wallet AND referred_wallet = NEW.referred_wallet
  )
  WHERE referrer_wallet = NEW.referrer_wallet AND referred_wallet = NEW.referred_wallet;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update earnings
DROP TRIGGER IF EXISTS trigger_update_referrer_earnings ON referral_earnings;
CREATE TRIGGER trigger_update_referrer_earnings
  AFTER INSERT ON referral_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_referrer_earnings();

-- Success message
SELECT 'Referral system tables created successfully!' as message;
