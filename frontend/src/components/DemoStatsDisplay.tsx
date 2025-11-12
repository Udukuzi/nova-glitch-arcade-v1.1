import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function DemoStatsDisplay() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalVolume: 0,
    waitlistCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5178'}/api/battle-arena/demo/stats`);
      const data = await response.json();
      
      if (data.stats) {
        setStats({
          totalEntries: Math.round(data.stats.total_demo_entries || 0),
          totalVolume: Math.round(data.stats.total_simulated_volume_usdc || 0),
          waitlistCount: Math.round(data.stats.waitlist_signups || 0),
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch demo stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        gap: '24px',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(255, 68, 255, 0.1), rgba(0, 255, 136, 0.1))',
        borderRadius: '16px',
        border: '1px solid rgba(0, 255, 136, 0.3)',
        margin: '24px 0',
        flexWrap: 'wrap',
      }}
    >
      <StatCard
        icon="🎮"
        value={stats.totalEntries}
        label="Demo Entries"
        color="#ff44ff"
      />
      <StatCard
        icon="💰"
        value={`$${stats.totalVolume}`}
        label="Simulated Volume"
        color="#00ff88"
      />
      <StatCard
        icon="📋"
        value={stats.waitlistCount}
        label="Waitlist Signups"
        color="#00aaff"
      />
    </motion.div>
  );
}

interface StatCardProps {
  icon: string;
  value: number | string;
  label: string;
  color: string;
}

function StatCard({ icon, value, label, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      style={{
        textAlign: 'center',
        padding: '20px',
        background: `linear-gradient(135deg, ${color}22, ${color}11)`,
        borderRadius: '12px',
        border: `2px solid ${color}44`,
        minWidth: '150px',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '8px' }}>{icon}</div>
      <div
        style={{
          fontSize: '28px',
          fontWeight: 'bold',
          color: color,
          fontFamily: 'Orbitron, sans-serif',
          marginBottom: '4px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '12px',
          color: '#8af0ff',
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}
