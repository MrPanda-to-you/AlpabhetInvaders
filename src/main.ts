import { setUpdater } from './core/loop';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}

function update(_dt: number) {
  // placeholder update; integrate systems later
}

setUpdater(update);
