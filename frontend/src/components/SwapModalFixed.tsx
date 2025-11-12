import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { soundManager } from '../utils/sounds';

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SwapModal({ open, onClose }: SwapModalProps) {
  const { connected } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [inputToken, setInputToken] = useState('USDC');
  const [outputToken, setOutputToken] = useState('NAG');
  const [loading, setLoading] = useState(false);
  const [slippage, setSlippage] = useState('0.5');
  const [showTokenSelect, setShowTokenSelect] = useState<'input' | 'output' | null>(null);

  const tokens = [
    { symbol: 'SOL', name: 'Solana', icon: '☀️', color: '#00ffa3' },
    { symbol: 'USDC', name: 'USD Coin', icon: '💵', color: '#2775ca' },
    { symbol: 'USDT', name: 'Tether', icon: '💚', color: '#50af95' },
    { symbol: 'NAG', name: 'Nova Arcade', icon: '🎮', color: '#ff00ff' }
  ];

  useEffect(() => {
    if (inputAmount && parseFloat(inputAmount) > 0) {
      setLoading(true);
      const timer = setTimeout(() => {
        const rate = inputToken === 'USDC' ? 10 : inputToken === 'SOL' ? 500 : 10;
        setOutputAmount((parseFloat(inputAmount) * rate).toFixed(4));
        setLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setOutputAmount('');
    }
  }, [inputAmount, inputToken, outputToken]);

  const handleSwap = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    soundManager.playClick();
    console.log('Swapping:', inputAmount, inputToken, 'for', outputAmount, outputToken);
    // Implement actual swap logic
  };

  const flipTokens = () => {
    soundManager.playClick();
    const temp = inputToken;
    setInputToken(outputToken);
    setOutputToken(temp);
    setInputAmount(outputAmount);
  };

  const getTokenInfo = (symbol: string) => tokens.find(t => t.symbol === symbol);

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
            {/* Modal - Same style as TokenomicsModal */}
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
                maxWidth: 500,
                width: '100%',
                boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h2 style={{
                  margin: 0,
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: 32,
                  color: '#00ff88',
                  textTransform: 'uppercase'
                }}>
                  🔄 Jupiter Swap
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
                marginBottom: 20,
                fontSize: 12,
                fontStyle: 'italic'
              }}>
                Powered by Jupiter Aggregator V6 - Best rates across all Solana DEXs
              </p>

              {/* From Token Input */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 8
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#8af0ff', fontSize: 12 }}>You pay</span>
                  <span style={{ color: '#666', fontSize: 12 }}>Balance: 0.00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="number"
                    value={inputAmount}
                    onChange={(e) => setInputAmount(e.target.value)}
                    placeholder="0.00"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: 28,
                      outline: 'none',
                      fontFamily: 'Orbitron, sans-serif'
                    }}
                  />
                  <button
                    onClick={() => setShowTokenSelect('input')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: 12,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{getTokenInfo(inputToken)?.icon}</span>
                    <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{inputToken}</span>
                    <span style={{ color: '#8af0ff' }}>▼</span>
                  </button>
                </div>
              </div>

              {/* Swap Button */}
              <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                <motion.button
                  whileHover={{ rotate: 180 }}
                  onClick={flipTokens}
                  style={{
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    border: '2px solid #00ff88',
                    borderRadius: '50%',
                    width: 48,
                    height: 48,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 24
                  }}
                >
                  ↕️
                </motion.button>
              </div>

              {/* To Token Output */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: 16,
                padding: 20,
                marginBottom: 20
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ color: '#8af0ff', fontSize: 12 }}>You receive</span>
                  <span style={{ color: '#666', fontSize: 12 }}>Balance: 0.00</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input
                    type="text"
                    value={loading ? 'Calculating...' : outputAmount}
                    readOnly
                    placeholder="0.00"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: '#ffffff',
                      fontSize: 28,
                      outline: 'none',
                      fontFamily: 'Orbitron, sans-serif'
                    }}
                  />
                  <button
                    onClick={() => setShowTokenSelect('output')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'rgba(0, 255, 136, 0.1)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: 12,
                      padding: '8px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{getTokenInfo(outputToken)?.icon}</span>
                    <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{outputToken}</span>
                    <span style={{ color: '#8af0ff' }}>▼</span>
                  </button>
                </div>
              </div>

              {/* Swap Info */}
              {outputAmount && !loading && (
                <div style={{
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 20,
                  fontSize: 14
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#8af0ff' }}>Rate</span>
                    <span style={{ color: '#ffffff' }}>
                      1 {inputToken} = {outputAmount && inputAmount ? (parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(4) : '0'} {outputToken}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#8af0ff' }}>Price Impact</span>
                    <span style={{ color: '#00ff88' }}>&lt; 0.01%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: '#8af0ff' }}>Network Fee</span>
                    <span style={{ color: '#ffffff' }}>~0.00025 SOL</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8af0ff' }}>Route</span>
                    <span style={{ color: '#ffffff' }}>Orca → Raydium</span>
                  </div>
                </div>
              )}

              {/* Settings */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
                fontSize: 14
              }}>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8af0ff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  ⚙️ Slippage: {slippage}%
                </button>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#8af0ff',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
              </div>

              {/* Swap Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSwap}
                disabled={!connected || !inputAmount || loading}
                style={{
                  width: '100%',
                  padding: 16,
                  borderRadius: 12,
                  border: 'none',
                  background: !connected || !inputAmount || loading
                    ? 'rgba(100, 100, 100, 0.3)'
                    : 'linear-gradient(135deg, #00ff88, #00cc66)',
                  color: !connected || !inputAmount || loading ? '#666' : '#000000',
                  fontSize: 18,
                  fontWeight: 'bold',
                  cursor: !connected || !inputAmount || loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'Orbitron, sans-serif',
                  transition: 'all 0.3s'
                }}
              >
                {!connected ? 'Connect Wallet' :
                 loading ? 'Fetching Best Price...' :
                 !inputAmount ? 'Enter Amount' :
                 'Swap'}
              </motion.button>

              {/* Token Selector Modal */}
              {showTokenSelect && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                  border: '2px solid #00ff88',
                  borderRadius: 16,
                  padding: 20,
                  zIndex: 10,
                  width: '90%',
                  maxWidth: 400
                }}>
                  <h3 style={{ color: '#00ff88', marginBottom: 16 }}>Select Token</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tokens.filter(t => 
                      showTokenSelect === 'input' ? t.symbol !== outputToken : t.symbol !== inputToken
                    ).map(token => (
                      <button
                        key={token.symbol}
                        onClick={() => {
                          if (showTokenSelect === 'input') {
                            setInputToken(token.symbol);
                          } else {
                            setOutputToken(token.symbol);
                          }
                          setShowTokenSelect(null);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          background: 'rgba(0, 0, 0, 0.3)',
                          border: '1px solid rgba(0, 255, 136, 0.2)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                          e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(0, 255, 136, 0.2)';
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{token.icon}</span>
                        <div style={{ textAlign: 'left', flex: 1 }}>
                          <div style={{ color: '#ffffff', fontWeight: 'bold' }}>{token.symbol}</div>
                          <div style={{ color: '#8af0ff', fontSize: 12 }}>{token.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowTokenSelect(null)}
                    style={{
                      marginTop: 16,
                      width: '100%',
                      padding: 8,
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      borderRadius: 8,
                      color: '#8af0ff',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
