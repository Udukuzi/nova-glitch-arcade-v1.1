import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sounds';

interface BattleArenaModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BattleArenaModal({ open, onClose }: BattleArenaModalProps) {
  const battleModes = [
    { id: '1v1', icon: '⚔️', title: '1v1 Duel', entry: 100, prize: 180, color: '#ff4444' },
    { id: 'team', icon: '👥', title: 'Team Battle', entry: 50, prize: 85, color: '#ff44ff' },
    { id: 'tournament', icon: '🏆', title: 'Tournament', entry: 500, prize: 5000, color: '#ffaa00' },
    { id: 'propool', icon: '💎', title: 'Pro Pool', entry: 1000, prize: '50K+', color: '#00aaff' },
    { id: 'practice', icon: '🎯', title: 'Practice', entry: 'FREE', prize: 'None', color: '#00ff44' },
    { id: 'royale', icon: '🔒', title: 'Battle Royale', entry: 'N/A', prize: 'N/A', color: '#666666', disabled: true }
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
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            {/* Modal - Same style as TokenomicsModal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '2px solid #00ff88',
                borderRadius: 20,
                padding: 32,
                maxWidth: 900,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 32,
                  color: '#00ff88',
                  textTransform: 'uppercase'
                }}>
                  ⚔️ Battle Arena
                </h2>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8af0ff',
                    fontSize: 28,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Subtitle */}
              <p style={{
                color: '#8af0ff',
                marginBottom: 24,
                fontSize: 14,
                fontStyle: 'italic'
              }}>
                X402 Live PvP Gaming - Choose your battle mode
              </p>

              {/* Battle Modes Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}>
                {battleModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={!mode.disabled ? { scale: 1.05 } : {}}
                    whileTap={!mode.disabled ? { scale: 0.95 } : {}}
                    onClick={() => handleModeClick(mode)}
                    disabled={mode.disabled}
                    style={{
                      background: mode.disabled 
                        ? 'rgba(50, 50, 50, 0.3)' 
                        : `linear-gradient(135deg, ${mode.color}22, ${mode.color}44)`,
                      border: `2px solid ${mode.color}`,
                      borderRadius: 12,
                      padding: 16,
                      cursor: mode.disabled ? 'not-allowed' : 'pointer',
                      opacity: mode.disabled ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{mode.icon}</div>
                    <h3 style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      fontFamily: 'Orbitron, sans-serif'
                    }}>
                      {mode.title}
                    </h3>
                    <div style={{ fontSize: 12, color: '#8af0ff', marginBottom: 4 }}>
                      Entry: {typeof mode.entry === 'number' ? `${mode.entry} $NAG` : mode.entry}
                    </div>
                    <div style={{ fontSize: 12, color: '#00ff88' }}>
                      Prize: {typeof mode.prize === 'number' ? `${mode.prize} $NAG` : mode.prize}
                    </div>
                    {mode.disabled && (
                      <div style={{ color: '#666666', fontSize: 10, marginTop: 8 }}>
                        Coming Soon
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Info Section */}
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <h3 style={{ color: '#00ff88', fontSize: 16, marginBottom: 8 }}>How It Works</h3>
                <ul style={{ color: '#8af0ff', fontSize: 14, listStyle: 'none', padding: 0 }}>
                  <li>• Select a game mode to enter the arena</li>
                  <li>• Stake your $NAG tokens as entry fee</li>
                  <li>• Win matches to earn prize pools</li>
                  <li>• Climb the leaderboard for bonus rewards</li>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
