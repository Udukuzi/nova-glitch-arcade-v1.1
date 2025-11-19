/**
 * Payment Service - Prize Distribution & Fee Management
 * Handles automatic prize pool calculation and payouts
 */

import supabase from './db';
import X402BettingAgent from './x402-agent';
import SolanaPaymentService from './solana-payment-service';

// Platform configuration
const PLATFORM_CONFIG = {
  PLATFORM_FEE_PERCENT: 5, // 5% platform fee (lowest in industry!)
  MIN_PAYOUT_THRESHOLD: 10, // Minimum 10 NAG to trigger payout
  PAYOUT_DELAY_SECONDS: 30, // Delay before auto-payout (for dispute window)
};

// Prize distribution templates
const PRIZE_DISTRIBUTIONS = {
  // Small tournaments (3 winners)
  small: {
    minParticipants: 1,
    maxParticipants: 20,
    distribution: {
      '1st': 50,
      '2nd': 30,
      '3rd': 20
    }
  },
  // Medium tournaments (5 winners)
  medium: {
    minParticipants: 21,
    maxParticipants: 50,
    distribution: {
      '1st': 40,
      '2nd': 25,
      '3rd': 15,
      '4th': 10,
      '5th': 10
    }
  },
  // Large tournaments (10 winners)
  large: {
    minParticipants: 51,
    maxParticipants: 100,
    distribution: {
      '1st': 35,
      '2nd': 20,
      '3rd': 12,
      '4th': 8,
      '5th': 5,
      '6th': 4,
      '7th': 4,
      '8th': 4,
      '9th': 4,
      '10th': 4
    }
  },
  // Mega tournaments (50 winners)
  mega: {
    minParticipants: 101,
    maxParticipants: 10000,
    distribution: {
      '1st': 30,
      '2nd': 15,
      '3rd': 10,
      '4th': 7,
      '5th': 5,
      '6th-10th': 3, // 3% each = 15%
      '11th-20th': 1, // 1% each = 10%
      '21st-50th': 0.5 // 0.5% each = 15%
    }
  }
};

export class PaymentService {
  private x402Agent: X402BettingAgent;
  private solanaService: SolanaPaymentService;

  constructor() {
    this.x402Agent = new X402BettingAgent();
    this.solanaService = new SolanaPaymentService();
  }

  /**
   * Calculate prize pool from entry fees
   */
  calculatePrizePool(entryFee: number, participants: number): {
    totalCollected: number;
    platformFee: number;
    prizePool: number;
    prizeDistribution: Record<string, number>;
  } {
    const totalCollected = entryFee * participants;
    const platformFee = totalCollected * (PLATFORM_CONFIG.PLATFORM_FEE_PERCENT / 100);
    const prizePool = totalCollected - platformFee;

    // Select distribution template based on participant count
    let distributionTemplate = PRIZE_DISTRIBUTIONS.small;
    if (participants > 100) distributionTemplate = PRIZE_DISTRIBUTIONS.mega;
    else if (participants > 50) distributionTemplate = PRIZE_DISTRIBUTIONS.large;
    else if (participants > 20) distributionTemplate = PRIZE_DISTRIBUTIONS.medium;

    // Calculate actual prize amounts
    const prizeDistribution: Record<string, number> = {};
    for (const [place, percentage] of Object.entries(distributionTemplate.distribution)) {
      prizeDistribution[place] = (prizePool * (percentage as number)) / 100;
    }

    return {
      totalCollected,
      platformFee,
      prizePool,
      prizeDistribution
    };
  }

