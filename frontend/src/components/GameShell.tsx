import { useState, useEffect, useRef } from 'react'
import Snake from './games/Snake'
import Flappy from './games/Flappy'
import MemoryMatch from './games/MemoryMatch'
import BonkRyder from './games/BonkRyder'
import PacCoin from './games/PacCoin'
import TetraMem from './games/TetraMem'
import Contra from './games/Contra'
import Clicker from './games/ComingSoon1'
import ComingSoon2 from './games/ComingSoon2'
import WhackAMole from './games/ComingSoon3'
import MobileGamepad from './MobileGamepad'
import SettingsPanel from './SettingsPanel'
import Toast, { useToast } from './Toast'
import { soundManager } from '../utils/sounds'
import { getMultiplierByAmount } from '../utils/multiplier'
import { trackGameCompletion } from '../utils/achievementTracker'
import { GameLeaderboard } from './GameLeaderboard'

interface GameShellProps {
  gameId: string
  onBack: () => void
}

const mobileControls: Record<string, string> = {
  snake: 'Use arrow buttons to move the snake. Collect food to grow!',
  flappy: 'Tap the space button to make the bird flap and avoid pipes!',
  memory: 'Tap cards to flip them. Match pairs to win!',
  bonk: 'Use arrow buttons to move left/right and space to jump!',
  paccoin: 'Use arrow buttons to move around the maze. Collect coins!',
  tetramem: 'Use arrow buttons to move blocks. ↻ button to rotate, ↓ button for hard drop!',
  contra: 'Use arrow buttons to move, jump, and duck. Space button to shoot!',
  coming2: 'Coming soon!',
  coming3: 'Coming soon!'
}

