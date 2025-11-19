/**
 * PRODUCTION Jupiter Swap Modal - REAL QUOTES & SWAPS
 * Uses direct Jupiter V6 API calls - NO MOCKS, NO DEMOS
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { getQuote, getSwapTransaction, formatAmount, parseAmount, type QuoteResponse } from '../lib/jupiter';
import { SUPPORTED_TOKENS } from '../config/tokens';

interface JupiterSwapProductionProps {
  isOpen: boolean;
  onClose: () => void;
  onSwapComplete?: (signature: string) => void;
}

export function JupiterSwapProduction({ isOpen, onClose, onSwapComplete }: JupiterSwapProductionProps) {
  const wallet = useWallet();
  const { connection } = useConnection();
  
  const [inputToken, setInputToken] = useState(SUPPORTED_TOKENS[0]); // SOL
  const [outputToken, setOutputToken] = useState(SUPPORTED_TOKENS[1]); // USDC
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');

  // Fetch real-time quote from Jupiter
  const fetchQuote = useCallback(async () => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setOutputAmount('');
      setQuote(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amountInSmallestUnit = parseAmount(inputAmount, inputToken.decimals);
      
      console.log('📡 Fetching REAL Jupiter quote...');
      const quoteResponse = await getQuote(
        inputToken.mint,
        outputToken.mint,
        amountInSmallestUnit,
        100 // 1% slippage
      );
      
      setQuote(quoteResponse);
      const output = formatAmount(quoteResponse.outAmount, outputToken.decimals);
      setOutputAmount(output);
      console.log('✅ Real quote received:', { input: inputAmount, output });
    } catch (err: any) {
      console.error('❌ Quote error:', err);
      setError(err.message || 'Failed to get quote');
      setOutputAmount('');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  }, [inputAmount, inputToken, outputToken]);

  // Debounce quote fetching
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchQuote();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchQuote]);

  // Execute REAL swap
  const handleSwap = async () => {
    if (!quote || !wallet.publicKey || !wallet.signTransaction) {
      return;
    }

    setSwapping(true);
    setError('');

    try {
      console.log('🔄 Executing REAL swap via Jupiter...');
      
      // Get swap transaction from Jupiter
      const swapResponse = await getSwapTransaction(
        quote,
        wallet.publicKey.toBase58(),
        100000 // priority fee
      );

      // Deserialize transaction
      const txBuffer = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuffer);

      // Sign transaction with wallet
      const signedTx = await wallet.signTransaction(transaction);

      // Submit to blockchain
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        maxRetries: 3,
        preflightCommitment: 'confirmed'
      });

      console.log('⏳ Waiting for confirmation...');
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature, 'confirmed');
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log('✅ REAL swap completed!', signature);
      
      onSwapComplete?.(signature);
      onClose();
      
    } catch (err: any) {
      console.error('❌ Swap error:', err);
      setError(err.message || 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  // Flip tokens
  const handleFlip = () => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount('');
    setOutputAmount('');
    setQuote(null);
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
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
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
              padding: 28,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 0 50px rgba(0, 255, 136, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ margin: 0, color: '#00ff88', fontSize: 26, fontWeight: 700 }}>
                  ⚡ Jupiter Swap
                </h2>
                <div style={{ fontSize: 12, color: '#8af0ff', marginTop: 4 }}>
                  🟢 LIVE PRODUCTION MODE
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

            {/* From Token */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#8af0ff', fontSize: 13, fontWeight: 600 }}>
                You Pay
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={inputToken.symbol}
                  onChange={(e) => {
                    const token = SUPPORTED_TOKENS.find(t => t.symbol === e.target.value);
                    if (token && token.symbol !== outputToken.symbol) setInputToken(token);
                  }}
                  style={{
                    flex: '0 0 130px',
                    padding: '14px 16px',
                    background: '#1a1f3a',
                    border: '1.5px solid #00ff88',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {SUPPORTED_TOKENS.map(token => (
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
                    padding: '14px 16px',
                    background: '#1a1f3a',
                    border: '1.5px solid #00ff88',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 18,
                    fontWeight: 500
                  }}
                />
              </div>
            </div>

            {/* Flip Button */}
            <div style={{ textAlign: 'center', margin: '12px 0' }}>
              <button
                onClick={handleFlip}
                style={{
                  background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                  border: 'none',
                  borderRadius: 10,
                  width: 44,
                  height: 44,
                  cursor: 'pointer',
                  fontSize: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  color: '#000',
                  fontWeight: 700
                }}
              >
                ⇅
              </button>
            </div>

            {/* To Token */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, color: '#8af0ff', fontSize: 13, fontWeight: 600 }}>
                You Receive {loading && <span style={{ opacity: 0.7 }}>(updating...)</span>}
              </label>
              <div style={{ display: 'flex', gap: 10 }}>
                <select
                  value={outputToken.symbol}
                  onChange={(e) => {
                    const token = SUPPORTED_TOKENS.find(t => t.symbol === e.target.value);
                    if (token && token.symbol !== inputToken.symbol) setOutputToken(token);
                  }}
                  style={{
                    flex: '0 0 130px',
                    padding: '14px 16px',
                    background: '#1a1f3a',
                    border: '1.5px solid #00ff88',
                    borderRadius: 10,
                    color: '#fff',
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {SUPPORTED_TOKENS.map(token => (
                    <option key={token.symbol} value={token.symbol}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={outputAmount}
                  disabled
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    padding: '14px 16px',
                    background: '#0a0e27',
                    border: '1.5px solid #00ff88',
                    borderRadius: 10,
                    color: '#00ff88',
                    fontSize: 18,
                    fontWeight: 600
                  }}
                />
              </div>
            </div>

            {/* Quote Info */}
            {quote && (
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid #00ff88',
                borderRadius: 10,
                padding: 14,
                marginBottom: 16,
                fontSize: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: '#8af0ff' }}>Price Impact:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>{(parseFloat(quote.priceImpactPct) * 100).toFixed(4)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8af0ff' }}>Route:</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>
                    {quote.routePlan.length} step{quote.routePlan.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                background: 'rgba(255, 51, 51, 0.15)',
                border: '1px solid #ff3333',
                color: '#ff6666',
                padding: 14,
                borderRadius: 10,
                marginBottom: 16,
                fontSize: 13,
                fontWeight: 500
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!wallet.connected || swapping || loading || !quote || !inputAmount}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: (!wallet.connected || swapping || loading || !quote || !inputAmount)
                  ? '#333'
                  : 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                color: (!wallet.connected || swapping || loading || !quote || !inputAmount) ? '#666' : '#000',
                border: 'none',
                borderRadius: 12,
                fontSize: 18,
                fontWeight: 700,
                cursor: (!wallet.connected || swapping || loading || !quote || !inputAmount)
                  ? 'not-allowed'
                  : 'pointer',
                transition: 'all 0.3s ease',
                marginBottom: 16,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {!wallet.connected ? '🔌 Connect Wallet' :
               swapping ? '⏳ Swapping...' :
               loading ? '🔄 Getting Quote...' :
               !inputAmount ? '💰 Enter Amount' :
               !quote ? '❌ No Route Available' :
               '⚡ Execute Swap'}
            </button>

            {/* Footer */}
            <div style={{ textAlign: 'center', paddingTop: 12, borderTop: '1px solid rgba(0, 255, 136, 0.2)' }}>
              <div style={{ color: '#00ff88', fontSize: 13, marginBottom: 4, fontWeight: 600 }}>
                ⚡ Powered by Jupiter Aggregator V6
              </div>
              <div style={{ color: '#8af0ff', fontSize: 11, opacity: 0.8 }}>
                Real-time quotes • Best execution • Secure on-chain swaps
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
