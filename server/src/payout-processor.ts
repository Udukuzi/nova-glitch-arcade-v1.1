/**
 * Payout Processor - Background Service
 * Automatically processes pending payouts from the queue
 */

import supabase from './db';
import SolanaPaymentService from './solana-payment-service';

export class PayoutProcessor {
  private solanaService: SolanaPaymentService;
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.solanaService = new SolanaPaymentService();
  }

  /**
   * Start the payout processor
   */
  start(intervalSeconds: number = 30): void {
    console.log(`🚀 Starting payout processor (every ${intervalSeconds}s)`);
    
    // Process immediately on start
    this.processQueue();

    // Then process on interval
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, intervalSeconds * 1000);
  }

  /**
   * Stop the payout processor
   */
  stop(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
      console.log('🛑 Payout processor stopped');
    }
  }

  /**
   * Process the payout queue
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('⏭️ Skipping - processor already running');
      return;
    }

    this.isProcessing = true;

    try {
      // Get pending payouts that are ready to process
      const { data: pendingPayouts, error } = await supabase
        .from('pending_payouts')
        .select('*')
        .eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .lt('attempts', 3) // Max 3 attempts
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true })
        .limit(10); // Process 10 at a time

      if (error) {
        console.error('Error fetching pending payouts:', error);
        return;
      }

      if (!pendingPayouts || pendingPayouts.length === 0) {
        return; // No payouts to process
      }

      console.log(`💰 Processing ${pendingPayouts.length} pending payouts...`);

      // Process each payout
      for (const payout of pendingPayouts) {
        await this.processSinglePayout(payout);
        
        // Small delay between payouts
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log(`✅ Batch complete`);

    } catch (error) {
      console.error('Error processing payout queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single payout
   */
  private async processSinglePayout(payout: any): Promise<void> {
    try {
      console.log(`💸 Processing payout: ${payout.amount} ${payout.currency} to ${payout.wallet}`);

      // Update status to processing
      await supabase
        .from('pending_payouts')
        .update({ 
          status: 'processing',
          attempts: payout.attempts + 1
        })
        .eq('id', payout.id);

      // Execute the Solana transaction
      const result = await this.solanaService.processPayout({
        recipient: payout.wallet,
        amount: payout.amount,
        currency: payout.currency,
        reference: payout.reference_id
      });

      if (result.success) {
        // Mark as completed
        await supabase
          .from('pending_payouts')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('id', payout.id);

        // Record in transactions table
        await supabase.from('transactions').insert([{
          wallet: payout.wallet,
          type: payout.reason,
          amount: payout.amount,
          currency: payout.currency,
          status: 'completed',
          transaction_hash: result.signature,
          metadata: {
            reference_id: payout.reference_id,
            payout_id: payout.id
          },
          created_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        }]);

        console.log(`✅ Payout completed: ${result.signature}`);

      } else {
        throw new Error('Payout failed');
      }

    } catch (error: any) {
      console.error(`❌ Payout failed for ${payout.wallet}:`, error.message);

      // Check if max attempts reached
      const newAttempts = payout.attempts + 1;
      const isFailed = newAttempts >= payout.max_attempts;

      await supabase
        .from('pending_payouts')
        .update({
          status: isFailed ? 'failed' : 'queued',
          error_message: error.message,
          attempts: newAttempts
        })
        .eq('id', payout.id);

      if (isFailed) {
        // Record failed transaction
        await supabase.from('transactions').insert([{
          wallet: payout.wallet,
          type: payout.reason,
          amount: payout.amount,
          currency: payout.currency,
          status: 'failed',
          metadata: {
            reference_id: payout.reference_id,
            payout_id: payout.id,
            error: error.message
          },
          created_at: new Date().toISOString()
        }]);
      }
    }
  }

  /**
   * Manually retry failed payouts
   */
  async retryFailedPayouts(): Promise<void> {
    console.log('🔄 Retrying failed payouts...');

    await supabase
      .from('pending_payouts')
      .update({
        status: 'queued',
        attempts: 0,
        error_message: null
      })
      .eq('status', 'failed');

    console.log('✅ Failed payouts queued for retry');
  }

  /**
   * Get payout queue status
   */
  async getQueueStatus(): Promise<{
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const statuses = ['queued', 'processing', 'completed', 'failed'];
    const counts: any = {};

    for (const status of statuses) {
      const { count } = await supabase
        .from('pending_payouts')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      
      counts[status] = count || 0;
    }

    return counts;
  }
}

export default PayoutProcessor;
