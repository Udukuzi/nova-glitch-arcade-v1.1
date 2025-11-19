-- Social Features System
-- Database schema for friends, challenges, and social interactions

-- ============================================
-- 1. FRIEND RELATIONSHIPS
-- ============================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  friend_wallet TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'blocked'
  requested_by TEXT NOT NULL, -- Who initiated the friend request
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  
  -- Prevent duplicate friendships
  UNIQUE(user_wallet, friend_wallet),
  -- Ensure users can't friend themselves
  CHECK (user_wallet != friend_wallet)
);

CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_wallet, status);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_wallet, status);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);

-- ============================================
-- 2. GAME CHALLENGES
-- ============================================
CREATE TABLE IF NOT EXISTS game_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenger_wallet TEXT NOT NULL,
  challenged_wallet TEXT NOT NULL,
  game_name TEXT NOT NULL,
  
  -- Challenge details
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'accepted', 'declined', 'completed', 'expired'
  wager_amount DECIMAL(10, 2) DEFAULT 0, -- NAG tokens wagered
  wager_currency TEXT DEFAULT 'NAG',
  
  -- Challenge results
  challenger_score INTEGER,
  challenged_score INTEGER,
  winner_wallet TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Ensure users can't challenge themselves
  CHECK (challenger_wallet != challenged_wallet)
);

CREATE INDEX IF NOT EXISTS idx_challenges_challenger ON game_challenges(challenger_wallet, status);
CREATE INDEX IF NOT EXISTS idx_challenges_challenged ON game_challenges(challenged_wallet, status);
CREATE INDEX IF NOT EXISTS idx_challenges_status ON game_challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_expires ON game_challenges(expires_at);

