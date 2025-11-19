/**
 * PWA Install Prompt - Prompts users to install the app
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isInstalled) return;

    // Check if user previously dismissed
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) return;

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after 10 seconds
      setTimeout(() => setShowPrompt(true), 10000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // For iOS, show instructions after delay
    if (iOS && !isInstalled) {
      setTimeout(() => setShowPrompt(true), 15000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        setShowIOSInstructions(true);
      }
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('✅ PWA installed');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          zIndex: 10000,
          maxWidth: 500,
          margin: '0 auto'
        }}
      >
        {!showIOSInstructions ? (
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            borderRadius: 16,
            padding: 20,
            boxShadow: '0 20px 60px rgba(168,85,247,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 40 }}>📱</div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  margin: '0 0 8px 0',
                  color: '#fff',
                  fontSize: 18,
                  fontWeight: 700,
                  fontFamily: 'Orbitron, monospace'
                }}>
                  Install Nova Arcade
                </h3>
                <p style={{
                  margin: 0,
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: 14,
                  fontFamily: 'Rajdhani, sans-serif',
                  lineHeight: 1.4
                }}>
                  {isIOS ? (
                    <>Tap <strong>Share ↗</strong> then <strong>"Add to Home Screen"</strong> for the best experience!</>
                  ) : (
                    'Install for faster loading, offline play, and a native app experience!'
                  )}
                </p>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  {!isIOS && deferredPrompt && (
                    <button
                      onClick={handleInstall}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        background: '#fff',
                        color: '#a855f7',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'Rajdhani, sans-serif'
                      }}
                    >
                      Install Now
                    </button>
                  )}
                  {isIOS && (
                    <button
                      onClick={() => setShowIOSInstructions(true)}
                      style={{
                        flex: 1,
                        padding: '10px 20px',
                        background: '#fff',
                        color: '#a855f7',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontFamily: 'Rajdhani, sans-serif'
                      }}
                    >
                      Show Instructions
                    </button>
                  )}
                  <button
                    onClick={handleDismiss}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Rajdhani, sans-serif'
                    }}
                  >
                    Not Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            borderRadius: 16,
            padding: 24,
            boxShadow: '0 20px 60px rgba(168,85,247,0.5)',
            border: '2px solid rgba(255,255,255,0.2)',
            color: '#fff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 700,
                fontFamily: 'Orbitron, monospace'
              }}>
                📱 Install on iOS
              </h3>
              <button
                onClick={() => setShowIOSInstructions(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 24,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>
            <ol style={{
              margin: '0 0 16px 0',
              padding: '0 0 0 20px',
              fontFamily: 'Rajdhani, sans-serif',
              fontSize: 15,
              lineHeight: 1.8
            }}>
              <li>Tap the <strong>Share</strong> button ↗ at the bottom of Safari</li>
              <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
              <li>Tap <strong>"Add"</strong> in the top right</li>
              <li>Launch Nova Arcade from your home screen!</li>
            </ol>
            <button
              onClick={() => {
                setShowIOSInstructions(false);
                handleDismiss();
              }}
              style={{
                width: '100%',
                padding: '12px',
                background: '#fff',
                color: '#a855f7',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif'
              }}
            >
              Got It!
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;
