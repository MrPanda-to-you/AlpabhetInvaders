import { describe, it, expect } from 'vitest';
import { makeEnemy, updateEnemies } from '../src/systems/enemies';
import { updateProjectiles, purgeDead } from '../src/systems/projectiles';

type P = { x: number; y: number; vx: number; vy: number; radius: number; alive?: boolean };

describe('Performance harness (T1.14) – dense scene smoke', () => {
  it('runs 3s simulated time with 20 enemies + 30 projectiles without throwing', () => {
    const enemies = [
      makeEnemy(50, 50, 'glide_horizontal', 'pellet_slow', 2),
      makeEnemy(90, 80, 'zigzag_burst', 'pellet_spread_2', 2),
      makeEnemy(130, 60, 'scuttle_side', 'claw_lateral', 3),
      makeEnemy(170, 70, 'sine_hover', 'flame_cone_dot', 3),
      makeEnemy(210, 50, 'high_dive', 'dive_strike', 2),
      makeEnemy(250, 60, 'slow_drift_shield', 'charged_heavy', 3),
      makeEnemy(290, 65, 'phase_drift', 'visible_only_shot', 2),
      makeEnemy(330, 75, 'track_x', 'narrow_fast', 2),
      makeEnemy(370, 55, 'cluster_drift', 'micro_pellets_swarm', 2),
      makeEnemy(410, 45, 'horizontal_dash', 'backward_exhaust', 2),
      makeEnemy(450, 85, 'armored_step', 'reflect_then_strike', 3),
      makeEnemy(490, 95, 'vertical_bob', 'beam_continuous', 3),
      makeEnemy(530, 60, 'large_oscillation', 'area_shockwave', 4),
      makeEnemy(570, 55, 'short_teleport', 'shuriken_diagonal', 3),
      makeEnemy(610, 50, 'tentacle_wave', 'ink_radial_slow', 4),
      makeEnemy(650, 70, 'progressive_speedup', 'escalating_burst', 3),
      makeEnemy(690, 65, 'multi_phase_mix', 'summon_minions_spiral', 5),
      makeEnemy(730, 60, 'clockwork_step', 'timed_volley', 3),
      makeEnemy(770, 55, 'morph_cycle', 'ink_cloud_dim', 3),
      makeEnemy(810, 50, 'zigzag_descent', 'chain_lightning', 3),
    ];

    const projectiles: P[] = [];
    const ctx = {
      width: 960,
      height: 540,
      emitProjectile: (p: P) => projectiles.push({ ...p, alive: true }),
    };

    for (let i = 0; i < 30; i++) projectiles.push({ x: 100 + i * 10, y: 100, vx: 0, vy: 200, radius: 3, alive: true });

    const dt = 16; // ~60Hz
    const steps = Math.floor(3000 / dt);
    for (let i = 0; i < steps; i++) {
      updateEnemies(enemies, ctx as any, dt);
      updateProjectiles(projectiles as any, dt, { width: ctx.width, height: ctx.height });
      purgeDead(projectiles as any);
      if (projectiles.length > 400) projectiles.splice(0, 100);
    }

    expect(projectiles.length).toBeGreaterThan(30);
  });
});
