import { describe, it, expect } from 'vitest';
import { FeedbackSystem } from '../src/systems/feedback';

function fixedRng() { return 0.5; }

describe('Feedback System', () => {
  it('spawns hit and miss bursts and updates positions', () => {
    const fs = new FeedbackSystem({ particleCount: 3, lifeMs: 200 });
    fs.hit(10, 10, fixedRng);
    fs.miss(20, 20, fixedRng);
    expect(fs.getParticles().length).toBe(6);
    const before = fs.getParticles().map((p) => ({ x: p.x, y: p.y }));
    fs.update(100); // move ~50-80 px/s
    const after = fs.getParticles().map((p) => ({ x: p.x, y: p.y }));
    expect(after.some((pos, i) => pos.x !== before[i].x || pos.y !== before[i].y)).toBe(true);
  });

  it('purges particles after lifetime', () => {
    const fs = new FeedbackSystem({ particleCount: 2, lifeMs: 100 });
    fs.hit(0, 0, fixedRng);
    fs.update(50);
    fs.update(60);
    fs.purgeDead();
    expect(fs.getParticles().length).toBe(0);
  });
});
