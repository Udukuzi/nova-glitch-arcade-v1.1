import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';

// This will be updated when token is deployed
const NAG_TOKEN_MINT = import.meta.env.VITE_NAG_TOKEN_MINT || 'PLACEHOLDER';
// Minimum 100,000 NAG tokens required (Guest tier = 0, Holder tier = 1,000, but arcade access = 100,000)
const MINIMUM_BALANCE = parseFloat(import.meta.env.VITE_MINIMUM_NAG_BALANCE || '100000');

export function useTokenGate() {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  const [hasAccess, setHasAccess] = useState(false);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkTokenBalance();
  }, [publicKey, connected]);

  async function checkTokenBalance() {
    console.log('🔍 Token gating check:', {
      NAG_TOKEN_MINT,
      connected,
      publicKey: publicKey?.toString()
    });

    // If token not deployed yet, use demo mode with real gating
    if (NAG_TOKEN_MINT === 'PLACEHOLDER') {
      console.log('⚠️ Demo mode - simulating token gating');
      // In demo mode, randomly grant/deny access to show gating works
      const demoHasTokens = Math.random() > 0.7; // 30% chance of having tokens
      setBalance(demoHasTokens ? 150000 : 25000); // Above or below minimum
      setHasAccess(demoHasTokens);
      setIsLoading(false);
      return;
    }

    if (!connected || !publicKey) {
      setHasAccess(false);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const tokenMint = new PublicKey(NAG_TOKEN_MINT);

      // Get all token accounts for the user
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: TOKEN_PROGRAM_ID }
      );

      // Find NAG token account
      const nagAccount = tokenAccounts.value.find(
        (account) => account.account.data.parsed.info.mint === NAG_TOKEN_MINT
      );

      if (nagAccount) {
        const tokenBalance = nagAccount.account.data.parsed.info.tokenAmount.uiAmount;
        setBalance(tokenBalance);
        setHasAccess(tokenBalance >= MINIMUM_BALANCE);
        console.log('✅ Token balance:', tokenBalance, '$NAG');
      } else {
        // User doesn't have token account = 0 balance
        console.log('ℹ️ No $NAG token account found');
        setBalance(0);
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking token balance:', error);
      setError('Failed to check token balance');
      setBalance(0);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  return { 
    hasAccess, 
    balance, 
    isLoading, 
    error,
    minimumRequired: MINIMUM_BALANCE,
    tokenMint: NAG_TOKEN_MINT,
    checkTokenBalance 
  };
}
