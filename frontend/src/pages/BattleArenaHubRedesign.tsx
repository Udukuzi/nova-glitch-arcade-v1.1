import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import JupiterSwap from '../components/JupiterSwapRedesign';
import ProPoolBetting from '../components/ProPoolBetting';
import { soundManager } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';
import Lobby from '../components/Lobby';

export default function BattleArenaHub() {
  const navigate = useNavigate();
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('1v1');
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [testMode, setTestMode] = useState(false);
  const [nagBalance, setNagBalance] = useState(25000);

  const handleSwapComplete = (amount: number) => {
    setNagBalance(prev => prev + amount);
    soundManager.playReward();
  };

  useEffect(() => {
    const particles = document.createElement('div');
    particles.id = 'particles-bg';
    particles.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 0;
    `;
    document.body.appendChild(particles);
    
    return () => {
      const element = document.getElementById('particles-bg');
      if (element) element.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/20 to-black overflow-hidden relative">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 rounded-full filter blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-600/5 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12"
        >
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl rounded-full border border-purple-500/30 text-white font-medium hover:from-purple-600/30 hover:to-pink-600/30 transition-all"
            >
              ← Back to Arcade
            </motion.button>
            
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSwapModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full text-black font-bold shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all"
              >
                🔄 Swap Tokens
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/leaderboard')}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full text-white font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all"
              >
                🏆 Leaderboard
              </motion.button>
            </div>
          </div>

          {/* Title */}
          <motion.h1 
            className="text-7xl font-bold mb-6"
            style={{
              fontFamily: '"Monoton", cursive',
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF69B4, #00FFFF)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 60px rgba(255,215,0,0.5), 0 0 100px rgba(255,105,180,0.3)',
              letterSpacing: '0.05em'
            }}
          >
            BATTLE ARENA
          </motion.h1>

          {/* Subtitle with italic style */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
            style={{
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: '1.8',
              letterSpacing: '0.02em'
            }}
          >
            Welcome to the ultimate gaming battleground where skill meets fortune. 
            Compete in intense PvP matches, stake your $NAG tokens, and climb the leaderboards 
            to eternal glory in the Nova Glitch Arcade metaverse.
          </motion.p>
        </motion.div>

        {/* Stats Dashboard */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
        >
          {/* Balance Card */}
          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h3 className="text-purple-300 text-sm font-semibold uppercase tracking-wider mb-2">Your Balance</h3>
            <p className="text-4xl font-bold text-yellow-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              {nagBalance.toLocaleString()} $NAG
            </p>
            <p className="text-gray-400 text-sm mt-2 italic">Ready for battle</p>
          </div>

          {/* Wins Card */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-800/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
            <h3 className="text-green-300 text-sm font-semibold uppercase tracking-wider mb-2">Total Wins</h3>
            <p className="text-4xl font-bold text-green-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              147
            </p>
            <p className="text-gray-400 text-sm mt-2 italic">Victory streak: 12</p>
          </div>

          {/* Rank Card */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-800/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
            <h3 className="text-blue-300 text-sm font-semibold uppercase tracking-wider mb-2">Global Rank</h3>
            <p className="text-4xl font-bold text-cyan-400" style={{ fontFamily: '"Orbitron", sans-serif' }}>
              #42
            </p>
            <p className="text-gray-400 text-sm mt-2 italic">Top 1% player</p>
          </div>
        </motion.div>

        {/* Game Modes Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* 1v1 Duel */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => {
              setSelectedMode('1v1');
              setShowLobby(true);
              soundManager.playClick();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 to-orange-600/20 backdrop-blur"></div>
            <div className="relative p-8 border border-red-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">⚔️</div>
              <h3 className="text-2xl font-bold text-red-400 mb-2">1v1 Duel</h3>
              <p className="text-gray-300 italic mb-4">
                Face your opponent in an intense head-to-head battle. 
                Winner takes all in this ultimate test of skill.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold">Entry: 100 $NAG</span>
                <span className="text-green-400">Prize: 180 $NAG</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

          {/* Team Battle */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => {
              setSelectedMode('team');
              setShowLobby(true);
              soundManager.playClick();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur"></div>
            <div className="relative p-8 border border-purple-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-2">Team Battle</h3>
              <p className="text-gray-300 italic mb-4">
                Join forces with allies to dominate the battlefield. 
                Coordination and strategy lead to victory.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold">Entry: 50 $NAG</span>
                <span className="text-green-400">Prize: 85 $NAG</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-purple-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

          {/* Tournament */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => {
              setSelectedMode('tournament');
              setShowLobby(true);
              soundManager.playClick();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-amber-600/20 backdrop-blur"></div>
            <div className="relative p-8 border border-yellow-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-2">Tournament</h3>
              <p className="text-gray-300 italic mb-4">
                Compete in grand tournaments for massive prizes. 
                Only the strongest will claim the championship.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold">Entry: 500 $NAG</span>
                <span className="text-green-400">Prize: 5000 $NAG</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-yellow-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

          {/* Pro Pool */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => {
              setActiveTab('propool');
              soundManager.playClick();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/20 to-blue-600/20 backdrop-blur"></div>
            <div className="relative p-8 border border-cyan-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">💎</div>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">Pro Pool Betting</h3>
              <p className="text-gray-300 italic mb-4">
                High-stakes betting pool for elite players. 
                Massive rewards await those brave enough.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400 font-bold">Min: 1000 $NAG</span>
                <span className="text-green-400">Pool: 50K+ $NAG</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

          {/* Practice Mode */}
          <motion.div
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="relative overflow-hidden rounded-2xl cursor-pointer group"
            onClick={() => {
              setTestMode(true);
              setSelectedMode('practice');
              setShowLobby(true);
              soundManager.playClick();
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur"></div>
            <div className="relative p-8 border border-green-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Practice Arena</h3>
              <p className="text-gray-300 italic mb-4">
                Hone your skills without risk. Perfect your strategies 
                before entering real battles.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 font-bold">Entry: FREE</span>
                <span className="text-gray-400">No rewards</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-green-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            className="relative overflow-hidden rounded-2xl opacity-60 cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600/20 to-gray-700/20 backdrop-blur"></div>
            <div className="relative p-8 border border-gray-500/30 bg-black/40 backdrop-blur-xl rounded-2xl">
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">Battle Royale</h3>
              <p className="text-gray-500 italic mb-4">
                Coming soon! 100 players enter, only one survives. 
                Prepare for the ultimate challenge.
              </p>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-bold">Coming Q1 2025</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Active Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'propool' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-10"
            >
              <ProPoolBetting />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <JupiterSwap 
        open={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSwapComplete={handleSwapComplete}
      />
      
      {showLobby && (
        <Lobby
          mode={selectedMode}
          game={selectedGame}
          testMode={testMode}
          onClose={() => setShowLobby(false)}
          onJoinMatch={(matchId) => {
            console.log('Joining match:', matchId);
            setShowLobby(false);
          }}
        />
      )}
    </div>
  );
}
