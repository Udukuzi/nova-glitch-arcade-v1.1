import { useEffect, useState, useRef } from 'react'
import '../Scanlines.css'

interface MemoryMatchProps {
  onGameOver: (score: number) => void
}

interface Card {
  id: number
  value: number
  flipped: boolean
  matched: boolean
}

const CARD_IMAGES = ['🐸', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽']

const MAX_INCORRECT_MOVES = 10

export default function MemoryMatch({ onGameOver }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [moves, setMoves] = useState(0)
  const [incorrectMoves, setIncorrectMoves] = useState(0)
  const [gameWon, setGameWon] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const pairs = 8
    const values: number[] = []
    for (let i = 0; i < pairs; i++) {
      values.push(i + 1, i + 1)
    }
    const shuffled = [...values].sort(() => Math.random() - 0.5)
    const initialCards: Card[] = shuffled.map((value, index) => ({
      id: index,
      value,
      flipped: false,
      matched: false
    }))
    setCards(initialCards)
    setScore(0)
    setMoves(0)
    setIncorrectMoves(0)
    setGameWon(false)
    setGameOver(false)
    setFlippedCards([])
    setIsChecking(false)

    audioRef.current = new Audio('/memory-match-sound.mp3')
    audioRef.current.volume = 0.3
    
    // Listen for settings changes
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent
      const { musicEnabled } = customEvent.detail
      if (audioRef.current) {
        audioRef.current.volume = musicEnabled ? 0.3 : 0
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
    if (gameWon) {
      onGameOver(score)
    }
  }, [gameWon, score, onGameOver])

  useEffect(() => {
    if (gameOver && !gameWon) {
      onGameOver(score)
    }
  }, [gameOver, score, gameWon, onGameOver])

  const handleCardClick = (cardId: number) => {
    if (isChecking || gameWon || gameOver) return
    
    const card = cards[cardId]
    if (card.flipped || card.matched || flippedCards.length >= 2) return

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {})
    }

    const newCards = [...cards]
    newCards[cardId].flipped = true
    setCards(newCards)

    const newFlipped = [...flippedCards, cardId]
    setFlippedCards(newFlipped)

    if (newFlipped.length === 2) {
      setIsChecking(true)
      setMoves(prev => prev + 1)
      
      setTimeout(() => {
        const [firstId, secondId] = newFlipped
        setCards(currentCards => {
          const firstCard = currentCards[firstId]
          const secondCard = currentCards[secondId]

          if (firstCard.value === secondCard.value) {
            const updated = [...currentCards]
            updated[firstId].matched = true
            updated[secondId].matched = true
            
            setScore(prev => {
              const newScore = prev + 10
              const allMatched = updated.every(c => c.matched)
              if (allMatched) {
                setGameWon(true)
              }
              return newScore
            })
            
            return updated
          } else {
            setIncorrectMoves(prev => {
              const newIncorrect = prev + 1
              if (newIncorrect >= MAX_INCORRECT_MOVES) {
                setGameOver(true)
              }
              return newIncorrect
            })
            
            const updated = [...currentCards]
            updated[firstId].flipped = false
            updated[secondId].flipped = false
            return updated
          }
        })
        setFlippedCards([])
        setIsChecking(false)
      }, 1000)
    }
  }

  const getCardColor = (value: number) => {
    const colors = ['#ff4081', '#00ff88', '#6b46c1', '#00e5ff', '#ec4899', '#ff6b35', '#8b5cf6', '#00ffff']
    return colors[(value - 1) % colors.length]
  }

  const getCardImage = (value: number) => {
    return CARD_IMAGES[(value - 1) % CARD_IMAGES.length]
  }

  const remainingMoves = MAX_INCORRECT_MOVES - incorrectMoves

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 20 }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h3 style={{ color: '#eaeaf0', fontFamily: 'Orbitron, sans-serif', marginBottom: 8 }}>
          Memory Match
        </h3>
        <p style={{ color: '#8af0ff' }}>
          Score: {score} | Moves: {moves} | Wrong Guesses Left: <span style={{ 
            color: remainingMoves <= 3 ? '#ff4081' : remainingMoves <= 6 ? '#ff6b35' : '#00ff88',
            fontWeight: 'bold'
          }}>{remainingMoves}</span>/{MAX_INCORRECT_MOVES}
        </p>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(60px, 1fr))',
        gap: 8,
        maxWidth: '100%',
        width: '100%',
        padding: '0 10px',
        boxSizing: 'border-box',
        opacity: gameOver ? 0.5 : 1,
        pointerEvents: gameOver ? 'none' : 'auto'
      }}>
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            disabled={card.flipped || card.matched || flippedCards.length >= 2 || isChecking || gameWon || gameOver}
            style={{
              width: '100%',
              aspectRatio: '1',
              minWidth: 60,
              minHeight: 60,
              background: card.matched 
                ? `linear-gradient(135deg, ${getCardColor(card.value)}, ${getCardColor(card.value)}dd)` 
                : card.flipped 
                  ? `linear-gradient(135deg, ${getCardColor(card.value)}40, ${getCardColor(card.value)}20)`
                  : 'linear-gradient(135deg, #1e2236, #0e0f15)',
              border: `3px solid ${card.matched ? getCardColor(card.value) : card.flipped ? getCardColor(card.value) : '#6b46c1'}`,
              borderRadius: 16,
              color: '#fff',
              fontSize: 48,
              fontWeight: 'bold',
              cursor: card.matched || card.flipped || gameOver ? 'default' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: card.matched ? `0 0 30px ${getCardColor(card.value)}` : card.flipped ? `0 0 15px ${getCardColor(card.value)}` : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.flipped || card.matched ? getCardImage(card.value) : '?'}
          </button>
        ))}
      </div>

      {gameWon && (
        <p style={{ color: '#00ff88', marginTop: 20, fontFamily: 'Orbitron, sans-serif', fontSize: 20 }}>
          🎉 You Won! 🎉
        </p>
      )}

      {gameOver && !gameWon && (
        <p style={{ color: '#ff4081', marginTop: 20, fontFamily: 'Orbitron, sans-serif', fontSize: 20 }}>
          ❌ Game Over! Too many wrong guesses! ❌
        </p>
      )}
    </div>
  )
}
