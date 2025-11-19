import { useEffect, useRef, useState } from 'react'
import '../Scanlines.css'
import PauseButton from '../PauseButton'
import { usePause } from '../../hooks/usePause'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'

interface FlappyProps {
  onGameOver: (score: number) => void
}

// Game constants
const GRAVITY = 0.3
const JUMP_STRENGTH = 7.5
const PIPE_WIDTH = 52
const PIPE_GAP = 220 // Increased gap for easier gameplay
const PIPE_SPEED = 2
const BIRD_WIDTH = 34
const BIRD_HEIGHT = 24
const COIN_RADIUS = 10
const COIN_SPEED = 2
const TARGET_FPS = 60
const MAX_DELTA_TIME = 1

const CANVAS_WIDTH = 400
const CANVAS_HEIGHT = 600

// Bird colors that change every 100 points
const BIRD_COLORS = [
  { body: '#ff4081', wing: '#ff6b9d', glow: 'rgba(255, 64, 129, 0.6)' }, // Pink
  { body: '#00ff88', wing: '#4dffaa', glow: 'rgba(0, 255, 136, 0.6)' }, // Green
  { body: '#6b46c1', wing: '#8b5cf6', glow: 'rgba(107, 70, 193, 0.6)' }, // Purple
  { body: '#00e5ff', wing: '#4df0ff', glow: 'rgba(0, 229, 255, 0.6)' }, // Cyan
  { body: '#ec4899', wing: '#f472b6', glow: 'rgba(236, 72, 153, 0.6)' }, // Pink
  { body: '#ff6b35', wing: '#ff8c5c', glow: 'rgba(255, 107, 53, 0.6)' }, // Orange
]

interface Bird {
  y: number
  velocity: number
  frame: number
}

interface Pipe {
  x: number
  gapY: number
  gapHeight: number
  passed: boolean
}

interface Coin {
  x: number
  y: number
  collected: boolean
  rotation: number
}

interface Cloud {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
}

