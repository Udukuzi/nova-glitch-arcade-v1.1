import { useEffect, useRef, useState } from 'react'
import '../Scanlines.css'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'

interface PacCoinProps {
  onGameOver: (score: number) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const CELL_SIZE = 24
const MAZE_COLS = 25
const MAZE_ROWS = 25
const CANVAS_WIDTH = CELL_SIZE * MAZE_COLS
const CANVAS_HEIGHT = CELL_SIZE * MAZE_ROWS

// Simplified maze layout (0=empty, 1=wall, 2=dot, 3=power pellet)
const MAZE_TEMPLATE = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,1,2,1,1,1,1,1,2,1,1,2,1,1,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,1,2,2,2,2,1,1,1,2,2,2,2,1,2,2,2,2,2,1],
  [1,1,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,2,1,1,0,0,0,0,0,1,1,2,1,2,1,1,1,1,1],
  [2,2,2,2,2,2,2,2,1,0,0,0,0,0,0,0,1,2,2,2,2,2,2,2,2],
  [1,1,1,1,1,2,1,2,1,0,0,0,0,0,0,0,1,2,1,2,1,1,1,1,1],
  [0,0,0,0,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,0,0,0,0],
  [1,1,1,1,1,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,1,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,2,2,1,1,1,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
  [1,1,1,2,1,2,1,2,1,1,1,1,1,1,1,1,1,2,1,2,1,2,1,1,1],
  [1,2,2,2,2,2,1,2,2,2,2,1,1,1,2,2,2,2,1,2,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,1,1,2,1,1,1,2,1,1,1,1,1,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,1,2,1,1,1,1,1,2,1,2,1,1,1,1,1,2,1,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,3,1,1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1,1,3,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

const COLORS = {
  BLACK: '#000000',
  YELLOW: '#FFFF00',
  BLUE: '#0000FF',
  WHITE: '#FFFFFF',
  WALL: '#2121DE',
  PINK: '#FFC0CB',
  CYAN: '#00FFFF',
  ORANGE: '#FFA500',
  RED: '#FF0000',
  GREEN: '#00FF00'
}

const DIRECTIONS = {
  LEFT: [-1, 0],
  RIGHT: [1, 0],
  UP: [0, -1],
  DOWN: [0, 1]
}

const FRIGHTENED_DURATION = 8000
const GHOST_RESPAWN_TIME = 3000

export default function PacCoin({ onGameOver, difficulty = 'medium' }: PacCoinProps) {
  const { status } = useAIMonitoring()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [running, setRunning] = useState(true)
  const scoreRef = useRef(0)
  const runningRef = useRef(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const isMountedRef = useRef(true)
  const gameLoopRef = useRef<number | null>(null)

  useEffect(() => {
    isMountedRef.current = true
    runningRef.current = true
    scoreRef.current = 0
    setScore(0)
    setRunning(true)

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
    canvas.style.margin = '0 auto'
    canvas.style.backgroundColor = '#000'

    // Detect mobile for speed adjustment
    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768
    
    // Difficulty-based speeds (higher = slower, better for mobile touch controls)
    const speedSettings = {
      easy: { pacman: isMobile ? 3 : 2, ghost: isMobile ? 6 : 5 },
      medium: { pacman: isMobile ? 4 : 1, ghost: isMobile ? 8 : 3 },
      hard: { pacman: isMobile ? 4 : 1, ghost: isMobile ? 6 : 2 }
    }
    
    const PACMAN_MOVE_INTERVAL = speedSettings[difficulty].pacman
    const GHOST_MOVE_INTERVAL = speedSettings[difficulty].ghost

    // Create a working copy of the maze
    let MAZE = MAZE_TEMPLATE.map(row => [...row])

    // Find starting position for Pacman
    function findStartPosition(): [number, number] {
      for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
          if (MAZE[row][col] !== 1) {
            return [col, row]
          }
        }
      }
      return [12, 18]
    }

    let gameOver = false
    let youWin = false
    let frightenedTimer = 0
    let globalFrame = 0
    let gameStarted = false

    // Pacman state
    let pacman = {
      pos: findStartPosition(),
      dir: 'LEFT' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
      nextDir: 'LEFT' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN',
      mouthAngle: 0,
      mouthOpening: true
    }

    // Ghosts
    const ghosts = [
      { name: 'blinky', color: COLORS.RED, pos: [12, 9] as [number, number], dir: 'LEFT' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN', frightened: false, eaten: false, respawnTime: 0 },
      { name: 'pinky', color: COLORS.PINK, pos: [11, 9] as [number, number], dir: 'UP' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN', frightened: false, eaten: false, respawnTime: 0 },
      { name: 'inky', color: COLORS.CYAN, pos: [13, 9] as [number, number], dir: 'UP' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN', frightened: false, eaten: false, respawnTime: 0 },
      { name: 'clyde', color: COLORS.ORANGE, pos: [12, 10] as [number, number], dir: 'DOWN' as 'LEFT' | 'RIGHT' | 'UP' | 'DOWN', frightened: false, eaten: false, respawnTime: 0 }
    ]

    // Load sound
    audioRef.current = new Audio('/pacman-sound.mp3')
    audioRef.current.volume = 0.4
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
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
      if (isMountedRef.current) {
        setTimeout(() => {
          onGameOver(scoreRef.current)
        }, 100)
      }
    }

    // Utility functions
    function canMove(x: number, y: number): boolean {
      if (x < 0 || x >= MAZE_COLS || y < 0 || y >= MAZE_ROWS) {
        return false
      }
      return MAZE[y][x] !== 1
    }

    function checkCollision(pos1: [number, number], pos2: [number, number]): boolean {
      return pos1[0] === pos2[0] && pos1[1] === pos2[1]
    }

    // Drawing functions
    function drawMaze() {
      for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
          const cell = MAZE[row][col]
          const x = col * CELL_SIZE
          const y = row * CELL_SIZE

          switch(cell) {
            case 1: // Wall
              ctx.fillStyle = COLORS.WALL
              ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
              
              // Add wall border effect
              ctx.strokeStyle = '#4444FF'
              ctx.lineWidth = 1
              ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE)
              break
            case 2: // Dot
              ctx.fillStyle = COLORS.WHITE
              ctx.beginPath()
              ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 2, 0, Math.PI * 2)
              ctx.fill()
              break
            case 3: // Power pellet
              ctx.fillStyle = COLORS.WHITE
              ctx.beginPath()
              ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2)
              ctx.fill()
              
              // Add glow effect
              ctx.shadowColor = COLORS.WHITE
              ctx.shadowBlur = 10
              ctx.beginPath()
              ctx.arc(x + CELL_SIZE/2, y + CELL_SIZE/2, 6, 0, Math.PI * 2)
              ctx.fill()
              ctx.shadowBlur = 0
              break
          }
        }
      }
    }

    function drawPacman() {
      const x = pacman.pos[0] * CELL_SIZE + CELL_SIZE/2
      const y = pacman.pos[1] * CELL_SIZE + CELL_SIZE/2
      const radius = CELL_SIZE/2 - 2

      // Update mouth animation
      if (gameStarted && !gameOver && !youWin) {
        if (pacman.mouthOpening) {
          pacman.mouthAngle += 0.15
          if (pacman.mouthAngle >= 0.8) pacman.mouthOpening = false
        } else {
          pacman.mouthAngle -= 0.15
          if (pacman.mouthAngle <= 0) pacman.mouthOpening = true
        }
      }

      // Draw Pacman
      ctx.fillStyle = COLORS.YELLOW
      ctx.beginPath()
      
      let startAngle: number, endAngle: number
      switch(pacman.dir) {
        case 'LEFT':
          startAngle = Math.PI + pacman.mouthAngle
          endAngle = Math.PI - pacman.mouthAngle
          break
        case 'RIGHT':
          startAngle = pacman.mouthAngle
          endAngle = 2 * Math.PI - pacman.mouthAngle
          break
        case 'UP':
          startAngle = 1.5 * Math.PI + pacman.mouthAngle
          endAngle = 1.5 * Math.PI - pacman.mouthAngle
          break
        case 'DOWN':
          startAngle = 0.5 * Math.PI + pacman.mouthAngle
          endAngle = 0.5 * Math.PI - pacman.mouthAngle
          break
      }
      
      ctx.arc(x, y, radius, startAngle, endAngle)
      ctx.lineTo(x, y)
      ctx.closePath()
      ctx.fill()
      
      // Add glow effect
      ctx.shadowColor = COLORS.YELLOW
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.shadowBlur = 0
    }

    function drawGhosts() {
      ghosts.forEach(ghost => {
        if (ghost.eaten && Date.now() < ghost.respawnTime) return

        const x = ghost.pos[0] * CELL_SIZE + CELL_SIZE/2
        const y = ghost.pos[1] * CELL_SIZE + CELL_SIZE/2
        const radius = CELL_SIZE/2 - 2

        // Ghost body
        ctx.fillStyle = ghost.frightened ? COLORS.BLUE : ghost.color
        ctx.beginPath()
        ctx.arc(x, y - radius/3, radius, Math.PI, 0, false)
        ctx.lineTo(x + radius, y + radius/2)
        
        // Ghost bottom wavy edge
        for (let i = 0; i < 3; i++) {
          ctx.lineTo(x + radius - (i + 1) * radius/2, y + radius/2 - (i % 2) * radius/3)
        }
        
        ctx.lineTo(x - radius, y + radius/2)
        ctx.closePath()
        ctx.fill()

        // Ghost eyes
        if (!ghost.frightened) {
          ctx.fillStyle = COLORS.WHITE
          ctx.beginPath()
          ctx.arc(x - radius/3, y - radius/3, radius/5, 0, Math.PI * 2)
          ctx.arc(x + radius/3, y - radius/3, radius/5, 0, Math.PI * 2)
          ctx.fill()
          
          ctx.fillStyle = COLORS.BLACK
          ctx.beginPath()
          ctx.arc(x - radius/3, y - radius/3, radius/8, 0, Math.PI * 2)
          ctx.arc(x + radius/3, y - radius/3, radius/8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Frightened ghost eyes
          ctx.fillStyle = COLORS.WHITE
          ctx.fillRect(x - radius/2, y - radius/2, radius/4, radius/4)
          ctx.fillRect(x + radius/4, y - radius/2, radius/4, radius/4)
        }
      })
    }

    // Movement functions
    function movePacman() {
      if (!gameStarted || globalFrame % PACMAN_MOVE_INTERVAL !== 0) return
      
      // Try to move in the next direction
      const [dx, dy] = DIRECTIONS[pacman.nextDir]
      let newX = pacman.pos[0] + dx
      let newY = pacman.pos[1] + dy
      
      // Handle tunnel effect (left-right wrap)
      if (newX < 0) newX = MAZE_COLS - 1
      if (newX >= MAZE_COLS) newX = 0
      
      if (canMove(newX, newY)) {
        pacman.dir = pacman.nextDir
        pacman.pos = [newX, newY]
      } else {
        // Continue in current direction
        const [dx2, dy2] = DIRECTIONS[pacman.dir]
        newX = pacman.pos[0] + dx2
        newY = pacman.pos[1] + dy2
        
        // Handle tunnel effect
        if (newX < 0) newX = MAZE_COLS - 1
        if (newX >= MAZE_COLS) newX = 0
        
        if (canMove(newX, newY)) {
          pacman.pos = [newX, newY]
        }
      }
    }

    function moveGhost(ghost: typeof ghosts[0]) {
      if (!gameStarted) return
      
      if (ghost.eaten && Date.now() < ghost.respawnTime) {
        return
      }
      
      if (ghost.eaten && Date.now() >= ghost.respawnTime) {
        ghost.eaten = false
        ghost.frightened = false
        ghost.pos = [12, 9]
        ghost.dir = 'LEFT'
      }
      
      if (globalFrame % GHOST_MOVE_INTERVAL !== 0) return
      
      // Get all possible directions
      const possibleDirs = (Object.keys(DIRECTIONS) as Array<keyof typeof DIRECTIONS>).filter(dir => {
        const [newDx, newDy] = DIRECTIONS[dir]
        let testX = ghost.pos[0] + newDx
        let testY = ghost.pos[1] + newDy
        
        if (testX < 0) testX = MAZE_COLS - 1
        if (testX >= MAZE_COLS) testX = 0
        
        return canMove(testX, testY)
      })
      
      if (possibleDirs.length === 0) return
      
      let chosenDir = ghost.dir
      
      // Improved AI behavior
      if (ghost.frightened) {
        // When frightened, run away from Pacman
        let bestDir = possibleDirs[0]
        let maxDistance = 0
        
        possibleDirs.forEach(dir => {
          const [dx, dy] = DIRECTIONS[dir]
          let newX = ghost.pos[0] + dx
          let newY = ghost.pos[1] + dy
          
          if (newX < 0) newX = MAZE_COLS - 1
          if (newX >= MAZE_COLS) newX = 0
          
          const distance = Math.abs(newX - pacman.pos[0]) + Math.abs(newY - pacman.pos[1])
          if (distance > maxDistance) {
            maxDistance = distance
            bestDir = dir
          }
        })
        
        chosenDir = bestDir
      } else {
        // When not frightened, chase Pacman with some randomness
        const distanceToPacman = Math.abs(ghost.pos[0] - pacman.pos[0]) + Math.abs(ghost.pos[1] - pacman.pos[1])
        
        if (distanceToPacman > 8 || Math.random() < 0.3) {
          // If far from Pacman or random chance, move toward Pacman
          let bestDir = possibleDirs[0]
          let minDistance = Infinity
          
          possibleDirs.forEach(dir => {
            const [dx, dy] = DIRECTIONS[dir]
            let newX = ghost.pos[0] + dx
            let newY = ghost.pos[1] + dy
            
            if (newX < 0) newX = MAZE_COLS - 1
            if (newX >= MAZE_COLS) newX = 0
            
            const distance = Math.abs(newX - pacman.pos[0]) + Math.abs(newY - pacman.pos[1])
            if (distance < minDistance) {
              minDistance = distance
              bestDir = dir
            }
          })
          
          chosenDir = bestDir
        } else {
          // If close to Pacman, add some randomness
          if (Math.random() < 0.7) {
            // 70% chance to move toward Pacman
            let bestDir = possibleDirs[0]
            let minDistance = Infinity
            
            possibleDirs.forEach(dir => {
              const [dx, dy] = DIRECTIONS[dir]
              let newX = ghost.pos[0] + dx
              let newY = ghost.pos[1] + dy
              
              if (newX < 0) newX = MAZE_COLS - 1
              if (newX >= MAZE_COLS) newX = 0
              
              const distance = Math.abs(newX - pacman.pos[0]) + Math.abs(newY - pacman.pos[1])
              if (distance < minDistance) {
                minDistance = distance
                bestDir = dir
              }
            })
            
            chosenDir = bestDir
          } else {
            // 30% chance for random movement
            chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)]
          }
        }
      }
      
      // Avoid going backwards unless it's the only option
      if (possibleDirs.length > 1) {
        const oppositeDir: Record<string, string> = {
          'LEFT': 'RIGHT',
          'RIGHT': 'LEFT',
          'UP': 'DOWN',
          'DOWN': 'UP'
        }
        
        if (chosenDir === oppositeDir[ghost.dir] && Math.random() < 0.8) {
          const otherDirs = possibleDirs.filter(dir => dir !== oppositeDir[ghost.dir])
          if (otherDirs.length > 0) {
            chosenDir = otherDirs[Math.floor(Math.random() * otherDirs.length)] as typeof chosenDir
          }
        }
      }
      
      // Move the ghost
      ghost.dir = chosenDir
      const [dx, dy] = DIRECTIONS[ghost.dir]
      let newX = ghost.pos[0] + dx
      let newY = ghost.pos[1] + dy
      
      // Handle tunnel effect
      if (newX < 0) newX = MAZE_COLS - 1
      if (newX >= MAZE_COLS) newX = 0
      
      if (canMove(newX, newY)) {
        ghost.pos = [newX, newY]
      }
    }

    // Game logic
    function checkCollisions() {
      if (!gameStarted) return
      
      // Check ghost collisions
      ghosts.forEach(ghost => {
        if (ghost.eaten) return
        
        if (checkCollision(pacman.pos, ghost.pos)) {
          if (ghost.frightened) {
            ghost.eaten = true
            ghost.respawnTime = Date.now() + GHOST_RESPAWN_TIME
            scoreRef.current += 200
            setScore(scoreRef.current)
          } else {
            gameOver = true
            handleGameOver()
          }
        }
      })
    }

    function checkDots() {
      if (!gameStarted) return
      
      const cell = MAZE[pacman.pos[1]][pacman.pos[0]]
      
      if (cell === 2) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0
        scoreRef.current += 10
        setScore(scoreRef.current)
      } else if (cell === 3) {
        MAZE[pacman.pos[1]][pacman.pos[0]] = 0
        scoreRef.current += 50
        setScore(scoreRef.current)
        
        // Make all ghosts frightened
        ghosts.forEach(ghost => {
          if (!ghost.eaten) {
            ghost.frightened = true
          }
        })
        frightenedTimer = Date.now() + FRIGHTENED_DURATION
      }
      
      // Check for win condition
      let dotsRemaining = 0
      for (let row = 0; row < MAZE_ROWS; row++) {
        for (let col = 0; col < MAZE_COLS; col++) {
          if (MAZE[row][col] === 2 || MAZE[row][col] === 3) {
            dotsRemaining++
          }
        }
      }
      
      if (dotsRemaining === 0) {
        youWin = true
        scoreRef.current += 500
        setScore(scoreRef.current)
        handleGameOver()
      }
    }

    function updateFrightenedTimer() {
      if (frightenedTimer > 0 && Date.now() > frightenedTimer) {
        frightenedTimer = 0
        ghosts.forEach(ghost => {
          if (!ghost.eaten) {
            ghost.frightened = false
          }
        })
      }
    }

    // Main game loop
    function gameLoop() {
      if (!isMountedRef.current || !runningRef.current) return

      if (!gameOver && !youWin) {
        globalFrame++
        
        // Update game state
        movePacman()
        ghosts.forEach(moveGhost)
        checkCollisions()
        checkDots()
        updateFrightenedTimer()
      }
      
      // Clear canvas
      ctx.fillStyle = COLORS.BLACK
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      
      // Draw game elements
      drawMaze()
      drawPacman()
      drawGhosts()
      
      // Draw score
      ctx.save()
      ctx.shadowBlur = 5
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)'
      ctx.fillStyle = COLORS.YELLOW
      ctx.font = 'bold 20px Orbitron'
      ctx.fillText(`Score: ${scoreRef.current}`, 10, 25)
      ctx.restore()
      
      if (!gameStarted && !gameOver && !youWin) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        ctx.fillStyle = COLORS.RED
        ctx.font = 'bold 48px Orbitron'
        ctx.textAlign = 'center'
        ctx.fillText('PAC-MAN', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 - 20)
        ctx.fillStyle = COLORS.WHITE
        ctx.font = '18px Orbitron'
        ctx.fillText('Press arrow keys or tap to start', CANVAS_WIDTH/2, CANVAS_HEIGHT/2 + 20)
        ctx.textAlign = 'left'
      }
      
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }

    // Input handling
    const onKey = (e: KeyboardEvent) => {
      if (!runningRef.current) return

      if (!gameStarted && !gameOver && !youWin) {
        gameStarted = true
      }

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          pacman.nextDir = 'LEFT'
          break
        case 'ArrowRight':
          e.preventDefault()
          pacman.nextDir = 'RIGHT'
          break
        case 'ArrowUp':
          e.preventDefault()
          pacman.nextDir = 'UP'
          break
        case 'ArrowDown':
          e.preventDefault()
          pacman.nextDir = 'DOWN'
          break
      }
    }

    window.addEventListener('keydown', onKey, true)

    // Start game loop
    gameStarted = true // Auto-start
    gameLoopRef.current = requestAnimationFrame(gameLoop)

    return () => {
      isMountedRef.current = false
      runningRef.current = false
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = null
      }
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('nova_settings_changed', handleSettingsChange)
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
        audioRef.current = null
      }
    }
  }, [onGameOver])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', maxWidth: '100%', position: 'relative' }}>
      <canvas ref={canvasRef} style={{ border: '2px solid #6b46c1', borderRadius: 8, maxWidth: '100%', height: 'auto' }} />
      <p style={{ color: '#8af0ff', marginTop: 16, fontFamily: 'Rajdhani, sans-serif', fontSize: 14, textAlign: 'center' }}>
        Collect all dots! Avoid ghosts! Power pellets make ghosts vulnerable. Use arrow keys to move.
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
