import { getAsset, isLoaded } from '../core/assets';

export type BusName = 'master' | 'music' | 'sfx' | 'voice';

export interface AudioOptions {
  duckingDb?: number; // attenuation applied to music when voice active
  getNow?: () => number; // injectable clock for tests (seconds)
  duckFadeMs?: number; // fade out time for ducking tail (ms)
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
    const { duckingDb = -6, getNow = () => performance.now() / 1000, duckFadeMs = 150 } = opts;
    this.opts = { duckingDb, getNow, duckFadeMs } as Required<AudioOptions>;
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
    if (bus === 'music') {
      const now = this.opts.getNow();
      if (now < this.voiceActiveUntil) {
        // Ease-out as we approach the tail end of the duck window
        const remainingMs = (this.voiceActiveUntil - now) * 1000;
        const fade = Math.max(1, this.opts.duckFadeMs);
        const t = Math.min(1, remainingMs / fade);
        const target = this.dbToGain(this.opts.duckingDb);
        const eased = target + (1 - target) * (1 - t);
        g *= eased;
      }
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

  // Generic SFX play: routes through 'sfx' bus and attempts to use asset cache
  playSfx(key: string, opts?: PlayOpts) {
    const vol = Math.max(0, Math.min(1, opts?.volume ?? 1));
    // Effective gain includes master and sfx bus
    const effective = this.getEffectiveGain('sfx') * vol;
    if (isLoaded(key)) {
      const asset = getAsset<unknown>(key);
      // Only attempt playback if this looks like an HTMLAudioElement
      // Avoid issues in jsdom where we cache placeholders.
      if (typeof HTMLAudioElement !== 'undefined' && asset instanceof HTMLAudioElement) {
        try {
          const inst = asset.cloneNode(true) as HTMLAudioElement;
          inst.volume = Math.max(0, Math.min(1, effective));
          // Fire and forget; ignore play() promise in browsers that require user gesture
          void inst.play?.();
        } catch {
          // ignore playback errors; test envs may not support audio
        }
      }
    }
    return { bus: 'sfx' as const, key, volume: vol, effectiveGain: effective };
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
  audio.playSfx(key, { volume });
    },
  };
}
