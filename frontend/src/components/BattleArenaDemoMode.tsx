import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { soundManager } from '../utils/sounds';
import { useWalletContext } from '../contexts/WalletContext';

interface BattleArenaDemoModeProps {
  open: boolean;
  onClose: () => void;
}

interface Competition {
  id: string;
  mode: string;
  entryFee: number;
  prize: number;
  status: 'waiting' | 'playing' | 'completed';
  startTime: Date;
  players: string[];
}

export default function BattleArenaDemoMode({ open, onClose }: BattleArenaDemoModeProps) {
  const { publicKey, isConnected } = useWalletContext();
  const address = publicKey?.toString();
  const connected = isConnected;
  const [selectedMode, setSelectedMode] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositProgress, setDepositProgress] = useState(0);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const nagPrice = 0.00042; // Example NAG price in USD
  
  // Calculate NAG prize dynamically
  const calculateNagPrize = (usdcEntry: number) => {
    const usdcPrize = (usdcEntry * 2 * 0.96); // 96% of pool (2 players)
    return Math.floor(usdcPrize / nagPrice);
  };

  const battleModes = [
    { 
      id: 'kiddies', 
      icon: '🦄', 
      title: 'Kiddies Mode', 
      subtitle: '(Ages 7-12)',
      entryUsdc: 5, 
      prizePercent: 96,
      color: '#ff44ff',
      description: 'Highest score wins • Safe & fun competition',
      ageRestriction: '7-12',
      winCondition: 'Highest score wins',
      maxEntry: 5
    },
    { 
      id: 'teenies', 
      icon: '🎯', 
      title: 'Teenies Mode', 
      subtitle: '(Ages 13-17)',
      entryUsdc: 10, 
      prizePercent: 96,
      color: '#00aaff',
      description: 'Highest score wins • Competitive gaming',
      ageRestriction: '13-17',
      winCondition: 'Highest score wins',
      maxEntry: 20
    },
    { 
      id: 'anyone', 
      icon: '🏆', 
      title: 'Anyone', 
      subtitle: '(All Ages)',
      entryUsdc: 15, 
      prizePercent: 96,
      color: '#ffaa00',
      description: 'Highest score wins • Open to all',
      winCondition: 'Highest score wins',
      maxEntry: null
    },
    { 
      id: 'pro', 
      icon: '💎', 
      title: 'Pro Mode', 
      subtitle: '(18+ Only)',
      entryUsdc: 250, 
      prizePercent: 96,
      color: '#00ff88',
      description: 'Must reach target score • High stakes',
      ageRestriction: '18+',
      winCondition: 'Must reach or exceed target score',
      minEntry: 250,
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
      entryUsdc: 0, 
      prizePercent: 0,
      color: '#666666',
      description: 'Practice mode - no rewards',
      isFree: true
    }
  ];

  const handleModeClick = (mode: any) => {
    if (!connected) {
      alert('Please connect your wallet first!');
      return;
    }
    soundManager.playClick();
    setSelectedMode(mode);
    setShowConfirmation(true);
  };

  const simulateDeposit = async () => {
    setShowConfirmation(false);
    setShowDeposit(true);
    soundManager.playClick();

    // Simulate deposit progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setDepositProgress(i);
    }

    // Create simulated competition
    const comp: Competition = {
      id: `comp-${Date.now()}`,
      mode: selectedMode.id,
      entryFee: selectedMode.entryUsdc,
      prize: selectedMode.prizeNag,
      status: 'waiting',
      startTime: new Date(),
      players: [address || 'You']
    };

    setCompetition(comp);
    
    // Save to local storage for demo
    const demos = JSON.parse(localStorage.getItem('demo_competitions') || '[]');
    demos.push(comp);
    localStorage.setItem('demo_competitions', JSON.stringify(demos));

    setTimeout(() => {
      setShowDeposit(false);
      setShowWaitlist(true);
    }, 1000);
  };

  const handlePracticeMode = () => {
    soundManager.playClick();
    alert('Practice mode would launch the game here!');
    onClose();
  };

  const handleWaitlistSubmit = async () => {
    if (!email || !email.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use production API endpoint
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5178';
      const response = await fetch(`${API_URL}/api/battle-arena/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          walletAddress: address || null,
          source: 'Battle Arena Demo'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          alert('This email is already on the waitlist!');
        } else {
          alert(data.error || 'Failed to join waitlist. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }
      
      setSubmitSuccess(true);
      soundManager.playClick();
      
      // Reset after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
        setEmail('');
        setShowWaitlist(false);
        setSelectedMode(null);
        onClose();
      }, 3000);
      
    } catch (error) {
      console.error('Waitlist submission error:', error);
      // Fallback to localStorage if API fails
      try {
        const waitlistEntries = JSON.parse(localStorage.getItem('battle_arena_waitlist') || '[]');
        const newEntry = {
          email,
          walletAddress: address || 'Not connected',
          timestamp: new Date().toISOString(),
          source: 'Battle Arena Demo (Offline)'
        };
        
        if (!waitlistEntries.some((entry: any) => entry.email === email)) {
          waitlistEntries.push(newEntry);
          localStorage.setItem('battle_arena_waitlist', JSON.stringify(waitlistEntries));
          setSubmitSuccess(true);
          soundManager.playClick();
          
          setTimeout(() => {
            setSubmitSuccess(false);
            setEmail('');
            setShowWaitlist(false);
            setSelectedMode(null);
            onClose();
          }, 3000);
        } else {
          alert('This email is already on the waitlist!');
        }
      } catch (fallbackError) {
        alert('Failed to join waitlist. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {/* Modal */}
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
              {/* Demo Badge */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 60,
                background: 'linear-gradient(135deg, #ff44ff, #ff8844)',
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 'bold',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(255, 68, 255, 0.4)',
                animation: 'pulse 2s infinite'
              }}>
                🚀 DEMO MODE
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

              {/* Launch Banner */}
              <div style={{
                background: 'linear-gradient(90deg, rgba(255, 68, 255, 0.2), rgba(0, 255, 136, 0.2))',
                border: '2px solid #ff44ff',
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                textAlign: 'center'
              }}>
                <h3 style={{ color: '#ff44ff', fontSize: 18, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                  🎮 INTERACTIVE DEMO - Full Launch Q1 2026!
                </h3>
                <p style={{ color: '#8af0ff', fontSize: 14, margin: 0 }}>
                  Experience the complete flow: Swap → Deposit → AI Check → Play → Win → Payout
                </p>
              </div>

              {!showConfirmation && !showDeposit && !showWaitlist && (
                <>
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
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => mode.id === 'practice' ? handlePracticeMode() : handleModeClick(mode)}
                        style={{
                          background: `linear-gradient(135deg, ${mode.color}22, ${mode.color}44)`,
                          border: `2px solid ${mode.color}`,
                          borderRadius: 12,
                          padding: 20,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          textAlign: 'center'
                        }}
                      >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>{mode.icon}</div>
                        <h3 style={{
                          color: '#ffffff',
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginBottom: 4,
                          fontFamily: 'Orbitron, sans-serif'
                        }}>
                          {mode.title}
                        </h3>
                        <div style={{ fontSize: 11, color: '#8af0ff', marginBottom: 12 }}>
                          {mode.subtitle}
                        </div>
                        <div style={{ fontSize: 12, color: '#8af0ff', marginBottom: 4 }}>
                          {mode.entryUsdc > 0 ? `Entry: ${mode.entryUsdc} USDC` : 'Entry: FREE'}
                        </div>
                        <div style={{ fontSize: 12, color: '#00ff88', marginBottom: 4 }}>
                          {mode.entryUsdc > 0 ? `Prize: ${mode.prizePercent}% of pool` : 'Prize: None'}
                        </div>
                        {mode.entryUsdc > 0 && (
                          <div style={{ fontSize: 11, color: '#ffaa00', fontWeight: 'bold' }}>
                            ~{calculateNagPrize(mode.entryUsdc).toLocaleString()} $NAG
                          </div>
                        )}
                        <p style={{ fontSize: 11, color: '#8af0ff', opacity: 0.8, margin: 0 }}>
                          {mode.description}
                        </p>
                      </motion.button>
                    ))}
                  </div>

                  {/* Info Section */}
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 12,
                    padding: 16
                  }}>
                    <h3 style={{ color: '#00ff88', fontSize: 16, marginBottom: 12, fontFamily: 'Orbitron, sans-serif' }}>
                      ⚡ How It Works (Demo)
                    </h3>
                    <ul style={{ color: '#8af0ff', fontSize: 14, listStyle: 'none', padding: 0, margin: 0 }}>
                      <li style={{ marginBottom: 8 }}>• <strong>Select Mode:</strong> Choose your battle type</li>
                      <li style={{ marginBottom: 8 }}>• <strong>Simulated Deposit:</strong> See the entry flow (no real funds)</li>
                      <li style={{ marginBottom: 8 }}>• <strong>Join Waitlist:</strong> Get notified for real launch</li>
                      <li>• <strong>Full Launch:</strong> Real escrow + instant payouts coming Q1 2026</li>
                    </ul>
                  </div>
                </>
              )}

              {/* Confirmation Dialog */}
              {showConfirmation && selectedMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: `2px solid ${selectedMode.color}`,
                    borderRadius: 16,
                    padding: 24,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{selectedMode.icon}</div>
                  <h3 style={{ color: '#fff', fontSize: 24, marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>
                    {selectedMode.title}
                  </h3>
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 24
                  }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: '#8af0ff', fontSize: 14, marginBottom: 4 }}>Entry Fee</div>
                      <div style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>{selectedMode.entryUsdc} USDC</div>
                    </div>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ color: '#8af0ff', fontSize: 14, marginBottom: 4 }}>Prize Pool (96%)</div>
                      <div style={{ color: '#00ff88', fontSize: 24, fontWeight: 'bold' }}>
                        {calculateNagPrize(selectedMode.entryUsdc).toLocaleString()} $NAG
                      </div>
                      <div style={{ color: '#666', fontSize: 12 }}>≈ ${(selectedMode.entryUsdc * 2 * 0.96).toFixed(2)} USD</div>
                    </div>
                    <div>
                      <div style={{ color: '#8af0ff', fontSize: 14, marginBottom: 4 }}>Win Condition</div>
                      <div style={{ color: '#ffaa00', fontSize: 14 }}>{selectedMode.winCondition}</div>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(255, 170, 0, 0.2)',
                    border: '1px solid rgba(255, 170, 0, 0.5)',
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 20,
                    fontSize: 13,
                    color: '#ffaa00'
                  }}>
                    ⚠️ This is a demo. No real funds will be transferred. Watch the full flow simulation!
                  </div>

                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      onClick={() => setShowConfirmation(false)}
                      style={{
                        padding: '12px 24px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        borderRadius: 8,
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: 14
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={simulateDeposit}
                      style={{
                        padding: '12px 24px',
                        background: `linear-gradient(135deg, ${selectedMode.color}, ${selectedMode.color}dd)`,
                        border: 'none',
                        borderRadius: 8,
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'Orbitron, sans-serif',
                        fontSize: 14,
                        fontWeight: 'bold',
                        boxShadow: `0 4px 12px ${selectedMode.color}44`
                      }}
                    >
                      Simulate Entry →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Deposit Simulation - 5 Step Flow */}
              {showDeposit && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: 40
                  }}
                >
                  {/* Step Indicator */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      maxWidth: 600,
                      margin: '0 auto 24px',
                      position: 'relative'
                    }}>
                      {/* Progress Line */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        right: 0,
                        height: 2,
                        background: 'rgba(138, 240, 255, 0.2)',
                        zIndex: 0
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${depositProgress}%` }}
                          style={{
                            height: '100%',
                            background: 'linear-gradient(90deg, #00ff88, #00aaff)',
                          }}
                        />
                      </div>

                      {/* Step Circles */}
                      {[
                        { step: 1, label: 'Swap', icon: '🔄', progress: 0 },
                        { step: 2, label: 'Deposit', icon: '💰', progress: 20 },
                        { step: 3, label: 'AI Check', icon: '🤖', progress: 40 },
                        { step: 4, label: 'Play', icon: '🎮', progress: 60 },
                        { step: 5, label: 'Payout', icon: '💎', progress: 80 }
                      ].map(({ step, label, icon, progress: stepProgress }) => (
                        <div key={step} style={{ 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          zIndex: 1,
                          flex: 1
                        }}>
                          <div style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            background: depositProgress >= stepProgress 
                              ? 'linear-gradient(135deg, #00ff88, #00aaff)' 
                              : 'rgba(138, 240, 255, 0.2)',
                            border: depositProgress >= stepProgress 
                              ? '2px solid #00ff88' 
                              : '2px solid rgba(138, 240, 255, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                            marginBottom: 8,
                            boxShadow: depositProgress >= stepProgress 
                              ? '0 4px 12px rgba(0, 255, 136, 0.4)' 
                              : 'none',
                            transition: 'all 0.3s ease'
                          }}>
                            {icon}
                          </div>
                          <div style={{
                            fontSize: 11,
                            color: depositProgress >= stepProgress ? '#00ff88' : '#8af0ff',
                            fontFamily: 'Orbitron, sans-serif',
                            fontWeight: depositProgress >= stepProgress ? 'bold' : 'normal'
                          }}>
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Step Display */}
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '2px solid #00ff88',
                    borderRadius: 12,
                    padding: 24,
                    marginBottom: 24,
                    minHeight: 200
                  }}>
                    {depositProgress < 20 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
                        <h3 style={{ color: '#00ff88', fontSize: 24, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                          Step 1: Swap
                        </h3>
                        <p style={{ color: '#8af0ff', fontSize: 14 }}>
                          Converting USDC → NAG via Jupiter aggregator
                        </p>
                        <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                          Finding best route across all Solana DEXes...
                        </div>
                      </motion.div>
                    )}

                    {depositProgress >= 20 && depositProgress < 40 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
                        <h3 style={{ color: '#00ff88', fontSize: 24, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                          Step 2: Deposit
                        </h3>
                        <p style={{ color: '#8af0ff', fontSize: 14 }}>
                          Depositing {selectedMode?.entryUsdc} USDC to smart contract escrow
                        </p>
                        <div style={{ color: '#666', fontSize: 12, marginTop: 8 }}>
                          Funds locked until game completion...
                        </div>
                      </motion.div>
                    )}

                    {depositProgress >= 40 && depositProgress < 60 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
                        <h3 style={{ color: '#00ff88', fontSize: 24, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                          Step 3: AI Verification
                        </h3>
                        <p style={{ color: '#8af0ff', fontSize: 14, marginBottom: 12 }}>
                          AI agent validating entry requirements
                        </p>
                        <div style={{ textAlign: 'left', maxWidth: 300, margin: '0 auto' }}>
                          <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 4 }}>✓ Wallet authenticity verified</div>
                          <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 4 }}>✓ Transaction history checked</div>
                          <div style={{ color: '#00ff88', fontSize: 12, marginBottom: 4 }}>✓ Behavioral patterns analyzed</div>
                          <div style={{ color: '#00ff88', fontSize: 12 }}>✓ Anti-cheat: PASSED</div>
                        </div>
                      </motion.div>
                    )}

                    {depositProgress >= 60 && depositProgress < 80 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
                        <h3 style={{ color: '#00ff88', fontSize: 24, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                          Step 4: Play
                        </h3>
                        <p style={{ color: '#8af0ff', fontSize: 14 }}>
                          Game in progress with real-time AI monitoring
                        </p>
                        <div style={{ color: '#ffaa00', fontSize: 12, marginTop: 8 }}>
                          🟢 AI ACTIVE - Monitoring for cheating...
                        </div>
                      </motion.div>
                    )}

                    {depositProgress >= 80 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div style={{ fontSize: 48, marginBottom: 12 }}>💎</div>
                        <h3 style={{ color: '#00ff88', fontSize: 24, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                          Step 5: Payout
                        </h3>
                        <p style={{ color: '#8af0ff', fontSize: 14 }}>
                          Processing instant NAG payout to winner
                        </p>
                        <div style={{ color: '#00ff88', fontSize: 16, marginTop: 12, fontWeight: 'bold' }}>
                          {calculateNagPrize(selectedMode?.entryUsdc || 0).toLocaleString()} $NAG
                        </div>
                        <div style={{ color: '#666', fontSize: 12, marginTop: 4 }}>
                          Verifiable on Solscan
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 8,
                    height: 24,
                    overflow: 'hidden',
                    marginBottom: 12
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${depositProgress}%` }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #00ff88, #00aaff)',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: '#000'
                      }}
                    >
                      {depositProgress}%
                    </motion.div>
                  </div>
                  <div style={{ color: '#8af0ff', fontSize: 14 }}>
                    {depositProgress < 100 ? 'Processing...' : 'Complete! ✓'}
                  </div>
                </motion.div>
              )}

              {/* Waitlist Screen */}
              {showWaitlist && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    textAlign: 'center',
                    padding: 40
                  }}
                >
                  <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ color: '#00ff88', fontSize: 28, marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>
                    Demo Entry Successful!
                  </h3>
                  <p style={{ color: '#8af0ff', fontSize: 16, marginBottom: 24 }}>
                    You've experienced the Battle Arena flow.
                  </p>

                  {!submitSuccess ? (
                    <div style={{
                      background: 'rgba(255, 68, 255, 0.1)',
                      border: '2px solid #ff44ff',
                      borderRadius: 12,
                      padding: 24,
                      marginBottom: 24
                    }}>
                      <h4 style={{ color: '#ff44ff', fontSize: 20, marginBottom: 12, fontFamily: 'Orbitron, sans-serif' }}>
                        📋 Join the Waitlist
                      </h4>
                      <p style={{ color: '#8af0ff', fontSize: 14, marginBottom: 16 }}>
                        Be first to compete when real prizes go live!
                      </p>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(255, 68, 255, 0.5)',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 14,
                          marginBottom: 12,
                          fontFamily: 'Orbitron, sans-serif',
                          opacity: isSubmitting ? 0.6 : 1
                        }}
                      />
                      <button
                        onClick={handleWaitlistSubmit}
                        disabled={isSubmitting || !email}
                        style={{
                          width: '100%',
                          padding: '12px',
                          background: isSubmitting 
                            ? 'linear-gradient(135deg, #666, #444)' 
                            : 'linear-gradient(135deg, #ff44ff, #ff8844)',
                          border: 'none',
                          borderRadius: 8,
                          color: '#fff',
                          fontSize: 16,
                          fontWeight: 'bold',
                          cursor: isSubmitting ? 'not-allowed' : 'pointer',
                          fontFamily: 'Orbitron, sans-serif',
                          boxShadow: isSubmitting 
                            ? 'none' 
                            : '0 4px 12px rgba(255, 68, 255, 0.4)',
                          opacity: isSubmitting || !email ? 0.6 : 1
                        }}
                      >
                        {isSubmitting ? 'Joining...' : 'Join Waitlist →'}
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '2px solid #00ff88',
                      borderRadius: 12,
                      padding: 24,
                      marginBottom: 24,
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                      <h4 style={{ color: '#00ff88', fontSize: 20, marginBottom: 8, fontFamily: 'Orbitron, sans-serif' }}>
                        Welcome to the Waitlist!
                      </h4>
                      <p style={{ color: '#8af0ff', fontSize: 14 }}>
                        You'll be notified when Battle Arena goes live with real prizes!
                      </p>
                    </div>
                  )}

                  <div style={{
                    background: 'rgba(0, 255, 136, 0.1)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 8,
                    padding: 16,
                    marginBottom: 20
                  }}>
                    <h5 style={{ color: '#00ff88', fontSize: 16, marginBottom: 8 }}>What's Next?</h5>
                    <ul style={{ color: '#8af0ff', fontSize: 13, listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
                      <li style={{ marginBottom: 6 }}>✅ Smart contract development (Q1 2026)</li>
                      <li style={{ marginBottom: 6 }}>✅ Security audits & testing</li>
                      <li style={{ marginBottom: 6 }}>✅ Real USDC deposits & NAG payouts</li>
                      <li>✅ AI-powered anti-cheat system</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setShowWaitlist(false);
                      setSelectedMode(null);
                      onClose();
                    }}
                    style={{
                      padding: '12px 32px',
                      background: 'linear-gradient(135deg, #00ff88, #00aaff)',
                      border: 'none',
                      borderRadius: 8,
                      color: '#000',
                      fontSize: 16,
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      fontFamily: 'Orbitron, sans-serif',
                      boxShadow: '0 4px 12px rgba(0, 255, 136, 0.4)'
                    }}
                  >
                    Close
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.8; transform: scale(1.05); }
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </>
      )}
    </AnimatePresence>
  );
}
