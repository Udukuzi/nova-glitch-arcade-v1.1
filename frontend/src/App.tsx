import { useState, useMemo, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

import '@solana/wallet-adapter-react-ui/styles.css';
import './components/EnhancedGlitch.css';

import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider as AppWalletProvider } from './contexts/WalletContext';
import SplashScreen from './components/SplashScreen';
import Lobby from './components/Lobby';
import GameShell from './components/GameShell';
import SettingsPanel from './components/SettingsPanel';
import TokenomicsModal from './components/TokenomicsModal';
import BattleArenaModal from './components/BattleArenaDemoMode';
import SwapModal from './components/SwapModalFixed';
import Toast, { useToast } from './components/Toast';
import Header from './components/Header';
import Footer from './components/Footer';
import LaunchHero from './components/LaunchHero';
import TestPage from './pages/TestPage';
import SimpleTest from './pages/SimpleTest';
import ThemeToggle from './components/ThemeToggle';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenomics, setShowTokenomics] = useState(false);
  const [showBattleArena, setShowBattleArena] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [session, setSession] = useState<{ token: string; address: string } | null>(null);
  const [connectSignal, setConnectSignal] = useState(0);
  const [showLaunchHero, setShowLaunchHero] = useState(true);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [leaderboardGameId, setLeaderboardGameId] = useState<string | null>(null);
  const [highlightGameId, setHighlightGameId] = useState<string | null>(null);

  const gamesSectionRef = useRef<HTMLDivElement>(null);

  const toast = useToast();

  useEffect(() => {
    // Set initial theme
    document.documentElement.setAttribute('data-theme', 'dark');
    
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('wallet_session');
      const storedAddress = localStorage.getItem('wallet_address');
      if (storedToken && storedAddress) {
        setSession({ token: storedToken, address: storedAddress });
      }
    }
  }, []);

  useEffect(() => {
    if (!highlightGameId) return;
    const timer = setTimeout(() => setHighlightGameId(null), 2200);
    return () => clearTimeout(timer);
  }, [highlightGameId]);

  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleLaunchGame = (gameId: string) => {
    setActiveGame(gameId);
  };

  const handleCloseGame = () => {
    setActiveGame(null);
  };

  const handleEnterArcade = () => {
    setShowLaunchHero(false);
    requestAnimationFrame(() => {
      setHighlightGameId('snake');
      setTimeout(() => setHighlightGameId(null), 1800);
    });
  };

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('wallet_session');
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('wallet_user');
    setShowLaunchHero(true);
  };

  const handleSessionEstablished = (token: string, address: string) => {
    setSession({ token, address });
    handleEnterArcade();
  };

  const handleRequestWalletConnect = () => {
    setConnectSignal((prev) => prev + 1);
  };

  const handleScrollToGames = () => {
    if (gamesSectionRef.current) {
      gamesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setHighlightGameId('snake');
  };

  const handleOpenLeaderboard = (gameId: string | null) => {
    setLeaderboardGameId(gameId);
    setLeaderboardOpen(true);
  };

  const handleCloseLeaderboard = () => {
    setLeaderboardOpen(false);
  };

  const toastContainer = (
    <Toast toasts={toast.toasts} onRemove={toast.removeToast} />
  );

  const AppContent = () => {
    const { theme, toggleTheme } = useTheme();
    const { setVisible } = useWalletModal();
    const isDarkTheme = theme === 'dark';
    
    // Override handleRequestWalletConnect to use wallet modal
    const handleRequestWalletConnectWithModal = () => {
      setVisible(true);
      setConnectSignal((prev) => prev + 1);
    };
    const pageStyle = isDarkTheme
      ? {
          background: 'radial-gradient(120% 120% at 50% 40%, #0b0320 0%, #03010b 45%, #010007 100%)'
        }
      : {
          background: 'radial-gradient(120% 120% at 50% 40%, #fdfbff 0%, #f3efff 55%, #ebe4ff 100%)'
        };
    const textClass = isDarkTheme ? 'text-white' : 'text-slate-900';

    if (showSplash) {
      return (
        <>
          <SplashScreen onComplete={handleSplashComplete} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </>
      );
    }

    if (activeGame) {
      return (
        <>
          <GameShell gameId={activeGame} onBack={handleCloseGame} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {toastContainer}
        </>
      );
    }

    if (showLaunchHero) {
      return (
        <>
          <div
            className={`min-h-screen w-full overflow-hidden ${textClass}`}
            style={{...pageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          >
            <LaunchHero
              session={session}
              onSession={handleSessionEstablished}
              connectSignal={connectSignal}
              onEnter={handleEnterArcade}
            />
            {toastContainer}
          </div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </>
      );
    }

    return (
      <div
        className={`min-h-screen ${textClass}`}
        style={pageStyle}
      >
        <Header
          onConnectRequest={handleRequestWalletConnectWithModal}
          onScrollToGames={handleScrollToGames}
          onShowLeaderboard={() => handleOpenLeaderboard(null)}
          onShowTokenomics={() => setShowTokenomics(true)}
          onShowBattleArena={() => setShowBattleArena(true)}
          onShowSettings={() => setShowSettings(true)}
          onShowSwap={() => setShowSwap(true)}
        />

        <main className="container mx-auto px-4 py-12 space-y-12">
          <Lobby
            onLaunch={handleLaunchGame}
            leaderboardOpen={leaderboardOpen}
            leaderboardGameId={leaderboardGameId}
            onOpenLeaderboard={handleOpenLeaderboard}
            onCloseLeaderboard={handleCloseLeaderboard}
            sectionRef={gamesSectionRef}
            highlightGameId={highlightGameId}
          />
        </main>

        <Footer />

        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <SettingsPanel open={showSettings} onClose={() => setShowSettings(false)} />
        <TokenomicsModal open={showTokenomics} onClose={() => setShowTokenomics(false)} />
        <BattleArenaModal open={showBattleArena} onClose={() => setShowBattleArena(false)} />
        <SwapModal open={showSwap} onClose={() => setShowSwap(false)} />
        {toastContainer}
      </div>
    );
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppWalletProvider>
            <ThemeProvider>
              <Router>
                <Routes>
                  <Route path="/simple" element={<SimpleTest />} />
                  <Route path="/test" element={<TestPage />} />
                  <Route path="/" element={<AppContent />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Router>
            </ThemeProvider>
          </AppWalletProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
