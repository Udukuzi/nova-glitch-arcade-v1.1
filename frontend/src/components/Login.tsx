import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet, WalletName } from '@solana/wallet-adapter-react';
import WalletModal from './WalletModal';
import { useTheme } from '../contexts/ThemeContext';
import { soundManager } from '../utils/sounds';

interface LoginProps {
  onSuccess: (token: string, address: string) => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const { theme } = useTheme();
  const { connect, connected, publicKey } = useWallet();
  const [trialsLeft, setTrialsLeft] = useState(3);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [glitchOffset, setGlitchOffset] = useState(0);
  const [noiseOpacity, setNoiseOpacity] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  // Initialize trials from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('nova_trials');
    if (stored !== null) setTrialsLeft(parseInt(stored, 10));
  }, []);

  // Glitch and noise effects
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.65) {
        setGlitchOffset(Math.random() > 0.5 ? 2 : -2);
        setTimeout(() => setGlitchOffset(0), 60);
      }
    }, 180);

    const noiseInterval = setInterval(() => {
      setNoiseOpacity(Math.random() > 0.75 ? 0.12 : 0);
    }, 120);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(noiseInterval);
    };
  }, []);

  // Handle successful wallet connection
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString();
      const mockToken = `solana-token-${Date.now()}`;
      localStorage.setItem('wallet_session', mockToken);
      localStorage.setItem('wallet_address', address);
      onSuccess(mockToken, address);
    }
  }, [connected, publicKey, onSuccess]);

  const handlePlay = async () => {
    soundManager.playClick();
    if (trialsLeft > 0) {
      const newTrials = trialsLeft - 1;
      setTrialsLeft(newTrials);
      localStorage.setItem('nova_trials', String(newTrials));
      soundManager.playSuccess();

      const mockWallet = `trial-${Date.now()}`;
      const mockToken = `trial-token-${Date.now()}`;

      localStorage.setItem('wallet_session', mockToken);
      localStorage.setItem('wallet_address', mockWallet);
      localStorage.setItem('wallet_user', JSON.stringify({ 
        address: mockWallet, 
        isTrial: true, 
        trialsUsed: 3 - newTrials 
      }));

      onSuccess(mockToken, mockWallet);
    } else {
      setTrialsLeft(0);
      localStorage.setItem('nova_trials', '0');
      setTimeout(() => setShowWalletModal(true), 300);
    }
  };

  const handleConnectWallet = async (walletName: WalletName) => {
    try {
      setIsConnecting(true);
      setError('');
      soundManager.playClick();
      
      if (connected && publicKey) {
        const address = publicKey.toString();
        const mockToken = `solana-token-${Date.now()}`;
        localStorage.setItem('wallet_session', mockToken);
        localStorage.setItem('wallet_address', address);
        onSuccess(mockToken, address);
        return;
      }
      
      await connect();
    } catch (error) {
      console.error('Wallet connection error:', error);
      setError('Failed to connect wallet. Please try again.');
      soundManager.playError();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnectClick = () => {
    soundManager.playClick();
    if (connected && publicKey) {
      const address = publicKey.toString();
      const mockToken = `solana-token-${Date.now()}`;
      localStorage.setItem('wallet_session', mockToken);
      localStorage.setItem('wallet_address', address);
      onSuccess(mockToken, address);
    } else {
      setShowWalletModal(true);
    }
  };

  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
        <div className="bg-red-900 text-white p-6 rounded-lg max-w-md w-full">
          <h3 className="text-xl font-bold mb-2">Error</h3>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => setError('')}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
      {/* Glitch effect overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239C92AC\' fill-opacity=\'0.05\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
          opacity: noiseOpacity,
          transition: 'opacity 0.3s ease',
          zIndex: 0
        }}
      />
      
      <div className="relative z-10 text-center max-w-2xl w-full">
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          style={{
            textShadow: '0 0 10px rgba(168, 85, 247, 0.5)',
            transform: `translateX(${glitchOffset}px)`
          }}
        >
          NOVA ARCADE GLITCH
        </motion.h1>
        
        <p className="text-xl text-gray-300 mb-12">
          Connect your wallet to start playing or try our free trial
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <motion.button
            onClick={handlePlay}
            className="glitch-btn"
            style={{
              '--glitch-color': '#00ff9c',
              '--glitch-strength': '2px',
              fontSize: '1.1rem',
              padding: '14px 32px',
              minWidth: '200px',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {trialsLeft > 0 ? (
              <>
                <span>Play Free Trial</span>
                <span className="text-xs opacity-70">({trialsLeft} left)</span>
              </>
            ) : (
              'No Trials Left'
            )}
          </motion.button>
          
          <motion.button
            onClick={handleConnectClick}
            className="glitch-btn"
            style={{
              '--glitch-color': connected ? '#00ff9c' : '#8b5cf6',
              '--glitch-strength': '3px',
              fontSize: '1.1rem',
              padding: '14px 32px',
              minWidth: '200px',
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isConnecting}
          >
            {isConnecting ? (
              'Connecting...'
            ) : connected ? (
              <>
                <span>Connected</span>
                <span className="text-xs">
                  {publicKey?.toString().slice(0, 4)}...{publicKey?.toString().slice(-4)}
                </span>
              </>
            ) : (
              <>
                <span>Connect Wallet</span>
                <span className="text-xs opacity-70">(Required)</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
      
      <WalletModal
        open={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={handleConnectWallet}
      />
    </div>
  );
}
