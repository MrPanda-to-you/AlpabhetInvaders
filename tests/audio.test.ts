import { describe, it, expect, vi } from 'vitest';
import { AudioSystem } from '../src/systems/audio';

describe('AudioSystem', () => {
  it('applies ducking to music when voice is active', () => {
    let now = 100;
    const audio = new AudioSystem({ duckingDb: -6, getNow: () => now });
    // Before voice, music at full gain
    expect(audio.getEffectiveGain('music')).toBeCloseTo(1, 5);

    // Play a phoneme for 1s
    const res = audio.playPhoneme('A', 1);
    // During voice active, music should be ducked by ~ -6dB => ~0.501
    expect(res.bus).toBe('voice');
    expect(audio.isVoiceActive()).toBe(true);
    expect(audio.getEffectiveGain('music')).toBeCloseTo(Math.pow(10, -6 / 20), 3);

    // After duration passes, ducking lifts
    now += 1.1;
    expect(audio.isVoiceActive()).toBe(false);
    expect(audio.getEffectiveGain('music')).toBeCloseTo(1, 5);
  });

  it('honors bus gains and mutes in effectiveGain', () => {
    let now = 0;
    const audio = new AudioSystem({ getNow: () => now });
    audio.setBusGain('master', 0.8);
    audio.setBusGain('music', 0.5);
    expect(audio.getEffectiveGain('music')).toBeCloseTo(0.4, 5);

    audio.mute('music', true);
    expect(audio.getEffectiveGain('music')).toBe(0);

    audio.mute('music', false);
    audio.mute('master', true);
    expect(audio.getEffectiveGain('music')).toBe(0);
  });

  it('playPhoneme returns snapshot with effective gains', () => {
    let now = 5;
    const audio = new AudioSystem({ duckingDb: -12, getNow: () => now });
    audio.setBusGain('master', 0.5);
    audio.setBusGain('voice', 0.8);
    const res = audio.playPhoneme('B', 0.5, { volume: 0.75 });
    expect(res.key).toBe('B');
    expect(res.effectiveGain).toBeCloseTo(0.5 * 0.8 * 0.75, 5);
    expect(audio.getEffectiveGain('music')).toBeCloseTo(Math.pow(10, -12 / 20) * 0.5 * 1, 3);
  });
});
