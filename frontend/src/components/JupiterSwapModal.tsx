/**
 * Jupiter Swap Modal using Official Jupiter React Hook
 * This approach bypasses all CORS issues by using Jupiter's SDK
 */

import React, { useState, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useJupiter } from '@jup-ag/react-hook';
import { NAG_TOKEN } from '../config/tokens';

interface JupiterSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwapComplete?: (signature: string) => void;
}

const TOKENS = [
  {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
    name: 'Solana'
  },
  {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
    name: 'USD Coin'
  },
  {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
    name: 'Tether USD'
  },
  {
    symbol: 'NAG',
    mint: NAG_TOKEN.mint,
    decimals: 6,
    name: 'Nova Arcade Glitch'
  }
];

export function JupiterSwapModal({ isOpen, onClose, onSwapComplete }: JupiterSwapModalProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  const [inputToken, setInputToken] = useState(TOKENS[0]); // SOL
  const [outputToken, setOutputToken] = useState(TOKENS[1]); // USDC
  const [inputAmount, setInputAmount] = useState('');
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');

  // Convert input amount to lamports/smallest unit
  const amountInSmallestUnit = useMemo(() => {
    if (!inputAmount || isNaN(parseFloat(inputAmount))) return 0;
    return Math.floor(parseFloat(inputAmount) * Math.pow(10, inputToken.decimals));
  }, [inputAmount, inputToken.decimals]);

  // Initialize Jupiter hook
  const jupiter = useJupiter({
    connection,
    cluster: 'mainnet-beta',
    user: wallet.publicKey || undefined,
    inputMint: new PublicKey(inputToken.mint),
    outputMint: new PublicKey(outputToken.mint),
    amount: amountInSmallestUnit,
    slippageBps: 100, // 1% slippage
    debounceTime: 250,
  });

  const { routes, loading, exchange, error: jupiterError } = jupiter;

  // Format output amount
  const outputAmount = useMemo(() => {
    if (!routes || routes.length === 0) return '';
    const bestRoute = routes[0];
    const amount = Number(bestRoute.outAmount) / Math.pow(10, outputToken.decimals);
    return amount.toFixed(6);
  }, [routes, outputToken.decimals]);

  // Handle swap execution
  const handleSwap = async () => {
    if (!routes || routes.length === 0 || !wallet.signTransaction) {
      return;
    }

    setSwapping(true);
    setError('');

    try {
      console.log('🔄 Executing Swap via Jupiter SDK');
      
      const { execute } = exchange;
      if (!execute) {
        throw new Error('Exchange not ready');
      }

      const result = await execute({
        route: routes[0],
        userPublicKey: wallet.publicKey!,
      });

      if (result.error) {
        throw new Error(result.error.message || 'Swap failed');
      }

      console.log('✅ Swap Successful:', result.txid);
      onSwapComplete?.(result.txid);
      onClose();
      
    } catch (err: any) {
      console.error('❌ Swap Error:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  // Flip input and output tokens
  const handleFlip = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount('');
  };

  if (!isOpen) return null;

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
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
              borderRadius: 16,
              padding: 24,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ margin: 0, color: '#00ff88', fontSize: 24, fontWeight: 700 }}>
                ⚡ Jupiter Swap
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer',
                  padding: 0,
                  width: 32,
                  height: 32
                }}
              >
                ×
              </button>
            </div>

            {/* Input Token */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#8af0ff', fontSize: 14 }}>
                From
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={inputToken.symbol}
                  onChange={(e) => {
                    const token = TOKENS.find(t => t.symbol === e.target.value);
                    if (token) setInputToken(token);
                  }}
                  style={{
                    flex: '0 0 120px',
                    padding: '12px 16px',
                    background: '#1a1f3a',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={inputAmount}
                  onChange={(e) => setInputAmount(e.target.value)}
                  placeholder="0.00"
                  step="any"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#1a1f3a',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 16
                  }}
                />
              </div>
            </div>

            {/* Flip Button */}
            <div style={{ textAlign: 'center', margin: '8px 0' }}>
              <button
                onClick={handleFlip}
                style={{
                  background: '#00ff88',
                  border: 'none',
                  borderRadius: 8,
                  width: 40,
                  height: 40,
                  cursor: 'pointer',
                  fontSize: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto'
                }}
              >
                ⇅
              </button>
            </div>

            {/* Output Token */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#8af0ff', fontSize: 14 }}>
                To
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  value={outputToken.symbol}
                  onChange={(e) => {
                    const token = TOKENS.find(t => t.symbol === e.target.value);
                    if (token) setOutputToken(token);
                  }}
                  style={{
                    flex: '0 0 120px',
                    padding: '12px 16px',
                    background: '#1a1f3a',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 16,
                    cursor: 'pointer'
                  }}
                >
                  {TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={loading ? 'Loading...' : outputAmount}
                  disabled
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: '#0a0e27',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#00ff88',
                    fontSize: 16
                  }}
                />
              </div>
            </div>

            {/* Route Info */}
            {routes && routes.length > 0 && (
              <div style={{
                background: '#1a1f3a',
                border: '1px solid #00ff88',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 12
              }}>
                <div style={{ color: '#8af0ff', marginBottom: 4 }}>
                  Best Route: {routes[0].marketInfos.map(m => m.label).join(' → ')}
                </div>
                <div style={{ color: '#fff' }}>
                  Price Impact: {(routes[0].priceImpactPct * 100).toFixed(4)}%
                </div>
              </div>
            )}

            {/* Error Message */}
            {(error || jupiterError) && (
              <div style={{
                background: '#ff3333',
                color: '#fff',
                padding: 12,
                borderRadius: 8,
                marginBottom: 16,
                fontSize: 14
              }}>
                {error || jupiterError?.message || 'An error occurred'}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!wallet.connected || swapping || loading || !routes || routes.length === 0 || !inputAmount}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: (!wallet.connected || swapping || loading || !routes || routes.length === 0 || !inputAmount)
                  ? '#333'
                  : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
                cursor: (!wallet.connected || swapping || loading || !routes || routes.length === 0 || !inputAmount)
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: 16
              }}
            >
              {!wallet.connected ? 'Connect Wallet' :
               swapping ? 'Swapping...' :
               loading ? 'Loading Routes...' :
               !inputAmount ? 'Enter Amount' :
               !routes || routes.length === 0 ? 'No Route Available' :
               'SWAP NOW'}
            </button>

            {/* Footer */}
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 4 }}>
                ⚡ Powered by Jupiter Aggregator V6
              </div>
              <div style={{ color: '#8af0ff', fontSize: 11, opacity: 0.7 }}>
                Real-time quotes • Best prices • Secure
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