-- ============================================
-- 3. SOCIAL FEED ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS social_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_wallet TEXT NOT NULL,
  activity_type TEXT NOT NULL, -- 'score', 'achievement', 'challenge_won', 'friend_added', 'tournament_win'
  
  -- Activity data
  game_name TEXT,
  score INTEGER,
  achievement_id TEXT,
  metadata JSONB, -- Flexible field for additional data
  
  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_user ON social_activities(user_wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_type ON social_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON social_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_public ON social_activities(is_public, created_at DESC);

-- ============================================
-- 4. DIRECT MESSAGES (Optional)
-- ============================================
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_wallet TEXT NOT NULL,
  recipient_wallet TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Message status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  is_flagged BOOLEAN DEFAULT FALSE,
  flagged_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure users can't message themselves
  CHECK (sender_wallet != recipient_wallet)
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON direct_messages(sender_wallet, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON direct_messages(recipient_wallet, created_at DESC, is_read);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON direct_messages(sender_wallet, recipient_wallet, created_at);

-- ============================================
-- 5. USER PREFERENCES
-- ============================================
CREATE TABLE IF NOT EXISTS user_social_preferences (
  wallet TEXT PRIMARY KEY,
  
  -- Privacy settings
  accept_friend_requests BOOLEAN DEFAULT TRUE,
  accept_challenges BOOLEAN DEFAULT TRUE,
  accept_messages BOOLEAN DEFAULT TRUE,
  show_online_status BOOLEAN DEFAULT TRUE,
  show_activity_feed BOOLEAN DEFAULT TRUE,
  
  -- Notification preferences
  notify_friend_requests BOOLEAN DEFAULT TRUE,
  notify_challenges BOOLEAN DEFAULT TRUE,
  notify_messages BOOLEAN DEFAULT TRUE,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to auto-create reciprocal friendship
CREATE OR REPLACE FUNCTION create_reciprocal_friendship()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' THEN
    -- Create the reciprocal friendship
    INSERT INTO friendships (user_wallet, friend_wallet, status, requested_by, created_at, accepted_at)
    VALUES (NEW.friend_wallet, NEW.user_wallet, 'accepted', NEW.requested_by, NEW.created_at, NEW.accepted_at)
    ON CONFLICT (user_wallet, friend_wallet) DO UPDATE
    SET status = 'accepted', accepted_at = NEW.accepted_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_reciprocal_friendship
AFTER UPDATE OF status ON friendships
FOR EACH ROW
WHEN (NEW.status = 'accepted' AND OLD.status = 'pending')
EXECUTE FUNCTION create_reciprocal_friendship();

-- Function to create social activity when challenge is won
CREATE OR REPLACE FUNCTION create_challenge_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND NEW.winner_wallet IS NOT NULL THEN
    INSERT INTO social_activities (user_wallet, activity_type, game_name, score, metadata)
    VALUES (
      NEW.winner_wallet,
      'challenge_won',
      NEW.game_name,
      CASE 
        WHEN NEW.winner_wallet = NEW.challenger_wallet THEN NEW.challenger_score
        ELSE NEW.challenged_score
      END,
      jsonb_build_object(
        'opponent', CASE 
          WHEN NEW.winner_wallet = NEW.challenger_wallet THEN NEW.challenged_wallet
          ELSE NEW.challenger_wallet
        END,
        'wager', NEW.wager_amount
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_challenge_activity
AFTER UPDATE OF status ON game_challenges
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION create_challenge_activity();

-- Function to expire old challenges
CREATE OR REPLACE FUNCTION expire_old_challenges()
RETURNS void AS $$
BEGIN
  UPDATE game_challenges
  SET status = 'expired'
  WHERE status IN ('pending', 'accepted')
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_social_preferences ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access on friendships" ON friendships FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on game_challenges" ON game_challenges FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on social_activities" ON social_activities FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on direct_messages" ON direct_messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access on user_social_preferences" ON user_social_preferences FOR ALL USING (auth.role() = 'service_role');

-- Public read policies
CREATE POLICY "Users can view their friendships" ON friendships FOR SELECT USING (TRUE);
CREATE POLICY "Users can view their challenges" ON game_challenges FOR SELECT USING (TRUE);
CREATE POLICY "Users can view public activities" ON social_activities FOR SELECT USING (is_public = TRUE);
CREATE POLICY "Users can view their own messages" ON direct_messages FOR SELECT USING (TRUE);
CREATE POLICY "Users can view their preferences" ON user_social_preferences FOR SELECT USING (TRUE);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- View for getting friend lists
CREATE OR REPLACE VIEW user_friends AS
SELECT 
  f.user_wallet,
  f.friend_wallet,
  f.status,
  f.accepted_at,
  us.highest_score,
  us.total_score,
  us.games_played
FROM friendships f
LEFT JOIN user_stats us ON us.wallet = f.friend_wallet
WHERE f.status = 'accepted';

-- View for getting pending friend requests
CREATE OR REPLACE VIEW pending_friend_requests AS
SELECT 
  f.id,
  f.user_wallet,
  f.friend_wallet,
  f.requested_by,
  f.created_at,
  us.highest_score,
  us.total_score
FROM friendships f
LEFT JOIN user_stats us ON us.wallet = f.requested_by
WHERE f.status = 'pending';

-- View for active challenges
CREATE OR REPLACE VIEW active_challenges AS
SELECT 
  c.*,
  us1.highest_score as challenger_highest_score,
  us2.highest_score as challenged_highest_score
FROM game_challenges c
LEFT JOIN user_stats us1 ON us1.wallet = c.challenger_wallet
LEFT JOIN user_stats us2 ON us2.wallet = c.challenged_wallet
WHERE c.status IN ('pending', 'accepted')
AND c.expires_at > NOW();

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert default preferences for social features
INSERT INTO user_social_preferences (wallet) VALUES ('system_default')
ON CONFLICT (wallet) DO NOTHING;

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE friendships IS 'Social Features: Player friendships and connections';
COMMENT ON TABLE game_challenges IS 'Social Features: Player-to-player game challenges with optional wagers';
COMMENT ON TABLE social_activities IS 'Social Features: Activity feed for social interactions';
COMMENT ON TABLE direct_messages IS 'Social Features: Direct messaging between players';
COMMENT ON TABLE user_social_preferences IS 'Social Features: User privacy and notification preferences';
