/**
 * Mobile Touch Controls - Universal touch controls for all games
 * Supports tap, swipe, and virtual buttons
 */

import React, { useEffect, useRef, useState } from 'react';

interface MobileTouchControlsProps {
  gameName: string;
  onLeft?: () => void;
  onRight?: () => void;
  onUp?: () => void;
  onDown?: () => void;
  onRotate?: () => void;
  onJump?: () => void;
  onShoot?: () => void;
  onAction?: () => void;
  onPause?: () => void;
}

const MobileTouchControls: React.FC<MobileTouchControlsProps> = ({
  gameName,
  onLeft,
  onRight,
  onUp,
  onDown,
  onRotate,
  onJump,
  onShoot,
  onAction,
  onPause
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const swipeThreshold = 30;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
        || window.innerWidth <= 768;
      setIsMobile(mobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > swipeThreshold) {
        if (deltaX > 0 && onRight) onRight();
        else if (deltaX < 0 && onLeft) onLeft();
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > swipeThreshold) {
        if (deltaY > 0 && onDown) onDown();
        else if (deltaY < 0 && onUp) onUp();
      }
    }

    touchStartRef.current = null;
  };

  const handleTap = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Tap on right side = action/shoot/jump
    if (touch.clientX > screenWidth * 0.6) {
      if (onRotate) onRotate();
      else if (onJump) onJump();
      else if (onShoot) onShoot();
      else if (onAction) onAction();
    }
  };

  if (!isMobile) return null;

  // TetraMem specific controls
  if (gameName === 'TetraMem') {
    return (
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '30vh',
          zIndex: 1000,
          display: 'flex',
          gap: 12,
          padding: 16,
          pointerEvents: 'auto'
        }}
      >
        {/* Left Control */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onLeft?.(); }}
          style={{
            flex: 1,
            background: 'rgba(168, 85, 247, 0.3)',
            border: '2px solid rgba(168, 85, 247, 0.6)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          ◀
        </button>

        {/* Down Control */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onDown?.(); }}
          style={{
            flex: 1,
            background: 'rgba(168, 85, 247, 0.3)',
            border: '2px solid rgba(168, 85, 247, 0.6)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          ▼
        </button>

        {/* Right Control */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onRight?.(); }}
          style={{
            flex: 1,
            background: 'rgba(168, 85, 247, 0.3)',
            border: '2px solid rgba(168, 85, 247, 0.6)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 32,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          ▶
        </button>

        {/* Rotate Control */}
        <button
          onTouchStart={(e) => { e.preventDefault(); onRotate?.(); }}
          style={{
            flex: 1.5,
            background: 'rgba(251, 146, 60, 0.3)',
            border: '2px solid rgba(251, 146, 60, 0.6)',
            borderRadius: 12,
            color: '#fff',
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'none',
            fontFamily: 'Rajdhani, sans-serif'
          }}
        >
          🔄<br/>ROTATE
        </button>
      </div>
    );
  }

  // Generic game controls (for other arcade games)
  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '25vh',
        zIndex: 1000,
        display: 'flex',
        gap: 12,
        padding: 16,
        pointerEvents: 'auto'
      }}
    >
      {/* Left Joystick Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {onUp && (
          <button
            onTouchStart={(e) => { e.preventDefault(); onUp(); }}
            style={{
              flex: 1,
              background: 'rgba(168, 85, 247, 0.3)',
              border: '2px solid rgba(168, 85, 247, 0.6)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 24,
              touchAction: 'none'
            }}
          >
            ▲
          </button>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          {onLeft && (
            <button
              onTouchStart={(e) => { e.preventDefault(); onLeft(); }}
              style={{
                flex: 1,
                background: 'rgba(168, 85, 247, 0.3)',
                border: '2px solid rgba(168, 85, 247, 0.6)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 24,
                touchAction: 'none'
              }}
            >
              ◀
            </button>
          )}
          {onRight && (
            <button
              onTouchStart={(e) => { e.preventDefault(); onRight(); }}
              style={{
                flex: 1,
                background: 'rgba(168, 85, 247, 0.3)',
                border: '2px solid rgba(168, 85, 247, 0.6)',
                borderRadius: 12,
                color: '#fff',
                fontSize: 24,
                touchAction: 'none'
              }}
            >
              ▶
            </button>
          )}
        </div>
      </div>

      {/* Right Action Buttons */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(onJump || onAction || onRotate) && (
          <button
            onTouchStart={(e) => {
              e.preventDefault();
              if (onJump) onJump();
              else if (onRotate) onRotate();
              else if (onAction) onAction();
            }}
            style={{
              flex: 1,
              background: 'rgba(34, 197, 94, 0.3)',
              border: '2px solid rgba(34, 197, 94, 0.6)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'Rajdhani, sans-serif',
              touchAction: 'none'
            }}
          >
            {onJump ? 'JUMP' : onRotate ? 'ROTATE' : 'ACTION'}
          </button>
        )}
        {onShoot && (
          <button
            onTouchStart={(e) => { e.preventDefault(); onShoot(); }}
            style={{
              flex: 1,
              background: 'rgba(239, 68, 68, 0.3)',
              border: '2px solid rgba(239, 68, 68, 0.6)',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              fontFamily: 'Rajdhani, sans-serif',
              touchAction: 'none'
            }}
          >
            SHOOT
          </button>
        )}
      </div>
    </div>
  );
};

export default MobileTouchControls;
