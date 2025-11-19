import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { api } from '../lib/api';
import { soundManager } from '../utils/sounds';

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

interface BettingPanelProps {
  gameId: string;
  open: boolean;
  onClose: () => void;
  onMatchStart?: (matchId: string) => void;
}

interface CompetitionMode {
  id: 'KIDS' | 'TEEN' | 'ADULT';
  name: string;
  description: string;
  maxBet: number;
  color: string;
  emoji: string;
  fee: number;
}

const COMPETITION_MODES: CompetitionMode[] = [
  { id: 'KIDS', name: 'Kids Mode', description: 'Safe & fun (7-12 years)', maxBet: 1, color: 'from-green-400 to-blue-400', emoji: '🌟', fee: 0.01 },
  { id: 'TEEN', name: 'Teen Mode', description: 'Competitive (13-17 years)', maxBet: 5, color: 'from-blue-400 to-purple-400', emoji: '🎮', fee: 0.05 },
  { id: 'ADULT', name: 'Pro Mode', description: 'High stakes (18+)', maxBet: 100, color: 'from-purple-400 to-pink-400', emoji: '⚔️', fee: 0.1 }
];

export default function BettingPanel({ gameId, open, onClose, onMatchStart }: BettingPanelProps) {
  const { publicKey, connected } = useWallet();
  const [selectedMode, setSelectedMode] = useState<CompetitionMode>(COMPETITION_MODES[1]);
  const [betAmount, setBetAmount] = useState<number>(1);
  const [currency, setCurrency] = useState<'USDC' | 'USDT'>('USDC');
  const [opponentAddress, setOpponentAddress] = useState('');
  const [activeMatches, setActiveMatches] = useState<BettingMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPaymentQR, setShowPaymentQR] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [nagBalance, setNagBalance] = useState<number>(0);
  const [showNagRequired, setShowNagRequired] = useState(false);

  useEffect(() => {
    if (open && connected) {
      fetchActiveMatches();
    }
  }, [open, connected]);

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

    if (!opponentAddress) {
      alert('Please enter opponent address');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('wallet_session');
      const response = await fetch('/api/x402/bet/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          opponent: opponentAddress,
          gameId: gameId,
          amount: betAmount,
          currency: currency
        })
      });

      if (response.status === 402) {
        // Payment required - show x402 payment UI
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

  const acceptMatch = async (matchId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('wallet_session');
      const response = await fetch(`/api/x402/bet/accept/${matchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 402) {
        // Payment required
        const data = await response.json();
        setPaymentDetails(data.paymentRequest);
        setShowPaymentQR(true);
        soundManager.playClick();
      }
    } catch (error) {
      console.error('Failed to accept match:', error);
      alert('Failed to accept match');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 border border-purple-500 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl">⚔️</span>
              x402 Betting Arena
            </h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          {/* x402 + NAG Badge */}
          <div className="flex gap-2 mb-4">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
              <span>🔒</span> x402 Protocol
            </div>
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
              <span>🪙</span> $NAG Powered
            </div>
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
              <span>🛡️</span> Anti-Cheat Active
            </div>
          </div>

          {!connected ? (
            <div className="text-center py-8">
              <p className="text-white/80 mb-4">Connect your wallet to access betting features</p>
            </div>
          ) : (
            <>
              {/* Competition Mode Selector */}
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-white mb-3">Select Competition Mode</h3>
                <div className="grid grid-cols-3 gap-2">
                  {COMPETITION_MODES.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setSelectedMode(mode);
                        setBetAmount(Math.min(betAmount, mode.maxBet));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedMode.id === mode.id
                          ? 'border-white bg-gradient-to-r ' + mode.color
                          : 'border-purple-500/50 bg-black/50'
                      }`}
                    >
                      <div className="text-2xl mb-1">{mode.emoji}</div>
                      <div className="text-sm font-bold">{mode.name}</div>
                      <div className="text-xs opacity-80">{mode.description}</div>
                      <div className="text-xs mt-1">Max: {mode.maxBet} {currency}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* $NAG Balance Display */}
              <div className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border border-yellow-500/50 rounded-lg p-3 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-yellow-400 font-semibold">Your $NAG Balance:</span>
                    <span className="text-white ml-2">{nagBalance.toLocaleString()} NAG</span>
                  </div>
                  <button className="bg-yellow-600 hover:bg-yellow-500 px-3 py-1 rounded text-white text-sm font-bold">
                    Buy $NAG
                  </button>
                </div>
                <p className="text-yellow-400/80 text-xs mt-1">
                  💡 Withdrawals require $NAG tokens • Get 25% bonus on winnings!
                </p>
              </div>
              
              {/* Create New Bet */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Create New Competition</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-white/60 text-sm">Opponent Address</label>
                    <input
                      type="text"
                      value={opponentAddress}
                      onChange={(e) => setOpponentAddress(e.target.value)}
                      placeholder="Enter Solana address..."
                      className="w-full px-3 py-2 bg-black/50 border border-purple-500/50 rounded text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="text-white/60 text-sm">Bet Amount</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Math.min(Number(e.target.value), selectedMode.maxBet))}
                        min="0.1"
                        max={selectedMode.maxBet}
                        step="0.1"
                        className="flex-1 px-3 py-2 bg-black/50 border border-purple-500/50 rounded text-white"
                      />
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as 'USDC' | 'USDT')}
                        className="px-3 py-2 bg-black/50 border border-purple-500/50 rounded text-white"
                      >
                        <option value="USDC">USDC</option>
                        <option value="USDT">USDT</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Competition Fee:</span>
                    <span className="text-yellow-400">{selectedMode.fee} {currency} (funds rewards)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Total Cost:</span>
                    <span className="text-white font-bold">{(betAmount + selectedMode.fee).toFixed(2)} {currency}</span>
                  </div>
                  <button
                    onClick={createBettingMatch}
                    disabled={loading || !opponentAddress || betAmount < 0.1}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : `Create Competition (${(betAmount + selectedMode.fee).toFixed(2)} ${currency})`}
                  </button>
                </div>
              </div>

              {/* Active Matches */}
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Active Matches</h3>
                
                {activeMatches.length === 0 ? (
                  <p className="text-white/60 text-center py-4">No active matches</p>
                ) : (
                  <div className="space-y-2">
                    {activeMatches.map((match) => (
                      <div key={match.id} className="bg-black/50 rounded p-3 flex justify-between items-center">
                        <div>
                          <p className="text-white font-semibold">
                            {match.betAmount} {match.currency}
                          </p>
                          <p className="text-white/60 text-sm">
                            vs {match.player1 === publicKey?.toString() ? match.player2 : match.player1}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          {match.status === 'pending' && match.player1 !== publicKey?.toString() && (
                            <button
                              onClick={() => acceptMatch(match.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded transition-colors"
                            >
                              Accept
                            </button>
                          )}
                          
                          {match.status === 'accepted' && (
                            <button
                              onClick={() => onMatchStart?.(match.id)}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                            >
                              Start Game
                            </button>
                          )}
                          
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
                            match.status === 'pending' ? 'bg-yellow-600' :
                            match.status === 'accepted' ? 'bg-blue-600' :
                            match.status === 'in_progress' ? 'bg-purple-600' :
                            'bg-green-600'
                          } text-white`}>
                            {match.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment QR Modal */}
          {showPaymentQR && paymentDetails && (
            <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4">
              <div className="bg-gradient-to-br from-purple-900 to-blue-900 border-2 border-purple-500 rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-white mb-4">Complete Payment</h3>
                
                <div className="bg-white p-4 rounded-lg mb-4">
                  {/* QR Code would be generated here */}
                  <div className="aspect-square bg-gray-200 flex items-center justify-center">
                    <p className="text-gray-600">QR Code</p>
                  </div>
                </div>
                
                <p className="text-white/80 text-sm mb-4">
                  Scan QR code or click the button below to complete payment
                </p>
                
                <a
                  href={paymentDetails.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-bold rounded-lg text-center transition-all"
                >
                  Pay with x402
                </a>
                
                <button
                  onClick={() => {
                    setShowPaymentQR(false);
                    setPaymentDetails(null);
                  }}
                  className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <h4 className="text-white font-semibold mb-2">💡 How it Works</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Deposit USDC/USDT via x402 protocol</li>
                <li>• <span className="text-yellow-400 font-bold">ALL withdrawals in $NAG tokens (25% bonus!)</span></li>
                <li>• Competition fees fund reward pools</li>
                <li>• Anti-cheat AI validates all games</li>
                <li>• Age-appropriate competition modes</li>
                <li>• Instant settlement on completion</li>
              </ul>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border border-yellow-500/30">
              <h4 className="text-yellow-400 font-semibold mb-2">🪙 $NAG Token Benefits</h4>
              <ul className="text-yellow-200/80 text-sm space-y-1">
                <li>• <span className="font-bold">25% bonus</span> on all winnings</li>
                <li>• <span className="font-bold">Required</span> for withdrawals</li>
                <li>• Stake for higher multipliers</li>
                <li>• Governance voting rights</li>
                <li>• Exclusive tournaments access</li>
              </ul>
            </div>
            
            <div className="p-4 bg-red-900/30 rounded-lg border border-red-500/30">
              <h4 className="text-red-400 font-semibold mb-2">🛡️ Anti-Cheat Protection</h4>
              <ul className="text-red-200/80 text-sm space-y-1">
                <li>• Real-time gameplay validation</li>
                <li>• Pattern analysis for bot detection</li>
                <li>• Score rate limiting per game</li>
                <li>• Minimum game duration required</li>
                <li>• Trust score system</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
