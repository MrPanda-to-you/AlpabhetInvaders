export interface EnemyLike {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  t?: number; // internal timer (ms)
}

export type MovementStrategy = (e: EnemyLike, dtMs: number, bounds: { width: number; height: number }) => void;

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

// A: glide_horizontal — constant vx, bounce at edges
export const glide_horizontal: MovementStrategy = (e, dtMs, bounds) => {
  const vx = (e.vx ?? 80); // px/s
  const vy = (e.vy ?? 0);
  e.x += (vx * dtMs) / 1000;
  e.y += (vy * dtMs) / 1000;
  if (e.x < 0 || e.x > bounds.width) {
    e.vx = -(e.vx ?? vx);
    e.x = clamp(e.x, 0, bounds.width);
  } else {
    e.vx = vx;
  }
};

// B: zigzag_burst — alternate vx every 0.4s, slow descent
export const zigzag_burst: MovementStrategy = (e, dtMs, bounds) => {
  const period = 400; // ms
  e.t = (e.t ?? 0) + dtMs;
  const phase = Math.floor((e.t % (period * 2)) / period);
  const dir = phase === 0 ? 1 : -1;
  const speed = 120; // px/s
  e.x += (dir * speed * dtMs) / 1000;
  e.y += (20 * dtMs) / 1000; // slow descent
  if (e.x < 0 || e.x > bounds.width) e.x = clamp(e.x, 0, bounds.width);
};

// C: scuttle_side — small amplitude side shuffle + slow downward
export const scuttle_side: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const w = 40; // amplitude px
  const wps = 2; // waves per second
  const dx = Math.sin((e.t / 1000) * Math.PI * 2 * wps) * (w * dtMs / 1000);
  e.x += dx;
  e.y += (15 * dtMs) / 1000;
};

export const MovementRegistry: Record<string, MovementStrategy> = {
  glide_horizontal,
  zigzag_burst,
  scuttle_side,
};

// ---- Minimal additional strategies to cover letters D..Z (T1.13) ----

// D: sine_hover — hover in place with vertical sine bob and tiny horizontal drift
export const sine_hover: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const ampY = 20; // px
  const wps = 1.2; // waves per second
  const dy = Math.sin((e.t / 1000) * Math.PI * 2 * wps) * (ampY * dtMs / 1000);
  e.y += dy;
  e.x += (10 * dtMs) / 1000;
};

// E: high_dive — slow forward drift with periodic faster descent
export const high_dive: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const baseVy = 25; // px/s
  const diveEvery = 1500; // ms
  const diveDuration = 250; // ms
  const inDive = (e.t % (diveEvery + diveDuration)) < diveDuration;
  const vy = baseVy + (inDive ? 220 : 0);
  e.y += (vy * dtMs) / 1000;
  e.x += (30 * dtMs) / 1000;
};

// F: slow_drift_shield — very slow horizontal drift
export const slow_drift_shield: MovementStrategy = (e, dtMs, _bounds) => {
  e.x += (15 * dtMs) / 1000;
  e.y += (5 * dtMs) / 1000;
};

// G: phase_drift — gentle diagonal drift
export const phase_drift: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  e.x += (20 * dtMs) / 1000;
  e.y += (10 * dtMs) / 1000 + Math.sin(e.t / 400) * (6 * dtMs / 1000);
};

// H: track_x — drift toward screen center X
export const track_x: MovementStrategy = (e, dtMs, bounds) => {
  const targetX = bounds.width / 2;
  const dir = Math.sign(targetX - e.x);
  e.x += (dir * 60 * dtMs) / 1000;
  e.y += (18 * dtMs) / 1000;
};

// I: cluster_drift — small noisy drift using sine in both axes
export const cluster_drift: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  e.x += Math.sin(e.t / 300) * (18 * dtMs / 1000);
  e.y += (12 * dtMs) / 1000 + Math.cos(e.t / 500) * (6 * dtMs / 1000);
};

// J: horizontal_dash — quick back-and-forth dashes
export const horizontal_dash: MovementStrategy = (e, dtMs, bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const period = 500;
  const dir = ((e.t / period) | 0) % 2 === 0 ? 1 : -1;
  e.x += (dir * 180 * dtMs) / 1000;
  if (e.x < 0 || e.x > bounds.width) e.x = clamp(e.x, 0, bounds.width);
};

// K: armored_step — slow stepwise advance
export const armored_step: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const step = ((e.t / 300) | 0) % 2 === 0 ? 0 : 1;
  e.x += step * (20 * dtMs) / 1000;
  e.y += (10 * dtMs) / 1000;
};

// L: vertical_bob — vertical sine bobbing
export const vertical_bob: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const amp = 30;
  const wps = 1;
  const dy = Math.sin((e.t / 1000) * Math.PI * 2 * wps) * (amp * dtMs / 1000);
  e.y += dy;
};

