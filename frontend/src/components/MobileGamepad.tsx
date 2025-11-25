import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface MobileGamepadProps {
  gameId: string
}

export default function MobileGamepad({ gameId }: MobileGamepadProps) {
  const [isMobile, setIsMobile] = useState(false)
  const pressedKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        window.innerWidth < 768
      )
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const dispatchKeyEvent = (key: string, type: 'keydown' | 'keyup' = 'keydown') => {
    const keyMap: Record<string, { key: string; code: string }> = {
      'ArrowUp': { key: 'ArrowUp', code: 'ArrowUp' },
      'ArrowDown': { key: 'ArrowDown', code: 'ArrowDown' },
      'ArrowLeft': { key: 'ArrowLeft', code: 'ArrowLeft' },
      'ArrowRight': { key: 'ArrowRight', code: 'ArrowRight' },
      'Space': { key: ' ', code: 'Space' },
      'KeyZ': { key: 'z', code: 'KeyZ' },
      'KeyX': { key: 'x', code: 'KeyX' },
    }

    const keyInfo = keyMap[key]
    if (!keyInfo) return

    const event = new KeyboardEvent(type, {
      key: keyInfo.key,
      code: keyInfo.code,
      keyCode: keyInfo.code === 'Space' ? 32 : 0,
      which: keyInfo.code === 'Space' ? 32 : 0,
      bubbles: true,
      cancelable: true,
      composed: true,
    } as any)

    window.dispatchEvent(event)
    document.dispatchEvent(event)
  }

  const handleButtonPress = (key: string) => {
    // For rotate button, always trigger fresh press (don't check if already pressed)
    if (key === 'KeyZ') {
      dispatchKeyEvent(key, 'keydown')
      setTimeout(() => {
        dispatchKeyEvent(key, 'keyup')
      }, 50)
      return
    }
    
    if (!pressedKeys.current.has(key)) {
      pressedKeys.current.add(key)
      dispatchKeyEvent(key, 'keydown')
    }
  }

  const handleButtonRelease = (key: string) => {
    pressedKeys.current.delete(key)
    dispatchKeyEvent(key, 'keyup')
  }

  useEffect(() => {
    return () => {
      pressedKeys.current.forEach(key => {
        dispatchKeyEvent(key, 'keyup')
      })
      pressedKeys.current.clear()
    }
  }, [])

  if (!isMobile) return null

  // Flappy Nova gets a special single-button control
  if (gameId === 'flappy') {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 40,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      >
        <motion.button
          onTouchStart={(e) => {
            e.preventDefault()
            handleButtonPress('Space')
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            handleButtonRelease('Space')
          }}
          onMouseDown={() => handleButtonPress('Space')}
          onMouseUp={() => handleButtonRelease('Space')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            width: 120,
            height: 120,
            background: 'linear-gradient(135deg, #ff4081, #ff6b9d)',
            border: '4px solid #ff4081',
            borderRadius: '50%',
            color: '#fff',
            fontSize: 48,
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 64, 129, 0.6), 0 0 40px rgba(255, 64, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            userSelect: 'none'
          }}
        >
          ↑
        </motion.button>
        <div style={{
          textAlign: 'center',
          marginTop: 12,
          color: '#ff4081',
          fontSize: 14,
          fontWeight: 'bold',
          fontFamily: 'Rajdhani, sans-serif',
          textShadow: '0 0 10px rgba(255, 64, 129, 0.8)'
        }}>
          TAP TO FLY
        </div>
      </div>
    )
  }

  const needsSpaceButton = gameId === 'bonk' || gameId === 'tetramem' || gameId === 'contra'
  const needsRotateButton = gameId === 'tetramem'
  const needsDuckButton = gameId === 'contra'

  return (
    <div
      onTouchStart={(e) => e.preventDefault()}
      onTouchMove={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 180,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px',
        zIndex: 1000,
        pointerEvents: 'auto',
        touchAction: 'none',
        background: 'linear-gradient(to top, rgba(14, 15, 21, 0.95), transparent)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* D-Pad (Left Side) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 70px)',
        gridTemplateRows: 'repeat(3, 70px)',
        gap: 10,
        position: 'relative'
      }}>
        {/* Up */}
        <div style={{ gridColumn: '2', gridRow: '1' }}>
          <motion.button
            onTouchStart={(e) => {
              e.preventDefault()
              handleButtonPress('ArrowUp')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleButtonRelease('ArrowUp')
            }}
            onMouseDown={() => handleButtonPress('ArrowUp')}
            onMouseUp={() => handleButtonRelease('ArrowUp')}
            onMouseLeave={() => handleButtonRelease('ArrowUp')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)',
              border: '3px solid #a855f7',
              borderRadius: 12,
              color: '#fff',
              fontSize: 32,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(107, 70, 193, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ↑
          </motion.button>
        </div>

        {/* Left */}
        <div style={{ gridColumn: '1', gridRow: '2' }}>
          <motion.button
            onTouchStart={(e) => {
              e.preventDefault()
              handleButtonPress('ArrowLeft')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleButtonRelease('ArrowLeft')
            }}
            onMouseDown={() => handleButtonPress('ArrowLeft')}
            onMouseUp={() => handleButtonRelease('ArrowLeft')}
            onMouseLeave={() => handleButtonRelease('ArrowLeft')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)',
              border: '3px solid #a855f7',
              borderRadius: 12,
              color: '#fff',
              fontSize: 32,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(107, 70, 193, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ←
          </motion.button>
        </div>

        {/* Center (empty) */}
        <div style={{ gridColumn: '2', gridRow: '2' }} />

        {/* Right */}
        <div style={{ gridColumn: '3', gridRow: '2' }}>
          <motion.button
            onTouchStart={(e) => {
              e.preventDefault()
              handleButtonPress('ArrowRight')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleButtonRelease('ArrowRight')
            }}
            onMouseDown={() => handleButtonPress('ArrowRight')}
            onMouseUp={() => handleButtonRelease('ArrowRight')}
            onMouseLeave={() => handleButtonRelease('ArrowRight')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)',
              border: '3px solid #a855f7',
              borderRadius: 12,
              color: '#fff',
              fontSize: 32,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(107, 70, 193, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            →
          </motion.button>
        </div>

        {/* Down */}
        <div style={{ gridColumn: '2', gridRow: '3' }}>
          <motion.button
            onTouchStart={(e) => {
              e.preventDefault()
              handleButtonPress('ArrowDown')
            }}
            onTouchEnd={(e) => {
              e.preventDefault()
              handleButtonRelease('ArrowDown')
            }}
            onMouseDown={() => handleButtonPress('ArrowDown')}
            onMouseUp={() => handleButtonRelease('ArrowDown')}
            onMouseLeave={() => handleButtonRelease('ArrowDown')}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #6b46c1, #8b5cf6)',
              border: '3px solid #a855f7',
              borderRadius: 12,
              color: '#fff',
              fontSize: 32,
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(107, 70, 193, 0.6), 0 0 30px rgba(139, 92, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              userSelect: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ↓
          </motion.button>
        </div>
      </div>

      {/* Action Buttons (Right Side) */}
      {(needsSpaceButton || needsRotateButton) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          {needsRotateButton && (
            <motion.button
              onTouchStart={(e) => {
                e.preventDefault()
                handleButtonPress('KeyZ')
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleButtonRelease('KeyZ')
              }}
              onMouseDown={() => handleButtonPress('KeyZ')}
              onMouseUp={() => handleButtonRelease('KeyZ')}
              onMouseLeave={() => handleButtonRelease('KeyZ')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 70,
                height: 70,
                background: 'linear-gradient(135deg, #00ff88, #4dffaa)',
                border: '2px solid #00ff88',
                borderRadius: 12,
                color: '#fff',
                fontSize: 20,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 255, 136, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1001,
                position: 'relative'
              }}
            >
              ↻
            </motion.button>
          )}
          {needsSpaceButton && (
            <motion.button
              onTouchStart={(e) => {
                e.preventDefault()
                handleButtonPress('Space')
              }}
              onTouchEnd={(e) => {
                e.preventDefault()
                handleButtonRelease('Space')
              }}
              onMouseDown={() => handleButtonPress('Space')}
              onMouseUp={() => handleButtonRelease('Space')}
              onMouseLeave={() => handleButtonRelease('Space')}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                width: 70,
                height: 70,
                background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                border: '2px solid #f472b6',
                borderRadius: '50%',
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(236, 72, 153, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ↓
            </motion.button>
          )}
        </div>
      )}
    </div>
  )
}