  /**
   * Update tournament prize pool when participants join
   */
  async updateTournamentPrizePool(tournamentId: string): Promise<void> {
    try {
      // Get tournament details
      const { data: tournament, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (error || !tournament) {
        throw new Error('Tournament not found');
      }

      // Calculate new prize pool
      const calculation = this.calculatePrizePool(
        parseFloat(tournament.entry_fee || 0),
        tournament.current_participants || 0
      );

      // Update tournament
      await supabase
        .from('tournaments')
        .update({
          prize_pool: calculation.prizePool,
          prize_distribution: calculation.prizeDistribution
        })
        .eq('id', tournamentId);

      console.log(`✅ Prize pool updated for tournament ${tournamentId}:`, {
        participants: tournament.current_participants,
        collected: calculation.totalCollected,
        platformFee: calculation.platformFee,
        prizePool: calculation.prizePool
      });

    } catch (error) {
      console.error('Error updating prize pool:', error);
      throw error;
    }
  }

  /**
   * Distribute prizes when tournament ends
   */
  async distributeTournamentPrizes(tournamentId: string): Promise<void> {
    try {
      console.log(`🏆 Starting prize distribution for tournament: ${tournamentId}`);

      // Get tournament details
      const { data: tournament, error: tournamentError } = await supabase
        .from('tournaments')
        .select('*')
        .eq('id', tournamentId)
        .single();

      if (tournamentError || !tournament) {
        throw new Error('Tournament not found');
      }

      if (tournament.status !== 'completed') {
        throw new Error('Tournament is not completed yet');
      }

      // Get final leaderboard
      const { data: participants, error: participantsError } = await supabase
        .from('tournament_participants')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('final_score', { ascending: false });

      if (participantsError || !participants || participants.length === 0) {
        throw new Error('No participants found');
      }

      // Assign ranks
      const rankedParticipants = participants.map((p, index) => ({
        ...p,
        rank: index + 1
      }));

      // Calculate prizes based on distribution
      const prizeDistribution = tournament.prize_distribution as Record<string, number>;
      const payouts: Array<{
        wallet: string;
        rank: number;
        amount: number;
      }> = [];

      for (const participant of rankedParticipants) {
        const placeKey = this.getRankKey(participant.rank, rankedParticipants.length);
        const prizeAmount = prizeDistribution[placeKey];

        if (prizeAmount && prizeAmount >= PLATFORM_CONFIG.MIN_PAYOUT_THRESHOLD) {
          payouts.push({
            wallet: participant.wallet,
            rank: participant.rank,
            amount: prizeAmount
          });

          // Update participant record
          await supabase
            .from('tournament_participants')
            .update({
              final_rank: participant.rank,
              prize_won: prizeAmount,
              status: 'winner'
            })
            .eq('id', participant.id);
        }
      }

      console.log(`💰 Processing ${payouts.length} payouts...`);

      // Process payouts via x402
      for (const payout of payouts) {
        try {
          const payoutResult = await this.processX402Payout({
            recipient: payout.wallet,
            amount: payout.amount,
            currency: 'NAG',
            reason: 'tournament_prize',
            metadata: {
              tournamentId,
              tournamentName: tournament.name,
              rank: payout.rank,
              participants: rankedParticipants.length
            }
          });

          // Record transaction with blockchain signature
          await this.recordTransaction({
            wallet: payout.wallet,
            type: 'tournament_prize',
            amount: payout.amount,
            currency: 'NAG',
            status: payoutResult.success ? 'completed' : 'failed',
            transactionHash: payoutResult.signature,
            metadata: {
              tournamentId,
              rank: payout.rank
            }
          });

        } catch (error: any) {
          console.error(`Failed to payout to ${payout.wallet}:`, error);
          
          // Record failed transaction
          await this.recordTransaction({
            wallet: payout.wallet,
            type: 'tournament_prize',
            amount: payout.amount,
            currency: 'NAG',
            status: 'failed',
            metadata: {
              tournamentId,
              rank: payout.rank,
              error: error.message
            }
          });
          
          continue; // Continue with other payouts
        }

        // Create activity
        await supabase.from('activities').insert([{
          wallet: payout.wallet,
          type: 'prize',
          message: `won ${payout.amount.toLocaleString()} NAG (Rank #${payout.rank}) in ${tournament.name}`,
          metadata: {
            tournamentId,
            rank: payout.rank,
            amount: payout.amount
          }
        }]);
      }

      console.log(`✅ All prizes distributed for tournament ${tournamentId}`);

    } catch (error) {
      console.error('Error distributing prizes:', error);
      throw error;
    }
  }

  /**
   * Get rank key for prize distribution
   */
  private getRankKey(rank: number, totalParticipants: number): string {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    if (rank === 4) return '4th';
    if (rank === 5) return '5th';
    if (rank >= 6 && rank <= 10) return '6th-10th';
    if (rank >= 11 && rank <= 20) return '11th-20th';
    if (rank >= 21 && rank <= 50) return '21st-50th';
    return 'unplaced';
  }

  /**
   * Process x402 payout
   */
  async processX402Payout(params: {
    recipient: string;
    amount: number;
    currency: 'NAG' | 'USDC' | 'USDT';
    reason: string;
    metadata: any;
  }): Promise<{ signature: string; success: boolean }> {
    try {
      console.log(`💸 Processing payout: ${params.amount} ${params.currency} to ${params.recipient}`);

      // Create payment request via x402
      const paymentRequest = await this.x402Agent.processX402Payment({
        from: process.env.PLATFORM_WALLET || 'PLATFORM_WALLET',
        to: params.recipient,
        amount: params.amount,
        currency: params.currency,
        matchId: `${params.reason}_${Date.now()}`
      });

      // Execute the actual Solana transaction
      const result = await this.solanaService.processPayout({
        recipient: params.recipient,
        amount: params.amount,
        currency: params.currency,
        reference: params.metadata.tournamentId || params.metadata.referralId || params.reason
      });

      console.log(`✅ Payout completed: ${result.signature}`);
      return result;

    } catch (error) {
      console.error('Error processing payout:', error);
      throw error;
    }
  }

  /**
   * Record transaction in database
   */
  async recordTransaction(params: {
    wallet: string;
    type: string;
    amount: number;
    currency: string;
    status: string;
    transactionHash?: string;
    metadata: any;
  }): Promise<void> {
    try {
      await supabase.from('transactions').insert([{
        wallet: params.wallet,
        type: params.type,
        amount: params.amount,
        currency: params.currency,
        status: params.status,
        transaction_hash: params.transactionHash || null,
        metadata: params.metadata,
        created_at: new Date().toISOString(),
        completed_at: params.status === 'completed' ? new Date().toISOString() : null
      }]);
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  /**
   * Get pending payouts for a user
   */
  async getPendingPayouts(wallet: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet', wallet)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    return data || [];
  }

  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(wallet: string, limit: number = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('wallet', wallet)
      .order('created_at', { ascending: false })
      .limit(limit);

    return data || [];
  }
}

export default PaymentService;
