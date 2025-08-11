import { describe, it, expect } from 'vitest';
import { loadAudioSettings, saveAudioSettings } from '../src/core/settings';

// jsdom provides a localStorage implementation suitable for basic tests

describe('Audio settings persistence', () => {
  it('saves and loads clamped audio gains', () => {
    const original = loadAudioSettings();
    const mutated = { gains: { ...original.gains, music: 1.5, sfx: -0.2, master: 0.75 } };
    saveAudioSettings(mutated);
    const reloaded = loadAudioSettings();
    expect(reloaded.gains.master).toBeCloseTo(0.75, 5);
    expect(reloaded.gains.music).toBe(1);
    expect(reloaded.gains.sfx).toBe(0);
  });
});
