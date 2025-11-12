import { motion } from 'framer-motion';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export default function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <motion.button
      onClick={onToggle}
      className={`flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/60 ${
        isDark
          ? 'border-cyan-400/50 bg-[#080020]/90 text-cyan-100 shadow-[0_0_32px_rgba(34,211,238,0.5)] backdrop-blur-sm'
          : 'border-cyan-500/50 bg-white/90 text-cyan-600 shadow-[0_0_26px_rgba(34,211,238,0.35)] backdrop-blur-sm'
      }`}
      style={{ 
        position: 'fixed',
        right: '1.5rem',
        top: '1.5rem',
        zIndex: 10000
      }}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {isDark ? '☀️' : '🌙'}
    </motion.button>
  );
}
