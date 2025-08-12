import { describe, it, expect } from 'vitest';
import { FeedbackSystem } from '../src/systems/feedback';

describe('Feedback System - style per effect', () => {
  it('assigns default style for hit vs miss', () => {
    const fs = new FeedbackSystem({ particleCount: 1 });
    fs.hit(0, 0, () => 0.5);
    fs.miss(0, 0, () => 0.5);
    const parts = fs.getParticles();
    expect(parts[0].kind).toBe('hit');
    expect(parts[1].kind).toBe('miss');
    expect(parts[0].color).not.toBe(parts[1].color);
    expect(parts[0].intensity).toBeGreaterThan(parts[1].intensity);
  });

  it('uses custom style from options', () => {
    const fs = new FeedbackSystem({ particleCount: 1, hitColor: '#000', missColor: '#111', hitIntensity: 2, missIntensity: 0.1 });
    fs.hit(0, 0, () => 0.5);
    fs.miss(0, 0, () => 0.5);
    const [h, m] = fs.getParticles();
    expect(h.color).toBe('#000');
    expect(m.color).toBe('#111');
    expect(h.intensity).toBe(2);
    expect(m.intensity).toBe(0.1);
  });
});
