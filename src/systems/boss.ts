import { MovementRegistry, MovementStrategy, EnemyLike as MoveEnemy } from './movement';
import { AttackRegistry, AttackStrategy, EnemyLike as AttackEnemy } from './attacks';

export interface BossPhase {
  // Execute this phase when hp/maxHp <= threshold (0..1)
  threshold: number;
  movementId: string;
  attackId: string;
  telegraphMs?: number; // time to telegraph before phase becomes active
  addSpawns?: Array<{ count: number; movementId: string; attackId: string; hp?: number }>;
}

export interface Boss extends MoveEnemy, AttackEnemy {
  id: number;
  hp: number;
  maxHp: number;
  phases: BossPhase[];
  phaseIndex: number; // -1 before first phase
  telegraphTimer: number; // remaining telegraph time, ms
  active: boolean; // false when dead
}

export interface BossUpdateContext {
  width: number;
  height: number;
  emitProjectile: (p: { x: number; y: number; vx: number; vy: number; radius: number }) => void;
  spawnAdd: (spec: { x: number; y: number; movementId: string; attackId: string; hp: number }) => void;
}

let nextBossId = 1;

export function makeBoss(x: number, y: number, maxHp: number, phases: BossPhase[]): Boss {
  // Ensure phases sorted descending thresholds so we enter in order as hp decreases
  const sorted = phases.slice().sort((a, b) => b.threshold - a.threshold);
  return {
    id: nextBossId++,
    x, y,
    hp: maxHp, maxHp,
    phases: sorted,
    phaseIndex: -1,
    telegraphTimer: 0,
    active: true,
  };
}

export function applyDamage(b: Boss, dmg: number) {
  if (!b.active) return;
  b.hp = Math.max(0, b.hp - Math.max(0, dmg));
  if (b.hp === 0) b.active = false;
}

function currentPhase(b: Boss): BossPhase | null {
  if (b.phaseIndex < 0 || b.phaseIndex >= b.phases.length) return null;
  return b.phases[b.phaseIndex];
}

function maybeAdvancePhase(b: Boss, ctx: BossUpdateContext) {
  if (!b.active) return;
  const hpFrac = b.hp / b.maxHp;
  // Choose the deepest phase whose threshold is met (iterate from end)
  let nextIdx = -1;
  for (let i = b.phases.length - 1; i >= 0; i--) {
    if (hpFrac <= b.phases[i].threshold) { nextIdx = i; break; }
  }
  if (nextIdx !== -1 && nextIdx !== b.phaseIndex) {
    b.phaseIndex = nextIdx;
    const p = b.phases[nextIdx];
    b.telegraphTimer = p.telegraphMs ?? 0;
    // Spawn adds if any
    if (p.addSpawns && p.addSpawns.length) {
      for (const add of p.addSpawns) {
        const count = Math.max(1, add.count | 0);
        for (let i = 0; i < count; i++) {
          ctx.spawnAdd({ x: b.x + (i - (count - 1) / 2) * 24, y: b.y + 40, movementId: add.movementId, attackId: add.attackId, hp: add.hp ?? 1 });
        }
      }
    }
  }
}

export function updateBoss(b: Boss, ctx: BossUpdateContext, dtMs: number) {
  if (!b.active) return;

  // Determine phase based on hp
  maybeAdvancePhase(b, ctx);
  const phase = currentPhase(b);

  if (phase) {
    if (b.telegraphTimer > 0) {
      b.telegraphTimer = Math.max(0, b.telegraphTimer - dtMs);
      // During telegraph, movement is reduced a bit; no attacks
      const mv: MovementStrategy | undefined = MovementRegistry[phase.movementId];
      if (mv) {
        // scale dt to slow movement during telegraph
        mv(b, dtMs * 0.4, ctx);
      }
      return;
    }

    // Active phase
    const mv: MovementStrategy | undefined = MovementRegistry[phase.movementId];
    if (mv) mv(b, dtMs, ctx);
    const atk: AttackStrategy | undefined = AttackRegistry[phase.attackId];
    if (atk) atk(b, ctx, dtMs);
  }
}

// Convenience factories for Phase 2 bosses (C, O, Q)
export function createBossC(x = 400, y = 100): Boss {
  // Crab-like: lateral movement with lateral claws, two phases
  return makeBoss(x, y, 100, [
    { threshold: 0.66, movementId: 'scuttle_side', attackId: 'claw_lateral', telegraphMs: 700 },
    { threshold: 0.33, movementId: 'zigzag_descent', attackId: 'timed_volley', telegraphMs: 900, addSpawns: [{ count: 3, movementId: 'glide_horizontal', attackId: 'pellet_slow', hp: 1 }] },
  ]);
}

export function createBossO(x = 400, y = 100): Boss {
  // Octopus: tentacle waves and ink radial; three phases with adds
  return makeBoss(x, y, 140, [
    { threshold: 0.8, movementId: 'tentacle_wave', attackId: 'ink_radial_slow', telegraphMs: 800 },
    { threshold: 0.5, movementId: 'large_oscillation', attackId: 'beam_continuous', telegraphMs: 900, addSpawns: [{ count: 4, movementId: 'buzz_loop', attackId: 'rapid_stingers', hp: 2 }] },
    { threshold: 0.25, movementId: 'multi_phase_mix', attackId: 'summon_minions_spiral', telegraphMs: 1000, addSpawns: [{ count: 6, movementId: 'cluster_drift', attackId: 'micro_pellets_swarm', hp: 1 }] },
  ]);
}

export function createBossQ(x = 400, y = 100): Boss {
  // Queen: multi-phase mix and spiral summons, steady escalation
  return makeBoss(x, y, 180, [
    { threshold: 0.9, movementId: 'multi_phase_mix', attackId: 'narrow_fast', telegraphMs: 700 },
    { threshold: 0.6, movementId: 'track_x', attackId: 'timed_volley', telegraphMs: 800, addSpawns: [{ count: 3, movementId: 'clockwork_step', attackId: 'timed_volley', hp: 2 }] },
    { threshold: 0.3, movementId: 'cross_pivot', attackId: 'x_cross_lasers', telegraphMs: 1000, addSpawns: [{ count: 4, movementId: 'serpentine', attackId: 'venom_arc', hp: 2 }] },
  ]);
}
