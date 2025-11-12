import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface SwapInterfaceProps {
  open: boolean;
  onClose: () => void;
  onSwapComplete?: (amount: number) => void;
}

// Placeholder rates until real DEX integration
const SWAP_RATES = {
  USDC_TO_NAG: 10, // 1 USDC = 10 NAG
  USDT_TO_NAG: 10, // 1 USDT = 10 NAG
  NAG_TO_USDC: 0.1, // 1 NAG = 0.1 USDC
  NAG_TO_USDT: 0.1, // 1 NAG = 0.1 USDT
};

export default function SwapInterface({ open, onClose, onSwapComplete }: SwapInterfaceProps) {
  const { publicKey, connected } = useWallet();
  const [swapMode, setSwapMode] = useState<'BUY' | 'SELL'>('BUY');
  const [fromToken, setFromToken] = useState<'USDC' | 'USDT' | 'NAG'>('USDC');
  const [toToken, setToToken] = useState<'NAG' | 'USDC' | 'USDT'>('NAG');
  const [fromAmount, setFromAmount] = useState<string>('100');
  const [toAmount, setToAmount] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState(1); // 1% default slippage

  useEffect(() => {
    calculateSwap();
  }, [fromAmount, fromToken, toToken]);

  const calculateSwap = () => {
    const amount = parseFloat(fromAmount) || 0;
    let result = 0;

    if (fromToken === 'USDC' && toToken === 'NAG') {
      result = amount * SWAP_RATES.USDC_TO_NAG;
    } else if (fromToken === 'USDT' && toToken === 'NAG') {
      result = amount * SWAP_RATES.USDT_TO_NAG;
    } else if (fromToken === 'NAG' && toToken === 'USDC') {
      result = amount * SWAP_RATES.NAG_TO_USDC;
    } else if (fromToken === 'NAG' && toToken === 'USDT') {
      result = amount * SWAP_RATES.NAG_TO_USDT;
    }

    // Apply slippage
    result = result * (1 - slippage / 100);
    setToAmount(result.toFixed(2));
  };

  const handleSwap = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(true);
    
    // Simulate swap transaction
    setTimeout(() => {
      setLoading(false);
      if (onSwapComplete) {
        onSwapComplete(parseFloat(toAmount));
      }
      alert(`Swapped ${fromAmount} ${fromToken} for ${toAmount} ${toToken}`);
      onClose();
    }, 2000);
  };

  const flipTokens = () => {
    const tempFrom = fromToken;
    const tempTo = toToken;
    
    if (tempFrom === 'NAG') {
      setFromToken(tempTo as 'USDC' | 'USDT' | 'NAG');
      setToToken('NAG');
    } else if (tempTo === 'NAG') {
      setFromToken('NAG');
      setToToken(tempFrom as 'USDC' | 'USDT');
    } else {
      setFromToken(tempTo as 'USDC' | 'USDT');
      setToToken(tempFrom === 'USDC' ? 'USDT' : 'USDC');
    }
    
    setFromAmount(toAmount);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900/90 via-black to-blue-900/90 rounded-2xl p-6 max-w-md w-full border border-purple-500/50 shadow-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}>
                TOKEN SWAP
              </h2>
              <p className="text-cyan-300 text-sm mt-1">Instant swap between USDC/USDT and $NAG</p>
            </div>
            <button
              onClick={onClose}
              className="text-2xl text-white/60 hover:text-white transition-all hover:rotate-90 duration-300"
            >
              ✕
            </button>
          </div>

          {/* Swap Mode Selector */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                setSwapMode('BUY');
                setFromToken('USDC');
                setToToken('NAG');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                swapMode === 'BUY' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' 
                  : 'bg-black/30 text-gray-400 border border-gray-600'
              }`}
            >
              BUY $NAG
            </button>
            <button
              onClick={() => {
                setSwapMode('SELL');
                setFromToken('NAG');
                setToToken('USDC');
              }}
              className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${
                swapMode === 'SELL' 
                  ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                  : 'bg-black/30 text-gray-400 border border-gray-600'
              }`}
            >
              SELL $NAG
            </button>
          </div>

          {/* From Token */}
          <div className="bg-black/40 rounded-xl p-4 mb-2">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">From</span>
              <span className="text-gray-400 text-sm">Balance: 1,000</span>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                value={fromAmount}
                onChange={(e) => setFromAmount(e.target.value)}
                className="flex-1 bg-transparent text-white text-2xl outline-none"
                placeholder="0.0"
              />
              <select
                value={fromToken}
                onChange={(e) => setFromToken(e.target.value as any)}
                className="bg-purple-900/50 text-white px-3 py-1 rounded-lg border border-purple-500/50"
                style={{ fontFamily: '"Orbitron", sans-serif' }}
              >
                {swapMode === 'BUY' ? (
                  <>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </>
                ) : (
                  <option value="NAG">$NAG</option>
                )}
              </select>
            </div>
          </div>

          {/* Swap Arrow */}
          <div className="flex justify-center my-2">
            <button
              onClick={flipTokens}
              className="bg-purple-600 hover:bg-purple-500 p-2 rounded-full transition-all hover:rotate-180 duration-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M7 10l5 5 5-5H7z"/>
                <path d="M7 14l5-5 5 5H7z"/>
              </svg>
            </button>
          </div>

          {/* To Token */}
          <div className="bg-black/40 rounded-xl p-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-400 text-sm">To (estimated)</span>
              <span className="text-gray-400 text-sm">Balance: 0</span>
            </div>
            <div className="flex gap-3">
              <input
                type="number"
                value={toAmount}
                readOnly
                className="flex-1 bg-transparent text-white text-2xl outline-none"
                placeholder="0.0"
              />
              <div className="bg-purple-900/50 text-white px-3 py-1 rounded-lg border border-purple-500/50"
                   style={{ fontFamily: '"Orbitron", sans-serif' }}>
                {toToken}
              </div>
            </div>
          </div>

          {/* Swap Info */}
          <div className="bg-black/30 rounded-lg p-3 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">1 {fromToken} = {fromToken === 'NAG' ? 0.1 : 10} {toToken}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slippage Tolerance</span>
              <div className="flex gap-2">
                {[0.5, 1, 2].map(s => (
                  <button
                    key={s}
                    onClick={() => setSlippage(s)}
                    className={`px-2 py-1 rounded text-xs ${
                      slippage === s 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-black/50 text-gray-400'
                    }`}
                  >
                    {s}%
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Network Fee</span>
              <span className="text-yellow-400">~0.002 SOL</span>
            </div>
          </div>

          {/* Swap Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSwap}
            disabled={loading || !connected || parseFloat(fromAmount) <= 0}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⚡</span>
                SWAPPING...
              </span>
            ) : connected ? (
              `SWAP ${fromAmount} ${fromToken} FOR ${toAmount} ${toToken}`
            ) : (
              'CONNECT WALLET FIRST'
            )}
          </motion.button>

          {/* Warning */}
          <div className="mt-4 p-3 bg-yellow-900/30 rounded-lg border border-yellow-500/30">
            <p className="text-yellow-400 text-xs">
              ⚠️ $NAG token has not launched yet. This is a demo interface showing future functionality.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
