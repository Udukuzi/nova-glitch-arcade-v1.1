// Sound effects utility for Nova Arcade Glitch

class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map()
  private musicEnabled: boolean = true
  private sfxEnabled: boolean = true
  private currentMusic: HTMLAudioElement | null = null

  constructor() {
    // Load sound preference from localStorage
    const musicPref = localStorage.getItem('nova_music_enabled')
    const sfxPref = localStorage.getItem('nova_sfx_enabled')
    
    this.musicEnabled = musicPref !== 'false'
    this.sfxEnabled = sfxPref !== 'false'
  }

  // Create sound using Web Audio API or data URLs for simple sounds
  private createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.sfxEnabled) return

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = frequency
      oscillator.type = type

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    } catch (e) {
      console.warn('Audio not supported:', e)
    }
  }

  // Play button click sound
  playClick(): void {
    this.createBeep(800, 0.1, 'square')
  }

  // Play game start sound
  playGameStart(): void {
    if (!this.sfxEnabled) return
    this.createBeep(523, 0.1, 'sine') // C note
    setTimeout(() => this.createBeep(659, 0.1, 'sine'), 100) // E note
    setTimeout(() => this.createBeep(784, 0.2, 'sine'), 200) // G note
  }

  // Play game over sound
  playGameOver(): void {
    if (!this.sfxEnabled) return
    this.createBeep(392, 0.15, 'sine') // G note
    setTimeout(() => this.createBeep(349, 0.15, 'sine'), 150) // F note
    setTimeout(() => this.createBeep(294, 0.15, 'sine'), 300) // D note
    setTimeout(() => this.createBeep(262, 0.3, 'sine'), 450) // C note
  }

  // Play success/achievement sound
  playSuccess(): void {
    if (!this.sfxEnabled) return
    this.createBeep(523, 0.1, 'sine')
    setTimeout(() => this.createBeep(659, 0.1, 'sine'), 80)
    setTimeout(() => this.createBeep(784, 0.1, 'sine'), 160)
    setTimeout(() => this.createBeep(1047, 0.2, 'sine'), 240)
  }

  // Play error sound
  playError(): void {
    if (!this.sfxEnabled) return
    this.createBeep(200, 0.2, 'sawtooth')
  }

  // Play coin/point sound
  playCoin(): void {
    if (!this.sfxEnabled) return
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
    
    // Dispatch event for games to listen to
    window.dispatchEvent(new CustomEvent('nova_settings_changed', { 
      detail: { musicEnabled: this.musicEnabled, sfxEnabled: this.sfxEnabled } 
    }))
    
    return this.musicEnabled
  }

  // Toggle sound effects on/off
  toggleSFX(): boolean {
    this.sfxEnabled = !this.sfxEnabled
    localStorage.setItem('nova_sfx_enabled', String(this.sfxEnabled))
    
    // Dispatch event for games to listen to
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
}

// Export singleton instance
export const soundManager = new SoundManager()
