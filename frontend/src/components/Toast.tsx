import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

interface ToastProps {
  toasts: ToastMessage[]
  onRemove: (id: string) => void
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      maxWidth: '400px'
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id)
    }, toast.duration || 3000)

    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onRemove])

  const colors = {
    success: { bg: 'rgba(0, 255, 136, 0.15)', border: '#00ff88', icon: '✓' },
    error: { bg: 'rgba(255, 64, 129, 0.15)', border: '#ff4081', icon: '✕' },
    info: { bg: 'rgba(138, 240, 255, 0.15)', border: '#8af0ff', icon: 'ℹ' },
    warning: { bg: 'rgba(255, 193, 7, 0.15)', border: '#ffc107', icon: '⚠' }
  }

  const style = colors[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        background: style.bg,
        border: `2px solid ${style.border}`,
        borderRadius: 12,
        padding: '16px 20px',
        boxShadow: `0 4px 20px ${style.bg}`,
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        fontFamily: 'Rajdhani, sans-serif'
      }}
      onClick={() => onRemove(toast.id)}
    >
      <div style={{
        fontSize: 24,
        color: style.border,
        fontWeight: 'bold',
        minWidth: 24,
        textAlign: 'center'
      }}>
        {style.icon}
      </div>
      <div style={{
        color: '#eaeaf0',
        fontSize: 16,
        lineHeight: 1.4,
        flex: 1
      }}>
        {toast.message}
      </div>
      <div style={{
        fontSize: 12,
        color: style.border,
        opacity: 0.6,
        cursor: 'pointer'
      }}>
        ✕
      </div>
    </motion.div>
  )
}

// Toast hook for easy usage
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = (message: string, type: ToastMessage['type'] = 'info', duration?: number) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const success = (message: string, duration?: number) => addToast(message, 'success', duration)
  const error = (message: string, duration?: number) => addToast(message, 'error', duration)
  const info = (message: string, duration?: number) => addToast(message, 'info', duration)
  const warning = (message: string, duration?: number) => addToast(message, 'warning', duration)

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    info,
    warning
  }
}
