import { useRef, useState, useEffect } from 'react'
import '../Scanlines.css'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'
import PauseButton from '../PauseButton'
import MobileTouchControls from '../MobileTouchControls'
import { usePause } from '../../hooks/usePause'

interface TetraMemProps {
  onGameOver: (score: number) => void
}

const BOARD_WIDTH = 12
const BOARD_HEIGHT = 20
const CELL_SIZE = 25

const PIECES = {
  I: { shape: [[1, 1, 1, 1]], color: '#00f5ff' },
  O: { shape: [[1, 1], [1, 1]], color: '#ffed00' },
  T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#a000f0' },
  S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00f000' },
  Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#f00000' },
  J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000f0' },
  L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff7f00' }
}

// Predefined rotations for each piece type
const ROTATIONS: Record<string, number[][][]> = {
  I: [
    [[1, 1, 1, 1]],                              // Horizontal
    [[1], [1], [1], [1]]                         // Vertical
  ],
  O: [
    [[1, 1], [1, 1]]                             // Square (no rotation)
  ],
  T: [
    [[0, 1, 0], [1, 1, 1]],                      // T pointing up
    [[1, 0], [1, 1], [1, 0]],                    // T pointing right
    [[1, 1, 1], [0, 1, 0]],                      // T pointing down
    [[0, 1], [1, 1], [0, 1]]                     // T pointing left
  ],
  S: [
    [[0, 1, 1], [1, 1, 0]],                      // S horizontal
    [[1, 0], [1, 1], [0, 1]]                     // S vertical
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1]],                      // Z horizontal
    [[0, 1], [1, 1], [1, 0]]                     // Z vertical
  ],
  J: [
    [[1, 0, 0], [1, 1, 1]],                      // J pointing right
    [[1, 1], [1, 0], [1, 0]],                   // J pointing down
    [[1, 1, 1], [0, 0, 1]],                      // J pointing left
    [[0, 1], [0, 1], [1, 1]]                     // J pointing up
  ],
  L: [
    [[0, 0, 1], [1, 1, 1]],                      // L pointing right
    [[1, 0], [1, 0], [1, 1]],                   // L pointing down
    [[1, 1, 1], [1, 0, 0]],                      // L pointing left (7 shape)
    [[1, 1], [0, 1], [0, 1]]                     // L pointing up
  ]
}

