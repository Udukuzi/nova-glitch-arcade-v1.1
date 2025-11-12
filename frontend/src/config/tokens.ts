/**
 * Token Configuration for Nova Glitch Arcade
 * LAUNCH UPDATE: After token launch, replace only the 'mint' field below with the real CA
 */

// NAG Token Configuration - LIVE TOKEN ADDRESS
export const NAG_TOKEN = {
  mint: import.meta.env.VITE_NAG_TOKEN_MINT || '957tKDz9GKtY3X54WuJUkhYfnNJsrAoyQQZpMjS1pump',
  symbol: 'NAG',
  name: 'Nova Arcade Glitch',
  decimals: 6, // pump.fun tokens are 6 decimals
  logoURI: '/nag-logo.png',
};

// Supported tokens for swapping
export const SUPPORTED_TOKENS = [
  { 
    mint: 'So11111111111111111111111111111111111111112', 
    symbol: 'SOL', 
    name: 'Solana', 
    decimals: 9,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  { 
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 
    symbol: 'USDC', 
    name: 'USD Coin', 
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
  },
  { 
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', 
    symbol: 'USDT', 
    name: 'Tether USD', 
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg'
  },
  NAG_TOKEN,
] as const;

export type Token = typeof SUPPORTED_TOKENS[number];

// Helper to get token by mint
export function getTokenByMint(mint: string): Token | undefined {
  return SUPPORTED_TOKENS.find(t => t.mint === mint);
}

// Helper to get token by symbol
export function getTokenBySymbol(symbol: string): Token | undefined {
  return SUPPORTED_TOKENS.find(t => t.symbol === symbol);
}
