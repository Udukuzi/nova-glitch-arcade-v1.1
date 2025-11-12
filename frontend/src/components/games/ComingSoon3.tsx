import '../Scanlines.css'

interface ComingSoonProps {
  onGameOver: (score: number) => void
}

export default function ComingSoon3({ onGameOver }: ComingSoonProps) {
  return (
    <div style={{ color: '#eaeaf0', textAlign: 'center', padding: '60px 20px' }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 32, marginBottom: 20 }}>
        🎮 Coming Soon
      </h2>
      <div style={{
        padding: '60px 40px',
        background: 'rgba(0, 229, 255, 0.1)',
        border: '3px solid #00e5ff',
        borderRadius: 16,
        boxShadow: '0 0 40px rgba(0, 229, 255, 0.3)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ fontSize: '80px', marginBottom: 20 }}>🚧</div>
        <h3 style={{ 
          fontFamily: 'Orbitron, sans-serif', 
          fontSize: 28, 
          color: '#00e5ff',
          marginBottom: 15,
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Game Under Development
        </h3>
        <p style={{ 
          fontFamily: 'Rajdhani, sans-serif', 
          fontSize: 18, 
          opacity: 0.8,
          lineHeight: '1.6'
        }}>
          We're working hard to bring you an exciting new game!
          <br />
          <span style={{ fontSize: 16, opacity: 0.6 }}>Check back soon!</span>
        </p>
      </div>
    </div>
  )
}












