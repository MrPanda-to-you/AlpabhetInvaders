export type BusName = 'master' | 'music' | 'sfx' | 'voice';

export interface AudioOptions {
  duckingDb?: number; // attenuation applied to music when voice active
  getNow?: () => number; // injectable clock for tests
}

export interface PlayOpts {
  volume?: number; // 0..1 pre-bus
}

interface BusState {
  gain: number; // 0..1
  muted: boolean;
}

export class AudioSystem {
  private opts: Required<AudioOptions>;
  private buses: Record<BusName, BusState> = {
    master: { gain: 1, muted: false },
    music: { gain: 1, muted: false },
    sfx: { gain: 1, muted: false },
    voice: { gain: 1, muted: false },
  };
  private voiceActiveUntil = 0;

  constructor(opts: AudioOptions = {}) {
    const { duckingDb = -6, getNow = () => performance.now() / 1000 } = opts;
    this.opts = { duckingDb, getNow };
  }

  // Convert decibels to linear gain multiplier
  private dbToGain(db: number) {
    return Math.pow(10, db / 20);
  }

  setBusGain(bus: BusName, gain: number) { this.buses[bus].gain = Math.max(0, Math.min(1, gain)); }
  mute(bus: BusName, muted = true) { this.buses[bus].muted = muted; }

  // Returns the effective gain for a bus including master and ducking
  getEffectiveGain(bus: BusName): number {
    const { master } = this.buses;
    const b = this.buses[bus];
    if (master.muted || b.muted) return 0;
    let g = master.gain * b.gain;
    if (bus === 'music' && this.isVoiceActive()) {
      g *= this.dbToGain(this.opts.duckingDb);
    }
    return g;
  }

  isVoiceActive(): boolean {
    return this.opts.getNow() < this.voiceActiveUntil;
  }

  // Simulate playing a phoneme on the voice bus; returns effective gain snapshot
  playPhoneme(key: string, durationSec: number, opts?: PlayOpts) {
    // In a future step we will route to actual AudioBuffer/HTMLAudioElement
    const now = this.opts.getNow();
    this.voiceActiveUntil = Math.max(this.voiceActiveUntil, now + Math.max(0, durationSec));
    const vol = Math.max(0, Math.min(1, opts?.volume ?? 1));
    return {
      bus: 'voice' as const,
      key,
      volume: vol,
      effectiveGain: this.getEffectiveGain('voice') * vol,
      musicGainWhileDucked: this.getEffectiveGain('music'),
    };
  }
}

export function makeDefaultAudio(opts?: AudioOptions) {
  return new AudioSystem(opts);
}

// Lightweight adapter for FeedbackSystem wiring
export interface FeedbackAudioAdapter {
  playPhoneme(letter: string, durationSec: number): void;
  playSfx?(key: string, volume?: number): void;
}

export function makeFeedbackAudioAdapter(audio: AudioSystem): FeedbackAudioAdapter {
  return {
    playPhoneme: (letter: string, durationSec: number) => {
      // Map letter to asset key pattern used by assets registry
      const L = (letter || '').toUpperCase();
      audio.playPhoneme(`phoneme/${L}`, durationSec);
    },
    playSfx: (key: string, volume?: number) => {
      // For now, this is a no-op placeholder; later route to sfx bus
      // and potentially to HTMLAudioElement via assets cache
      void key; void volume;
    },
  };
}
