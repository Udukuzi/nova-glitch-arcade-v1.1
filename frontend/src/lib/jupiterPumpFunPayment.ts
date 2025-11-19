/**
 * Jupiter + Pump.fun Payment System
 * Handles real-time quotes and swaps for ANY Pump.fun token (pre/post-bonded)
 * 
 * @author Senior Solana TypeScript Developer
 * @version 1.0.0
 */

import { 
  Connection, 
  PublicKey, 
  Transaction, 
  VersionedTransaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import axios, { AxiosResponse } from 'axios';

// Jupiter V6 Types
export interface JupiterQuoteResponse {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee: any;
  priceImpactPct: string;
  routePlan: any[];
  contextSlot?: number;
  timeTaken?: number;
}

export interface JupiterSwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

// Pump.fun Metis API Types
export interface PumpFunQuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  feeAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  bondingCurvePrice: string;
  marketCap: string;
  virtualSolReserves: string;
  virtualTokenReserves: string;
  realSolReserves: string;
  realTokenReserves: string;
}

export interface PumpFunSwapResponse {
  transaction: string;
  signature?: string;
  lastValidBlockHeight: number;
}

// Unified Quote Response
export interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  slippageBps: number;
  source: 'jupiter' | 'pumpfun';
  raw: JupiterQuoteResponse | PumpFunQuoteResponse;
}

// Configuration Options
export interface PumpFunPaymentOptions {
  metisApiKey?: string;
  jupiterApiUrl?: string;
  metisApiUrl?: string;
  priorityFee?: number;
  maxRetries?: number;
}

/**
 * PumpFunPayment Class
 * Handles real-time quotes and swaps for ANY Pump.fun token
 */
export class PumpFunPayment {
  private connection: Connection;
  private wallet: WalletContextState | Keypair;
  private options: Required<PumpFunPaymentOptions>;
  private quoteWatchers: Map<string, NodeJS.Timeout> = new Map();

  // Pump.fun Program ID (mainnet)
  private static readonly PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
  
  // SOL mint address
  private static readonly SOL_MINT = 'So11111111111111111111111111111111111111112';
  
  // USDC mint address  
  private static readonly USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  constructor(
    connection: Connection,
    wallet: WalletContextState | Keypair,
    options: PumpFunPaymentOptions = {}
  ) {
    this.connection = connection;
    this.wallet = wallet;
    this.options = {
      metisApiKey: options.metisApiKey || '',
      jupiterApiUrl: options.jupiterApiUrl || 'https://quote-api.jup.ag/v6',
      metisApiUrl: options.metisApiUrl || 'https://pumpfun-api.quicknode.com/v1',
      priorityFee: options.priorityFee || 100000,
      maxRetries: options.maxRetries || 3,
      ...options
    };
  }

  /**
   * Check if a token is still on Pump.fun bonding curve (pre-bonded)
   * @param mint Token mint address
   * @returns Promise<boolean> True if pre-bonded, false if graduated to Raydium
   */
  async isPreBonded(mint: string): Promise<boolean> {
    try {
      // Method 1: Check if bonding curve account exists
      const bondingCurveAddress = await this.getBondingCurveAddress(mint);
      const accountInfo = await this.connection.getAccountInfo(bondingCurveAddress);
      
      if (!accountInfo) {
        return false; // No bonding curve = graduated
      }

      // Method 2: Try Metis API to confirm
      if (this.options.metisApiKey) {
        try {
          const response = await axios.get(`${this.options.metisApiUrl}/token/${mint}`, {
            headers: { 'x-api-key': this.options.metisApiKey },
            timeout: 5000
          });
          
          return response.data?.bondingCurve?.active === true;
        } catch (metisError) {
          console.warn('Metis API check failed, using account info result:', metisError);
        }
      }

      return true; // Account exists = likely pre-bonded
    } catch (error) {
      console.error('Error checking pre-bonded status:', error);
      return false; // Default to post-bonded (Jupiter)
    }
  }

