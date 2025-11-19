import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '../utils/sounds'

interface SettingsPanelProps {
  open: boolean
  onClose: () => void
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const [musicEnabled, setMusicEnabled] = useState(soundManager.isMusicEnabled())
  const [sfxEnabled, setSfxEnabled] = useState(soundManager.isSFXEnabled())

  const handleToggleMusic = () => {
    const newState = soundManager.toggleMusic()
    setMusicEnabled(newState)
    soundManager.playClick()
  }

  const handleToggleSFX = () => {
    const newState = soundManager.toggleSFX()
    setSfxEnabled(newState)
    if (newState) {
      soundManager.playClick()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - Click to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[998]"
          />

          {/* Slide-out Settings Sidebar */}
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '320px',
              zIndex: 12000,
              background: 'linear-gradient(180deg, #0e0f15 0%, #1a1a2e 50%, #16213e 100%)',
              borderLeft: '2px solid rgba(0, 255, 255, 0.3)',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Header with Close Button */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-400/20">
              <h2 className="text-2xl font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-3">
                <span className="text-3xl">⚙️</span>
                Settings
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-3xl transition-colors"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Settings List */}
            <div className="flex-1 overflow-y-auto p-6">
              <div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(0, 245, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  paddingLeft: '4px'
                }}>
                  Audio Controls
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <SettingItem
                    icon="🎵"
                    label="Background Music"
                    enabled={musicEnabled}
                    onToggle={handleToggleMusic}
                  />
                  <SettingItem
                    icon="🔊"
                    label="Sound Effects"
                    enabled={sfxEnabled}
                    onToggle={handleToggleSFX}
                  />
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="p-6 border-t border-cyan-400/20 text-center bg-black/20">
              <p style={{
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                color: '#00f5ff',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                Nova Arcade Glitch v1.1
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface SettingItemProps {
  icon: string
  label: string
  enabled: boolean
  onToggle: () => void
}

function SettingItem({ icon, label, enabled, onToggle }: SettingItemProps) {
  return (
    <motion.div
      whileHover={{ x: 6 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        padding: '14px 16px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%'
      }}
      onMouseEnter={(e: any) => {
        e.currentTarget.style.background = 'rgba(0, 245, 255, 0.08)';
        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)';
        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 245, 255, 0.15)';
      }}
      onMouseLeave={(e: any) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <span style={{ fontSize: '24px', lineHeight: 1 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '15px',
          fontWeight: 600,
          color: '#ffffff',
          letterSpacing: '0.3px'
        }}>
          {label}
        </div>
      </div>

      {/* Toggle Switch */}
      <div
        style={{
          position: 'relative',
          width: '56px',
          height: '28px',
          borderRadius: '14px',
          background: enabled 
            ? 'linear-gradient(135deg, #00ff88, #00cc6a)' 
            : 'rgba(255, 255, 255, 0.2)',
          boxShadow: enabled ? '0 0 20px rgba(0, 255, 136, 0.5)' : 'none',
          transition: 'all 0.3s'
        }}
      >
        <motion.div
          animate={{ x: enabled ? 28 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-lg"
        />
      </div>
    </motion.div>
  )
}
