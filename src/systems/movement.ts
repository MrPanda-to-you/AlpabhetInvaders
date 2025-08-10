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
