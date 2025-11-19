/**
 * Payment API Routes
 * Endpoints for payment dashboard
 */

import express, { Request, Response } from 'express';
import supabase from './db';
import PaymentService from './payment-service';

const router = express.Router();
const paymentService = new PaymentService();

/**
 * GET /api/payments/balance/:wallet
 * Get user balance
 */
router.get('/balance/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    const { data: balance, error } = await supabase
      .from('user_balances')
      .select('*')
      .eq('wallet', wallet)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    // Return default if no balance yet
    const userBalance = balance || {
      wallet,
      nag_balance: 0,
      usdc_balance: 0,
      sol_balance: 0,
      total_earned: 0,
      total_withdrawn: 0
    };

    res.json({
      success: true,
      balance: userBalance
    });

  } catch (error: any) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * GET /api/payments/transactions/:wallet
 * Get transaction history
 */
router.get('/transactions/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;
    const { limit = 50 } = req.query;

    const transactions = await paymentService.getTransactionHistory(
      wallet,
      Number(limit)
    );

    res.json({
      success: true,
      transactions
    });

  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * GET /api/payments/pending/:wallet
 * Get pending payouts
 */
router.get('/pending/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    const payouts = await paymentService.getPendingPayouts(wallet);

    res.json({
      success: true,
      payouts
    });

  } catch (error: any) {
    console.error('Error fetching pending payouts:', error);
    res.status(500).json({ error: 'Failed to fetch pending payouts' });
  }
});

/**
 * GET /api/payments/earnings/:wallet
 * Get earnings breakdown
 */
router.get('/earnings/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    // Get earnings by type
    const { data: earnings, error } = await supabase
      .from('transactions')
      .select('type, amount, currency')
      .eq('wallet', wallet)
      .eq('status', 'completed')
      .in('type', ['tournament_prize', 'referral_commission', 'achievement_reward']);

    if (error) throw error;

    // Calculate breakdown
    const breakdown = {
      tournament_prizes: 0,
      referral_commissions: 0,
      achievement_rewards: 0,
      total: 0
    };

    earnings?.forEach((e: any) => {
      const amount = parseFloat(e.amount);
      if (e.type === 'tournament_prize') breakdown.tournament_prizes += amount;
      if (e.type === 'referral_commission') breakdown.referral_commissions += amount;
      if (e.type === 'achievement_reward') breakdown.achievement_rewards += amount;
      breakdown.total += amount;
    });

    res.json({
      success: true,
      breakdown
    });

  } catch (error: any) {
    console.error('Error fetching earnings:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

/**
 * GET /api/payments/stats
 * Get platform payment statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // Total payouts
    const { data: payouts } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed')
      .in('type', ['tournament_prize', 'referral_commission', 'achievement_reward']);

    const totalPayouts = payouts?.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0) || 0;

    // Total revenue
    const { data: revenue } = await supabase
      .from('platform_revenue')
      .select('amount');

    const totalRevenue = revenue?.reduce((sum: number, r: any) => sum + parseFloat(r.amount), 0) || 0;

    // Pending payouts
    const { count: pendingCount } = await supabase
      .from('pending_payouts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');

    res.json({
      success: true,
      stats: {
        total_payouts: totalPayouts,
        total_revenue: totalRevenue,
        pending_count: pendingCount || 0
      }
    });

  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
