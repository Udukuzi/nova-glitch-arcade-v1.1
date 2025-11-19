/**
 * AI Monitoring API Routes
 * Admin endpoints for viewing and managing anti-cheat system
 */

import express, { Request, Response } from 'express';
import AIMonitoringService from './ai-monitoring-service';
import supabase from './db';

const router = express.Router();
const aiService = new AIMonitoringService();

/**
 * GET /api/ai/suspicious-activities
 * Get list of suspicious activities for admin review
 */
router.get('/suspicious-activities', async (req: Request, res: Response) => {
  try {
    const { status = 'pending', limit = 50 } = req.query;
    
    const activities = await aiService.getSuspiciousActivities(
      parseInt(limit as string),
      status as string
    );

    res.json({
      success: true,
      activities,
      count: activities.length
    });
  } catch (error: any) {
    console.error('Error fetching suspicious activities:', error);
    res.status(500).json({
      error: 'Failed to fetch suspicious activities',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/review-activity
 * Review a suspicious activity (admin only)
 */
router.post('/review-activity', async (req: Request, res: Response) => {
  try {
    const { activityId, reviewedBy, status, reviewNotes, actionTaken } = req.body;

    if (!activityId || !reviewedBy || !status) {
      return res.status(400).json({
        error: 'Missing required fields: activityId, reviewedBy, status'
      });
    }

    await aiService.reviewSuspiciousActivity(
      activityId,
      reviewedBy,
      status,
      reviewNotes || '',
      actionTaken || 'none'
    );

    // If action is to ban, execute the ban
    if (actionTaken === 'temp_ban' || actionTaken === 'permanent_ban') {
      // Get the activity to find the wallet
      const { data: activity } = await supabase
        .from('suspicious_activities')
        .select('wallet')
        .eq('id', activityId)
        .single();

      if (activity) {
        await aiService.banPlayer({
          wallet: activity.wallet,
          banType: actionTaken === 'permanent_ban' ? 'permanent' : 'temporary',
          reason: reviewNotes || 'Confirmed cheating',
          evidence: [activityId],
          bannedBy: reviewedBy,
          bannedUntil: actionTaken === 'temp_ban' 
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            : undefined
        });
      }
    }

    res.json({
      success: true,
      message: 'Activity reviewed successfully'
    });
  } catch (error: any) {
    console.error('Error reviewing activity:', error);
    res.status(500).json({
      error: 'Failed to review activity',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/banned-players
 * Get list of banned players
 */
router.get('/banned-players', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ban_list')
      .select('*')
      .eq('is_active', true)
      .order('banned_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      bannedPlayers: data,
      count: data.length
    });
  } catch (error: any) {
    console.error('Error fetching banned players:', error);
    res.status(500).json({
      error: 'Failed to fetch banned players',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/ban-player
 * Manually ban a player (admin only)
 */
router.post('/ban-player', async (req: Request, res: Response) => {
  try {
    const { wallet, banType, reason, evidence, bannedBy, bannedUntil } = req.body;

    if (!wallet || !banType || !reason || !bannedBy) {
      return res.status(400).json({
        error: 'Missing required fields: wallet, banType, reason, bannedBy'
      });
    }

    await aiService.banPlayer({
      wallet,
      banType,
      reason,
      evidence: evidence || [],
      bannedBy,
      bannedUntil
    });

    res.json({
      success: true,
      message: `Player ${wallet} banned successfully`
    });
  } catch (error: any) {
    console.error('Error banning player:', error);
    res.status(500).json({
      error: 'Failed to ban player',
      details: error.message
    });
  }
});

/**
 * POST /api/ai/unban-player
 * Unban a player (admin only)
 */
router.post('/unban-player', async (req: Request, res: Response) => {
  try {
    const { wallet, unbanReason, unbannedBy } = req.body;

    if (!wallet || !unbannedBy) {
      return res.status(400).json({
        error: 'Missing required fields: wallet, unbannedBy'
      });
    }

    await aiService.unbanPlayer(wallet, unbanReason || 'Admin unban', unbannedBy);

    res.json({
      success: true,
      message: `Player ${wallet} unbanned successfully`
    });
  } catch (error: any) {
    console.error('Error unbanning player:', error);
    res.status(500).json({
      error: 'Failed to unban player',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/player-stats/:wallet
 * Get player statistics and history
 */
router.get('/player-stats/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Get player stats
    const { data: stats, error: statsError } = await supabase
      .from('player_statistics')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      throw statsError;
    }

    // Get recent game sessions
    const { data: recentGames, error: gamesError } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('wallet', wallet)
      .order('created_at', { ascending: false })
      .limit(20);

    if (gamesError) throw gamesError;

    // Get suspicious activities
    const { data: suspiciousActivities, error: activitiesError } = await supabase
      .from('suspicious_activities')
      .select('*')
      .eq('wallet', wallet)
      .order('created_at', { ascending: false })
      .limit(10);

    if (activitiesError) throw activitiesError;

    // Check if banned
    const isBanned = await aiService.isPlayerBanned(wallet);

    res.json({
      success: true,
      stats: stats || null,
      recentGames: recentGames || [],
      suspiciousActivities: suspiciousActivities || [],
      isBanned
    });
  } catch (error: any) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({
      error: 'Failed to fetch player stats',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/detection-rules
 * Get all AI detection rules
 */
router.get('/detection-rules', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('ai_detection_rules')
      .select('*')
      .order('severity', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      rules: data
    });
  } catch (error: any) {
    console.error('Error fetching detection rules:', error);
    res.status(500).json({
      error: 'Failed to fetch detection rules',
      details: error.message
    });
  }
});

/**
 * PUT /api/ai/detection-rules/:id
 * Update a detection rule (admin only)
 */
router.put('/detection-rules/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { is_active, thresholds, severity, auto_flag, auto_ban, requires_manual_review } = req.body;

    const updates: any = {
      updated_at: new Date().toISOString()
    };

    if (is_active !== undefined) updates.is_active = is_active;
    if (thresholds !== undefined) updates.thresholds = thresholds;
    if (severity !== undefined) updates.severity = severity;
    if (auto_flag !== undefined) updates.auto_flag = auto_flag;
    if (auto_ban !== undefined) updates.auto_ban = auto_ban;
    if (requires_manual_review !== undefined) updates.requires_manual_review = requires_manual_review;

    const { data, error } = await supabase
      .from('ai_detection_rules')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      rule: data
    });
  } catch (error: any) {
    console.error('Error updating detection rule:', error);
    res.status(500).json({
      error: 'Failed to update detection rule',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/dashboard-stats
 * Get overall statistics for admin dashboard
 */
router.get('/dashboard-stats', async (req: Request, res: Response) => {
  try {
    // Total games today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayGames } = await supabase
      .from('game_sessions')
      .select('id', { count: 'exact' })
      .gte('created_at', todayStart.toISOString());

    // Suspicious games today
    const { data: suspiciousToday } = await supabase
      .from('game_sessions')
      .select('id', { count: 'exact' })
      .eq('is_suspicious', true)
      .gte('created_at', todayStart.toISOString());

    // Active bans
    const { data: activeBans } = await supabase
      .from('ban_list')
      .select('id', { count: 'exact' })
      .eq('is_active', true);

    // Pending reviews
    const { data: pendingReviews } = await supabase
      .from('suspicious_activities')
      .select('id', { count: 'exact' })
      .eq('status', 'pending');

    // Top suspicious players (highest suspicion rate)
    const { data: topSuspicious } = await supabase
      .from('player_statistics')
      .select('wallet, suspicion_rate, total_games_played, total_suspicious_games')
      .gt('suspicion_rate', 20)
      .order('suspicion_rate', { ascending: false })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalGamesToday: todayGames?.length || 0,
        suspiciousGamesToday: suspiciousToday?.length || 0,
        activeBans: activeBans?.length || 0,
        pendingReviews: pendingReviews?.length || 0,
        topSuspiciousPlayers: topSuspicious || []
      }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      details: error.message
    });
  }
});

/**
 * GET /api/ai/check-ban/:wallet
 * Check if a player is banned (public endpoint for game clients)
 */
router.get('/check-ban/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const isBanned = await aiService.isPlayerBanned(wallet);

    res.json({
      success: true,
      isBanned,
      wallet
    });
  } catch (error: any) {
    console.error('Error checking ban status:', error);
    res.status(500).json({
      error: 'Failed to check ban status',
      details: error.message
    });
  }
});

export default router;
