import { useState } from 'react'
import { motion } from 'framer-motion'

interface PasswordGateProps {
  onSuccess: () => void
}

export default function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [attempts, setAttempts] = useState(0)

  // 🔒 SET YOUR PASSWORD HERE (Change this!)
  const CORRECT_PASSWORD = 'test2025' // Change to your preferred password

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password === CORRECT_PASSWORD) {
      // Store password in sessionStorage (clears when browser closes)
      sessionStorage.setItem('access_granted', 'true')
      onSuccess()
    } else {
      setAttempts(attempts + 1)
      setError('Incorrect password. Please try again.')
      setPassword('')
      
      if (attempts >= 4) {
        setError('Too many failed attempts. Please refresh the page.')
      }
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      zIndex: 10000,
      padding: 20
    }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'rgba(30, 34, 54, 0.95)',
          border: '2px solid #a855f7',
          borderRadius: 16,
          padding: 40,
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)'
        }}
      >
        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          color: '#eaeaf0',
          textAlign: 'center',
          marginBottom: 8,
          fontSize: 24
        }}>
          🔒 Testing Access
        </h2>
        <p style={{
          fontFamily: 'Rajdhani, sans-serif',
          color: '#8af0ff',
          textAlign: 'center',
          marginBottom: 24,
          fontSize: 14,
          opacity: 0.8
        }}>
          Enter password to access the arcade
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: 16,
              borderRadius: 8,
              border: '2px solid #1e2236',
              background: 'rgba(14, 15, 21, 0.8)',
              color: '#eaeaf0',
              fontFamily: 'Rajdhani, sans-serif',
              marginBottom: 16,
              outline: 'none',
              transition: 'all 0.3s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#a855f7'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#1e2236'
            }}
          />
          {error && (
            <p style={{
              color: '#ff6b35',
              fontSize: 14,
              marginBottom: 16,
              textAlign: 'center',
              fontFamily: 'Rajdhani, sans-serif'
            }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 'bold',
              borderRadius: 8,
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#ffffff',
              cursor: 'pointer',
              fontFamily: 'Orbitron, sans-serif',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 16px rgba(168, 85, 247, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)'
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.4)'
            }}
          >
            Access Arcade
          </button>
        </form>
        <p style={{
          fontSize: 11,
          color: '#8af0ff',
          textAlign: 'center',
          marginTop: 20,
          opacity: 0.6,
          fontFamily: 'Rajdhani, sans-serif'
        }}>
          This is a private testing version
        </p>
      </motion.div>
    </div>
  )
}












