/**
 * Jupiter Swap V6 Integration Service
 * Handles all Jupiter swap operations for Nova Glitch Arcade
 */

import { Connection, VersionedTransaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// Jupiter API endpoints
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';
const JUPITER_PRICE_API = 'https://price.jup.ag/v4';

// RPC connection
const getRpcUrl = () => {
  return import.meta.env.VITE_SOLANA_RPC || 'https://api.mainnet-beta.solana.com';
};

const connection = new Connection(getRpcUrl());

// Quote response type
export interface QuoteResponse {
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

// Swap response type
export interface SwapResponse {
  swapTransaction: string;
  lastValidBlockHeight: number;
  prioritizationFeeLamports: number;
}

/**
 * Get a quote for swapping tokens
 * @param inputMint - Input token mint address
 * @param outputMint - Output token mint address
 * @param amount - Amount in smallest units (lamports, etc)
 * @param slippageBps - Slippage in basis points (default 50 = 0.5%)
 */
export async function getQuote(
  inputMint: string,
  outputMint: string,
  amount: number | string,
  slippageBps = 50
): Promise<QuoteResponse> {
  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount: amount.toString(),
      slippageBps: slippageBps.toString(),
      onlyDirectRoutes: 'false',
      asLegacyTransaction: 'false',
    });

    const url = `${JUPITER_QUOTE_API}/quote?${params}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Quote API error:', errorData);
      throw new Error(`Failed to get quote: ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error getting quote:', error);
    throw error;
  }
}

/**
 * Get swap transaction from Jupiter
 * @param quote - Quote response from getQuote
 * @param userPublicKey - User's public key
 * @param priorityFee - Priority fee in micro lamports (default 100000)
 */
export async function getSwapTransaction(
  quote: QuoteResponse,
  userPublicKey: string,
  priorityFee = 100000
): Promise<SwapResponse> {
  try {
    const requestBody = {
      quoteResponse: quote,
      userPublicKey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: priorityFee,
    };

    const response = await fetch(`${JUPITER_QUOTE_API}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Swap API error:', errorData);
      throw new Error(`Failed to get swap transaction: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error getting swap transaction:', error);
    throw error;
  }
}

/**
 * Submit a signed transaction to the network
 * @param signedTxBase64 - Base64 encoded signed transaction
 */
export async function submitTransaction(signedTxBase64: string): Promise<string> {
  try {
    const txBuffer = Buffer.from(signedTxBase64, 'base64');
    const tx = VersionedTransaction.deserialize(txBuffer);
    
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
      preflightCommitment: 'confirmed',
    });
    
    // Wait for confirmation
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');
    
    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }
    
    return signature;
  } catch (error) {
    console.error('Error submitting transaction:', error);
    throw error;
  }
}

/**
 * Get token prices from Jupiter
 * @param tokenIds - Array of token mint addresses
 */
export async function getTokenPrices(tokenIds: string[]): Promise<Record<string, number>> {
  try {
    const params = new URLSearchParams({
      ids: tokenIds.join(','),
    });

    const response = await fetch(`${JUPITER_PRICE_API}/price?${params}`);
    
    if (!response.ok) {
      throw new Error(`Failed to get prices: ${response.statusText}`);
    }
    
    const data = await response.json();
    const prices: Record<string, number> = {};
    
    Object.entries(data.data || {}).forEach(([mint, priceData]: [string, any]) => {
      prices[mint] = priceData.price || 0;
    });
    
    return prices;
  } catch (error) {
    console.error('Error getting token prices:', error);
    return {};
  }
}

/**
 * Format amount for display
 * @param amount - Amount in smallest units
 * @param decimals - Token decimals
 */
export function formatAmount(amount: string | number, decimals: number): string {
  const value = Number(amount) / Math.pow(10, decimals);
  
  if (value < 0.00001) {
    return value.toExponential(2);
  } else if (value < 1) {
    return value.toFixed(6);
  } else if (value < 10000) {
    return value.toFixed(4);
  } else {
    return value.toLocaleString('en-US', { maximumFractionDigits: 2 });
  }
}

/**
 * Parse amount to smallest units
 * @param amount - Human readable amount
 * @param decimals - Token decimals
 */
export function parseAmount(amount: string, decimals: number): string {
  try {
    const value = parseFloat(amount);
    if (isNaN(value)) return '0';
    
    const multiplier = Math.pow(10, decimals);
    return Math.floor(value * multiplier).toString();
  } catch {
    return '0';
  }
}
