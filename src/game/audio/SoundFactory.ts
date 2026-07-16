/**
 * All game audio is synthesized with WebAudio — no audio files.
 * The AudioContext is created lazily on the first user gesture.
 */
export class SoundFactory {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private spinNoise: { source: AudioBufferSourceNode; gain: GainNode } | null = null;
  private tensionOsc: { osc: OscillatorNode; gain: GainNode } | null = null;
  muted = false;

  private ensure(): AudioContext | null {
    if (typeof AudioContext === 'undefined') return null;
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private out(): GainNode | null {
    return this.muted ? null : this.master;
  }

  private blip(freq: number, dur: number, type: OscillatorType, vol: number, when = 0): void {
    const ctx = this.ensure();
    const out = this.out();
    if (!ctx || !out) return;
    const t = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  /** Filtered-noise loop while the reels spin. */
  startSpinLoop(): void {
    const ctx = this.ensure();
    const out = this.out();
    if (!ctx || !out || this.spinNoise) return;
    const len = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 520;
    filter.Q.value = 1.2;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.25);
    source.connect(filter).connect(gain).connect(out);
    source.start();
    this.spinNoise = { source, gain };
  }

  stopSpinLoop(): void {
    if (!this.ctx || !this.spinNoise) return;
    const { source, gain } = this.spinNoise;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.15);
    source.stop(this.ctx.currentTime + 0.2);
    this.spinNoise = null;
  }

  /** Low thunk + click when a reel lands. */
  reelStop(): void {
    this.blip(85, 0.16, 'sine', 0.5);
    this.blip(1400, 0.03, 'square', 0.12);
  }

  /** Rising sawtooth while anticipation reels keep spinning. */
  startTension(): void {
    const ctx = this.ensure();
    const out = this.out();
    if (!ctx || !out || this.tensionOsc) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(340, ctx.currentTime + 1.6);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.connect(gain).connect(out);
    osc.start();
    this.tensionOsc = { osc, gain };
  }

  stopTension(): void {
    if (!this.ctx || !this.tensionOsc) return;
    const { osc, gain } = this.tensionOsc;
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.1);
    osc.stop(this.ctx.currentTime + 0.15);
    this.tensionOsc = null;
  }

  /** Short ascending blip for win count-up ticks. */
  winTick(step: number): void {
    this.blip(500 + (step % 12) * 45, 0.06, 'square', 0.1);
  }

  /** Triad arpeggio fanfare (feature trigger / big win). */
  fanfare(): void {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((f, i) => this.blip(f, 0.28, 'triangle', 0.35, i * 0.12));
  }

  /** Rising sweep when the special symbol expands. */
  expand(): void {
    const ctx = this.ensure();
    const out = this.out();
    if (!ctx || !out) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(gain).connect(out);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  smallWin(): void {
    this.blip(660, 0.12, 'triangle', 0.3);
    this.blip(880, 0.18, 'triangle', 0.3, 0.09);
  }
}
