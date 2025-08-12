import { describe, it, expect } from 'vitest';
import { loadArchetypes } from '../src/systems/archetypes';
import { buildRecipeFromArchetypes, generateWaveLetters, spawnWave } from '../src/systems/spawner';

function fixedRng(seq: number[]): () => number {
  let i = 0;
  return () => seq[(i++) % seq.length];
}

describe('Spawner integrates with adaptive picks', () => {
  it('builds a recipe from archetypes and spawns enemies', () => {
    const arts = loadArchetypes();
    const letters = ['A', 'B', 'C'] as const;
    const recipe = buildRecipeFromArchetypes(arts, letters as any);
    const res = spawnWave([{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }], recipe);
    expect(res.enemies.length).toBe(3);
    expect(res.enemies[0].movementId).toBeDefined();
    expect(res.enemies[0].attackId).toBeDefined();
  });

  it('generates letters with review guarantee', () => {
    const arts = loadArchetypes();
    const stats: any = { A: { mastery: 0.95 }, B: { mastery: 0.95 }, C: { mastery: 0.2 }, D: { mastery: 0.3 } };
    const letters = generateWaveLetters(arts, stats, 10, { reviewPercent: 0.2, masteredThreshold: 0.9, rng: fixedRng([0.1, 0.7, 0.4]) });
    const reviewCount = letters.filter((L) => L === 'A' || L === 'B').length;
    expect(reviewCount).toBeGreaterThanOrEqual(2);
  });
});
