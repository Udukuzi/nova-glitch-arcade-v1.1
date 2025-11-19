/**
 * Jupiter Swap - WORKING SOLUTION with Real Swap Execution
 * Uses iframe-based Jupiter widget that bypasses all CORS/DNS issues
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface JupiterSwapWorkingProps {
  isOpen: boolean;
  onClose: () => void;
  onSwapComplete?: (signature: string) => void;
}

export function JupiterSwapWorking({ isOpen, onClose, onSwapComplete }: JupiterSwapWorkingProps) {
  const wallet = useWallet();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Listen for Jupiter Terminal events
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== 'https://jup.ag') return;
        
        if (event.data.type === 'jupiter-swap-success') {
          console.log('✅ Real swap completed:', event.data.signature);
          onSwapComplete?.(event.data.signature);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [isOpen, onSwapComplete]);

  if (!isOpen) return null;

  // Jupiter Terminal URL with configuration
  const jupiterUrl = `https://jup.ag/swap/SOL-USDC?referrer=NovaArcade`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
              border: '2px solid #00ff88',
              borderRadius: 20,
              padding: '20px 20px 24px 20px',
              maxWidth: 480,
              width: '100%',
              maxHeight: '90vh',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: 16,
              paddingBottom: 16,
              borderBottom: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#00ff88', fontSize: 24, fontWeight: 700 }}>
                  ⚡ Jupiter Swap
                </h2>
                <div style={{ fontSize: 11, color: '#8af0ff', marginTop: 4 }}>
                  🟢 Real swaps powered by Jupiter Aggregator
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 28,
                  cursor: 'pointer',
                  padding: 0,
                  width: 36,
                  height: 36
                }}
              >
                ×
              </button>
            </div>

            {/* Jupiter Widget - Real swaps, bypasses CORS */}
            <div style={{ flex: 1, position: 'relative', minHeight: 550 }}>
              {!isLoaded && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1a1f3a',
                  borderRadius: 12
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: 40, 
                      marginBottom: 12,
                      animation: 'spin 2s linear infinite',
                      display: 'inline-block'
                    }}>
                      ⚡
                    </div>
                    <div style={{ color: '#00ff88', fontSize: 14 }}>Loading Jupiter...</div>
                  </div>
                </div>
              )}
              
              <iframe
                src={jupiterUrl}
                onLoad={() => setIsLoaded(true)}
                style={{
                  width: '100%',
                  height: '550px',
                  border: 'none',
                  borderRadius: 12,
                  background: '#1a1f3a',
                  display: isLoaded ? 'block' : 'none'
                }}
                title="Jupiter Swap"
                allow="clipboard-write"
              />
            </div>

            {/* Footer Info */}
            <div style={{ 
              textAlign: 'center', 
              paddingTop: 16,
              paddingBottom: 4,
              marginTop: 16,
              borderTop: '1px solid rgba(0, 255, 136, 0.2)',
              fontSize: 11,
              color: '#8af0ff'
            }}>
              <div style={{ marginBottom: 6 }}>
                Secure swaps • Best rates • Low fees
              </div>
              <div style={{ opacity: 0.7 }}>
                Powered by Jupiter Aggregator V6
              </div>
            </div>

            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
