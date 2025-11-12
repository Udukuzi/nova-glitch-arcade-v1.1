import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import SwapInterface from './SwapInterface';

interface Pool {
  id: string;
  gameId: string;
  gameName: string;
  targetScore: number;
  minEntry: number;
  currentPool: number;
  participants: number;
  deadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'REFUNDED';
  winner?: string;
}

const ACTIVE_POOLS: Pool[] = [
  {
    id: '1',
    gameId: 'snake',
    gameName: 'Snake Classic',
    targetScore: 10000,
    minEntry: 250,
    currentPool: 1250,
    participants: 5,
    deadline: '2024-11-11T00:00:00',
    status: 'OPEN'
  },
  {
    id: '2',
    gameId: 'flappy',
    gameName: 'Flappy Nova',
    targetScore: 500,
    minEntry: 350,
    currentPool: 2100,
    participants: 6,
    deadline: '2024-11-11T12:00:00',
    status: 'OPEN'
  },
  {
    id: '3',
    gameId: 'tetramem',
    gameName: 'TetraMem',
    targetScore: 50000,
    minEntry: 500,
    currentPool: 5000,
    participants: 10,
    deadline: '2024-11-12T00:00:00',
    status: 'OPEN'
  }
];

const ECOSYSTEM_FEE = 2.5; // 2.5% fee for ecosystem
const WINNER_FEE = 1.5; // 1.5% additional platform fee
const TOTAL_FEE = ECOSYSTEM_FEE + WINNER_FEE; // 4% total

