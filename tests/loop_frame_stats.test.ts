import { describe, it, expect } from 'vitest';
import { setUpdater, setRenderer, frame, getFrameStats } from '../src/core/loop';

describe('loop frame stats & interpolation', () => {
  it('accumulates frame metrics and calls renderer with alpha', () => {
    let updates = 0;
    let renders = 0;
    let lastAlpha = -1;
    setUpdater((dt) => { expect(dt).toBeGreaterThan(0); updates++; });
    setRenderer((alpha) => { renders++; lastAlpha = alpha; });

    // Simulate a few frames with 16ms delta
    let now = performance.now();
    for (let i = 0; i < 10; i++) {
      now += 16;
      frame(now);
    }

    const stats = getFrameStats();
    expect(stats.totalFrames).toBeGreaterThan(0);
    expect(stats.avgFrameMs).toBeGreaterThanOrEqual(0);
    expect(renders).toBeGreaterThan(0);
    expect(lastAlpha).toBeGreaterThanOrEqual(0);
    expect(lastAlpha).toBeLessThan(1.01);
    expect(updates).toBeGreaterThan(0);
  });
});
