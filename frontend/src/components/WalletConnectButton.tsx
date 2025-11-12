
import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletConnection } from '../hooks/useWalletConnection';

interface WalletConnectButtonProps {
  onConnectRequest?: () => void;
}

const WalletConnectButton = ({ onConnectRequest }: WalletConnectButtonProps) => {
  const { connected } = useWallet();
  const { shortAddress, copyAddress, disconnect } = useWalletConnection();
  const [copied, setCopied] = useState(false);
  const [showDisconnect, setShowDisconnect] = useState(false);

  const handleCopy = async () => {
    const success = await copyAddress();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Add wallet detection effect
  useEffect(() => {
    if (window.solana?.isPhantom) {
      // Handle Phantom wallet
      console.log('Phantom wallet detected');
    }
    if (window.solflare?.isSolflare) {
      // Handle Solflare wallet
      console.log('Solflare wallet detected');
    }
    // Add other wallet detections as needed
  }, []);

  if (!connected) {
    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('WalletConnectButton clicked');
          onConnectRequest?.();
        }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '14px 20px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #5b21b6 50%, #4c1d95 100%)',
          border: '2px solid rgba(124, 58, 237, 0.3)',
          borderRadius: '10px',
          color: '#ffffff',
          fontSize: '15px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 8px 24px rgba(109, 40, 217, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(109, 40, 217, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(109, 40, 217, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
        }}
      >
        <span style={{ fontSize: '18px' }}>🔗</span>
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDisconnect(!showDisconnect)}
        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl flex items-center"
      >
        <span className="mr-2">
          {shortAddress}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${showDisconnect ? 'transform rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showDisconnect && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50">
          <button
            onClick={handleCopy}
            className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-gray-700"
          >
            {copied ? 'Copied!' : 'Copy Address'}
          </button>
          <button
            onClick={() => {
              disconnect();
              setShowDisconnect(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectButton;
