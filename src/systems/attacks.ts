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

// ---- Minimal additional strategies to cover letters D..Z (T1.13) ----

// D: flame_cone_dot — emit small forward pellets faster (simulated DoT cone)
export const flame_cone_dot: AttackStrategy = (() => {
  let t = 0;
  const period = 180;
  return (e, ctx, dtMs) => {
    t += dtMs;
    while (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 260, radius: 2 });
    }
  };
})();

// E: dive_strike — burst shot on dive cadence
export const dive_strike: AttackStrategy = (() => {
  let t = 0;
  const period = 1500;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 320, radius: 3 });
    }
  };
})();

// F: charged_heavy — slower, bigger projectile occasionally
export const charged_heavy: AttackStrategy = (() => {
  let t = 0;
  const period = 1800;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 180, radius: 6 });
    }
  };
})();

// G: visible_only_shot — standard pellet cadence
export const visible_only_shot: AttackStrategy = pellet_slow;

// H: narrow_fast — narrow fast shot
export const narrow_fast: AttackStrategy = (() => {
  let t = 0;
  const period = 600;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 300, radius: 2 });
    }
  };
})();

// I: micro_pellets_swarm — faster small pellets
export const micro_pellets_swarm: AttackStrategy = (() => {
  let t = 0;
  const period = 300;
  return (e, ctx, dtMs) => {
    t += dtMs;
    while (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 240, radius: 2 });
    }
  };
})();

// J: backward_exhaust — rear shot upward
export const backward_exhaust: AttackStrategy = (() => {
  let t = 0;
  const period = 900;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: -120, vy: 0, radius: 3 });
    }
  };
})();

// K: reflect_then_strike — occasional faster shot
export const reflect_then_strike: AttackStrategy = (() => {
  let t = 0;
  const period = 1400;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 260, radius: 3 });
    }
  };
})();

// L: beam_continuous — simulate by frequent small shots
export const beam_continuous: AttackStrategy = (() => {
  let t = 0;
  const period = 120;
  return (e, ctx, dtMs) => {
    t += dtMs;
    while (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 280, radius: 2 });
    }
  };
})();

// M: area_shockwave — wider slow projectile
export const area_shockwave: AttackStrategy = (() => {
  let t = 0;
  const period = 1600;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 150, radius: 8 });
    }
  };
})();

// N: shuriken_diagonal — alternating diagonal
export const shuriken_diagonal: AttackStrategy = (() => {
  let t = 0; let flip = false;
  const period = 700;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      const vx = flip ? -160 : 160; flip = !flip;
      ctx.emitProjectile({ x: e.x, y: e.y, vx, vy: 200, radius: 3 });
    }
  };
})();

// O: ink_radial_slow — emit four slow radial shots over time (simplified)
export const ink_radial_slow: AttackStrategy = (() => {
  let t = 0;
  const period = 900;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= period) {
      t -= period;
      const v = 160;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: v, vy: 0, radius: 3 });
      ctx.emitProjectile({ x: e.x, y: e.y, vx: -v, vy: 0, radius: 3 });
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: v, radius: 3 });
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: -v, radius: 3 });
    }
  };
})();

// P: escalating_burst — cadence shortens over time
export const escalating_burst: AttackStrategy = (() => {
  let t = 0; let elapsed = 0;
  return (e, ctx, dtMs) => {
    elapsed += dtMs; t += dtMs;
    const period = Math.max(300, 1200 - elapsed * 0.3);
    if (t >= period) {
      t -= period;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 240, radius: 3 });
    }
  };
})();

// Q: summon_minions_spiral — spiral-ish pattern (two angled shots)
export const summon_minions_spiral: AttackStrategy = (() => {
  let t = 0; let a = 0;
  const period = 500;
  return (e, ctx, dtMs) => {
    t += dtMs; a += dtMs * 0.004;
    if (t >= period) {
      t -= period;
      const vx = Math.cos(a) * 200; const vy = Math.sin(a) * 200;
      ctx.emitProjectile({ x: e.x, y: e.y, vx, vy, radius: 3 });
      ctx.emitProjectile({ x: e.x, y: e.y, vx: -vx, vy: -vy, radius: 3 });
    }
  };
})();

