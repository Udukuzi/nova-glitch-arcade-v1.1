-- ========================================
-- NOVA GLITCH ARCADE - DATABASE SCHEMA
-- Production-ready tables for activity tracking and achievements
-- ========================================

-- ========================================
-- ACTIVITIES TABLE
-- Stores all user activities (games, swaps, achievements, wins)
-- ========================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  username TEXT,
  type TEXT NOT NULL CHECK (type IN ('game', 'swap', 'achievement', 'win')),
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_wallet ON activities(wallet);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read activities
CREATE POLICY "Activities are viewable by everyone" 
  ON activities FOR SELECT 
  USING (true);

-- Policy: Authenticated users can insert their own activities
CREATE POLICY "Users can insert their own activities" 
  ON activities FOR INSERT 
  WITH CHECK (true);

-- ========================================
-- USER_ACHIEVEMENTS TABLE
-- Tracks user progress and unlocked achievements
-- ========================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(wallet, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_wallet ON user_achievements(wallet);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON user_achievements(unlocked);

-- Enable Row Level Security
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all achievements
CREATE POLICY "Achievements are viewable by everyone" 
  ON user_achievements FOR SELECT 
  USING (true);

-- Policy: Users can update their own achievements
CREATE POLICY "Users can update their own achievements" 
  ON user_achievements FOR ALL 
  USING (true);

-- ========================================
-- PENDING_REWARDS TABLE
-- Tracks rewards to be distributed (NAG tokens, etc.)
-- ========================================

CREATE TABLE IF NOT EXISTS pending_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('achievement', 'referral', 'tournament', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  transaction_signature TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_pending_rewards_wallet ON pending_rewards(wallet);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_status ON pending_rewards(status);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_created_at ON pending_rewards(created_at DESC);

-- Enable Row Level Security
ALTER TABLE pending_rewards ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own rewards
CREATE POLICY "Users can read their own rewards" 
  ON pending_rewards FOR SELECT 
  USING (true);

-- ========================================
-- USER_STATS TABLE
-- Aggregated user statistics for quick lookups
-- ========================================

CREATE TABLE IF NOT EXISTS user_stats (
  wallet TEXT PRIMARY KEY,
  games_played INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  swap_count INTEGER DEFAULT 0,
  total_swap_volume NUMERIC DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  total_play_time INTEGER DEFAULT 0,
  nag_balance NUMERIC DEFAULT 0,
  rank INTEGER,
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_stats_rank ON user_stats(rank);
CREATE INDEX IF NOT EXISTS idx_user_stats_highest_score ON user_stats(highest_score DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_active ON user_stats(last_active DESC);

-- Enable Row Level Security
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all stats
CREATE POLICY "User stats are viewable by everyone" 
  ON user_stats FOR SELECT 
  USING (true);

-- Policy: Users can update their own stats
CREATE POLICY "Users can update their own stats" 
  ON user_stats FOR ALL 
  USING (true);

-- ========================================
-- GAME_SESSIONS TABLE
-- Individual game session tracking
-- ========================================

CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet TEXT NOT NULL,
  username TEXT,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  duration INTEGER,
  accuracy NUMERIC,
  metadata JSONB,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_wallet ON game_sessions(wallet);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game_name ON game_sessions(game_name);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_sessions_completed_at ON game_sessions(completed_at DESC);

-- Enable Row Level Security
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- Policy: Sessions are viewable by everyone
CREATE POLICY "Game sessions are viewable by everyone" 
  ON game_sessions FOR SELECT 
  USING (true);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update user_stats after game completion
CREATE OR REPLACE FUNCTION update_user_stats_after_game()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_stats (wallet, games_played, total_score, highest_score, last_active)
  VALUES (NEW.wallet, 1, NEW.score, NEW.score, NOW())
  ON CONFLICT (wallet) DO UPDATE SET
    games_played = user_stats.games_played + 1,
    total_score = user_stats.total_score + NEW.score,
    highest_score = GREATEST(user_stats.highest_score, NEW.score),
    last_active = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Update stats when game completes
DROP TRIGGER IF EXISTS trigger_update_user_stats_after_game ON game_sessions;
CREATE TRIGGER trigger_update_user_stats_after_game
AFTER INSERT ON game_sessions
FOR EACH ROW
WHEN (NEW.completed_at IS NOT NULL)
EXECUTE FUNCTION update_user_stats_after_game();

-- ========================================
-- EXAMPLE QUERIES
-- ========================================

-- Get top 10 players by score
-- SELECT wallet, highest_score, games_played 
-- FROM user_stats 
-- ORDER BY highest_score DESC 
-- LIMIT 10;

-- Get recent activities
-- SELECT * FROM activities 
-- ORDER BY created_at DESC 
-- LIMIT 20;

-- Get user's unlocked achievements
-- SELECT * FROM user_achievements 
-- WHERE wallet = 'YOUR_WALLET' AND unlocked = true;

-- Get pending rewards for a user
-- SELECT * FROM pending_rewards 
-- WHERE wallet = 'YOUR_WALLET' AND status = 'pending';
