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

  it('wires to audio adapter for outline phoneme and sfx for hit/miss', () => {
    const calls: string[] = [];
    const audio = {
      playPhoneme: (letter: string, duration: number) => calls.push(`voice:${letter}:${duration}`),
      playSfx: (key: string, vol?: number) => calls.push(`sfx:${key}:${vol ?? 1}`),
    };
    const fs = new FeedbackSystem({ audio });
    fs.hit(0, 0, () => 0.1);
    fs.miss(0, 0, () => 0.2);
    fs.outline('a', 0, 0);
    expect(calls).toEqual([
      'sfx:sfx/hit:0.9',
      'sfx:sfx/miss:0.6',
      'voice:a:0.5',
    ]);
  });
});
