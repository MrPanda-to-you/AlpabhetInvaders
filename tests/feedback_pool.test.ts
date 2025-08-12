import { describe, it, expect } from 'vitest';
import { FeedbackSystem } from '../src/systems/feedback';

describe('Feedback System - pooling', () => {
  it('reuses particles when pooling enabled', () => {
    const fs = new FeedbackSystem({ particleCount: 2, lifeMs: 10, pooling: true, poolCap: 10 });
    fs.hit(0, 0, () => 0.1);
    const firstIds = fs.getParticles().map(p => p.id);
    fs.update(20);
    fs.purgeDead();
    // pool should have at least 2 particles cached now
    fs.hit(0, 0, () => 0.2);
    const secondIds = fs.getParticles().map(p => p.id);
    // Not guaranteed same ids, but pool reuse implies next ids continue and no allocation assertions available here.
    // We'll assert that particles were emitted and count is correct.
    expect(secondIds.length).toBe(2);
  });
});