export default function ProPoolBetting() {
  const { publicKey, connected } = useWallet();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [entryAmount, setEntryAmount] = useState<string>('');
  const [agreedScore, setAgreedScore] = useState<boolean>(false);
  const [showSwap, setShowSwap] = useState(false);
  const [creatingPool, setCreatingPool] = useState(false);
  const [newPoolData, setNewPoolData] = useState({
    gameId: 'snake',
    targetScore: 0,
    minEntry: 250,
    deadline: ''
  });

  const calculateWinnings = (pool: Pool) => {
    const winnerTakes = pool.currentPool * (1 - TOTAL_FEE / 100);
    const ecosystemGets = pool.currentPool * (ECOSYSTEM_FEE / 100);
    const platformGets = pool.currentPool * (WINNER_FEE / 100);
    
    return {
      winner: winnerTakes.toFixed(2),
      ecosystem: ecosystemGets.toFixed(2),
      platform: platformGets.toFixed(2)
    };
  };

  const handleJoinPool = async (pool: Pool) => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(entryAmount);
    if (amount < pool.minEntry) {
      alert(`Minimum entry is $${pool.minEntry} USDC`);
      return;
    }

    if (!agreedScore) {
      alert('You must agree to the target score');
      return;
    }

    // Simulate joining pool
    console.log(`Joining pool ${pool.id} with ${amount} USDC`);
    alert(`Successfully joined pool! Entry: ${amount} USDC`);
    setSelectedPool(null);
    setEntryAmount('');
    setAgreedScore(false);
  };

  const handleCreatePool = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!newPoolData.deadline || newPoolData.targetScore <= 0) {
      alert('Please fill all fields correctly');
      return;
    }

    // Simulate creating pool
    console.log('Creating new pool:', newPoolData);
    alert('Pool created successfully!');
    setCreatingPool(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-black to-blue-900/90 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-red-500 to-pink-600 bg-clip-text text-transparent mb-4"
              style={{ fontFamily: '"Monoton", cursive', letterSpacing: '0.1em' }}>
            PRO POOL BETTING
          </h1>
          <p className="text-cyan-300 text-xl" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            High-Stakes Competitive Gaming • Minimum Entry: $250 USDC
          </p>
          
          {/* Fee Structure Banner */}
          <div className="mt-4 bg-gradient-to-r from-green-900/50 to-emerald-900/50 rounded-lg p-3 border border-green-500/30 max-w-2xl mx-auto">
            <p className="text-green-400 font-bold">
              🏆 Winner Takes: {100 - TOTAL_FEE}% of Pool • 
              🏛️ Ecosystem: {ECOSYSTEM_FEE}% • 
              🎮 Platform: {WINNER_FEE}%
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setShowSwap(true)}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            💱 GET $NAG TOKENS
          </button>
          <button
            onClick={() => setCreatingPool(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            ➕ CREATE NEW POOL
          </button>
        </div>

        {/* Active Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVE_POOLS.map((pool) => {
            const winnings = calculateWinnings(pool);
            return (
              <motion.div
                key={pool.id}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-black/60 backdrop-blur-sm rounded-xl p-6 border border-purple-500/50 hover:border-cyan-400/50 transition-all"
              >
                {/* Pool Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                      {pool.gameName}
                    </h3>
                    <p className="text-cyan-400 text-sm mt-1">Pool #{pool.id}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pool.status === 'OPEN' ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                    pool.status === 'IN_PROGRESS' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/50'
                  }`}>
                    {pool.status}
                  </span>
                </div>

                {/* Pool Stats */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Pool:</span>
                    <span className="text-3xl font-bold text-yellow-400">${pool.currentPool}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Target Score:</span>
                    <span className="text-white font-bold">{pool.targetScore.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Min Entry:</span>
                    <span className="text-cyan-400 font-bold">${pool.minEntry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-white">{pool.participants} players</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deadline:</span>
                    <span className="text-orange-400 text-sm">
                      {new Date(pool.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Prize Breakdown */}
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-3 mb-4 border border-green-500/20">
                  <p className="text-green-400 text-sm font-bold mb-1">💰 Prize Breakdown:</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Winner Gets:</span>
                      <span className="text-green-400 font-bold">${winnings.winner}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Ecosystem Fund:</span>
                      <span className="text-blue-400">${winnings.ecosystem}</span>
                    </div>
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => setSelectedPool(pool)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-lg transition-all"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  JOIN POOL
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* How It Works Section */}
        <div className="mt-12 bg-black/50 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30">
          <h2 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: '"Orbitron", sans-serif' }}>
            🎯 HOW PRO POOLS WORK
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💵</div>
              <h3 className="text-cyan-400 font-bold mb-2">1. Entry Fee</h3>
              <p className="text-gray-300 text-sm">Minimum $250 USDC entry. Higher entries allowed for bigger share.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🎮</div>
              <h3 className="text-cyan-400 font-bold mb-2">2. Target Score</h3>
              <p className="text-gray-300 text-sm">All players agree to target score. First to reach it wins entire pool.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-cyan-400 font-bold mb-2">3. Winner Takes</h3>
              <p className="text-gray-300 text-sm">Winner receives 96% of pool. 2.5% to ecosystem, 1.5% platform fee.</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">🔄</div>
              <h3 className="text-cyan-400 font-bold mb-2">4. No Winner?</h3>
              <p className="text-gray-300 text-sm">If deadline passes with no winner, funds go to ecosystem multisig.</p>
            </div>
          </div>
        </div>

        {/* Risk Warning */}
        <div className="mt-6 p-4 bg-red-900/30 rounded-lg border border-red-500/30">
          <p className="text-red-400 text-center">
            ⚠️ <strong>HIGH RISK WARNING:</strong> Pro pools involve significant financial risk. 
            Only participate with funds you can afford to lose. Must be 18+ to participate.
          </p>
        </div>
      </motion.div>

      {/* Join Pool Modal */}
      <AnimatePresence>
        {selectedPool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedPool(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/95 via-black to-blue-900/95 rounded-2xl p-6 max-w-md w-full border border-purple-500/50"
            >
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                Join {selectedPool.gameName} Pool
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Entry Amount (USDC)</label>
                  <input
                    type="number"
                    min={selectedPool.minEntry}
                    value={entryAmount}
                    onChange={(e) => setEntryAmount(e.target.value)}
                    className="w-full mt-2 px-4 py-3 bg-black/50 border border-purple-500/50 rounded-lg text-white"
                    placeholder={`Min: $${selectedPool.minEntry}`}
                  />
                </div>
                
                <div className="bg-black/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="agree-score"
                      checked={agreedScore}
                      onChange={(e) => setAgreedScore(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <label htmlFor="agree-score" className="text-white text-sm">
                      I agree to the target score of <span className="text-yellow-400 font-bold">{selectedPool.targetScore.toLocaleString()}</span>
                    </label>
                  </div>
                  <p className="text-gray-400 text-xs">
                    By joining, you accept that if no one reaches the target score by the deadline, 
                    all funds will be sent to the ecosystem multisig wallet.
                  </p>
                </div>
                
                <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    Potential Winnings: <span className="text-2xl font-bold">
                      ${(selectedPool.currentPool + parseFloat(entryAmount || '0')) * (1 - TOTAL_FEE / 100)}
                    </span>
                  </p>
                </div>
                
                <button
                  onClick={() => handleJoinPool(selectedPool)}
                  disabled={!connected || !agreedScore || parseFloat(entryAmount) < selectedPool.minEntry}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {connected ? 'CONFIRM ENTRY' : 'CONNECT WALLET FIRST'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Pool Modal */}
      <AnimatePresence>
        {creatingPool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setCreatingPool(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-purple-900/95 via-black to-blue-900/95 rounded-2xl p-6 max-w-md w-full border border-purple-500/50"
            >
              <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                Create New Pool
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Select Game</label>
                  <select
                    value={newPoolData.gameId}
                    onChange={(e) => setNewPoolData({...newPoolData, gameId: e.target.value})}
                    className="w-full mt-2 px-4 py-3 bg-black/50 border border-purple-500/50 rounded-lg text-white"
                  >
                    <option value="snake">Snake Classic</option>
                    <option value="flappy">Flappy Nova</option>
                    <option value="memory">Memory Match</option>
                    <option value="tetramem">TetraMem</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Target Score</label>
                  <input
                    type="number"
                    value={newPoolData.targetScore}
                    onChange={(e) => setNewPoolData({...newPoolData, targetScore: parseInt(e.target.value)})}
                    className="w-full mt-2 px-4 py-3 bg-black/50 border border-purple-500/50 rounded-lg text-white"
                    placeholder="Enter target score"
                  />
                </div>
                
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Minimum Entry (USDC)</label>
                  <div className="flex gap-2 mt-2">
                    {[250, 350, 500].map(amount => (
                      <button
                        key={amount}
                        onClick={() => setNewPoolData({...newPoolData, minEntry: amount})}
                        className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                          newPoolData.minEntry === amount
                            ? 'bg-purple-600 text-white'
                            : 'bg-black/30 text-gray-400 border border-gray-600'
                        }`}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-cyan-400 text-sm font-bold">Deadline</label>
                  <input
                    type="datetime-local"
                    value={newPoolData.deadline}
                    onChange={(e) => setNewPoolData({...newPoolData, deadline: e.target.value})}
                    className="w-full mt-2 px-4 py-3 bg-black/50 border border-purple-500/50 rounded-lg text-white"
                  />
                </div>
                
                <button
                  onClick={handleCreatePool}
                  disabled={!connected}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  {connected ? 'CREATE POOL' : 'CONNECT WALLET FIRST'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap Interface */}
      <SwapInterface 
        open={showSwap} 
        onClose={() => setShowSwap(false)}
        onSwapComplete={(amount) => {
          console.log(`Received ${amount} NAG tokens`);
        }}
      />
    </div>
  );
}
