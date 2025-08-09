import { describe, it, expect } from 'vitest';
import { getFrameStats } from '../src/core/loop';

describe('loop stats', () => {
  it('exposes frame stats shape', () => {
    const s = getFrameStats();
    expect(s).toHaveProperty('totalFrames');
    expect(s).toHaveProperty('framesOver33ms');
  });
});
