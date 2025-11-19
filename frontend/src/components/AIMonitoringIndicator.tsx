import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export type AIStatus = 'active' | 'intermittent' | 'disabled';

interface AIMonitoringIndicatorProps {
  status?: AIStatus;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  size?: 'small' | 'medium' | 'large';
}

export default function AIMonitoringIndicator({ 
  status = 'active', 
  position = 'top-right',
  size = 'medium'
}: AIMonitoringIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Blinking effect for intermittent status
  useEffect(() => {
    if (status === 'intermittent') {
      const interval = setInterval(() => {
        setIsVisible(prev => !prev);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setIsVisible(true);
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: '#00ff88',
          label: 'AI ACTIVE',
          icon: '🤖',
          description: 'Real-time cheat detection enabled',
          glowColor: 'rgba(0, 255, 136, 0.6)'
        };
      case 'intermittent':
        return {
          color: '#ffaa00',
          label: 'AI SCANNING',
          icon: '⚡',
          description: 'Periodic pattern analysis',
          glowColor: 'rgba(255, 170, 0, 0.6)'
        };
      case 'disabled':
        return {
          color: '#ff4444',
          label: 'AI OFFLINE',
          icon: '⚠️',
          description: 'Manual review mode',
          glowColor: 'rgba(255, 68, 68, 0.6)'
        };
    }
  };

  const config = getStatusConfig();
  
  const sizeConfig = {
    small: { width: 120, fontSize: 10, iconSize: 16, padding: 8 },
    medium: { width: 160, fontSize: 12, iconSize: 20, padding: 12 },
    large: { width: 200, fontSize: 14, iconSize: 24, padding: 16 }
  };

  const positionStyles = {
    'top-right': { top: 20, right: 20 },
    'top-left': { top: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 }
  };

  const currentSize = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isVisible ? 1 : 0.3, 
        scale: 1,
        boxShadow: isVisible 
          ? `0 0 20px ${config.glowColor}, 0 0 40px ${config.glowColor}20`
          : `0 0 10px ${config.glowColor}40`
      }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        ...positionStyles[position],
        width: currentSize.width,
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 46, 0.95) 100%)',
        border: `2px solid ${config.color}`,
        borderRadius: 12,
        padding: currentSize.padding,
        zIndex: 1000,
        backdropFilter: 'blur(10px)',
        fontFamily: '"Orbitron", sans-serif'
      }}
    >
      {/* Header with icon and status */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <span style={{ fontSize: currentSize.iconSize }}>
            {config.icon}
          </span>
          <span style={{
            color: config.color,
            fontSize: currentSize.fontSize,
            fontWeight: 'bold',
            textShadow: `0 0 10px ${config.glowColor}`
          }}>
            {config.label}
          </span>
        </div>
        
        {/* Blinking dot indicator */}
        <motion.div
          animate={{
            scale: status === 'active' ? [1, 1.2, 1] : 1,
            opacity: isVisible ? 1 : 0.3
          }}
          transition={{
            duration: status === 'active' ? 1.5 : 0.3,
            repeat: status === 'active' ? Infinity : 0,
            repeatType: 'reverse'
          }}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: config.color,
            boxShadow: `0 0 10px ${config.glowColor}`
          }}
        />
      </div>

      {/* Description */}
      <div style={{
        color: '#8af0ff',
        fontSize: currentSize.fontSize - 2,
        lineHeight: 1.3,
        opacity: 0.9
      }}>
        {config.description}
      </div>

      {/* Performance metrics (for active status) */}
      {status === 'active' && (
        <div style={{
          marginTop: 8,
          padding: 6,
          background: 'rgba(0, 255, 136, 0.1)',
          borderRadius: 6,
          border: '1px solid rgba(0, 255, 136, 0.3)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#00ff88',
            fontSize: currentSize.fontSize - 3,
            fontFamily: '"Rajdhani", sans-serif'
          }}>
            <span>Accuracy:</span>
            <span>96.2%</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            color: '#00ff88',
            fontSize: currentSize.fontSize - 3,
            fontFamily: '"Rajdhani", sans-serif'
          }}>
            <span>Response:</span>
            <span>12ms</span>
          </div>
        </div>
      )}

      {/* Warning for disabled status */}
      {status === 'disabled' && (
        <div style={{
          marginTop: 8,
          padding: 6,
          background: 'rgba(255, 68, 68, 0.1)',
          borderRadius: 6,
          border: '1px solid rgba(255, 68, 68, 0.3)',
          color: '#ff4444',
          fontSize: currentSize.fontSize - 2,
          textAlign: 'center',
          fontFamily: '"Rajdhani", sans-serif'
        }}>
          Manual verification required
        </div>
      )}
    </motion.div>
  );
}

// Hook to simulate AI status changes for demo
export function useAIMonitoring() {
  const [status, setStatus] = useState<AIStatus>('active');

  useEffect(() => {
    // Simulate status changes for demo
    const interval = setInterval(() => {
      const statuses: AIStatus[] = ['active', 'intermittent', 'active', 'active', 'intermittent'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setStatus(randomStatus);
    }, 8000); // Change every 8 seconds

    return () => clearInterval(interval);
  }, []);

  return { status, setStatus };
}
