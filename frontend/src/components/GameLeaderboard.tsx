/**
 * Game-Specific Leaderboard
 * Shows rankings for individual games
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
  duration?: number;
  accuracy?: number;
  completedAt?: string;
  isCurrentUser?: boolean;
}

interface GameLeaderboardProps {
  gameId: string;
  gameName: string;
}

export function GameLeaderboard({ gameId, gameName }: GameLeaderboardProps) {
  const wallet = useWallet();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  // Fetch game-specific leaderboard
  useEffect(() => {
    console.log(`🎮 GameLeaderboard component mounted for: ${gameName}`);
    
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        const url = `${apiBase}/leaderboard/game/${encodeURIComponent(gameName)}?limit=50`;
        console.log(`🔍 Fetching game leaderboard from: ${url}`);
        
        const response = await fetch(url);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📊 ${gameName} leaderboard response:`, data);
          
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
            
            console.log(`✅ ${gameName} leaderboard loaded: ${data.leaderboard.length} players`);
          } else {
            // No data yet
            console.warn(`⚠️ ${gameName} leaderboard: No data available`);
            setLeaderboard([]);
          }
        } else {
          console.error(`❌ ${gameName} leaderboard fetch failed:`, response.status);
          setLeaderboard([]);
        }
      } catch (error) {
        console.error('Leaderboard fetch error:', error);
        setLeaderboard([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, [gameName, wallet.publicKey]);

  // Format wallet address
  const formatWallet = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Format duration
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  console.log(`🎨 Rendering GameLeaderboard for ${gameName}, loading: ${loading}, entries: ${leaderboard.length}`);
  
  return (
    <div style={{
      background: 'rgba(0, 255, 136, 0.05)',
      border: '2px solid rgba(0, 255, 136, 0.5)', // More visible for debugging
      borderRadius: 12,
      padding: 20,
      marginTop: 20
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <div>
          <h3 style={{ 
            color: '#00ff88',
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            marginBottom: 4
          }}>
            🏆 {gameName} Leaderboard
          </h3>
          <p style={{ 
            color: '#8af0ff',
            fontSize: 12,
            margin: 0,
            opacity: 0.8
          }}>
            Top players for this game
          </p>
        </div>
        
        {wallet.connected && userRank && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.15), rgba(0, 204, 106, 0.15))',
            border: '1px solid #00ff88',
            borderRadius: 8,
            padding: '8px 16px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 10, color: '#8af0ff', marginBottom: 2 }}>Your Rank</div>
            <div style={{ fontSize: 20, color: '#00ff88', fontWeight: 700 }}>#{userRank}</div>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'rgba(0, 255, 136, 0.03)',
        border: '1px solid rgba(0, 255, 136, 0.15)',
        borderRadius: 8,
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 1fr 100px 80px',
          gap: 12,
          padding: '10px 14px',
          background: 'rgba(0, 255, 136, 0.08)',
          borderBottom: '1px solid rgba(0, 255, 136, 0.15)',
          fontSize: 10,
          fontWeight: 700,
          color: '#8af0ff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          <div>Rank</div>
          <div>Player</div>
          <div style={{ textAlign: 'right' }}>Score</div>
          <div style={{ textAlign: 'right' }}>Time</div>
        </div>

        {/* Table Rows */}
        {loading ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#8af0ff', fontSize: 12 }}>
            Loading...
          </div>
        ) : leaderboard.length === 0 ? (
          <div style={{ padding: 30, textAlign: 'center', color: '#8af0ff', fontSize: 12 }}>
            No scores yet. Be the first! 🎮
          </div>
        ) : (
          leaderboard.slice(0, 10).map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '40px 1fr 100px 80px',
                gap: 12,
                padding: '12px 14px',
                borderBottom: index < Math.min(leaderboard.length, 10) - 1 ? '1px solid rgba(0, 255, 136, 0.08)' : 'none',
                background: entry.isCurrentUser ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                fontSize: 12,
                transition: 'background 0.2s'
              }}
            >
              {/* Rank */}
              <div style={{
                fontWeight: 700,
                color: entry.rank === 1 ? '#FFD700' : 
                       entry.rank === 2 ? '#C0C0C0' : 
                       entry.rank === 3 ? '#CD7F32' : '#00ff88',
                fontSize: entry.rank <= 3 ? 14 : 12
              }}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </div>

              {/* Player */}
              <div style={{ 
                color: entry.isCurrentUser ? '#00ff88' : '#fff',
                fontWeight: entry.isCurrentUser ? 600 : 400,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {entry.username || formatWallet(entry.address || entry.wallet)}
                </span>
                {entry.isCurrentUser && <span style={{ opacity: 0.7 }}>👤</span>}
              </div>

              {/* Score */}
              <div style={{ 
                textAlign: 'right', 
                fontWeight: 700,
                color: '#00ff88',
                fontFamily: 'monospace'
              }}>
                {entry.score.toLocaleString()}
              </div>

              {/* Duration */}
              <div style={{ 
                textAlign: 'right',
                fontSize: 11,
                color: '#8af0ff',
                opacity: 0.8
              }}>
                {formatDuration(entry.duration)}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer */}
      {leaderboard.length > 10 && (
        <div style={{
          textAlign: 'center',
          marginTop: 12,
          color: '#8af0ff',
          fontSize: 11,
          opacity: 0.7
        }}>
          Showing top 10 of {leaderboard.length} players
        </div>
      )}
    </div>
  );
}
