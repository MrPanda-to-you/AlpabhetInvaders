import { describe, it, expect } from 'vitest';
import { FeedbackSystem } from '../src/systems/feedback';

describe('Feedback System - letter outline', () => {
  it('spawns outline and expires after lifetime', () => {
    const fs = new FeedbackSystem({ outlineLifeMs: 120 });
    fs.outline('A', 5, 6);
    expect(fs.getOutlines().length).toBe(1);
    fs.update(60);
    expect(fs.getOutlines()[0].ageMs).toBe(60);
    fs.update(70);
    fs.purgeDead();
    expect(fs.getOutlines().length).toBe(0);
  });
});
