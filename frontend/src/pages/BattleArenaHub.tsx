import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import JupiterSwap from '../components/JupiterSwap';
import ProPoolBetting from '../components/ProPoolBetting';
import { soundManager } from '../utils/sounds';
import { useNavigate } from 'react-router-dom';
import Lobby from '../components/Lobby';

interface TabContent {
  id: string;
  label: string;
  icon: string;
  color: string;
  glow: string;
}

const TABS: TabContent[] = [
  { id: 'battle', label: 'Quick Battles', icon: '⚔️', color: 'from-purple-600 to-pink-600', glow: 'shadow-purple-500/50' },
  { id: 'pools', label: 'Pro Pools', icon: '🔥', color: 'from-red-600 to-orange-600', glow: 'shadow-red-500/50' },
  { id: 'swap', label: 'Token Swap', icon: '💱', color: 'from-yellow-500 to-amber-600', glow: 'shadow-yellow-500/50' },
  { id: 'withdraw', label: 'Withdrawals', icon: '💰', color: 'from-green-500 to-emerald-600', glow: 'shadow-green-500/50' },
  { id: 'stats', label: 'My Stats', icon: '📊', color: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/50' }
];

interface BattleMode {
  id: string;
  name: string;
  icon: string;
  description: string;
  entryFee: string;
  prize: string;
  players: string;
  color: string;
}

const BATTLE_MODES: BattleMode[] = [
  {
    id: 'kiddies',
    name: 'KIDDIES MODE',
    icon: '👶',
    description: 'Perfect for beginners',
    entryFee: '10 $NAG',
    prize: '18 $NAG',
    players: '2 Players',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'teenies',
    name: 'TEENIES MODE',
    icon: '🎮',
    description: 'Intermediate competition',
    entryFee: '50 $NAG',
    prize: '95 $NAG',
    players: '2 Players',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'warriors',
    name: 'WARRIORS MODE',
    icon: '⚔️',
    description: 'High stakes battles',
    entryFee: '100 $NAG',
    prize: '190 $NAG',
    players: '2 Players',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'legends',
    name: 'LEGENDS MODE',
    icon: '👑',
    description: 'Ultimate championship',
    entryFee: '500 $NAG',
    prize: '975 $NAG',
    players: '2 Players',
    color: 'from-yellow-500 to-orange-500'
  }
];

export default function BattleArenaHub() {
  const navigate = useNavigate();
  const { publicKey, connected } = useWallet();
  const [activeTab, setActiveTab] = useState('battle');
  const [nagBalance, setNagBalance] = useState(1250);
  const [usdcBalance, setUsdcBalance] = useState(100);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showLobby, setShowLobby] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [selectedMode, setSelectedMode] = useState<string>('kiddies');
  const [selectedGame, setSelectedGame] = useState<string>('');

  const handleSwapComplete = (amount: number) => {
    setNagBalance(prev => prev + amount);
    soundManager.playReward();
  };

  const handleWithdraw = async () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    
    if (nagBalance < 100) {
      alert('Minimum withdrawal is 100 $NAG');
      return;
    }

    // Simulate withdrawal
    alert(`Withdrawing ${nagBalance} $NAG to your wallet...`);
    setNagBalance(0);
  };

  const handleBattleStart = (game: string, mode: string) => {
    setSelectedGame(game);
    setSelectedMode(mode);
    setShowLobby(true);
    soundManager.playClick();
  };

  useEffect(() => {
    // Add animated background particles
    const script = document.createElement('script');
    script.innerHTML = `
      if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
          particles: {
            number: { value: 50, density: { enable: true, value_area: 800 } },
            color: { value: ['#00ffff', '#ff00ff', '#ffff00'] },
            opacity: { value: 0.3, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: false },
            move: { enable: true, speed: 1, random: true, out_mode: 'out' }
          }
        });
      }
    `;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden relative flex items-center justify-center" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      {/* Epic Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-blue-900/30"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-600/20 rounded-full filter blur-3xl animate-pulse delay-500"></div>
        </div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grid)'/%3E%3C/svg%3E")`
        }}></div>
      </div>

      {/* Main Container - TRULY CENTERED WITH FLEXBOX ON PARENT */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-6" style={{ margin: '0 auto', maxWidth: '1280px' }}>
        
        {/* Epic Header Section - CENTERED */}
        <motion.div 
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full mb-8"
        >
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-14 h-14 bg-gradient-to-r from-red-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl shadow-red-500/30 border-2 border-red-400/30"
            >
              <span className="text-3xl text-white">×</span>
            </motion.button>
          </div>
          
          {/* Main Title with Epic Neon Effect */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-4"
              style={{ 
                fontFamily: '"Monoton", cursive', 
                letterSpacing: '0.1em',
                background: 'linear-gradient(45deg, #00ffff, #ff00ff, #ffff00, #00ffff)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient 4s ease infinite, glow 2s ease-in-out infinite alternate',
                filter: 'drop-shadow(0 0 40px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.6))'
              }}>
              X402 BATTLE HUB
            </motion.h1>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes gradient {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
              }
              @keyframes glow {
                from { filter: drop-shadow(0 0 40px rgba(0, 255, 255, 0.8)) drop-shadow(0 0 60px rgba(255, 0, 255, 0.6)); }
                to { filter: drop-shadow(0 0 60px rgba(0, 255, 255, 1)) drop-shadow(0 0 80px rgba(255, 0, 255, 0.8)); }
              }
            `}} />
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl sm:text-2xl md:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400" 
              style={{ fontFamily: '"Orbitron", sans-serif' }}>
              COMPETE • SWAP • WIN • WITHDRAW IN $NAG ONLY
            </motion.p>
          </div>
          
          {/* AI Agent & Network Status */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 backdrop-blur-md border-2 border-green-500/50 rounded-full px-8 py-3 flex items-center gap-3 shadow-xl shadow-green-500/20">
              <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400"></span>
              <span className="text-green-400 font-bold text-lg">🤖 AI AGENT ACTIVE</span>
              <span className="text-green-300">24/7 Validation</span>
            </div>
            <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 backdrop-blur-md border-2 border-blue-500/50 rounded-full px-8 py-3 flex items-center gap-3 shadow-xl shadow-blue-500/20">
              <span className="w-3 h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400"></span>
              <span className="text-blue-400 font-bold text-lg">⚡ SOLANA NETWORK</span>
              <span className="text-blue-300">Fast & Cheap</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats & Balance Dashboard - CENTERED */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full mb-10">
          
          {/* Quick Action Bar - ACTIVE BUTTONS */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSwapModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-bold rounded-2xl shadow-2xl shadow-yellow-500/30 border-2 border-yellow-400/50 flex items-center gap-3 transition-all duration-300 cursor-pointer"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              <span className="text-2xl">💱</span>
              <span className="text-lg">INSTANT SWAP TO $NAG</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/leaderboard')}
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-bold rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-purple-400/50 flex items-center gap-3 transition-all duration-300 cursor-pointer"
              style={{ fontFamily: '"Orbitron", sans-serif' }}
            >
              <span className="text-2xl">🏆</span>
              <span className="text-lg">LEADERBOARD</span>
            </motion.button>
          </div>
          
          {/* Balance Cards Grid - RESPONSIVE & CENTERED */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-purple-300 text-sm font-semibold uppercase tracking-wider">$NAG Balance</p>
                  <p className="text-4xl font-bold text-yellow-400 mt-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                    {nagBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-400 mt-1">+25% Win Bonus</p>
                </div>
                <span className="text-5xl opacity-50">🪙</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-900/60 to-cyan-900/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-blue-300 text-sm font-semibold uppercase tracking-wider">USDC Balance</p>
                  <p className="text-4xl font-bold text-cyan-400 mt-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                    ${usdcBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-blue-400 mt-1">Ready to Swap</p>
                </div>
                <span className="text-5xl opacity-50">💵</span>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-green-900/60 to-emerald-900/60 backdrop-blur-xl rounded-2xl p-6 border-2 border-green-500/50 shadow-2xl shadow-green-500/20 cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-green-300 text-sm font-semibold uppercase tracking-wider">Win Rate</p>
                  <p className="text-4xl font-bold text-green-400 mt-2" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                    67.8%
                  </p>
                  <p className="text-xs text-green-400 mt-1">32W / 15L</p>
                </div>
                <span className="text-5xl opacity-50">📈</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Tab Navigation - CENTERED DESIGN */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="w-full mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {TABS.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.08, y: -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  soundManager.playClick();
                }}
                className={`relative px-10 py-5 rounded-2xl font-bold transition-all transform ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl ${tab.glow} scale-105`
                    : `bg-gradient-to-r ${tab.color} text-white/90 hover:text-white opacity-80 hover:opacity-100`
                }`}
                style={{ 
                  fontFamily: '"Orbitron", sans-serif',
                  boxShadow: activeTab === tab.id 
                    ? `0 10px 40px rgba(255, 255, 255, 0.2), 0 0 80px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(255,255,255,0.1)`
                    : '0 4px 20px rgba(0, 0, 0, 0.5)',
                  border: activeTab === tab.id ? '2px solid rgba(255,255,255,0.3)' : '2px solid rgba(255,255,255,0.1)'
                }}
              >
                {activeTab === tab.id && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-white/10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <span className="text-2xl">{tab.icon}</span>
                  <span className="text-sm uppercase tracking-wider">{tab.label}</span>
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Test Mode Toggle - CENTERED */}
        {activeTab === 'battle' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-md border-2 border-yellow-500/50 rounded-2xl px-6 py-4 flex items-center gap-4 shadow-xl shadow-yellow-500/20">
              <span className="text-yellow-400 font-bold text-lg">🧪 TEST MODE</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={testMode}
                  onChange={(e) => setTestMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500"></div>
              </label>
              <span className="text-yellow-300">Practice without real $NAG</span>
            </div>
          </motion.div>
        )}

        {/* Main Content Area - CENTERED CONTENT */}
        <div className="w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'battle' && (
            <motion.div
              key="battle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              {/* Battle Modes Title */}
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold text-center mb-8" 
                style={{ 
                  fontFamily: '"Orbitron", sans-serif',
                  background: 'linear-gradient(90deg, #00ffff, #ff00ff, #00ffff)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient 3s ease infinite'
                }}>
                ⚔️ SELECT YOUR BATTLE MODE ⚔️
              </motion.h2>
              
              {/* Battle Modes Grid - PROFESSIONAL FULL WIDTH LAYOUT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-8">
                {BATTLE_MODES.map((mode, index) => (
                  <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, type: "spring" }}
                    whileHover={{ scale: 1.05, y: -10, rotateY: 5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`relative bg-gradient-to-br ${mode.color} backdrop-blur-xl rounded-3xl p-6 cursor-pointer transition-all transform preserve-3d ${
                      selectedMode === mode.id 
                        ? 'ring-4 ring-white/50 shadow-2xl scale-105' 
                        : 'ring-2 ring-white/20 shadow-xl hover:ring-4 hover:ring-white/30'
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      boxShadow: selectedMode === mode.id 
                        ? '0 20px 60px rgba(255,255,255,0.3), inset 0 0 30px rgba(255,255,255,0.1)'
                        : '0 10px 40px rgba(0,0,0,0.5)'
                    }}
                  >
                    {/* Selected Indicator */}
                    {selectedMode === mode.id && (
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg">
                        <span className="text-xl">✓</span>
                      </motion.div>
                    )}
                    
                    {/* Mode Card Content */}
                    <div className="text-center relative z-10">
                      <motion.span 
                        animate={{ rotate: selectedMode === mode.id ? [0, 5, -5, 0] : 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-6xl mb-4 block">
                        {mode.icon}
                      </motion.span>
                      
                      <h3 className="text-2xl font-bold text-white mb-2" 
                          style={{ 
                            fontFamily: '"Orbitron", sans-serif',
                            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                          }}>
                        {mode.name}
                      </h3>
                      
                      <p className="text-sm text-white/80 mb-4">{mode.description}</p>
                      
                      {/* Stats Box */}
                      <div className="space-y-2 bg-black/40 backdrop-blur rounded-2xl p-4 border border-white/10">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Entry:</span>
                          <span className="text-yellow-400 font-bold">{mode.entryFee}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Prize:</span>
                          <span className="text-green-400 font-bold">{mode.prize}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">Format:</span>
                          <span className="text-cyan-400">{mode.players}</span>
                        </div>
                      </div>
                      
                      {/* Select Button */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`w-full mt-4 py-3 font-bold rounded-xl transition-all ${
                          selectedMode === mode.id
                            ? 'bg-gradient-to-r from-white to-gray-200 text-black shadow-lg'
                            : 'bg-gradient-to-r from-white/20 to-white/10 text-white hover:from-white/30 hover:to-white/20'
                        }`}
                        style={{ fontFamily: '"Orbitron", sans-serif' }}
                      >
                        {selectedMode === mode.id ? 'SELECTED' : 'SELECT'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Game Selection Grid */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8"
              >
                <h3 className="text-3xl font-bold text-center mb-6 text-white"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}>
                  🎮 CHOOSE YOUR GAME 🎮
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
                  {['Snake', 'Flappy', 'Memory', 'Bonk Ryder', 'PacCoin', 'TetraMem'].map((game, index) => (
                    <motion.button
                      key={game}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + (0.05 * index) }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleBattleStart(game.toLowerCase().replace(' ', '-'), selectedMode)}
                      className="bg-gradient-to-br from-purple-600/50 to-pink-600/50 backdrop-blur-xl rounded-2xl p-4 border-2 border-purple-500/50 hover:border-purple-400 transition-all shadow-xl hover:shadow-2xl hover:shadow-purple-500/30"
                    >
                      <span className="text-4xl mb-2 block">
                        {game === 'Snake' ? '🐍' : 
                         game === 'Flappy' ? '🦅' :
                         game === 'Memory' ? '🧠' :
                         game === 'Bonk Ryder' ? '🏍️' :
                         game === 'PacCoin' ? '👾' : '🎮'}
                      </span>
                      <span className="text-white font-bold text-sm" style={{ fontFamily: '"Orbitron", sans-serif' }}>
                        {game}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
              
              {/* Start Battle Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center mt-8"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLobby(true)}
                  disabled={!selectedMode}
                  className="px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-3xl shadow-2xl shadow-purple-500/30 border-2 border-white/20 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: '"Orbitron", sans-serif' }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-3xl">🚀</span>
                    START BATTLE NOW
                    <span className="text-3xl">⚔️</span>
                  </span>
                </motion.button>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'pools' && (
            <motion.div
              key="pools"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <ProPoolBetting />
            </motion.div>
          )}

          {activeTab === 'swap' && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold text-center mb-8" 
                style={{ 
                  fontFamily: '"Orbitron", sans-serif',
                  background: 'linear-gradient(90deg, #ffff00, #ff9500, #ffff00)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient 3s ease infinite'
                }}>
                💱 TOKEN SWAP STATION 💱
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-black/50 to-purple-900/30 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-2xl font-bold text-cyan-400 mb-4 text-center">Instant Swap</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSwapModal(true)}
                    className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-white font-bold py-5 rounded-xl transition-all text-xl shadow-2xl border-2 border-yellow-400/30"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  >
                    <span className="text-2xl mr-2">💱</span> LAUNCH SWAP INTERFACE
                  </motion.button>
                  
                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current Rate:</span>
                      <span className="text-white">1 USDC = 10 $NAG</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network:</span>
                      <span className="text-green-400">Solana</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Slippage:</span>
                      <span className="text-yellow-400">1%</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl p-6 border border-purple-500/20">
                  <h3 className="text-lg font-bold text-purple-400 mb-3">Why $NAG?</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>All game withdrawals in $NAG only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>25% bonus on winnings paid in $NAG</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Lower fees for $NAG holders</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-400">✓</span>
                      <span>Access to exclusive tournaments</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold text-center mb-8" 
                style={{ 
                  fontFamily: '"Orbitron", sans-serif',
                  background: 'linear-gradient(90deg, #00ff00, #00ff88, #00ff00)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient 3s ease infinite'
                }}>
                💰 WITHDRAW $NAG TOKENS 💰
              </motion.h2>
              
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-500/30 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Available to Withdraw:</span>
                    <span className="text-4xl font-bold text-yellow-400">{nagBalance} $NAG</span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Minimum Withdrawal:</span>
                      <span className="text-white">100 $NAG</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Network Fee:</span>
                      <span className="text-yellow-400">2 $NAG</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">You'll Receive:</span>
                      <span className="text-green-400 font-bold">{Math.max(0, nagBalance - 2)} $NAG</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleWithdraw}
                    disabled={nagBalance < 100}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-xl rounded-lg transition-all disabled:opacity-50"
                    style={{ fontFamily: '"Orbitron", sans-serif' }}
                  >
                    {nagBalance >= 100 ? 'WITHDRAW ALL $NAG' : 'INSUFFICIENT BALANCE'}
                  </button>
                </div>
                
                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-500/30">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ <strong>Important:</strong> Withdrawals are only available in $NAG tokens. 
                    To convert to USDC/USDT, use external DEX after withdrawal.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <motion.h2 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-bold text-center mb-8" 
                style={{ 
                  fontFamily: '"Orbitron", sans-serif',
                  background: 'linear-gradient(90deg, #00ffff, #0088ff, #00ffff)',
                  backgroundSize: '200% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient 3s ease infinite'
                }}>
                📊 BATTLE STATISTICS 📊
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Battles</p>
                  <p className="text-2xl font-bold text-white">47</p>
                </div>
                <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Wins</p>
                  <p className="text-2xl font-bold text-green-400">32</p>
                </div>
                <div className="bg-gradient-to-br from-red-900/50 to-pink-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Losses</p>
                  <p className="text-2xl font-bold text-red-400">15</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-900/50 to-orange-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Total Earned</p>
                  <p className="text-2xl font-bold text-yellow-400">2,450 $NAG</p>
                </div>
              </div>
              
              <div className="mt-8">
                <h3 className="text-xl font-bold text-cyan-400 mb-4">Recent Battles</h3>
                <div className="space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-black/30 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-white">Snake Classic vs Player{i}</span>
                      <span className="text-green-400 font-bold">+50 $NAG</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Quick Actions Bar */}
        <div className="mt-8 bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Network: Solana
            </span>
            <span className="text-gray-400 text-sm">|</span>
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
              AI Agent: Active
            </span>
            <span className="text-gray-400 text-sm">|</span>
            <span className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              Anti-Cheat: Enabled
            </span>
          </div>
        </div>
      </div>

      {/* Jupiter Swap Modal */}
      <JupiterSwap 
        open={showSwapModal}
        onClose={() => setShowSwapModal(false)}
        onSwapComplete={handleSwapComplete}
      />
      
      {/* Battle Lobby Modal */}
      {showLobby && (
        <Lobby
          mode={selectedMode}
          game={selectedGame}
          onClose={() => setShowLobby(false)}
        />
      )}
    </div>
  );
}
