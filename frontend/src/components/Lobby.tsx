import { useRef, RefObject, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Leaderboard from './Leaderboard'
import StakingInfo from './StakingInfo'
import { soundManager } from '../utils/sounds'
import { motion } from 'framer-motion'
// TokenGateOverlay removed - handled by LaunchHero instead

const games = [
  { id: 'snake', name: 'Snake Classic', sub: 'Retro grid runner', icon: '🐍', color: '#00ff88' },
  { id: 'flappy', name: 'Flappy Nova', sub: 'Tap to fly', icon: '🚁', color: '#ff4081' },
  { id: 'memory', name: 'Memory Match', sub: 'Flip and remember', icon: '🧠', color: '#6b46c1' },
  { id: 'bonk', name: 'Bonk Ryder', sub: 'Desert runner', icon: '🐴', color: '#ff6b35' },
  { id: 'paccoin', name: 'PacCoin', sub: 'Maze coin chaser', icon: '🟡', color: '#00e5ff' },
  { id: 'tetramem', name: 'TetraMem', sub: 'Falling blocks puzzle', icon: '🧩', color: '#ec4899' },
  { id: 'contra', name: 'Contra', sub: 'Side-scrolling shooter', icon: '🔫', color: '#00ff88' },
  { id: 'coming2', name: 'Speed Clicker', sub: 'Click as fast as you can', icon: '🎯', color: '#ff4081' },
  { id: 'coming3', name: 'Whack-A-Mole', sub: 'Hit the moles!', icon: '🔨', color: '#00e5ff' },
]

interface LobbyProps {
  onLaunch: (id: string) => void
  leaderboardOpen: boolean
  leaderboardGameId: string | null
  onOpenLeaderboard: (gameId: string | null) => void
  onCloseLeaderboard: () => void
  sectionRef?: RefObject<HTMLDivElement>
  highlightGameId?: string | null
}

export default function Lobby({
  onLaunch,
  leaderboardOpen,
  leaderboardGameId,
  onOpenLeaderboard,
  onCloseLeaderboard,
  sectionRef,
  highlightGameId
}: LobbyProps) {
  const navigate = useNavigate();
  const [selectedGameForBetting, setSelectedGameForBetting] = useState<string | null>(null);

  return (
      <div
      ref={sectionRef}
      style={{ padding: 24, margin: '40px auto', color: '#eaeaf0', position: 'relative', zIndex: 2 }}
    >
      <h2 style={{ 
        marginTop: 0, 
        fontFamily: '"Monoton", "Impact", cursive', 
        fontSize: 'clamp(32px, 5vw, 48px)',
        fontWeight: 400,
        textAlign: 'center',
        color: '#fff',
        marginBottom: 8,
        textShadow: `
          0 0 15px rgba(0, 255, 255, 1),
          0 0 30px rgba(0, 255, 255, 0.9),
          0 0 45px rgba(0, 255, 255, 0.7),
          0 0 60px rgba(168, 85, 247, 1),
          0 0 90px rgba(168, 85, 247, 0.8)
        `,
        letterSpacing: '0.1em',
        WebkitTextStroke: '1px rgba(0, 255, 255, 0.3)'
      }}>
        NOVA ARCADE GLITCH
      </h2>
      <p style={{ 
        opacity: 0.9, 
        textAlign: 'center',
        fontFamily: '"Rajdhani", "Helvetica", sans-serif',
        fontSize: 18,
        marginBottom: 16
      }}>
        Choose a game to start. Scores will sync to your wallet profile.
      </p>
      
      {/* Staking Info */}
      <StakingInfo />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginTop: 16
        }}
      >
        {games.map((g) => {
          const ref = useRef<HTMLDivElement>(null)
          const onMove = (e: React.MouseEvent) => {
            const el = ref.current
            if (!el) return
            const r = el.getBoundingClientRect()
            const px = (e.clientX - r.left) / r.width - 0.5
            const py = (e.clientY - r.top) / r.height - 0.5
            el.style.transform = `rotateX(${py * -8}deg) rotateY(${px * 8}deg) translateY(-4px)`
          }
          const onLeave = () => {
            const el = ref.current
            if (!el) return
            el.style.transform = 'translateY(0) rotateX(0) rotateY(0)'
          }
          const isHighlighted = highlightGameId === g.id

          return (
            <div
              key={g.id}
              ref={ref}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(16, 16, 30, 0.95) 100%)',
                border: `1px solid ${g.id === 'coming1' || g.id.startsWith('coming') ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 255, 136, 0.35)'}`,
                borderRadius: 16,
                padding: 20,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isHighlighted
                  ? '0 0 30px rgba(138, 240, 255, 0.4), 0 0 15px rgba(0, 255, 136, 0.35)'
                  : '0 10px 30px rgba(0, 0, 0, 0.35)',
                transition: 'box-shadow 0.3s ease'
              }}
            >
              {/* Glitch overlay */}
              <div style={{
                position: 'absolute',
                top: -50,
                left: -50,
                width: 100,
                height: 100,
                background: `radial-gradient(circle, ${g.color}40, transparent)`,
                opacity: 0.3,
                pointerEvents: 'none'
              }} />
              
              <div style={{ 
                fontSize: 64, 
                marginBottom: 16,
                filter: `drop-shadow(0 0 10px ${g.color})`
              }}>
                {g.icon}
              </div>
              <h3 style={{ 
                margin: '12px 0 4px', 
                fontSize: 20,
                fontFamily: '"Orbitron", "Helvetica", sans-serif',
                fontWeight: 700,
                color: g.color,
                textShadow: `0 0 10px ${g.color}60`
              }}>
                {g.name}
              </h3>
              <p style={{ 
                opacity: 0.8, 
                fontSize: 14, 
                marginBottom: 20,
                fontFamily: 'Rajdhani, sans-serif'
              }}>
                {g.sub}
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="glitch-btn" onClick={() => {
                  soundManager.playClick()
                  onLaunch(g.id)
                }}>
                  Play
                </button>
                <button
                  className="wallet-btn"
                  onClick={() => {
                    soundManager.playClick()
                    onOpenLeaderboard(g.id)
                  }}
                >
                  📊
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <Leaderboard gameId={leaderboardGameId} open={leaderboardOpen} onClose={onCloseLeaderboard} />
    </div>
  )
}



