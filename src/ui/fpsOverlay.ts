import { getFrameStats } from '@core/loop';

let el: HTMLDivElement | null = null;
let timer: number | null = null;
let enabled = false;

let prevTotal = 0;
let prevOver33 = 0;

function ensureEl() {
  if (el) return el;
  const div = document.createElement('div');
  div.id = 'fps-overlay';
  div.style.cssText = [
    'position:fixed',
    'left:8px',
    'top:8px',
    'z-index:9999',
    'font:12px/1.3 system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    'color:#e6f7ff',
    'background:rgba(0,0,0,0.55)',
    'padding:6px 8px',
    'border-radius:6px',
    'pointer-events:none',
    'white-space:pre',
  ].join(';');
  div.setAttribute('aria-live', 'polite');
  document.body.appendChild(div);
  el = div;
  return div;
}

function updateOnce() {
  const stats = getFrameStats();
  const dFrames = stats.totalFrames - prevTotal;
  const dOver33 = stats.framesOver33ms - prevOver33;
  prevTotal = stats.totalFrames;
  prevOver33 = stats.framesOver33ms;
  const fps = dFrames; // updates per ~1s interval ~ fps
  const jankPct = dFrames > 0 ? Math.round((dOver33 / dFrames) * 100) : 0;
  const text = `FPS: ${fps}\nJank>33ms: ${dOver33} (${jankPct}%)\nFrames: ${stats.totalFrames}`;
  if (el) el.textContent = text;
}

export function enableFpsOverlay() {
  if (enabled) return;
  enabled = true;
  prevTotal = 0;
  prevOver33 = 0;
  ensureEl();
  updateOnce();
  timer = window.setInterval(updateOnce, 1000);
}

export function disableFpsOverlay() {
  enabled = false;
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
  if (el && el.parentElement) {
    el.parentElement.removeChild(el);
  }
  el = null;
}

export function toggleFpsOverlay() {
  if (enabled) disableFpsOverlay();
  else enableFpsOverlay();
}

export function isFpsOverlayEnabled() {
  return enabled;
}
