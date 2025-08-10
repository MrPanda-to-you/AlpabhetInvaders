export interface EnemyLike { x: number; y: number }
export interface AttackContext {
  emitProjectile: (p: { x: number; y: number; vx: number; vy: number; radius: number }) => void;
}
export type AttackStrategy = (e: EnemyLike, ctx: AttackContext, dtMs: number) => void;

// A: pellet_slow — fire downward pellet every 0.8s
export const pellet_slow: AttackStrategy = (() => {
  let t = 0;
  const period = 800; // ms
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 220, radius: 3 });
    }
  };
})();

// B: pellet_spread_2 — alternate slight left/right shots every 0.9s
export const pellet_spread_2: AttackStrategy = (() => {
  let t = 0;
  let flip = false;
  const period = 900; // ms
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      const vx = flip ? -80 : 80;
      flip = !flip;
      ctx.emitProjectile({ x: e.x, y: e.y, vx, vy: 200, radius: 3 });
    }
  };
})();

// C: claw_lateral — side projectile every 1.2s
export const claw_lateral: AttackStrategy = (() => {
  let t = 0;
  const period = 1200;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 160, vy: 0, radius: 3 });
    }
  };
})();

export const AttackRegistry: Record<string, AttackStrategy> = {
  pellet_slow,
  pellet_spread_2,
  claw_lateral,
};
