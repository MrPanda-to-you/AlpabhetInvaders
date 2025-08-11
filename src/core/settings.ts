import { getJSON, setJSON } from './storage';

export type AudioBus = 'master' | 'music' | 'sfx' | 'voice';

export interface AudioSettings {
  gains: Record<AudioBus, number>; // 0..1
}

const DEFAULT_AUDIO: AudioSettings = {
  gains: { master: 1, music: 1, sfx: 1, voice: 1 },
};

const KEY = 'ai.settings.audio.v1';

export function loadAudioSettings(): AudioSettings {
  const s = getJSON<AudioSettings>(KEY, DEFAULT_AUDIO);
  // clamp values defensively
  for (const k of Object.keys(s.gains) as AudioBus[]) {
    s.gains[k] = Math.max(0, Math.min(1, s.gains[k] ?? 1));
  }
  return s;
}

export function saveAudioSettings(s: AudioSettings) {
  // clamp before save
  const copy: AudioSettings = { gains: { ...DEFAULT_AUDIO.gains, ...s.gains } };
  for (const k of Object.keys(copy.gains) as AudioBus[]) {
    copy.gains[k] = Math.max(0, Math.min(1, copy.gains[k] ?? 1));
  }
  setJSON(KEY, copy);
}
