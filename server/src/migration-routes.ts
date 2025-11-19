/**
 * Migration Routes
 * One-time database fixes
 */

import express, { Request, Response } from 'express';
import supabase from './db';

const router = express.Router();

/**
 * POST /api/migrate/fix-game-names
 * Fix old game names (coming2 -> Speed Clicker, etc.)
 */
router.post('/fix-game-names', async (req: Request, res: Response) => {
  try {
    const updates = [
      { old: 'coming2', new: 'Speed Clicker' },
      { old: 'coming3', new: 'Whack-A-Mole' },
      { old: 'flappy', new: 'Flappy Nova' }
    ];

    const results = [];

    for (const update of updates) {
      // Update game_sessions
      const { data, error } = await supabase
        .from('game_sessions')
        .update({ game_name: update.new })
        .eq('game_name', update.old)
        .select();

      if (error) {
        console.error(`Error updating ${update.old}:`, error);
        results.push({ game: update.old, error: error.message, updated: 0 });
      } else {
        console.log(`✅ Updated ${data?.length || 0} records: ${update.old} -> ${update.new}`);
        results.push({ game: update.old, updated: data?.length || 0 });
      }
    }

    // Get updated game list
    const { data: games } = await supabase
      .from('game_sessions')
      .select('game_name')
      .not('completed_at', 'is', null);

    const gameCount: Record<string, number> = {};
    games?.forEach(g => {
      gameCount[g.game_name] = (gameCount[g.game_name] || 0) + 1;
    });

    res.json({
      success: true,
      message: 'Game names updated',
      updates: results,
      currentGames: gameCount
    });

  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed' });
  }
});

export default router;
