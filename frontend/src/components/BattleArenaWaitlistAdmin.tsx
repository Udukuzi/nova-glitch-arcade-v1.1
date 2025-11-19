/**
 * Battle Arena Waitlist Admin View
 * View and export waitlist signups
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface WaitlistEntry {
  id: string;
  email: string;
  wallet_address: string | null;
  source: string;
  subscribed_at: string;
  notified: boolean;
}

export default function BattleArenaWaitlistAdmin() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const fetchWaitlist = async (key: string) => {
    setLoading(true);
    setError('');
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5178';
      const response = await fetch(`${API_URL}/api/battle-arena/admin/waitlist`, {
        headers: {
          'x-admin-key': key
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Invalid admin key');
        }
        throw new Error('Failed to fetch waitlist');
      }

      const data = await response.json();
      setWaitlist(data.waitlist || []);
      setAuthenticated(true);
      localStorage.setItem('admin_key', key);
    } catch (err: any) {
      setError(err.message);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem('admin_key');
    if (savedKey) {
      setAdminKey(savedKey);
      fetchWaitlist(savedKey);
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWaitlist(adminKey);
  };

  const exportToCSV = () => {
    const csv = [
      ['Email', 'Wallet Address', 'Source', 'Subscribed At', 'Notified'].join(','),
      ...waitlist.map(entry => [
        entry.email,
        entry.wallet_address || 'N/A',
        entry.source,
        new Date(entry.subscribed_at).toLocaleString(),
        entry.notified ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `battle-arena-waitlist-${Date.now()}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#8af0ff' }}>
        Loading waitlist...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '2px solid #00ff88',
            borderRadius: 20,
            padding: 40,
            maxWidth: 400,
            width: '100%',
            boxShadow: '0 20px 60px rgba(0, 255, 136, 0.3)'
          }}
        >
          <h2 style={{
            margin: '0 0 24px 0',
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 24,
            color: '#00ff88',
            textAlign: 'center'
          }}>
            🔒 Admin Access
          </h2>

          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              style={{
                width: '100%',
                padding: 12,
                background: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid #00ff88',
                borderRadius: 8,
                color: '#fff',
                fontSize: 14,
                fontFamily: 'Rajdhani, sans-serif',
                marginBottom: 16
              }}
            />

            {error && (
              <p style={{
                color: '#ff4444',
                fontSize: 14,
                marginBottom: 16,
                textAlign: 'center'
              }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              style={{
                width: '100%',
                padding: 14,
                background: 'linear-gradient(135deg, #00ff88, #00cc6f)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0a0f',
                fontSize: 16,
                fontWeight: 'bold',
                fontFamily: 'Rajdhani, sans-serif',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              Access Waitlist
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 100%)',
      padding: 40
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32
        }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'Orbitron, sans-serif',
            fontSize: 32,
            color: '#00ff88'
          }}>
            ⚔️ Battle Arena Waitlist
          </h1>

          <div style={{ display: 'flex', gap: 16 }}>
            <button
              onClick={() => fetchWaitlist(adminKey)}
              style={{
                padding: '12px 24px',
                background: 'rgba(0, 255, 136, 0.2)',
                border: '2px solid #00ff88',
                borderRadius: 8,
                color: '#00ff88',
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'Rajdhani, sans-serif',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh
            </button>

            <button
              onClick={exportToCSV}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #00ff88, #00cc6f)',
                border: 'none',
                borderRadius: 8,
                color: '#0a0a0f',
                fontSize: 14,
                fontWeight: 'bold',
                fontFamily: 'Rajdhani, sans-serif',
                cursor: 'pointer'
              }}
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        <div style={{
          background: 'rgba(0, 255, 136, 0.1)',
          border: '2px solid #00ff88',
          borderRadius: 12,
          padding: 24,
          marginBottom: 32
        }}>
          <p style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 'bold',
            color: '#00ff88',
            fontFamily: 'Orbitron, sans-serif'
          }}>
            📊 Total Signups: {waitlist.length}
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '2px solid #00ff88',
          borderRadius: 12,
          overflow: 'hidden'
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                background: 'rgba(0, 255, 136, 0.2)',
                borderBottom: '2px solid #00ff88'
              }}>
                <th style={tableHeaderStyle}>#</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Wallet</th>
                <th style={tableHeaderStyle}>Source</th>
                <th style={tableHeaderStyle}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {waitlist.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#8af0ff',
                    fontSize: 16
                  }}>
                    No signups yet. Start promoting! 🚀
                  </td>
                </tr>
              ) : (
                waitlist.map((entry, index) => (
                  <tr
                    key={entry.id}
                    style={{
                      borderBottom: '1px solid rgba(0, 255, 136, 0.1)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0, 255, 136, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={tableCellStyle}>{index + 1}</td>
                    <td style={tableCellStyle}>{entry.email}</td>
                    <td style={tableCellStyle}>
                      {entry.wallet_address ? (
                        <span title={entry.wallet_address}>
                          {entry.wallet_address.slice(0, 6)}...{entry.wallet_address.slice(-4)}
                        </span>
                      ) : (
                        <span style={{ color: '#666' }}>N/A</span>
                      )}
                    </td>
                    <td style={tableCellStyle}>{entry.source}</td>
                    <td style={tableCellStyle}>
                      {new Date(entry.subscribed_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const tableHeaderStyle: React.CSSProperties = {
  padding: 16,
  textAlign: 'left',
  color: '#00ff88',
  fontSize: 14,
  fontWeight: 'bold',
  fontFamily: 'Rajdhani, sans-serif',
  textTransform: 'uppercase'
};

const tableCellStyle: React.CSSProperties = {
  padding: 16,
  color: '#8af0ff',
  fontSize: 14,
  fontFamily: 'Rajdhani, sans-serif'
};
