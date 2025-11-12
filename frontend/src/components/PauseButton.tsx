import { motion } from 'framer-motion'

interface PauseButtonProps {
  isPaused: boolean
  onPause: () => void
  onResume: () => void
  cooldown: boolean
  speedBoostActive: boolean
}

export default function PauseButton({ isPaused, onPause, onResume, cooldown, speedBoostActive }: PauseButtonProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 70,
      left: 16,
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      <motion.button
        onClick={isPaused ? onResume : onPause}
        disabled={cooldown && !isPaused}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: isPaused 
            ? 'linear-gradient(135deg, #00ff88, #00cc6a)' 
            : cooldown 
            ? 'rgba(107, 70, 193, 0.5)' 
            : 'linear-gradient(135deg, #6b46c1, #8b5cf6)',
          border: `2px solid ${isPaused ? '#00ff88' : cooldown ? '#555' : '#8b5cf6'}`,
          borderRadius: 8,
          padding: '10px 16px',
          color: '#fff',
          cursor: cooldown && !isPaused ? 'not-allowed' : 'pointer',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 16,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          boxShadow: isPaused 
            ? '0 4px 16px rgba(0, 255, 136, 0.4)' 
            : '0 4px 16px rgba(107, 70, 193, 0.4)',
          opacity: cooldown && !isPaused ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: 20 }}>{isPaused ? '▶️' : '⏸️'}</span>
        <span>{isPaused ? 'Resume' : 'Pause'}</span>
      </motion.button>

      {/* Speed Boost Indicator */}
      {speedBoostActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: 'linear-gradient(135deg, #ff4081, #ff6b9d)',
            border: '2px solid #ff4081',
            borderRadius: 8,
            padding: '8px 12px',
            color: '#fff',
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 14,
            fontWeight: 600,
            textAlign: 'center',
            boxShadow: '0 4px 16px rgba(255, 64, 129, 0.4)',
            animation: 'pulse 0.5s ease-in-out infinite'
          }}
        >
          ⚡ 1.2x Speed!
        </motion.div>
      )}

      {/* Cooldown Indicator */}
      {cooldown && !isPaused && (
        <div style={{
          background: 'rgba(107, 70, 193, 0.2)',
          border: '1px solid rgba(107, 70, 193, 0.4)',
          borderRadius: 8,
          padding: '6px 10px',
          color: '#8b5cf6',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 12,
          textAlign: 'center'
        }}>
          Cooldown...
        </div>
      )}

      {/* Info Text */}
      {!isPaused && !cooldown && (
        <div style={{
          color: '#8af0ff',
          fontFamily: 'Rajdhani, sans-serif',
          fontSize: 11,
          opacity: 0.7,
          maxWidth: 120,
          lineHeight: 1.3
        }}>
          Unpause = 1.2x speed for 3s
        </div>
      )}
    </div>
  )
}
