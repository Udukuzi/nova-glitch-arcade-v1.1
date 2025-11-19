import '../Scanlines.css'

interface BonkRyderProps {
  onGameOver: (score: number) => void
}

export default function BonkRyder({ onGameOver }: BonkRyderProps) {
  // Under Construction - Codebase preserved for future development
  console.log('Bonk Ryder - Under Construction')
  
  return (
    <div style={{ 
      color: '#eaeaf0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center'
    }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 32, marginBottom: 20 }}>
        Bonk Ryder
      </h2>
      <div style={{
        padding: '60px 40px',
        background: 'rgba(255, 107, 53, 0.1)',
        border: '3px solid #ff6b35',
        borderRadius: 16,
        boxShadow: '0 0 40px rgba(255, 107, 53, 0.3)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ fontSize: '80px', marginBottom: 20 }}>🚧</div>
        <h3 style={{ 
          fontFamily: 'Orbitron, sans-serif', 
          fontSize: 28, 
          color: '#ff6b35',
          marginBottom: 15,
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Under Construction
        </h3>
        <p style={{ 
          fontFamily: 'Rajdhani, sans-serif', 
          fontSize: 18, 
          opacity: 0.8,
          lineHeight: '1.6'
        }}>
          This game is currently being rebuilt for a better experience.
          <br />
          <span style={{ fontSize: 16, opacity: 0.6 }}>We'll be back soon!</span>
        </p>
      </div>
    </div>
  )
}
