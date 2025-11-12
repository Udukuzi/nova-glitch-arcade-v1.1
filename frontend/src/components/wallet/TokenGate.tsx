import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_MINT, MAX_TRIALS } from '../../config';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export const useTrial = () => {
  const [trialsLeft, setTrialsLeft] = useState(MAX_TRIALS);
  const [isTokenHolder, setIsTokenHolder] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { publicKey, connection } = useWallet();

  // Load trials from localStorage
  useEffect(() => {
    const storedTrials = localStorage.getItem('trials_left');
    if (storedTrials) {
      setTrialsLeft(parseInt(storedTrials, 10));
    } else {
      localStorage.setItem('trials_left', MAX_TRIALS.toString());
    }
  }, []);

  // Check if user holds the required token
  const checkTokenBalance = useCallback(async () => {
    if (!publicKey || !connection) return false;

    setIsChecking(true);
    try {
      const tokenMint = new PublicKey(TOKEN_MINT);
      const tokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
      const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
      
      const hasToken = accountInfo.value.uiAmount > 0;
      setIsTokenHolder(hasToken);
      return hasToken;
    } catch (error) {
      console.error('Error checking token balance:', error);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [publicKey, connection]);

  // Consume a trial
  const consumeTrial = useCallback(() => {
    if (isTokenHolder) return true; // Token holders have unlimited trials
    if (trialsLeft <= 0) return false;

    const newTrials = Math.max(0, trialsLeft - 1);
    setTrialsLeft(newTrials);
    localStorage.setItem('trials_left', newTrials.toString());
    return true;
  }, [trialsLeft, isTokenHolder]);

  // Reset trials (for testing)
  const resetTrials = useCallback(() => {
    setTrialsLeft(MAX_TRIALS);
    localStorage.setItem('trials_left', MAX_TRIALS.toString());
  }, []);

  return {
    trialsLeft,
    isTokenHolder,
    isChecking,
    consumeTrial,
    checkTokenBalance,
    resetTrials,
    canPlay: trialsLeft > 0 || isTokenHolder,
  };
};

export const TokenGate = ({ children }: { children: React.ReactNode }) => {
  const { trialsLeft, isTokenHolder, isChecking, checkTokenBalance } = useTrial();
  const canPlay = trialsLeft > 0 || isTokenHolder;

  if (!canPlay) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">Free Trials Used Up</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          You've used all your free trials. Hold 1+ of the required token to continue playing.
        </p>
        <button
          onClick={checkTokenBalance}
          disabled={isChecking}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium rounded-lg disabled:opacity-50"
        >
          {isChecking ? 'Checking...' : 'Verify Token Balance'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {trialsLeft > 0 && !isTokenHolder && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Free trials left: <span className="font-bold">{trialsLeft}</span>
          </div>
        )}
        {isTokenHolder && (
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            🎉 Token Holder - Unlimited Plays!
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default TokenGate;
