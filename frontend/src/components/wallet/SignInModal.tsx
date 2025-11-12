import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletContext } from '../../contexts/WalletContext';

export const SignInModal = () => {
  const { connected, publicKey } = useWallet();
  const { isSignedIn, signIn } = useWalletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!connected || !publicKey) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const success = await signIn();
      if (!success) {
        setError('Failed to sign in. Please try again.');
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('An error occurred during sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-trigger sign in when wallet is connected
  useEffect(() => {
    if (connected && !isSignedIn && !isLoading) {
      handleSignIn();
    }
  }, [connected, isSignedIn]);

  if (isSignedIn) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Sign In</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please sign the message to verify your wallet ownership.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleSignIn}
            disabled={isLoading || !connected}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignInModal;
