-- Create Test Paid Tournament to Test Prize Pool System
-- Run this in Supabase SQL Editor

-- Create a paid tournament with entry fee
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
  current_participants,
  created_by
) VALUES (
  '💰 Test Prize Pool Tournament',
  'Snake Classic',
  'TEST: Entry fee 100 NAG - Prize pool grows automatically!',
  100, -- 100 NAG entry fee
  0,   -- Start at 0, will auto-calculate
  '{"1st": 50, "2nd": 30, "3rd": 20}'::jsonb,
  NOW() - INTERVAL '30 minutes',  -- Already started
  NOW() + INTERVAL '23.5 hours',  -- Ends in ~24 hours
  'active',
  50,
  0, -- No participants yet
  'system'
) RETURNING id, name, entry_fee, prize_pool, current_participants;

-- Success message
SELECT 
  'Test tournament created!' as message,
  'Now join via API to see prize pool grow!' as next_step;
