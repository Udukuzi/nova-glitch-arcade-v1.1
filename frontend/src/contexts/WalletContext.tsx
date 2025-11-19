import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { useConnection, useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { signIn } from '../utils/auth';
import { RPC_ENDPOINTS, NETWORK, SIGN_IN_MESSAGE } from '../config';

interface WalletContextType {
  connection: Connection;
  wallet: WalletContextState;
  isConnected: boolean;
  isSignedIn: boolean;
  signIn: () => Promise<boolean>;
  signOut: () => void;
  publicKey: PublicKey | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const { connection } = useConnection();
  const wallet = useWallet();
  
  // Initialize connection with the correct RPC endpoint
  const rpcEndpoint = RPC_ENDPOINTS[NETWORK as keyof typeof RPC_ENDPOINTS] || clusterApiUrl('mainnet-beta');
  const solanaConnection = new Connection(rpcEndpoint, 'confirmed');

  // Check if user is already signed in
  useEffect(() => {
    const storedSession = localStorage.getItem('wallet_session');
    if (storedSession && wallet.publicKey) {
      setIsSignedIn(true);
    }
  }, [wallet.publicKey]);

  // Handle wallet sign in
  const handleSignIn = useCallback(async () => {
    try {
      if (!wallet.publicKey || !wallet.signMessage) {
        throw new Error('Wallet not connected or does not support message signing');
      }

      // Sign message with timestamp
      const timestamp = Date.now();
      const message = SIGN_IN_MESSAGE(timestamp);
      const signature = await wallet.signMessage(Buffer.from(message));
      
      // Verify signature
      const isValid = await signIn(
        wallet.publicKey.toString(),
        signature.toString('hex'),
        message
      );

      if (isValid) {
        setIsSignedIn(true);
        localStorage.setItem('wallet_session', 'true');
        localStorage.setItem('wallet_address', wallet.publicKey.toString());
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in failed:', error);
      return false;
    }
  }, [wallet]);

  // Handle wallet sign out
  const handleSignOut = useCallback(() => {
    setIsSignedIn(false);
    localStorage.removeItem('wallet_session');
    localStorage.removeItem('wallet_address');
    wallet.disconnect();
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        connection: solanaConnection,
        wallet,
        isConnected: wallet.connected,
        isSignedIn,
        signIn: handleSignIn,
        signOut: handleSignOut,
        publicKey: wallet.publicKey,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Export wallet adapters for use in the app
export const WALLET_ADAPTERS = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter()
];

export const useWalletContext = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
}

