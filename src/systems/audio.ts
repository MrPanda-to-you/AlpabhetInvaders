import { getAsset, isLoaded } from '../core/assets';

export type BusName = 'master' | 'music' | 'sfx' | 'voice';

export interface AudioOptions {
  duckingDb?: number; // attenuation applied to music when voice active
  getNow?: () => number; // injectable clock for tests (seconds)
  duckFadeMs?: number; // fade out time for ducking tail (ms)
  musicFadeMs?: number; // crossfade duration for setMusic (ms)
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
  private currentMusic?: { key: string; startedAt: number };
  private previousMusic?: { key: string; switchAt: number };

  constructor(opts: AudioOptions = {}) {
    const { duckingDb = -6, getNow = () => performance.now() / 1000, duckFadeMs = 150, musicFadeMs = 400 } = opts;
    this.opts = { duckingDb, getNow, duckFadeMs, musicFadeMs } as Required<AudioOptions>;
  }

  // Convert decibels to linear gain multiplier
  private dbToGain(db: number) {
    return Math.pow(10, db / 20);
  }

  setBusGain(bus: BusName, gain: number) { this.buses[bus].gain = Math.max(0, Math.min(1, gain)); }
  mute(bus: BusName, muted = true) { this.buses[bus].muted = muted; }

  // Allow runtime updates to ducking configuration
  setDuckingDb(db: number) { this.opts.duckingDb = Math.max(-48, Math.min(0, db)); }
  setDuckFadeMs(ms: number) { this.opts.duckFadeMs = Math.max(0, Math.min(2000, ms)); }

  // Returns the effective gain for a bus including master and ducking
  getEffectiveGain(bus: BusName): number {
    const { master } = this.buses;
    const b = this.buses[bus];
    if (master.muted || b.muted) return 0;
    let g = master.gain * b.gain;
    if (bus === 'music') {
      // Apply crossfade envelope for current music
      const env = this.getMusicEnvelope();
      g *= env.current;
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

  playTelegraphSfx(intensity: 'light' | 'heavy' = 'light') {
    const key = intensity === 'heavy' ? 'sfx/telegraph_heavy' : 'sfx/telegraph_light';
    const volume = intensity === 'heavy' ? 0.8 : 0.6;
    this.playSfx(key, { volume });
  }

  // Simple music stem routing: store current stem key and return effective gain
  setMusic(key?: string) {
    const now = this.opts.getNow();
    // If changing to the same key, no-op
    if (key && this.currentMusic?.key === key) return this.getEffectiveGain('music');
    // Set previous to fade out
    if (this.currentMusic?.key) {
      this.previousMusic = { key: this.currentMusic.key, switchAt: now };
    } else {
      this.previousMusic = undefined;
    }
    // Set new current (or undefined for fade-to-silence)
    this.currentMusic = key ? { key, startedAt: now } : undefined;
    return this.getEffectiveGain('music');
  }

  getCurrentMusic() { return this.currentMusic?.key; }

  // Returns equal-power crossfade envelope for current/previous tracks
  // current/previous are scalar multipliers in [0,1]
  getMusicEnvelope() {
    const now = this.opts.getNow();
    const fadeMs = Math.max(1, this.opts.musicFadeMs);
    if (!this.currentMusic && !this.previousMusic) {
      // No music selected; treat envelope as pass-through so bus gain queries behave as before
      return { currentKey: undefined as string | undefined, prevKey: undefined as string | undefined, current: 1, previous: 0 };
    }
    // If no change in progress
    if (this.currentMusic && (!this.previousMusic || now - this.previousMusic.switchAt >= fadeMs / 1000)) {
      return { currentKey: this.currentMusic.key, prevKey: this.previousMusic?.key, current: 1, previous: 0 };
    }
    // If fading to silence (no current, have previous)
    if (!this.currentMusic && this.previousMusic) {
      const t = Math.min(1, (now - this.previousMusic.switchAt) / (fadeMs / 1000));
      const prev = Math.cos((Math.PI / 2) * t); // equal-power out
      return { currentKey: undefined, prevKey: this.previousMusic.key, current: 0, previous: prev };
    }
    // Crossfading between previous -> current
    if (this.currentMusic && this.previousMusic) {
      const t = Math.min(1, (now - this.previousMusic.switchAt) / (fadeMs / 1000));
      const prev = Math.cos((Math.PI / 2) * t);
      const curr = Math.sin((Math.PI / 2) * t);
      return { currentKey: this.currentMusic.key, prevKey: this.previousMusic.key, current: curr, previous: prev };
    }
    // Only current, no previous
    return { currentKey: this.currentMusic?.key, prevKey: undefined, current: 1, previous: 0 };
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
