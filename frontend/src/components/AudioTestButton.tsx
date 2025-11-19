/**
 * Audio Test Button - For debugging audio issues
 * Shows audio state and allows manual testing
 */

import { useState, useEffect } from 'react';
import { soundManager } from '../utils/sounds';

export default function AudioTestButton() {
  const [audioState, setAudioState] = useState({
    unlocked: false,
    sfxEnabled: true,
    musicEnabled: true
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const checkState = () => {
      setAudioState({
        unlocked: soundManager.isAudioUnlocked(),
        sfxEnabled: soundManager.isSFXEnabled(),
        musicEnabled: soundManager.isMusicEnabled()
      });
    };

    checkState();
    const interval = setInterval(checkState, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isHidden) return null;

  const testAllSounds = () => {
    console.log('🎵 Testing all sounds...');
    
    setTimeout(() => {
      console.log('Playing click...');
      soundManager.playClick();
    }, 0);
    
    setTimeout(() => {
      console.log('Playing game start...');
      soundManager.playGameStart();
    }, 500);
    
    setTimeout(() => {
      console.log('Playing success...');
      soundManager.playSuccess();
    }, 1500);
    
    setTimeout(() => {
      console.log('Playing coin...');
      soundManager.playCoin();
    }, 2500);
    
    setTimeout(() => {
      console.log('Playing error...');
      soundManager.playError();
    }, 3000);
    
    setTimeout(() => {
      console.log('Playing game over...');
      soundManager.playGameOver();
    }, 3500);
  };

  const unlockAudio = () => {
    console.log('🔓 Manually unlocking audio...');
    soundManager.unlockAudio();
    setTimeout(() => {
      setAudioState({
        unlocked: soundManager.isAudioUnlocked(),
        sfxEnabled: soundManager.isSFXEnabled(),
        musicEnabled: soundManager.isMusicEnabled()
      });
    }, 500);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.9)',
        border: '2px solid #a855f7',
        borderRadius: 12,
        padding: isCollapsed ? 8 : 16,
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: 12,
        minWidth: isCollapsed ? 'auto' : 250,
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isCollapsed ? 0 : 12 }}>
        <div style={{ fontWeight: 'bold', color: '#a855f7' }}>
          {isCollapsed ? '🔊' : '🔊 AUDIO DEBUG'}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{
              padding: '2px 6px',
              background: '#6d28d9',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 10
            }}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? '▼' : '▲'}
          </button>
          <button
            onClick={() => setIsHidden(true)}
            style={{
              padding: '2px 6px',
              background: '#991b1b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 10
            }}
            title="Hide (refresh page to show again)"
          >
            ✕
          </button>
        </div>
      </div>
      
      {!isCollapsed && (<>
      
      <div style={{ marginBottom: 8 }}>
        <div>Audio Unlocked: <span style={{ color: audioState.unlocked ? '#22c55e' : '#ef4444' }}>
          {audioState.unlocked ? '✅ YES' : '❌ NO'}
        </span></div>
        <div>SFX Enabled: <span style={{ color: audioState.sfxEnabled ? '#22c55e' : '#ef4444' }}>
          {audioState.sfxEnabled ? '✅ YES' : '❌ NO'}
        </span></div>
        <div>Music Enabled: <span style={{ color: audioState.musicEnabled ? '#22c55e' : '#ef4444' }}>
          {audioState.musicEnabled ? '✅ YES' : '❌ NO'}
        </span></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={unlockAudio}
          style={{
            padding: '8px 12px',
            background: '#8b5cf6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 11
          }}
        >
          🔓 UNLOCK AUDIO
        </button>
        
        <button
          onClick={testAllSounds}
          style={{
            padding: '8px 12px',
            background: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: 11
          }}
        >
          🎵 TEST ALL SOUNDS
        </button>

        <button
          onClick={() => soundManager.playClick()}
          style={{
            padding: '6px 10px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 10
          }}
        >
          Test Click
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 10, opacity: 0.7 }}>
        Press F12 for console logs
      </div>
      </>)}
    </div>
  );
}
