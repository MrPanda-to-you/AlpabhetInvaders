export type UpdateFn = (dt: number) => void;
export type RenderFn = (alpha: number) => void; // alpha in [0,1] for interpolation

let last = performance.now();
let acc = 0;
const STEP = 1000 / 60; // ms per update tick (60Hz)
const MAX_ACC = STEP * 8; // prevent spiral of death

let renderFn: RenderFn = () => {};

let updater: UpdateFn = () => {};

export function setUpdater(fn: UpdateFn) { updater = fn; }
export function setRenderer(fn: RenderFn) { renderFn = fn; }

interface FrameStatsInternal {
  framesOver33ms: number;
  totalFrames: number;
  sumFrameMs: number;
  maxFrameMs: number;
  minFrameMs: number;
  window: number[]; // sliding window of recent frame times
}
const WINDOW_SIZE = 300; // last 5s at 60fps
const stats: FrameStatsInternal = {
  framesOver33ms: 0,
  totalFrames: 0,
  sumFrameMs: 0,
  maxFrameMs: 0,
  minFrameMs: Number.POSITIVE_INFINITY,
  window: [],
};

export function frame(now: number) {
  const delta = now - last;
  last = now;
  acc += delta;
  if (acc > MAX_ACC) acc = MAX_ACC;

  const start = performance.now();
  while (acc >= STEP) {
    updater(STEP / 1000); // supply seconds to updater for gameplay logic
    acc -= STEP;
  }
  const alpha = acc / STEP; // interpolation factor for rendering
  try { renderFn(alpha); } catch { /* ignore render errors */ }

  const frameTime = performance.now() - start;
  stats.totalFrames++;
  if (frameTime > 33) stats.framesOver33ms++;
  stats.sumFrameMs += frameTime;
  if (frameTime > stats.maxFrameMs) stats.maxFrameMs = frameTime;
  if (frameTime < stats.minFrameMs) stats.minFrameMs = frameTime;
  stats.window.push(frameTime);
  if (stats.window.length > WINDOW_SIZE) stats.window.shift();

  requestAnimationFrame(frame);
}

export function getFrameStats() {
  const avg = stats.totalFrames ? stats.sumFrameMs / stats.totalFrames : 0;
  const recent = stats.window.slice();
  const recentAvg = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : 0;
  return {
    totalFrames: stats.totalFrames,
    framesOver33ms: stats.framesOver33ms,
    avgFrameMs: avg,
    maxFrameMs: stats.maxFrameMs,
    minFrameMs: stats.minFrameMs === Number.POSITIVE_INFINITY ? 0 : stats.minFrameMs,
    recentAvgFrameMs: recentAvg,
    recentFrameCount: recent.length,
  };
}
// Only auto-start in browser where requestAnimationFrame exists
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(frame);
}

export function startLoop() {
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(frame);
}
