import { useWallet } from '@solana/wallet-adapter-react';
import { useTokenGate } from '../hooks/useTokenGate';
import { motion } from 'framer-motion';

interface TokenGateOverlayProps {
  children: React.ReactNode;
}

export default function TokenGateOverlay({ children }: TokenGateOverlayProps) {
  const { connected } = useWallet();
  const { hasAccess, balance, isLoading, minimumRequired, tokenMint } = useTokenGate();

  // Show loading state
  if (isLoading && connected) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60,
            height: 60,
            border: '4px solid rgba(0, 255, 136, 0.2)',
            borderTop: '4px solid #00ff88',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <div style={{ color: '#8af0ff', fontSize: 16 }}>
            Checking $NAG balance...
          </div>
        </div>
      </div>
    );
  }

  // If not connected or has access, show children
  if (!connected || hasAccess) {
    return <>{children}</>;
  }

  // Show token gate overlay
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
      padding: 20,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.1), transparent 50%)',
        animation: 'pulse 3s ease-in-out infinite'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: 40,
          background: 'linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(16, 33, 62, 0.95) 100%)',
          border: '2px solid #ff6b00',
          borderRadius: 20,
          maxWidth: 500,
          width: '100%',
          boxShadow: '0 20px 60px rgba(255, 107, 0, 0.3)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Lock Icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
          style={{ fontSize: 80, marginBottom: 20 }}
        >
          🔒
        </motion.div>

        {/* Title */}
        <h2 style={{
          color: '#ff6b00',
          marginBottom: 16,
          fontSize: 32,
          fontFamily: '"Monoton", cursive',
          textShadow: '0 0 20px rgba(255, 107, 0, 0.5)',
          letterSpacing: '0.05em'
        }}>
          TOKEN REQUIRED
        </h2>

        {/* Description */}
        <p style={{
          color: '#8af0ff',
          marginBottom: 24,
          fontSize: 16,
          lineHeight: 1.6,
          fontFamily: '"Rajdhani", sans-serif'
        }}>
          You need at least <strong style={{ color: '#00ff88' }}>{minimumRequired.toLocaleString()} $NAG</strong> tokens to access the arcade.
        </p>

        {/* Balance Display */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.4)',
          padding: 20,
          borderRadius: 12,
          marginBottom: 24,
          border: '1px solid rgba(255, 107, 0, 0.3)'
        }}>
          <div style={{
            color: '#8af0ff',
            fontSize: 14,
            marginBottom: 8,
            fontFamily: '"Orbitron", sans-serif'
          }}>
            YOUR BALANCE
          </div>
          <div style={{
            color: balance >= minimumRequired ? '#00ff88' : '#ff6b00',
            fontSize: 36,
            fontWeight: 'bold',
            fontFamily: '"Orbitron", sans-serif',
            textShadow: `0 0 15px ${balance >= minimumRequired ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 107, 0, 0.5)'}`
          }}>
            {balance.toFixed(2)} $NAG
          </div>
          <div style={{
            color: '#ff6b00',
            fontSize: 14,
            marginTop: 8,
            fontFamily: '"Rajdhani", sans-serif'
          }}>
            Need {(minimumRequired - balance).toLocaleString()} more
          </div>
        </div>

        {/* Buy Button */}
        <a
          href={tokenMint !== 'PLACEHOLDER' ? `https://pump.fun/${tokenMint}` : '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (tokenMint === 'PLACEHOLDER') {
              e.preventDefault();
              alert('Token launching soon! Check Twitter for updates.');
            }
          }}
          style={{
            display: 'inline-block',
            padding: '16px 40px',
            background: 'linear-gradient(90deg, #ff6b00, #ff0000)',
            color: '#fff',
            fontWeight: 'bold',
            borderRadius: 12,
            textDecoration: 'none',
            fontSize: 18,
            marginBottom: 16,
            fontFamily: '"Orbitron", sans-serif',
            boxShadow: '0 10px 30px rgba(255, 107, 0, 0.4)',
            transition: 'all 0.3s ease',
            cursor: tokenMint === 'PLACEHOLDER' ? 'not-allowed' : 'pointer',
            opacity: tokenMint === 'PLACEHOLDER' ? 0.6 : 1
          }}
          onMouseEnter={(e) => {
            if (tokenMint !== 'PLACEHOLDER') {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 15px 40px rgba(255, 107, 0, 0.6)';
            }
          }}
          onMouseLeave={(e) => {
            if (tokenMint !== 'PLACEHOLDER') {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 107, 0, 0.4)';
            }
          }}
        >
          {tokenMint === 'PLACEHOLDER' ? '🚀 Token Launching Soon' : '💰 Buy $NAG Tokens'}
        </a>

        {/* Instructions */}
        <div style={{
          color: '#8af0ff',
          fontSize: 12,
          marginTop: 16,
          fontFamily: '"Rajdhani", sans-serif',
          opacity: 0.8
        }}>
          {tokenMint === 'PLACEHOLDER' ? (
            <>Follow us on Twitter for launch announcement!</>
          ) : (
            <>After purchase, refresh this page to check balance</>
          )}
        </div>

        {/* Token Info */}
        {tokenMint !== 'PLACEHOLDER' && (
          <div style={{
            marginTop: 20,
            padding: 12,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: 8,
            fontSize: 11,
            color: '#8af0ff',
            fontFamily: 'monospace',
            wordBreak: 'break-all'
          }}>
            Token: {tokenMint.slice(0, 8)}...{tokenMint.slice(-8)}
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
