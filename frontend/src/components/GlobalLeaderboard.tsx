/**
 * Global Leaderboard - Real-time rankings for all games
 * WORLD-CLASS feature for user engagement and retention
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface LeaderboardEntry {
  rank: number;
  wallet: string;
  address?: string;
  username?: string;
  score: number;
  totalScore?: number;
  gamesPlayed?: number;
  streak?: number;
  game?: string;
  timestamp?: number;
  lastActive?: string;
  isCurrentUser?: boolean;
}

interface GlobalLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalLeaderboard({ isOpen, onClose }: GlobalLeaderboardProps) {
  const wallet = useWallet();
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'alltime'>('daily');
  const [selectedGame, setSelectedGame] = useState<'all' | 'contra' | 'space-invaders' | 'pacman'>('all');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Fetch leaderboard data
  useEffect(() => {
    if (!isOpen) return;

    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        const response = await fetch(
          `${apiBase}/leaderboard/global?limit=100`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Global leaderboard response:', data);
          
          if (data.success && data.leaderboard && data.leaderboard.length > 0) {
            // Mark current user
            const leaderboardWithUser = data.leaderboard.map((entry: LeaderboardEntry) => ({
              ...entry,
              isCurrentUser: wallet.publicKey && entry.wallet === wallet.publicKey.toBase58()
            }));
            setLeaderboard(leaderboardWithUser);
            
            // Find user rank
            const currentUserEntry = leaderboardWithUser.find((e: LeaderboardEntry) => e.isCurrentUser);
            setUserRank(currentUserEntry ? currentUserEntry.rank : null);
            
            console.log(`✅ Global leaderboard loaded: ${data.leaderboard.length} players`);
          } else {
            // Fallback to mock data if no data yet
            console.warn('⚠️ No leaderboard data available (empty array), using mock data');
            setLeaderboard(generateMockLeaderboard());
          }
        } else {
          // Mock data for demo
          console.error('❌ Leaderboard fetch failed:', response.status, response.statusText);
          setLeaderboard(generateMockLeaderboard());
        }
      } catch (error) {
        console.error('Leaderboard fetch error:', error);
        setLeaderboard(generateMockLeaderboard());
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [isOpen, timeframe, selectedGame, wallet.publicKey]);

  // Generate mock leaderboard for demo
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const games = ['Contra', 'Space Invaders', 'Pac-Man'];
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      wallet: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      username: `Player${i + 1}`,
      score: Math.floor(Math.random() * 100000) + 10000,
      game: games[Math.floor(Math.random() * games.length)],
      timestamp: Date.now() - Math.random() * 86400000,
      isCurrentUser: wallet.connected && i === 4 // Highlight current user
    }));
  };

  // Format wallet address
  const formatWallet = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
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
              border: '2px solid #00ff88',
              borderRadius: 20,
              padding: 28,
              maxWidth: 700,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              marginBottom: 24 
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#00ff88', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
                  🏆 Global Leaderboard
                </h2>
                <div style={{ fontSize: 13, color: '#8af0ff', opacity: 0.9 }}>
                  Compete with players worldwide • Real-time rankings
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: 32,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div style={{ 
              display: 'flex', 
              gap: 12, 
              marginBottom: 20,
              flexWrap: 'wrap'
            }}>
              {/* Timeframe */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', color: '#8af0ff', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
                  Timeframe
                </label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {(['daily', 'weekly', 'alltime'] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: timeframe === tf ? '#00ff88' : 'rgba(0, 255, 136, 0.1)',
                        color: timeframe === tf ? '#000' : '#00ff88',
                        border: `1px solid ${timeframe === tf ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tf === 'alltime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Filter */}
              <div style={{ flex: 1, minWidth: 200 }}>
                <label style={{ display: 'block', color: '#8af0ff', fontSize: 12, marginBottom: 6, fontWeight: 600 }}>
                  Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    color: '#00ff88',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Games</option>
                  <option value="contra">Contra</option>
                  <option value="space-invaders">Space Invaders</option>
                  <option value="pacman">Pac-Man</option>
                </select>
              </div>
            </div>

            {/* User's Rank (if logged in) */}
            {wallet.connected && userRank && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 106, 0.15))',
                border: '1.5px solid #00ff88',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 13, color: '#8af0ff', marginBottom: 4 }}>Your Rank</div>
                <div style={{ fontSize: 32, color: '#00ff88', fontWeight: 700 }}>#{userRank}</div>
                <div style={{ fontSize: 12, color: '#fff', opacity: 0.8, marginTop: 4 }}>
                  Keep playing to climb the ranks! 🚀
                </div>
              </div>
            )}

            {/* Leaderboard Table */}
            <div style={{
              background: 'rgba(0, 255, 136, 0.05)',
              border: '1px solid rgba(0, 255, 136, 0.2)',
              borderRadius: 12,
              overflow: 'hidden'
            }}>
              {/* Table Header */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '50px 1fr 80px 100px 80px',
                gap: 12,
                padding: '12px 16px',
                background: 'rgba(0, 255, 136, 0.1)',
                borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                fontSize: 11,
                fontWeight: 700,
                color: '#8af0ff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <div>Rank</div>
                <div>Player</div>
                <div style={{ textAlign: 'center' }}>Games</div>
                <div style={{ textAlign: 'right' }}>High Score</div>
                <div style={{ textAlign: 'center' }}>Streak</div>
              </div>

              {/* Table Rows */}
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#8af0ff' }}>
                  Loading rankings...
                </div>
              ) : leaderboard.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#8af0ff' }}>
                  No entries yet. Be the first! 🎮
                </div>
              ) : (
                leaderboard.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 1fr 80px 100px 80px',
                      gap: 12,
                      padding: '14px 16px',
                      borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(0, 255, 136, 0.1)' : 'none',
                      background: entry.isCurrentUser ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                      fontSize: 13,
                      transition: 'background 0.2s'
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      fontWeight: 700,
                      color: entry.rank === 1 ? '#FFD700' : 
                             entry.rank === 2 ? '#C0C0C0' : 
                             entry.rank === 3 ? '#CD7F32' : '#00ff88',
                      fontSize: entry.rank <= 3 ? 16 : 14
                    }}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                    </div>

                    {/* Player */}
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      color: entry.isCurrentUser ? '#00ff88' : '#fff'
                    }}>
                      <div style={{ fontWeight: 600 }}>
                        {entry.username || formatWallet(entry.address || entry.wallet)}
                        {entry.isCurrentUser && <span style={{ marginLeft: 6, opacity: 0.7 }}>👤</span>}
                      </div>
                      <div style={{ fontSize: 10, opacity: 0.6, marginTop: 2 }}>
                        {formatWallet(entry.address || entry.wallet)}
                      </div>
                    </div>

                    {/* Games Played */}
                    <div style={{ 
                      textAlign: 'center',
                      color: '#8af0ff', 
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {entry.gamesPlayed || 0}
                    </div>

                    {/* High Score */}
                    <div style={{ 
                      textAlign: 'right', 
                      fontWeight: 700,
                      color: '#00ff88',
                      fontFamily: 'monospace'
                    }}>
                      {entry.score.toLocaleString()}
                    </div>

                    {/* Streak */}
                    <div style={{ 
                      textAlign: 'center',
                      fontSize: 13,
                      color: '#FFD700',
                      fontWeight: 600
                    }}>
                      {entry.streak ? `🔥 ${entry.streak}` : '-'}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: 20,
              padding: 16,
              background: 'rgba(0, 255, 136, 0.05)',
              borderRadius: 12,
              fontSize: 12,
              color: '#8af0ff'
            }}>
              <div style={{ marginBottom: 6, fontWeight: 600 }}>
                🎮 Play more games to climb the ranks!
              </div>
              <div style={{ opacity: 0.8 }}>
                Rankings update every 30 seconds • Top players win prizes
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
