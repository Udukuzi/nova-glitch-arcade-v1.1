-- Battle Arena Demo Mode Tables
-- These tables track simulated competitions for demo purposes
-- Will be expanded for production launch

-- Competitions table
CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mode VARCHAR(50) NOT NULL, -- '1v1', 'team', 'tournament', 'propool'
  entry_fee_usdc DECIMAL(10, 2) NOT NULL,
  prize_pool_nag DECIMAL(18, 6) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed', 'cancelled'
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  winner_address VARCHAR(100),
  is_demo BOOLEAN DEFAULT true, -- Flag for demo competitions
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Competition participants table
CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE,
  address VARCHAR(100) NOT NULL,
  entry_tx_hash VARCHAR(200), -- Will be null for demo
  score INTEGER,
  placement INTEGER,
  payout_amount DECIMAL(18, 6),
  payout_tx_hash VARCHAR(200), -- Will be null for demo
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(competition_id, address)
);

-- Waitlist table for full launch notifications
CREATE TABLE IF NOT EXISTS battle_arena_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  wallet_address VARCHAR(100),
  source VARCHAR(50) DEFAULT 'battle_arena_demo',
  subscribed_at TIMESTAMP DEFAULT NOW(),
  notified BOOLEAN DEFAULT false
);

-- Demo statistics (for video/marketing purposes)
CREATE TABLE IF NOT EXISTS demo_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(18, 6) NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial demo stats
INSERT INTO demo_stats (metric_name, metric_value) VALUES
  ('total_demo_entries', 0),
  ('total_simulated_volume_usdc', 0),
  ('total_demo_players', 0),
  ('most_popular_mode_1v1', 0),
  ('most_popular_mode_team', 0),
  ('most_popular_mode_tournament', 0),
  ('most_popular_mode_propool', 0)
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_mode ON competitions(mode);
CREATE INDEX IF NOT EXISTS idx_competition_participants_address ON competition_participants(address);
CREATE INDEX IF NOT EXISTS idx_competition_participants_competition ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON battle_arena_waitlist(email);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitions_updated_at
  BEFORE UPDATE ON competitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE competitions IS 'Tracks all Battle Arena competitions (demo and production)';
COMMENT ON TABLE competition_participants IS 'Tracks players in each competition';
COMMENT ON TABLE battle_arena_waitlist IS 'Email list for full launch notifications';
COMMENT ON TABLE demo_stats IS 'Aggregated statistics for demo mode marketing';
