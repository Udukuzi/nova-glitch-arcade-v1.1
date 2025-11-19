import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sounds';
import { useWallet } from '@solana/wallet-adapter-react';

interface BattleArenaModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BattleArenaModal({ open, onClose }: BattleArenaModalProps) {
  const { connected, publicKey } = useWallet();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agentStatus] = useState({
    status: 'ACTIVE',
    antiCheat: 'ENABLED',
    validation: 'REAL-TIME',
    lastCheck: new Date().toISOString()
  });

  const battleModes = [
    { 
      id: '1v1', 
      icon: '🦄', 
      title: 'Kiddies Mode', 
      subtitle: '(Ages 7-12)',
      entry: '5 USDC', 
      prize: '96% of pool',
      nagPrize: 'Dynamic NAG', 
      color: '#ff44ff',
      description: 'Highest score wins • Safe & fun competition',
      ageRestriction: '7-12',
      winCondition: 'Highest score wins',
      maxEntry: '5 USDC'
    },
    { 
      id: 'team', 
      icon: '🎯', 
      title: 'Teenies Mode', 
      subtitle: '(Ages 13-17)',
      entry: '10 USDC', 
      prize: '96% of pool',
      nagPrize: 'Dynamic NAG', 
      color: '#00aaff',
      description: 'Highest score wins • Competitive gaming',
      ageRestriction: '13-17',
      winCondition: 'Highest score wins',
      maxEntry: '20 USDC'
    },
    { 
      id: 'tournament', 
      icon: '🏆', 
      title: 'Anyone', 
      subtitle: '(All Ages)',
      entry: '15 USDC', 
      prize: '96% of pool',
      nagPrize: 'Dynamic NAG', 
      color: '#ffaa00',
      description: 'Highest score wins • Open to all',
      winCondition: 'Highest score wins',
      maxEntry: 'No limit'
    },
    { 
      id: 'propool', 
      icon: '💎', 
      title: 'Pro Mode', 
      subtitle: '(18+ Only)',
      entry: '250 USDC Min', 
      prize: '96% of pool',
      nagPrize: 'Dynamic NAG', 
      color: '#00ff88',
      description: 'Must reach target score • High stakes',
      ageRestriction: '18+',
      winCondition: 'Must reach or exceed target score',
      minEntry: '250 USDC',
      targetScores: {
        snake: 8888,
        flappy: 8888,
        memory: 111,
        bonk: 888,
        paccoin: 4444,
        tetramem: 8888,
        contra: 8888
      }
    },
    { 
      id: 'practice', 
      icon: '🎮', 
      title: 'Practice', 
      subtitle: '(Free Play)',
      entry: 'FREE', 
      prize: 'None',
      nagPrize: 'None', 
      color: '#666666',
      description: 'Practice mode - no rewards'
    }
  ];

  const handleModeClick = (mode: any) => {
    if (!mode.disabled) {
      soundManager.playClick();
      setSelectedMode(mode.id);
      if (mode.id !== 'practice') {
        setShowConfirm(true);
      } else {
        // Start practice immediately
        console.log('Starting practice mode...');
        onClose();
      }
    }
  };

  const handleConfirm = () => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    console.log('Starting match:', selectedMode);
    setShowConfirm(false);
    onClose();
  };

  const selectedModeData = battleModes.find(m => m.id === selectedMode);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(4px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 20
            }}
          >
            {/* Main Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '2px solid #00ff88',
                borderRadius: 20,
                padding: 32,
                maxWidth: 900,
                width: '100%',
                maxHeight: '90vh',
                overflow: 'auto',
                boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)',
                position: 'relative'
              }}
            >
              {/* AI Agent Status Indicator */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(0, 255, 0, 0.1)',
                border: '1px solid #00ff00',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 10,
                color: '#00ff00',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  background: '#00ff00',
                  borderRadius: '50%',
                  animation: 'pulse 2s infinite'
                }}></div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>AI AGENT: {agentStatus.status}</div>
                  <div>Anti-Cheat: {agentStatus.antiCheat}</div>
                </div>
              </div>

              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 32,
                  color: '#00ff88',
                  textTransform: 'uppercase'
                }}>
                  ⚔️ Battle Arena
                </h2>
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onClose();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8af0ff',
                    fontSize: 28,
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Subtitle */}
              <p style={{
                color: '#8af0ff',
                marginBottom: 16,
                fontSize: 14,
                fontStyle: 'italic'
              }}>
                Entry in USDC/USDT • Prizes: 96% Winner, 2.5% Ecosystem, 1.5% Platform • AI-monitored
              </p>

              {/* Prize Distribution Info */}
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 12
              }}>
                <div style={{ color: '#00ff88', fontWeight: 'bold', marginBottom: 8 }}>💰 Prize Distribution</div>
                <div style={{ color: '#8af0ff', lineHeight: '1.6' }}>
                  • Winner receives <strong>96% of pool</strong> in $NAG tokens<br/>
                  • Ecosystem Fund: <strong>2.5%</strong> (sustainability)<br/>
                  • Platform Fee: <strong>1.5%</strong> (operations)<br/>
                  • NAG price: <strong>Dynamic</strong> (based on USDC/USDT market rate)
                </div>
              </div>

              {/* Win Conditions */}
              <div style={{
                background: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid rgba(255, 170, 0, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16,
                fontSize: 12
              }}>
                <div style={{ color: '#ffaa00', fontWeight: 'bold', marginBottom: 8 }}>🏆 Win Conditions</div>
                <div style={{ color: '#ffc266', lineHeight: '1.6' }}>
                  • <strong>Kiddies, Teenies, Anyone:</strong> Highest score wins<br/>
                  • <strong>Pro Mode:</strong> Must reach or exceed target score<br/>
                  • <strong>No winner (Pro Mode):</strong> Funds to multisig: <code style={{fontSize: 10, background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: 4}}>Gz3GxCTuMLCbKmRNd5rHz7wEP9giY1WMc2LuyLpouKRJ</code>
                </div>
              </div>

              {/* Anti-Cheat Warning */}
              <div style={{
                background: 'rgba(255, 0, 0, 0.1)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20,
                fontSize: 12
              }}>
                <div style={{ color: '#ff4444', fontWeight: 'bold', marginBottom: 4 }}>
                  ⚠️ ANTI-CHEAT ACTIVE
                </div>
                <div style={{ color: '#ff8888' }}>
                  <strong>Penalties for cheating:</strong>
                  <ul style={{ margin: '4px 0 0 20px', padding: 0 }}>
                    <li>1st offense: 24-hour ban + forfeit entry fee</li>
                    <li>2nd offense: 7-day ban + forfeit all pending rewards</li>
                    <li>3rd offense: Permanent ban + blacklist wallet</li>
                  </ul>
                  <div style={{ marginTop: 8, fontStyle: 'italic' }}>
                    AI agent monitors: Input patterns, timing anomalies, impossible scores, bot behavior
                  </div>
                </div>
              </div>

              {/* Battle Modes Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 16,
                marginBottom: 24
              }}>
                {battleModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={!mode.disabled ? { scale: 1.05 } : {}}
                    whileTap={!mode.disabled ? { scale: 0.95 } : {}}
                    onClick={() => handleModeClick(mode)}
                    disabled={mode.disabled}
                    style={{
                      background: mode.disabled 
                        ? 'rgba(50, 50, 50, 0.3)' 
                        : `linear-gradient(135deg, ${mode.color}22, ${mode.color}44)`,
                      border: `2px solid ${mode.color}`,
                      borderRadius: 12,
                      padding: 16,
                      cursor: mode.disabled ? 'not-allowed' : 'pointer',
                      opacity: mode.disabled ? 0.5 : 1,
                      transition: 'all 0.3s ease',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: 32, marginBottom: 8 }}>{mode.icon}</div>
                    <h3 style={{
                      color: '#ffffff',
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 4,
                      fontFamily: 'Orbitron, sans-serif'
                    }}>
                      {mode.title}
                    </h3>
                    {mode.subtitle && (
                      <div style={{ fontSize: 11, color: '#8af0ff', marginBottom: 8, fontStyle: 'italic' }}>
                        {mode.subtitle}
                      </div>
                    )}
                    <div style={{ fontSize: 14, color: '#00ff88', marginBottom: 4, fontWeight: 'bold' }}>
                      Entry: {mode.entry}
                    </div>
                    <div style={{ fontSize: 12, color: '#ffaa00', marginBottom: 4 }}>
                      Win: {mode.prize}
                    </div>
                    {mode.nagPrize !== 'None' && (
                      <div style={{ fontSize: 11, color: '#ff44ff', marginBottom: 8 }}>
                        NAG: {mode.nagPrize}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: '#8af0ff', fontStyle: 'italic', lineHeight: '1.4' }}>
                      {mode.description}
                    </div>
                    {mode.id === 'propool' && (
                      <div style={{ fontSize: 9, color: '#ff8888', marginTop: 8, fontWeight: 'bold' }}>
                        ⚠️ Must reach target score
                      </div>
                    )}
                    {mode.disabled && (
                      <div style={{ color: '#666666', fontSize: 10, marginTop: 8 }}>
                        Coming Soon
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Target Scores for Pro Mode */}
              <div style={{
                background: 'rgba(138, 240, 255, 0.1)',
                border: '1px solid rgba(138, 240, 255, 0.3)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <h3 style={{ color: '#8af0ff', fontSize: 16, marginBottom: 12 }}>🎯 Pro Mode Target Scores</h3>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: 8,
                  color: '#ffffff',
                  fontSize: 12
                }}>
                  <div><strong>Snake Classic:</strong> 8,888</div>
                  <div><strong>FlappyNova:</strong> 8,888</div>
                  <div><strong>Memory Match:</strong> 111</div>
                  <div><strong>Bonk Ryder:</strong> 888</div>
                  <div><strong>PacCoin:</strong> 4,444</div>
                  <div><strong>TetraMen:</strong> 8,888</div>
                  <div><strong>Contra:</strong> 8,888</div>
                </div>
                <div style={{ color: '#ff8888', fontSize: 11, marginTop: 12, fontStyle: 'italic' }}>
                  * Only Pro Mode requires reaching target. All other modes: highest score wins.
                </div>
              </div>

              {/* Info Section */}
              <div style={{
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20
              }}>
                <h3 style={{ color: '#00ff88', fontSize: 16, marginBottom: 8 }}>How It Works</h3>
                <ul style={{ color: '#8af0ff', fontSize: 14, listStyle: 'none', padding: 0 }}>
                  <li>• Deposit USDC/USDT to pool wallet: <code style={{fontSize: 10, background: 'rgba(0,0,0,0.3)', padding: '2px 4px', borderRadius: 4}}>97F3vqdrbE2rvQtsmJnLA2cNcsCbrkBc5ZYqkVetXTuW</code></li>
                  <li>• Entry fee + platform fees charged upon agreement</li>
                  <li>• All prizes paid in $NAG tokens (dynamic rate)</li>
                  <li>• AI agent validates all game results via x402</li>
                  <li>• Instant payout to winners (96% of pool)</li>
                  <li>• Fees retained in pool wallet</li>
                </ul>
              </div>

              {/* Confirmation Modal */}
              {showConfirm && selectedModeData && (
                <div style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1001
                }}>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                      border: '2px solid #ffaa00',
                      borderRadius: 16,
                      padding: 24,
                      maxWidth: 400,
                      textAlign: 'center'
                    }}
                  >
                    <h3 style={{ color: '#ffaa00', marginBottom: 16 }}>
                      Confirm Entry
                    </h3>
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 24, marginBottom: 8 }}>{selectedModeData.icon}</div>
                      <div style={{ color: '#ffffff', fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>
                        {selectedModeData.title}
                      </div>
                      <div style={{ color: '#8af0ff', fontSize: 14, marginBottom: 16 }}>
                        Entry Fee: <span style={{ color: '#00ff88', fontWeight: 'bold' }}>{selectedModeData.entry}</span>
                        <br />
                        Potential Prize: <span style={{ color: '#ffaa00', fontWeight: 'bold' }}>{selectedModeData.nagPrize}</span>
                      </div>
                      <div style={{
                        background: 'rgba(255, 200, 0, 0.1)',
                        border: '1px solid rgba(255, 200, 0, 0.3)',
                        borderRadius: 8,
                        padding: 12,
                        fontSize: 11,
                        color: '#ffcc00',
                        marginBottom: 16,
                        textAlign: 'left',
                        lineHeight: '1.6'
                      }}>
                        <div style={{fontWeight: 'bold', marginBottom: 8, fontSize: 13}}>📜 TERMS & CONDITIONS</div>
                        By entering, you agree to:
                        <ul style={{margin: '8px 0 0 16px', padding: 0}}>
                          <li>Fair play rules - no cheating or exploits</li>
                          <li>Entry fee charged to pool wallet upon start</li>
                          <li>Winner receives 96% of pool in $NAG</li>
                          <li>2.5% to ecosystem, 1.5% to platform</li>
                          <li>Pro Mode: Must reach target score to win</li>
                          <li>Pro Mode unclaimed: Goes to multisig wallet</li>
                          <li>AI agent monitors via x402 protocol</li>
                          <li>Cheating results in penalties & blacklist</li>
                        </ul>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                      <button
                        onClick={handleConfirm}
                        style={{
                          padding: '12px 24px',
                          background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#000',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        {connected ? 'CONFIRM & PLAY' : 'CONNECT WALLET'}
                      </button>
                      <button
                        onClick={() => setShowConfirm(false)}
                        style={{
                          padding: '12px 24px',
                          background: 'rgba(255, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 0, 0, 0.5)',
                          borderRadius: 8,
                          color: '#ff8888',
                          cursor: 'pointer'
                        }}
                      >
                        CANCEL
                      </button>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Pulse animation */}
          <style>{`
            @keyframes pulse {
              0% { opacity: 1; }
              50% { opacity: 0.5; }
              100% { opacity: 1; }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
