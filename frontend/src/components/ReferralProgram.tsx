/**
 * Referral Program - Viral Growth Engine
 * Users earn 10% of their referrals' fees forever
 * Includes dashboard, leaderboard, and social sharing
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  monthlyEarnings: number;
  rank: number | null;
  referralLink: string;
}

interface ReferralLeaderboardEntry {
  rank: number;
  wallet: string;
  username?: string;
  referrals: number;
  earnings: number;
  isCurrentUser?: boolean;
}

interface ReferralProgramProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralProgram({ isOpen, onClose }: ReferralProgramProps) {
  const wallet = useWallet();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leaderboard'>('dashboard');

  // Load user's referral stats
  useEffect(() => {
    if (!isOpen || !wallet.connected) return;

    const loadStats = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        const walletAddress = wallet.publicKey?.toBase58();
        
        console.log('🎁 Fetching referral data for:', walletAddress);
        const response = await fetch(`${apiBase}/referral/${walletAddress}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Referral data received:', data);
          
          if (data.success) {
            const referralLink = `https://novarcadeglitch.dev?ref=${data.referralCode}`;
            setStats({
              referralCode: data.referralCode,
              totalReferrals: data.stats.totalReferrals,
              activeReferrals: data.stats.totalReferrals, // All referrals are active for now
              totalEarnings: data.stats.totalEarnings,
              monthlyEarnings: 0, // TODO: Calculate from earnings table
              rank: null, // TODO: Get from leaderboard
              referralLink
            });
            console.log('✅ Referral stats loaded successfully');
          } else {
            console.warn('⚠️ No referral data, using mock');
            setStats(generateMockStats());
          }
        } else {
          console.error('❌ Referral fetch failed:', response.status);
          setStats(generateMockStats());
        }
      } catch (error) {
        console.error('❌ Referral error:', error);
        setStats(generateMockStats());
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isOpen, wallet.connected, wallet.publicKey]);

  // Load referral leaderboard
  useEffect(() => {
    if (!isOpen || activeTab !== 'leaderboard') return;

    const loadLeaderboard = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5178/api';
        console.log('🏆 Fetching referral leaderboard...');
        const response = await fetch(`${apiBase}/referral/leaderboard?limit=100`);
        
        if (response.ok) {
          const data = await response.json();
          console.log('📊 Leaderboard data:', data);
          
          if (data.success && data.leaderboard) {
            const formattedLeaderboard = data.leaderboard.map((entry: any) => ({
              rank: entry.rank,
              wallet: entry.wallet,
              username: entry.displayName,
              referrals: entry.totalReferrals,
              earnings: entry.totalEarnings,
              isCurrentUser: wallet.connected && entry.wallet === wallet.publicKey?.toBase58()
            }));
            setLeaderboard(formattedLeaderboard);
            console.log('✅ Leaderboard loaded:', formattedLeaderboard.length, 'entries');
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
  }, [isOpen, activeTab, wallet.connected, wallet.publicKey]);

  const generateMockStats = (): ReferralStats => {
    const code = generateReferralCode(wallet.publicKey?.toBase58() || '');
    return {
      referralCode: code,
      totalReferrals: Math.floor(Math.random() * 50) + 5,
      activeReferrals: Math.floor(Math.random() * 30) + 3,
      totalEarnings: Math.floor(Math.random() * 5000) + 500,
      monthlyEarnings: Math.floor(Math.random() * 1000) + 100,
      rank: Math.floor(Math.random() * 100) + 1,
      referralLink: `https://novarcadeglitch.dev?ref=${code}`
    };
  };

  const generateMockLeaderboard = (): ReferralLeaderboardEntry[] => {
    return Array.from({ length: 10 }, (_, i) => ({
      rank: i + 1,
      wallet: `${Math.random().toString(36).substring(2, 8)}...${Math.random().toString(36).substring(2, 6)}`,
      username: `CryptoReferrer${i + 1}`,
      referrals: Math.floor(Math.random() * 200) + 50,
      earnings: Math.floor(Math.random() * 10000) + 1000,
      isCurrentUser: wallet.connected && i === 3
    }));
  };

  const generateReferralCode = (address: string): string => {
    return address.substring(0, 6).toUpperCase();
  };

  const copyReferralLink = async () => {
    if (!stats) return;
    
    try {
      await navigator.clipboard.writeText(stats.referralLink);
      setCopied(true);
      // Track event
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'link_copied', {
          event_category: 'Referral',
          event_label: stats.referralCode
        });
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareToTwitter = () => {
    if (!stats) return;
    
    const text = encodeURIComponent(
      `Just earned ${stats.totalEarnings.toLocaleString()} NAG from referrals on Nova Arcade Glitch! 🎮💰\n\n` +
      `Join me and earn 10% of your referrals' fees forever!\n\n` +
      `#NovaArcade #Web3Gaming #Solana #PassiveIncome`
    );
    const url = encodeURIComponent(stats.referralLink);
    
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'width=550,height=420'
    );
    
    // Track share
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        event_category: 'Referral',
        event_label: 'twitter',
        value: stats.totalEarnings
      });
    }
  };

  const shareToTelegram = () => {
    if (!stats) return;
    
    const text = encodeURIComponent(
      `Join Nova Arcade Glitch and earn crypto playing games! 🎮\n` +
      `Use my referral link and I'll earn 10% of your fees!\n\n` +
      stats.referralLink
    );
    
    window.open(`https://t.me/share/url?url=${text}`, '_blank');
    // Track share
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'share', {
        event_category: 'Referral',
        event_label: 'telegram',
        value: stats.totalEarnings
      });
    }
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
              maxWidth: 800,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(0, 255, 136, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#00ff88', fontSize: 28, fontWeight: 700 }}>
                  💸 Referral Program
                </h2>
                <div style={{ fontSize: 13, color: '#8af0ff', marginTop: 4 }}>
                  Earn 10% of your referrals' fees forever!
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

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {(['dashboard', 'leaderboard'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1,
                    padding: '12px 20px',
                    background: activeTab === tab ? '#00ff88' : 'rgba(0, 255, 136, 0.1)',
                    color: activeTab === tab ? '#000' : '#00ff88',
                    border: `1.5px solid ${activeTab === tab ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
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

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#8af0ff' }}>
                    Loading your referral stats...
                  </div>
                ) : stats ? (
                  <>
                    {/* Referral Link */}
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.2), rgba(0, 204, 106, 0.2))',
                      border: '2px solid #00ff88',
                      borderRadius: 12,
                      padding: 20,
                      marginBottom: 20
                    }}>
                      <div style={{ fontSize: 13, color: '#8af0ff', marginBottom: 8, fontWeight: 600 }}>
                        Your Referral Link
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center'
                      }}>
                        <input
                          type="text"
                          value={stats.referralLink}
                          readOnly
                          style={{
                            flex: 1,
                            padding: '12px 16px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(0, 255, 136, 0.3)',
                            borderRadius: 8,
                            color: '#fff',
                            fontSize: 14,
                            fontFamily: 'monospace'
                          }}
                        />
                        <button
                          onClick={copyReferralLink}
                          style={{
                            padding: '12px 24px',
                            background: copied ? '#00ff88' : 'rgba(0, 255, 136, 0.15)',
                            color: copied ? '#000' : '#00ff88',
                            border: `1.5px solid ${copied ? '#00ff88' : 'rgba(0, 255, 136, 0.3)'}`,
                            borderRadius: 8,
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                          }}
                        >
                          {copied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      {/* Social Share Buttons */}
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button
                          onClick={shareToTwitter}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #1DA1F2, #0d8bd9)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          𝕏 Share on X
                        </button>
                        <button
                          onClick={shareToTelegram}
                          style={{
                            flex: 1,
                            padding: '10px 16px',
                            background: 'linear-gradient(135deg, #0088cc, #006699)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 6
                          }}
                        >
                          ✈️ Telegram
                        </button>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                      gap: 16,
                      marginBottom: 20
                    }}>
                      {/* Total Referrals */}
                      <div style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>
                          {stats.totalReferrals}
                        </div>
                        <div style={{ fontSize: 12, color: '#8af0ff' }}>
                          Total Referrals
                        </div>
                      </div>

                      {/* Active Referrals */}
                      <div style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 32, fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>
                          {stats.activeReferrals}
                        </div>
                        <div style={{ fontSize: 12, color: '#8af0ff' }}>
                          Active (30d)
                        </div>
                      </div>

                      {/* Total Earnings */}
                      <div style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>
                          {stats.totalEarnings.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#8af0ff' }}>
                          Total NAG Earned
                        </div>
                      </div>

                      {/* Monthly Earnings */}
                      <div style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        border: '1px solid rgba(0, 255, 136, 0.3)',
                        borderRadius: 12,
                        padding: 16,
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: 24, fontWeight: 700, color: '#00ff88', marginBottom: 4 }}>
                          {stats.monthlyEarnings.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: '#8af0ff' }}>
                          This Month
                        </div>
                      </div>
                    </div>

                    {/* How It Works */}
                    <div style={{
                      background: 'rgba(138, 240, 255, 0.1)',
                      border: '1px solid rgba(138, 240, 255, 0.3)',
                      borderRadius: 12,
                      padding: 16
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#8af0ff', marginBottom: 12 }}>
                        💡 How It Works
                      </div>
                      <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.6, opacity: 0.9 }}>
                        <div style={{ marginBottom: 8 }}>
                          ✅ Share your referral link with friends
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          ✅ They sign up and play games
                        </div>
                        <div style={{ marginBottom: 8 }}>
                          ✅ You earn <strong>10% of their swap fees</strong> forever
                        </div>
                        <div>
                          ✅ Plus <strong>5% of their entry fees</strong> - passive income!
                        </div>
                      </div>
                    </div>

                    {/* Bonuses */}
                    <div style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      borderRadius: 12,
                      padding: 16,
                      marginTop: 16
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#FFD700', marginBottom: 12 }}>
                        🎁 Referral Bonuses
                      </div>
                      <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.8, opacity: 0.9 }}>
                        <div>🥉 <strong>10 referrals</strong> → +100 NAG bonus</div>
                        <div>🥈 <strong>50 referrals</strong> → +500 NAG bonus</div>
                        <div>🥇 <strong>100 referrals</strong> → +1,000 NAG bonus</div>
                        <div>💎 <strong>500 referrals</strong> → +10,000 NAG bonus + VIP status!</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: 40, color: '#8af0ff' }}>
                    Connect your wallet to view referral stats
                  </div>
                )}
              </div>
            )}

            {/* Leaderboard Tab */}
            {activeTab === 'leaderboard' && (
              <div>
                <div style={{
                  background: 'rgba(0, 255, 136, 0.05)',
                  border: '1px solid rgba(0, 255, 136, 0.2)',
                  borderRadius: 12,
                  overflow: 'hidden'
                }}>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '60px 1fr 120px 150px',
                    gap: 12,
                    padding: '12px 16px',
                    background: 'rgba(0, 255, 136, 0.1)',
                    borderBottom: '1px solid rgba(0, 255, 136, 0.2)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#8af0ff',
                    textTransform: 'uppercase'
                  }}>
                    <div>Rank</div>
                    <div>Referrer</div>
                    <div style={{ textAlign: 'center' }}>Referrals</div>
                    <div style={{ textAlign: 'right' }}>NAG Earned</div>
                  </div>

                  {/* Table Rows */}
                  {leaderboard.map((entry, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '60px 1fr 120px 150px',
                        gap: 12,
                        padding: '14px 16px',
                        borderBottom: index < leaderboard.length - 1 ? '1px solid rgba(0, 255, 136, 0.1)' : 'none',
                        background: entry.isCurrentUser ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                        fontSize: 13
                      }}
                    >
                      <div style={{
                        fontWeight: 700,
                        color: entry.rank === 1 ? '#FFD700' : 
                               entry.rank === 2 ? '#C0C0C0' : 
                               entry.rank === 3 ? '#CD7F32' : '#00ff88'
                      }}>
                        {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                      </div>

                      <div style={{ color: entry.isCurrentUser ? '#00ff88' : '#fff', fontWeight: entry.isCurrentUser ? 600 : 400 }}>
                        {entry.username || entry.wallet}
                        {entry.isCurrentUser && <span style={{ marginLeft: 6, opacity: 0.7 }}>👤</span>}
                      </div>

                      <div style={{ textAlign: 'center', color: '#8af0ff', fontWeight: 600 }}>
                        {entry.referrals}
                      </div>

                      <div style={{ textAlign: 'right', color: '#00ff88', fontWeight: 700, fontFamily: 'monospace' }}>
                        {entry.earnings.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