  /**
   * Get real-time quote for token swap
   * Auto-detects pre vs post-bonded and routes accordingly
   * @param inputMint Input token mint address
   * @param outputMint Output token mint address  
   * @param amount Amount in smallest units (lamports, etc)
   * @param slippageBps Slippage in basis points (default 100 = 1%)
   * @returns Promise<QuoteResponse> Unified quote response
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number = 100
  ): Promise<QuoteResponse> {
    console.log('🔍 Getting quote:', { inputMint, outputMint, amount, slippageBps });

    // Check if either token is pre-bonded
    const [inputPreBonded, outputPreBonded] = await Promise.all([
      this.isPreBonded(inputMint),
      this.isPreBonded(outputMint)
    ]);

    console.log('📊 Token status:', { 
      inputPreBonded, 
      outputPreBonded,
      inputMint: inputMint.slice(0, 8) + '...',
      outputMint: outputMint.slice(0, 8) + '...'
    });

    // If either token is pre-bonded, use Pump.fun API
    if (inputPreBonded || outputPreBonded) {
      try {
        return await this.getPumpFunQuote(inputMint, outputMint, amount, slippageBps);
      } catch (pumpError) {
        console.warn('Pump.fun quote failed, trying Jupiter:', pumpError);
        // Fallback to Jupiter
        return await this.getJupiterQuote(inputMint, outputMint, amount, slippageBps);
      }
    }

    // Both tokens are post-bonded, use Jupiter
    return await this.getJupiterQuote(inputMint, outputMint, amount, slippageBps);
  }

  /**
   * Get quote from Pump.fun Metis API (for pre-bonded tokens)
   * @private
   */
  private async getPumpFunQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number
  ): Promise<QuoteResponse> {
    if (!this.options.metisApiKey) {
      throw new Error('Metis API key required for Pump.fun quotes');
    }

    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString()
    });

    const response: AxiosResponse<PumpFunQuoteResponse> = await axios.get(
      `${this.options.metisApiUrl}/quote?${params}`,
      {
        headers: { 'x-api-key': this.options.metisApiKey },
        timeout: 10000
      }
    );

    const pumpQuote = response.data;

    return {
      inputMint,
      outputMint,
      inAmount: pumpQuote.inAmount,
      outAmount: pumpQuote.outAmount,
      priceImpactPct: pumpQuote.priceImpactPct,
      slippageBps,
      source: 'pumpfun',
      raw: pumpQuote
    };
  }

  /**
   * Get quote from Jupiter V6 API (for post-bonded tokens)
   * @private
   */
  private async getJupiterQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    slippageBps: number
  ): Promise<QuoteResponse> {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false'
    });

    const response: AxiosResponse<JupiterQuoteResponse> = await axios.get(
      `${this.options.jupiterApiUrl}/quote?${params}`,
      { timeout: 10000 }
    );

    const jupiterQuote = response.data;

    return {
      inputMint,
      outputMint,
      inAmount: jupiterQuote.inAmount,
      outAmount: jupiterQuote.outAmount,
      priceImpactPct: jupiterQuote.priceImpactPct,
      slippageBps,
      source: 'jupiter',
      raw: jupiterQuote
    };
  }

  /**
   * Execute swap transaction
   * @param quote Quote response from getQuote()
   * @returns Promise<string> Transaction signature
   */
  async executeSwap(quote: QuoteResponse): Promise<string> {
    console.log('🔄 Executing swap:', quote.source);

    if (quote.source === 'pumpfun') {
      return await this.executePumpFunSwap(quote);
    } else {
      return await this.executeJupiterSwap(quote);
    }
  }

  /**
   * Execute Pump.fun swap
   * @private
   */
  private async executePumpFunSwap(quote: QuoteResponse): Promise<string> {
    if (!this.options.metisApiKey) {
      throw new Error('Metis API key required for Pump.fun swaps');
    }

    const userPublicKey = this.getUserPublicKey();
    
    const swapRequest = {
      quoteResponse: quote.raw,
      userPublicKey: userPublicKey.toBase58(),
      wrapAndUnwrapSol: true,
      prioritizationFeeLamports: this.options.priorityFee
    };

    const response: AxiosResponse<PumpFunSwapResponse> = await axios.post(
      `${this.options.metisApiUrl}/swap`,
      swapRequest,
      {
        headers: { 
          'x-api-key': this.options.metisApiKey,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    const swapResponse = response.data;
    
    // Deserialize and sign transaction
    const txBuf = Buffer.from(swapResponse.transaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuf);
    
    const signedTx = await this.signTransaction(transaction);
    
    // Submit transaction
    const signature = await this.connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });

    console.log('✅ Pump.fun swap submitted:', signature);
    return signature;
  }

  /**
   * Execute Jupiter swap
   * @private
   */
  private async executeJupiterSwap(quote: QuoteResponse): Promise<string> {
    const userPublicKey = this.getUserPublicKey();
    
    const swapRequest = {
      quoteResponse: quote.raw,
      userPublicKey: userPublicKey.toBase58(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: this.options.priorityFee
    };

    const response: AxiosResponse<JupiterSwapResponse> = await axios.post(
      `${this.options.jupiterApiUrl}/swap`,
      swapRequest,
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    const swapResponse = response.data;
    
    // Deserialize and sign transaction
    const txBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
    const transaction = VersionedTransaction.deserialize(txBuf);
    
    const signedTx = await this.signTransaction(transaction);
    
    // Submit transaction
    const signature = await this.connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      preflightCommitment: 'confirmed'
    });

    console.log('✅ Jupiter swap submitted:', signature);
    return signature;
  }

  /**
   * Start watching quotes with real-time updates
   * @param inputMint Input token mint
   * @param outputMint Output token mint
   * @param amount Amount to swap
   * @param callback Callback function for quote updates
   * @param intervalMs Update interval in milliseconds (default 3000)
   * @returns string Watch ID for stopping
   */
  watchQuote(
    inputMint: string,
    outputMint: string,
    amount: number,
    callback: (quote: QuoteResponse | null, error?: Error) => void,
    intervalMs: number = 3000
  ): string {
    const watchId = `${inputMint}-${outputMint}-${Date.now()}`;
    
    const fetchQuote = async () => {
      try {
        const quote = await this.getQuote(inputMint, outputMint, amount);
        callback(quote);
      } catch (error) {
        callback(null, error as Error);
      }
    };

    // Initial fetch
    fetchQuote();

    // Set up interval
    const intervalId = setInterval(fetchQuote, intervalMs);
    this.quoteWatchers.set(watchId, intervalId);

    console.log('👀 Started watching quotes:', watchId);
    return watchId;
  }

  /**
   * Stop watching quotes
   * @param watchId Watch ID returned from watchQuote()
   */
  stopWatchingQuote(watchId: string): void {
    const intervalId = this.quoteWatchers.get(watchId);
    if (intervalId) {
      clearInterval(intervalId);
      this.quoteWatchers.delete(watchId);
      console.log('🛑 Stopped watching quotes:', watchId);
    }
  }

  /**
   * Stop all quote watchers
   */
  stopAllWatchers(): void {
    this.quoteWatchers.forEach((intervalId, watchId) => {
      clearInterval(intervalId);
      console.log('🛑 Stopped watching quotes:', watchId);
    });
    this.quoteWatchers.clear();
  }

  /**
   * Utility: Get bonding curve address for a Pump.fun token
   * @private
   */
  private async getBondingCurveAddress(mint: string): Promise<PublicKey> {
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), new PublicKey(mint).toBuffer()],
      PumpFunPayment.PUMP_FUN_PROGRAM
    );
    return bondingCurve;
  }

  /**
   * Get user's public key from wallet or keypair
   * @private
   */
  private getUserPublicKey(): PublicKey {
    if ('publicKey' in this.wallet && this.wallet.publicKey) {
      return this.wallet.publicKey;
    } else if ('publicKey' in this.wallet) {
      return (this.wallet as Keypair).publicKey;
    }
    throw new Error('No public key available');
  }

  /**
   * Sign transaction with wallet or keypair
   * @private
   */
  private async signTransaction(transaction: VersionedTransaction): Promise<VersionedTransaction> {
    if ('signTransaction' in this.wallet && this.wallet.signTransaction) {
      return await this.wallet.signTransaction(transaction);
    } else if ('secretKey' in this.wallet) {
      transaction.sign([this.wallet as Keypair]);
      return transaction;
    }
    throw new Error('Cannot sign transaction');
  }

  /**
   * Utility: Format amount from smallest units to human readable
   * @param amount Amount in smallest units
   * @param decimals Token decimals
   * @returns Formatted amount string
   */
  static formatAmount(amount: string | number, decimals: number): string {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return (num / Math.pow(10, decimals)).toFixed(decimals > 6 ? 6 : decimals);
  }

  /**
   * Utility: Parse amount from human readable to smallest units
   * @param amount Human readable amount
   * @param decimals Token decimals
   * @returns Amount in smallest units
   */
  static parseAmount(amount: string | number, decimals: number): number {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return Math.floor(num * Math.pow(10, decimals));
  }

  /**
   * Utility: Get common token mints
   */
  static getCommonMints() {
    return {
      SOL: PumpFunPayment.SOL_MINT,
      USDC: PumpFunPayment.USDC_MINT,
      USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'
    };
  }
}

export default PumpFunPayment;
