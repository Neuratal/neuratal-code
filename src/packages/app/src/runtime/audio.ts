/**
 * Neuratal AudioFX Engine
 * Synthesizes tactile, futuristic UI sound effects using the Web Audio API.
 * Identical sound signature to Neuratal Web & Mobile.
 */

class AudioFXEngine {
  private ctx: AudioContext | null = null
  private _enabled = true

  constructor() {
    if (typeof window !== "undefined") {
      this._enabled = localStorage.getItem("rnlx_audio_fx") !== "false"
      // Lazily activate AudioContext on first user interaction to comply with autoplay policy
      const unlock = () => {
        this.init()
        window.removeEventListener("click", unlock)
        window.removeEventListener("keydown", unlock)
      }
      window.addEventListener("click", unlock, { once: true })
      window.addEventListener("keydown", unlock, { once: true })
    }
  }

  get enabled(): boolean {
    return this._enabled
  }

  set enabled(val: boolean) {
    this._enabled = val
    if (typeof window !== "undefined") {
      localStorage.setItem("rnlx_audio_fx", val ? "true" : "false")
    }
    if (val) {
      this.playToggle()
    }
  }

  init(): AudioContext | null {
    if (typeof window === "undefined") return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      void this.ctx.resume()
    }
    return this.ctx
  }

  /** Pleasant high-tech chord chime on dialog/menu open */
  playOpen() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      ;[523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = t + idx * 0.04
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, noteTime)
        gain.gain.setValueAtTime(0.06, noteTime)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.16)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteTime)
        osc.stop(noteTime + 0.16)
      })
    } catch {}
  }

  /** Soft descending whoosh on close */
  playClose() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(560, t)
      osc.frequency.exponentialRampToValueAtTime(260, t + 0.09)
      gain.gain.setValueAtTime(0.05, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.09)
    } catch {}
  }

  /** Subtle tactile click on tab switch */
  playTab() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "triangle"
      osc.frequency.setValueAtTime(950, t)
      osc.frequency.exponentialRampToValueAtTime(450, t + 0.035)
      gain.gain.setValueAtTime(0.04, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.035)
    } catch {}
  }

  /** Sleek button tap / toggle */
  playToggle() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(740, t)
      osc.frequency.exponentialRampToValueAtTime(420, t + 0.03)
      gain.gain.setValueAtTime(0.04, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.03)
    } catch {}
  }

  /** Button click */
  playClick() {
    this.playToggle()
  }

  /** Send message whoosh */
  playSend() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(320, t)
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.12)
      gain.gain.setValueAtTime(0.05, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.12)
    } catch {}
  }

  /** Celebratory success / purchase chime */
  playSuccess() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = t + idx * 0.075
        osc.type = "sine"
        osc.frequency.setValueAtTime(freq, noteTime)
        gain.gain.setValueAtTime(0.08, noteTime)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteTime)
        osc.stop(noteTime + 0.35)
      })
    } catch {}
  }

  /** Soft error chime */
  playError() {
    if (!this._enabled) return
    try {
      const ctx = this.init()
      if (!ctx) return
      const t = ctx.currentTime
      ;[330, 260].forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteTime = t + idx * 0.12
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(freq, noteTime)
        gain.gain.setValueAtTime(0.03, noteTime)
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(noteTime)
        osc.stop(noteTime + 0.1)
      })
    } catch {}
  }
}

export const AudioFX = new AudioFXEngine()
