/**
 * Admin Dashboard - AI Monitoring & Anti-Cheat Control Center
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [bannedPlayers, setBannedPlayers] = useState<any[]>([]);
  const [detectionRules, setDetectionRules] = useState<any[]>([]);

  const ADMIN_WALLETS = [
    'dthhdw4shevfesy6wqv9s25bllvfnthynzpzhe3uwizg', // Your admin wallet
    'ediekrwdssklfsE6sW4P84oDkXRVqJFnHDf99AqfRAUf'.toLowerCase() // Additional admin wallet
  ];
  const isAdmin = publicKey && ADMIN_WALLETS.includes(publicKey.toString().toLowerCase());

  useEffect(() => {
    if (isOpen && isAdmin) loadData();
  }, [isOpen, isAdmin, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const res = await fetch('http://localhost:5178/api/ai/dashboard-stats');
        const data = await res.json();
        if (data.success) setStats(data.stats);
      } else if (activeTab === 'suspicious') {
        const res = await fetch('http://localhost:5178/api/ai/suspicious-activities?status=pending');
        const data = await res.json();
        if (data.success) setActivities(data.activities);
      } else if (activeTab === 'bans') {
        const res = await fetch('http://localhost:5178/api/ai/banned-players');
        const data = await res.json();
        if (data.success) setBannedPlayers(data.bannedPlayers);
      } else if (activeTab === 'rules') {
        const res = await fetch('http://localhost:5178/api/ai/detection-rules');
        const data = await res.json();
        if (data.success) setDetectionRules(data.rules);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const reviewActivity = async (id: string, status: string, action: string) => {
    try {
      const res = await fetch('http://localhost:5178/api/ai/review-activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activityId: id,
          reviewedBy: publicKey?.toString(),
          status,
          reviewNotes: action,
          actionTaken: action
        })
      });
      if (res.ok) {
        alert('Activity reviewed!');
        loadData();
      }
    } catch (error) {
      alert('Failed to review activity');
    }
  };

  const unbanPlayer = async (wallet: string) => {
    if (!confirm(`Unban ${wallet}?`)) return;
    try {
      const res = await fetch('http://localhost:5178/api/ai/unban-player', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet,
          unbanReason: 'Admin unban',
          unbannedBy: publicKey?.toString()
        })
      });
      if (res.ok) {
        alert('Player unbanned!');
        loadData();
      }
    } catch (error) {
      alert('Failed to unban');
    }
  };

  const toggleRule = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`http://localhost:5178/api/ai/detection-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      if (res.ok) {
        alert('Rule updated!');
        loadData();
      }
    } catch (error) {
      alert('Failed to update rule');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6' };
    return colors[severity] || '#6b7280';
  };

  if (!isAdmin) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
            onClick={onClose}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}
              style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', border: '2px solid #ef4444', borderRadius: 20, padding: 40, maxWidth: 500, width: '100%', boxShadow: '0 0 60px rgba(239,68,68,0.4)', color: '#fff' }}>
              <h2 style={{ margin: 0, color: '#ef4444', fontSize: 28, fontWeight: 700, fontFamily: 'Monoton, cursive' }}>🚫 ACCESS DENIED</h2>
              <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 10, fontFamily: 'Rajdhani, sans-serif' }}>Administrators only.</p>
              <button onClick={onClose} style={{ width: '100%', padding: '12px 24px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1.5px solid rgba(239,68,68,0.3)', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
          onClick={onClose}>
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)', border: '2px solid #ef4444', borderRadius: 20, padding: 28, maxWidth: 1200, width: '100%', maxHeight: '85vh', overflow: 'auto', boxShadow: '0 0 60px rgba(239,68,68,0.4)', color: '#fff' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#ef4444', fontSize: 28, fontWeight: 700, fontFamily: 'Monoton, cursive' }}>🛡️ ADMIN DASHBOARD</h2>
                <div style={{ fontSize: 13, color: '#fca5a5', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>AI Monitoring & Anti-Cheat Control</div>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: 32, cursor: 'pointer' }}>×</button>
            </div>

            {/* Stats */}
            {stats && activeTab === 'overview' && (
              <div style={{ marginBottom: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Games Today</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', marginTop: 8, fontFamily: 'Orbitron, monospace' }}>{stats.totalGamesToday}</div>
                </div>
                <div style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Suspicious</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#fb923c', marginTop: 8, fontFamily: 'Orbitron, monospace' }}>{stats.suspiciousGamesToday}</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Active Bans</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#ef4444', marginTop: 8, fontFamily: 'Orbitron, monospace' }}>{stats.activeBans}</div>
                </div>
                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: 20 }}>
                  <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Pending</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: '#eab308', marginTop: 8, fontFamily: 'Orbitron, monospace' }}>{stats.pendingReviews}</div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
              {['overview', 'suspicious', 'bans', 'rules'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{ flex: 1, padding: '12px 20px', background: activeTab === tab ? '#ef4444' : 'rgba(239,68,68,0.1)', color: activeTab === tab ? '#000' : '#ef4444', border: `1.5px solid ${activeTab === tab ? '#ef4444' : 'rgba(239,68,68,0.3)'}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif', textTransform: 'capitalize', transition: 'all 0.2s' }}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(85vh - 350px)' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
                  <div style={{ color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Loading...</div>
                </div>
              ) : (
                <>
                  {activeTab === 'suspicious' && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>
                        Pending Reviews ({activities.length})
                      </h3>
                      {activities.map((a) => (
                        <div key={a.id} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 16, marginBottom: 12, border: `2px solid ${getSeverityColor(a.severity)}40` }}>
                          <div style={{ marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{a.wallet.slice(0, 8)}...</span>
                            <span style={{ marginLeft: 12, padding: '2px 8px', background: `${getSeverityColor(a.severity)}20`, color: getSeverityColor(a.severity), borderRadius: 4, fontSize: 11, fontWeight: 600, fontFamily: 'Rajdhani, sans-serif' }}>{a.severity}</span>
                          </div>
                          <div style={{ color: '#d1d5db', marginBottom: 12, fontFamily: 'Rajdhani, sans-serif', fontSize: 13 }}>{a.description}</div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => reviewActivity(a.id, 'confirmed', 'permanent_ban')} style={{ padding: '6px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Ban</button>
                            <button onClick={() => reviewActivity(a.id, 'confirmed', 'warning')} style={{ padding: '6px 12px', background: 'rgba(234,179,8,0.2)', color: '#eab308', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Warn</button>
                            <button onClick={() => reviewActivity(a.id, 'false_positive', 'none')} style={{ padding: '6px 12px', background: 'rgba(107,114,128,0.2)', color: '#9ca3af', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Dismiss</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'bans' && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>
                        Banned Players ({bannedPlayers.length})
                      </h3>
                      {bannedPlayers.map((b) => (
                        <div key={b.id} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{b.wallet.slice(0, 8)}...{b.wallet.slice(-6)}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 4 }}>{b.reason}</div>
                          </div>
                          <button onClick={() => unbanPlayer(b.wallet)} style={{ padding: '6px 12px', background: 'rgba(34,197,94,0.2)', color: '#22c55e', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>Unban</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'rules' && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>
                        Detection Rules ({detectionRules.length})
                      </h3>
                      {detectionRules.map((r) => (
                        <div key={r.id} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{r.rule_name.replace(/_/g, ' ').toUpperCase()}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 4 }}>{r.description}</div>
                          </div>
                          <button onClick={() => toggleRule(r.id, r.is_active)} style={{ padding: '6px 12px', background: r.is_active ? 'rgba(34,197,94,0.2)' : 'rgba(107,114,128,0.2)', color: r.is_active ? '#22c55e' : '#9ca3af', border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Rajdhani, sans-serif' }}>
                            {r.is_active ? 'Active' : 'Disabled'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'overview' && stats && (
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#ef4444', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>Top Suspicious Players</h3>
                      {stats.topSuspiciousPlayers.map((p: any) => (
                        <div key={p.wallet} style={{ background: 'rgba(17,24,39,0.5)', borderRadius: 8, padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif' }}>{p.wallet.slice(0, 8)}...{p.wallet.slice(-6)}</div>
                            <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 4 }}>{p.total_games_played} games • {p.total_suspicious_games} suspicious</div>
                          </div>
                          <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 24, fontFamily: 'Orbitron, monospace' }}>{p.suspicion_rate.toFixed(1)}%</div>
                        </div>
                      ))}
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

export default AdminDashboard;
