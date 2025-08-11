import { describe, it, expect } from 'vitest';
import { AudioSystem } from '../src/systems/audio';

// Verify equal-power crossfade envelope behavior

describe('AudioSystem music crossfade envelope', () => {
  it('produces equal-power envelope over fade duration', () => {
    let now = 0;
    const audio = new AudioSystem({ getNow: () => now, musicFadeMs: 1000 });

    // Start with A
    audio.setMusic('music/A');
    expect(audio.getMusicEnvelope()).toMatchObject({ currentKey: 'music/A', current: 1, previous: 0 });

    // Switch to B triggers crossfade
    audio.setMusic('music/B');
    const env0 = audio.getMusicEnvelope();
    expect(env0.currentKey).toBe('music/B');
    expect(env0.prevKey).toBe('music/A');
    expect(env0.current).toBeCloseTo(0, 5);
    expect(env0.previous).toBeCloseTo(1, 5);

    // Midway at 0.5s for 1s fade: sin/cos should be ~sqrt(2)/2
    now = 0.5;
    const envMid = audio.getMusicEnvelope();
    expect(envMid.current).toBeCloseTo(Math.SQRT1_2, 3);
    expect(envMid.previous).toBeCloseTo(Math.SQRT1_2, 3);

    // End at 1s: fully on B
    now = 1.0;
    const envEnd = audio.getMusicEnvelope();
    expect(envEnd.current).toBeCloseTo(1, 5);
    expect(envEnd.previous).toBeCloseTo(0, 5);
    expect(envEnd.currentKey).toBe('music/B');
  });

  it('fades to silence when clearing music', () => {
    let now = 0;
    const audio = new AudioSystem({ getNow: () => now, musicFadeMs: 1000 });
    audio.setMusic('music/A');
    audio.setMusic(undefined); // fade out
    let env = audio.getMusicEnvelope();
    expect(env.prevKey).toBe('music/A');
    expect(env.current).toBe(0);
    expect(env.previous).toBeCloseTo(1, 5);

    now = 0.5;
    env = audio.getMusicEnvelope();
    expect(env.current).toBe(0);
    expect(env.previous).toBeCloseTo(Math.SQRT1_2, 3);

    now = 1.1;
    env = audio.getMusicEnvelope();
    expect(env.current).toBe(0);
    expect(env.previous).toBeCloseTo(0, 3);
  });
});
