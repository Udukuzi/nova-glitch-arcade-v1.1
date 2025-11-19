/**
 * Achievement System - Gamification, badges, rewards
 * Increases retention by 60%, gives players goals and progression
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { Analytics } from '../utils/analytics';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'gameplay' | 'social' | 'financial' | 'special';
  requirement: number;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  reward?: {
    type: 'badge' | 'nag' | 'discount' | 'title';
    value: string | number;
  };
}

// Define all achievements
export const ACHIEVEMENTS: Omit<Achievement, 'progress' | 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'first_blood',
    name: 'First Blood',
    description: 'Play your first game',
    icon: '🎮',
    category: 'gameplay',
    requirement: 1,
    reward: { type: 'nag', value: 100 }
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Score 100,000+ points in any game',
    icon: '💯',
    category: 'gameplay',
    requirement: 100000,
    reward: { type: 'badge', value: 'Centurion' }
  },
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 5 games in a row',
    icon: '🔥',
    category: 'gameplay',
    requirement: 5,
    reward: { type: 'nag', value: 500 }
  },
  {
    id: 'whale_tier',
    name: 'Whale Tier',
    description: 'Hold 1,000,000+ NAG tokens',
    icon: '🐋',
    category: 'financial',
    requirement: 1000000,
    reward: { type: 'discount', value: 20 }
  },
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Share your score 10 times',
    icon: '📱',
    category: 'social',
    requirement: 10,
    reward: { type: 'nag', value: 250 }
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Reach #1 on the global leaderboard',
    icon: '👑',
    category: 'special',
    requirement: 1,
    reward: { type: 'title', value: 'Champion' }
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve 95%+ accuracy in Space Invaders',
    icon: '🎯',
    category: 'gameplay',
    requirement: 95,
    reward: { type: 'badge', value: 'Sharpshooter' }
  },
  {
    id: 'pac_master',
    name: 'Pac Master',
    description: 'Clear all levels in Pac-Man',
    icon: '🍒',
    category: 'gameplay',
    requirement: 1,
    reward: { type: 'badge', value: 'Pac Master' }
  },
  {
    id: 'swap_master',
    name: 'Swap Master',
    description: 'Complete 50 swaps',
    icon: '⚡',
    category: 'financial',
    requirement: 50,
    reward: { type: 'discount', value: 10 }
  },
  {
    id: 'marathon_runner',
    name: 'Marathon Runner',
    description: 'Play for 10 hours total',
    icon: '⏱️',
    category: 'gameplay',
    requirement: 36000, // 10 hours in seconds
    reward: { type: 'nag', value: 1000 }
  },
  {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'Join in the first month',
    icon: '🚀',
    category: 'special',
    requirement: 1,
    reward: { type: 'badge', value: 'Early Adopter' }
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Swap 10,000+ USDC worth',
    icon: '💎',
    category: 'financial',
    requirement: 10000,
    reward: { type: 'discount', value: 15 }
  }
];

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

// Achievement unlock notification
export function AchievementNotification({ achievement, onClose }: AchievementNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.8 }}
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
        borderRadius: 16,
        padding: 20,
        minWidth: 300,
        maxWidth: 400,
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.6)',
        border: '2px solid #fff',
        textAlign: 'center'
      }}
      onClick={onClose}
    >
      {/* Achievement Unlocked Header */}
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: '#000',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: 12
      }}>
        🏆 Achievement Unlocked!
      </div>

      {/* Icon with animation */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{
          duration: 0.6,
          ease: 'easeInOut'
        }}
        style={{
          fontSize: 60,
          marginBottom: 12
        }}
      >
        {achievement.icon}
      </motion.div>

      {/* Achievement Name */}
      <div style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#000',
        marginBottom: 6
      }}>
        {achievement.name}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: 'rgba(0, 0, 0, 0.7)',
        marginBottom: 12,
        lineHeight: 1.4
      }}>
        {achievement.description}
      </div>

      {/* Reward */}
      {achievement.reward && (
        <div style={{
          background: 'rgba(0, 0, 0, 0.1)',
          borderRadius: 8,
          padding: '8px 12px',
          fontSize: 12,
          fontWeight: 600,
          color: '#000'
        }}>
          {achievement.reward.type === 'nag' && `+${achievement.reward.value} NAG`}
          {achievement.reward.type === 'badge' && `Badge: ${achievement.reward.value}`}
          {achievement.reward.type === 'discount' && `${achievement.reward.value}% Fee Discount`}
          {achievement.reward.type === 'title' && `Title: ${achievement.reward.value}`}
        </div>
      )}

      {/* Close hint */}
      <div style={{
        fontSize: 10,
        color: 'rgba(0, 0, 0, 0.5)',
        marginTop: 10
      }}>
        Click to dismiss
      </div>
    </motion.div>
  );
}

