import { describe, it, expect } from 'vitest';
import { FeedbackSystem } from '../src/systems/feedback';

describe('Feedback System - SFX hooks', () => {
  it('invokes hooks on hit/miss/outline', () => {
    const calls: string[] = [];
    const fs = new FeedbackSystem({
      sfx: {
        onHit: (x, y) => calls.push(`hit:${x},${y}`),
        onMiss: (x, y) => calls.push(`miss:${x},${y}`),
        onOutline: (letter, x, y) => calls.push(`outline:${letter}@${x},${y}`),
      },
    });
    fs.hit(1, 2, () => 0.1);
    fs.miss(3, 4, () => 0.2);
    fs.outline('Z', 5, 6);
    expect(calls).toEqual(['hit:1,2', 'miss:3,4', 'outline:Z@5,6']);
  });
});
