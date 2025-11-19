import '../Scanlines.css'
import AIMonitoringIndicator, { useAIMonitoring } from '../AIMonitoringIndicator'

interface ContraProps {
  onGameOver: (score: number) => void
}

export default function Contra({ onGameOver }: ContraProps) {
  const { status } = useAIMonitoring()
  // Under Construction - Codebase preserved for future development
  console.log('Contra - Under Construction')
  
  return (
    <div style={{ 
      color: '#eaeaf0', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '400px',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h2 style={{ marginTop: 0, fontFamily: 'Orbitron, sans-serif', fontSize: 'clamp(24px, 5vw, 32px)', marginBottom: 20 }}>
        Contra
      </h2>
      <div style={{
        padding: 'clamp(30px, 8vw, 60px) clamp(20px, 6vw, 40px)',
        background: 'rgba(0, 255, 136, 0.1)',
        border: '3px solid #00ff88',
        borderRadius: 16,
        boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ fontSize: 'clamp(60px, 15vw, 80px)', marginBottom: 20 }}>🚧</div>
        <h3 style={{ 
          fontFamily: 'Orbitron, sans-serif', 
          fontSize: 'clamp(20px, 5vw, 28px)', 
          color: '#00ff88',
          marginBottom: 15,
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Under Construction
        </h3>
        <p style={{ 
          fontFamily: 'Rajdhani, sans-serif', 
          fontSize: 'clamp(16px, 4vw, 18px)', 
          color: '#eaeaf0',
          opacity: 0.9,
          lineHeight: '1.6',
          margin: 0
        }}>
          This game requires advanced streaming setup and is currently being optimized.
          <br /><br />
          <span style={{ fontSize: 'clamp(14px, 3.5vw, 16px)', opacity: 0.7, color: '#8af0ff' }}>Coming soon!</span>
        </p>
      </div>
      
      {/* AI Monitoring Indicator */}
      <AIMonitoringIndicator 
        status={status} 
        position="bottom-left" 
        size="small" 
      />
    </div>
  )
}
