import { describe, it, expect } from 'vitest';
import { makeEnemy, updateEnemy } from '../src/systems/enemies';

function stepEnemy(e: ReturnType<typeof makeEnemy>, ms: number, steps = 1) {
  const projectiles: any[] = [];
  const ctx = {
    width: 800,
    height: 600,
    emitProjectile: (p: any) => projectiles.push(p),
  };
  for (let i = 0; i < steps; i++) updateEnemy(e, ctx, ms / steps);
  return { e, projectiles };
}

describe('EnemySystem basic (T1.5)', () => {
  it('A: glide + pellet_slow emits projectiles over time', () => {
    const enemy = makeEnemy(100, 100, 'glide_horizontal', 'pellet_slow', 1);
    const { projectiles } = stepEnemy(enemy, 2000, 20);
    expect(projectiles.length).toBeGreaterThanOrEqual(2);
  });

  it('B: zigzag_burst changes direction and emits spread pellets', () => {
    const enemy = makeEnemy(200, 100, 'zigzag_burst', 'pellet_spread_2', 1);
    const { e, projectiles } = stepEnemy(enemy, 2000, 40);
    expect(projectiles.length).toBeGreaterThanOrEqual(2);
    // Expect x moved from start due to zigzag
    expect(Math.abs(e.x - 200)).toBeGreaterThan(5);
  });

  it('C: scuttle_side moves downward over time', () => {
    const enemy = makeEnemy(300, 100, 'scuttle_side', 'claw_lateral', 1);
    const { e, projectiles } = stepEnemy(enemy, 2000, 40);
    expect(e.y).toBeGreaterThan(100);
    expect(projectiles.length).toBeGreaterThanOrEqual(1);
  });
});
