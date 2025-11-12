import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { 
  isMobile, 
  isInWalletBrowser, 
  openMobileWallet,
  getMobileWalletInstructions,
  getWalletConnectionMethod
} from '../utils/mobileWallet';

interface MobileWalletConnectProps {
  onClose?: () => void;
}

export default function MobileWalletConnect({ onClose }: MobileWalletConnectProps) {
  const { select, wallets, connect, connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [connecting, setConnecting] = useState<string | null>(null);
  
  const connectionMethod = getWalletConnectionMethod();
  const isInApp = isInWalletBrowser();
  const isMobileDevice = isMobile();

  const handleWalletSelect = async (walletName: string) => {
    setConnecting(walletName);
    
    try {
      if (isMobileDevice && !isInApp) {
        // Mobile device - try deep links first
        let usedDeepLink = false;
        
        if (walletName.toLowerCase().includes('phantom')) {
          usedDeepLink = openMobileWallet('phantom');
        } else if (walletName.toLowerCase().includes('solflare')) {
          // Solflare: use standard adapter (no deep link)
          usedDeepLink = false;
        }
        
        // If no deep link used, fall back to standard adapter
        if (!usedDeepLink) {
          const wallet = wallets.find(w => w.adapter.name === walletName);
          if (wallet) {
            select(wallet.adapter.name);
            setTimeout(() => {
              connect().catch(console.error);
            }, 100);
          }
        }
      } else {
        // Desktop or in-app browser - use standard connection
        const wallet = wallets.find(w => w.adapter.name === walletName);
        if (wallet) {
          select(wallet.adapter.name);
          setTimeout(() => {
            connect().catch(console.error);
          }, 100);
        }
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setTimeout(() => setConnecting(null), 2000);
    }
  };

  const handleStandardModal = () => {
    setVisible(true);
    onClose?.();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '2px solid #00ff88',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)',
        position: 'relative'
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#00ff88',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px 8px'
          }}
        >
          ✕
        </button>

        {/* Header */}
        <h2 style={{
          fontFamily: 'Orbitron, sans-serif',
          fontSize: '28px',
          color: '#00ff88',
          marginBottom: '8px',
          textAlign: 'center'
        }}>
          Connect Wallet
        </h2>

        <p style={{
          color: '#8af0ff',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          {isMobileDevice && !isInApp 
            ? 'Tap a wallet to open the app'
            : isInApp
            ? 'Connect using your wallet app'
            : 'Choose your wallet to connect'}
        </p>

        {/* Wallet buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Phantom */}
          <button
            onClick={() => handleWalletSelect('Phantom')}
            disabled={connecting !== null}
            style={{
              padding: '16px',
              background: connecting === 'Phantom' 
                ? 'linear-gradient(135deg, #ab9ff2 0%, #8b7fd8 100%)'
                : 'linear-gradient(135deg, #6b5fb8 0%, #4b3f88 100%)',
              border: '2px solid #ab9ff2',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: connecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'Orbitron, sans-serif',
              transition: 'all 0.3s ease',
              opacity: connecting && connecting !== 'Phantom' ? 0.5 : 1
            }}
          >
            <span style={{ fontSize: '32px' }}>👻</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div>Phantom</div>
              {isMobileDevice && !isInApp && (
                <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>
                  {getMobileWalletInstructions('phantom')}
                </div>
              )}
            </div>
            {connecting === 'Phantom' && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </button>

          {/* Solflare */}
          <button
            onClick={() => handleWalletSelect('Solflare')}
            disabled={connecting !== null}
            style={{
              padding: '16px',
              background: connecting === 'Solflare'
                ? 'linear-gradient(135deg, #fc8d4d 0%, #f76b1c 100%)'
                : 'linear-gradient(135deg, #e67e3c 0%, #c65a1c 100%)',
              border: '2px solid #fc8d4d',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: connecting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontFamily: 'Orbitron, sans-serif',
              transition: 'all 0.3s ease',
              opacity: connecting && connecting !== 'Solflare' ? 0.5 : 1
            }}
          >
            <span style={{ fontSize: '32px' }}>☀️</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div>Solflare</div>
              {isMobileDevice && !isInApp && (
                <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: 'normal' }}>
                  Uses WalletConnect to connect
                </div>
              )}
            </div>
            {connecting === 'Solflare' && (
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            )}
          </button>

          {/* More wallets button for desktop */}
          {!isMobileDevice && (
            <button
              onClick={handleStandardModal}
              style={{
                padding: '12px',
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '8px',
                color: '#00ff88',
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'Orbitron, sans-serif',
                transition: 'all 0.3s ease'
              }}
            >
              More Wallets...
            </button>
          )}
        </div>

        {/* Info text */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(0, 255, 136, 0.05)',
          border: '1px solid rgba(0, 255, 136, 0.2)',
          borderRadius: '8px'
        }}>
          <p style={{
            color: '#8af0ff',
            fontSize: '12px',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {isMobileDevice && !isInApp ? (
              <>
                📱 <strong>Mobile Users:</strong> Tapping a wallet will open the app. 
                If you don't have the app installed, you'll be redirected to download it.
              </>
            ) : isInApp ? (
              <>
                ✅ <strong>In-App Browser:</strong> You're browsing from within a wallet app. 
                Click connect to authorize this site.
              </>
            ) : (
              <>
                🖥️ <strong>Desktop Users:</strong> Make sure you have the wallet extension 
                installed in your browser before connecting.
              </>
            )}
          </p>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
