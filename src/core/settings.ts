import { getJSON, setJSON } from './storage';

export type AudioBus = 'master' | 'music' | 'sfx' | 'voice';

export interface AudioSettings {
  gains: Record<AudioBus, number>; // 0..1
  duckFadeMs?: number; // 0..1000
  duckingDb?: number; // e.g., -6, -9
}

export const DEFAULT_AUDIO: AudioSettings = {
  gains: { master: 1, music: 1, sfx: 1, voice: 1 },
  duckFadeMs: 150,
  duckingDb: -6,
};

const KEY = 'ai.settings.audio.v1';

export function loadAudioSettings(): AudioSettings {
  const s = getJSON<AudioSettings>(KEY, DEFAULT_AUDIO);
  // clamp values defensively
  for (const k of Object.keys(s.gains) as AudioBus[]) {
    s.gains[k] = Math.max(0, Math.min(1, s.gains[k] ?? 1));
  }
  // clamp config
  s.duckFadeMs = Math.max(0, Math.min(1000, s.duckFadeMs ?? DEFAULT_AUDIO.duckFadeMs!));
  const db = s.duckingDb ?? DEFAULT_AUDIO.duckingDb!;
  s.duckingDb = Math.max(-48, Math.min(0, db));
  return s;
}

export function saveAudioSettings(s: AudioSettings) {
  // clamp before save
  const copy: AudioSettings = {
    gains: { ...DEFAULT_AUDIO.gains, ...s.gains },
    duckFadeMs: s.duckFadeMs ?? DEFAULT_AUDIO.duckFadeMs,
    duckingDb: s.duckingDb ?? DEFAULT_AUDIO.duckingDb,
  };
  for (const k of Object.keys(copy.gains) as AudioBus[]) {
    copy.gains[k] = Math.max(0, Math.min(1, copy.gains[k] ?? 1));
  }
  copy.duckFadeMs = Math.max(0, Math.min(1000, copy.duckFadeMs ?? DEFAULT_AUDIO.duckFadeMs!));
  const db = copy.duckingDb ?? DEFAULT_AUDIO.duckingDb!;
  copy.duckingDb = Math.max(-48, Math.min(0, db));
  setJSON(KEY, copy);
}
