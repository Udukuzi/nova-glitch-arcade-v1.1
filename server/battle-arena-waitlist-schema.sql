-- Battle Arena Waitlist Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS battle_arena_waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  wallet_address VARCHAR(255),
  source VARCHAR(100) DEFAULT 'Battle Arena Demo',
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON battle_arena_waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_wallet ON battle_arena_waitlist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON battle_arena_waitlist(created_at DESC);

-- Add comment
COMMENT ON TABLE battle_arena_waitlist IS 'Stores email signups for Battle Arena launch notifications';

-- Enable Row Level Security
ALTER TABLE battle_arena_waitlist ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for waitlist signup)
CREATE POLICY "Anyone can join waitlist"
  ON battle_arena_waitlist
  FOR INSERT
  WITH CHECK (true);

-- Only allow admins to view
CREATE POLICY "Only admins can view waitlist"
  ON battle_arena_waitlist
  FOR SELECT
  USING (false); -- Will be accessed via service role key from backend

-- Grant permissions
GRANT INSERT ON battle_arena_waitlist TO anon, authenticated;
GRANT SELECT ON battle_arena_waitlist TO service_role;

-- Create function to get waitlist count (public)
CREATE OR REPLACE FUNCTION get_waitlist_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM battle_arena_waitlist;
$$;

-- Grant execute to everyone
GRANT EXECUTE ON FUNCTION get_waitlist_count() TO anon, authenticated, service_role;
