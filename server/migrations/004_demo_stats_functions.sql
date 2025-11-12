-- Helper function to increment demo statistics atomically
CREATE OR REPLACE FUNCTION increment_metric(metric TEXT, amount NUMERIC)
RETURNS void AS $$
BEGIN
  INSERT INTO demo_stats (metric_name, metric_value)
  VALUES (metric, amount)
  ON CONFLICT (metric_name) 
  DO UPDATE SET 
    metric_value = demo_stats.metric_value + amount,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint for metric names
ALTER TABLE demo_stats ADD CONSTRAINT unique_metric_name UNIQUE (metric_name);

-- Function to get leaderboard for a competition
CREATE OR REPLACE FUNCTION get_competition_leaderboard(comp_id UUID)
RETURNS TABLE (
  address VARCHAR,
  score INTEGER,
  placement INTEGER,
  payout_amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.address,
    cp.score,
    cp.placement,
    cp.payout_amount
  FROM competition_participants cp
  WHERE cp.competition_id = comp_id
  AND cp.score IS NOT NULL
  ORDER BY cp.score DESC, cp.joined_at ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION increment_metric IS 'Atomically increment a demo statistic metric';
COMMENT ON FUNCTION get_competition_leaderboard IS 'Get ranked participants for a competition';
