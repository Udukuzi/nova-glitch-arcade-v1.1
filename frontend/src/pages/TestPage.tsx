import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletContext } from '../contexts/WalletContext';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { TOKEN_MINT } from '../config';

const TestPage = () => {
  const { publicKey } = useWallet();
  const { connection, isSignedIn, signIn, signOut } = useWalletContext();
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const checkTokenBalance = async () => {
    if (!publicKey || !connection) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const tokenMint = new PublicKey(TOKEN_MINT);
      const tokenAccount = await getAssociatedTokenAddress(tokenMint, publicKey);
      const accountInfo = await connection.getTokenAccountBalance(tokenAccount);
      
      setTokenBalance(accountInfo.value.uiAmount);
    } catch (err) {
      console.error('Error checking token balance:', err);
      setError('Failed to check token balance');
      setTokenBalance(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && publicKey) {
      checkTokenBalance();
    }
  }, [isSignedIn, publicKey]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Wallet & Token Test</h1>
          
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Wallet Connection</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${publicKey ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  {publicKey ? 'Wallet Connected' : 'Wallet Not Connected'}
                </span>
              </div>
              {publicKey && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address:</p>
                  <p className="text-sm font-mono text-gray-800 dark:text-gray-200 break-all">
                    {publicKey.toString()}
                  </p>
                </div>
              )}
            </div>

            {/* Authentication Status */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Authentication</h2>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isSignedIn ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="text-gray-700 dark:text-gray-300">
                  {isSignedIn ? 'Signed In' : 'Not Signed In'}
                </span>
              </div>
              {!isSignedIn && publicKey && (
                <button
                  onClick={() => signIn()}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-105"
                >
                  Sign In with Wallet
                </button>
              )}
              {isSignedIn && (
                <button
                  onClick={signOut}
                  className="mt-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white font-bold rounded-xl shadow-lg shadow-red-500/30 transition-all transform hover:scale-105"
                >
                  Sign Out
                </button>
              )}
            </div>

            {/* Token Balance */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">Token Balance</h2>
              <div className="flex items-center space-x-2">
                {isLoading ? (
                  <div className="animate-pulse h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                ) : (
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    {tokenBalance !== null ? `${tokenBalance} NAG` : 'N/A'}
                  </span>
                )}
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <button
                onClick={checkTokenBalance}
                disabled={isLoading}
                className="mt-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-green-500/30 transition-all transform hover:scale-105 disabled:opacity-50"
              >
                {isLoading ? 'Checking...' : 'Check Balance'}
              </button>
            </div>

            {/* Test Controls */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
              <h2 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-200">Test Controls</h2>
              <div className="space-y-2">
                <button
                  onClick={() => window.open('https://spl-token-faucet.com/', '_blank')}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-105 text-center"
                >
                  Get Test Tokens (SPL Token Faucet)
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Use the Solana SPL Token Faucet to get test tokens for the required mint.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
