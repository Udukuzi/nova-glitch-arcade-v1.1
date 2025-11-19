import { useState, useEffect } from 'react'
import '../Scanlines.css'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'

interface WhackAMoleProps {
  onGameOver: (score: number) => void
}

export default function WhackAMole({ onGameOver }: WhackAMoleProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(45)
  const [gameActive, setGameActive] = useState(true)
  const [moles, setMoles] = useState<boolean[]>(new Array(9).fill(false))
  const [moleTimers, setMoleTimers] = useState<NodeJS.Timeout[]>([])
  const { status } = useAIMonitoring()

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameActive(false)
      moleTimers.forEach(timer => clearTimeout(timer))
      onGameOver(score)
    }
  }, [timeLeft, gameActive, score, onGameOver, moleTimers])

  useEffect(() => {
    if (gameActive) {
      const spawnMole = () => {
        const availableHoles = moles.map((mole, index) => !mole ? index : -1).filter(index => index !== -1)
        if (availableHoles.length === 0) return

        const randomHole = availableHoles[Math.floor(Math.random() * availableHoles.length)]
        const newMoles = [...moles]
        newMoles[randomHole] = true
        setMoles(newMoles)

        const hideTimer = setTimeout(() => {
          setMoles(prev => {
            const updated = [...prev]
            updated[randomHole] = false
            return updated
          })
        }, 1500 + Math.random() * 1000) // Mole stays up 1.5-2.5 seconds

        setMoleTimers(prev => [...prev, hideTimer])
      }

      const spawnInterval = setInterval(spawnMole, 800 + Math.random() * 400) // Spawn every 0.8-1.2 seconds
      spawnMole() // Spawn first mole immediately

      return () => {
        clearInterval(spawnInterval)
        moleTimers.forEach(timer => clearTimeout(timer))
      }
    }
  }, [gameActive])

  const whackMole = (index: number) => {
    if (!gameActive || !moles[index]) return

    setScore(prev => prev + 10)
    setMoles(prev => {
      const updated = [...prev]
      updated[index] = false
      return updated
    })

    // Clear the hide timer for this mole
    moleTimers.forEach(timer => clearTimeout(timer))
    setMoleTimers([])
  }

  return (
    <div style={{ color: '#eaeaf0', textAlign: 'center', padding: '20px', position: 'relative' }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28 }}>Whack-A-Mole</h2>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, color: '#00ff88', marginBottom: 10 }}>
          Score: {score}
        </div>
        <div style={{ fontSize: 18, color: '#8af0ff' }}>
          Time: {timeLeft}s
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '15px',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px'
      }}>
        {moles.map((isMoleUp, index) => (
          <div
            key={index}
            onClick={() => whackMole(index)}
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#2d1b69',
              border: '3px solid #6b46c1',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: gameActive ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              boxShadow: isMoleUp 
                ? '0 0 20px rgba(255, 107, 0, 0.6), inset 0 0 20px rgba(255, 107, 0, 0.2)' 
                : '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 4px 8px rgba(107, 70, 193, 0.2)',
              transform: isMoleUp ? 'scale(1.1)' : 'scale(1)',
              background: isMoleUp 
                ? 'radial-gradient(circle, #ff6b00, #ff4081)' 
                : 'radial-gradient(circle, #2d1b69, #1a0f3d)'
            }}
          >
            <div style={{ 
              fontSize: isMoleUp ? '40px' : '20px',
              transition: 'all 0.2s ease',
              opacity: isMoleUp ? 1 : 0.3
            }}>
              {isMoleUp ? '🐹' : '🕳️'}
            </div>
          </div>
        ))}
      </div>

      <p style={{ opacity: 0.8, marginTop: 20, fontFamily: 'Rajdhani, sans-serif' }}>
        🔨 Click the moles as they pop up! • 10 points per mole • Be quick!
      </p>

      {/* AI Monitoring Indicator */}
      <AIMonitoringIndicator 
        status={status} 
        position="bottom-left" 
        size="small" 
      />
    </div>
  )
}












