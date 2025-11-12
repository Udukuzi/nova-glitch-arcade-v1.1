-- x402 Betting System Tables

-- Betting matches table
CREATE TABLE IF NOT EXISTS betting_matches (
  id TEXT PRIMARY KEY,
  player1 TEXT REFERENCES profiles(address),
  player2 TEXT REFERENCES profiles(address),
  game_id TEXT NOT NULL,
  bet_amount NUMERIC NOT NULL,
  currency TEXT CHECK (currency IN ('USDC', 'USDT', 'SOL')) NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'in_progress', 'settled', 'cancelled')) DEFAULT 'pending',
  escrow_address TEXT,
  winner TEXT,
  winner_payout NUMERIC,
  platform_fee NUMERIC,
  player1_score INTEGER,
  player2_score INTEGER,
  player1_payment_status TEXT,
  player1_payment_id TEXT,
  player2_payment_status TEXT,
  player2_payment_id TEXT,
  x402_request_id TEXT,
  x402_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  settled_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX idx_betting_player1 ON betting_matches(player1);
CREATE INDEX idx_betting_player2 ON betting_matches(player2);
CREATE INDEX idx_betting_status ON betting_matches(status);
CREATE INDEX idx_betting_game ON betting_matches(game_id);

-- Agent transactions table
CREATE TABLE IF NOT EXISTS agent_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id TEXT REFERENCES betting_matches(id),
  transaction_type TEXT CHECK (transaction_type IN ('deposit', 'withdrawal', 'fee', 'payout')) NOT NULL,
  from_address TEXT,
  to_address TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  tx_signature TEXT,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'failed')) DEFAULT 'pending',
  x402_headers JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ
);

-- Agent settings table
CREATE TABLE IF NOT EXISTS agent_settings (
  id SERIAL PRIMARY KEY,
  min_bet_usdc NUMERIC DEFAULT 1,
  max_bet_usdc NUMERIC DEFAULT 100,
  platform_fee_percent NUMERIC DEFAULT 5,
  nag_withdrawal_rate NUMERIC DEFAULT 1.2, -- 20% bonus for NAG withdrawals
  agent_wallet_address TEXT,
  escrow_program_id TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO agent_settings (min_bet_usdc, max_bet_usdc, platform_fee_percent, nag_withdrawal_rate)
VALUES (1, 100, 5, 1.2)
ON CONFLICT (id) DO NOTHING;

-- Anti-cheat tables
CREATE TABLE IF NOT EXISTS anti_cheat_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT,
  profile_id TEXT REFERENCES profiles(address),
  reason TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  details JSONB
);

CREATE INDEX idx_anticheat_profile ON anti_cheat_logs(profile_id);
CREATE INDEX idx_anticheat_session ON anti_cheat_logs(session_id);
CREATE INDEX idx_anticheat_timestamp ON anti_cheat_logs(timestamp);

-- Competition modes configuration
CREATE TABLE IF NOT EXISTS competition_modes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  max_bet_amount NUMERIC NOT NULL,
  competition_fee NUMERIC NOT NULL,
  allowed_games TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO competition_modes (id, name, min_age, max_age, max_bet_amount, competition_fee, allowed_games) VALUES
('KIDS', 'Kids Mode', 7, 12, 1, 0.01, ARRAY['snake', 'memory', 'tetramem']),
('TEEN', 'Teen Mode', 13, 17, 5, 0.05, ARRAY['all']),
('ADULT', 'Pro Mode', 18, 99, 100, 0.1, ARRAY['all'])
ON CONFLICT DO NOTHING;

-- NAG token settings
CREATE TABLE IF NOT EXISTS nag_settings (
  id SERIAL PRIMARY KEY,
  withdrawal_required BOOLEAN DEFAULT true,
  bonus_multiplier NUMERIC DEFAULT 1.25,
  min_withdrawal_amount NUMERIC DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO nag_settings (withdrawal_required, bonus_multiplier, min_withdrawal_amount)
VALUES (true, 1.25, 10)
ON CONFLICT DO NOTHING;

-- Age verification table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS age_group TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 100;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
