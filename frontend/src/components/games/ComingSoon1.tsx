import { useState, useEffect } from 'react'
import '../Scanlines.css'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'

interface ClickerProps {
  onGameOver: (score: number) => void
}

export default function Clicker({ onGameOver }: ClickerProps) {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameActive, setGameActive] = useState(true)
  const [multiplier, setMultiplier] = useState(1)
  const [combo, setCombo] = useState(0)
  const [buttonSize, setButtonSize] = useState(200)
  const [buttonColor, setButtonColor] = useState('#ff6b00')
  const [isShaking, setIsShaking] = useState(false)
  const { status } = useAIMonitoring()

  useEffect(() => {
    if (timeLeft > 0 && gameActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setGameActive(false)
      onGameOver(score)
    }
  }, [timeLeft, gameActive, score, onGameOver])

  const handleClick = () => {
    if (!gameActive) return
    
    // Combo system - faster clicks = higher combo
    setCombo(prev => Math.min(prev + 1, 50))
    
    // Points calculation with combo bonus
    const basePoints = 1
    const comboBonus = Math.floor(combo / 10) // +1 for every 10 combo
    const points = (basePoints + comboBonus) * multiplier
    setScore(prev => prev + points)
    
    // Visual feedback
    setIsShaking(true)
    setTimeout(() => setIsShaking(false), 100)
    
    // Dynamic button changes
    const newSize = Math.max(150, 200 - combo * 2) // Button shrinks with combo
    setButtonSize(newSize)
    
    // Color intensity based on combo
    const intensity = Math.min(combo * 5, 255)
    setButtonColor(`rgb(${255}, ${Math.max(107 - intensity/4, 0)}, 0)`)
    
    // Increase multiplier every 100 points
    if ((score + points) % 100 === 0) {
      setMultiplier(prev => prev + 1)
    }
  }
  
  // Combo decay effect
  useEffect(() => {
    if (combo > 0 && gameActive) {
      const decay = setTimeout(() => {
        setCombo(prev => Math.max(0, prev - 1))
        if (combo <= 1) {
          setButtonSize(200)
          setButtonColor('#ff6b00')
        }
      }, 1000)
      return () => clearTimeout(decay)
    }
  }, [combo, gameActive])

  return (
    <div style={{ color: '#eaeaf0', textAlign: 'center', padding: '20px', position: 'relative' }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28 }}>Speed Clicker</h2>
      
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 24, color: '#00ff88', marginBottom: 10 }}>
          Score: {score}
        </div>
        <div style={{ fontSize: 18, color: '#8af0ff', marginBottom: 5 }}>
          Time: {timeLeft}s | Multiplier: x{multiplier}
        </div>
        <div style={{ fontSize: 16, color: '#ff6b00', fontWeight: 'bold' }}>
          Combo: {combo} {combo >= 10 && '🔥'} {combo >= 25 && '⚡'} {combo >= 40 && '💥'}
        </div>
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px'
      }}>
        <button
          onClick={handleClick}
          disabled={!gameActive}
          style={{
            width: buttonSize,
            height: buttonSize,
            borderRadius: '50%',
            background: gameActive 
              ? `linear-gradient(135deg, ${buttonColor}, #ff4081)` 
              : 'linear-gradient(135deg, #666, #444)',
            border: `4px solid ${gameActive ? buttonColor : '#666'}`,
            color: '#fff',
            fontSize: Math.max(16, 24 - combo * 0.2),
            fontWeight: 'bold',
            cursor: gameActive ? 'pointer' : 'not-allowed',
            transition: 'all 0.1s ease',
            boxShadow: gameActive 
              ? `0 0 ${30 + combo}px ${buttonColor}80` 
              : 'none',
            transform: isShaking ? 'scale(0.95) rotate(2deg)' : 'scale(1)',
            fontFamily: 'Orbitron, sans-serif',
            filter: combo > 20 ? 'brightness(1.2)' : 'brightness(1)'
          }}
          onMouseDown={(e) => {
            if (gameActive) e.currentTarget.style.transform = 'scale(0.95)'
          }}
          onMouseUp={(e) => {
            if (gameActive) e.currentTarget.style.transform = 'scale(1)'
          }}
          onMouseLeave={(e) => {
            if (gameActive) e.currentTarget.style.transform = 'scale(1)'
          }}
        >
          {gameActive ? 'CLICK!' : 'GAME OVER'}
        </button>
      </div>

      <p style={{ opacity: 0.8, marginTop: 20, fontFamily: 'Rajdhani, sans-serif' }}>
        🎯 Build combos for bonus points! • Button shrinks and glows with combo! • Multiplier every 100 points!
      </p>

      {/* AI Monitoring Indicator */}
      <AIMonitoringIndicator 
        status={status} 
        position="bottom-right" 
        size="small" 
      />
    </div>
  )
}












