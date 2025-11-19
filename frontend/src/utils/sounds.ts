// Sound effects utility for Nova Arcade Glitch - FIXED VERSION

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicEnabled: boolean = true
  private sfxEnabled: boolean = true
  private currentMusic: HTMLAudioElement | null = null
  private audioContext: AudioContext | null = null
  private isInitialized: boolean = false

  constructor() {
    // Load sound preference from localStorage
    const musicPref = localStorage.getItem('nova_music_enabled')
    const sfxPref = localStorage.getItem('nova_sfx_enabled')
    
    this.musicEnabled = musicPref !== 'false'
    this.sfxEnabled = sfxPref !== 'false'

    console.log('🔊 SoundManager initialized - waiting for user interaction')
  }

  // Initialize audio context on first sound play
  private ensureAudioContext(): void {
    if (this.audioContext && this.audioContext.state === 'running') {
      return // Already good
    }

    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log('🎵 AudioContext created, state:', this.audioContext.state)
      }

      // Resume if suspended
      if (this.audioContext.state === 'suspended') {
        console.log('⏸️ AudioContext suspended, attempting resume...')
        this.audioContext.resume().then(() => {
          console.log('✅ AudioContext resumed successfully')
          this.isInitialized = true
        }).catch(e => {
          console.error('❌ Failed to resume AudioContext:', e)
        })
      } else if (this.audioContext.state === 'running') {
        console.log('✅ AudioContext already running')
        this.isInitialized = true
      }
    } catch (e) {
      console.error('❌ AudioContext initialization failed:', e)
    }
  }

  // Create sound using Web Audio API
  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.sfxEnabled) {
      console.log('🔇 SFX disabled, skipping sound')
      return
    }

    // Ensure audio context is ready
    this.ensureAudioContext()

    if (!this.audioContext || this.audioContext.state !== 'running') {
      console.warn('⚠️ AudioContext not ready, state:', this.audioContext?.state)
      return
    }

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)

      console.log(`🎵 Playing ${frequency}Hz ${type} for ${duration}s`)
    } catch (e) {
      console.error('❌ Failed to play sound:', e)
    }
  }

  // Play button click sound
  playClick(): void {
    console.log('🖱️ Click sound requested')
    this.createBeep(800, 0.1, 'square')
  }

  // Play game start sound
  playGameStart(): void {
    if (!this.sfxEnabled) return
    console.log('🎮 Game start sound requested')
    this.createBeep(523, 0.1, 'sine') // C note
    setTimeout(() => this.createBeep(659, 0.1, 'sine'), 100) // E note
    setTimeout(() => this.createBeep(784, 0.2, 'sine'), 200) // G note
  }

  // Play game over sound
  playGameOver(): void {
    if (!this.sfxEnabled) return
    console.log('💀 Game over sound requested')
    this.createBeep(392, 0.15, 'sine') // G note
    setTimeout(() => this.createBeep(349, 0.15, 'sine'), 150) // F note
    setTimeout(() => this.createBeep(294, 0.15, 'sine'), 300) // D note
    setTimeout(() => this.createBeep(262, 0.3, 'sine'), 450) // C note
  }

  // Play success/achievement sound
  playSuccess(): void {
    if (!this.sfxEnabled) return
    console.log('✨ Success sound requested')
    this.createBeep(523, 0.1, 'sine')
    setTimeout(() => this.createBeep(659, 0.1, 'sine'), 80)
    setTimeout(() => this.createBeep(784, 0.1, 'sine'), 160)
    setTimeout(() => this.createBeep(1047, 0.2, 'sine'), 240)
  }

  // Play error sound
  playError(): void {
    if (!this.sfxEnabled) return
    console.log('❌ Error sound requested')
    this.createBeep(200, 0.2, 'sawtooth')
  }

  // Play coin/point sound
  playCoin(): void {
    if (!this.sfxEnabled) return
    console.log('💰 Coin sound requested')
    this.createBeep(1000, 0.05, 'square')
    setTimeout(() => this.createBeep(1200, 0.1, 'square'), 50)
  }

  // Toggle music on/off
  toggleMusic(): boolean {
    this.musicEnabled = !this.musicEnabled
    localStorage.setItem('nova_music_enabled', String(this.musicEnabled))
    
    if (!this.musicEnabled && this.currentMusic) {
      this.currentMusic.pause()
    } else if (this.musicEnabled && this.currentMusic) {
      this.currentMusic.play().catch(e => console.warn('Music play failed:', e))
    }
    
    window.dispatchEvent(new CustomEvent('nova_settings_changed', { 
      detail: { musicEnabled: this.musicEnabled, sfxEnabled: this.sfxEnabled } 
    }))
    
    return this.musicEnabled
  }

  // Toggle sound effects on/off
  toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled
    localStorage.setItem('nova_sfx_enabled', String(this.sfxEnabled))
    console.log('🔊 SFX toggled:', this.sfxEnabled)
    
    window.dispatchEvent(new CustomEvent('nova_settings_changed', { 
      detail: { musicEnabled: this.musicEnabled, sfxEnabled: this.sfxEnabled } 
    }))
    
    return this.sfxEnabled
  }

  // Get current states
  isMusicEnabled(): boolean {
    return this.musicEnabled
  }

  isSFXEnabled(): boolean {
    return this.sfxEnabled
  }

  // Manually unlock audio context (for debugging)
  unlockAudio(): void {
    console.log('🔓 Manual unlock requested')
    this.ensureAudioContext()
  }

  // Check if audio is unlocked
  isAudioUnlocked(): boolean {
    const unlocked = this.audioContext?.state === 'running'
    console.log('🔍 Audio unlocked check:', unlocked, 'state:', this.audioContext?.state)
    return unlocked
  }

  // Get AudioContext state for debugging
  getAudioState(): string {
    return this.audioContext?.state || 'not created'
  }
}

// Export singleton instance
export const soundManager = new SoundManager()

// Make it globally available for debugging
if (typeof window !== 'undefined') {
  (window as any).soundManager = soundManager
  console.log('🌍 soundManager available globally at window.soundManager')
}