export default function GameShell({ gameId, onBack }: GameShellProps) {
  const [score, setScore] = useState(0)
  const [showMobileHelp, setShowMobileHelp] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [gameKey, setGameKey] = useState(0)
  const [multiplier, setMultiplier] = useState(1.0)
  const [tier, setTier] = useState<'guest' | 'holder' | 'staker' | 'whale'>('guest')
  const failureSoundRef = useRef<HTMLAudioElement | null>(null)
  const gameStartTimeRef = useRef<number>(Date.now())
  const toast = useToast()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setGameKey(prev => prev + 1)
    setScore(0)
    gameStartTimeRef.current = Date.now() // Reset game start time
    if (failureSoundRef.current) {
      failureSoundRef.current.pause()
      failureSoundRef.current = null
    }
    
    // Get user tier and multiplier
    const userData = localStorage.getItem('wallet_user')
    if (userData) {
      try {
        const user = JSON.parse(userData)
        const tokenBalance = user.tokenBalance || 0
        const stakedAmount = user.stakedAmount || 0
        const { multiplier: mult, tier: userTier } = getMultiplierByAmount(tokenBalance, stakedAmount)
        setMultiplier(mult)
        setTier(userTier)
      } catch (e) {
        console.log('Failed to parse user data:', e)
      }
    }
  }, [gameId])

  useEffect(() => {
    failureSoundRef.current = new Audio('/game-over.mp3')
    failureSoundRef.current.volume = 0.5

    return () => {
      if (failureSoundRef.current) {
        failureSoundRef.current.pause()
        failureSoundRef.current = null
      }
    }
  }, [])

  const handleGameOver = (finalScore: number) => {
    // Play failure sound immediately
    if (failureSoundRef.current) {
      failureSoundRef.current.currentTime = 0
      failureSoundRef.current.play().catch(err => {
        console.log('Game over sound failed:', err)
      })
    }

    // Apply multiplier to score
    const finalScoreWithMultiplier = Math.floor(finalScore * multiplier)
    setScore(finalScoreWithMultiplier)

    // Calculate game duration
    const duration = Math.floor((Date.now() - gameStartTimeRef.current) / 1000)

    // Track achievements
    const gameNames: Record<string, string> = {
      snake: 'Snake Classic',
      flappy: 'Flappy Nova',
      memory: 'Memory Match',
      bonk: 'Bonk Ryder',
      paccoin: 'PacCoin',
      tetramem: 'TetraMem',
      contra: 'Contra',
      coming2: 'Speed Clicker',
      coming3: 'Whack-A-Mole'
    }

    trackGameCompletion({
      game: gameNames[gameId] || gameId,
      score: finalScoreWithMultiplier,
      duration,
      didWin: finalScoreWithMultiplier > 0 // Consider any score > 0 as a win
    }).catch(err => console.log('Achievement tracking failed:', err))

    // Show alert with multiplier info after sound starts
    setTimeout(() => {
      const multiplierText = multiplier > 1.0 ? ` (${multiplier}x ${tier} bonus: ${finalScore} → ${finalScoreWithMultiplier})` : ''
      alert(`Game Over! Score: ${finalScoreWithMultiplier}${multiplierText}`)
    }, 500)
  }

  const gameInfo: Record<string, { name: string; comp: React.ReactNode }> = {
    snake: { name: 'Snake Classic', comp: <Snake key={gameKey} onGameOver={handleGameOver} /> },
    flappy: { name: 'Flappy Nova', comp: <Flappy key={gameKey} onGameOver={handleGameOver} /> },
    memory: { name: 'Memory Match', comp: <MemoryMatch key={gameKey} onGameOver={handleGameOver} /> },
    bonk: { name: 'Bonk Ryder', comp: <BonkRyder key={gameKey} onGameOver={handleGameOver} /> },
    paccoin: { name: 'PacCoin', comp: <PacCoin key={gameKey} onGameOver={handleGameOver} /> },
    tetramem: { name: 'TetraMem', comp: <TetraMem key={gameKey} onGameOver={handleGameOver} /> },
    contra: { name: 'Contra', comp: <Contra key={gameKey} onGameOver={handleGameOver} /> },
    coming2: { name: 'Speed Clicker', comp: <Clicker key={gameKey} onGameOver={handleGameOver} /> },
    coming3: { name: 'Whack-A-Mole', comp: <WhackAMole key={gameKey} onGameOver={handleGameOver} /> }
  }

  const current = gameInfo[gameId] || { name: 'Unknown', comp: <div>Game not found</div> }

  const handleBack = () => {
    soundManager.playClick()
    if (failureSoundRef.current) {
      failureSoundRef.current.pause()
      failureSoundRef.current = null
    }
    setGameKey(prev => prev + 1)
    onBack()
  }

  return (
    <div style={{ padding: 16, minHeight: '100vh', position: 'relative' }}>
      <button
        onClick={handleBack}
        className="glitch-btn"
        style={{
          position: 'fixed',
          left: 16,
          top: 16,
          zIndex: 100,
          padding: '8px 16px',
          fontSize: 14
        }}
      >
        ← Back
      </button>

      {/* Top Right Buttons */}
      <div style={{
        position: 'fixed',
        right: 80,
        top: 16,
        zIndex: 100,
        display: 'flex',
        gap: 12
      }}>
        <button
          onClick={() => {
            soundManager.playClick()
            setShowSettings(true)
          }}
          className="glitch-btn"
          title="Settings"
          style={{
            fontSize: 20,
            padding: '8px 16px',
            minWidth: 'auto'
          }}
        >
          ⚙️
        </button>
        {isMobile && mobileControls[gameId] && gameId !== 'memory' && (
          <button
            onClick={() => {
              soundManager.playClick()
              setShowMobileHelp(!showMobileHelp)
            }}
            style={{
              background: '#6b46c1',
              border: '1px solid #8b5cf6',
              borderRadius: 8,
              padding: '8px 12px',
              color: '#eaeaf0',
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 14
            }}
          >
            📱 Help
          </button>
        )}
      </div>

      {showMobileHelp && isMobile && mobileControls[gameId] && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 200,
          background: 'rgba(14, 15, 21, 0.95)',
          border: '2px solid #6b46c1',
          borderRadius: 16,
          padding: 24,
          maxWidth: '90%',
          boxShadow: '0 0 40px rgba(107, 70, 193, 0.5)',
          backdropFilter: 'blur(10px)'
        }}>
          <button
            onClick={() => setShowMobileHelp(false)}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: 'transparent',
              border: 'none',
              color: '#eaeaf0',
              fontSize: 24,
              cursor: 'pointer'
            }}
          >
            ×
          </button>
          <h3 style={{
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 20,
            marginBottom: 16,
            color: '#6b46c1'
          }}>
            📱 Mobile Controls
          </h3>
          <p style={{
            fontFamily: 'Rajdhani, sans-serif',
            fontSize: 16,
            lineHeight: 1.6,
            color: '#eaeaf0',
            marginBottom: 12
          }}>
            {mobileControls[gameId]}
          </p>
          <div style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid #1e2236',
            fontSize: 12,
            color: '#8af0ff',
            opacity: 0.7
          }}>
            💡 Tip: Rotate your device to landscape for better gameplay!
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        marginTop: 60,
        paddingBottom: isMobile ? 200 : 80
      }}>
        <h2 style={{
          color: '#eaeaf0',
          marginBottom: 24,
          fontFamily: 'Orbitron, sans-serif',
          fontSize: isMobile ? 24 : 32,
          textAlign: 'center'
        }}>
          {current.name}
        </h2>
        {current.comp}
        
        {/* Game-Specific Leaderboard */}
        <GameLeaderboard gameId={gameId} gameName={current.name} />
      </div>

      {/* Mobile Gamepad Controller - Not for Memory Match (touch game) */}
      {gameId !== 'memory' && <MobileGamepad gameId={gameId} />}

          {!isMobile && (
            <div style={{
              position: 'fixed',
              right: 16,
              bottom: 16,
              background: '#0e0f15',
              border: '1px solid #1e2236',
              borderRadius: 12,
              padding: 12,
              zIndex: 50
            }}>
              <div style={{ color: '#eaeaf0', fontFamily: 'Orbitron, sans-serif', fontSize: 18, marginBottom: 8 }}>
                Score: {score}
              </div>
              {multiplier > 1.0 && (
                <div style={{ 
                  color: '#8b5cf6', 
                  fontFamily: 'Rajdhani, sans-serif', 
                  fontSize: 12,
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>
                  {multiplier}x {tier} bonus
                </div>
              )}
            </div>
          )}

      {/* Settings Panel */}
      <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />

      {/* Toast Notifications */}
      <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}
