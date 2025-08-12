import { describe, it, expect } from 'vitest';
import { AudioSystem } from '../src/systems/audio';

// Basic test for music stem routing scaffold

describe('AudioSystem music stem routing', () => {
  it('stores and reports current music stem key', () => {
    const audio = new AudioSystem({ getNow: () => 0 });
    expect(audio.getCurrentMusic()).toBeUndefined();
    const g = audio.setMusic('music/idle');
    expect(audio.getCurrentMusic()).toBe('music/idle');
    expect(g).toBeCloseTo(audio.getEffectiveGain('music'), 5);
    audio.setMusic(undefined);
    expect(audio.getCurrentMusic()).toBeUndefined();
  });
});
