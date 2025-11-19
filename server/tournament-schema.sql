-- Tournament System Database Schema
-- Run this in Supabase SQL Editor

-- 1. Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_name TEXT NOT NULL,
  description TEXT,
  entry_fee NUMERIC DEFAULT 0,
  prize_pool NUMERIC DEFAULT 0,
  prize_distribution JSONB DEFAULT '{"1st": 50, "2nd": 30, "3rd": 20}'::jsonb,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming', -- upcoming, active, completed, cancelled
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  rules JSONB,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tournament Participants Table
CREATE TABLE IF NOT EXISTS tournament_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  username TEXT,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entry_paid BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'registered', -- registered, active, eliminated, winner
  final_score INTEGER DEFAULT 0,
  final_rank INTEGER,
  prize_won NUMERIC DEFAULT 0,
  UNIQUE(tournament_id, wallet)
);

-- 3. Tournament Scores Table (track all game submissions)
CREATE TABLE IF NOT EXISTS tournament_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES tournament_participants(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER,
  accuracy NUMERIC,
  metadata JSONB,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT TRUE
);

-- 4. Tournament Brackets Table (for bracket-style tournaments)
CREATE TABLE IF NOT EXISTS tournament_brackets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  player1_wallet TEXT,
  player2_wallet TEXT,
  player1_score INTEGER,
  player2_score INTEGER,
  winner_wallet TEXT,
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  scheduled_time TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_game ON tournaments(game_name);
CREATE INDEX IF NOT EXISTS idx_tournaments_start ON tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_participants_tournament ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_participants_wallet ON tournament_participants(wallet);
CREATE INDEX IF NOT EXISTS idx_scores_tournament ON tournament_scores(tournament_id);
CREATE INDEX IF NOT EXISTS idx_scores_wallet ON tournament_scores(wallet);
CREATE INDEX IF NOT EXISTS idx_brackets_tournament ON tournament_brackets(tournament_id);

-- Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_brackets ENABLE ROW LEVEL SECURITY;

-- Policies (everyone can read, only system can write for now)
DROP POLICY IF EXISTS "Tournaments viewable by everyone" ON tournaments;
CREATE POLICY "Tournaments viewable by everyone" ON tournaments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Tournaments insertable by everyone" ON tournaments;
CREATE POLICY "Tournaments insertable by everyone" ON tournaments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Tournaments updatable by everyone" ON tournaments;
CREATE POLICY "Tournaments updatable by everyone" ON tournaments FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Participants viewable by everyone" ON tournament_participants;
CREATE POLICY "Participants viewable by everyone" ON tournament_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Participants insertable by everyone" ON tournament_participants;
CREATE POLICY "Participants insertable by everyone" ON tournament_participants FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Participants updatable by everyone" ON tournament_participants;
CREATE POLICY "Participants updatable by everyone" ON tournament_participants FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Scores viewable by everyone" ON tournament_scores;
CREATE POLICY "Scores viewable by everyone" ON tournament_scores FOR SELECT USING (true);

DROP POLICY IF EXISTS "Scores insertable by everyone" ON tournament_scores;
CREATE POLICY "Scores insertable by everyone" ON tournament_scores FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Brackets viewable by everyone" ON tournament_brackets;
CREATE POLICY "Brackets viewable by everyone" ON tournament_brackets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Brackets insertable by everyone" ON tournament_brackets;
CREATE POLICY "Brackets insertable by everyone" ON tournament_brackets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Brackets updatable by everyone" ON tournament_brackets;
CREATE POLICY "Brackets updatable by everyone" ON tournament_brackets FOR UPDATE USING (true);

-- Function to update participant count
DROP FUNCTION IF EXISTS update_tournament_participant_count CASCADE;
CREATE OR REPLACE FUNCTION update_tournament_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tournaments
  SET current_participants = (
    SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = NEW.tournament_id
  )
  WHERE id = NEW.tournament_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update participant count
DROP TRIGGER IF EXISTS trigger_update_participant_count ON tournament_participants;
CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR DELETE ON tournament_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_participant_count();

-- Function to calculate prize pool from entry fees
DROP FUNCTION IF EXISTS update_tournament_prize_pool CASCADE;
CREATE OR REPLACE FUNCTION update_tournament_prize_pool()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if entry was just paid
  IF NEW.entry_paid = TRUE AND (OLD IS NULL OR OLD.entry_paid = FALSE) THEN
    UPDATE tournaments
    SET prize_pool = prize_pool + (
      SELECT entry_fee FROM tournaments WHERE id = NEW.tournament_id
    )
    WHERE id = NEW.tournament_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update prize pool
DROP TRIGGER IF EXISTS trigger_update_prize_pool ON tournament_participants;
CREATE TRIGGER trigger_update_prize_pool
  AFTER INSERT OR UPDATE ON tournament_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_tournament_prize_pool();

-- Function to auto-update tournament status
DROP FUNCTION IF EXISTS update_tournament_status CASCADE;
CREATE OR REPLACE FUNCTION update_tournament_status()
RETURNS void AS $$
BEGIN
  -- Mark tournaments as active when start time is reached
  UPDATE tournaments
  SET status = 'active'
  WHERE status = 'upcoming'
  AND start_time <= NOW();
  
  -- Mark tournaments as completed when end time is reached
  UPDATE tournaments
  SET status = 'completed'
  WHERE status = 'active'
  AND end_time <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Tournament system tables created successfully!' as message;
