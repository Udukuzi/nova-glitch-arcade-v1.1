import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import jwt from 'jsonwebtoken';

// x402 Protocol Integration for Agent Payments
// Anti-cheat configuration
const ANTI_CHEAT_CONFIG = {
  MIN_GAME_DURATION: 30, // seconds
  MAX_SCORE_PER_MINUTE: {
    snake: 100,
    flappy: 50,
    memory: 200,
    bonk: 150,
    paccoin: 120,
    tetramem: 300
  },
  SUSPICIOUS_PATTERN_THRESHOLD: 0.8,
  COMPETITION_FEE_PERCENT: 2, // 2% platform fee
  NAG_BONUS_MULTIPLIER: 1.25 // 25% bonus for NAG usage
};

export class X402BettingAgent {
  private connection: Connection;
  private agentKeypair: any; // Will use environment variable
  
  // Token addresses on Solana
  private USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
  private USDT_MINT = new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'); // Mainnet USDT
  // NAG token will be set after launch - using placeholder for now
  private NAG_MINT = process.env.NAG_TOKEN_MINT 
    ? new PublicKey(process.env.NAG_TOKEN_MINT) 
    : new PublicKey('11111111111111111111111111111111'); // System program as placeholder
  
  // Competition modes
  private COMPETITION_MODES = {
    KIDS: { minAge: 7, maxAge: 12, maxBet: 1, allowedGames: ['snake', 'memory', 'tetramem'] },
    TEEN: { minAge: 13, maxAge: 17, maxBet: 5, allowedGames: ['all'] },
    ADULT: { minAge: 18, maxAge: 99, maxBet: 100, allowedGames: ['all'] }
  };
  
  constructor(rpcUrl: string = process.env.SOL_RPC || 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  // Create a betting match between two players
  async createBettingMatch(params: {
    player1: string;
    player2: string;
    gameId: string;
    betAmount: number; // in USDC/USDT
    currency: 'USDC' | 'USDT';
  }) {
    const matchId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Store match in database
    const match = {
      id: matchId,
      player1: params.player1,
      player2: params.player2,
      gameId: params.gameId,
      betAmount: params.betAmount,
      currency: params.currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      escrowAddress: await this.createEscrowAccount(matchId),
      x402RequestId: null // Will be set when x402 payment is initiated
    };
    
    return match;
  }

  // Create escrow account for holding bets
  async createEscrowAccount(matchId: string) {
    // Generate deterministic escrow address from match ID
    const [escrowPDA] = await PublicKey.findProgramAddress(
      [Buffer.from('escrow'), Buffer.from(matchId)],
      new PublicKey('11111111111111111111111111111111') // System Program
    );
    return escrowPDA.toString();
  }

  // Process x402 payment request
  async processX402Payment(params: {
    from: string;
    to: string;
    amount: number;
    currency: 'USDC' | 'USDT' | 'NAG';
    matchId: string;
  }) {
    // x402 Payment Header Implementation
    const x402Header = {
      'X-402': 'Payment-Required',
      'X-402-Amount': params.amount.toString(),
      'X-402-Currency': params.currency,
      'X-402-Recipient': params.to,
      'X-402-Match-ID': params.matchId,
      'X-402-Network': 'solana',
      'X-402-Protocol': 'spl-token'
    };
    
    return {
      headers: x402Header,
      paymentUrl: this.generatePaymentUrl(params),
      qrCode: await this.generatePaymentQR(params)
    };
  }

  // Generate payment URL for x402
  generatePaymentUrl(params: any) {
    const baseUrl = 'https://x402.dev/pay';
    const queryParams = new URLSearchParams({
      recipient: params.to,
      amount: params.amount.toString(),
      currency: params.currency,
      network: 'solana',
      memo: `Nova Arcade Bet: ${params.matchId}`
    });
    return `${baseUrl}?${queryParams.toString()}`;
  }

  // Generate QR code for payment
  async generatePaymentQR(params: any) {
    // Use solana pay standard
    const url = `solana:${params.to}?amount=${params.amount}&spl-token=${params.currency}&memo=NovaArcade-${params.matchId}`;
    return url;
  }

  // Settle bet after game completion
  async settleBet(matchId: string, winner: string, scores: { player1: number; player2: number }) {
    // Retrieve match from database
    const match = await this.getMatch(matchId);
    
    if (!match) throw new Error('Match not found');
    
    const winnerAddress = winner === 'player1' ? match.player1 : match.player2;
    const loserAddress = winner === 'player1' ? match.player2 : match.player1;
    
    // Calculate payout with NAG bonus
    const totalBet = match.betAmount * 2;
    const competitionFee = totalBet * (ANTI_CHEAT_CONFIG.COMPETITION_FEE_PERCENT / 100);
    const basePayout = totalBet - competitionFee;
    
    // Apply NAG bonus for ecosystem participation
    const winnerPayout = basePayout * ANTI_CHEAT_CONFIG.NAG_BONUS_MULTIPLIER;
    const ecosystemReward = competitionFee * 0.5; // 50% goes to reward pool
    const platformFee = competitionFee * 0.5; // 50% for platform
    
    // Process x402 payment to winner
    const paymentResult = await this.processX402Payment({
      from: match.escrowAddress,
      to: winnerAddress,
      amount: winnerPayout,
      currency: 'NAG', // Payouts in NAG tokens
      matchId: matchId
    });
    
    // Update match status
    await this.updateMatch(matchId, {
      status: 'settled',
      winner: winnerAddress,
      winnerPayout: winnerPayout,
      settledAt: new Date().toISOString(),
      scores: scores,
      x402PaymentId: `payment_${matchId}_${Date.now()}`
    });
    
    return {
      winner: winnerAddress,
      payout: winnerPayout,
      paymentDetails: paymentResult
    };
  }

  // Mock database functions (replace with Supabase)
  async getMatch(matchId: string): Promise<any> {
    // TODO: Fetch from Supabase
    return null;
  }
  
  async updateMatch(matchId: string, updates: any): Promise<void> {
    // TODO: Update in Supabase
  }

  // Create x402 facilitator endpoint
  async createFacilitatorEndpoint() {
    return {
      endpoint: '/api/x402/facilitate',
      capabilities: [
        'betting',
        'micropayments',
        'escrow',
        'agent-payments'
      ],
      supportedCurrencies: ['USDC', 'USDT', 'NAG', 'SOL'],
      network: 'solana',
      version: '1.0.0'
    };
  }

  // Validate x402 payment signature
  async validateX402Signature(headers: any, body: any): Promise<boolean> {
    const signature = headers['x-402-signature'];
    const timestamp = headers['x-402-timestamp'];
    const nonce = headers['x-402-nonce'];
    
    if (!signature || !timestamp || !nonce) return false;
    
    // Verify timestamp is recent (within 5 minutes)
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now() / 1000;
    if (Math.abs(currentTime - requestTime) > 300) return false;
    
    // TODO: Implement signature verification
    return true;
  }
}

// Export for use in API
export default X402BettingAgent;
