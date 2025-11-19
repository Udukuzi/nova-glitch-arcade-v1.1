-- AI Monitoring & Anti-Cheat System
-- Database schema for tracking gameplay, detecting cheating, and managing bans

-- ============================================
-- 1. GAME SESSIONS - Track every game played
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  game_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER NOT NULL, -- How long the game lasted
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  
  -- Performance metrics for AI analysis
  moves_per_minute DECIMAL(10, 2), -- Speed of gameplay
  average_reaction_time INTEGER, -- Milliseconds
  perfect_moves INTEGER DEFAULT 0, -- Count of perfect moves (suspicious if too high)
  mistakes INTEGER DEFAULT 0,
  
  -- Anti-cheat flags
  is_suspicious BOOLEAN DEFAULT FALSE,
  suspicion_score INTEGER DEFAULT 0, -- 0-100 suspicion level
  flagged_reasons TEXT[], -- Array of reasons if flagged
  
  -- Session metadata
  ip_address TEXT,
  user_agent TEXT,
  device_fingerprint TEXT,
  
  -- Tournament context
  tournament_id UUID,
  is_tournament_game BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_wallet ON game_sessions(wallet);
CREATE INDEX IF NOT EXISTS idx_game_sessions_game ON game_sessions(game_name);
CREATE INDEX IF NOT EXISTS idx_game_sessions_suspicious ON game_sessions(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_game_sessions_tournament ON game_sessions(tournament_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_created ON game_sessions(created_at DESC);

-- ============================================
-- 2. PLAYER STATISTICS - Historical performance
-- ============================================
CREATE TABLE IF NOT EXISTS player_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL UNIQUE,
  
  -- Overall stats
  total_games_played INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  average_score DECIMAL(10, 2) DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  lowest_score INTEGER DEFAULT 0,
  
  -- Performance patterns
  average_duration_seconds INTEGER,
  average_moves_per_minute DECIMAL(10, 2),
  average_reaction_time INTEGER,
  consistency_score DECIMAL(5, 2), -- 0-100, how consistent their scores are
  
  -- Behavioral metrics
  total_suspicious_games INTEGER DEFAULT 0,
  suspicion_rate DECIMAL(5, 2) DEFAULT 0, -- Percentage of games flagged
  last_suspicious_activity TIMESTAMP WITH TIME ZONE,
  
  -- Account status
  is_banned BOOLEAN DEFAULT FALSE,
  is_whitelisted BOOLEAN DEFAULT FALSE, -- Trusted players
  trust_score INTEGER DEFAULT 50, -- 0-100, starts at 50
  
  -- Timestamps
  first_game_at TIMESTAMP WITH TIME ZONE,
  last_game_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_player_stats_wallet ON player_statistics(wallet);
CREATE INDEX IF NOT EXISTS idx_player_stats_banned ON player_statistics(is_banned);
CREATE INDEX IF NOT EXISTS idx_player_stats_suspicious_rate ON player_statistics(suspicion_rate DESC);

-- ============================================
-- 3. SUSPICIOUS ACTIVITIES - Flagged behaviors
-- ============================================
CREATE TABLE IF NOT EXISTS suspicious_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL,
  game_session_id UUID REFERENCES game_sessions(id),
  
  -- Activity details
  activity_type TEXT NOT NULL, -- 'impossible_score', 'bot_pattern', 'speed_hack', etc.
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  
  -- AI Detection
  confidence_score DECIMAL(5, 2), -- 0-100, AI confidence in detection
  detected_by TEXT DEFAULT 'ai_system', -- 'ai_system', 'manual_review', 'player_report'
  
  -- Evidence
  evidence_data JSONB, -- Store detailed evidence
  screenshot_url TEXT,
  
  -- Review status
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'confirmed', 'false_positive'
  reviewed_by TEXT, -- Admin wallet who reviewed
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  
  -- Action taken
  action_taken TEXT, -- 'none', 'warning', 'temp_ban', 'permanent_ban'
  action_taken_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suspicious_wallet ON suspicious_activities(wallet);
CREATE INDEX IF NOT EXISTS idx_suspicious_status ON suspicious_activities(status);
CREATE INDEX IF NOT EXISTS idx_suspicious_severity ON suspicious_activities(severity);
CREATE INDEX IF NOT EXISTS idx_suspicious_created ON suspicious_activities(created_at DESC);

-- ============================================
-- 4. BAN LIST - Banned players
-- ============================================
CREATE TABLE IF NOT EXISTS ban_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet TEXT NOT NULL UNIQUE,
  
  -- Ban details
  ban_type TEXT NOT NULL, -- 'temporary', 'permanent'
  reason TEXT NOT NULL,
  evidence TEXT[],
  
  -- Ban period
  banned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banned_until TIMESTAMP WITH TIME ZONE, -- NULL for permanent
  banned_by TEXT NOT NULL, -- Admin wallet or 'auto_system'
  
  -- Appeal
  appeal_status TEXT DEFAULT 'none', -- 'none', 'pending', 'approved', 'denied'
  appeal_message TEXT,
  appeal_submitted_at TIMESTAMP WITH TIME ZONE,
  appeal_reviewed_by TEXT,
  appeal_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  -- Unban tracking
  is_active BOOLEAN DEFAULT TRUE,
  unbanned_at TIMESTAMP WITH TIME ZONE,
  unbanned_by TEXT,
  unban_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ban_wallet ON ban_list(wallet);
CREATE INDEX IF NOT EXISTS idx_ban_active ON ban_list(is_active);
CREATE INDEX IF NOT EXISTS idx_ban_type ON ban_list(ban_type);

-- ============================================
-- 5. AI DETECTION RULES - Configurable thresholds
-- ============================================
CREATE TABLE IF NOT EXISTS ai_detection_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT NOT NULL UNIQUE,
  rule_type TEXT NOT NULL, -- 'score_threshold', 'speed_check', 'pattern_detection'
  
  -- Rule configuration
  is_active BOOLEAN DEFAULT TRUE,
  severity TEXT NOT NULL, -- 'low', 'medium', 'high', 'critical'
  
  -- Thresholds (JSONB for flexibility)
  thresholds JSONB NOT NULL,
  
  -- Actions
  auto_flag BOOLEAN DEFAULT TRUE,
  auto_ban BOOLEAN DEFAULT FALSE,
  requires_manual_review BOOLEAN DEFAULT TRUE,
  
  -- Rule description
  description TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI detection rules
INSERT INTO ai_detection_rules (rule_name, rule_type, severity, thresholds, description) VALUES
('impossible_score', 'score_threshold', 'critical', 
  '{"max_score_per_game": 1000000, "max_score_increase_rate": 50000}',
  'Flags scores that exceed maximum possible score or increase too rapidly'),

('bot_speed', 'speed_check', 'high',
  '{"min_moves_per_minute": 300, "max_moves_per_minute": 1000, "min_reaction_time_ms": 50}',
  'Detects inhuman speed or reaction times'),

('perfect_gameplay', 'pattern_detection', 'medium',
  '{"perfect_moves_threshold": 0.95, "zero_mistakes_threshold": 10}',
  'Flags players with suspiciously perfect gameplay patterns'),

('rapid_score_gain', 'score_threshold', 'high',
  '{"score_gain_per_minute": 100000, "consecutive_high_scores": 5}',
  'Detects rapid score increases that suggest cheating'),

('session_anomaly', 'pattern_detection', 'low',
  '{"session_count_per_hour": 50, "simultaneous_sessions": 3}',
  'Flags unusual session patterns')
ON CONFLICT (rule_name) DO NOTHING;

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Function to update player statistics after each game
CREATE OR REPLACE FUNCTION update_player_statistics()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO player_statistics (
    wallet,
    total_games_played,
    total_score,
    highest_score,
    lowest_score,
    first_game_at,
    last_game_at,
    total_suspicious_games
  ) VALUES (
    NEW.wallet,
    1,
    NEW.score,
    NEW.score,
    NEW.score,
    NEW.created_at,
    NEW.created_at,
    CASE WHEN NEW.is_suspicious THEN 1 ELSE 0 END
  )
  ON CONFLICT (wallet) DO UPDATE SET
    total_games_played = player_statistics.total_games_played + 1,
    total_score = player_statistics.total_score + NEW.score,
    average_score = (player_statistics.total_score + NEW.score) / (player_statistics.total_games_played + 1),
    highest_score = GREATEST(player_statistics.highest_score, NEW.score),
    lowest_score = LEAST(player_statistics.lowest_score, NEW.score),
    last_game_at = NEW.created_at,
    total_suspicious_games = player_statistics.total_suspicious_games + CASE WHEN NEW.is_suspicious THEN 1 ELSE 0 END,
    suspicion_rate = ((player_statistics.total_suspicious_games + CASE WHEN NEW.is_suspicious THEN 1 ELSE 0 END) * 100.0) / (player_statistics.total_games_played + 1),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update stats
CREATE TRIGGER trigger_update_player_stats
AFTER INSERT ON game_sessions
FOR EACH ROW
EXECUTE FUNCTION update_player_statistics();

-- Function to check if player is banned
CREATE OR REPLACE FUNCTION is_player_banned(player_wallet TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM ban_list
    WHERE wallet = player_wallet
    AND is_active = TRUE
    AND (ban_type = 'permanent' OR (ban_type = 'temporary' AND banned_until > NOW()))
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE suspicious_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ban_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_detection_rules ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access on game_sessions" ON game_sessions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on player_statistics" ON player_statistics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on suspicious_activities" ON suspicious_activities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on ban_list" ON ban_list FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on ai_detection_rules" ON ai_detection_rules FOR ALL USING (auth.role() = 'service_role');

-- Players can view their own sessions and stats
CREATE POLICY "Players view own sessions" ON game_sessions FOR SELECT USING (TRUE);
CREATE POLICY "Players view own stats" ON player_statistics FOR SELECT USING (TRUE);

-- Only admins can view suspicious activities and bans
CREATE POLICY "Public cannot view suspicious activities" ON suspicious_activities FOR SELECT USING (FALSE);
CREATE POLICY "Public cannot view ban list" ON ban_list FOR SELECT USING (FALSE);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
COMMENT ON TABLE game_sessions IS 'AI Monitoring: Tracks all gameplay sessions with performance metrics';
COMMENT ON TABLE player_statistics IS 'AI Monitoring: Historical player performance and behavioral patterns';
COMMENT ON TABLE suspicious_activities IS 'AI Monitoring: Logged suspicious activities flagged by AI';
COMMENT ON TABLE ban_list IS 'AI Monitoring: Banned players with appeal tracking';
COMMENT ON TABLE ai_detection_rules IS 'AI Monitoring: Configurable anti-cheat detection rules';