// R: timed_volley — three quick shots per cycle
export const timed_volley: AttackStrategy = (() => {
  let t = 0; let burst = 0;
  const cycle = 1400; const intra = 100;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (t >= intra) {
      t -= intra;
      burst++;
      ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 230, radius: 3 });
      if (burst >= 3) { burst = 0; t = -cycle; }
    }
  };
})();

// S: ink_cloud_dim — occasional slow cloud shot
export const ink_cloud_dim: AttackStrategy = (() => {
  let t = 0; const period = 1300;
  return (e, ctx, dtMs) => {
    t += dtMs; if (t >= period) { t -= period; ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 160, radius: 5 }); }
  };
})();

// T: wide_shell — wide slow shell
export const wide_shell: AttackStrategy = (() => {
  let t = 0; const period = 1100;
  return (e, ctx, dtMs) => { t += dtMs; if (t >= period) { t -= period; ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 170, radius: 6 }); } };
})();

// U: fast_beam — frequent small
export const fast_beam: AttackStrategy = (() => {
  let t = 0; const period = 220;
  return (e, ctx, dtMs) => { t += dtMs; while (t >= period) { t -= period; ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 300, radius: 2 }); } };
})();

// V: venom_arc — diagonal arc alternating
export const venom_arc: AttackStrategy = (() => {
  let t = 0; let flip = false; const period = 800;
  return (e, ctx, dtMs) => { t += dtMs; if (t >= period) { t -= period; const vx = flip ? -140 : 140; flip = !flip; ctx.emitProjectile({ x: e.x, y: e.y, vx, vy: 220, radius: 3 }); } };
})();

// W: rapid_stingers — rapid small shots
export const rapid_stingers: AttackStrategy = (() => {
  let t = 0; const period = 180;
  return (e, ctx, dtMs) => { t += dtMs; while (t >= period) { t -= period; ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 260, radius: 2 }); } };
})();

// X: x_cross_lasers — two opposing diagonals alternating
export const x_cross_lasers: AttackStrategy = (() => {
  let t = 0; let flip = false; const period = 700;
  return (e, ctx, dtMs) => { t += dtMs; if (t >= period) { t -= period; const vx = flip ? -200 : 200; const vy = 240; flip = !flip; ctx.emitProjectile({ x: e.x, y: e.y, vx, vy, radius: 2 }); ctx.emitProjectile({ x: e.x, y: e.y, vx: -vx, vy: vy, radius: 2 }); } };
})();

// Y: turret_salvo — burst of 3
export const turret_salvo: AttackStrategy = (() => {
  let t = 0; let burst = 0; const intra = 120; const cooldown = 1500;
  return (e, ctx, dtMs) => {
    t += dtMs;
    if (burst < 3) {
      if (t >= intra) { t -= intra; burst++; ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 210, radius: 3 }); }
    } else if (t >= cooldown) {
      t = 0; burst = 0;
    }
  };
})();

// Z: chain_lightning — zigzagging diagonals alternation
export const chain_lightning: AttackStrategy = (() => {
  let t = 0; let flip = false; const period = 500;
  return (e, ctx, dtMs) => { t += dtMs; if (t >= period) { t -= period; const vx = flip ? -220 : 220; flip = !flip; ctx.emitProjectile({ x: e.x, y: e.y, vx, vy: 220, radius: 2 }); } };
})();

// Extend registry
Object.assign(AttackRegistry, {
  flame_cone_dot,
  dive_strike,
  charged_heavy,
  visible_only_shot,
  narrow_fast,
  micro_pellets_swarm,
  backward_exhaust,
  reflect_then_strike,
  beam_continuous,
  area_shockwave,
  shuriken_diagonal,
  ink_radial_slow,
  escalating_burst,
  summon_minions_spiral,
  timed_volley,
  ink_cloud_dim,
  wide_shell,
  fast_beam,
  venom_arc,
  rapid_stingers,
  x_cross_lasers,
  turret_salvo,
  chain_lightning,
});
