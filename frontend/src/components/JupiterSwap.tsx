/**
 * Jupiter Swap Widget for Nova Glitch Arcade
 * Full bidirectional swap interface using Jupiter V6
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';
import { 
  getQuote, 
  getSwapTransaction, 
  submitTransaction, 
  formatAmount, 
  parseAmount,
  getTokenPrices,
  type QuoteResponse 
} from '../lib/jupiter';
import { SUPPORTED_TOKENS, NAG_TOKEN, type Token } from '../config/tokens';
import { soundManager } from '../utils/sounds';

interface JupiterSwapProps {
  open: boolean;
  onClose: () => void;
  onSwapComplete?: (amount: number) => void;
}

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function JupiterSwap({ open, onClose, onSwapComplete }: JupiterSwapProps) {
  const { publicKey, signTransaction, connected } = useWallet();
  
  // State
  const [inputToken, setInputToken] = useState<Token>(SUPPORTED_TOKENS[1]); // USDC default
  const [outputToken, setOutputToken] = useState<Token>(NAG_TOKEN);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  const debouncedInputAmount = useDebounce(inputAmount, 500);

  // Fetch token prices
  useEffect(() => {
    const fetchPrices = async () => {
      const tokenMints = SUPPORTED_TOKENS.map(t => t.mint);
      const tokenPrices = await getTokenPrices(tokenMints);
      setPrices(tokenPrices);
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  // Fetch quote when input changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!debouncedInputAmount || parseFloat(debouncedInputAmount) <= 0) {
        setQuote(null);
        setOutputAmount('');
        return;
      }

      if (!publicKey) {
        setError('Please connect your wallet');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const amountInSmallestUnit = parseAmount(debouncedInputAmount, inputToken.decimals);
        const quoteResponse = await getQuote(
          inputToken.mint,
          outputToken.mint,
          amountInSmallestUnit,
          slippageBps
        );
        
        setQuote(quoteResponse);
        const output = formatAmount(quoteResponse.outAmount, outputToken.decimals);
        setOutputAmount(output);
      } catch (err) {
        console.error('Quote error:', err);
        setError('Failed to get quote. Please try again.');
        setQuote(null);
        setOutputAmount('');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [debouncedInputAmount, inputToken, outputToken, slippageBps, publicKey]);

  // Swap tokens
  const handleSwap = async () => {
    if (!quote || !publicKey || !signTransaction) {
      setError('Missing requirements for swap');
      return;
    }

    setSwapping(true);
    setError(null);
    
    try {
      soundManager.playClick();
      
      // Get swap transaction from Jupiter
      const swapResponse = await getSwapTransaction(
        quote,
        publicKey.toBase58(),
        100000 // Priority fee
      );
      
      // Deserialize and sign transaction
      const swapTxBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(swapTxBuf);
      const signedTx = await signTransaction(tx);
      
      // Submit transaction
      const signature = await submitTransaction(
        Buffer.from(signedTx.serialize()).toString('base64')
      );
      
      soundManager.playSuccess();
      
      // Notify parent component
      const swappedAmount = parseFloat(outputAmount);
      if (onSwapComplete) {
        onSwapComplete(swappedAmount);
      }
      
      // Reset form
      setInputAmount('');
      setOutputAmount('');
      setQuote(null);
      
      // Show success message
      alert(`Swap successful!\nTransaction: ${signature.slice(0, 8)}...${signature.slice(-8)}`);
      
      onClose();
    } catch (err: any) {
      console.error('Swap error:', err);
      soundManager.playError();
      setError(err.message || 'Swap failed. Please try again.');
    } finally {
      setSwapping(false);
    }
  };

  // Flip tokens
  const flipTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
    setOutputAmount('');
    setQuote(null);
    soundManager.playClick();
  };

  // Calculate USD values
  const getUsdValue = (token: Token, amount: string): string => {
    const price = prices[token.mint] || 0;
    const value = parseFloat(amount) * price;
    return value > 0 ? `$${value.toFixed(2)}` : '';
  };

  // Get price impact color
  const getPriceImpactColor = (impact: string): string => {
    const impactNum = parseFloat(impact);
    if (impactNum < 1) return 'text-green-400';
    if (impactNum < 3) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-purple-500/50 rounded-3xl p-6 w-full max-w-md shadow-2xl">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  JUPITER SWAP
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors text-3xl"
                >
                  ×
                </button>
              </div>

              {/* Input Token */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">From</span>
                  <span className="text-gray-400 text-sm">
                    {getUsdValue(inputToken, inputAmount)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.00"
                    disabled={swapping}
                    className="flex-1 bg-transparent text-2xl text-white outline-none"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  />
                  <select
                    value={inputToken.mint}
                    onChange={(e) => {
                      const token = SUPPORTED_TOKENS.find(t => t.mint === e.target.value);
                      if (token && token.mint !== outputToken.mint) {
                        setInputToken(token);
                      }
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded-xl outline-none cursor-pointer"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  >
                    {SUPPORTED_TOKENS.filter(t => t.mint !== outputToken.mint).map(token => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center my-2">
                <button
                  onClick={flipTokens}
                  className="p-3 bg-gray-800 hover:bg-gray-700 rounded-full transition-all transform hover:rotate-180 duration-300"
                >
                  <span className="text-2xl">↕️</span>
                </button>
              </div>

              {/* Output Token */}
              <div className="bg-gray-800/50 rounded-2xl p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400 text-sm">To</span>
                  <span className="text-gray-400 text-sm">
                    {getUsdValue(outputToken, outputAmount)}
                  </span>
                </div>
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={loading ? 'Loading...' : outputAmount}
                    readOnly
                    placeholder="0.00"
                    className="flex-1 bg-transparent text-2xl text-white outline-none"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  />
                  <select
                    value={outputToken.mint}
                    onChange={(e) => {
                      const token = SUPPORTED_TOKENS.find(t => t.mint === e.target.value);
                      if (token && token.mint !== inputToken.mint) {
                        setOutputToken(token);
                      }
                    }}
                    className="bg-gray-700 text-white px-4 py-2 rounded-xl outline-none cursor-pointer"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  >
                    {SUPPORTED_TOKENS.filter(t => t.mint !== inputToken.mint).map(token => (
                      <option key={token.mint} value={token.mint}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Swap Details */}
              {quote && (
                <div className="bg-gray-800/30 rounded-xl p-3 mb-4 text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Route</span>
                    <span className="text-white">{quote.routePlan?.length || 1} hop(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price Impact</span>
                    <span className={getPriceImpactColor(quote.priceImpactPct)}>
                      {parseFloat(quote.priceImpactPct).toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Received</span>
                    <span className="text-white">
                      {formatAmount(
                        (parseInt(quote.outAmount) * (10000 - slippageBps)) / 10000,
                        outputToken.decimals
                      )} {outputToken.symbol}
                    </span>
                  </div>
                </div>
              )}

              {/* Slippage Settings */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm">Slippage Tolerance</span>
                <div className="flex gap-2">
                  {[50, 100, 200].map((bps) => (
                    <button
                      key={bps}
                      onClick={() => setSlippageBps(bps)}
                      className={`px-3 py-1 rounded-lg text-sm font-bold transition-all ${
                        slippageBps === bps
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      {bps / 100}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!quote || swapping || !connected || !inputAmount}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
                style={{ fontFamily: '"Orbitron", sans-serif' }}
              >
                {!connected ? 'Connect Wallet' :
                 swapping ? 'Swapping...' :
                 !inputAmount ? 'Enter Amount' :
                 loading ? 'Getting Quote...' :
                 'SWAP NOW'}
              </button>

              {/* Powered by Jupiter */}
              <div className="text-center mt-4">
                <span className="text-gray-500 text-xs">Powered by Jupiter Aggregator V6</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
