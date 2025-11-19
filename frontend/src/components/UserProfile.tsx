/**
 * User Profile - Personal Stats & Achievement Dashboard
 * View complete gaming history, badges, stats, and progress
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface UserStats {
  wallet: string;
  username?: string;
  gamesPlayed: number;
  totalScore: number;
  highestScore: number;
  currentStreak: number;
  longestStreak: number;
  swapCount: number;
  totalSwapVolume: number;
  shareCount: number;
  totalPlayTime: number;
  nagBalance: number;
  rank?: number;
  joinedAt: string;
  lastActive: string;
}

interface UserAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  reward: number;
}

interface GameHistory {
  game: string;
  score: number;
  rank: number;
  playedAt: string;
  duration: number;
}

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  targetWallet?: string; // Optional: view other users' profiles
}

export function UserProfile({ isOpen, onClose, targetWallet }: UserProfileProps) {
  const wallet = useWallet();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history'>('overview');

  const displayWallet = targetWallet || wallet.publicKey?.toBase58();
  const isOwnProfile = !targetWallet || (wallet.connected && wallet.publicKey?.toBase58() === targetWallet);

  // Load user data
  useEffect(() => {
    if (!isOpen || !displayWallet) return;

    const loadUserData = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        
        // Load complete profile from new unified endpoint
        const profileResponse = await fetch(`${apiBase}/profile/${displayWallet}`);
        
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          console.log('📊 Profile response:', data);
          
          if (data.success && data.profile) {
            // Map profile data to component state
            setStats({
              wallet: data.profile.wallet,
              username: data.profile.displayName,
              gamesPlayed: data.profile.stats.gamesPlayed,
              totalScore: data.profile.stats.totalScore,
              highestScore: data.profile.stats.highestScore,
              currentStreak: data.profile.stats.currentStreak,
              longestStreak: data.profile.stats.longestStreak,
              swapCount: 0,
              totalSwapVolume: 0,
              shareCount: 0,
              totalPlayTime: 0,
              nagBalance: 0,
              rank: data.profile.rankings.global,
              joinedAt: data.profile.stats.joinedAt,
              lastActive: data.profile.stats.lastActive,
            });

            // Map achievements
            console.log('🏆 Raw achievements from API:', data.profile.achievements.all);
            const mappedAchievements = data.profile.achievements.all.map((ach: any) => {
              const mapped = {
                id: ach.achievement_id || ach.id,
                name: ach.name || 'Unknown Achievement',
                description: ach.description || 'No description',
                icon: '🏆',
                progress: ach.progress || 0,
                target: ach.requirement || 1,
                unlocked: ach.unlocked || false,
                unlockedAt: ach.unlocked_at,
                reward: ach.reward?.value || 0,
              };
              console.log(`Mapped achievement: ${mapped.name}`, mapped);
              return mapped;
            });
            setAchievements(mappedAchievements);
            console.log('✅ Total achievements mapped:', mappedAchievements.length);

            // Map game history
            const mappedHistory = data.profile.gameHistory.recent.map((game: any, index: number) => ({
              game: game.game_name,
              score: game.score,
              rank: index + 1,
              playedAt: game.completed_at,
              duration: game.duration || 0,
            }));
            setGameHistory(mappedHistory);

            console.log('✅ User profile loaded successfully');
          } else {
            console.warn('⚠️ Profile not found, using mock data');
            setStats(generateMockStats());
            setAchievements(generateMockAchievements());
            setGameHistory(generateMockHistory());
          }
        } else {
          console.error('❌ Profile API failed, using mock data');
          setStats(generateMockStats());
          setAchievements(generateMockAchievements());
          setGameHistory(generateMockHistory());
        }

      } catch (error) {
        console.error('❌ Profile load error:', error);
        setStats(generateMockStats());
        setAchievements(generateMockAchievements());
        setGameHistory(generateMockHistory());
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
    
    // Track profile view (optional analytics)
    if (isOwnProfile && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'profile_view', {
        event_category: 'Profile',
        event_label: 'own_profile'
      });
    }
  }, [isOpen, displayWallet, isOwnProfile]);

  const generateMockStats = (): UserStats => {
    return {
      wallet: displayWallet || '',
      username: isOwnProfile ? 'You' : 'Player',
      gamesPlayed: Math.floor(Math.random() * 500) + 50,
      totalScore: Math.floor(Math.random() * 10000000) + 500000,
      highestScore: Math.floor(Math.random() * 500000) + 100000,
      currentStreak: Math.floor(Math.random() * 10),
      longestStreak: Math.floor(Math.random() * 20) + 5,
      swapCount: Math.floor(Math.random() * 100) + 10,
      totalSwapVolume: Math.floor(Math.random() * 50000) + 5000,
      shareCount: Math.floor(Math.random() * 50) + 5,
      totalPlayTime: Math.floor(Math.random() * 100000) + 10000,
      nagBalance: Math.floor(Math.random() * 1000000) + 50000,
      rank: Math.floor(Math.random() * 1000) + 1,
      joinedAt: '2024-10-01T00:00:00Z',
      lastActive: new Date().toISOString()
    };
  };

  const generateMockAchievements = (): UserAchievement[] => {
    const achievements = [
      { id: 'first_blood', name: 'First Blood', icon: '🎮', target: 1, reward: 100 },
      { id: 'centurion', name: 'Centurion', icon: '💯', target: 100000, reward: 1000 },
      { id: 'hot_streak', name: 'Hot Streak', icon: '🔥', target: 5, reward: 500 },
      { id: 'social_butterfly', name: 'Social Butterfly', icon: '🦋', target: 10, reward: 250 },
      { id: 'whale_tier', name: 'Whale Tier', icon: '🐋', target: 1000000, reward: 5000 },
      { id: 'swap_master', name: 'Swap Master', icon: '🔄', target: 50, reward: 500 }
    ];

    return achievements.map(ach => ({
      ...ach,
      description: `Complete ${ach.target} ${ach.name}`,
      progress: Math.floor(Math.random() * ach.target * 1.5),
      unlocked: Math.random() > 0.5,
      unlockedAt: Math.random() > 0.5 ? new Date().toISOString() : undefined
    }));
  };

  const generateMockHistory = (): GameHistory[] => {
    const games = ['Contra', 'Space Invaders', 'Pac-Man'];
    return Array.from({ length: 10 }, (_, i) => ({
      game: games[Math.floor(Math.random() * games.length)],
      score: Math.floor(Math.random() * 200000) + 10000,
      rank: Math.floor(Math.random() * 100) + 1,
      playedAt: new Date(Date.now() - i * 3600000).toISOString(),
      duration: Math.floor(Math.random() * 600) + 60
    }));
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

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
              border: '2px solid #8b5cf6',
              borderRadius: 20,
              padding: 28,
              maxWidth: 900,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(139, 92, 246, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#8b5cf6', fontSize: 28, fontWeight: 700 }}>
                  👤 {isOwnProfile ? 'Your Profile' : 'Player Profile'}
                </h2>
                <div style={{ fontSize: 12, color: '#a78bfa', marginTop: 4, fontFamily: 'monospace' }}>
                  {displayWallet?.substring(0, 8)}...{displayWallet?.substring(displayWallet.length - 6)}
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

            {loading ? (
              <div style={{ textAlign: 'center', padding: 60, color: '#a78bfa' }}>
                Loading profile...
              </div>
            ) : (
              <>
                {/* Profile Header Card */}
                {stats && (
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))',
                    border: '2px solid #8b5cf6',
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 20
                  }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: 16
                    }}>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>Rank</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#ffd700' }}>
                          #{stats.rank || '???'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>Games Played</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                          {stats.gamesPlayed.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>Highest Score</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#00ff88' }}>
                          {stats.highestScore.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>Play Time</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#8b5cf6' }}>
                          {formatDuration(stats.totalPlayTime)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>Win Streak</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#ff6b35' }}>
                          {stats.currentStreak} 🔥
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>NAG Balance</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffd700' }}>
                          {stats.nagBalance.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                  {(['overview', 'achievements', 'history'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: activeTab === tab ? '#8b5cf6' : 'rgba(139, 92, 246, 0.1)',
                        color: activeTab === tab ? '#000' : '#8b5cf6',
                        border: `1.5px solid ${activeTab === tab ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}`,
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && stats && (
                  <div style={{ display: 'grid', gap: 16 }}>
                    {/* Additional Stats */}
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 12,
                      padding: 16
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>Statistics</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Total Score:</span>
                          <span style={{ fontWeight: 600 }}>{stats.totalScore.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Longest Streak:</span>
                          <span style={{ fontWeight: 600 }}>{stats.longestStreak} wins</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Swaps Made:</span>
                          <span style={{ fontWeight: 600 }}>{stats.swapCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Swap Volume:</span>
                          <span style={{ fontWeight: 600 }}>${stats.totalSwapVolume.toLocaleString()}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Social Shares:</span>
                          <span style={{ fontWeight: 600 }}>{stats.shareCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#a78bfa' }}>Member Since:</span>
                          <span style={{ fontWeight: 600 }}>{new Date(stats.joinedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Achievements */}
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.05)',
                      border: '1px solid rgba(139, 92, 246, 0.2)',
                      borderRadius: 12,
                      padding: 16
                    }}>
                      <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 700 }}>
                        Recent Achievements ({achievements.filter(a => a.unlocked).length}/{achievements.length})
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
                        {achievements.filter(a => a.unlocked).slice(0, 6).map((ach) => (
                          <div
                            key={ach.id}
                            style={{
                              textAlign: 'center',
                              padding: 12,
                              background: 'rgba(139, 92, 246, 0.1)',
                              borderRadius: 8,
                              border: '1px solid rgba(139, 92, 246, 0.3)'
                            }}
                          >
                            <div style={{ fontSize: 32, marginBottom: 4 }}>{ach.icon}</div>
                            <div style={{ fontSize: 11, fontWeight: 600 }}>{ach.name}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <div style={{ display: 'grid', gap: 12 }}>
                    {achievements.map((ach) => (
                      <div
                        key={ach.id}
                        style={{
                          background: ach.unlocked 
                            ? 'rgba(139, 92, 246, 0.1)' 
                            : 'rgba(139, 92, 246, 0.03)',
                          border: `2px solid ${ach.unlocked ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)'}`,
                          borderRadius: 12,
                          padding: 16,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 16,
                          opacity: ach.unlocked ? 1 : 0.6
                        }}
                      >
                        <div style={{ fontSize: 48 }}>{ach.icon}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
                            {ach.name} {ach.unlocked && '✓'}
                          </div>
                          <div style={{ fontSize: 13, color: '#a78bfa', marginBottom: 8 }}>
                            {ach.description}
                          </div>
                          <div style={{
                            height: 8,
                            background: 'rgba(139, 92, 246, 0.2)',
                            borderRadius: 4,
                            overflow: 'hidden'
                          }}>
                            <div style={{
                              height: '100%',
                              width: `${Math.min((ach.progress / ach.target) * 100, 100)}%`,
                              background: ach.unlocked ? '#00ff88' : '#8b5cf6',
                              transition: 'width 0.3s'
                            }} />
                          </div>
                          <div style={{ fontSize: 11, color: '#a78bfa', marginTop: 4 }}>
                            {ach.progress.toLocaleString()} / {ach.target.toLocaleString()}
                            {ach.unlocked && ach.unlockedAt && ` • Unlocked ${formatDate(ach.unlockedAt)}`}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, color: '#ffd700', marginBottom: 2 }}>Reward</div>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#ffd700' }}>
                            {ach.reward} NAG
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* History Tab */}
                {activeTab === 'history' && (
                  <div style={{
                    background: 'rgba(139, 92, 246, 0.05)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}>
                    {gameHistory.map((game, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '140px 1fr 100px 100px 120px',
                          gap: 12,
                          padding: '12px 16px',
                          borderBottom: index < gameHistory.length - 1 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
                          fontSize: 13,
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ fontWeight: 600 }}>{game.game}</div>
                        <div style={{ color: '#00ff88', fontWeight: 700, fontFamily: 'monospace' }}>
                          {game.score.toLocaleString()}
                        </div>
                        <div style={{ color: '#a78bfa' }}>#{game.rank}</div>
                        <div style={{ color: '#a78bfa' }}>{formatDuration(game.duration)}</div>
                        <div style={{ color: '#999', textAlign: 'right' }}>{formatDate(game.playedAt)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