export default function TetraMem({ onGameOver }: TetraMemProps) {
  const { status } = useAIMonitoring()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [lines, setLines] = useState(0)
  const scoreRef = useRef(0)
  const levelRef = useRef(1)
  const linesRef = useRef(0)
  const runningRef = useRef(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)
  const { isPaused, speedBoostActive, cooldown, currentSpeedMultiplier, pause, resume } = usePause()

  useEffect(() => {
    const audio = document.createElement('audio')
    audio.src = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Tetris-kxnh5j7hpNEcFspAndlU2huV5n6dvk.mp3'
    audio.volume = 0.3
    audio.loop = true
    audioRef.current = audio
    
    const playSound = async () => {
      try {
        if (audioRef.current) {
          // Check if music is enabled
          const musicEnabled = localStorage.getItem('nova_music_enabled') !== 'false'
          if (musicEnabled) {
            await audioRef.current.play()
          }
        }
      } catch (error) {
        console.log('TetraMem sound playback prevented or failed:', error)
      }
    }
    playSound()

    // Listen for settings changes
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent
      const { musicEnabled } = customEvent.detail
      if (audioRef.current) {
        if (musicEnabled) {
          audioRef.current.play().catch(err => console.log('Play failed:', err))
        } else {
          audioRef.current.pause()
        }
      }
    }
    
    window.addEventListener('nova_settings_changed', handleSettingsChange)

    return () => {
      window.removeEventListener('nova_settings_changed', handleSettingsChange)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    runningRef.current = true
    scoreRef.current = 0
    levelRef.current = 1
    linesRef.current = 0
    setScore(0)
    setLevel(1)
    setLines(0)

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = BOARD_WIDTH * CELL_SIZE + 200
    canvas.height = BOARD_HEIGHT * CELL_SIZE
    const maxDisplayWidth = Math.min(window.innerWidth - 40, BOARD_WIDTH * CELL_SIZE + 200)
    const aspectRatio = BOARD_HEIGHT * CELL_SIZE / (BOARD_WIDTH * CELL_SIZE + 200)
    const displayHeight = maxDisplayWidth * aspectRatio
    canvas.style.width = `${maxDisplayWidth}px`
    canvas.style.height = `${displayHeight}px`
    canvas.style.maxWidth = '100%'
    canvas.style.display = 'block'
    canvas.style.margin = '0 auto'
    canvas.style.backgroundColor = '#000'

    let board: (string | number)[][] = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
    let currentPiece: { shape: number[][]; x: number; y: number; color: string; type: string; rotationIndex: number } | null = null
    let nextPiece: { shape: number[][]; x: number; y: number; color: string; type: string; rotationIndex: number } | null = null
    const INITIAL_DROP_TIME = 500 // Faster base speed for more difficulty
    const LEVEL_SPEED_INCREASE = 75 // Increased speed jump per level (was 50)
    const MIN_DROP_TIME = 120 // Lower minimum for harder difficulty
    let dropTime = INITIAL_DROP_TIME
    let dropCounter = 0
    let justPlaced = false

    const createPiece = (): { shape: number[][]; x: number; y: number; color: string; type: string; rotationIndex: number } => {
      const pieceTypes = Object.keys(PIECES) as (keyof typeof PIECES)[]
      const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)]
      const piece = PIECES[randomType]
      return {
        shape: piece.shape,
        color: piece.color,
        type: randomType,
        x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece.shape[0].length / 2),
        y: 0,
        rotationIndex: 0
      }
    }

    const canMove = (piece: { shape: number[][]; x: number; y: number }, dx: number, dy: number): boolean => {
      for (let row = 0; row < piece.shape.length; row++) {
        for (let col = 0; col < piece.shape[row].length; col++) {
          if (piece.shape[row][col]) {
            const newX = piece.x + col + dx
            const newY = piece.y + row + dy
            if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) return false
            if (newY >= 0 && board[newY][newX] !== 0) return false
          }
        }
      }
      return true
    }

    const placePiece = () => {
      if (!currentPiece) return
      
      for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
          if (currentPiece.shape[row][col]) {
            const y = currentPiece.y + row
            const x = currentPiece.x + col
            if (y >= 0 && y < BOARD_HEIGHT && x >= 0 && x < BOARD_WIDTH) {
              board[y][x] = currentPiece.color
            }
          }
        }
      }
      
      const clearLines = (): number => {
        let linesCleared = 0
        for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
          if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1)
            board.unshift(Array(BOARD_WIDTH).fill(0))
            linesCleared++
            row++
          }
        }
        return linesCleared
      }

      const linesCleared = clearLines()
      
      if (linesCleared > 0) {
        linesRef.current += linesCleared
        scoreRef.current += linesCleared * 100
        levelRef.current = Math.floor(linesRef.current / 10) + 1
        // New speed formula: faster and more progressive
        // Apply speed multiplier from pause system
        const baseDropTime = Math.max(MIN_DROP_TIME, INITIAL_DROP_TIME - (levelRef.current * LEVEL_SPEED_INCREASE))
        dropTime = baseDropTime / currentSpeedMultiplier
        
        if (isMountedRef.current) {
          setScore(scoreRef.current)
          setLevel(levelRef.current)
          setLines(linesRef.current)
        }
      }

      currentPiece = nextPiece || createPiece()
      nextPiece = createPiece()
      dropCounter = 0
      justPlaced = true
      
      if (!canMove(currentPiece, 0, 0)) {
        handleGameOver()
      }
    }

    const handleGameOver = () => {
      runningRef.current = false
      if (isMountedRef.current) {
        setScore(scoreRef.current)
        setLevel(levelRef.current)
        setLines(linesRef.current)
      }
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      if (isMountedRef.current) {
        onGameOver(scoreRef.current)
      }
    }

    const rotatePiece = (piece: { shape: number[][]; x: number; y: number; type: string; rotationIndex: number }): { shape: number[][]; x: number; y: number; rotationIndex: number } | null => {
      const rotations = ROTATIONS[piece.type]
      
      // O piece doesn't rotate
      if (!rotations || rotations.length <= 1) {
        return null
      }
      
      const currentRotationIndex = piece.rotationIndex || 0
      const nextRotationIndex = (currentRotationIndex + 1) % rotations.length
      const rotatedShape = rotations[nextRotationIndex]
      
      // Calculate center of current piece
      const currentCenterX = piece.x + Math.floor(piece.shape[0].length / 2)
      const currentCenterY = piece.y + Math.floor(piece.shape.length / 2)
      
      // Calculate center of rotated piece
      const rotatedCenterX = Math.floor(rotatedShape[0].length / 2)
      const rotatedCenterY = Math.floor(rotatedShape.length / 2)
      
      // New position to keep center aligned
      const baseX = currentCenterX - rotatedCenterX
      const baseY = currentCenterY - rotatedCenterY
      
      // Wall kick offsets - try multiple positions
      const wallKickOffsets = [
        [0, 0],
        [-1, 0],
        [1, 0],
        [0, -1],
        [-1, -1],
        [1, -1],
        [-2, 0],
        [2, 0],
        [0, -2],
        [-2, -1],
        [2, -1],
        [-1, -2],
        [1, -2],
      ]

      for (const [offsetX, offsetY] of wallKickOffsets) {
        const testX = baseX + offsetX
        const testY = baseY + offsetY
        
        // Ensure piece stays within bounds
        if (testX < 0 || testY < 0) continue
        
        const testPiece = { shape: rotatedShape, x: testX, y: testY }
        if (canMove(testPiece, 0, 0)) {
          return { 
            shape: rotatedShape, 
            x: testX, 
            y: testY,
            rotationIndex: nextRotationIndex
          }
        }
      }
      
      return null
    }

    const draw = () => {
      if (!isMountedRef.current) return
      
      ctx.fillStyle = '#0a0a0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = '#6b46c1'
      ctx.lineWidth = 2
      ctx.strokeRect(0, 0, BOARD_WIDTH * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)

      ctx.strokeStyle = '#1a1a2e'
      ctx.lineWidth = 1
      for (let x = 0; x <= BOARD_WIDTH; x++) {
        ctx.beginPath()
        ctx.moveTo(x * CELL_SIZE, 0)
        ctx.lineTo(x * CELL_SIZE, BOARD_HEIGHT * CELL_SIZE)
        ctx.stroke()
      }
      for (let y = 0; y <= BOARD_HEIGHT; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * CELL_SIZE)
        ctx.lineTo(BOARD_WIDTH * CELL_SIZE, y * CELL_SIZE)
        ctx.stroke()
      }

      for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          if (board[row][col] !== 0) {
            ctx.fillStyle = board[row][col] as string
            ctx.fillRect(col * CELL_SIZE + 1, row * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
          }
        }
      }

      if (currentPiece) {
        ctx.fillStyle = currentPiece.color
        for (let row = 0; row < currentPiece.shape.length; row++) {
          for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
              ctx.fillRect(
                (currentPiece.x + col) * CELL_SIZE + 1,
                (currentPiece.y + row) * CELL_SIZE + 1,
                CELL_SIZE - 2,
                CELL_SIZE - 2
              )
            }
          }
        }
      }

      const infoX = BOARD_WIDTH * CELL_SIZE + 20
      ctx.fillStyle = '#fff'
      ctx.font = '20px Orbitron'
      ctx.textAlign = 'left'
      ctx.fillText(`Score: ${scoreRef.current}`, infoX, 40)
      ctx.fillText(`Level: ${levelRef.current}`, infoX, 70)
      ctx.fillText(`Lines: ${linesRef.current}`, infoX, 100)

      if (nextPiece) {
        ctx.fillText('Next:', infoX, 140)
        ctx.fillStyle = nextPiece.color
        nextPiece.shape.forEach((row, y) => {
          row.forEach((value, x) => {
            if (value) {
              ctx.fillRect(infoX + x * 20, 150 + y * 20, 18, 18)
            }
          })
        })
      }
    }

    currentPiece = createPiece()
    nextPiece = createPiece()

    let lastKeyTime = 0
    const keyCooldown = 100

    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current || !currentPiece || !isMountedRef.current) return
      
      const now = Date.now()
      if (now - lastKeyTime < keyCooldown && e.code !== 'ArrowUp' && e.code !== 'KeyZ' && e.code !== 'KeyX') {
        return
      }
      lastKeyTime = now

      if (e.code === 'ArrowLeft') {
        e.preventDefault()
        if (canMove(currentPiece, -1, 0)) {
          currentPiece.x--
          draw()
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        if (canMove(currentPiece, 1, 0)) {
          currentPiece.x++
          draw()
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault()
        if (canMove(currentPiece, 0, 1)) {
          currentPiece.y++
          draw()
        }
      } else if (e.code === 'Space') {
        e.preventDefault()
        if (currentPiece) {
          let dropY = currentPiece.y
          while (canMove({ ...currentPiece, y: dropY + 1 }, 0, 0)) {
            dropY++
          }
          if (canMove({ ...currentPiece, y: dropY }, 0, 0)) {
            currentPiece.y = dropY
            placePiece()
            justPlaced = true
            dropCounter = 0
            draw()
          }
        }
      } else if (e.code === 'ArrowUp' || e.code === 'KeyZ' || e.code === 'KeyX' || e.code === 'KeyI' || e.code === 'KeyL') {
        e.preventDefault()
        const rotated = rotatePiece(currentPiece)
        if (rotated) {
          currentPiece.shape = rotated.shape
          currentPiece.x = rotated.x
          currentPiece.y = rotated.y
          currentPiece.rotationIndex = rotated.rotationIndex
          draw()
        }
      }
    }

    window.addEventListener('keydown', onKey, true)

    const gameLoop = () => {
      if (!runningRef.current || !isMountedRef.current || isPaused) return

      if (justPlaced) {
        justPlaced = false
        draw()
        return
      }

      dropCounter += 16
      
      if (dropCounter >= dropTime) {
        if (currentPiece && canMove(currentPiece, 0, 1)) {
          currentPiece.y++
          dropCounter = 0
        } else if (currentPiece) {
          placePiece()
          dropCounter = 0
        }
      }

      draw()
    }

    draw()
    gameLoopRef.current = setInterval(gameLoop, 16)

    return () => {
      isMountedRef.current = false
      runningRef.current = false
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
        gameLoopRef.current = null
      }
      window.removeEventListener('keydown', onKey, true)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [onGameOver, isPaused, currentSpeedMultiplier])

  // Mobile touch handlers - dispatch keyboard events
  const handleMobileLeft = () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowLeft' })
    window.dispatchEvent(event)
  }

  const handleMobileRight = () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowRight' })
    window.dispatchEvent(event)
  }

  const handleMobileDown = () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowDown' })
    window.dispatchEvent(event)
  }

  const handleMobileRotate = () => {
    const event = new KeyboardEvent('keydown', { code: 'ArrowUp' })
    window.dispatchEvent(event)
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', maxWidth: '100%' }}>
      <PauseButton 
        isPaused={isPaused}
        onPause={pause}
        onResume={resume}
        cooldown={cooldown}
        speedBoostActive={speedBoostActive}
      />
      <canvas ref={canvasRef} style={{ border: '2px solid #6b46c1', borderRadius: 8, maxWidth: '100%', height: 'auto' }} />
      <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(107, 70, 193, 0.1)', borderRadius: 8, border: '1px solid #6b46c1' }}>
        <p style={{ color: '#8af0ff', fontFamily: 'Rajdhani, sans-serif', fontSize: 14, marginBottom: 8, textAlign: 'center', fontWeight: 'bold' }}>
          Controls:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8, fontSize: 12, color: '#eaeaf0', fontFamily: 'Rajdhani, sans-serif' }}>
          <div>← → Move Left/Right</div>
          <div>↓ Soft Drop</div>
          <div>↑ Z/X Rotate</div>
          <div>Space Hard Drop</div>
        </div>
      </div>
      
      {/* AI Monitoring Indicator */}
      <AIMonitoringIndicator 
        status={status} 
        position="bottom-left" 
        size="small" 
      />
      
      {/* Mobile Touch Controls */}
      <MobileTouchControls
        gameName="TetraMem"
        onLeft={handleMobileLeft}
        onRight={handleMobileRight}
        onDown={handleMobileDown}
        onRotate={handleMobileRotate}
      />
    </div>
  )
}
