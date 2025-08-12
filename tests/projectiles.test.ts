import { describe, it, expect } from 'vitest';
import { makeProjectile, updateProjectiles, purgeDead } from '../src/systems/projectiles';

describe('Projectiles update and culling', () => {
  it('moves and culls out-of-bounds', () => {
    const p = makeProjectile({ x: 5, y: 5, vx: 1000, vy: 0, radius: 2 });
    const arr = [p];
  updateProjectiles(arr, 10, { width: 20, height: 20 }); // +10px
  expect(p.x).toBeCloseTo(15, 5);
  // Still within width+margin (20 + radius + 4 = 26)
  expect(p.alive).toBe(true);
  updateProjectiles(arr, 2000, { width: 20, height: 20 }); // +2000px more
    expect(p.alive).toBe(false);
    purgeDead(arr);
    expect(arr.length).toBe(0);
  });
});
