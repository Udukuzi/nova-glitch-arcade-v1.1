import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

export const useWalletConnection = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, signTransaction, signAllTransactions, connected, connect, disconnect, select, wallet, wallets } = useWallet();

  // Format wallet address to show first and last 4 characters
  const walletAddress = publicKey?.toBase58() || '';
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '';

  // Check if wallet is connected
  const isConnected = connected;

  // Copy wallet address to clipboard
  const copyAddress = async () => {
    if (!walletAddress) return;
    try {
      await navigator.clipboard.writeText(walletAddress);
      return true;
    } catch (error) {
      console.error('Failed to copy address:', error);
      return false;
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    try {
      disconnect();
      return true;
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      return false;
    }
  };

  return {
    connection,
    publicKey,
    walletAddress,
    shortAddress,
    isConnected,
    connect,
    disconnect: disconnectWallet,
    select,
    wallet,
    wallets,
    sendTransaction,
    signTransaction,
    signAllTransactions,
    copyAddress,
  };
};

// Helper function to validate Solana address
const isValidSolanaAddress = (address: string): boolean => {
  try {
    new PublicKey(address);
    return true;
  } catch (error) {
    return false;
  }
};

export { isValidSolanaAddress };