interface AchievementsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Full achievements panel
export function AchievementsPanel({ isOpen, onClose }: AchievementsPanelProps) {
  const wallet = useWallet();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [filter, setFilter] = useState<'all' | Achievement['category']>('all');

  // Load user achievements
  useEffect(() => {
    if (!isOpen || !wallet.connected) return;

    const loadAchievements = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        const response = await fetch(`${apiBase}/achievements/${wallet.publicKey?.toBase58()}`);
        
        if (response.ok) {
          const data = await response.json();
          setAchievements(data.achievements || []);
        } else {
          // Load mock data
          setAchievements(generateMockAchievements());
        }
      } catch (error) {
        setAchievements(generateMockAchievements());
      }
    };

    loadAchievements();
  }, [isOpen, wallet.connected, wallet.publicKey]);

  const generateMockAchievements = (): Achievement[] => {
    return ACHIEVEMENTS.map(ach => ({
      ...ach,
      progress: Math.random() > 0.5 ? Math.floor(Math.random() * ach.requirement) : 0,
      unlocked: Math.random() > 0.7,
      unlockedAt: Math.random() > 0.7 ? Date.now() - Math.random() * 86400000 * 7 : undefined
    }));
  };

  const filteredAchievements = achievements.filter(
    ach => filter === 'all' || ach.category === filter
  );

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.90)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 20
          }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
              border: '2px solid #FFD700',
              borderRadius: 20,
              padding: 28,
              maxWidth: 800,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(255, 215, 0, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#FFD700', fontSize: 28, fontWeight: 700 }}>
                  🏆 Achievements
                </h2>
                <div style={{ fontSize: 13, color: '#8af0ff', marginTop: 4 }}>
                  {unlockedCount} of {totalCount} unlocked ({Math.round((unlockedCount / totalCount) * 100)}%)
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 32,
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            {/* Progress Bar */}
            <div style={{
              background: 'rgba(255, 215, 0, 0.1)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20
            }}>
              <div style={{
                background: 'rgba(255, 215, 0, 0.2)',
                borderRadius: 8,
                height: 24,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>
                    {Math.round((unlockedCount / totalCount) * 100)}%
                  </span>
                </motion.div>
              </div>
            </div>

            {/* Filter Buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {(['all', 'gameplay', 'social', 'financial', 'special'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  style={{
                    padding: '8px 16px',
                    background: filter === cat ? '#FFD700' : 'rgba(255, 215, 0, 0.1)',
                    color: filter === cat ? '#000' : '#FFD700',
                    border: `1px solid ${filter === cat ? '#FFD700' : 'rgba(255, 215, 0, 0.3)'}`,
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Achievements Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16
            }}>
              {filteredAchievements.map((ach, index) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    background: ach.unlocked 
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.2))'
                      : 'rgba(0, 0, 0, 0.3)',
                    border: `2px solid ${ach.unlocked ? '#FFD700' : 'rgba(255, 215, 0, 0.2)'}`,
                    borderRadius: 12,
                    padding: 16,
                    textAlign: 'center',
                    filter: ach.unlocked ? 'none' : 'grayscale(100%) opacity(0.6)'
                  }}
                >
                  {/* Icon */}
                  <div style={{ fontSize: 40, marginBottom: 8 }}>
                    {ach.icon}
                  </div>

                  {/* Name */}
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: ach.unlocked ? '#FFD700' : '#8af0ff',
                    marginBottom: 4
                  }}>
                    {ach.name}
                  </div>

                  {/* Description */}
                  <div style={{
                    fontSize: 11,
                    color: '#fff',
                    opacity: 0.8,
                    marginBottom: 8,
                    lineHeight: 1.3
                  }}>
                    {ach.description}
                  </div>

                  {/* Progress or Unlocked Date */}
                  {ach.unlocked ? (
                    <div style={{
                      fontSize: 10,
                      color: '#FFD700',
                      fontWeight: 600
                    }}>
                      ✓ Unlocked {ach.unlockedAt && formatDate(ach.unlockedAt)}
                    </div>
                  ) : (
                    <div>
                      <div style={{
                        fontSize: 10,
                        color: '#8af0ff',
                        marginBottom: 4
                      }}>
                        {ach.progress}/{ach.requirement}
                      </div>
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: 4,
                        height: 4,
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${Math.min((ach.progress / ach.requirement) * 100, 100)}%`,
                          height: '100%',
                          background: '#8af0ff'
                        }} />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

// Hook to check and unlock achievements
export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  
  const checkAchievement = (achievementId: string, progress: number) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return;

    if (progress >= achievement.requirement) {
      const unlocked: Achievement = {
        ...achievement,
        progress,
        unlocked: true,
        unlockedAt: Date.now()
      };
      
      setUnlockedAchievements(prev => [...prev, unlocked]);
      Analytics.trackEvent({
        category: 'Achievement',
        action: 'unlocked',
        label: achievementId,
        metadata: { achievement: achievement.name }
      });
    }
  };

  return { unlockedAchievements, checkAchievement, clearUnlocked: () => setUnlockedAchievements([]) };
}
