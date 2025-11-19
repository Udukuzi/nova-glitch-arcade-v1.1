/**
 * Mobile Wallet Prompt - Guides mobile users to connect wallets
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  detectMobileWallet, 
  openPhantomMobile, 
  openSolflareMobile,
  shouldShowMobileWalletPrompt 
} from '../utils/mobileWalletDetection';

const MobileWalletPrompt: React.FC = () => {
  const { connected } = useWallet();
  const [showPrompt, setShowPrompt] = useState(false);
  const [walletInfo, setWalletInfo] = useState<any>(null);

  useEffect(() => {
    // Only show if not connected and on mobile without wallet
    if (!connected && shouldShowMobileWalletPrompt()) {
      setWalletInfo(detectMobileWallet());
      // Show after 5 seconds
      const timer = setTimeout(() => setShowPrompt(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [connected]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('mobile-wallet-prompt-dismissed', 'true');
  };

  const handleOpenPhantom = () => {
    openPhantomMobile();
    handleDismiss();
  };

  const handleOpenSolflare = () => {
    openSolflareMobile();
    handleDismiss();
  };

  if (!showPrompt || connected || !walletInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        style={{
          position: 'fixed',
          bottom: 80,
          left: 16,
          right: 16,
          zIndex: 9998,
          maxWidth: 500,
          margin: '0 auto'
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          borderRadius: 16,
          padding: 20,
          boxShadow: '0 20px 60px rgba(99,102,241,0.5)',
          border: '2px solid rgba(255,255,255,0.2)',
          position: 'relative'
        }}>
          <button
            onClick={handleDismiss}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 20,
              width: 32,
              height: 32,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ fontSize: 36 }}>👛</div>
            <div style={{ flex: 1 }}>
              <h3 style={{
                margin: '0 0 8px 0',
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace'
              }}>
                Connect Your Wallet
              </h3>
              <p style={{
                margin: '0 0 16px 0',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                fontFamily: 'Rajdhani, sans-serif',
                lineHeight: 1.4
              }}>
                To play and earn, you need a Solana wallet. Choose one below:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={handleOpenPhantom}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: '#fff',
                    color: '#6366f1',
                    border: 'none',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 24 }}>👻</span>
                  Open in Phantom
                </button>

                <button
                  onClick={handleOpenSolflare}
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    background: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderRadius: 10,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'Rajdhani, sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10
                  }}
                >
                  <span style={{ fontSize: 24 }}>🔥</span>
                  Open in Solflare
                </button>
              </div>

              <p style={{
                margin: '12px 0 0 0',
                color: 'rgba(255,255,255,0.7)',
                fontSize: 12,
                fontFamily: 'Rajdhani, sans-serif',
                textAlign: 'center'
              }}>
                Don't have a wallet? Download from your app store!
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MobileWalletPrompt;
