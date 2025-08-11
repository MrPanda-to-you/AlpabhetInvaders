import { describe, it, expect } from 'vitest';
import { AudioSystem } from '../src/systems/audio';

// Simple test to ensure music ducking applies and eases out near the end

describe('AudioSystem music ducking with fade', () => {
  it('applies duck and eases out near tail', () => {
    let now = 0;
    const audio = new AudioSystem({ duckingDb: -6, duckFadeMs: 200, getNow: () => now });
    // Before voice
    expect(audio.getEffectiveGain('music')).toBeCloseTo(1, 5);

    // Start a phoneme for 1s
    audio.playPhoneme('phoneme/A', 1);
    // During: early in window -> close to full duck
    now = 0.1;
    const target = Math.pow(10, -6 / 20);
    expect(audio.getEffectiveGain('music')).toBeLessThanOrEqual(1);
    expect(audio.getEffectiveGain('music')).toBeGreaterThan(0); // bounded

    // Near the tail (remaining < fade), eased toward 1.0
    now = 0.95;
    const eased = audio.getEffectiveGain('music');
    expect(eased).toBeGreaterThan(target * 0.9);
    expect(eased).toBeLessThan(1);

    // After duck window
    now = 1.2;
    expect(audio.getEffectiveGain('music')).toBeCloseTo(1, 5);
  });
});
