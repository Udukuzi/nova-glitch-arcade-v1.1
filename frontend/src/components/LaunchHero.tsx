import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { WalletName } from '@solana/wallet-adapter-base';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletModal from './WalletModal';
import { soundManager } from '../utils/sounds';
import { useTheme } from '../contexts/ThemeContext';

const TRIAL_STORAGE_KEY = 'nova_trials';
const WALLET_SESSION_KEY = 'wallet_session';
const WALLET_ADDRESS_KEY = 'wallet_address';
const WALLET_USER_KEY = 'wallet_user';
const MAX_TRIALS = 3;
const REQUIRED_NAG_TOKENS = 100000; // 100,000 tokens required for unlimited play
const DEV_BYPASS = true; // Set to false in production to enforce holder requirement

interface LaunchHeroProps {
  session: { token: string; address: string } | null;
  onSession: (token: string, address: string) => void;
  connectSignal: number;
  onEnter: () => void;
}

const defaultNoiseBackground = `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29-22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239C92AC' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`;

export default function LaunchHero({ session, onSession, connectSignal, onEnter }: LaunchHeroProps) {
  const { connect, select, connected, publicKey } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const [trialsLeft, setTrialsLeft] = useState<number>(MAX_TRIALS);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [glitchOffset, setGlitchOffset] = useState(0);
  const [noiseOpacity, setNoiseOpacity] = useState(0.03); // Set initial opacity
  const [introSoundPlayed, setIntroSoundPlayed] = useState(false);

  const isDark = true; // Force dark theme for visibility
  const themeIcon = isDark ? '☀️' : '🌙';
  
  // Add noise background
  const defaultNoiseBackground = `url("data:image/svg+xml;utf8,<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><filter id='noiseFilter'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23noiseFilter)' opacity='0.35'/></svg>")`;

  useEffect(() => {
    if (!introSoundPlayed) {
      soundManager.playGameStart();
      setIntroSoundPlayed(true);
    }
  }, [introSoundPlayed]);

  useEffect(() => {
    const stored = localStorage.getItem(TRIAL_STORAGE_KEY);
    if (stored !== null) {
      const parsed = parseInt(stored, 10);
      if (!Number.isNaN(parsed)) {
        setTrialsLeft(parsed);
      }
    }
  }, []);

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.65) {
        setGlitchOffset(Math.random() > 0.5 ? 2 : -2);
        setTimeout(() => setGlitchOffset(0), 60);
      }
    }, 180);

    const noiseInterval = setInterval(() => {
      setNoiseOpacity(Math.random() > 0.75 ? 0.12 : 0);
    }, 120);

    return () => {
      clearInterval(glitchInterval);
      clearInterval(noiseInterval);
    };
  }, []);

  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toString();
      
      // Check holder requirement (bypassed for dev testing)
      if (!DEV_BYPASS && trialsLeft <= 0) {
        // In production, this would check actual token balance
        // For now, we'll add a placeholder that would call an API
        console.log('Holder requirement check:', {
          address,
          requiredTokens: REQUIRED_NAG_TOKENS,
          devBypass: DEV_BYPASS
        });
        
        // Placeholder: In production, check token balance via API
        // const hasRequiredTokens = await checkTokenBalance(address);
        // if (!hasRequiredTokens) {
        //   setError(\`You need ${REQUIRED_NAG_TOKENS.toLocaleString()} $NAG tokens to play.\`);
        //   return;
        // }
      }
      
      const token = `solana-token-${Date.now()}`;
      onSession(token, address);
      localStorage.setItem(WALLET_SESSION_KEY, token);
      localStorage.setItem(WALLET_ADDRESS_KEY, address);
      onEnter();
    }
  }, [connected, publicKey, onSession, onEnter, trialsLeft]);

  useEffect(() => {
    if (connectSignal > 0) {
      setShowWalletModal(true);
    }
  }, [connectSignal]);

  const trialsLabel = useMemo(() => {
    if (trialsLeft <= 0) {
      return 'No free trials remaining';
    }
    if (trialsLeft === 1) {
      return '1 free trial remaining';
    }
    return `${trialsLeft} free trials remaining`;
  }, [trialsLeft]);

  const handleTrialPlay = () => {
    if (trialsLeft <= 0) {
      soundManager.playError();
      setError('Trials exhausted. Please connect a wallet with 100,000 $NAG tokens to continue.');
      // Force modal open with fresh key
      setModalKey(prev => prev + 1);
      setShowWalletModal(false);
      setTimeout(() => {
        setShowWalletModal(true);
      }, 200);
      return;
    }

    soundManager.playClick();

    const newTrials = trialsLeft - 1;
    setTrialsLeft(newTrials);
    localStorage.setItem(TRIAL_STORAGE_KEY, String(newTrials));

    const mockWallet = `trial-${Date.now()}`;
    const mockToken = `trial-token-${Date.now()}`;

    localStorage.setItem(WALLET_SESSION_KEY, mockToken);
    localStorage.setItem(WALLET_ADDRESS_KEY, mockWallet);
    localStorage.setItem(
      WALLET_USER_KEY,
      JSON.stringify({ address: mockWallet, isTrial: true, trialsUsed: MAX_TRIALS - newTrials })
    );

    onSession(mockToken, mockWallet);
    soundManager.playSuccess();
    onEnter();
  };

  const handleWalletConnect = async (walletName: WalletName) => {
    try {
      setIsConnecting(true);
      setError('');
      soundManager.playClick();
      console.log('Attempting to connect wallet:', walletName);
      
      // Select the wallet first
      select(walletName);
      
      // Small delay to ensure wallet is selected
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Attempt connection
      await connect();
      
      console.log('Wallet connected successfully');
      setShowWalletModal(false);
      soundManager.playSuccess();
    } catch (err: any) {
      console.error('Wallet connection error:', err);
      const errorMessage = err?.message || 'Failed to connect wallet';
      
      if (errorMessage.includes('User rejected')) {
        setError('Connection rejected by user.');
      } else if (errorMessage.includes('not installed') || errorMessage.includes('not detected')) {
        setError(`${walletName} wallet not installed. Please install the browser extension.`);
      } else {
        setError('Failed to connect wallet. Please try again.');
      }
      
      soundManager.playError();
    } finally {
      setIsConnecting(false);
    }
  };

  const handlePrimaryAction = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();
    
    if (connected || session) {
      soundManager.playSuccess();
      onEnter();
      return;
    }

    console.log('====== PRIMARY ACTION CLICKED ======');
    console.log('Connected:', connected);
    console.log('Session:', session);
    console.log('Current modal state:', showWalletModal);
    soundManager.playClick();
    
    // Force new modal instance with new key
    const newKey = modalKey + 1;
    console.log('Setting new modal key:', newKey);
    setModalKey(newKey);
    setShowWalletModal(false);
    
    requestAnimationFrame(() => {
      setTimeout(() => {
        console.log('Opening modal NOW with key:', newKey);
        setShowWalletModal(true);
      }, 100);
    });
  };

  const primaryLabel = session || connected ? 'Enter Lobby' : isConnecting ? 'Connecting...' : 'Connect Wallet';
  const isTrialAvailable = trialsLeft > 0;
  const hasActiveSession = Boolean(session) || connected;
  const trialStatusMessage = isTrialAvailable
    ? trialsLeft === 1
      ? 'You have 1 free trial remaining'
      : `You have ${trialsLeft} free trials remaining`
    : 'Trials exhausted — connect a wallet with 100,000 $NAG to continue';

  const handleThemeToggle = () => {
    soundManager.playClick();
    toggleTheme();
  };

  useEffect(() => {
    console.log('LaunchHero layout version', {
      version: 'grid-center-v3',
      layoutClasses: 'grid min-h-screen place-content-center place-items-center',
      timestamp: new Date().toISOString()
    });
  }, []);

  // Debug: Add a simple test div first
  if (false) { // Change to true if you need to test basic rendering
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '48px',
        fontWeight: 'bold'
      }}>
        NOVA GLITCH ARCADE - TEST MODE
      </div>
    );
  }

  return (
    <section
      data-layout-version="grid-center-v5"
      className={`relative w-full max-w-6xl rounded-[42px] border text-center transition-colors duration-500`}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        overflow: 'visible',
        background: isDark 
          ? 'linear-gradient(135deg, rgba(30, 10, 60, 0.95) 0%, rgba(10, 0, 30, 0.95) 50%, rgba(40, 10, 80, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(249, 246, 255, 0.95) 0%, rgba(237, 234, 255, 0.95) 100%)',
        borderColor: isDark ? 'rgba(0, 255, 255, 0.3)' : 'rgba(0, 150, 200, 0.3)',
        boxShadow: isDark 
          ? '0 0 160px rgba(56, 189, 248, 0.3), 0 0 80px rgba(168, 85, 247, 0.2)'
          : '0 0 160px rgba(56, 189, 248, 0.2)'
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: defaultNoiseBackground,
            opacity: noiseOpacity,
            transition: 'opacity 0.3s ease'
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(34,211,238,0.2),_transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.16),_transparent_72%)]" />
      </div>


      <div className="relative z-10 mx-auto flex w-full flex-col items-center justify-center gap-4 text-center" style={{padding: '0 2rem', maxWidth: '1200px', color: '#ffffff'}}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <motion.h1
            className="w-full text-center font-bold"
            style={{
              fontFamily: '"Monoton", "Impact", cursive',
              textTransform: 'uppercase',
              fontSize: 'clamp(2rem, 6vw, 4.5rem)',
              color: '#ffffff !important',
              textShadow: `
                0 0 15px rgba(0, 255, 255, 1),
                0 0 30px rgba(0, 255, 255, 0.9),
                0 0 45px rgba(0, 255, 255, 0.7),
                0 0 60px rgba(168, 85, 247, 1),
                0 0 90px rgba(168, 85, 247, 0.8),
                0 0 120px rgba(168, 85, 247, 0.6),
                ${glitchOffset * 2}px 0 12px rgba(255, 0, 255, 0.8),
                ${-glitchOffset * 2}px 0 12px rgba(0, 255, 0, 0.8)
              `,
              transform: `translateX(${glitchOffset + 30}px)`,
              letterSpacing: '0.08em',
              lineHeight: '1.2',
              WebkitTextStroke: '1px rgba(0, 255, 255, 0.2)'
            }}
          >
            NOVA ARCADE GLITCH
          </motion.h1>
          
          {/* Horizontal scan line glitch effect - full page */}
          <motion.div
            className="pointer-events-none"
            style={{
              position: 'fixed',
              left: 0,
              right: 0,
              background: `linear-gradient(0deg, transparent 0%, rgba(0, 255, 255, 0.15) 50%, transparent 100%)`,
              height: '3px',
              width: '100vw',
              zIndex: 9999
            }}
            animate={{
              y: ['0vh', '100vh'],
              opacity: [0, 1, 0.8, 0]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          {/* RGB split effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              mixBlendMode: 'screen'
            }}
            animate={{
              x: [0, 2, -2, 0],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: 3
            }}
          >
            <div className="absolute inset-0" style={{
              background: 'rgba(255, 0, 0, 0.2)',
              transform: 'translateX(2px)'
            }} />
            <div className="absolute inset-0" style={{
              background: 'rgba(0, 255, 255, 0.2)',
              transform: 'translateX(-2px)'
            }} />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full flex flex-col items-center"
          style={{ marginTop: '0.75rem', gap: '0.5rem' }}
        >
          <span className={`block text-xs md:text-sm uppercase tracking-[0.15em] ${isDark ? 'text-cyan-200/70' : 'text-cyan-600/80'}`}>
            {trialStatusMessage}
          </span>
          
          <p
            className="w-full text-center"
            style={{
              maxWidth: '650px',
              fontSize: '0.95rem',
              fontStyle: 'italic',
              fontWeight: 500,
              lineHeight: '1.5',
              color: isDark ? '#d0e7f0' : '#3a3a4e',
              textShadow: isDark ? '0 1px 4px rgba(0, 255, 255, 0.3)' : 'none',
              padding: '0 1rem'
            }}
          >
            <strong>Hold 100,000 $NAG tokens</strong> to unlock unlimited plays<br/>
            <span style={{ fontSize: '0.9em', opacity: 0.9 }}>100% community-owned • No team allocations • No VCs</span><br/>
            <span style={{ fontSize: '0.85em', opacity: 0.8 }}>Pure arcade chaos powered by you</span>
          </p>
        </motion.div>

        {/* Buttons Container - FORCED SIDE BY SIDE */}
        <div className="mt-8 flex w-full max-w-4xl flex-row flex-nowrap items-center justify-center gap-6" style={{ display: 'flex', flexDirection: 'row' }}>
          <motion.button
            whileHover={{ scale: isTrialAvailable ? 1.05 : 1, y: isTrialAvailable ? -3 : 0 }}
            whileTap={{ scale: isTrialAvailable ? 0.95 : 1 }}
            onClick={handleTrialPlay}
            disabled={!isTrialAvailable}
            className="relative overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              padding: '20px 48px',
              minWidth: '280px',
              fontFamily: '"Orbitron", "Helvetica", "Arial", sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: isTrialAvailable 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
              color: '#ffffff',
              boxShadow: isTrialAvailable 
                ? '0 10px 40px rgba(102, 126, 234, 0.5), 0 0 60px rgba(118, 75, 162, 0.3)'
                : '0 4px 16px rgba(0, 0, 0, 0.2)',
              opacity: isTrialAvailable ? 1 : 0.6,
              cursor: isTrialAvailable ? 'pointer' : 'not-allowed',
              border: isTrialAvailable ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex flex-col items-center gap-1">
              <span className="flex items-center gap-2">
                <span className="text-xl">🎮</span>
                <span>Play Free Trial</span>
              </span>
              <span className={`text-xs font-normal tracking-widest ${isTrialAvailable ? 'text-white/80' : 'text-white/50'}`}>
                {trialsLeft} {trialsLeft === 1 ? 'trial' : 'trials'} remaining
              </span>
            </div>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05, y: -3 }}
            onClick={handlePrimaryAction}
            disabled={isConnecting}
            className="group relative overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              padding: '20px 48px',
              minWidth: '280px',
              fontFamily: '"Orbitron", "Helvetica", "Arial", sans-serif',
              fontSize: '18px',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: hasActiveSession 
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: '#ffffff',
              boxShadow: hasActiveSession 
                ? '0 10px 40px rgba(16, 185, 129, 0.5), 0 0 60px rgba(5, 150, 105, 0.3)'
                : '0 10px 40px rgba(139, 92, 246, 0.5), 0 0 60px rgba(124, 58, 237, 0.3)',
              border: hasActiveSession ? '2px solid rgba(255, 255, 255, 0.2)' : '2px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
              background: hasActiveSession
                ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
                : 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%)'
            }} />
            <div className="relative z-10">
              <div className="flex flex-col items-center gap-1">
                <span className="flex items-center gap-2">
                  <span className="text-xl">{hasActiveSession ? '🚀' : '👾'}</span>
                  <span>{hasActiveSession && connected ? `${publicKey?.toString().slice(0, 4)}...${publicKey?.toString().slice(-4)}` : primaryLabel}</span>
                </span>
                <span className="text-xs font-normal tracking-widest text-white/80">
                  {hasActiveSession ? 'WALLET CONNECTED' : 'CONNECT WALLET'}
                </span>
              </div>
            </div>
          </motion.button>
        </div>

        {session && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 rounded-xl border px-6 py-3 text-sm font-medium ${
              isDark
                ? 'border-emerald-400/35 bg-gradient-to-r from-emerald-400/10 to-cyan-400/10 text-emerald-200'
                : 'border-emerald-500/35 bg-emerald-500/15 text-emerald-700'
            }`}
          >
            <span className="mr-2 text-green-400 animate-pulse">●</span>
            <span className="font-mono tracking-wider">
              Connected: {session.address.slice(0, 6)}...{session.address.slice(-4)}
            </span>
          </motion.div>
        )}

        {!session && !connected && (
          <button
            onClick={() => setShowWalletModal(true)}
            className={`mt-6 text-[11px] uppercase tracking-[0.4em] transition-colors duration-300 ${
              isDark ? 'text-cyan-200/80 hover:text-cyan-100' : 'text-cyan-600/90 hover:text-cyan-500'
            }`}
          >
            View supported wallets
          </button>
        )}

        {error && (
          <div
            className={`mt-6 w-full max-w-md rounded-2xl border px-4 py-3 text-sm ${
              isDark
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-red-500/30 bg-red-500/10 text-red-600'
            }`}
          >
            {error}
          </div>
        )}
      </div>

      {showWalletModal && (
        <WalletModal
          key={modalKey}
          open={showWalletModal}
          onClose={() => {
            console.log('Closing wallet modal');
            setShowWalletModal(false);
          }}
          onConnect={handleWalletConnect}
        />
      )}
    </section>
  );
}
