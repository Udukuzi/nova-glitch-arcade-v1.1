/**
 * Referral Program Routes
 * Handle referral code generation, tracking, and earnings
 */

import express, { Request, Response } from 'express';
import supabase from './db';
import crypto from 'crypto';

const router = express.Router();

/**
 * Generate a unique referral code
 */
function generateReferralCode(wallet: string): string {
  // Create a short, memorable code from wallet
  const hash = crypto.createHash('sha256').update(wallet).digest('hex');
  return hash.substring(0, 8).toUpperCase();
}

/**
 * GET /api/referral/leaderboard
 * Get top referrers (MUST BE BEFORE /:wallet ROUTE)
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { limit = 100 } = req.query;

    const { data, error } = await supabase
      .from('user_referral_codes')
      .select('*')
      .eq('is_active', true)
      .order('total_referrals', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    const leaderboard = data?.map((entry, index) => ({
      rank: index + 1,
      wallet: entry.wallet,
      displayName: `${entry.wallet.slice(0, 6)}...${entry.wallet.slice(-4)}`,
      totalReferrals: entry.total_referrals,
      totalEarnings: parseFloat(entry.total_earnings || 0),
      referralCode: entry.referral_code
    })) || [];

    res.json({
      success: true,
      leaderboard,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/referral/stats
 * Get global referral stats (MUST BE BEFORE /:wallet ROUTE)
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Total referrers
    const { count: totalReferrers } = await supabase
      .from('user_referral_codes')
      .select('*', { count: 'exact', head: true });

    // Total referrals
    const { count: totalReferrals } = await supabase
      .from('referrals')
      .select('*', { count: 'exact', head: true });

    // Total earnings
    const { data: earningsData } = await supabase
      .from('referral_earnings')
      .select('amount');

    const totalEarnings = earningsData?.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0) || 0;

    res.json({
      success: true,
      stats: {
        totalReferrers: totalReferrers || 0,
        totalReferrals: totalReferrals || 0,
        totalEarnings,
        averageReferralsPerUser: totalReferrers ? (totalReferrals || 0) / totalReferrers : 0
      }
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/referral/:wallet
 * Get or create referral code for user
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Check if code exists
    let { data: existing } = await supabase
      .from('user_referral_codes')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (existing) {
      return res.json({
        success: true,
        referralCode: existing.referral_code,
        stats: {
          totalReferrals: existing.total_referrals,
          totalEarnings: parseFloat(existing.total_earnings || 0),
          isActive: existing.is_active,
          createdAt: existing.created_at
        }
      });
    }

    // Create new referral code
    const referralCode = generateReferralCode(wallet);

    const { data: newCode, error } = await supabase
      .from('user_referral_codes')
      .insert([{
        wallet,
        referral_code: referralCode,
        total_referrals: 0,
        total_earnings: 0,
        is_active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating referral code:', error);
      return res.status(500).json({ error: 'Failed to create referral code' });
    }

    res.json({
      success: true,
      referralCode: newCode.referral_code,
      stats: {
        totalReferrals: 0,
        totalEarnings: 0,
        isActive: true,
        createdAt: newCode.created_at
      }
    });

  } catch (error) {
    console.error('Referral code error:', error);
    res.status(500).json({ error: 'Failed to get referral code' });
  }
});

/**
 * GET /api/referral/:wallet/referrals
 * Get list of users referred by this wallet
 */
router.get('/:wallet/referrals', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_wallet', wallet)
      .order('referred_at', { ascending: false })
      .limit(Number(limit))
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      console.error('Error fetching referrals:', error);
      return res.status(500).json({ error: 'Failed to fetch referrals' });
    }

    // Format referrals
    const formattedReferrals = data?.map(ref => ({
      wallet: ref.referred_wallet,
      displayName: `${ref.referred_wallet.slice(0, 6)}...${ref.referred_wallet.slice(-4)}`,
      referredAt: ref.referred_at,
      status: ref.status,
      gamesPlayed: ref.games_played,
      swapsCompleted: ref.swaps_completed,
      earnings: parseFloat(ref.total_earnings || 0),
      lastActive: ref.last_active
    })) || [];

    res.json({
      success: true,
      referrals: formattedReferrals,
      total: data?.length || 0
    });

  } catch (error) {
    console.error('Referrals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch referrals' });
  }
});

/**
 * POST /api/referral/register
 * Register a new referral (when someone signs up with a code)
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { referredWallet, referralCode } = req.body;

    if (!referredWallet || !referralCode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user was already referred
    const { data: existing } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_wallet', referredWallet)
      .single();

    if (existing) {
      return res.json({
        success: false,
        message: 'User already registered with a referral code'
      });
    }

    // Find referrer by code
    const { data: referrer } = await supabase
      .from('user_referral_codes')
      .select('*')
      .eq('referral_code', referralCode)
      .single();

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Can't refer yourself
    if (referrer.wallet === referredWallet) {
      return res.status(400).json({ error: 'Cannot use your own referral code' });
    }

    // Create referral record
    const { data: newReferral, error } = await supabase
      .from('referrals')
      .insert([{
        referrer_wallet: referrer.wallet,
        referred_wallet: referredWallet,
        referral_code: referralCode,
        status: 'active',
        total_earnings: 0,
        games_played: 0,
        swaps_completed: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating referral:', error);
      return res.status(500).json({ error: 'Failed to register referral' });
    }

    // Log activity
    await supabase.from('activities').insert([{
      wallet: referrer.wallet,
      type: 'referral',
      message: `referred a new user!`,
      metadata: { referred: referredWallet }
    }]);

    res.json({
      success: true,
      message: 'Referral registered successfully',
      referral: newReferral
    });

  } catch (error) {
    console.error('Referral registration error:', error);
    res.status(500).json({ error: 'Failed to register referral' });
  }
});

/**
 * POST /api/referral/earnings
 * Record earnings from a referral
 */
router.post('/earnings', async (req: Request, res: Response) => {
  try {
    const { referrerWallet, referredWallet, earningType, amount, transactionId, metadata } = req.body;

    if (!referrerWallet || !referredWallet || !earningType || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify referral exists
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_wallet', referrerWallet)
      .eq('referred_wallet', referredWallet)
      .single();

    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    // Record earning
    const { data: earning, error } = await supabase
      .from('referral_earnings')
      .insert([{
        referrer_wallet: referrerWallet,
        referred_wallet: referredWallet,
        earning_type: earningType,
        amount,
        transaction_id: transactionId || null,
        metadata: metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error recording earning:', error);
      return res.status(500).json({ error: 'Failed to record earning' });
    }

    res.json({
      success: true,
      earning
    });

  } catch (error) {
    console.error('Earnings recording error:', error);
    res.status(500).json({ error: 'Failed to record earning' });
  }
});

export default router;
