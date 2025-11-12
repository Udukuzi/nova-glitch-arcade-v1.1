import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sounds';

interface BattleArenaModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BattleArenaModal({ open, onClose }: BattleArenaModalProps) {
  const battleModes = [
    { id: '1v1', icon: '⚔️', title: '1v1 Duel', entry: 100, prize: 180, color: 'from-red-500 to-orange-500' },
    { id: 'team', icon: '👥', title: 'Team Battle', entry: 50, prize: 85, color: 'from-purple-500 to-pink-500' },
    { id: 'tournament', icon: '🏆', title: 'Tournament', entry: 500, prize: 5000, color: 'from-yellow-500 to-amber-500' },
    { id: 'propool', icon: '💎', title: 'Pro Pool', entry: 1000, prize: '50K+', color: 'from-cyan-500 to-blue-500' },
    { id: 'practice', icon: '🎯', title: 'Practice', entry: 'FREE', prize: 'None', color: 'from-green-500 to-emerald-500' },
    { id: 'royale', icon: '🔒', title: 'Battle Royale', entry: 'N/A', prize: 'N/A', color: 'from-gray-500 to-gray-600', disabled: true }
  ];

  const handleModeClick = (mode: any) => {
    if (!mode.disabled) {
      soundManager.playClick();
      console.log('Selected mode:', mode.id);
      // Handle mode selection
    }
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl p-8 max-w-5xl w-full shadow-2xl border border-purple-500/30">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 
                  className="text-5xl md:text-6xl font-bold mb-2"
                  style={{
                    fontFamily: '"Monoton", cursive',
                    background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF69B4, #00FFFF)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 40px rgba(255,215,0,0.5), 0 0 80px rgba(255,105,180,0.3)',
                    letterSpacing: '0.05em'
                  }}
                >
                  BATTLE ARENA
                </h1>
                <p className="text-gray-400 text-sm italic">X402 Live PvP Gaming</p>
              </div>

              {/* Battle Modes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {battleModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={!mode.disabled ? { scale: 1.05, y: -5 } : {}}
                    whileTap={!mode.disabled ? { scale: 0.95 } : {}}
                    onClick={() => handleModeClick(mode)}
                    disabled={mode.disabled}
                    className={`relative overflow-hidden rounded-xl p-4 border ${
                      mode.disabled 
                        ? 'opacity-50 cursor-not-allowed border-gray-600' 
                        : 'cursor-pointer border-purple-500/30 hover:border-purple-400/50'
                    } backdrop-blur-xl transition-all`}
                    style={{
                      background: mode.disabled 
                        ? 'rgba(50,50,50,0.3)' 
                        : 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(100,0,200,0.1))'
                    }}
                  >
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-20`}></div>
                    
                    <div className="relative z-10">
                      <div className="text-3xl mb-2">{mode.icon}</div>
                      <h3 className="text-white font-bold text-sm mb-2">{mode.title}</h3>
                      <div className="text-xs space-y-1">
                        <div className="text-yellow-400">
                          Entry: {typeof mode.entry === 'number' ? `${mode.entry} $NAG` : mode.entry}
                        </div>
                        <div className="text-green-400">
                          Prize: {typeof mode.prize === 'number' ? `${mode.prize} $NAG` : mode.prize}
                        </div>
                      </div>
                      {mode.disabled && (
                        <div className="text-gray-500 text-xs mt-2">Coming Soon</div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Close Button */}
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl text-white font-bold shadow-lg shadow-red-500/30 transition-all"
                >
                  Close Arena
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
