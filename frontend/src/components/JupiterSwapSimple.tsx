import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { getQuote, formatAmount, parseAmount } from '../lib/jupiter';
import { SUPPORTED_TOKENS } from '../config/tokens';

interface JupiterSwapProps {
  open: boolean;
  onClose: () => void;
}

export default function JupiterSwap({ open, onClose }: JupiterSwapProps) {
  const { connected } = useWallet();
  const [inputAmount, setInputAmount] = useState('');
  const [outputAmount, setOutputAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get token objects
  const usdcToken = SUPPORTED_TOKENS.find(t => t.symbol === 'USDC');
  const nagToken = SUPPORTED_TOKENS.find(t => t.symbol === 'NAG');

  // Fetch quote when input amount changes
  useEffect(() => {
    const fetchQuote = async () => {
      if (!inputAmount || !usdcToken || !nagToken || parseFloat(inputAmount) <= 0) {
        setOutputAmount('');
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const amountInSmallestUnit = parseAmount(inputAmount, usdcToken.decimals);
        const quote = await getQuote(
          usdcToken.mint,
          nagToken.mint,
          amountInSmallestUnit,
          50 // 0.5% slippage
        );
        
        const output = formatAmount(quote.outAmount, nagToken.decimals);
        setOutputAmount(output);
      } catch (err) {
        console.error('Quote error:', err);
        setError('Unable to get quote - token may not be available yet');
        setOutputAmount('');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [inputAmount, usdcToken, nagToken]);

  const handleSwap = () => {
    if (!connected) {
      alert('Please connect your wallet first');
      return;
    }
    if (!outputAmount) {
      alert('Please enter a valid amount');
      return;
    }
    alert('Swap functionality coming soon - Jupiter integration ready!');
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
              zIndex: 999
            }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'linear-gradient(135deg, #0a0a0a 0%, #1a2332 50%, #0a0a0a 100%)',
              border: '2px solid #00ff88',
              borderRadius: 24,
              padding: 32,
              width: 'calc(100vw - 40px)',
              maxWidth: 500,
              maxHeight: 'calc(100vh - 40px)',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4), 0 20px 40px rgba(0, 0, 0, 0.5)',
              zIndex: 1000
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ 
                fontFamily: 'Orbitron, sans-serif', 
                fontSize: 28, 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #00ff88, #8af0ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                margin: 0
              }}>
                JUPITER SWAP
              </h2>
              <button
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#00ff88',
                  fontSize: 32,
                  cursor: 'pointer',
                  padding: 0,
                  lineHeight: 1
                }}
              >
                ×
              </button>
            </div>

            {/* Input */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#00ff88', fontSize: 14, marginBottom: 8, display: 'block' }}>
                From (USDC)
              </label>
              <input
                type="number"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'rgba(0, 255, 136, 0.1)',
                  border: '1px solid #00ff88',
                  borderRadius: 12,
                  color: '#eaeaf0',
                  fontSize: 18,
                  fontFamily: 'Orbitron, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            {/* Output */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ color: '#00ff88', fontSize: 14, marginBottom: 8, display: 'block' }}>
                To (NAG)
              </label>
              <input
                type="text"
                value={loading ? 'Getting quote...' : error ? '' : outputAmount}
                readOnly
                placeholder={error ? error : "0.00"}
                style={{
                  width: '100%',
                  padding: 16,
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: `1px solid ${error ? '#ff4444' : '#00ff88'}`,
                  borderRadius: 12,
                  color: error ? '#ff4444' : '#eaeaf0',
                  fontSize: 18,
                  fontFamily: 'Orbitron, sans-serif',
                  outline: 'none'
                }}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                background: 'rgba(255, 68, 68, 0.1)', 
                border: '1px solid #ff4444', 
                borderRadius: 8,
                color: '#ff4444',
                fontSize: 14,
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {/* Quote Info */}
            {outputAmount && !error && !loading && (
              <div style={{ 
                marginBottom: 16, 
                padding: 12, 
                background: 'rgba(0, 255, 136, 0.05)', 
                border: '1px solid #00ff88', 
                borderRadius: 8,
                color: '#00ff88',
                fontSize: 12,
                textAlign: 'center'
              }}>
                ✅ Live quote from Jupiter • Rate: 1 USDC ≈ {outputAmount && inputAmount ? (parseFloat(outputAmount) / parseFloat(inputAmount)).toFixed(2) : '0'} NAG
              </div>
            )}

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!connected || !inputAmount}
              style={{
                width: '100%',
                padding: 16,
                background: connected && inputAmount 
                  ? 'linear-gradient(135deg, #00ff88, #8af0ff)' 
                  : 'rgba(0, 255, 136, 0.3)',
                border: 'none',
                borderRadius: 12,
                color: '#000',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: connected && inputAmount ? 'pointer' : 'not-allowed',
                fontFamily: 'Orbitron, sans-serif',
                opacity: connected && inputAmount ? 1 : 0.5,
                boxShadow: connected && inputAmount ? '0 0 20px rgba(0, 255, 136, 0.3)' : 'none'
              }}
            >
              {!connected ? 'Connect Wallet' : !inputAmount ? 'Enter Amount' : 'SWAP NOW'}
            </button>

            {/* Note */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <span style={{ color: '#00ff88', fontSize: 12, opacity: 0.7 }}>
                Powered by Jupiter Aggregator V6
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
