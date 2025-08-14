import { describe, it, expect } from 'vitest';
import { loadArchetypes } from '../src/systems/archetypes';
import { createWave, generateGridSlots } from '../src/systems/spawner';

describe('Wave factory', () => {
  it('creates a wave end-to-end with default grid slots', () => {
    const arts = loadArchetypes();
    const res = createWave(arts, {} as any, 4, { reviewPercent: 0, rng: () => 0.1 });
    expect(res.enemies.length).toBe(4);
    expect(typeof res.compositeDifficulty).toBe('number');
  });

  it('uses supplied slots', () => {
    const arts = loadArchetypes();
    const slots = generateGridSlots(2, { originX: 100, originY: 50, cols: 2, dx: 20, dy: 10 });
    const res = createWave(arts, {} as any, 2, { reviewPercent: 0, rng: () => 0.1, slots });
    expect(res.enemies[0].x).toBe(100);
    expect(res.enemies[0].y).toBe(50);
    expect(typeof res.compositeDifficulty).toBe('number');
  });
  
  it('applies difficulty constraints', () => {
    const arts = loadArchetypes();
    const difficultyConfig = {
      maxPressureArchetypeRatio: 0.3,
      maxWaveToWaveIncrease: 0.15,
      pressureLetters: new Set(['X', 'Z', 'Q', 'J', 'K']),
    };
    const res = createWave(arts, {} as any, 10, {
      reviewPercent: 0,
      rng: () => 0.1,
      previousWaveDifficulty: 2.0,
      difficultyConfig,
    });
    expect(res.enemies.length).toBe(10);
    expect(res.compositeDifficulty).toBeGreaterThan(0);
  });
});
