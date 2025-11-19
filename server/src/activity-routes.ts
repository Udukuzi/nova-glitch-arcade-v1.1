/**
 * Activity Feed & Player Tracking Routes
 * Handles real-time player count and activity notifications
 */

import express, { Request, Response } from 'express';
import { supabase } from './db';

const router = express.Router();

// In-memory tracking for online players (use Redis in production)
const onlinePlayers = new Map<string, number>(); // wallet -> last seen timestamp
const ONLINE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

// Activity types
type ActivityType = 'game' | 'swap' | 'achievement' | 'win';

interface Activity {
  id?: string;
  wallet: string;
  username?: string;
  type: ActivityType;
  message: string;
  metadata?: any;
  created_at?: string;
}

// ========================================
// PLAYER TRACKING
// ========================================

// Mark player as online (heartbeat)
router.post('/heartbeat', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.body;
    
    if (!wallet) {
      return res.status(400).json({ error: 'Wallet required' });
    }

    onlinePlayers.set(wallet, Date.now());
    
    res.json({ success: true, online: true });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ error: 'Failed to update heartbeat' });
  }
});

// Get online player count
router.get('/stats/online', (req: Request, res: Response) => {
  try {
    const now = Date.now();
    
    // Clean up stale entries
    for (const [wallet, lastSeen] of onlinePlayers.entries()) {
      if (now - lastSeen > ONLINE_TIMEOUT) {
        onlinePlayers.delete(wallet);
      }
    }

    const count = onlinePlayers.size;
    
    res.json({ 
      count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Online stats error:', error);
    res.status(500).json({ error: 'Failed to get online count' });
  }
});

// ========================================
// ACTIVITY FEED
// ========================================

// Create new activity
router.post('/activity', async (req: Request, res: Response) => {
  try {
    const { wallet, username, type, message, metadata } = req.body;

    if (!wallet || !type || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const activity: Activity = {
      wallet,
      username: username || null,
      type,
      message,
      metadata: metadata || null
    };

    const { data, error } = await supabase
      .from('activities')
      .insert([activity])
      .select()
      .single();

    if (error) throw error;

    // If this is a game activity, also save to game_sessions
    if (type === 'game' && metadata?.game && metadata?.score !== undefined) {
      try {
        await supabase.from('game_sessions').insert([{
          wallet,
          username: username || null,
          game_name: metadata.game,
          score: metadata.score,
          duration: metadata.duration || null,
          accuracy: metadata.accuracy || null,
          metadata: metadata,
          started_at: metadata.startedAt || new Date().toISOString(),
          completed_at: new Date().toISOString()
        }]);
        console.log(`✅ Game session saved: ${wallet} - ${metadata.game} - ${metadata.score}`);
      } catch (sessionError) {
        console.error('Failed to save game session:', sessionError);
        // Don't fail the activity creation if game session fails
      }
    }

    res.json({ success: true, activity: data });
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Failed to create activity' });
  }
});

// Get recent activities
router.get('/activity/recent', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ 
      activities: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
});

// Get activities by wallet
router.get('/activity/user/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('wallet', wallet)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    res.json({ 
      activities: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Get user activities error:', error);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// ========================================
// HELPER: Log activity (internal use)
// ========================================

export async function logActivity(
  wallet: string,
  type: ActivityType,
  message: string,
  metadata?: any,
  username?: string
) {
  try {
    await supabase.from('activities').insert([{
      wallet,
      username: username || null,
      type,
      message,
      metadata: metadata || null
    }]);
  } catch (error) {
    console.error('Log activity error:', error);
  }
}

export default router;
