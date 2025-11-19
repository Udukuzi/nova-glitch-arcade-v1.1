/**
 * Tournament System Routes
 * Handle tournament creation, registration, scoring, and leaderboards
 */

import express, { Request, Response } from 'express';
import supabase from './db';
import PaymentService from './payment-service';

const router = express.Router();
const paymentService = new PaymentService();

/**
 * GET /api/tournaments
 * Get all tournaments with optional filters
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, game, limit = 50 } = req.query;

    let query = supabase
      .from('tournaments')
      .select('*')
      .order('start_time', { ascending: true })
      .limit(Number(limit));

    if (status) {
      query = query.eq('status', status);
    }

    if (game) {
      query = query.eq('game_name', game);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tournaments:', error);
      return res.status(500).json({ error: 'Failed to fetch tournaments' });
    }

    res.json({
      success: true,
      tournaments: data || []
    });

  } catch (error) {
    console.error('Tournaments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

/**
 * GET /api/tournaments/:id
 * Get tournament details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // Get participants
    const { data: participants } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .order('final_score', { ascending: false });

    res.json({
      success: true,
      tournament: {
        ...tournament,
        participants: participants || []
      }
    });

  } catch (error) {
    console.error('Tournament fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tournament' });
  }
});

/**
 * POST /api/tournaments
 * Create a new tournament
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      gameName,
      description,
      entryFee,
      prizePool,
      prizeDistribution,
      startTime,
      endTime,
      maxParticipants,
      rules,
      createdBy
    } = req.body;

    if (!name || !gameName || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: tournament, error } = await supabase
      .from('tournaments')
      .insert([{
        name,
        game_name: gameName,
        description,
        entry_fee: entryFee || 0,
        prize_pool: prizePool || 0,
        prize_distribution: prizeDistribution || { "1st": 50, "2nd": 30, "3rd": 20 },
        start_time: startTime,
        end_time: endTime,
        max_participants: maxParticipants,
        rules,
        created_by: createdBy,
        status: 'upcoming'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating tournament:', error);
      return res.status(500).json({ error: 'Failed to create tournament' });
    }

    res.json({
      success: true,
      tournament
    });

  } catch (error) {
    console.error('Tournament creation error:', error);
    res.status(500).json({ error: 'Failed to create tournament' });
  }
});

/**
 * POST /api/tournaments/:id/join
 * Join a tournament
 */
router.post('/:id/join', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { wallet, username } = req.body;

    if (!wallet) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Check if tournament exists and is joinable
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (tournamentError || !tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament is not open for registration' });
    }

    if (tournament.max_participants && tournament.current_participants >= tournament.max_participants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .eq('wallet', wallet)
      .single();

    if (existing) {
      return res.json({
        success: true,
        message: 'Already registered',
        participant: existing
      });
    }

    // Register participant
    const { data: participant, error: participantError } = await supabase
      .from('tournament_participants')
      .insert([{
        tournament_id: id,
        wallet,
        username: username || `${wallet.slice(0, 6)}...${wallet.slice(-4)}`,
        entry_paid: tournament.entry_fee === 0, // Free tournaments auto-paid
        status: 'registered'
      }])
      .select()
      .single();

    if (participantError) {
      console.error('Error joining tournament:', participantError);
      return res.status(500).json({ error: 'Failed to join tournament' });
    }

    // Log activity
    await supabase.from('activities').insert([{
      wallet,
      type: 'tournament',
      message: `joined tournament: ${tournament.name}`,
      metadata: { tournament_id: id, tournament_name: tournament.name }
    }]);

    // Auto-update prize pool based on new participant count
    try {
      await paymentService.updateTournamentPrizePool(id);
      console.log(`✅ Prize pool updated for tournament ${id}`);
    } catch (error) {
      console.error('Error updating prize pool:', error);
    }

    res.json({
      success: true,
      message: 'Successfully joined tournament',
      participant
    });

  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({ error: 'Failed to join tournament' });
  }
});

/**
 * POST /api/tournaments/:id/submit-score
 * Submit a score to a tournament
 */
router.post('/:id/submit-score', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { wallet, score, duration, accuracy, metadata } = req.body;

    if (!wallet || score === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify tournament is active
    const { data: tournament } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', id)
      .single();

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'active') {
      return res.status(400).json({ error: 'Tournament is not active' });
    }

    // Verify participant is registered
    const { data: participant } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .eq('wallet', wallet)
      .single();

    if (!participant) {
      return res.status(403).json({ error: 'Not registered for this tournament' });
    }

    // Submit score
    const { data: scoreRecord, error } = await supabase
      .from('tournament_scores')
      .insert([{
        tournament_id: id,
        participant_id: participant.id,
        wallet,
        game_name: tournament.game_name,
        score,
        duration,
        accuracy,
        metadata
      }])
      .select()
      .single();

    if (error) {
      console.error('Error submitting score:', error);
      return res.status(500).json({ error: 'Failed to submit score' });
    }

    // Update participant's best score if this is higher
    if (score > participant.final_score) {
      await supabase
        .from('tournament_participants')
        .update({ final_score: score })
        .eq('id', participant.id);
    }

    res.json({
      success: true,
      score: scoreRecord
    });

  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

/**
 * GET /api/tournaments/:id/leaderboard
 * Get tournament leaderboard
 */
router.get('/:id/leaderboard', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const { data, error } = await supabase
      .from('tournament_participants')
      .select('*')
      .eq('tournament_id', id)
      .order('final_score', { ascending: false })
      .limit(Number(limit));

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }

    // Add ranks
    const leaderboard = data?.map((entry, index) => ({
      rank: index + 1,
      wallet: entry.wallet,
      username: entry.username,
      score: entry.final_score,
      prizeWon: entry.prize_won,
      status: entry.status
    })) || [];

    res.json({
      success: true,
      leaderboard
    });

  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /api/tournaments/user/:wallet
 * Get user's tournament history
 */
router.get('/user/:wallet', async (req: Request, res: Response) => {
  try {
    const { wallet } = req.params;

    const { data: participations, error } = await supabase
      .from('tournament_participants')
      .select(`
        *,
        tournaments:tournament_id (*)
      `)
      .eq('wallet', wallet)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching user tournaments:', error);
      return res.status(500).json({ error: 'Failed to fetch tournaments' });
    }

    res.json({
      success: true,
      tournaments: participations || []
    });

  } catch (error) {
    console.error('User tournaments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch tournaments' });
  }
});

/**
 * POST /api/tournaments/:id/distribute-prizes
 * Manually trigger prize distribution (also happens automatically via database trigger)
 */
router.post('/:id/distribute-prizes', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    console.log(`🏆 Manual prize distribution requested for tournament: ${id}`);

    await paymentService.distributeTournamentPrizes(id);

    res.json({
      success: true,
      message: 'Prize distribution completed'
    });

  } catch (error: any) {
    console.error('Prize distribution error:', error);
    res.status(500).json({ 
      error: 'Failed to distribute prizes',
      details: error.message
    });
  }
});

export default router;
