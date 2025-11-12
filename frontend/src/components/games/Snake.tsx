import { useEffect, useRef, useState } from 'react'
import '../Scanlines.css'

interface SnakeProps {
  onGameOver: (score: number) => void
}

export default function Snake({ onGameOver }: SnakeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const scoreRef = useRef(0)
  const gameSpeedRef = useRef(250) // Much slower initial speed
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const size = 20

  useEffect(() => {
    isMountedRef.current = true
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Reset game state
    scoreRef.current = 0
    setScore(0)
    gameSpeedRef.current = 250

    const cols = Math.floor(canvas.width / size)
    const rows = Math.floor(canvas.height / size)
    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    let food = { x: 15, y: 15 }
    let dir = { x: 1, y: 0 }
    let nextDir = { x: 1, y: 0 }
    let frameCount = 0
    let gameRunning = true

    // Draw grid
    const drawGrid = () => {
      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 0.5
      for (let i = 0; i <= cols; i++) {
        ctx.beginPath()
        ctx.moveTo(i * size, 0)
        ctx.lineTo(i * size, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i <= rows; i++) {
        ctx.beginPath()
        ctx.moveTo(0, i * size)
        ctx.lineTo(canvas.width, i * size)
        ctx.stroke()
      }
    }

    // Draw snake segment with improved graphics
    const drawSnakeSegment = (x: number, y: number, isHead: boolean, index: number) => {
      const px = x * size
      const py = y * size
      const padding = 1

      ctx.save()
      
      if (isHead) {
        // Head with enhanced gradient and glow
        ctx.shadowBlur = 15
        ctx.shadowColor = '#00ff88'
        
        // Outer glow ring
        const outerGradient = ctx.createRadialGradient(px + size/2, py + size/2, size/4, px + size/2, py + size/2, size/2)
        outerGradient.addColorStop(0, 'rgba(0, 255, 136, 0.4)')
        outerGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = outerGradient
        ctx.fillRect(px, py, size, size)
        
        // Main head body with gradient
        const gradient = ctx.createLinearGradient(px, py, px + size, py + size)
        gradient.addColorStop(0, '#00ffaa')
        gradient.addColorStop(0.5, '#00ff88')
        gradient.addColorStop(1, '#00cc66')
        ctx.fillStyle = gradient
        ctx.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2)
        
        // Highlight on head
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
        ctx.fillRect(px + padding + 2, py + padding + 2, size - padding * 2 - 4, (size - padding * 2 - 4) / 2)
        
        // Eyes with better positioning
        ctx.shadowBlur = 0
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(px + size * 0.35, py + size * 0.35, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px + size * 0.65, py + size * 0.35, 2.5, 0, Math.PI * 2)
        ctx.fill()
        
        // Eye pupils
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.arc(px + size * 0.35, py + size * 0.35, 1, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px + size * 0.65, py + size * 0.35, 1, 0, Math.PI * 2)
        ctx.fill()
      } else {
        // Body segments with alternating pattern for better visibility
        ctx.shadowBlur = 8
        ctx.shadowColor = '#00ff88'
        
        // Body gradient
        const bodyGradient = ctx.createLinearGradient(px, py, px + size, py + size)
        const intensity = 1 - (index / snake.length) * 0.3 // Slightly fade tail
        bodyGradient.addColorStop(0, `rgba(0, 255, 136, ${intensity})`)
        bodyGradient.addColorStop(1, `rgba(0, 204, 102, ${intensity})`)
        ctx.fillStyle = bodyGradient
        ctx.fillRect(px + padding, py + padding, size - padding * 2, size - padding * 2)
        
        // Segment border for definition
        ctx.strokeStyle = `rgba(0, 170, 68, ${intensity})`
        ctx.lineWidth = 1
        ctx.strokeRect(px + padding + 1, py + padding + 1, size - padding * 2 - 2, size - padding * 2 - 2)
        
        // Inner pattern
        if (index % 2 === 0) {
          ctx.fillStyle = `rgba(0, 170, 68, ${intensity * 0.5})`
          ctx.fillRect(px + padding + 3, py + padding + 3, size - padding * 2 - 6, size - padding * 2 - 6)
        }
      }
      
      ctx.restore()
    }

    // Draw food with glow
    const drawFood = () => {
      const px = food.x * size
      const py = food.y * size
      
      ctx.shadowBlur = 15
      ctx.shadowColor = '#ff4081'
      
      // Outer glow
      ctx.fillStyle = '#ff4081'
      ctx.beginPath()
      ctx.arc(px + size / 2, py + size / 2, size / 2 - 2, 0, Math.PI * 2)
      ctx.fill()
      
      // Inner core
      ctx.fillStyle = '#ff00ff'
      ctx.beginPath()
      ctx.arc(px + size / 2, py + size / 2, size / 3, 0, Math.PI * 2)
      ctx.fill()
      
      // Sparkle
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(px + size / 2, py + size / 2, 3, 0, Math.PI * 2)
      ctx.fill()
      
      ctx.shadowBlur = 0
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'ArrowUp' && dir.y === 0) nextDir = { x: 0, y: -1 }
      if (e.code === 'ArrowDown' && dir.y === 0) nextDir = { x: 0, y: 1 }
      if (e.code === 'ArrowLeft' && dir.x === 0) nextDir = { x: -1, y: 0 }
      if (e.code === 'ArrowRight' && dir.x === 0) nextDir = { x: 1, y: 0 }
    }
    window.addEventListener('keydown', onKey)

    const loop = () => {
      if (!gameRunning || !isMountedRef.current) {
        return
      }

      frameCount++
      dir = { ...nextDir }

      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
      snake.unshift(head)

      // Eat food - continue growing, don't reset!
      if (head.x === food.x && head.y === food.y) {
        // Update score using refs and state (ref for internal use, state for display)
        scoreRef.current += 10
        setScore(scoreRef.current)
        
        // Gradually increase speed (much slower progression)
        gameSpeedRef.current = Math.max(120, gameSpeedRef.current - 1)
        
        // Generate new food (not on snake)
        let newFood
        let attempts = 0
        do {
          newFood = { x: Math.floor(Math.random() * cols), y: Math.floor(Math.random() * rows) }
          attempts++
          // Prevent infinite loop if snake fills most of the board
          if (attempts > 100) break
        } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y))
        food = newFood
      } else {
        // Only remove tail if we didn't eat food
        snake.pop()
      }

      // Collision detection
      if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) {
        gameRunning = false
        if (gameLoopRef.current) {
          clearTimeout(gameLoopRef.current)
          gameLoopRef.current = null
        }
        window.removeEventListener('keydown', onKey)
        ctx.fillStyle = '#0a0a0a'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = '#ff4081'
        ctx.font = 'bold 32px Orbitron'
        ctx.textAlign = 'center'
        ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2)
        ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, canvas.height / 2 + 40)
        ctx.textAlign = 'left'
        if (isMountedRef.current) {
          onGameOver(scoreRef.current)
        }
        return
      }
      
      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
          gameRunning = false
          if (gameLoopRef.current) {
            clearTimeout(gameLoopRef.current)
            gameLoopRef.current = null
          }
          window.removeEventListener('keydown', onKey)
          ctx.fillStyle = '#0a0a0a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.fillStyle = '#ff4081'
          ctx.font = 'bold 32px Orbitron'
          ctx.textAlign = 'center'
          ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2)
          ctx.fillText(`Score: ${scoreRef.current}`, canvas.width / 2, canvas.height / 2 + 40)
          ctx.textAlign = 'left'
          if (isMountedRef.current) {
            onGameOver(scoreRef.current)
          }
          return
        }
      }

      // Draw everything
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      drawGrid()
      drawFood()
      
      // Draw snake with improved graphics
      snake.forEach((seg, idx) => {
        drawSnakeSegment(seg.x, seg.y, idx === 0, idx)
      })

      // Score display with glow
      ctx.shadowBlur = 5
      ctx.shadowColor = '#00ff88'
      ctx.fillStyle = '#00ff88'
      ctx.font = 'bold 18px Orbitron, monospace'
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 25)
      ctx.shadowBlur = 0

      if (gameRunning && isMountedRef.current) {
        gameLoopRef.current = setTimeout(() => loop(), gameSpeedRef.current)
      }
    }
    
    gameLoopRef.current = setTimeout(() => loop(), gameSpeedRef.current)
    
    return () => {
      isMountedRef.current = false
      gameRunning = false
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current)
        gameLoopRef.current = null
      }
      window.removeEventListener('keydown', onKey)
    }
  }, [onGameOver])

  return (
    <div style={{ color: '#eaeaf0' }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 28 }}>Snake Classic</h2>
      <div className="crt">
        <canvas ref={canvasRef} width={600} height={400} style={{ 
          width: '100%', 
          maxWidth: '600px',
          background: 'linear-gradient(135deg, #0e0f15, #1a1628)',
          border: '2px solid #00ff88',
          borderRadius: 12,
          boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
        }} />
      </div>
      <p style={{ opacity: 0.8, marginTop: 12, fontFamily: 'Rajdhani, sans-serif' }}>
        🎮 Arrow keys to move • Eat the glowing food • Avoid walls and yourself!
      </p>
    </div>
  )
}
