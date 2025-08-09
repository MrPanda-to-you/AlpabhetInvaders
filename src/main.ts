import { setUpdater, startLoop } from './core/loop';
import { enableFpsOverlay, toggleFpsOverlay } from '@ui/fpsOverlay';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}

function update(_dt: number) {
  // placeholder update; integrate systems later
}

setUpdater(update);

// Enable FPS overlay in dev for quick diagnostics
if (import.meta && (import.meta as any).env?.DEV) {
  enableFpsOverlay();
}

// Keyboard toggle (F2) for FPS overlay
window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    toggleFpsOverlay();
  }
});

// Ensure loop runs if not auto-started
startLoop();
