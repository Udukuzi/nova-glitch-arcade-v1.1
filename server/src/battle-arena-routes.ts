import { Router } from 'express';
import supabase from './db';

const router = Router();

// Middleware to check authentication (reuse from main index.ts)
function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers?.authorization;
  if (!auth) return res.status(401).json({ error: 'missing_auth' });
  const token = auth.split(' ')[1];
  try {
    const jwt = require('jsonwebtoken');
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).auth = decoded;
    return next();
  } catch (e: any) {
    return res.status(401).json({ error: 'invalid_token' });
  }
}

// Create a demo competition entry
router.post('/demo/enter', authMiddleware, async (req, res) => {
  const address = (req as any).auth?.address;
  const { mode, entryFee, prizePool } = req.body;

  if (!address || !mode || entryFee === undefined || prizePool === undefined) {
    return res.status(400).json({ error: 'missing_params' });
  }

  try {
    // Create competition
    const { data: competition, error: compError } = await supabase
      .from('competitions')
      .insert({
        mode,
        entry_fee_usdc: entryFee,
        prize_pool_nag: prizePool,
        status: 'waiting',
        is_demo: true,
      })
      .select()
      .single();

    if (compError) throw compError;

    // Add participant
    const { error: partError } = await supabase
      .from('competition_participants')
      .insert({
        competition_id: competition.id,
        address: address.toLowerCase(),
      });

    if (partError) throw partError;

    // Update demo stats
    await updateDemoStats(mode, entryFee);

    return res.json({
      success: true,
      competition_id: competition.id,
      message: 'Demo entry recorded successfully',
    });
  } catch (e: any) {
    console.error('Demo entry error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Get demo statistics
router.get('/demo/stats', async (_req, res) => {
  try {
    const { data: stats, error } = await supabase
      .from('demo_stats')
      .select('metric_name, metric_value');

    if (error) throw error;

    // Format stats into object
    const statsObj: any = {};
    (stats || []).forEach((stat: any) => {
      statsObj[stat.metric_name] = parseFloat(stat.metric_value);
    });

    return res.json({ stats: statsObj });
  } catch (e: any) {
    console.error('Stats fetch error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Add to waitlist
router.post('/waitlist', async (req, res) => {
  const { email, walletAddress } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'email_required' });
  }

  try {
    const { error } = await supabase
      .from('battle_arena_waitlist')
      .insert({
        email: email.toLowerCase(),
        wallet_address: walletAddress?.toLowerCase(),
      });

    if (error) {
      // Duplicate email
      if (error.code === '23505') {
        return res.json({ success: true, message: 'Already on waitlist' });
      }
      throw error;
    }

    return res.json({ success: true, message: 'Added to waitlist successfully' });
  } catch (e: any) {
    console.error('Waitlist error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Get user's demo history
router.get('/demo/history', authMiddleware, async (req, res) => {
  const address = (req as any).auth?.address;

  try {
    const { data, error } = await supabase
      .from('competition_participants')
      .select(`
        id,
        score,
        placement,
        joined_at,
        competitions (
          mode,
          entry_fee_usdc,
          prize_pool_nag,
          status,
          is_demo
        )
      `)
      .eq('address', address.toLowerCase())
      .order('joined_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return res.json({ history: data || [] });
  } catch (e: any) {
    console.error('History fetch error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Admin endpoint: Get all waitlist entries (protected)
router.get('/admin/waitlist', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  
  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'unauthorized' });
  }

  try {
    const { data, error } = await supabase
      .from('battle_arena_waitlist')
      .select('*')
      .order('subscribed_at', { ascending: false });

    if (error) throw error;

    return res.json({ waitlist: data || [], count: data?.length || 0 });
  } catch (e: any) {
    console.error('Admin waitlist error:', e);
    return res.status(500).json({ error: String(e) });
  }
});

// Helper function to update demo statistics
async function updateDemoStats(mode: string, entryFee: number) {
  try {
    // Increment total entries
    await supabase.rpc('increment_metric', {
      metric: 'total_demo_entries',
      amount: 1,
    });

    // Increment volume
    await supabase.rpc('increment_metric', {
      metric: 'total_simulated_volume_usdc',
      amount: entryFee,
    });

    // Increment mode-specific counter
    await supabase.rpc('increment_metric', {
      metric: `most_popular_mode_${mode}`,
      amount: 1,
    });
  } catch (e) {
    console.error('Stats update error:', e);
    // Non-critical, don't throw
  }
}

export default router;
