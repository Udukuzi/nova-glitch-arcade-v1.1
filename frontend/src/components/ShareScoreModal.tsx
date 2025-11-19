/**
 * Share Score Modal - Viral growth engine
 * Share high scores to Twitter/X, Discord, Telegram
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { trackSocialShare } from '../utils/achievementTracker';

interface ShareScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  game: string;
  rank?: number;
}

export function ShareScoreModal({ isOpen, onClose, score, game, rank }: ShareScoreModalProps) {
  const [copied, setCopied] = useState(false);

  // Generate share text
  const generateShareText = () => {
    const rankText = rank ? `Ranked #${rank} globally! 🏆` : '';
    return `Just scored ${score.toLocaleString()} in ${game} on Nova Arcade Glitch! 🎮⚡\n${rankText}\nPlay now and compete for crypto prizes! 💰\n\n#NovaArcade #Web3Gaming #Solana`;
  };

  // Generate share URL
  const shareUrl = 'https://nova-arcade.app'; // Replace with actual URL

  // Share to Twitter/X
  const shareToTwitter = () => {
    const text = encodeURIComponent(generateShareText());
    const url = encodeURIComponent(shareUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=550,height=420'
    );
    
    // Track achievement
    trackSocialShare('Twitter', `score of ${score} in ${game}`);
  };

  // Share to Telegram
  const shareToTelegram = () => {
    const text = encodeURIComponent(generateShareText() + '\n' + shareUrl);
    window.open(
      `https://t.me/share/url?url=${shareUrl}&text=${text}`,
      '_blank'
    );
    
    // Track achievement
    trackSocialShare('Telegram', `score of ${score} in ${game}`);
  };

  // Copy to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText() + '\n' + shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  // Download as image (future feature)
  const downloadAsImage = () => {
    alert('Screenshot feature coming soon! For now, use your device\'s screenshot tool.');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: 20
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
              border: '2px solid #00ff88',
              borderRadius: 20,
              padding: 32,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.5)',
              color: '#fff',
              textAlign: 'center'
            }}
          >
            {/* Celebration Header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              style={{ fontSize: 80, marginBottom: 16 }}
            >
              🎉
            </motion.div>

            <h2 style={{ 
              margin: 0, 
              color: '#00ff88', 
              fontSize: 32, 
              fontWeight: 700,
              marginBottom: 8
            }}>
              Awesome Score!
            </h2>

            {/* Score Display */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.2))',
              border: '2px solid #00ff88',
              borderRadius: 16,
              padding: 24,
              marginBottom: 24
            }}>
              <div style={{ fontSize: 16, color: '#8af0ff', marginBottom: 8 }}>
                {game}
              </div>
              <div style={{ 
                fontSize: 48, 
                fontWeight: 700, 
                color: '#00ff88',
                fontFamily: 'monospace',
                marginBottom: 8
              }}>
                {score.toLocaleString()}
              </div>
              {rank && (
                <div style={{ fontSize: 14, color: '#fff', opacity: 0.9 }}>
                  Global Rank: <span style={{ color: '#00ff88', fontWeight: 700 }}>#{rank}</span>
                </div>
              )}
            </div>

            {/* Share Message */}
            <p style={{ 
              color: '#8af0ff', 
              fontSize: 15, 
              marginBottom: 24,
              lineHeight: 1.6
            }}>
              Share your achievement and invite friends to compete! 🚀
            </p>

            {/* Share Buttons */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: 12,
              marginBottom: 16
            }}>
              {/* Twitter/X */}
              <button
                onClick={shareToTwitter}
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 18 }}>𝕏</span>
                Share on X
              </button>

              {/* Telegram */}
              <button
                onClick={shareToTelegram}
                style={{
                  padding: '14px 20px',
                  background: 'linear-gradient(135deg, #0088cc, #006699)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 18 }}>✈️</span>
                Telegram
              </button>

              {/* Copy Link */}
              <button
                onClick={copyToClipboard}
                style={{
                  padding: '14px 20px',
                  background: copied 
                    ? 'linear-gradient(135deg, #00ff88, #00cc6a)'
                    : 'rgba(0, 255, 136, 0.15)',
                  color: copied ? '#000' : '#00ff88',
                  border: `2px solid ${copied ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => !copied && (e.currentTarget.style.background = 'rgba(0, 255, 136, 0.25)')}
                onMouseOut={(e) => !copied && (e.currentTarget.style.background = 'rgba(0, 255, 136, 0.15)')}
              >
                <span style={{ fontSize: 18 }}>{copied ? '✓' : '📋'}</span>
                {copied ? 'Copied!' : 'Copy Link'}
              </button>

              {/* Screenshot */}
              <button
                onClick={downloadAsImage}
                style={{
                  padding: '14px 20px',
                  background: 'rgba(0, 255, 136, 0.15)',
                  color: '#00ff88',
                  border: '2px solid rgba(0, 255, 136, 0.3)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.25)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0, 255, 136, 0.15)'}
              >
                <span style={{ fontSize: 18 }}>📸</span>
                Screenshot
              </button>
            </div>

            {/* Referral Bonus Info */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: 12,
              padding: 12,
              marginBottom: 16
            }}>
              <div style={{ fontSize: 12, color: '#FFD700', fontWeight: 600 }}>
                🎁 Referral Bonus
              </div>
              <div style={{ fontSize: 11, color: '#fff', opacity: 0.9, marginTop: 4 }}>
                Earn 10% of your referrals' entry fees!
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px 24px',
                background: 'transparent',
                color: '#8af0ff',
                border: '1.5px solid rgba(138, 240, 255, 0.3)',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(138, 240, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(138, 240, 255, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(138, 240, 255, 0.3)';
              }}
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
