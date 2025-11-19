import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { api } from '../lib/api';
import { soundManager } from '../utils/sounds';
import SwapInterface from './SwapInterface';
import ProPoolBetting from './ProPoolBetting';

interface BettingMatch {
  id: string;
  player1: string;
  player2: string;
  gameId: string;
  betAmount: number;
  currency: 'USDC' | 'USDT';
  status: 'pending' | 'accepted' | 'in_progress' | 'settled';
  winner?: string;
  createdAt: string;
}

interface CompetitionMode {
  id: 'KIDDIES' | 'TEENIES';
  name: string;
  description: string;
  maxBet: number;
  color: string;
  emoji: string;
  fee: number;
  bgGradient: string;
}

const COMPETITION_MODES: CompetitionMode[] = [
  { 
    id: 'KIDDIES', 
    name: 'Kiddies', 
    description: 'Safe fun (7-12)', 
    maxBet: 5, 
    color: 'text-green-400', 
    emoji: '🦄',
    fee: 0.50,
    bgGradient: 'from-green-500/20 to-emerald-600/20'
  },
  { 
    id: 'TEENIES', 
    name: 'Teenies', 
    description: 'Competitive (13-17)', 
    maxBet: 20, 
    color: 'text-blue-400', 
    emoji: '🎯',
    fee: 1.50,
    bgGradient: 'from-blue-500/20 to-cyan-600/20'
  }
];

interface BettingArenaProps {
  gameId?: string;
  onClose: () => void;
}

