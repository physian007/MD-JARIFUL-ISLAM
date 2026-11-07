/**
 * Neon Dash - Procedural Web Audio API Synthesizer
 * 100% Original Audio Synthesis - Zero external sound files or 404 dependencies.
 * All waveforms, frequencies, and rhythms are procedurally calculated in code.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  
  private isMusicPlaying = false;
  private musicTimerId: number | null = null;
  private currentStep = 0;
  private bpm = 126;
  
  public musicEnabled = true;
  public sfxEnabled = true;
  public musicVolume = 0.55;
  public sfxVolume = 0.8;

  constructor() {
    // AudioContext will be initialized on first user interaction to comply with browser autoplay policies
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicEnabled ? this.musicVolume : 0, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxEnabled ? this.sfxVolume : 0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public unlockAudio() {
    this.initContext();
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(enabled ? this.musicVolume : 0, this.ctx.currentTime, 0.05);
    }
    if (enabled && !this.isMusicPlaying) {
      this.startMusic();
    } else if (!enabled && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(enabled ? this.sfxVolume : 0, this.ctx.currentTime, 0.05);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx && this.musicEnabled) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx && this.sfxEnabled) {
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, this.ctx.currentTime, 0.05);
    }
  }

  // ---- SOUND EFFECTS ----

  public playJump() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(560, t + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(2400, t + 0.18);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playSlide() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(400, t + 0.25);
    filter.Q.value = 3;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + 0.25);
  }

  public playOrb(combo = 0) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Pentatonic scale base frequencies: C5, D5, E5, G5, A5, C6...
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const baseFreq = notes[combo % notes.length];

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2, t);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.16);
    osc2.stop(t + 0.16);
  }

  public playGem() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const chords = [659.25, 830.61, 987.77, 1318.51]; // E major shimmer
    chords.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = t + idx * 0.05;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.18, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startT);
      osc.stop(startT + 0.35);
    });
  }

  public playPowerup(type?: string) {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type === 'shield' ? 'sine' : 'sawtooth';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(3200, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  public playShieldBreak() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(110, t + 0.08);
    osc.frequency.setValueAtTime(880, t + 0.16);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.35);
  }

  public playCrash() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    
    // Impact punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.4);

    oscGain.gain.setValueAtTime(0.5, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);

    // Noise burst
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + 0.4);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.45);
    noise.stop(t + 0.45);
  }

  public playRevive() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startT = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startT);

      gain.gain.setValueAtTime(0.2, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(startT);
      osc.stop(startT + 0.3);
    });
  }

  public playClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  // ---- PROCEDURAL SYNTHWAVE SOUNDTRACK ----

  public startMusic() {
    if (this.isMusicPlaying || !this.musicEnabled) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.currentStep = 0;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimerId !== null) {
      clearTimeout(this.musicTimerId);
      this.musicTimerId = null;
    }
  }

  private scheduleMusicStep() {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    const stepDuration = 60 / this.bpm / 4; // 16th note in seconds
    const t = this.ctx.currentTime;

    // Progression: 4 bars (64 steps)
    // Bar 1 (0-15): D minor (D2, 73.42 Hz)
    // Bar 2 (16-31): Bb major (Bb1, 58.27 Hz)
    // Bar 3 (32-47): F major (F2, 87.31 Hz)
    // Bar 4 (48-63): C major (C2, 65.41 Hz)

    const step = this.currentStep % 64;
    const bar = Math.floor(step / 16);
    const barStep = step % 16;

    // Root notes per bar
    const roots = [73.42, 58.27, 87.31, 65.41];
    const rootFreq = roots[bar];

    // 1. Kick on steps 0, 4, 8, 12 (Four-on-the-floor beat)
    if (barStep % 4 === 0) {
      this.playSynthKick(t);
    }

    // 2. Snare / Cyber Clap on steps 4, 12
    if (barStep === 4 || barStep === 12) {
      this.playSynthSnare(t);
    }

    // 3. Hi-hat on offbeats
    if (barStep % 2 === 1) {
      this.playSynthHiHat(t, barStep % 4 === 2 ? 0.08 : 0.04);
    }

    // 4. Synth Bass (16th note rolling arpeggio)
    const oct = barStep % 2 === 0 ? 1 : 2;
    this.playSynthBass(t, rootFreq * oct, stepDuration * 0.85);

    // 5. Arp synth / Lead melody (pentatonic cyber lead)
    if (barStep % 2 === 0) {
      const melodyNotes = [
        [293.66, 349.23, 440.0, 523.25], // D4, F4, A4, C5
        [233.08, 293.66, 349.23, 466.16], // Bb3, D4, F4, Bb4
        [261.63, 349.23, 440.0, 523.25], // C4, F4, A4, C5
        [261.63, 329.63, 392.0, 523.25]  // C4, E4, G4, C5
      ];
      const noteIdx = (barStep / 2) % 4;
      const arpFreq = melodyNotes[bar][noteIdx];
      this.playSynthArp(t, arpFreq, stepDuration * 0.9);
    }

    this.currentStep++;

    // Schedule next 16th note
    this.musicTimerId = window.setTimeout(() => {
      this.scheduleMusicStep();
    }, stepDuration * 1000);
  }

  private playSynthKick(t: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.frequency.setValueAtTime(130, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  private playSynthSnare(t: number) {
    if (!this.ctx || !this.musicGain) return;
    
    // Tonal pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);
    oscGain.gain.setValueAtTime(0.2, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(oscGain);
    oscGain.connect(this.musicGain);

    // Noise snap
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1000, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.musicGain);

    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.15);
    noise.stop(t + 0.15);
  }

  private playSynthHiHat(t: number, vol = 0.05) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(t);
    noise.stop(t + 0.05);
  }

  private playSynthBass(t: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + duration);
    filter.Q.value = 4;

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  private playSynthArp(t: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(t);
    osc.stop(t + duration);
  }
}

export const soundEngine = new SoundEngine();
