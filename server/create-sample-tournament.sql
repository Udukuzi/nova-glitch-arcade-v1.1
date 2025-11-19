-- Create Sample Tournament for Testing
-- Run this in Supabase SQL Editor

-- Create a live tournament for Snake Classic
INSERT INTO tournaments (
  name,
  game_name,
  description,
  entry_fee,
  prize_pool,
  prize_distribution,
  start_time,
  end_time,
  status,
  max_participants,
  created_by
) VALUES (
  '🐍 Snake Classic Championship',
  'Snake Classic',
  'Weekly Snake tournament - Highest score wins! Free to enter.',
  0,
  10000,
  '{"1st": 50, "2nd": 30, "3rd": 20}'::jsonb,
  NOW() - INTERVAL '1 hour',  -- Started 1 hour ago
  NOW() + INTERVAL '23 hours', -- Ends in 23 hours
  'active',
  100,
  'system'
);

-- Create an upcoming tournament for PacCoin
INSERT INTO tournaments (
  name,
  game_name,
  description,
  entry_fee,
  prize_pool,
  prize_distribution,
  start_time,
  end_time,
  status,
  max_participants,
  created_by
) VALUES (
  '💰 PacCoin Daily Rush',
  'PacCoin',
  'Daily PacCoin competition - Entry fee: 100 NAG. Winner takes 50%!',
  100,
  5000,
  '{"1st": 50, "2nd": 30, "3rd": 20}'::jsonb,
  NOW() + INTERVAL '2 hours',  -- Starts in 2 hours
  NOW() + INTERVAL '26 hours', -- Ends in 26 hours
  'upcoming',
  50,
  'system'
);

-- Create a mega tournament for all games
INSERT INTO tournaments (
  name,
  game_name,
  description,
  entry_fee,
  prize_pool,
  prize_distribution,
  start_time,
  end_time,
  status,
  max_participants,
  created_by
) VALUES (
  '🏆 Weekend Mega Tournament',
  'Speed Clicker',
  'Massive prize pool! Click faster than everyone else. Entry fee: 500 NAG.',
  500,
  50000,
  '{"1st": 40, "2nd": 25, "3rd": 15, "4th": 10, "5th": 10}'::jsonb,
  NOW() + INTERVAL '1 day',    -- Starts tomorrow
  NOW() + INTERVAL '3 days',   -- Lasts 2 days
  'upcoming',
  200,
  'system'
);

-- Success message
SELECT 'Sample tournaments created successfully!' as message,
       'Visit the Tournaments section to see them!' as next_step;