// M: large_oscillation — big horizontal snake
export const large_oscillation: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const amp = 80;
  const wps = 0.6;
  const dx = Math.sin((e.t / 1000) * Math.PI * 2 * wps) * (amp * dtMs / 1000);
  e.x += dx;
  e.y += (20 * dtMs) / 1000;
};

// N: short_teleport — stuttered movement (simulated teleport hops)
export const short_teleport: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const hold = (e.t % 600) < 100; // brief hop window
  if (hold) {
    e.x += 40; // instant hop
  } else {
    e.y += (16 * dtMs) / 1000;
  }
};

// O: tentacle_wave — combined x/y sine waves
export const tentacle_wave: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  e.x += Math.sin(e.t / 300) * (50 * dtMs / 1000);
  e.y += Math.cos(e.t / 500) * (30 * dtMs / 1000) + (10 * dtMs) / 1000;
};

// P: progressive_speedup — speed increases over time
export const progressive_speedup: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const speed = 40 + Math.min(200, e.t / 20); // px/s, ramps up
  e.x += (speed * dtMs) / 1000;
  e.y += (14 * dtMs) / 1000;
};

// Q: multi_phase_mix — alternate zig and bob phases
export const multi_phase_mix: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const phase = ((e.t / 1000) | 0) % 2;
  if (phase === 0) {
    // zig
    e.x += Math.sin(e.t / 180) * (120 * dtMs / 1000);
  } else {
    // bob
    e.y += Math.sin(e.t / 200) * (40 * dtMs / 1000);
  }
  e.y += (12 * dtMs) / 1000;
};

// R: clockwork_step — discrete x steps
export const clockwork_step: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const step = ((e.t / 250) | 0) % 2 === 0 ? 0 : 1;
  e.x += step * (30 * dtMs) / 1000;
  e.y += (10 * dtMs) / 1000;
};

// S: morph_cycle — alternate between two patterns
export const morph_cycle: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const phase = ((e.t / 800) | 0) % 2;
  if (phase === 0) e.x += Math.sin(e.t / 300) * (40 * dtMs / 1000);
  else e.y += Math.cos(e.t / 300) * (40 * dtMs / 1000);
  e.y += (10 * dtMs) / 1000;
};

// T: slow_push — steady downward push
export const slow_push: MovementStrategy = (e, dtMs, _bounds) => {
  e.y += (24 * dtMs) / 1000;
};

// U: hover_dart — hover then quick dart
export const hover_dart: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const cycle = 1200; // ms
  const phase = e.t % cycle;
  const vx = phase > 900 ? 260 : 0;
  e.x += (vx * dtMs) / 1000;
  e.y += (8 * dtMs) / 1000;
};

// V: serpentine — gentle horizontal sine
export const serpentine: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  e.x += Math.sin(e.t / 250) * (70 * dtMs / 1000);
  e.y += (16 * dtMs) / 1000;
};

// W: buzz_loop — small circular loop path
export const buzz_loop: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const r = 20;
  const w = e.t / 200;
  e.x += Math.cos(w) * (r * dtMs / 1000);
  e.y += Math.sin(w) * (r * dtMs / 1000);
};

// X: cross_pivot — sway around a pivot
export const cross_pivot: MovementStrategy = (e, dtMs, _bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  e.x += Math.sin(e.t / 220) * (90 * dtMs / 1000);
};

// Y: slow_cruise — very slow horizontal cruise
export const slow_cruise: MovementStrategy = (e, dtMs, _bounds) => {
  e.x += (12 * dtMs) / 1000;
};

// Z: zigzag_descent — zigzag with stronger descent
export const zigzag_descent: MovementStrategy = (e, dtMs, bounds) => {
  e.t = (e.t ?? 0) + dtMs;
  const period = 400; // ms
  const phase = Math.floor((e.t % (period * 2)) / period);
  const dir = phase === 0 ? 1 : -1;
  const speed = 140; // px/s
  e.x += (dir * speed * dtMs) / 1000;
  e.y += (30 * dtMs) / 1000; // stronger descent
  if (e.x < 0 || e.x > bounds.width) e.x = clamp(e.x, 0, bounds.width);
};

// Extend registry
Object.assign(MovementRegistry, {
  sine_hover,
  high_dive,
  slow_drift_shield,
  phase_drift,
  track_x,
  cluster_drift,
  horizontal_dash,
  armored_step,
  vertical_bob,
  large_oscillation,
  short_teleport,
  tentacle_wave,
  progressive_speedup,
  multi_phase_mix,
  clockwork_step,
  morph_cycle,
  slow_push,
  hover_dart,
  serpentine,
  buzz_loop,
  cross_pivot,
  slow_cruise,
  zigzag_descent,
});
