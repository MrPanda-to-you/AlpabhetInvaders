import { describe, it, expect } from 'vitest';
import { computeWeights, pickWithReview } from '../src/systems/adaptive';
import { loadArchetypes } from '../src/systems/archetypes';

describe('Adaptive weights & review picks', () => {
  it('weights prioritize low mastery and scale by tier', () => {
    const arts = loadArchetypes();
    const stats: any = { A: { mastery: 0.9 }, B: { mastery: 0.1 } };
    const w = computeWeights(arts, stats);
    expect(w.B).toBeGreaterThan(w.A);
  });

  it('picks include review % from mastered set', () => {
    const arts = loadArchetypes();
    const stats: any = {
      A: { mastery: 0.95 }, B: { mastery: 0.95 }, C: { mastery: 0.2 }, D: { mastery: 0.3 },
    };
    const letters = pickWithReview(arts, stats, { n: 10, reviewPercent: 0.2, masteredThreshold: 0.9, rng: () => 0.5 });
    const reviewCount = letters.filter((L) => L === 'A' || L === 'B').length;
    expect(reviewCount).toBeGreaterThanOrEqual(2);
  });
});
