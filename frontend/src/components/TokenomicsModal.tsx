import { motion, AnimatePresence } from 'framer-motion'
import { soundManager } from '../utils/sounds'

interface TokenomicsModalProps {
  open: boolean
  onClose: () => void
}

export default function TokenomicsModal({ open, onClose }: TokenomicsModalProps) {
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
            {/* Modal */}
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
                maxWidth: 800,
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
                  💰 $NAG Tokenomics
                </h2>
                <button
                  onClick={() => {
                    soundManager.playClick()
                    onClose()
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

              {/* Total Supply */}
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '2px solid #00ff88',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                textAlign: 'center'
              }}>
                <div style={{ color: '#8af0ff', fontSize: 14, fontFamily: 'Rajdhani, sans-serif', marginBottom: 8 }}>
                  Total Supply
                </div>
                <div style={{ color: '#00ff88', fontSize: 36, fontFamily: 'Orbitron, sans-serif', fontWeight: 700 }}>
                  1,000,000,000 NAG
                </div>
              </div>

              {/* Distribution */}
              <h3 style={{ color: '#8af0ff', fontFamily: 'Orbitron, sans-serif', fontSize: 20, marginBottom: 16 }}>
                Token Distribution
              </h3>
              {/* 100% Community Notice */}
              <div style={{
                background: 'rgba(0, 255, 136, 0.15)',
                border: '2px solid #00ff88',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                textAlign: 'center'
              }}>
                <div style={{ color: '#00ff88', fontSize: 18, fontFamily: 'Orbitron, sans-serif', fontWeight: 700, marginBottom: 8 }}>
                  ✅ 100% COMMUNITY-OWNED
                </div>
                <div style={{ color: '#8af0ff', fontSize: 14, fontFamily: 'Rajdhani, sans-serif' }}>
                  NO Team Tokens • NO Vested Allocations • NO VC Allocations
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  { label: 'Community Rewards Pool', percent: 60, amount: '600M', color: '#00ff88' },
                  { label: 'Liquidity Pool', percent: 25, amount: '250M', color: '#8af0ff' },
                  { label: 'Community Treasury (DAO)', percent: 10, amount: '100M', color: '#6b46c1' },
                  { label: 'Marketing & Partnerships', percent: 5, amount: '50M', color: '#ec4899' }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 8,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: item.color
                      }} />
                      <span style={{ color: '#eaeaf0', fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 600 }}>
                        {item.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ color: '#8af0ff', fontFamily: 'Orbitron, sans-serif', fontSize: 16 }}>
                        {item.amount}
                      </span>
                      <span style={{ color: item.color, fontFamily: 'Orbitron, sans-serif', fontSize: 18, fontWeight: 600 }}>
                        {item.percent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Utility */}
              <h3 style={{ color: '#8af0ff', fontFamily: 'Orbitron, sans-serif', fontSize: 20, marginBottom: 16 }}>
                Token Utility
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
                {[
                  { icon: '⚡', title: 'Score Multipliers', desc: 'Up to 3x score boost' },
                  { icon: '🏆', title: 'Exclusive Access', desc: 'VIP tournaments & games' },
                  { icon: '🎁', title: 'Airdrops', desc: 'Future token rewards' },
                  { icon: '🗳️', title: 'Governance', desc: 'Vote on game features' },
                  { icon: '🎨', title: 'NFT Minting', desc: 'Special game NFTs' },
                  { icon: '💎', title: 'Staking Rewards', desc: 'Earn passive income' }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: 'rgba(0, 255, 136, 0.05)',
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
                    <div style={{ color: '#00ff88', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ color: '#8af0ff', fontFamily: 'Rajdhani, sans-serif', fontSize: 12, opacity: 0.8 }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>

              {/* Play-to-Earn Tiers */}
              <h3 style={{ color: '#8af0ff', fontFamily: 'Orbitron, sans-serif', fontSize: 20, marginBottom: 16 }}>
                Play-to-Earn Access Tiers
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { tier: 'Entry Access', icon: '🎮', tokens: '100,000 NAG (0.01%)', multiplier: '1.0x', color: '#8af0ff', desc: 'Unlimited plays + airdrop eligibility' },
                  { tier: 'Enhanced', icon: '💎', tokens: '250,000 NAG (0.025%)', multiplier: '1.5x', color: '#00ff88', desc: 'Unlimited plays + priority support' },
                  { tier: 'Premium', icon: '🔒', tokens: '500,000 NAG (0.05%)', multiplier: '2.0x', color: '#a855f7', desc: 'Unlimited plays + early beta access' },
                  { tier: 'Maximum', icon: '🐋', tokens: '1,000,000+ NAG (0.1%)', multiplier: '3.0x', color: '#ff4081', desc: 'Max rewards + governance rights' }
                ].map((item, i) => (
                  <div key={i} style={{
                    background: `linear-gradient(90deg, ${item.color}10, transparent)`,
                    border: `2px solid ${item.color}`,
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ fontSize: 28 }}>{item.icon}</div>
                        <div>
                          <div style={{ color: item.color, fontFamily: 'Orbitron, sans-serif', fontSize: 16, fontWeight: 600 }}>
                            {item.tier}
                          </div>
                          <div style={{ color: '#8af0ff', fontFamily: 'Rajdhani, sans-serif', fontSize: 13 }}>
                            {item.tokens}
                          </div>
                        </div>
                      </div>
                      <div style={{ color: '#8af0ff', fontFamily: 'Rajdhani, sans-serif', fontSize: 12, opacity: 0.8, paddingLeft: 40 }}>
                        {item.desc}
                      </div>
                    </div>
                    <div style={{ color: item.color, fontFamily: 'Orbitron, sans-serif', fontSize: 22, fontWeight: 700, flexShrink: 0 }}>
                      {item.multiplier}
                    </div>
                  </div>
                ))}
              </div>

              {/* Close Button */}
              <button
                onClick={() => {
                  soundManager.playClick()
                  onClose()
                }}
                className="glitch-btn"
                style={{ width: '100%', padding: '12px 24px', fontSize: 16 }}
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
