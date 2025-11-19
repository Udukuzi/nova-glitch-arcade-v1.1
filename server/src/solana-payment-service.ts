/**
 * Solana Payment Service - Real Blockchain Transactions
 * Handles actual SPL token transfers (NAG, USDC, USDT)
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
  TOKEN_PROGRAM_ID 
} from '@solana/spl-token';
import bs58 from 'bs58';

// Token Mint Addresses (Mainnet)
const TOKEN_MINTS = {
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  NAG: process.env.NAG_TOKEN_MINT 
    ? new PublicKey(process.env.NAG_TOKEN_MINT)
    : new PublicKey('11111111111111111111111111111111') // Placeholder until NAG is deployed
};

export class SolanaPaymentService {
  private connection: Connection;
  private platformWallet: Keypair | null = null;

  constructor(rpcUrl?: string) {
    // Use custom RPC or default to mainnet
    const endpoint = rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    this.connection = new Connection(endpoint, 'confirmed');
    
    // Load platform wallet from environment
    this.loadPlatformWallet();
  }

  /**
   * Load platform wallet keypair from environment variable
   */
  private loadPlatformWallet(): void {
    const privateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    
    if (!privateKey) {
      console.warn('⚠️ PLATFORM_WALLET_PRIVATE_KEY not set - payouts will be simulated');
      return;
    }

    try {
      // Decode base58 private key
      const secretKey = bs58.decode(privateKey);
      this.platformWallet = Keypair.fromSecretKey(secretKey);
      console.log('✅ Platform wallet loaded:', this.platformWallet.publicKey.toString());
    } catch (error) {
      console.error('❌ Failed to load platform wallet:', error);
    }
  }

  /**
   * Send SOL to a wallet
   */
  async sendSOL(params: {
    recipient: string;
    amount: number; // in SOL
  }): Promise<{ signature: string; success: boolean }> {
    try {
      if (!this.platformWallet) {
        throw new Error('Platform wallet not configured');
      }

      const recipientPubkey = new PublicKey(params.recipient);
      const lamports = params.amount * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.platformWallet.publicKey,
          toPubkey: recipientPubkey,
          lamports: lamports
        })
      );

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.platformWallet]
      );

      console.log('✅ SOL transfer confirmed:', signature);
      return { signature, success: true };

    } catch (error: any) {
      console.error('❌ SOL transfer failed:', error);
      throw error;
    }
  }

  /**
   * Send SPL tokens (USDC, USDT, NAG) to a wallet
   */
  async sendSPLToken(params: {
    recipient: string;
    amount: number; // in token units
    tokenMint: 'USDC' | 'USDT' | 'NAG';
  }): Promise<{ signature: string; success: boolean }> {
    try {
      if (!this.platformWallet) {
        throw new Error('Platform wallet not configured');
      }

      const recipientPubkey = new PublicKey(params.recipient);
      const mintAddress = TOKEN_MINTS[params.tokenMint];

      // Get token decimals (USDC/USDT = 6, NAG = 9 typically)
      const decimals = params.tokenMint === 'NAG' ? 9 : 6;
      const tokenAmount = params.amount * Math.pow(10, decimals);

      // Get or create associated token accounts
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.platformWallet,
        mintAddress,
        this.platformWallet.publicKey
      );

      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.platformWallet,
        mintAddress,
        recipientPubkey
      );

      // Create transfer instruction
      const transferInstruction = createTransferInstruction(
        fromTokenAccount.address,
        toTokenAccount.address,
        this.platformWallet.publicKey,
        tokenAmount,
        [],
        TOKEN_PROGRAM_ID
      );

      const transaction = new Transaction().add(transferInstruction);

      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.platformWallet]
      );

      console.log(`✅ ${params.tokenMint} transfer confirmed:`, signature);
      return { signature, success: true };

    } catch (error: any) {
      console.error(`❌ ${params.tokenMint} transfer failed:`, error);
      throw error;
    }
  }

  /**
   * Process a payout (determines token type and sends)
   */
  async processPayout(params: {
    recipient: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT' | 'NAG';
    reference?: string; // Transaction reference (tournament ID, etc.)
  }): Promise<{ signature: string; success: boolean }> {
    console.log(`💸 Processing payout: ${params.amount} ${params.currency} to ${params.recipient}`);

    try {
      let result;

      if (params.currency === 'SOL') {
        result = await this.sendSOL({
          recipient: params.recipient,
          amount: params.amount
        });
      } else {
        result = await this.sendSPLToken({
          recipient: params.recipient,
          amount: params.amount,
          tokenMint: params.currency
        });
      }

      console.log(`✅ Payout successful: ${result.signature}`);
      return result;

    } catch (error: any) {
      console.error('❌ Payout failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  async getBalance(params: {
    wallet: string;
    tokenMint?: 'USDC' | 'USDT' | 'NAG';
  }): Promise<number> {
    try {
      const walletPubkey = new PublicKey(params.wallet);

      if (!params.tokenMint) {
        // Get SOL balance
        const balance = await this.connection.getBalance(walletPubkey);
        return balance / LAMPORTS_PER_SOL;
      }

      // Get SPL token balance
      const mintAddress = TOKEN_MINTS[params.tokenMint];
      const tokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        walletPubkey
      );

      const balance = await this.connection.getTokenAccountBalance(tokenAccount);
      return parseFloat(balance.value.amount) / Math.pow(10, balance.value.decimals);

    } catch (error) {
      console.error('Error getting balance:', error);
      return 0;
    }
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(signature: string): Promise<boolean> {
    try {
      const status = await this.connection.getSignatureStatus(signature);
      return status.value?.confirmationStatus === 'confirmed' || 
             status.value?.confirmationStatus === 'finalized';
    } catch (error) {
      console.error('Error verifying transaction:', error);
      return false;
    }
  }

  /**
   * Batch process multiple payouts
   */
  async batchProcessPayouts(payouts: Array<{
    recipient: string;
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT' | 'NAG';
    reference?: string;
  }>): Promise<Array<{ signature: string; success: boolean; reference?: string }>> {
    console.log(`🔄 Processing ${payouts.length} payouts...`);

    const results = [];
    
    for (const payout of payouts) {
      try {
        const result = await this.processPayout(payout);
        results.push({ ...result, reference: payout.reference });
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error: any) {
        console.error(`Failed payout to ${payout.recipient}:`, error);
        results.push({ 
          signature: '', 
          success: false, 
          reference: payout.reference 
        });
      }
    }

    console.log(`✅ Batch complete: ${results.filter(r => r.success).length}/${payouts.length} successful`);
    return results;
  }

  /**
   * Check if platform wallet has sufficient balance
   */
  async checkPlatformBalance(params: {
    amount: number;
    currency: 'SOL' | 'USDC' | 'USDT' | 'NAG';
  }): Promise<boolean> {
    if (!this.platformWallet) {
      return false;
    }

    const balance = await this.getBalance({
      wallet: this.platformWallet.publicKey.toString(),
      tokenMint: params.currency === 'SOL' ? undefined : params.currency
    });

    return balance >= params.amount;
  }

  /**
   * Get platform wallet public key
   */
  getPlatformWalletAddress(): string | null {
    return this.platformWallet?.publicKey.toString() || null;
  }
}

export default SolanaPaymentService;
