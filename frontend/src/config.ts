// Backend configuration
// Game Socket.IO URL (for Contra game streaming)
export const GAME_SOCKET_URL = import.meta.env.VITE_GAME_SOCKET_URL || 'http://127.0.0.1:5001';

// Retain BACKEND_URL for compatibility if other modules import it
export const BACKEND_URL = GAME_SOCKET_URL;

// API Base URL (for the Node.js server)
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';

// Game Configuration

// Token configuration
export const TOKEN_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyKUtq2"; // USDC as an example

// Network configuration
export const NETWORK = 'mainnet-beta';

// RPC endpoints
export const RPC_ENDPOINTS = {
  'mainnet-beta': 'https://api.mainnet-beta.solana.com',
  'devnet': 'https://api.devnet.solana.com',
  'testnet': 'https://api.testnet.solana.com',
};

// Sign-in message
export const SIGN_IN_MESSAGE = (timestamp: number) => `Sign in to Game – ${timestamp}`;

// Maximum number of free trials
export const MAX_TRIALS = 3;
