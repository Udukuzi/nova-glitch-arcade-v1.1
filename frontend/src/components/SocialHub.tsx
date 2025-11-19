/**
 * Social Hub - Friends, Challenges, Feed
 */
import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SocialHubProps {
  isOpen: boolean;
  onClose: () => void;
}

const SocialHub: React.FC<SocialHubProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('friends');
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && publicKey) loadData();
  }, [isOpen, publicKey, activeTab]);

  const loadData = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const wallet = publicKey.toString();
      if (activeTab === 'friends') {
        const [friendsRes, requestsRes] = await Promise.all([
          fetch(`http://localhost:5178/api/social/friends/${wallet}`),
          fetch(`http://localhost:5178/api/social/friends/requests/${wallet}`)
        ]);
        const friendsData = await friendsRes.json();
        const requestsData = await requestsRes.json();
        if (friendsData.success) setFriends(friendsData.friends);
        if (requestsData.success) setFriendRequests(requestsData.requests);
      } else if (activeTab === 'challenges') {
        const res = await fetch(`http://localhost:5178/api/social/challenges/${wallet}`);
        const data = await res.json();
        if (data.success) setChallenges(data.challenges);
      } else if (activeTab === 'feed') {
        const res = await fetch(`http://localhost:5178/api/social/feed/${wallet}`);
        const data = await res.json();
        if (data.success) setFeed(data.feed);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 3) return setSearchResults([]);
    const res = await fetch(`http://localhost:5178/api/social/search?q=${query}`);
    const data = await res.json();
    if (data.success) setSearchResults(data.users);
  };

  const sendFriendRequest = async (friendWallet: string) => {
    if (!publicKey) return;
    try {
      const res = await fetch('http://localhost:5178/api/social/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWallet: publicKey.toString(), friendWallet })
      });
      if (res.ok) { alert('Request sent!'); setSearchQuery(''); setSearchResults([]); }
    } catch (e) { alert('Failed'); }
  };

  const acceptRequest = async (wallet: string) => {
    if (!publicKey) return;
    try {
      const res = await fetch('http://localhost:5178/api/social/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userWallet: publicKey.toString(), friendWallet: wallet })
      });
      if (res.ok) { alert('Accepted!'); loadData(); }
    } catch (e) { alert('Failed'); }
  };

  if (!publicKey) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', border: '2px solid #a855f7', borderRadius: 20, padding: 40, maxWidth: 500, width: '100%', boxShadow: '0 0 60px rgba(168,85,247,0.4)', color: '#fff' }}>
              <h2 style={{ margin: 0, color: '#a855f7', fontSize: 28, fontWeight: 700, fontFamily: 'Monoton, cursive' }}>🔒 WALLET REQUIRED</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 10, fontFamily: 'Rajdhani, sans-serif' }}>Connect your wallet to access social features</p>
              <button onClick={onClose} style={{ width: '100%', padding: '12px 24px', background: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1.5px solid rgba(168,85,247,0.3)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', marginTop: 20 }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }} onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', border: '2px solid #a855f7', borderRadius: 20, padding: 28, maxWidth: 1000, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 0 60px rgba(168,85,247,0.4)', color: '#fff' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#a855f7', fontSize: 28, fontWeight: 700, fontFamily: 'Monoton, cursive' }}>👥 SOCIAL HUB</h2>
                <div style={{ fontSize: 13, color: '#c4b5fd', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>Friends, Challenges & Feed</div>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['friends', 'challenges', 'feed'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '12px 20px', background: activeTab === tab ? '#a855f7' : 'rgba(168,85,247,0.1)', color: activeTab === tab ? '#000' : '#a855f7', border: `1.5px solid ${activeTab === tab ? '#a855f7' : 'rgba(168,85,247,0.3)'}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'capitalize' }}>
                  {tab === 'friends' && '👥 '}
                  {tab === 'challenges' && '⚔️ '}
                  {tab === 'feed' && '📱 '}
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ overflowY: 'auto', maxHeight: 'calc(85vh - 250px)', padding: 16 }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 32 }}>⏳</div>
                  <div style={{ color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 12 }}>Loading...</div>
                </div>
              ) : (
                <>
                  {activeTab === 'friends' && (
                    <div>
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', marginBottom: 12, fontFamily: 'Orbitron, monospace' }}>🔍 Add Friends</h3>
                        <input type="text" placeholder="Search wallet address..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); searchUsers(e.target.value); }} style={{ width: '100%', padding: '12px 16px', background: 'rgba(17,24,39,0.5)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'Rajdhani, sans-serif' }} />
                        {searchResults.map((u) => (
                          <div key={u.wallet} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 12, marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>{u.wallet.slice(0, 12)}...</span>
                            <button onClick={() => sendFriendRequest(u.wallet)} style={{ padding: '6px 12px', background: '#a855f7', color: '#000', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Add</button>
                          </div>
                        ))}
                      </div>

                      {friendRequests.length > 0 && (
                        <div style={{ marginBottom: 24 }}>
                          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', marginBottom: 12, fontFamily: 'Orbitron, monospace' }}>📬 Requests ({friendRequests.length})</h3>
                          {friendRequests.map((req) => (
                            <div key={req.id} style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>{req.requested_by.slice(0, 12)}...</span>
                              <button onClick={() => acceptRequest(req.requested_by)} style={{ padding: '6px 12px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Accept</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', marginBottom: 12, fontFamily: 'Orbitron, monospace' }}>✨ My Friends ({friends.length})</h3>
                      {friends.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>No friends yet. Add some!</div>
                      ) : (
                        friends.map((f) => (
                          <div key={f.friend_wallet} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>{f.friend_wallet.slice(0, 12)}...</div>
                              <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Score: {f.highest_score || 0}</div>
                            </div>
                            <button style={{ padding: '6px 12px', background: 'rgba(251,146,60,0.2)', color: '#fb923c', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Challenge</button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'challenges' && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', marginBottom: 12, fontFamily: 'Orbitron, monospace' }}>⚔️ Challenges ({challenges.length})</h3>
                      {challenges.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>No challenges yet</div>
                      ) : (
                        challenges.map((c) => (
                          <div key={c.id} style={{ background: 'rgba(17,24,39,0.5)', border: '2px solid rgba(251,146,60,0.3)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fb923c', fontFamily: 'Rajdhani, sans-serif' }}>{c.game_name.toUpperCase()}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 4 }}>
                              {c.challenger_wallet === publicKey?.toString() ? 'You vs ' : 'vs You'}
                              {(c.challenger_wallet === publicKey?.toString() ? c.challenged_wallet : c.challenger_wallet).slice(0, 12)}...
                            </div>
                            <div style={{ marginTop: 8, padding: '4px 8px', background: 'rgba(234,179,8,0.2)', color: '#eab308', borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'Rajdhani, sans-serif', display: 'inline-block' }}>{c.status}</div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === 'feed' && (
                    <div>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#a855f7', marginBottom: 12, fontFamily: 'Orbitron, monospace' }}>📱 Activity Feed ({feed.length})</h3>
                      {feed.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>No activities yet. Add friends to see their activity!</div>
                      ) : (
                        feed.map((activity) => (
                          <div key={activity.id} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 16, marginBottom: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ fontSize: 24 }}>{activity.activity_type === 'score' ? '🎮' : activity.activity_type === 'achievement' ? '🏆' : '⚔️'}</div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>{activity.user_wallet.slice(0, 12)}...</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>
                                  {activity.activity_type === 'score' && `Scored ${activity.score} in ${activity.game_name}`}
                                  {activity.activity_type === 'achievement' && `Unlocked achievement`}
                                  {activity.activity_type === 'challenge_won' && `Won a challenge!`}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialHub;
