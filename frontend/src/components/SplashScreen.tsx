import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../contexts/ThemeContext'
import { soundManager } from '../utils/sounds'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const { theme } = useTheme()
  const [show, setShow] = useState(true)
  const [glitchOffset, setGlitchOffset] = useState(0)
  const [noiseOpacity, setNoiseOpacity] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // Play startup sound from dist folder
    const audio = new Audio('/game-start.mp3');
    audio.volume = 0.6;
    audio.play().catch(err => {
      console.log('Audio play prevented, trying again on user interaction:', err);
      // Retry on first user interaction
      const playOnClick = () => {
        audio.play().catch(e => console.log('Audio still blocked:', e));
        document.removeEventListener('click', playOnClick);
      };
      document.addEventListener('click', playOnClick, { once: true });
    });

    // Enhanced glitch effect - random horizontal shifts throughout page
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        setGlitchOffset(Math.random() > 0.5 ? 3 : -3)
        setTimeout(() => setGlitchOffset(0), 80)
      }
    }, 150)

    // Noise/static effect
    const noiseInterval = setInterval(() => {
      setNoiseOpacity(Math.random() > 0.7 ? 0.15 : 0)
    }, 100)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(noiseInterval)
    }
  }, [])

  const handleLaunch = () => {
    setShow(false)
    setTimeout(() => {
      onComplete()
    }, 500)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: theme === 'dark' ? '#0a0a0a' : '#ffffff',
            zIndex: 9999,
            overflow: 'hidden',
            padding: '40px 20px'
          }}
        >
          {/* Full-page glitch overlay with noise */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 13,
              opacity: noiseOpacity,
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  rgba(168, 85, 247, 0.03) 2px,
                  rgba(168, 85, 247, 0.03) 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  rgba(0, 255, 255, 0.03) 2px,
                  rgba(0, 255, 255, 0.03) 4px
                )
              `
            }}
            animate={{
              opacity: [0, 0.15, 0, 0.1, 0],
              transform: `translateX(${glitchOffset}px)`
            }}
            transition={{
              duration: 0.2,
              repeat: Infinity,
              repeatDelay: 0.1
            }}
          />

          {/* Full-page RGB glitch separation */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 2,
              background: `linear-gradient(90deg, 
                rgba(255, 0, 0, 0.05) 0%, 
                transparent 50%, 
                rgba(0, 0, 255, 0.05) 100%
              )`,
              mixBlendMode: 'screen',
              transform: `translateX(${glitchOffset * 2}px)`
            }}
            animate={{
              x: [0, glitchOffset * 2, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatDelay: 0.3
            }}
          />
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 2,
              background: `linear-gradient(90deg, 
                rgba(0, 255, 0, 0.05) 0%, 
                transparent 50%, 
                rgba(255, 0, 255, 0.05) 100%
              )`,
              mixBlendMode: 'screen',
              transform: `translateX(${-glitchOffset * 2}px)`
            }}
            animate={{
              x: [0, -glitchOffset * 2, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.1,
              repeat: Infinity,
              repeatDelay: 0.3
            }}
          />

          {/* Animated Geometric Background Glitch Pattern - Enhanced */}
          <motion.div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 1,
              opacity: 0.15
            }}
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(0, 255, 255, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 50% 20%, rgba(236, 72, 153, 0.4) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.4) 0%, transparent 50%)',
              ],
              transform: `translateX(${glitchOffset}px)`
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'linear'
            }}
          />

          {/* Full-page vertical glitch lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`vline-${i}`}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: '1px',
                left: `${(i + 1) * 12.5}%`,
                pointerEvents: 'none',
                zIndex: 3,
                background: `linear-gradient(180deg, 
                  transparent 0%, 
                  rgba(${168 + i * 5}, ${85 + i * 10}, 247, 0.3) 50%, 
                  transparent 100%
                )`,
                opacity: 0
              }}
              animate={{
                opacity: [0, 1, 1, 0],
                scaleY: [1, 1.1, 1]
              }}
              transition={{
                duration: 0.3,
                repeat: Infinity,
                repeatDelay: 1 + Math.random() * 2,
                times: [0, 0.2, 0.8, 1]
              }}
            />
          ))}

          {/* Splash Image with Enhanced Glitch Animation */}
          <motion.div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '90%',
              maxHeight: '70vh',
              position: 'relative',
              zIndex: 10
            }}
          >
            {/* RGB Glitch Separation Layers */}
            <motion.img
              src="/splash-image.png"
              alt=""
              style={{
                position: 'absolute',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: 'blur(0px)',
                mixBlendMode: 'screen',
                opacity: 0.4,
                transform: `translateX(${glitchOffset * 4}px)`,
                zIndex: 8
              }}
              animate={{
                x: [0, glitchOffset * 4, 0],
                filter: ['blur(0px)', 'blur(1.5px)', 'blur(0px)']
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                repeatDelay: 0.2
              }}
            />
            <motion.img
              src="/splash-image.png"
              alt=""
              style={{
                position: 'absolute',
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                filter: 'blur(0px)',
                mixBlendMode: 'screen',
                opacity: 0.4,
                transform: `translateX(${-glitchOffset * 4}px)`,
                zIndex: 8
              }}
              animate={{
                x: [0, -glitchOffset * 4, 0],
                filter: ['blur(0px)', 'blur(1.5px)', 'blur(0px)']
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                repeatDelay: 0.2
              }}
            />

            {/* Main Image with Dynamic Animation */}
            <motion.img
              src="/splash-image.png"
              alt="Nova Arcade Glitch"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent && !parent.querySelector('.fallback-logo')) {
                  const fallback = document.createElement('div')
                  fallback.className = 'fallback-logo'
                  fallback.style.cssText = 'text-align: center; padding: 40px;'
                  
                  const container = document.createElement('div')
                  container.style.cssText = 'text-align: center; padding: 40px;'
                  
                  const h1 = document.createElement('h1')
                  h1.textContent = 'NOVA'
                  h1.style.cssText = 'font-size: 64px; color: #a855f7; margin-bottom: 20px; letter-spacing: 4px;'
                  
                  const h2 = document.createElement('h2')
                  h2.textContent = 'GLITCH ARCADE'
                  h2.style.cssText = 'font-size: 32px; color: #c084fc; letter-spacing: 2px;'
                  
                  container.appendChild(h1)
                  container.appendChild(h2)
                  fallback.appendChild(container)
                  parent.appendChild(fallback)
                }
              }}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '12px',
                filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                position: 'relative',
                zIndex: 9,
                transform: `translateX(${glitchOffset}px)`
              }}
              initial={{ 
                scale: 0.5,
                opacity: 0,
                y: 50,
                rotate: -5
              }}
              animate={{ 
                scale: [0.5, 1.15, 1.05, 1],
                opacity: [0, 0.8, 1, 1],
                y: [50, -20, 10, 0],
                rotate: [-5, 2, -1, 0],
                filter: [
                  'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                  'drop-shadow(0 0 40px rgba(168, 85, 247, 0.8))',
                  'drop-shadow(0 0 30px rgba(0, 255, 255, 0.6))',
                  'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))'
                ]
              }}
              transition={{
                duration: 2.5,
                times: [0, 0.3, 0.7, 1],
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2
              }}
              whileHover={{ 
                scale: 1.05,
                rotate: 1,
                transition: { duration: 0.3 }
              }}
            />

            {/* Multiple Glitch Scan Lines - Enhanced */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  zIndex: 11,
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  style={{
                    position: 'absolute',
                    top: `${15 + i * 20}%`,
                    left: '-10%',
                    width: '120%',
                    height: i === 0 ? '4px' : '2px',
                    background: `linear-gradient(90deg, 
                      transparent 0%, 
                      rgba(${168 + i * 15}, ${85 + i * 25}, 247, 0.95) 20%, 
                      rgba(0, 255, 255, 0.95) 50%, 
                      rgba(${168 + i * 15}, ${85 + i * 25}, 247, 0.95) 80%, 
                      transparent 100%
                    )`,
                    boxShadow: `0 0 30px rgba(${168 + i * 15}, ${85 + i * 25}, 247, 0.9), 0 0 60px rgba(0, 255, 255, 0.5)`,
                    transform: 'translateY(-50%)'
                  }}
                  initial={{ x: '-20%', opacity: 0 }}
                  animate={{ 
                    x: ['-20%', '120%', '-20%'],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ 
                    duration: 1.5 + i * 0.4,
                    repeat: Infinity,
                    repeatDelay: 0.3 + i * 0.2,
                    times: [0, 0.5, 1],
                    ease: 'linear'
                  }}
                />
              </motion.div>
            ))}

            {/* Random Glitch Blocks - More visible */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`block-${i}`}
                style={{
                  position: 'absolute',
                  width: `${8 + Math.random() * 25}%`,
                  height: `${2 + Math.random() * 3}px`,
                  background: `linear-gradient(90deg, 
                    rgba(168, 85, 247, 0.9), 
                    rgba(0, 255, 255, 0.9),
                    rgba(236, 72, 153, 0.9)
                  )`,
                  left: `${Math.random() * 80}%`,
                  top: `${Math.random() * 100}%`,
                  opacity: 0,
                  zIndex: 12
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [0, Math.random() * 15 - 7.5, 0],
                  x: [0, glitchOffset * 2, 0]
                }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 1.5 + Math.random() * 2.5,
                  times: [0, 0.2, 0.8, 1]
                }}
              />
            ))}
          </motion.div>

          {/* Launch App Button with Enhanced Glitch Text Effect */}
          <motion.button
            initial={{ y: 30, opacity: 0, scale: 0.8 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              scale: 1,
              boxShadow: [
                '0 8px 24px rgba(168, 85, 247, 0.4)',
                '0 12px 32px rgba(168, 85, 247, 0.6)',
                '0 8px 24px rgba(168, 85, 247, 0.4)'
              ],
              transform: `translateX(${glitchOffset * 0.5}px)`
            }}
            transition={{ 
              delay: 1.5, 
              duration: 0.8,
              boxShadow: {
                duration: 2,
                repeat: Infinity,
                repeatDelay: 0.5
              }
            }}
            onClick={handleLaunch}
            className="glitch-btn"
            style={{
              padding: '16px 48px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(168, 85, 247, 0.4)',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: 20,
              position: 'relative',
              overflow: 'hidden',
              zIndex: 10
            }}
            whileHover={{ 
              scale: 1.1,
              boxShadow: '0 16px 40px rgba(168, 85, 247, 0.8)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Multiple glitch text effect overlays */}
            <motion.span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00ffff',
                opacity: 0,
                textShadow: '3px 0 0 #ff00ff',
                transform: `translateX(${glitchOffset * 2}px)`
              }}
              animate={{
                opacity: [0, 0.9, 0],
                x: [0, glitchOffset * 2, 0]
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                repeatDelay: 1.2
              }}
            >
              🚀 Launch App
            </motion.span>
            <motion.span
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff00ff',
                opacity: 0,
                textShadow: '-3px 0 0 #00ffff',
                transform: `translateX(${-glitchOffset * 2}px)`
              }}
              animate={{
                opacity: [0, 0.9, 0],
                x: [0, -glitchOffset * 2, 0]
              }}
              transition={{
                duration: 0.1,
                repeat: Infinity,
                repeatDelay: 1.5
              }}
            >
              🚀 Launch App
            </motion.span>
            <span style={{ position: 'relative', zIndex: 1 }}>🚀 Launch App</span>
          </motion.button>

          {/* GitHub Whitepaper Link */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transform: `translateX(${glitchOffset * 0.3}px)`
            }}
            transition={{ delay: 2, duration: 0.5 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 20,
              zIndex: 10
            }}
          >
            <a
              href="https://github.com/Udukuzi/nova-glitch-arcade-v1.1/blob/master/WHITEPAPER.md"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 24px',
                background: 'linear-gradient(135deg, rgba(36, 41, 46, 0.9) 0%, rgba(13, 17, 23, 0.9) 100%)',
                border: '2px solid #30363d',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                color: '#f0f6fc',
                fontFamily: '"Orbitron", sans-serif',
                fontSize: 14,
                fontWeight: 600,
                filter: `drop-shadow(${glitchOffset}px 0 0 rgba(240, 246, 252, 0.3))`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
                e.currentTarget.style.borderColor = '#58a6ff'
                e.currentTarget.style.boxShadow = '0 0 20px rgba(88, 166, 255, 0.4)'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(48, 54, 61, 0.95) 0%, rgba(21, 32, 43, 0.95) 100%)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)'
                e.currentTarget.style.borderColor = '#30363d'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(36, 41, 46, 0.9) 0%, rgba(13, 17, 23, 0.9) 100%)'
              }}
            >
              <i className="fab fa-github" style={{ fontSize: 24, color: '#f0f6fc' }}></i>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>📖 Whitepaper</span>
                <span style={{ fontSize: 11, opacity: 0.8, color: '#8b949e' }}>Technical Documentation</span>
              </div>
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
