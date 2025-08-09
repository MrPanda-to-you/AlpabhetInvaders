export type UpdateFn = (dt: number) => void;

let last = performance.now();
let acc = 0;
const STEP = 1000 / 60; // 60 FPS fixed timestep

let updater: UpdateFn = () => {};

export function setUpdater(fn: UpdateFn) { updater = fn; }

const stats = {
  framesOver33ms: 0,
  totalFrames: 0,
};

export function frame(now: number) {
  const delta = now - last;
  last = now;
  acc += delta;

  const start = performance.now();
  while (acc >= STEP) {
    updater(STEP);
    acc -= STEP;
  }

  const frameTime = performance.now() - start;
  stats.totalFrames++;
  if (frameTime > 33) stats.framesOver33ms++;

  requestAnimationFrame(frame);
}

export function getFrameStats() {
  return { ...stats };
}
// Only auto-start in browser where requestAnimationFrame exists
if (typeof requestAnimationFrame !== 'undefined') {
  requestAnimationFrame(frame);
}

export function startLoop() {
  if (typeof requestAnimationFrame !== 'undefined') requestAnimationFrame(frame);
}
