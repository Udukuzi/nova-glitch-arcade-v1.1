import { useState, useCallback, useRef, useEffect } from 'react'

interface UsePauseOptions {
  speedBoostDuration?: number // Duration of speed boost after unpause (ms)
  speedBoostMultiplier?: number // Speed multiplier (e.g., 1.2 = 20% faster)
  pauseCooldown?: number // Cooldown between pauses (ms)
}

export function usePause(options: UsePauseOptions = {}) {
  const {
    speedBoostDuration = 4000, // Longer boost duration
    speedBoostMultiplier = 1.5, // 50% faster after unpause (was 1.2)
    pauseCooldown = 3000 // Shorter cooldown
  } = options

  const [isPaused, setIsPaused] = useState(false)
  const [speedBoostActive, setSpeedBoostActive] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [currentSpeedMultiplier, setCurrentSpeedMultiplier] = useState(1.0)
  
  const speedBoostTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pause = useCallback(() => {
    if (cooldown || isPaused) return
    setIsPaused(true)
  }, [cooldown, isPaused])

  const resume = useCallback(() => {
    if (!isPaused) return
    
    setIsPaused(false)
    
    // Activate speed boost
    setSpeedBoostActive(true)
    setCurrentSpeedMultiplier(speedBoostMultiplier)
    
    // Clear speed boost after duration
    speedBoostTimeoutRef.current = setTimeout(() => {
      setSpeedBoostActive(false)
      setCurrentSpeedMultiplier(1.0)
    }, speedBoostDuration)
    
    // Start cooldown
    setCooldown(true)
    cooldownTimeoutRef.current = setTimeout(() => {
      setCooldown(false)
    }, pauseCooldown)
  }, [isPaused, speedBoostDuration, speedBoostMultiplier, pauseCooldown])

  const toggle = useCallback(() => {
    if (isPaused) {
      resume()
    } else {
      pause()
    }
  }, [isPaused, pause, resume])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (speedBoostTimeoutRef.current) {
        clearTimeout(speedBoostTimeoutRef.current)
      }
      if (cooldownTimeoutRef.current) {
        clearTimeout(cooldownTimeoutRef.current)
      }
    }
  }, [])

  return {
    isPaused,
    speedBoostActive,
    cooldown,
    currentSpeedMultiplier,
    pause,
    resume,
    toggle
  }
}
