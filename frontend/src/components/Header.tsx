import { useState } from 'react';
import WalletConnectButton from './WalletConnectButton';
import MobileWalletConnect from './MobileWalletConnect';
import { motion, AnimatePresence } from 'framer-motion';
import { isMobile } from '../utils/mobileWallet';

interface HeaderProps {
  onMenuToggle?: () => void;
  onConnectRequest?: () => void;
  onScrollToGames?: () => void;
  onShowLeaderboard?: () => void;
  onShowTokenomics?: () => void;
  onShowBattleArena?: () => void;
  onShowSettings?: () => void;
  onShowSwap?: () => void;
}

const Header = ({
  onMenuToggle,
  onConnectRequest,
  onScrollToGames,
  onShowLeaderboard,
  onShowTokenomics,
  onShowBattleArena,
  onShowSettings,
  onShowSwap
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileWallet, setShowMobileWallet] = useState(false);

  const handleToggle = () => {
    setMobileMenuOpen((prev) => !prev);
    onMenuToggle?.();
  };

  return (
    <header className="w-full bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
          >
            Nova Arcade Glitch
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-lg border border-gray-700 text-gray-200 hover:bg-gray-800 transition-colors"
            onClick={handleToggle}
            aria-label="Toggle navigation"
          >
            ☰
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={handleToggle}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.aside
            initial={{ x: 350 }}
            animate={{ x: 0 }}
            exit={{ x: 350 }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            style={{
              position: 'fixed',
              right: 0,
              top: 0,
              bottom: 0,
              width: '340px',
              zIndex: 11000,
              background: 'linear-gradient(165deg, #0a0a0f 0%, #1a1625 40%, #0f0820 100%)',
              borderLeft: '1px solid rgba(0, 255, 255, 0.15)',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.7), -2px 0 8px rgba(0, 255, 255, 0.1)',
              display: 'flex',
              flexDirection: 'column',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
            }}
          >
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid rgba(0, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{
                    margin: 0,
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#00f5ff',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    Navigation
                  </h2>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontWeight: 400
                  }}>
                    Quick Menu
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '20px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(0, 255, 255, 0.4)';
                    e.currentTarget.style.color = '#00f5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
                  }}
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px'
            }}>
              {/* Wallet Section */}
              <div style={{ marginBottom: '28px' }}>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(0, 245, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  paddingLeft: '4px'
                }}>
                  Account
                </h3>
                <WalletConnectButton
                  onConnectRequest={() => {
                    if (isMobile()) {
                      setShowMobileWallet(true);
                      setMobileMenuOpen(false);
                    } else {
                      onConnectRequest?.();
                      setMobileMenuOpen(false);
                    }
                  }}
                />
              </div>

              {/* Navigation List */}
              <div>
                <h3 style={{
                  margin: '0 0 12px 0',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'rgba(0, 245, 255, 0.6)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.2px',
                  paddingLeft: '4px'
                }}>
                  Main Menu
                </h3>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {[
                    { icon: '🎮', label: 'Games Lobby', desc: 'Browse & play', action: onScrollToGames },
                    { icon: '📊', label: 'Leaderboard', desc: 'Top scores', action: onShowLeaderboard },
                    { icon: '💰', label: 'Tokenomics', desc: '$NAG info', action: onShowTokenomics },
                    { icon: '⚔️', label: 'Battle Arena', desc: 'X402 Live PvP', action: onShowBattleArena },
                    { icon: '⚙️', label: 'Settings', desc: 'Preferences', action: onShowSettings },
                    { icon: '🔄', label: 'Swap Tokens', desc: 'Jupiter DEX', action: onShowSwap }
                  ].map((item, idx) => (
                    <motion.button
                      key={idx}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        item.action?.();
                        setMobileMenuOpen(false);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        textAlign: 'left',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 245, 255, 0.08)';
                        e.currentTarget.style.borderColor = 'rgba(0, 245, 255, 0.3)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 245, 255, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <span style={{ fontSize: '24px', lineHeight: 1 }}>{item.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '15px',
                          fontWeight: 600,
                          color: '#ffffff',
                          marginBottom: '2px',
                          letterSpacing: '0.3px'
                        }}>
                          {item.label}
                        </div>
                        <div style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontWeight: 400
                        }}>
                          {item.desc}
                        </div>
                      </div>
                      <span style={{
                        fontSize: '14px',
                        color: 'rgba(0, 245, 255, 0.5)',
                        transition: 'transform 0.25s'
                      }}>
                        →
                      </span>
                    </motion.button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(0, 255, 255, 0.1)',
              background: 'rgba(0, 0, 0, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{
                margin: 0,
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.4)',
                fontWeight: 500,
                letterSpacing: '0.8px',
                textTransform: 'uppercase'
              }}>
                Nova Arcade Glitch v1.1
              </p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Wallet Connect Modal */}
      {showMobileWallet && (
        <MobileWalletConnect onClose={() => setShowMobileWallet(false)} />
      )}
    </header>
  );
};

export default Header;
