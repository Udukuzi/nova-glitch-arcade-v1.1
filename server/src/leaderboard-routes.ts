/**
 * Leaderboard Routes
 * Real leaderboard data from database
 */

import express, { Request, Response } from 'express';
import supabase from './db';

const router = express.Router();

/**
 * GET /api/leaderboard/global
 * Get global leaderboard (top players across all games)
 */
router.get('/global', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;

    // Query user_stats table for top players
    const { data, error } = await supabase
      .from('user_stats')
      .select('wallet, highest_score, total_score, games_played, current_streak, last_active')
      .order('highest_score', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching global leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    // Format response with ranks
    const leaderboard = data.map((player, index) => ({
      rank: Number(offset) + index + 1,
      wallet: player.wallet,
      address: `${player.wallet.slice(0, 4)}...${player.wallet.slice(-4)}`, // Display format
      score: player.highest_score,
      totalScore: player.total_score,
      gamesPlayed: player.games_played,
      streak: player.current_streak,
      lastActive: player.last_active,
    }));

    res.json({
      success: true,
      leaderboard,
      total: leaderboard.length,
      offset: Number(offset),
      limit: Number(limit),
    });

  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard/game/:gameName
 * Get leaderboard for a specific game
 */
router.get('/game/:gameName', async (req: Request, res: Response) => {
  try {
    const { gameName } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    // Query game_sessions table for game-specific high scores
    const { data, error } = await supabase
      .from('game_sessions')
      .select('wallet, username, score, duration, accuracy, completed_at')
      .eq('game_name', gameName)
      .not('completed_at', 'is', null)
      .order('score', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error(`Error fetching ${gameName} leaderboard:`, error);
      return res.status(500).json({ error: 'Failed to fetch game leaderboard' });
    }

    // Group by wallet and take highest score per player
    const playerBestScores = new Map();
    data.forEach(session => {
      const existing = playerBestScores.get(session.wallet);
      if (!existing || session.score > existing.score) {
        playerBestScores.set(session.wallet, session);
      }
    });

    // Convert to array and sort
    const leaderboard = Array.from(playerBestScores.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, Number(limit))
      .map((player, index) => ({
        rank: Number(offset) + index + 1,
        wallet: player.wallet,
        username: player.username || `Player ${player.wallet.slice(0, 4)}`,
        address: `${player.wallet.slice(0, 4)}...${player.wallet.slice(-4)}`,
        score: player.score,
        duration: player.duration,
        accuracy: player.accuracy,
        completedAt: player.completed_at,
      }));

    res.json({
      success: true,
      game: gameName,
      leaderboard,
      total: leaderboard.length,
      offset: Number(offset),
      limit: Number(limit),
    });

  } catch (error) {
    console.error(`Game leaderboard error for ${req.params.gameName}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard/user/:wallet
 * Get a user's rank and stats
 */
router.get('/user/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Get user's stats
    const { data: userStats, error: userError } = await supabase
      .from('user_stats')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (userError) {
      return res.json({
        success: true,
        found: false,
        message: 'User not found in leaderboard',
      });
    }

    // Calculate user's global rank
    const { count, error: rankError } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true })
      .gt('highest_score', userStats.highest_score);

    if (rankError) {
      console.error('Error calculating rank:', rankError);
    }

    const rank = (count || 0) + 1;

    // Get user's game sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('game_name, score, completed_at')
      .eq('wallet', wallet)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      found: true,
      rank,
      stats: {
        wallet: userStats.wallet,
        gamesPlayed: userStats.games_played,
        highestScore: userStats.highest_score,
        totalScore: userStats.total_score,
        currentStreak: userStats.current_streak,
        longestStreak: userStats.longest_streak,
        lastActive: userStats.last_active,
      },
      recentGames: sessions || [],
    });

  } catch (error) {
    console.error('User stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/leaderboard/stats
 * Get overall platform statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Total players
    const { count: totalPlayers } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true });

    // Total games played
    const { count: totalGames } = await supabase
      .from('game_sessions')
      .select('*', { count: 'exact', head: true });

    // Highest score ever
    const { data: topScore } = await supabase
      .from('user_stats')
      .select('highest_score')
      .order('highest_score', { ascending: false })
      .limit(1)
      .single();

    // Active players (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: activePlayers } = await supabase
      .from('user_stats')
      .select('*', { count: 'exact', head: true })
      .gte('last_active', twentyFourHoursAgo);

    res.json({
      success: true,
      stats: {
        totalPlayers: totalPlayers || 0,
        totalGames: totalGames || 0,
        highestScore: topScore?.highest_score || 0,
        activePlayers24h: activePlayers || 0,
      },
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
