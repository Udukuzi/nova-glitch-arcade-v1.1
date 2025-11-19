import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'

interface LeaderboardProps {
  gameId: string | null
  open: boolean
  onClose: () => void
}

interface Score {
  address: string
  game?: string
  score: number
  started_at?: string
}

export default function Leaderboard({ gameId, open, onClose }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(10)
  const [playerRank, setPlayerRank] = useState<number | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchLeaderboard = () => {
    setLoading(true)
    // Sanitize gameId to prevent path traversal and XSS
    const sanitizedGameId = gameId ? gameId.replace(/[^a-zA-Z0-9-]/g, '') : null
    
    api.getLeaderboard(sanitizedGameId || undefined)
      .then(data => {
        setScores(data.leaderboard || [])
        setLastUpdate(new Date())
        
        // Find player's rank
        const walletAddress = localStorage.getItem('wallet_address')
        if (walletAddress) {
          const rank = (data.leaderboard || []).findIndex((s: Score) => 
            s.address.toLowerCase() === walletAddress.toLowerCase()
          )
          setPlayerRank(rank >= 0 ? rank + 1 : null)
        }
        
        setLoading(false)
      })
      .catch(() => {
        setScores([])
        setLoading(false)
      })
  }

  useEffect(() => {
    if (open) {
      fetchLeaderboard()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchLeaderboard, 30000)
      return () => clearInterval(interval)
    }
  }, [open, gameId])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 50,
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 600,
              maxWidth: '90vw',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: '2px solid #00ff88',
              borderRadius: 16,
              padding: 24,
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ 
                margin: 0, 
                color: '#00ff88', 
                fontFamily: 'Orbitron, sans-serif',
                fontSize: 24,
                textTransform: 'uppercase'
              }}>
                🏆 {gameId ? gameId.replace(/[^a-zA-Z0-9-]/g, '').toUpperCase() : 'ALL GAMES'}
              </h3>
              <button
                onClick={fetchLeaderboard}
                style={{
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid #00ff88',
                  borderRadius: 8,
                  padding: '6px 12px',
                  color: '#00ff88',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontFamily: 'Rajdhani, sans-serif'
                }}
              >
                🔄 Refresh
              </button>
            </div>

            {/* Player Rank */}
            {playerRank && (
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '2px solid #00ff88',
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                <span style={{ color: '#00ff88', fontFamily: 'Rajdhani, sans-serif', fontSize: 16, fontWeight: 600 }}>
                  Your Rank: #{playerRank}
                </span>
              </div>
            )}

            {/* Limit Selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
              {[10, 20, 50].map(num => (
                <button
                  key={num}
                  onClick={() => setLimit(num)}
                  style={{
                    background: limit === num ? '#00ff88' : 'rgba(255, 255, 255, 0.1)',
                    border: `1px solid ${limit === num ? '#00ff88' : '#1e2236'}`,
                    borderRadius: 8,
                    padding: '6px 16px',
                    color: limit === num ? '#000' : '#eaeaf0',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontFamily: 'Rajdhani, sans-serif',
                    fontWeight: 600
                  }}
                >
                  Top {num}
                </button>
              ))}
            </div>

            {/* Scores */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#8af0ff', fontFamily: 'Rajdhani, sans-serif' }}>Loading...</p>
              </div>
            ) : scores.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40 }}>
                <p style={{ color: '#888', fontFamily: 'Rajdhani, sans-serif' }}>No scores yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {scores.slice(0, limit).map((s, i) => {
                  const isPlayer = s.address.toLowerCase() === localStorage.getItem('wallet_address')?.toLowerCase()
                  const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
                  
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 12,
                        background: isPlayer 
                          ? 'rgba(0, 255, 136, 0.2)' 
                          : i < 3 
                          ? 'rgba(138, 240, 255, 0.1)' 
                          : 'rgba(255, 255, 255, 0.05)',
                        border: `2px solid ${isPlayer ? '#00ff88' : i < 3 ? '#8af0ff' : '#1e2236'}`,
                        borderRadius: 8,
                        fontFamily: 'Rajdhani, sans-serif'
                      }}
                    >
                      <span style={{ color: '#eaeaf0', fontSize: 16, fontWeight: 600 }}>
                        {medal} #{i + 1} {s.address ? `${s.address.slice(0, 6)}...${s.address.slice(-4)}` : 'Unknown'}
                        {isPlayer && <span style={{ color: '#00ff88', marginLeft: 8 }}>(You)</span>}
                      </span>
                      <span style={{ color: '#8af0ff', fontWeight: 'bold', fontSize: 18 }}>{s.score.toLocaleString()}</span>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Footer */}
            <div style={{ 
              marginTop: 16, 
              paddingTop: 16, 
              borderTop: '1px solid #1e2236',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#8af0ff', fontSize: 12, fontFamily: 'Rajdhani, sans-serif', opacity: 0.7 }}>
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <button onClick={onClose} className="glitch-btn" style={{ padding: '8px 24px' }}>
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
