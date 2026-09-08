/**
 * @file notification-sound.ts
 * @description Web Audio API synthesized notification sound player.
 * Plays high-fidelity, pleasant dual-tone chimes without external audio asset dependencies.
 */

class NotificationAudioEngine {
  private audioCtx: AudioContext | null = null
  private isMuted: boolean = false

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("meeo_notification_sound_muted")
      this.isMuted = saved === "true"
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass()
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume()
    }
    return this.audioCtx
  }

  /**
   * Plays a crisp dual-tone notification chime (Marimba / Bell chime: E5 ➔ B5 ➔ E6 harmonic)
   */
  public playChime() {
    if (this.isMuted) return

    try {
      const ctx = this.getContext()
      if (!ctx) return

      const now = ctx.currentTime

      // Tone 1 (Warm Fundamental - 659.25 Hz - E5)
      const osc1 = ctx.createOscillator()
      const gain1 = ctx.createGain()
      osc1.type = "sine"
      osc1.frequency.setValueAtTime(659.25, now)
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12)
      gain1.gain.setValueAtTime(0.18, now)
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35)
      osc1.connect(gain1)
      gain1.connect(ctx.destination)
      osc1.start(now)
      osc1.stop(now + 0.35)

      // Tone 2 (Sparkle High Harmonic - 1318.5 Hz - E6)
      const osc2 = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "triangle"
      osc2.frequency.setValueAtTime(1318.5, now + 0.08)
      gain2.gain.setValueAtTime(0.001, now)
      gain2.gain.setValueAtTime(0.12, now + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5)
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      osc2.start(now + 0.08)
      osc2.stop(now + 0.5)
    } catch {
      // Graceful fallback if audio context blocked before user interaction
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted
    if (typeof window !== "undefined") {
      localStorage.setItem("meeo_notification_sound_muted", String(muted))
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted
  }
}

export const notificationAudio = new NotificationAudioEngine()