export default function Flappy({ onGameOver }: FlappyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(true)
  const [gameStarted, setGameStarted] = useState(false)
  const scoreRef = useRef(0)
  const runningRef = useRef(true)
  const gameStartedRef = useRef(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isMountedRef = useRef(true)
  const { status } = useAIMonitoring()
  const lastFrameTimeRef = useRef<number>(0)
  const { isPaused, speedBoostActive, cooldown, currentSpeedMultiplier, pause, resume } = usePause()

  const gameStateRef = useRef<{
    bird: Bird
    pipes: Pipe[]
    coins: Coin[]
    clouds: Cloud[]
    frameCount: number
  }>({
    bird: { y: CANVAS_HEIGHT / 2, velocity: 0, frame: 0 },
    pipes: [],
    coins: [],
    clouds: [],
    frameCount: 0,
  })

  useEffect(() => {
    isMountedRef.current = true
    runningRef.current = true
    gameStartedRef.current = false
    scoreRef.current = 0
    setScore(0)
    setRunning(true)
    setGameStarted(false)
    lastFrameTimeRef.current = 0

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Responsive canvas sizing
    const maxWidth = Math.min(window.innerWidth - 40, CANVAS_WIDTH)
    const aspectRatio = CANVAS_HEIGHT / CANVAS_WIDTH
    canvas.width = CANVAS_WIDTH
    canvas.height = CANVAS_HEIGHT
    canvas.style.width = `${maxWidth}px`
    canvas.style.height = `${maxWidth * aspectRatio}px`
    canvas.style.maxWidth = '100%'
    canvas.style.display = 'block'
    canvas.style.backgroundColor = '#87ceeb'
    canvas.style.margin = '0 auto'

    // Reset game state
    gameStateRef.current = {
      bird: { y: CANVAS_HEIGHT / 2, velocity: 0, frame: 0 },
      pipes: [],
      coins: [],
      clouds: [],
      frameCount: 0,
    }

    // Initialize clouds
    const clouds: Cloud[] = []
    for (let i = 0; i < 6; i++) {
      clouds.push({
        x: Math.random() * CANVAS_WIDTH,
        y: 30 + Math.random() * 150,
        size: 50 + Math.random() * 60,
        speed: 0.3 + Math.random() * 0.4,
        opacity: 0.6 + Math.random() * 0.3
      })
    }
    gameStateRef.current.clouds = clouds

    // Load background sound
    audioRef.current = new Audio('/bird-ambience.mp3')
    audioRef.current.volume = 0.3
    audioRef.current.loop = true
    
    // Check if music is enabled before playing
    const musicEnabled = localStorage.getItem('nova_music_enabled') !== 'false'
    if (musicEnabled) {
      audioRef.current.play().catch(() => {})
    }
    
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

    const handleGameOver = () => {
      runningRef.current = false
      setRunning(false)
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (isMountedRef.current) {
        onGameOver(scoreRef.current)
      }
    }

    const getBirdColor = () => {
      const colorIndex = Math.floor(scoreRef.current / 100) % BIRD_COLORS.length
      return BIRD_COLORS[colorIndex]
    }

    // Draw simple beautiful background - no mountains
    const drawBackground = () => {
      // Sky gradient - soft blues
      const skyGradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT * 0.7)
      skyGradient.addColorStop(0, '#87CEEB')
      skyGradient.addColorStop(0.5, '#B0E0E6')
      skyGradient.addColorStop(1, '#E0F4F8')
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT * 0.7)

      // Simple ground/grass gradient
      const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.7, 0, CANVAS_HEIGHT)
      groundGradient.addColorStop(0, '#90EE90')
      groundGradient.addColorStop(1, '#228B22')
      ctx.fillStyle = groundGradient
      ctx.fillRect(0, CANVAS_HEIGHT * 0.7, CANVAS_WIDTH, CANVAS_HEIGHT * 0.3)
    }

    // Draw fluffy 3D clouds
    const drawCloud = (cloud: Cloud) => {
      ctx.save()
      ctx.globalAlpha = cloud.opacity

      // Cloud shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.beginPath()
      ctx.ellipse(cloud.x + cloud.size * 0.5, cloud.y + cloud.size * 0.25, cloud.size * 0.55, cloud.size * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()

      // Main fluffy cloud puffs
      const puffs = [
        { offsetX: 0, offsetY: 0, radiusX: 0.35, radiusY: 0.28 },
        { offsetX: 0.35, offsetY: -0.15, radiusX: 0.38, radiusY: 0.3 },
        { offsetX: 0.65, offsetY: 0.05, radiusX: 0.36, radiusY: 0.26 },
        { offsetX: 0.95, offsetY: -0.1, radiusX: 0.34, radiusY: 0.24 },
        { offsetX: 1.2, offsetY: 0.08, radiusX: 0.32, radiusY: 0.22 },
      ]

      for (const puff of puffs) {
        const puffGradient = ctx.createRadialGradient(
          cloud.x + cloud.size * puff.offsetX,
          cloud.y + cloud.size * (puff.offsetY - 0.15),
          0,
          cloud.x + cloud.size * puff.offsetX,
          cloud.y + cloud.size * puff.offsetY,
          cloud.size * puff.radiusX
        )
        puffGradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
        puffGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)')
        puffGradient.addColorStop(1, 'rgba(220, 220, 255, 0.7)')

        ctx.fillStyle = puffGradient
        ctx.beginPath()
        ctx.ellipse(
          cloud.x + cloud.size * puff.offsetX,
          cloud.y + cloud.size * puff.offsetY,
          cloud.size * puff.radiusX,
          cloud.size * puff.radiusY,
          0, 0, Math.PI * 2
        )
        ctx.fill()
      }

      // Cloud highlight for 3D effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
      ctx.beginPath()
      ctx.ellipse(cloud.x + cloud.size * 0.25, cloud.y - cloud.size * 0.22, cloud.size * 0.3, cloud.size * 0.15, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Draw bird with visible wings like initial build
    const drawBird = (x: number, y: number, rotation: number, colorIndex: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)

      const birdColor = getBirdColor()
      const wingFlap = Math.sin(gameStateRef.current.frameCount * 0.3) * 0.3

      // Bird shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.beginPath()
      ctx.ellipse(0, 14, 15, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      // Soft, round bird body
      const bodyGradient = ctx.createRadialGradient(
        -2, -2, 0,
        0, 0, BIRD_WIDTH / 2.1
      )
      bodyGradient.addColorStop(0, birdColor.body)
      bodyGradient.addColorStop(0.7, birdColor.body)
      bodyGradient.addColorStop(1, birdColor.wing)

      ctx.fillStyle = bodyGradient
      ctx.shadowBlur = 10
      ctx.shadowColor = birdColor.glow
      ctx.beginPath()
      ctx.ellipse(0, 0, BIRD_WIDTH / 2, BIRD_HEIGHT / 2, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Left wing - visible and animated
      ctx.save()
      ctx.translate(-18, 0)
      ctx.rotate(wingFlap)
      const leftWingGradient = ctx.createLinearGradient(-12, -6, -12, 6)
      leftWingGradient.addColorStop(0, birdColor.wing)
      leftWingGradient.addColorStop(0.5, birdColor.body)
      leftWingGradient.addColorStop(1, birdColor.wing)
      ctx.fillStyle = leftWingGradient
      ctx.beginPath()
      ctx.ellipse(0, 0, 14, 9, -0.2, 0, Math.PI * 2)
      ctx.fill()
      // Wing highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.ellipse(-3, -3, 5, 3, -0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Right wing - visible and animated
      ctx.save()
      ctx.translate(18, 0)
      ctx.rotate(-wingFlap)
      const rightWingGradient = ctx.createLinearGradient(12, -6, 12, 6)
      rightWingGradient.addColorStop(0, birdColor.wing)
      rightWingGradient.addColorStop(0.5, birdColor.body)
      rightWingGradient.addColorStop(1, birdColor.wing)
      ctx.fillStyle = rightWingGradient
      ctx.beginPath()
      ctx.ellipse(0, 0, 14, 9, 0.2, 0, Math.PI * 2)
      ctx.fill()
      // Wing highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
      ctx.beginPath()
      ctx.ellipse(3, -3, 5, 3, 0.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // Round head
      const headGradient = ctx.createRadialGradient(10, -3, 0, 10, -3, 7)
      headGradient.addColorStop(0, birdColor.body)
      headGradient.addColorStop(1, birdColor.wing)
      ctx.fillStyle = headGradient
      ctx.beginPath()
      ctx.arc(11, -3, 7, 0, Math.PI * 2)
      ctx.fill()

      // Eye
      ctx.fillStyle = '#fff'
      ctx.beginPath()
      ctx.arc(13, -4, 3.5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#333'
      ctx.beginPath()
      ctx.arc(13.5, -4.2, 1.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.beginPath()
      ctx.arc(14, -4.5, 1, 0, Math.PI * 2)
      ctx.fill()

      // Beak
      ctx.fillStyle = '#FF8C42'
      ctx.beginPath()
      ctx.moveTo(16, -2)
      ctx.lineTo(20, -1.5)
      ctx.lineTo(16, 0)
      ctx.closePath()
      ctx.fill()

      // Tail feathers
      ctx.fillStyle = birdColor.body
      ctx.globalAlpha = 0.85
      ctx.beginPath()
      ctx.ellipse(-19, -2, 6, 8, -0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.ellipse(-19, 5, 5, 7, 0.15, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = 1

      // Chest highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.ellipse(-2, 2, 7, 5, 0, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Draw 3D coin with rotation
    const drawCoin = (coin: Coin) => {
      ctx.save()
      ctx.translate(coin.x, coin.y)
      ctx.rotate(coin.rotation)

      // Coin shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)'
      ctx.beginPath()
      ctx.ellipse(0, 3, COIN_RADIUS + 2, COIN_RADIUS * 0.3, 0, 0, Math.PI * 2)
      ctx.fill()

      // Coin glow
      const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, COIN_RADIUS * 1.3)
      glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.7)')
      glowGradient.addColorStop(0.7, 'rgba(255, 215, 0, 0.3)')
      glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
      ctx.fillStyle = glowGradient
      ctx.beginPath()
      ctx.arc(0, 0, COIN_RADIUS * 1.3, 0, Math.PI * 2)
      ctx.fill()

      // Coin body with 3D gradient
      const coinGradient = ctx.createLinearGradient(
        -COIN_RADIUS * 0.7, -COIN_RADIUS * 0.7,
        COIN_RADIUS * 0.7, COIN_RADIUS * 0.7
      )
      coinGradient.addColorStop(0, '#FFD700')
      coinGradient.addColorStop(0.3, '#FFED4E')
      coinGradient.addColorStop(0.7, '#FFD700')
      coinGradient.addColorStop(1, '#CCAA00')

      ctx.fillStyle = coinGradient
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(255, 215, 0, 0.8)'
      ctx.beginPath()
      ctx.arc(0, 0, COIN_RADIUS, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Inner highlight
      const highlightGradient = ctx.createRadialGradient(
        -COIN_RADIUS * 0.3, -COIN_RADIUS * 0.3, 0,
        0, 0, COIN_RADIUS * 0.6
      )
      highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
      highlightGradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
      ctx.fillStyle = highlightGradient
      ctx.beginPath()
      ctx.arc(0, 0, COIN_RADIUS * 0.6, 0, Math.PI * 2)
      ctx.fill()

      // Inner circle
      ctx.fillStyle = '#FFAA00'
      ctx.beginPath()
      ctx.arc(0, 0, COIN_RADIUS * 0.4, 0, Math.PI * 2)
      ctx.fill()

      // Shine effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.beginPath()
      ctx.ellipse(-COIN_RADIUS * 0.2, -COIN_RADIUS * 0.3, COIN_RADIUS * 0.25, COIN_RADIUS * 0.15, -0.3, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    // Draw 3D pipes
    const drawPipe = (pipe: Pipe) => {
      const topHeight = pipe.gapY
      const bottomY = pipe.gapY + pipe.gapHeight
      const bottomHeight = CANVAS_HEIGHT - bottomY

      // Top pipe
      const topPipeGradient = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0)
      topPipeGradient.addColorStop(0, '#00CC00')
      topPipeGradient.addColorStop(0.3, '#00FF00')
      topPipeGradient.addColorStop(0.7, '#00AA00')
      topPipeGradient.addColorStop(1, '#008800')

      ctx.fillStyle = topPipeGradient
      ctx.shadowBlur = 8
      ctx.shadowColor = 'rgba(0, 100, 0, 0.6)'
      ctx.shadowOffsetX = 4
      ctx.shadowOffsetY = 4
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, topHeight)

      // Top pipe highlight
      const topHighlight = ctx.createLinearGradient(pipe.x, 0, pipe.x, 20)
      topHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)')
      topHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = topHighlight
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, 20)

      // Bottom pipe
      ctx.fillStyle = topPipeGradient
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight)

      ctx.shadowBlur = 0
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Side highlights
      const sideHighlight = ctx.createLinearGradient(pipe.x, 0, pipe.x + 10, 0)
      sideHighlight.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
      sideHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = sideHighlight
      ctx.fillRect(pipe.x, 0, 10, topHeight)
      ctx.fillRect(pipe.x, bottomY, 10, bottomHeight)

      // Border
      ctx.strokeStyle = '#005500'
      ctx.lineWidth = 2
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, topHeight)
      ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight)
    }

    const gameLoop = (currentTime: number) => {
      if (!runningRef.current || !isMountedRef.current) {
        return
      }

      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = currentTime
      }

      let deltaTime = (currentTime - lastFrameTimeRef.current) / (1000 / TARGET_FPS)
      deltaTime = Math.min(deltaTime, MAX_DELTA_TIME)
      lastFrameTimeRef.current = currentTime

      const state = gameStateRef.current

      // Clear canvas
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw background
      drawBackground()

      if (!gameStartedRef.current) {
        // Draw start message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
        ctx.fillRect(CANVAS_WIDTH / 2 - 100, CANVAS_HEIGHT / 2 - 30, 200, 60)
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 24px Orbitron'
        ctx.textAlign = 'center'
        ctx.fillText('Tap/Space to Start!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5)
        ctx.textAlign = 'left'
        requestAnimationFrame(gameLoop)
        return
      }

      if (runningRef.current) {
        // Update bird physics
        state.bird.velocity += GRAVITY * deltaTime
        state.bird.y += state.bird.velocity * deltaTime

        state.frameCount++
        if (state.frameCount % 5 === 0) {
          state.bird.frame = (state.bird.frame + 1) % 3
        }

        // Update clouds
        for (let i = state.clouds.length - 1; i >= 0; i--) {
          state.clouds[i].x -= state.clouds[i].speed * deltaTime
          if (state.clouds[i].x < -state.clouds[i].size * 2) {
            state.clouds[i].x = CANVAS_WIDTH + state.clouds[i].size * 2
          }
        }

        // Spawn pipes
        if (state.pipes.length === 0 || state.pipes[state.pipes.length - 1].x < CANVAS_WIDTH - 250) {
          const gapY = 100 + Math.random() * (CANVAS_HEIGHT - PIPE_GAP - 200)
          state.pipes.push({
            x: CANVAS_WIDTH,
            gapY,
            gapHeight: PIPE_GAP,
            passed: false
          })

          // Spawn coin in gap
          state.coins.push({
            x: CANVAS_WIDTH + PIPE_WIDTH / 2,
            y: gapY + PIPE_GAP / 2,
            collected: false,
            rotation: 0
          })
        }

        // Update pipes
        for (let i = state.pipes.length - 1; i >= 0; i--) {
          state.pipes[i].x -= PIPE_SPEED * deltaTime

          // Check score
          if (!state.pipes[i].passed && state.pipes[i].x + PIPE_WIDTH < 50) {
            state.pipes[i].passed = true
            scoreRef.current++
            setScore(scoreRef.current)
          }

          // Remove off-screen pipes
          if (state.pipes[i].x < -PIPE_WIDTH) {
            state.pipes.splice(i, 1)
          }
        }

        // Update coins
        for (let i = state.coins.length - 1; i >= 0; i--) {
          if (!state.coins[i].collected) {
            state.coins[i].x -= COIN_SPEED * deltaTime
            state.coins[i].rotation += 0.1

            // Check coin collection
            const dx = 50 + BIRD_WIDTH / 2 - state.coins[i].x
            const dy = state.bird.y + BIRD_HEIGHT / 2 - state.coins[i].y
            const distance = Math.sqrt(dx * dx + dy * dy)
            if (distance < BIRD_WIDTH / 2 + COIN_RADIUS) {
              state.coins[i].collected = true
              scoreRef.current += 5
              setScore(scoreRef.current)
              state.coins.splice(i, 1)
              continue
            }
          }

          // Remove off-screen coins
          if (state.coins[i].x < -COIN_RADIUS) {
            state.coins.splice(i, 1)
          }
        }

        // Collision detection
        const birdRect = {
          x: 50,
          y: state.bird.y,
          width: BIRD_WIDTH,
          height: BIRD_HEIGHT
        }

        for (const pipe of state.pipes) {
          const topPipeRect = { x: pipe.x, y: 0, width: PIPE_WIDTH, height: pipe.gapY }
          const bottomPipeRect = {
            x: pipe.x,
            y: pipe.gapY + pipe.gapHeight,
            width: PIPE_WIDTH,
            height: CANVAS_HEIGHT - pipe.gapY - pipe.gapHeight
          }

          if (
            birdRect.x < topPipeRect.x + topPipeRect.width &&
            birdRect.x + birdRect.width > topPipeRect.x &&
            birdRect.y < topPipeRect.y + topPipeRect.height &&
            birdRect.y + birdRect.height > topPipeRect.y
          ) {
            handleGameOver()
            return
          }

          if (
            birdRect.x < bottomPipeRect.x + bottomPipeRect.width &&
            birdRect.x + birdRect.width > bottomPipeRect.x &&
            birdRect.y < bottomPipeRect.y + bottomPipeRect.height &&
            birdRect.y + birdRect.height > bottomPipeRect.y
          ) {
            handleGameOver()
            return
          }
        }

        // Boundary check
        if (state.bird.y > CANVAS_HEIGHT || state.bird.y < 0) {
          handleGameOver()
          return
        }
      }

      // Draw clouds
      state.clouds.forEach(cloud => drawCloud(cloud))

      // Draw pipes
      state.pipes.forEach(pipe => drawPipe(pipe))

      // Draw coins
      state.coins.forEach(coin => {
        if (!coin.collected) {
          drawCoin(coin)
        }
      })

      // Draw bird
      const colorIndex = Math.floor(scoreRef.current / 100)
      const rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, state.bird.velocity * 0.1))
      drawBird(50 + BIRD_WIDTH / 2, state.bird.y + BIRD_HEIGHT / 2, rotation, colorIndex)

      // Draw score
      ctx.save()
      ctx.shadowBlur = 10
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px Orbitron'
      ctx.fillText(`Score: ${scoreRef.current}`, 15, 40)

      // Color change notification
      if (scoreRef.current > 0 && scoreRef.current % 100 === 0) {
        const currentColor = getBirdColor()
        ctx.fillStyle = currentColor.body
        ctx.font = 'bold 22px Orbitron'
        ctx.fillText('Color Changed!', 15, 70)
      }
      ctx.restore()

      requestAnimationFrame(gameLoop)
    }

    const jump = () => {
      if (!gameStartedRef.current) {
        gameStartedRef.current = true
        setGameStarted(true)
        lastFrameTimeRef.current = 0
        return
      }

      if (runningRef.current) {
        gameStateRef.current.bird.velocity = -JUMP_STRENGTH
      }
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        jump()
      }
    }

    const onTap = (e: TouchEvent | MouseEvent) => {
      e.preventDefault()
      jump()
    }

    window.addEventListener('keydown', onKey, true)
    canvas.addEventListener('touchstart', onTap, { passive: false })
    canvas.addEventListener('click', onTap)

    // Start game loop immediately
    let animationFrameId: number
    const startLoop = () => {
      animationFrameId = requestAnimationFrame(gameLoop)
    }
    startLoop()

    return () => {
      isMountedRef.current = false
      runningRef.current = false
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('nova_settings_changed', handleSettingsChange)
      canvas.removeEventListener('touchstart', onTap)
      canvas.removeEventListener('click', onTap)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [onGameOver])

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      flexDirection: 'column', 
      width: '100%', 
      maxWidth: '100%',
      backgroundColor: 'transparent',
      padding: '20px',
      position: 'relative'
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          border: '2px solid #6b46c1', 
          borderRadius: 8, 
          cursor: 'pointer', 
          maxWidth: '100%', 
          height: 'auto',
          display: 'block',
          backgroundColor: '#87ceeb'
        }} 
      />
      <p style={{ color: '#8af0ff', marginTop: 16, fontFamily: 'Rajdhani, sans-serif', fontSize: 14, textAlign: 'center' }}>
        {running ? 'Tap/Space to Flap! Collect coins! Color changes every 100 points!' : 'Game Over!'}
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
