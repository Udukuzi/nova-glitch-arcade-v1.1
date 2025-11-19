/**
 * PumpFunPaymentModal Component
 * React component for Jupiter + Pump.fun token swaps with real-time quotes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { PumpFunPayment, QuoteResponse } from '../lib/jupiterPumpFunPayment';
import { SUPPORTED_TOKENS } from '../config/tokens';

interface PumpFunPaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSwapComplete?: (signature: string) => void;
}

interface Token {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export default function PumpFunPaymentModal({ 
  open, 
  onClose, 
  onSwapComplete 
}: PumpFunPaymentModalProps) {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  // State - Start with SOL → USDC (known working pair)
  const [inputToken, setInputToken] = useState<Token>(SUPPORTED_TOKENS[0]); // SOL
  const [outputToken, setOutputToken] = useState<Token>(SUPPORTED_TOKENS[1]); // USDC
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [error, setError] = useState('');
  const [preBonded, setPreBonded] = useState<boolean | null>(null);
  
  // Payment system instance
  const [paymentSystem, setPaymentSystem] = useState<PumpFunPayment | null>(null);

  // Initialize payment system
  useEffect(() => {
    if (connection && wallet) {
      const system = new PumpFunPayment(connection, wallet, {
        metisApiKey: import.meta.env.VITE_METIS_API_KEY || '',
        priorityFee: 100000
      });
      setPaymentSystem(system);
    }
  }, [connection, wallet]);

  // Check if token is pre-bonded (disabled due to RPC issues)
  useEffect(() => {
    // Disable pre-bonded checking for now due to RPC 403 errors
    setPreBonded(outputToken.symbol === 'NAG' ? true : false);
    console.log(`${outputToken.symbol} assumed ${outputToken.symbol === 'NAG' ? 'pre-bonded' : 'post-bonded'}`);
  }, [outputToken]);

  // Fetch quote with debouncing
  useEffect(() => {
    const fetchQuote = async () => {
      if (!paymentSystem || !inputAmount || !inputToken || !outputToken || parseFloat(inputAmount) <= 0) {
        setQuote(null);
        setOutputAmount('');
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const amount = PumpFunPayment.parseAmount(inputAmount, inputToken.decimals);
        
        console.log('🔍 Quote Request:', {
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          amount: amount,
          inputSymbol: inputToken.symbol,
          outputSymbol: outputToken.symbol
        });

        // Use backend proxy to avoid CORS issues
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        const params = new URLSearchParams({
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          amount: amount.toString(),
          slippageBps: '100'
        });

        const response = await fetch(`${apiBase}/jupiter/quote?${params}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Backend API error: ${response.status}`);
        }

        const jupiterQuote = await response.json();
        console.log('✅ Backend Proxy Quote Response:', jupiterQuote);
        
        // Create unified quote response
        const unifiedQuote = {
          inputMint: inputToken.mint,
          outputMint: outputToken.mint,
          inAmount: jupiterQuote.inAmount,
          outAmount: jupiterQuote.outAmount,
          priceImpactPct: jupiterQuote.priceImpactPct,
          slippageBps: 100,
          source: 'jupiter' as const,
          raw: jupiterQuote
        };
        
        setQuote(unifiedQuote);
        const output = PumpFunPayment.formatAmount(jupiterQuote.outAmount, outputToken.decimals);
        setOutputAmount(output);
      } catch (err) {
        console.error('💥 Quote error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        // Check if it's a NAG token issue and suggest alternatives
        if (outputToken.symbol === 'NAG') {
          setError(`NAG token may not be indexed by Jupiter yet. Try SOL or USDC for now.`);
        } else if (errorMessage.includes('No routes found') || errorMessage.includes('Token not found')) {
          setError(`${outputToken.symbol} token not found on Jupiter`);
        } else if (errorMessage.includes('Insufficient liquidity')) {
          setError('Insufficient liquidity. Try a smaller amount.');
        } else if (errorMessage.includes('400')) {
          setError('Invalid token pair or amount. Try different tokens.');
        } else {
          setError(`Quote failed: ${errorMessage.slice(0, 100)}`);
        }
        
        setQuote(null);
        setOutputAmount('');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [paymentSystem, inputAmount, inputToken, outputToken]);

  // Handle token swap
  const handleSwap = async () => {
    if (!quote || !wallet.connected || !wallet.signTransaction) {
      return;
    }

    setSwapping(true);
    setError('');

    try {
      // Use backend proxy for swap
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
      
      console.log('🔄 Backend Proxy Swap:', {
        from: `${inputAmount} ${inputToken.symbol}`,
        to: `${outputAmount} ${outputToken.symbol}`,
        wallet: wallet.publicKey!.toBase58()
      });

      const swapRequest = {
        quoteResponse: quote.raw,
        userPublicKey: wallet.publicKey!.toBase58(),
        wrapAndUnwrapSol: true,
        prioritizationFeeLamports: 100000
      };

      const response = await fetch(`${apiBase}/jupiter/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(swapRequest)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Backend Swap API error: ${response.status}`);
      }

      const swapResponse = await response.json();
      
      // Deserialize and sign transaction
      const txBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuf);
      
      const signedTx = await wallet.signTransaction(transaction);
      
      // Submit transaction
      const signature = await connection.sendRawTransaction(signedTx.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });

      console.log('✅ Real Swap completed:', signature);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      onSwapComplete?.(signature);
      onClose();
    } catch (err) {
      console.error('Swap error:', err);
      setError(err instanceof Error ? err.message : 'Swap failed');
    } finally {
      setSwapping(false);
    }
  };

  // Flip tokens
  const flipTokens = useCallback(() => {
    setInputToken(outputToken);
    setOutputToken(inputToken);
    setInputAmount(outputAmount);
    setOutputAmount('');
  }, [inputToken, outputToken, outputAmount]);

  // Available tokens (filter out the selected output token from input options)
  const availableInputTokens = SUPPORTED_TOKENS.filter(t => t.mint !== outputToken.mint);
  const availableOutputTokens = SUPPORTED_TOKENS.filter(t => t.mint !== inputToken.mint);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a2332 50%, #0a0a0a 100%)',
              border: '2px solid #00ff88',
              borderRadius: 24,
              padding: 32,
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h2 style={{ 
                  fontFamily: 'Orbitron, sans-serif', 
                  fontSize: 28, 
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #00ff88, #8af0ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  marginBottom: 4
                }}>
                  JUPITER SWAP
                </h2>
                {preBonded !== null && (
                  <div style={{ 
                    fontSize: 12, 
                    color: preBonded ? '#ff6b35' : '#00ff88',
                    fontFamily: 'Rajdhani, sans-serif'
                  }}>
                    {preBonded ? '🔥 Pre-bonded (Pump.fun)' : '✅ Post-bonded (Raydium/Orca)'}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00ff88',
                  fontSize: 32,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Input Token */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: '#00ff88', fontSize: 14 }}>From</label>
                <select
                  value={inputToken.mint}
                  onChange={(e) => {
                    const token = availableInputTokens.find(t => t.mint === e.target.value);
                    if (token) setInputToken(token);
                  }}
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#eaeaf0',
                    padding: '4px 8px',
                    fontSize: 12,
                    fontFamily: 'Orbitron, sans-serif',
                    outline: 'none'
                  }}
                >
                  {availableInputTokens.map(token => (
                    <option key={token.mint} value={token.mint} style={{ background: '#1a2332' }}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                disabled={swapping}
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid #00ff88',
                  borderRadius: 12,
                  color: '#eaeaf0',
                  fontSize: 18,
                  fontFamily: 'Orbitron, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            {/* Flip Button */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <button
                onClick={flipTokens}
                disabled={swapping}
                style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid #00ff88',
                  borderRadius: '50%',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: 18, transform: 'rotate(90deg)' }}>⇄</span>
              </button>
            </div>

            {/* Output Token */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: '#00ff88', fontSize: 14 }}>To</label>
                <select
                  value={outputToken.mint}
                  onChange={(e) => {
                    const token = availableOutputTokens.find(t => t.mint === e.target.value);
                    if (token) setOutputToken(token);
                  }}
                  style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid #00ff88',
                    borderRadius: 8,
                    color: '#eaeaf0',
                    padding: '4px 8px',
                    fontSize: 12,
                    fontFamily: 'Orbitron, sans-serif',
                    outline: 'none'
                  }}
                >
                  {availableOutputTokens.map(token => (
                    <option key={token.mint} value={token.mint} style={{ background: '#1a2332' }}>
                      {token.symbol}
                    </option>
                  ))}
                </select>
              </div>
              <input
                type="text"
                value={loading ? 'Getting quote...' : error ? '' : outputAmount}
                readOnly
                placeholder={error ? error : "0.00"}
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: `1px solid ${error ? '#ff4444' : '#00ff88'}`,
                  borderRadius: 12,
                  color: error ? '#ff4444' : '#eaeaf0',
                  fontSize: 18,
                  fontFamily: 'Orbitron, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            {/* Quote Info */}
            {quote && !error && !loading && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                background: 'rgba(0, 255, 136, 0.05)', 
                border: '1px solid #00ff88', 
                borderRadius: 8,
                fontSize: 12,
                color: '#00ff88'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Source:</span>
                  <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>
                    {quote.source === 'pumpfun' ? 'Pump.fun 🔥' : 'Jupiter ⚡'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Rate:</span>
                  <span>1 {inputToken.symbol} ≈ {outputAmount && inputAmount ? (parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(6) : '0'} {outputToken.symbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Price Impact:</span>
                  <span style={{ color: parseFloat(quote.priceImpactPct) > 5 ? '#ff6b35' : '#00ff88' }}>
                    {parseFloat(quote.priceImpactPct).toFixed(2)}%
                  </span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                background: 'rgba(255, 68, 68, 0.1)', 
                border: '1px solid #ff4444', 
                borderRadius: 8,
                color: '#ff4444',
                fontSize: 14,
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!wallet.connected || !inputAmount || !quote || swapping || loading}
              style={{
                width: '100%',
                padding: 16,
                background: (wallet.connected && inputAmount && quote && !swapping && !loading)
                  ? 'linear-gradient(135deg, #00ff88, #8af0ff)' 
                  : 'rgba(0, 255, 136, 0.3)',
                border: 'none',
                borderRadius: 12,
                color: '#000',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: (wallet.connected && inputAmount && quote && !swapping && !loading) ? 'pointer' : 'not-allowed',
                fontFamily: 'Orbitron, sans-serif',
                opacity: (wallet.connected && inputAmount && quote && !swapping && !loading) ? 1 : 0.5,
                boxShadow: (wallet.connected && inputAmount && quote && !swapping && !loading) ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none'
              }}
            >
              {!wallet.connected ? 'Connect Wallet' :
               swapping ? 'Swapping...' :
               !inputAmount ? 'Enter Amount' :
               loading ? 'Getting Quote...' :
               !quote ? 'No Quote Available' :
               'SWAP NOW'}
            </button>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 4 }}>
                ⚡ LIVE MODE - Real Jupiter V6 quotes and swaps
              </div>
              <span style={{ color: '#8af0ff', fontSize: 12, opacity: 0.7 }}>
                Powered by Jupiter Aggregator V6 API
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
