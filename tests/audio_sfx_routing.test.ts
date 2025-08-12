import { describe, it, expect } from 'vitest';
import { AudioSystem } from '../src/systems/audio';
import { registerSfxDefaults, preload, isRegistered } from '../src/core/assets';

// This test only verifies that playSfx computes effective gain and doesn't throw
// Actual HTMLAudioElement playback is skipped in jsdom via placeholder handling

describe('AudioSystem SFX routing', () => {
  it('routes through sfx bus and respects gains', async () => {
    registerSfxDefaults();
    // Preload will put placeholders in cache under jsdom
    await preload();
    expect(isRegistered('sfx/hit')).toBe(true);

    const audio = new AudioSystem({ getNow: () => 0 });
    audio.setBusGain('master', 0.5);
    audio.setBusGain('sfx', 0.6);

    const res = audio.playSfx('sfx/hit', { volume: 0.8 });
    expect(res.effectiveGain).toBeCloseTo(0.5 * 0.6 * 0.8, 5);
  });
});
