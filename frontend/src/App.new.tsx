import { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WalletProvider } from './contexts/WalletProvider';
import SplashScreen from './components/SplashScreen';
import Lobby from './components/Lobby';
import GameShell from './components/GameShell';
import Footer from './components/Footer';
import PasswordGate from './components/PasswordGate';
import Toast, { useToast } from './components/Toast';
import SettingsPanel from './components/SettingsPanel';
import TokenomicsModal from './components/TokenomicsModal';
import Header from './components/Header';
import WalletTest from './components/WalletTest';
import { soundManager } from './utils/sounds';
import './components/EnhancedGlitch.css';

// Main App component
function App() {
  const [walletSession, setWalletSession] = useState<string | null>(null);
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenomics, setShowTokenomics] = useState(false);
  const toast = useToast();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handlePasswordSuccess = () => {
    setAccessGranted(true);
  };

  const handleLogout = () => {
    setAccessGranted(false);
    setWalletSession(null);
    setWalletAddress(null);
  };

  // Show splash screen
  if (showSplash) {
    return (
      <ThemeProvider>
        <SplashScreen onComplete={handleSplashComplete} />
      </ThemeProvider>
    );
  }

  // Show password gate if access not granted
  if (!accessGranted) {
    return (
      <ThemeProvider>
        <PasswordGate onSuccess={handlePasswordSuccess} />
      </ThemeProvider>
    );
  }

  // Show active game if one is selected
  if (activeGame) {
    return (
      <ThemeProvider>
        <GameShell gameId={activeGame} onBack={() => setActiveGame(null)} />
      </ThemeProvider>
    );
  }

  // Main app content
  const appContent = (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <Header />
      
      {/* Temporary Wallet Test Component - Remove after testing */}
      <div className="container mx-auto p-4">
        <div className="max-w-md mx-auto">
          <WalletTest />
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <Lobby 
          onSelectGame={setActiveGame} 
          walletAddress={walletAddress}
        />
      </main>

      <Footer 
        onShowSettings={() => setShowSettings(true)}
        onShowTokenomics={() => setShowTokenomics(true)}
      />

      <SettingsPanel 
        open={showSettings} 
        onClose={() => setShowSettings(false)} 
      />

      <TokenomicsModal 
        open={showTokenomics} 
        onClose={() => setShowTokenomics(false)} 
      />

      <Toast 
        toasts={toast.toasts} 
        onRemove={toast.removeToast} 
      />
    </div>
  );

  // Wrap with providers
  return (
    <ThemeProvider>
      <WalletProvider>
        {appContent}
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;
