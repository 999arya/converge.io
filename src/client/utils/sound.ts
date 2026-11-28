/**
 * Retro 8-bit Web Audio Sound Synthesizer
 * Plays crunchy Minecraft/retro arcade sound effects with 0 external asset loading.
 * A quiet chiptune bed starts on the first click and follows the mute toggle.
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('converge_sound_muted');
      this.isMuted = stored === 'true';
    }
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined' || !window.AudioContext) return null;

    if (!this.ctx) {
      this.ctx = new window.AudioContext();
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  /** Every sound call also starts the looping background bed after a user gesture. */
  private getSoundContext(): AudioContext | null {
    const ctx = this.getContext();
    if (ctx) {
      this.startAmbience(ctx);
    }
    return ctx;
  }

  private startAmbience(ctx: AudioContext): void {
    if (this.isMuted || this.ambientGain) return;

    try {
      const gain = ctx.createGain();
      gain.gain.value = 0.022;
      gain.connect(ctx.destination);

      const noteDurationSeconds = 0.5;
      const notes = [
        130.81, 164.81, 196, 164.81, 146.83, 174.61, 220, 174.61,
        130.81, 164.81, 196, 246.94, 146.83, 174.61, 196, 174.61,
      ];
      const samplesPerNote = Math.floor(ctx.sampleRate * noteDurationSeconds);
      const buffer = ctx.createBuffer(
        1,
        samplesPerNote * notes.length,
        ctx.sampleRate
      );
      const samples = buffer.getChannelData(0);

      for (let i = 0; i < samples.length; i += 1) {
        const frequency = notes[Math.floor(i / samplesPerNote) % notes.length] ?? 130.81;
        const localTime = (i % samplesPerNote) / ctx.sampleRate;
        const attack = Math.min(1, localTime / 0.02);
        const release = Math.min(1, (noteDurationSeconds - localTime) / 0.08);
        const envelope = Math.max(0, Math.min(attack, release));
        const fundamental = Math.sin(2 * Math.PI * frequency * localTime);
        const harmonic = Math.sin(4 * Math.PI * frequency * localTime) * 0.18;
        samples[i] = envelope * (fundamental + harmonic) * 0.5;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.connect(gain);
      source.start();

      this.ambientGain = gain;
    } catch {
      // Ambient audio is optional if Web Audio is unavailable.
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('converge_sound_muted', this.isMuted.toString());
    }

    if (this.ambientGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.ambientGain.gain.cancelScheduledValues(now);
      this.ambientGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.022, now, 0.03);
    }

    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playClick(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio autoplay or restriction handled gracefully
    }
  }

  public playSelect(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      // ignore
    }
  }

  public playDeselect(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch {
      // ignore
    }
  }

  public playSuccess(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      const notes = [392, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.08;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.12);
      });
    } catch {
      // ignore
    }
  }

  public playError(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // ignore
    }
  }

  public playWinFanfare(): void {
    const ctx = this.getSoundContext();
    if (!ctx) return;

    try {
      // Retro triumphant arpeggio
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = ctx.currentTime + idx * 0.07;
        const duration = idx === notes.length - 1 ? 0.35 : 0.1;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // ignore
    }
  }
}

export const sounds = new SoundEffects();
