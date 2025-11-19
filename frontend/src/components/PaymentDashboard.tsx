/**
 * Payment Dashboard Component
 * Shows user earnings, transaction history, pending payouts, and balances
 */

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  transaction_hash?: string;
  created_at: string;
  completed_at?: string;
  metadata: any;
}

interface Balance {
  nag_balance: number;
  usdc_balance: number;
  sol_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

interface PendingPayout {
  id: string;
  amount: number;
  currency: string;
  reason: string;
  status: string;
  attempts: number;
  created_at: string;
  error_message?: string;
}

interface PaymentDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const PaymentDashboard: React.FC<PaymentDashboardProps> = ({ isOpen, onClose }) => {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'pending'>('overview');
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (publicKey) {
      loadData();
    }
  }, [publicKey]);

  const loadData = async () => {
    if (!publicKey) return;

    try {
      setLoading(true);

      // Load balance
      const balanceRes = await fetch(`http://localhost:5178/api/payments/balance/${publicKey.toString()}`);
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data.balance);
      }

      // Load transactions
      const txRes = await fetch(`http://localhost:5178/api/payments/transactions/${publicKey.toString()}`);
      if (txRes.ok) {
        const data = await txRes.json();
        setTransactions(data.transactions);
      }

      // Load pending payouts
      const pendingRes = await fetch(`http://localhost:5178/api/payments/pending/${publicKey.toString()}`);
      if (pendingRes.ok) {
        const data = await pendingRes.json();
        setPendingPayouts(data.payouts);
      }

    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      case 'queued': return 'text-blue-400';
      case 'processing': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament_prize': return '🏆';
      case 'referral_commission': return '🤝';
      case 'achievement_reward': return '⭐';
      case 'withdrawal': return '💸';
      case 'entry_fee': return '🎮';
      default: return '💰';
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'tournament_prize': return 'Tournament Prize';
      case 'referral_commission': return 'Referral Commission';
      case 'achievement_reward': return 'Achievement Reward';
      case 'withdrawal': return 'Withdrawal';
      case 'entry_fee': return 'Entry Fee';
      default: return type;
    }
  };

  if (!isOpen) return null;

  if (!publicKey) {
    return (
      <AnimatePresence>
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
              border: '2px solid #a855f7',
              borderRadius: 20,
              padding: 40,
              maxWidth: 500,
              width: '100%',
              boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)',
              color: '#fff'
            }}
          >
            <h2 style={{ margin: 0, color: '#a855f7', fontSize: 28, fontWeight: 700 }}>
              Connect Wallet
            </h2>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 10, marginBottom: 20 }}>
              Please connect your wallet to view your payment dashboard.
            </p>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                border: '1.5px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

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
              border: '2px solid #a855f7',
              borderRadius: 20,
              padding: 28,
              maxWidth: 1000,
              width: '100%',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)',
              color: '#fff'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ margin: 0, color: '#a855f7', fontSize: 28, fontWeight: 700, fontFamily: 'Monoton, cursive' }}>
                  💰 PAYMENT DASHBOARD
                </h2>
                <div style={{ fontSize: 13, color: '#c4b5fd', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>
                  {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-6)}
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

        {/* Balance Overview */}
        {balance && (
          <div 
            style={{
              padding: 24,
              marginBottom: 20,
              background: 'rgba(10, 14, 39, 0.5)',
              borderRadius: 12,
              border: '1px solid rgba(168, 85, 247, 0.2)'
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(236, 72, 153, 0.2))',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.1)',
                }}
              >
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>NAG Balance</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'Orbitron, monospace' }}>
                  {balance.nag_balance.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#c4b5fd', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>NAG</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.1)',
                }}
              >
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Total Earned</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'Orbitron, monospace' }}>
                  {balance.total_earned.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#10b981', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>NAG</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(6, 182, 212, 0.2))',
                  border: '1px solid rgba(37, 99, 235, 0.3)',
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.1)',
                }}
              >
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>USDC</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'Orbitron, monospace' }}>
                  ${balance.usdc_balance.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#3b82f6', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>USDC</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.2), rgba(239, 68, 68, 0.2))',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  boxShadow: '0 0 20px rgba(249, 115, 22, 0.1)',
                }}
              >
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>SOL</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'Orbitron, monospace' }}>
                  {balance.sol_balance.toFixed(4)}
                </div>
                <div style={{ fontSize: 11, color: '#f97316', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>SOL</div>
              </div>

              <div 
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(245, 158, 11, 0.2))',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  boxShadow: '0 0 20px rgba(234, 179, 8, 0.1)',
                }}
              >
                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>Withdrawn</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginTop: 4, fontFamily: 'Orbitron, monospace' }}>
                  {balance.total_withdrawn.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#eab308', marginTop: 4, fontFamily: 'Rajdhani, sans-serif' }}>NAG</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: activeTab === 'overview' ? '#a855f7' : 'rgba(168, 85, 247, 0.1)',
              color: activeTab === 'overview' ? '#000' : '#a855f7',
              border: `1.5px solid ${activeTab === 'overview' ? '#a855f7' : 'rgba(168, 85, 247, 0.3)'}`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              transition: 'all 0.2s'
            }}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: activeTab === 'transactions' ? '#a855f7' : 'rgba(168, 85, 247, 0.1)',
              color: activeTab === 'transactions' ? '#000' : '#a855f7',
              border: `1.5px solid ${activeTab === 'transactions' ? '#a855f7' : 'rgba(168, 85, 247, 0.3)'}`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              transition: 'all 0.2s'
            }}
          >
            📝 Transactions ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            style={{
              flex: 1,
              padding: '12px 20px',
              background: activeTab === 'pending' ? '#a855f7' : 'rgba(168, 85, 247, 0.1)',
              color: activeTab === 'pending' ? '#000' : '#a855f7',
              border: `1.5px solid ${activeTab === 'pending' ? '#a855f7' : 'rgba(168, 85, 247, 0.3)'}`,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'Rajdhani, sans-serif',
              transition: 'all 0.2s'
            }}
          >
            ⏳ Pending ({pendingPayouts.length})
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(85vh - 400px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
              <div style={{ color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', fontSize: 14 }}>Loading payment data...</div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  <div style={{ background: 'rgba(10, 14, 39, 0.5)', borderRadius: 12, padding: 24, border: '1px solid rgba(168, 85, 247, 0.2)' }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: '#a855f7', marginBottom: 16, fontFamily: 'Orbitron, sans-serif' }}>Recent Activity</h3>
                    {transactions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>
                        No transactions yet. Start playing to earn!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {transactions.slice(0, 5).map((tx) => (
                          <div
                            key={tx.id}
                            style={{
                              background: 'rgba(17, 24, 39, 0.5)',
                              borderRadius: 8,
                              padding: 16,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              border: '1px solid rgba(107, 114, 128, 0.2)',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                              <div style={{ fontSize: 28 }}>{getTypeIcon(tx.type)}</div>
                              <div>
                                <div style={{ fontWeight: 600, color: '#fff', fontFamily: 'Rajdhani, sans-serif', fontSize: 15 }}>{getTypeName(tx.type)}</div>
                                <div style={{ fontSize: 12, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif', marginTop: 2 }}>{formatDate(tx.created_at)}</div>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 700, color: '#10b981', fontSize: 17, fontFamily: 'Orbitron, monospace' }}>
                                +{formatAmount(tx.amount, tx.currency)}
                              </div>
                              <div style={{ fontSize: 12, color: getStatusColor(tx.status) === 'text-green-400' ? '#10b981' : getStatusColor(tx.status) === 'text-yellow-400' ? '#eab308' : '#ef4444', fontFamily: 'Rajdhani, sans-serif', marginTop: 2 }}>
                                {tx.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {pendingPayouts.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-yellow-400 mb-4">⏳ Pending Payouts</h3>
                      <div className="space-y-2">
                        {pendingPayouts.map((payout) => (
                          <div key={payout.id} className="flex justify-between items-center">
                            <span className="text-gray-300">{payout.reason.replace('_', ' ')}</span>
                            <span className="text-yellow-400 font-bold">
                              {formatAmount(payout.amount, payout.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 text-sm text-gray-400">
                        💡 Payouts are processed automatically within 1 minute
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Transactions Tab */}
              {activeTab === 'transactions' && (
                <div className="space-y-3">
                  {transactions.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      No transactions yet
                    </div>
                  ) : (
                    transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{getTypeIcon(tx.type)}</div>
                            <div>
                              <div className="font-semibold text-white">{getTypeName(tx.type)}</div>
                              <div className="text-sm text-gray-400">{formatDate(tx.created_at)}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold text-lg ${
                              tx.type === 'withdrawal' ? 'text-red-400' : 'text-green-400'
                            }`}>
                              {tx.type === 'withdrawal' ? '-' : '+'}{formatAmount(tx.amount, tx.currency)}
                            </div>
                            <div className={`text-sm ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </div>
                          </div>
                        </div>
                        
                        {tx.transaction_hash && (
                          <div className="text-xs text-gray-500 mt-2 font-mono">
                            Tx: {tx.transaction_hash.slice(0, 20)}...
                            <a
                              href={`https://solscan.io/tx/${tx.transaction_hash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-400 ml-2 hover:underline"
                            >
                              View on Solscan →
                            </a>
                          </div>
                        )}

                        {tx.metadata && tx.metadata.tournamentId && (
                          <div className="text-sm text-gray-400 mt-2">
                            {tx.metadata.rank && `Rank #${tx.metadata.rank} • `}
                            Tournament ID: {tx.metadata.tournamentId.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Pending Tab */}
              {activeTab === 'pending' && (
                <div className="space-y-3">
                  {pendingPayouts.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      No pending payouts
                    </div>
                  ) : (
                    pendingPayouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="bg-gray-800/50 rounded-lg p-4 border border-yellow-500/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-semibold text-white">
                              {payout.reason.replace('_', ' ').toUpperCase()}
                            </div>
                            <div className="text-sm text-gray-400">{formatDate(payout.created_at)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-yellow-400 text-lg">
                              {formatAmount(payout.amount, payout.currency)}
                            </div>
                            <div className={`text-sm ${getStatusColor(payout.status)}`}>
                              {payout.status}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-gray-400 mt-2">
                          Attempt {payout.attempts} of 3
                        </div>
                        
                        {payout.error_message && (
                          <div className="text-xs text-red-400 mt-2 bg-red-900/20 p-2 rounded">
                            Error: {payout.error_message}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {pendingPayouts.length > 0 && (
                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mt-4">
                      <div className="text-blue-400 font-semibold mb-2">ℹ️ About Pending Payouts</div>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>• Payouts are processed automatically every 30 seconds</p>
                        <p>• Typical processing time: Less than 1 minute</p>
                        <p>• Failed payouts are retried up to 3 times</p>
                        <p>• View transaction hash once completed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div 
          style={{
            borderTop: '1px solid rgba(168, 85, 247, 0.2)',
            padding: 16,
            marginTop: 20,
            background: 'rgba(10, 14, 39, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: '#9ca3af', fontFamily: 'Rajdhani, sans-serif' }}>
              💡 All payments are processed on Solana blockchain
            </div>
            <button
              onClick={loadData}
              style={{
                padding: '8px 16px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#a855f7',
                border: '1.5px solid rgba(168, 85, 247, 0.3)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Rajdhani, sans-serif',
                transition: 'all 0.2s'
              }}
            >
              🔄 Refresh
            </button>
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PaymentDashboard;
