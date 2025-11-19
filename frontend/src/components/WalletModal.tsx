import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { useEffect, useState } from 'react';

interface WalletModalProps {
  open: boolean;
  onClose: () => void;
  onConnect: (walletName: WalletName) => void;
}

const wallets = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: 'https://phantom.app/img/phantom-icon.svg',
    color: '#ab9ff2'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: 'https://solflare.com/favicon.ico',
    color: '#14f195'
  }
];

export default function WalletModal({ open, onClose, onConnect }: WalletModalProps) {
  const { wallets: availableWallets } = useWallet();
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      console.log('====== WALLET MODAL OPENING ======');
      console.log('Modal open state:', open);
      console.log('Available wallets count:', availableWallets.length);
      console.log('Available wallets:', availableWallets.map(w => ({ name: w.adapter.name, readyState: w.readyState })));
      console.log('==================================');
    }
  }, [open, availableWallets]);

  // Force body scroll lock when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  // Filter to only show installed wallets
  const installedWallets = wallets.filter(wallet => 
    availableWallets.some(w => w.adapter.name.toLowerCase() === wallet.id)
  );

  // If no wallets are installed, show all with installation prompts
  const displayWallets = installedWallets.length > 0 ? installedWallets : wallets;

  const handleWalletSelect = (walletId: string) => {
    const wallet = availableWallets.find(w => w.adapter.name.toLowerCase() === walletId.toLowerCase());
    if (wallet) {
      onConnect(wallet.adapter.name as WalletName);
      return;
    }

    // Handle wallet not installed case
    setIsInstalling(walletId);
    const walletInfo = wallets.find(w => w.id === walletId);
    if (walletInfo) {
      const installUrl =
        walletInfo.id === 'phantom'
          ? 'https://phantom.app/download'
          : 'https://solflare.com/download';

      window.open(installUrl, '_blank', 'noopener,noreferrer');

      // Reset installing state after a delay
      setTimeout(() => setIsInstalling(null), 3000);
    }
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 15000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            style={{
              width: '90%',
              maxWidth: 420,
              background: 'linear-gradient(135deg, #0e0f15 0%, #1e2236 100%)',
              border: '1px solid #1e2236',
              borderRadius: 16,
              padding: 24,
              boxShadow: '0 0 40px rgba(0, 255, 255, 0.2), 0 0 80px rgba(168, 85, 247, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glitch effect overlay on modal */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(90deg, transparent 49%, rgba(0, 255, 255, 0.03) 50%, transparent 51%)',
                animation: 'glitchScanLine 2s linear infinite',
                pointerEvents: 'none'
              }}
            />
            
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h3 style={{ margin: '0 0 8px', color: '#eaeaf0', fontSize: 24, fontWeight: 700, fontFamily: 'Orbitron, sans-serif' }}>
                Connect Wallet
              </h3>
              <p style={{ color: '#8af0ff', margin: '0 0 24px', fontSize: 14, opacity: 0.9 }}>
                Choose a wallet to continue
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {displayWallets.map((wallet) => (
                  <motion.button
                    key={wallet.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWalletSelect(wallet.id)}
                    className="wallet-btn"
                    style={{
                      background: '#0a0a0a',
                      border: `2px solid ${wallet.color}`,
                      borderRadius: 12,
                      padding: '16px 20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      textAlign: 'left',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 0 20px ${wallet.color}40, 0 0 40px ${wallet.color}20`
                      e.currentTarget.style.borderColor = wallet.color
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.borderColor = wallet.color
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: wallet.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                        boxShadow: `0 0 15px ${wallet.color}40`,
                        overflow: 'hidden'
                      }}
                    >
                      <img
                        src={wallet.icon}
                        alt={wallet.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          padding: 8
                        }}
                        onError={(e) => {
                          // Fallback to colored circle with first letter if image fails
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent && !parent.querySelector('.fallback-icon')) {
                            const fallback = document.createElement('div')
                            fallback.className = 'fallback-icon'
                            fallback.textContent = wallet.name.charAt(0).toUpperCase()
                            fallback.style.cssText = `
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              color: white;
                              font-weight: 900;
                              font-size: 20px;
                              font-family: 'Orbitron', sans-serif;
                            `
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#eaeaf0', fontSize: 16, fontWeight: 600, marginBottom: 2 }}>
                        {wallet.name}
                      </div>
                      <div style={{ color: '#8af0ff', fontSize: 12, opacity: 0.8 }}>
                        {wallet.id === 'phantom' ? 'Solana · Desktop & Mobile' : 'Solana'}
                      </div>
                    </div>
                    <div style={{ color: wallet.color, fontSize: 20 }}>
                      {isInstalling === wallet.id ? '...' : '→'}
                    </div>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={onClose}
                style={{
                  marginTop: 20,
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid #1e2236',
                  borderRadius: 8,
                  color: '#8af0ff',
                  cursor: 'pointer',
                  fontSize: 14,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1e2236'
                  e.currentTarget.style.borderColor = '#8af0ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = '#1e2236'
                }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
