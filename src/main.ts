import { setUpdater, startLoop } from './core/loop';
import { enableFpsOverlay, toggleFpsOverlay } from '@ui/fpsOverlay';
import { createInput, Action } from '@core/input';
import { registerPhonemesAZ, registerSfxDefaults, preload } from '@core/assets';
import { AudioSystem, makeFeedbackAudioAdapter } from './systems/audio';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}

function update(_dt: number) {
  // placeholder update; integrate systems later
}

setUpdater(update);

// Register audio assets and preload a minimal set at boot
registerPhonemesAZ();
registerSfxDefaults();
// Preload a subset likely needed for first interactions (A, B, C phonemes and hit/miss)
preload(['phoneme/A', 'phoneme/B', 'phoneme/C', 'sfx/hit', 'sfx/miss']).catch((e) => {
  console.warn('Preload warning:', e);
});

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

// Initialize input and simple binding example
const input = createInput();
input.on(Action.Pause, (evt) => {
  if (evt.down) console.log('Pause toggled');
});

// Initialize audio system and adapter for future wiring into systems
const audio = new AudioSystem();
const feedbackAudio = makeFeedbackAudioAdapter(audio);
// feedback system will consume `feedbackAudio` when integrated

// Ensure loop runs if not auto-started
startLoop();
