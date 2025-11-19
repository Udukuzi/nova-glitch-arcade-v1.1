/**
 * Tournament System - Scheduled Competitive Events
 * Weekly/Daily tournaments with prize pools
 * Live leaderboards, registration, and countdown timers
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface Tournament {
  id: string;
  name: string;
  game: string;
  startTime: Date;
  endTime: Date;
  status: 'upcoming' | 'live' | 'completed';
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants?: number;
  prizes: {
    place: number;
    amount: number;
    percentage: number;
  }[];
}

interface TournamentEntry {
  rank: number;
  wallet: string;
  username?: string;
  score: number;
  timestamp: string;
  isCurrentUser?: boolean;
}

interface TournamentSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onJoinTournament?: (tournamentId: string) => void;
}

export function TournamentSystem({ isOpen, onClose, onJoinTournament }: TournamentSystemProps) {
  const wallet = useWallet();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [leaderboard, setLeaderboard] = useState<TournamentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past'>('active');

  // Load tournaments
  useEffect(() => {
    if (!isOpen) return;

    const loadTournaments = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        console.log('🏆 Fetching tournaments...');
        const response = await fetch(`${apiBase}/tournaments?limit=50`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Tournaments data:', data);
          
          if (data.success && data.tournaments) {
            // Map backend data to frontend format
            const mappedTournaments = data.tournaments.map((t: any) => ({
              id: t.id,
              name: t.name,
              game: t.game_name,
              startTime: new Date(t.start_time),
              endTime: new Date(t.end_time),
              status: t.status === 'active' ? 'live' : t.status, // Map 'active' to 'live'
              entryFee: parseFloat(t.entry_fee || 0),
              prizePool: parseFloat(t.prize_pool || 0),
              participants: t.current_participants || 0,
              maxParticipants: t.max_participants,
              prizes: Object.entries(t.prize_distribution || {}).map(([place, percentage]) => ({
                place: parseInt(place.replace(/[^0-9]/g, '')),
                percentage: Number(percentage),
                amount: (parseFloat(t.prize_pool || 0) * Number(percentage)) / 100
              }))
            }));
            setTournaments(mappedTournaments);
            console.log('✅ Tournaments loaded:', mappedTournaments.length);
          } else {
            console.warn('⚠️ No tournaments, using mock');
            setTournaments(generateMockTournaments());
          }
        } else {
          console.error('❌ Tournament fetch failed:', response.status);
          setTournaments(generateMockTournaments());
        }
      } catch (error) {
        console.error('❌ Tournament error:', error);
        setTournaments(generateMockTournaments());
      } finally {
        setLoading(false);
      }
    };

    loadTournaments();
    const interval = setInterval(loadTournaments, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [isOpen]);

  // Load tournament leaderboard
  useEffect(() => {
    if (!selectedTournament) return;

    const loadLeaderboard = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        console.log('🏆 Fetching leaderboard for:', selectedTournament.id);
        const response = await fetch(`${apiBase}/tournaments/${selectedTournament.id}/leaderboard`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Leaderboard data:', data);
          
          if (data.success && data.leaderboard) {
            // Map backend data to frontend format
            const mappedLeaderboard = data.leaderboard.map((entry: any) => ({
              rank: entry.rank,
              wallet: entry.wallet,
              username: entry.username,
              score: entry.score,
              timestamp: new Date().toISOString(), // Use current time as placeholder
              isCurrentUser: wallet.connected && entry.wallet === wallet.publicKey?.toBase58()
            }));
            setLeaderboard(mappedLeaderboard);
            console.log('✅ Leaderboard loaded:', mappedLeaderboard.length, 'entries');
          } else {
            console.warn('⚠️ No leaderboard data, using mock');
            setLeaderboard(generateMockLeaderboard());
          }
        } else {
          console.error('❌ Leaderboard fetch failed:', response.status);
          setLeaderboard(generateMockLeaderboard());
        }
      } catch (error) {
        console.error('❌ Leaderboard error:', error);
        setLeaderboard(generateMockLeaderboard());
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 10000); // Refresh every 10s during tournament
    return () => clearInterval(interval);
  }, [selectedTournament]);

  const generateMockTournaments = (): Tournament[] => {
    const now = new Date();
    return [
      {
        id: 'weekly_contra_1',
        name: 'Weekly Contra Championship',
        game: 'Contra',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 5 * 60 * 60 * 1000),
        status: 'live',
        entryFee: 1000,
        prizePool: 50000,
        participants: 127,
        maxParticipants: 200,
        prizes: [
          { place: 1, amount: 25000, percentage: 50 },
          { place: 2, amount: 12500, percentage: 25 },
          { place: 3, amount: 7500, percentage: 15 },
          { place: 4, amount: 5000, percentage: 10 }
        ]
      },
      {
        id: 'daily_invaders_1',
        name: 'Daily Space Invaders Rush',
        game: 'Space Invaders',
        startTime: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 6 * 60 * 60 * 1000),
        status: 'upcoming',
        entryFee: 500,
        prizePool: 15000,
        participants: 0,
        maxParticipants: 100,
        prizes: [
          { place: 1, amount: 7500, percentage: 50 },
          { place: 2, amount: 4500, percentage: 30 },
          { place: 3, amount: 3000, percentage: 20 }
        ]
      },
      {
        id: 'mega_tournament_1',
        name: '🏆 Mega Tournament - All Games',
        game: 'All Games',
        startTime: new Date(now.getTime() + 24 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 48 * 60 * 60 * 1000),
        status: 'upcoming',
        entryFee: 5000,
        prizePool: 500000,
        participants: 45,
        maxParticipants: 500,
        prizes: [
          { place: 1, amount: 250000, percentage: 50 },
          { place: 2, amount: 125000, percentage: 25 },
          { place: 3, amount: 75000, percentage: 15 },
          { place: 4, amount: 25000, percentage: 5 },
          { place: 5, amount: 25000, percentage: 5 }
        ]
      }
    ];
  };

  const generateMockLeaderboard = (): TournamentEntry[] => {
    return Array.from({ length: 20 }, (_, i) => ({
      rank: i + 1,
      wallet: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      username: `Player${i + 1}`,
      score: Math.floor(Math.random() * 200000) + 50000,
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      isCurrentUser: wallet.connected && i === 7
    }));
  };

  const getTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getTimeUntilStart = (startTime: Date) => {
    const now = new Date();
    const diff = startTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Starting now!';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Starts in ${days}d ${hours % 24}h`;
    }
    
    return `Starts in ${hours}h ${minutes}m`;
  };

  const handleJoinTournament = async (tournament: Tournament) => {
    if (!wallet.connected) {
      alert('Please connect your wallet to join tournaments!');
      return;
    }

    try {
      Analytics.trackEvent({
        category: 'Tournament',
        action: 'join',
        label: tournament.name
      });

      onJoinTournament?.(tournament.id);
      setSelectedTournament(tournament);
    } catch (error) {
      console.error('Failed to join tournament:', error);
    }
  };

  const filteredTournaments = tournaments.filter(t => {
    if (activeTab === 'active') return t.status === 'live';
    if (activeTab === 'upcoming') return t.status === 'upcoming';
    if (activeTab === 'past') return t.status === 'completed';
    return true;
  });

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
              border: '2px solid #ff6b35',
              borderRadius: 20,
              padding: 28,
              maxWidth: selectedTournament ? 900 : 800,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(255, 107, 53, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#ff6b35', fontSize: 28, fontWeight: 700 }}>
                  🏆 Tournaments
                </h2>
                <div style={{ fontSize: 13, color: '#ffd700', marginTop: 4 }}>
                  Compete for massive prize pools!
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                {selectedTournament && (
                  <button
                    onClick={() => setSelectedTournament(null)}
                    style={{
                      padding: '8px 16px',
                      background: 'rgba(255, 107, 53, 0.15)',
                      color: '#ff6b35',
                      border: '1.5px solid rgba(255, 107, 53, 0.3)',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    ← Back
                  </button>
                )}
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
            </div>

            {!selectedTournament ? (
              <>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {(['active', 'upcoming', 'past'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        flex: 1,
                        padding: '12px 20px',
                        background: activeTab === tab ? '#ff6b35' : 'rgba(255, 107, 53, 0.1)',
                        color: activeTab === tab ? '#000' : '#ff6b35',
                        border: `1.5px solid ${activeTab === tab ? '#ff6b35' : 'rgba(255, 107, 53, 0.3)'}`,
                        borderRadius: 10,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textTransform: 'capitalize',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tab === 'active' && '🔴 '}
                      {tab}
                      {tab === 'active' && ` (${filteredTournaments.length})`}
                    </button>
                  ))}
                </div>

                {/* Tournament List */}
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#ffd700' }}>
                    Loading tournaments...
                  </div>
                ) : filteredTournaments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                    No {activeTab} tournaments
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {filteredTournaments.map((tournament, index) => (
                      <motion.div
                        key={tournament.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        style={{
                          background: tournament.status === 'live' 
                            ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(255, 107, 53, 0.05))'
                            : 'rgba(255, 107, 53, 0.05)',
                          border: `2px solid ${tournament.status === 'live' ? '#ff6b35' : 'rgba(255, 107, 53, 0.2)'}`,
                          borderRadius: 12,
                          padding: 20,
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => setSelectedTournament(tournament)}
                        whileHover={{ scale: 1.02, boxShadow: '0 8px 24px rgba(255, 107, 53, 0.3)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' }}>
                              {tournament.name}
                            </h3>
                            <div style={{ fontSize: 13, color: '#ffd700', marginTop: 4 }}>
                              {tournament.game} • Entry: {tournament.entryFee.toLocaleString()} NAG
                            </div>
                          </div>
                          {tournament.status === 'live' && (
                            <span style={{
                              padding: '4px 12px',
                              background: '#ff0000',
                              color: '#fff',
                              borderRadius: 20,
                              fontSize: 11,
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              height: 'fit-content'
                            }}>
                              <span style={{ animation: 'pulse 2s infinite' }}>●</span> LIVE
                            </span>
                          )}
                        </div>

                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                          gap: 12,
                          marginBottom: 12
                        }}>
                          <div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Prize Pool</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#ffd700' }}>
                              {tournament.prizePool.toLocaleString()} NAG
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Participants</div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#ff6b35' }}>
                              {tournament.participants}{tournament.maxParticipants ? `/${tournament.maxParticipants}` : ''}
                            </div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                              {tournament.status === 'live' ? 'Ends In' : 'Starts In'}
                            </div>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#fff' }}>
                              {tournament.status === 'live' 
                                ? getTimeRemaining(tournament.endTime)
                                : getTimeUntilStart(tournament.startTime)
                              }
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinTournament(tournament);
                          }}
                          style={{
                            width: '100%',
                            padding: '10px',
                            background: tournament.status === 'live' 
                              ? 'linear-gradient(135deg, #ff6b35, #ff4500)'
                              : 'rgba(255, 107, 53, 0.2)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          disabled={tournament.status === 'completed'}
                        >
                          {tournament.status === 'live' ? '⚔️ Join Battle' : '📋 View Details'}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Tournament Detail View */
              <div>
                <div style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  border: '2px solid #ff6b35',
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 20
                }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 700 }}>
                    Prize Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {selectedTournament.prizes.map((prize) => (
                      <div
                        key={prize.place}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: prize.place === 1 ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          borderRadius: 8,
                          fontSize: 14
                        }}
                      >
                        <span style={{
                          fontWeight: 600,
                          color: prize.place === 1 ? '#FFD700' : 
                                 prize.place === 2 ? '#C0C0C0' : 
                                 prize.place === 3 ? '#CD7F32' : '#fff'
                        }}>
                          {prize.place <= 3 ? ['🥇', '🥈', '🥉'][prize.place - 1] : `#${prize.place}`} Place
                        </span>
                        <span style={{ fontWeight: 700, color: '#ffd700' }}>
                          {prize.amount.toLocaleString()} NAG ({prize.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Leaderboard */}
                <div>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 700 }}>
                    🏆 Live Leaderboard
                  </h3>
                  <div style={{
                    background: 'rgba(255, 107, 53, 0.05)',
                    border: '1px solid rgba(255, 107, 53, 0.2)',
                    borderRadius: 12,
                    overflow: 'hidden'
                  }}>
                    {leaderboard.map((entry, index) => (
                      <div
                        key={index}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '50px 1fr 120px',
                          gap: 12,
                          padding: '12px 16px',
                          borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(255, 107, 53, 0.1)' : 'none',
                          background: entry.isCurrentUser ? 'rgba(255, 107, 53, 0.15)' : 'transparent',
                          fontSize: 13
                        }}
                      >
                        <div style={{
                          fontWeight: 700,
                          color: entry.rank === 1 ? '#FFD700' : 
                                 entry.rank === 2 ? '#C0C0C0' : 
                                 entry.rank === 3 ? '#CD7F32' : '#ff6b35'
                        }}>
                          {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                        </div>
                        <div style={{ color: entry.isCurrentUser ? '#ff6b35' : '#fff', fontWeight: entry.isCurrentUser ? 600 : 400 }}>
                          {entry.username || entry.wallet}
                          {entry.isCurrentUser && <span style={{ marginLeft: 6, opacity: 0.7 }}>👤</span>}
                        </div>
                        <div style={{ textAlign: 'right', color: '#ffd700', fontWeight: 700, fontFamily: 'monospace' }}>
                          {entry.score.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
