import { useState, useEffect } from 'react';
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
  
  const [inputToken, setInputToken] = useState<Token>(SUPPORTED_TOKENS[1]); // USDC
  const [outputToken, setOutputToken] = useState<Token>(NAG_TOKEN);
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [swapping, setSwapping] = useState(false);
  const [slippageBps, setSlippageBps] = useState(50); // 0.5%
  const [error, setError] = useState<string | null>(null);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [showSettings, setShowSettings] = useState(false);
  
  const debouncedInputAmount = useDebounce(inputAmount, 500);

  useEffect(() => {
    const fetchPrices = async () => {
      const tokenMints = SUPPORTED_TOKENS.map(t => t.mint);
      const tokenPrices = await getTokenPrices(tokenMints);
      setPrices(tokenPrices);
    };
    
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!debouncedInputAmount || parseFloat(debouncedInputAmount) <= 0) {
        setQuote(null);
        setOutputAmount('');
        return;
      }

      if (!publicKey) {
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
        setError('Unable to fetch quote');
        setQuote(null);
        setOutputAmount('');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [debouncedInputAmount, inputToken, outputToken, slippageBps, publicKey]);

  const handleSwap = async () => {
    if (!quote || !publicKey || !signTransaction) {
      setError('Missing requirements for swap');
      return;
    }

    setSwapping(true);
    setError(null);
    
    try {
      soundManager.playClick();
      
      const swapResponse = await getSwapTransaction(
        quote,
        publicKey.toBase58(),
        100000
      );
      
      const swapTxBuf = Buffer.from(swapResponse.swapTransaction, 'base64');
      const tx = VersionedTransaction.deserialize(swapTxBuf);
      const signedTx = await signTransaction(tx);
      
      const signature = await submitTransaction(
        Buffer.from(signedTx.serialize()).toString('base64')
      );
      
      soundManager.playSuccess();
      
      const swappedAmount = parseFloat(outputAmount);
      if (onSwapComplete) {
        onSwapComplete(swappedAmount);
      }
      
      setInputAmount('');
      setOutputAmount('');
      setQuote(null);
      
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

  const flipTokens = () => {
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
    setOutputAmount('');
    setQuote(null);
    soundManager.playClick();
  };

  const getUsdValue = (token: Token, amount: string): string => {
    const price = prices[token.mint] || 0;
    const value = parseFloat(amount) * price;
    return value > 0 ? `$${value.toFixed(2)}` : '';
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
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50"
          />
          
          {/* Modal - Centered and Professional */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black w-full max-w-md rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-purple-500/20">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <span className="text-white font-bold">J</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Jupiter Exchange</h2>
                      <p className="text-xs text-gray-400">Powered by Jupiter Aggregator V6</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-gray-800/50 hover:bg-gray-700/50 flex items-center justify-center transition-all"
                  >
                    <span className="text-gray-400 hover:text-white text-2xl">×</span>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* From Token */}
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-2 border border-gray-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">You pay</span>
                    {inputAmount && (
                      <span className="text-xs text-gray-400">{getUsdValue(inputToken, inputAmount)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      placeholder="0.00"
                      disabled={swapping}
                      className="flex-1 bg-transparent text-3xl text-white outline-none placeholder-gray-600"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    />
                    <button
                      onClick={() => {/* Token selector */}}
                      className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                      <span className="text-white font-semibold">{inputToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-gray-500">Balance: 0.00</span>
                    <div className="flex gap-2">
                      <button className="text-xs text-purple-400 hover:text-purple-300">MAX</button>
                      <button className="text-xs text-purple-400 hover:text-purple-300">HALF</button>
                    </div>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={flipTokens}
                    className="bg-gray-800 hover:bg-gray-700 border-4 border-gray-900 rounded-xl p-2 transition-all transform hover:rotate-180 duration-300"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 10L12 5L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M17 14L12 19L7 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>

                {/* To Token */}
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50 hover:border-purple-500/30 transition-all">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">You receive</span>
                    {outputAmount && (
                      <span className="text-xs text-gray-400">{getUsdValue(outputToken, outputAmount)}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={loading ? 'Fetching best price...' : outputAmount}
                      readOnly
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-3xl text-white outline-none placeholder-gray-600"
                      style={{ fontFamily: '"Inter", sans-serif' }}
                    />
                    <button
                      onClick={() => {/* Token selector */}}
                      className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-xl transition-all"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                      <span className="text-white font-semibold">{outputToken.symbol}</span>
                      <span className="text-gray-400">▼</span>
                    </button>
                  </div>
                </div>

                {/* Route Info */}
                {quote && (
                  <div className="bg-gray-800/30 rounded-xl p-3 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white">
                        1 {inputToken.symbol} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4)} {outputToken.symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Price Impact</span>
                      <span className={`${parseFloat(quote.priceImpactPct) < 1 ? 'text-green-400' : parseFloat(quote.priceImpactPct) < 3 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {parseFloat(quote.priceImpactPct).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white">~$0.05</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Route</span>
                      <span className="text-white">{quote.routePlan?.length || 1} hop(s)</span>
                    </div>
                  </div>
                )}

                {/* Settings Row */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-gray-400 hover:text-white text-sm flex items-center gap-1 transition-all"
                  >
                    ⚙️ Slippage: {slippageBps / 100}%
                  </button>
                  <button className="text-gray-400 hover:text-white text-sm transition-all">
                    Refresh prices
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={!quote || swapping || !connected || !inputAmount}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all transform hover:scale-[1.02] ${
                    !connected ? 'bg-gray-700 text-gray-400' :
                    swapping ? 'bg-purple-600/50 text-white animate-pulse' :
                    !inputAmount ? 'bg-gray-700 text-gray-400' :
                    loading ? 'bg-purple-600/50 text-white' :
                    'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30'
                  } disabled:cursor-not-allowed disabled:transform-none`}
                >
                  {!connected ? 'Connect Wallet' :
                   swapping ? 'Swapping...' :
                   !inputAmount ? 'Enter Amount' :
                   loading ? 'Fetching Quote...' :
                   'Swap'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
