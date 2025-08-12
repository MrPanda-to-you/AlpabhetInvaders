import { describe, it, expect } from 'vitest';
import { spawnWave } from '../src/systems/spawner';

describe('Spawner v1', () => {
  it('spawns enemies into slots using per-letter mappings', () => {
    const slots = Array.from({ length: 3 }, (_, i) => ({ x: i * 10, y: 0 }));
    const res = spawnWave(slots, {
      letters: ['A', 'B', 'C'],
      movementByLetter: { A: 'glide_horizontal', B: 'zigzag_burst', C: 'scuttle_side' } as any,
      attackByLetter: { A: 'pellet_slow', B: 'pellet_spread_2', C: 'claw_lateral' } as any,
      hpByLetter: { B: 2 },
    });
    expect(res.enemies.length).toBe(3);
    expect(res.enemies[1].movementId).toBe('zigzag_burst');
    expect(res.enemies[2].attackId).toBe('claw_lateral');
    expect(res.enemies[1].hp).toBe(2);
  });
});