export default function BettingArena({ gameId = 'snake', onClose }: BettingArenaProps) {
  const { publicKey, connected } = useWallet();
  const [selectedMode, setSelectedMode] = useState<CompetitionMode>(COMPETITION_MODES[1]);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [currency, setCurrency] = useState<'USDC' | 'USDT'>('USDC');
  const [opponentAddress, setOpponentAddress] = useState('');
  const [activeMatches, setActiveMatches] = useState<BettingMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [nagBalance, setNagBalance] = useState<number>(1250);
  const [testMode, setTestMode] = useState(true);
  const [showSwap, setShowSwap] = useState(false);
  const [showProPool, setShowProPool] = useState(false);

  useEffect(() => {
    if (connected) {
      fetchActiveMatches();
    }
  }, [connected]);

  const fetchActiveMatches = async () => {
    try {
      const token = localStorage.getItem('wallet_session');
      if (!token) return;

      const response = await fetch('/api/x402/bets/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setActiveMatches(data.bets || []);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    }
  };

  const createBettingMatch = async () => {
    if (!connected || !publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    if (!opponentAddress && !testMode) {
      alert('Please enter opponent address');
      return;
    }

    setLoading(true);
    try {
      if (testMode) {
        // Simulate match creation in test mode
        setTimeout(() => {
          alert(`Test match created! Amount: ${betAmount} ${currency}, Fee: ${selectedMode.fee} ${currency}`);
          setLoading(false);
        }, 1500);
        return;
      }

      const token = localStorage.getItem('wallet_session');
      const response = await fetch('/api/x402/bet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opponent: opponentAddress || 'test_opponent',
          gameId: gameId,
          amount: betAmount,
          currency: currency,
          mode: selectedMode.id
        })
      });

      if (response.status === 402) {
        const data = await response.json();
        setPaymentDetails(data.paymentRequest);
        setShowPaymentQR(true);
        soundManager.playClick();
      }
    } catch (error) {
      console.error('Failed to create bet:', error);
      alert('Failed to create betting match');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = () => {
    return (betAmount + selectedMode.fee).toFixed(2);
  };

  const calculatePotentialWin = () => {
    const winAmount = betAmount * 2 * 0.98; // 2% goes to ecosystem
    const nagBonus = winAmount * 1.25; // 25% NAG bonus
    return nagBonus.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-black to-blue-900/90 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent"
                style={{ fontFamily: '"Monoton", "Impact", cursive', letterSpacing: '0.1em' }}>
              X402 BETTING ARENA
            </h1>
            <p className="text-cyan-300 text-lg italic mt-2" style={{ fontFamily: '"Orbitron", "Helvetica", sans-serif' }}>
              AI-Powered Competitive Gaming
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="text-4xl text-white/60 hover:text-white transition-all hover:rotate-90 duration-300"
          >
            ✕
          </button>
        </div>

        {/* Test Mode Toggle */}
        <div className="mb-6 flex items-center gap-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
          <span className="text-yellow-400 font-bold">🧪 TEST MODE</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={testMode}
              onChange={(e) => setTestMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
          </label>
          <span className="text-yellow-200 text-sm">Try without spending real money</span>
        </div>

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-3 mb-6">
          <button
            onClick={() => setShowProPool(true)}
            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <span className="text-xl">🔥</span>
            PRO POOLS ($250+)
          </button>
          
          <button
            onClick={() => setShowSwap(true)}
            className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 flex items-center gap-2"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <span className="text-xl">💱</span>
            SWAP FOR $NAG
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-3 mb-8">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-white">AI Agent Active</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <span className="text-2xl">🔒</span>
            <span className="font-bold text-white">x402 Secured</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <span className="text-2xl">🛡️</span>
            <span className="font-bold text-white">Anti-Cheat ON</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-yellow-600 to-amber-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
          >
            <span className="text-2xl">🪙</span>
            <span className="font-bold text-white">$NAG: {nagBalance.toLocaleString()}</span>
          </motion.div>
        </div>

        {!connected ? (
          <div className="bg-black/50 backdrop-blur-sm rounded-xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Connect Wallet to Start</h2>
            <p className="text-gray-300 text-lg">Join the competitive gaming revolution</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Mode Selection & Betting */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Competition Mode Selection */}
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">🎮</span>
                  <span style={{ fontFamily: '"Orbitron", "Helvetica", sans-serif' }}>SELECT BATTLE MODE</span>
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                  {COMPETITION_MODES.map((mode) => (
                    <motion.button
                      key={mode.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedMode(mode);
                        setBetAmount(Math.min(betAmount, mode.maxBet));
                        soundManager.playClick();
                      }}
                      className={`relative p-6 rounded-xl border-2 transition-all ${
                        selectedMode.id === mode.id
                          ? `border-white bg-gradient-to-br ${mode.bgGradient} shadow-xl`
                          : 'border-purple-500/50 bg-black/30 hover:bg-black/50'
                      }`}
                    >
                      <div className="absolute top-2 right-2">
                        {selectedMode.id === mode.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-white rounded-full p-1"
                          >
                            <span className="text-green-600 text-sm">✓</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <div className="text-5xl mb-2">{mode.emoji}</div>
                      <div className={`text-xl font-bold ${mode.color}`} style={{ fontFamily: '"Orbitron", "Helvetica", sans-serif' }}>
                        {mode.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{mode.description}</div>
                      <div className="text-sm text-cyan-400 mt-2">Max: ${mode.maxBet}</div>
                      <div className="text-xs text-yellow-400">Fee: ${mode.fee}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Create Competition */}
              <div className="bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-3xl">⚔️</span>
                  <span style={{ fontFamily: '"Orbitron", "Helvetica", sans-serif' }}>CREATE BATTLE</span>
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-cyan-400 text-sm font-bold uppercase tracking-wider">
                      Opponent Address {testMode && '(Optional in Test Mode)'}
                    </label>
                    <input
                      type="text"
                      value={opponentAddress}
                      onChange={(e) => setOpponentAddress(e.target.value)}
                      placeholder={testMode ? "Leave empty for test match..." : "Enter Solana address..."}
                      className="w-full mt-2 px-4 py-3 bg-black/70 border border-purple-500/50 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none transition-colors"
                      style={{ fontFamily: '"Rajdhani", "Helvetica", sans-serif' }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-cyan-400 text-sm font-bold uppercase tracking-wider">
                        Bet Amount
                      </label>
                      <div className="flex gap-2 mt-2">
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(Math.min(Number(e.target.value), selectedMode.maxBet))}
                          min="0.1"
                          max={selectedMode.maxBet}
                          step="0.1"
                          className="flex-1 px-4 py-3 bg-black/70 border border-purple-500/50 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                          style={{ fontFamily: '"Rajdhani", "Helvetica", sans-serif' }}
                        />
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value as 'USDC' | 'USDT')}
                          className="px-4 py-3 bg-black/70 border border-purple-500/50 rounded-lg text-white focus:border-cyan-400 focus:outline-none transition-colors"
                          style={{ fontFamily: '"Rajdhani", "Helvetica", sans-serif' }}
                        >
                          <option value="USDC">USDC</option>
                          <option value="USDT">USDT</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-cyan-400 text-sm font-bold uppercase tracking-wider">
                        Total Cost
                      </label>
                      <div className="mt-2 px-4 py-3 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500 rounded-lg">
                        <span className="text-2xl font-bold text-white">
                          ${calculateTotalCost()} {currency}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-green-400 font-bold">Potential Win (with NAG bonus):</span>
                      <span className="text-2xl font-bold text-green-300">
                        ${calculatePotentialWin()} worth of $NAG
                      </span>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={createBettingMatch}
                    disabled={loading || (!testMode && !opponentAddress) || betAmount < 0.1}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50 shadow-lg"
                    style={{ fontFamily: '"Orbitron", "Helvetica", sans-serif' }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="animate-spin">⚡</span>
                        CREATING BATTLE...
                      </span>
                    ) : (
                      `${testMode ? 'TEST' : 'CREATE'} BATTLE (${calculateTotalCost()} ${currency})`
                    )}
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Right Column - Info & Stats */}
            <div className="space-y-6">
              
              {/* AI Agent Status */}
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30">
                <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl animate-pulse">🤖</span>
                  AI AGENT STATUS
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400 font-bold">ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Validation:</span>
                    <span className="text-green-400">Real-time</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Settlement:</span>
                    <span className="text-green-400">Instant</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trust Score:</span>
                    <span className="text-green-400">98/100</span>
                  </div>
                </div>
              </div>

              {/* $NAG Economics */}
              <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-6 border border-yellow-500/30">
                <h3 className="text-xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🪙</span>
                  $NAG ECONOMICS
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-yellow-200">
                    <div className="font-bold mb-1">Why $NAG?</div>
                    <ul className="space-y-1 text-yellow-100/80">
                      <li>• 25% bonus on winnings</li>
                      <li>• Required for withdrawals</li>
                      <li>• Governance rights</li>
                      <li>• Staking rewards</li>
                    </ul>
                  </div>
                  <button className="w-full py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 rounded-lg font-bold text-white transition-all">
                    GET $NAG TOKENS
                  </button>
                </div>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/30">
                <h3 className="text-xl font-bold text-purple-400 mb-3">FEE BREAKDOWN</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Competition Fee:</span>
                    <span className="text-white">${selectedMode.fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">→ Reward Pool:</span>
                    <span className="text-green-400">${(selectedMode.fee * 0.5).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">→ Platform:</span>
                    <span className="text-blue-400">${(selectedMode.fee * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">→ Burn:</span>
                    <span className="text-red-400">${(selectedMode.fee * 0.2).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Anti-Cheat Info */}
              <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-xl p-6 border border-red-500/30">
                <h3 className="text-xl font-bold text-red-400 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  ANTI-CHEAT
                </h3>
                <div className="space-y-1 text-sm text-red-200/80">
                  <div>✓ Pattern analysis active</div>
                  <div>✓ Score validation enabled</div>
                  <div>✓ Min game time: 30s</div>
                  <div>✓ Replay protection ON</div>
                  <div>✓ Bot detection: Active</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Matches (if any) */}
        {activeMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-black/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Active Battles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMatches.map((match) => (
                <div key={match.id} className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xl font-bold text-white">${match.betAmount} {match.currency}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      match.status === 'pending' ? 'bg-yellow-600' :
                      match.status === 'accepted' ? 'bg-blue-600' :
                      match.status === 'in_progress' ? 'bg-purple-600' :
                      'bg-green-600'
                    } text-white`}>
                      {match.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-300">
                    vs {match.player1 === publicKey?.toString() ? 
                      `${match.player2.slice(0, 4)}...${match.player2.slice(-4)}` : 
                      `${match.player1.slice(0, 4)}...${match.player1.slice(-4)}`}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Swap Interface Modal */}
      <SwapInterface 
        open={showSwap} 
        onClose={() => setShowSwap(false)}
        onSwapComplete={(amount) => {
          setNagBalance(prev => prev + amount);
          console.log(`Received ${amount} NAG tokens`);
        }}
      />
      
      {/* Pro Pool Betting Modal */}
      {showProPool && (
        <div className="fixed inset-0 z-50">
          <ProPoolBetting />
          <button
            onClick={() => setShowProPool(false)}
            className="fixed top-4 right-4 z-50 text-4xl text-white/60 hover:text-white transition-all hover:rotate-90 duration-300 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
