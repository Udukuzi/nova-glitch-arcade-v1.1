import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { soundManager } from '../utils/sounds';

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SwapModal({ open, onClose }: SwapModalProps) {
  const { connected } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputToken, setInputToken] = useState('USDC');
  const [outputToken, setOutputToken] = useState('NAG');
  const [loading, setLoading] = useState(false);

  const tokens = ['SOL', 'USDC', 'USDT', 'NAG'];

  useEffect(() => {
    if (inputAmount && parseFloat(inputAmount) > 0) {
      setLoading(true);
      // Simulate quote fetching
      const timer = setTimeout(() => {
        const rate = inputToken === 'USDC' ? 10 : inputToken === 'SOL' ? 500 : 10;
        setOutputAmount((parseFloat(inputAmount) * rate).toFixed(2));
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setOutputAmount('');
    }
  }, [inputAmount, inputToken, outputToken]);

  const handleSwap = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    soundManager.playClick();
    console.log('Swapping:', inputAmount, inputToken, 'for', outputAmount, outputToken);
    // Implement actual swap logic
  };

  const flipTokens = () => {
    soundManager.playClick();
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-b from-gray-900 to-black w-full max-w-md rounded-3xl shadow-2xl border border-purple-500/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-purple-500/20">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <span className="text-3xl">🔄</span>
                      Jupiter Swap
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Powered by Jupiter Aggregator V6</p>
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
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-2 border border-gray-700/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">You pay</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-3xl text-white outline-none placeholder-gray-600"
                    />
                    <select
                      value={inputToken}
                      onChange={(e) => setInputToken(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-xl outline-none cursor-pointer"
                    >
                      {tokens.filter(t => t !== outputToken).map(token => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-2 relative z-10">
                  <button
                    onClick={flipTokens}
                    className="bg-gray-800 hover:bg-gray-700 border-4 border-gray-900 rounded-xl p-2 transition-all transform hover:rotate-180 duration-300"
                  >
                    <span className="text-2xl">↕️</span>
                  </button>
                </div>

                {/* To Token */}
                <div className="bg-gray-800/50 rounded-2xl p-4 mb-4 border border-gray-700/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">You receive</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="text"
                      value={loading ? 'Fetching...' : outputAmount}
                      readOnly
                      placeholder="0.00"
                      className="flex-1 bg-transparent text-3xl text-white outline-none placeholder-gray-600"
                    />
                    <select
                      value={outputToken}
                      onChange={(e) => setOutputToken(e.target.value)}
                      className="bg-gray-700 text-white px-4 py-2 rounded-xl outline-none cursor-pointer"
                    >
                      {tokens.filter(t => t !== inputToken).map(token => (
                        <option key={token} value={token}>{token}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Info Box */}
                {outputAmount && !loading && (
                  <div className="bg-gray-800/30 rounded-xl p-3 mb-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Rate</span>
                      <span className="text-white">
                        1 {inputToken} = {(parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(2)} {outputToken}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Network Fee</span>
                      <span className="text-white">~0.00025 SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price Impact</span>
                      <span className="text-green-400">&lt; 0.1%</span>
                    </div>
                  </div>
                )}

                {/* Swap Button */}
                <button
                  onClick={handleSwap}
                  disabled={!inputAmount || loading || !connected}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all ${
                    !connected 
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                      : !inputAmount || loading
                      ? 'bg-purple-600/50 text-gray-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/30 transform hover:scale-[1.02]'
                  }`}
                >
                  {!connected ? 'Connect Wallet' :
                   loading ? 'Fetching Quote...' :
                   !inputAmount ? 'Enter Amount' :
                   'Swap'}
                </button>

                {/* Settings */}
                <div className="text-center mt-4">
                  <button className="text-gray-400 hover:text-white text-sm transition-all">
                    ⚙️ Slippage: 0.5%
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
