-- ============================================
-- Nova Glitch Arcade - Complete Database Setup
-- ============================================
-- Run this entire file in Supabase SQL Editor
-- This will create all tables, indexes, and policies
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- TABLES
-- ============================================

-- Profiles table (user accounts)
CREATE TABLE IF NOT EXISTS profiles (
  address TEXT PRIMARY KEY,
  username TEXT,
  plays_used INTEGER DEFAULT 0,
  staked_amount NUMERIC DEFAULT 0,
  tier TEXT CHECK (tier IN ('guest','holder','staker','whale')) DEFAULT 'guest',
  xp INTEGER DEFAULT 0,
  nonce TEXT,
  nonce_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trials table (free trial tracking)
CREATE TABLE IF NOT EXISTS trials (
  address TEXT PRIMARY KEY REFERENCES profiles(address) ON DELETE CASCADE,
  plays_used INTEGER DEFAULT 0,
  last_play TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (game sessions and scores)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
  game TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  score INTEGER DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT FALSE,
  multiplier NUMERIC DEFAULT 1.0,
  final_score INTEGER GENERATED ALWAYS AS (FLOOR(score * multiplier)) STORED
);

-- Stakes table (token staking records)
CREATE TABLE IF NOT EXISTS stakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  tx_hash TEXT UNIQUE,
  chain TEXT CHECK (chain IN ('solana','bsc')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward claims table (reward distribution tracking)
CREATE TABLE IF NOT EXISTS reward_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT REFERENCES profiles(address) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  reward_amount NUMERIC NOT NULL,
  tx_hash TEXT UNIQUE,
  chain TEXT CHECK (chain IN ('solana','bsc')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leaderboard view (for easy querying)
CREATE OR REPLACE VIEW leaderboard AS
SELECT 
  s.address,
  p.username,
  p.tier,
  s.game,
  MAX(s.final_score) as best_score,
  MAX(s.score) as raw_score,
  MAX(s.multiplier) as multiplier,
  COUNT(*) as plays,
  MAX(s.ended_at) as last_played
FROM sessions s
LEFT JOIN profiles p ON s.address = p.address
WHERE s.ended_at IS NOT NULL
GROUP BY s.address, p.username, p.tier, s.game
ORDER BY best_score DESC;

-- ============================================
-- INDEXES (for performance)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_sessions_address ON sessions(address);
CREATE INDEX IF NOT EXISTS idx_sessions_game ON sessions(game);
CREATE INDEX IF NOT EXISTS idx_sessions_score ON sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_final_score ON sessions(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_ended_at ON sessions(ended_at DESC);
CREATE INDEX IF NOT EXISTS idx_stakes_address ON stakes(address);
CREATE INDEX IF NOT EXISTS idx_reward_claims_address ON reward_claims(address);
CREATE INDEX IF NOT EXISTS idx_profiles_tier ON profiles(tier);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_claims ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all, but only update their own
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

-- Trials: Users can only see/modify their own trials
CREATE POLICY "Users can view own trials" 
  ON trials FOR SELECT 
  USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own trials" 
  ON trials FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

CREATE POLICY "Users can update own trials" 
  ON trials FOR UPDATE 
  USING (auth.uid()::text = address);

-- Sessions: Everyone can read (for leaderboards), users can insert their own
CREATE POLICY "Sessions are viewable by everyone" 
  ON sessions FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert own sessions" 
  ON sessions FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

CREATE POLICY "Users can update own sessions" 
  ON sessions FOR UPDATE 
  USING (auth.uid()::text = address);

-- Stakes: Users can only see their own stakes
CREATE POLICY "Users can view own stakes" 
  ON stakes FOR SELECT 
  USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own stakes" 
  ON stakes FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

-- Reward Claims: Users can only see their own claims
CREATE POLICY "Users can view own reward claims" 
  ON reward_claims FOR SELECT 
  USING (auth.uid()::text = address);

CREATE POLICY "Users can insert own reward claims" 
  ON reward_claims FOR INSERT 
  WITH CHECK (auth.uid()::text = address);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to get top scores for a game
CREATE OR REPLACE FUNCTION get_game_leaderboard(game_name TEXT, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  rank BIGINT,
  address TEXT,
  username TEXT,
  tier TEXT,
  best_score INTEGER,
  plays BIGINT,
  last_played TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY MAX(s.final_score) DESC) as rank,
    s.address,
    p.username,
    p.tier,
    MAX(s.final_score)::INTEGER as best_score,
    COUNT(*)::BIGINT as plays,
    MAX(s.ended_at) as last_played
  FROM sessions s
  LEFT JOIN profiles p ON s.address = p.address
  WHERE s.game = game_name AND s.ended_at IS NOT NULL
  GROUP BY s.address, p.username, p.tier
  ORDER BY best_score DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert a test profile (optional)
INSERT INTO profiles (address, username, tier, xp)
VALUES ('test-user-1', 'TestPlayer', 'guest', 0)
ON CONFLICT (address) DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify setup:
-- SELECT * FROM profiles;
-- SELECT * FROM sessions;
-- SELECT * FROM leaderboard;
-- SELECT * FROM get_game_leaderboard('snake', 10);

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- All tables, indexes, policies, and functions created
-- Your database is ready for production use
-- ============================================
