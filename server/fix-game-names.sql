-- Fix game names in database (rename gameIds to display names)
-- Run this in Supabase SQL Editor

-- Update game_sessions table
UPDATE game_sessions 
SET game_name = 'Speed Clicker' 
WHERE game_name = 'coming2';

UPDATE game_sessions 
SET game_name = 'Whack-A-Mole' 
WHERE game_name = 'coming3';

UPDATE game_sessions 
SET game_name = 'Flappy Nova' 
WHERE game_name = 'flappy';

-- Check results
SELECT game_name, COUNT(*) as count, MAX(score) as high_score
FROM game_sessions 
GROUP BY game_name 
ORDER BY count DESC;
