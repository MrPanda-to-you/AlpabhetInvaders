import { setUpdater, startLoop } from './core/loop';
import { enableFpsOverlay, toggleFpsOverlay } from '@ui/fpsOverlay';
import { createInput, Action } from '@core/input';
import { bootAssets } from '@core/boot';
import { AudioSystem, makeFeedbackAudioAdapter } from './systems/audio';
import { loadAudioSettings, saveAudioSettings } from './core/settings';
import { mountAudioSettingsPanel } from './ui/audioSettingsPanel';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}

function update(_dt: number) {
  // placeholder update; integrate systems later
}

setUpdater(update);

// Register and preload core assets via central boot
bootAssets().catch((e) => console.warn('Boot assets warning:', e));

// Enable FPS overlay in dev for quick diagnostics
if (import.meta && (import.meta as any).env?.DEV) {
  enableFpsOverlay();
}

// Keyboard toggle (F2) for FPS overlay
window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    toggleFpsOverlay();
  }
  if (e.key === 'F3') {
    mountAudioSettingsPanel(audio);
  }
});

// Initialize input and simple binding example
const input = createInput();
input.on(Action.Pause, (evt) => {
  if (evt.down) console.log('Pause toggled');
});

// Initialize audio system and adapter for future wiring into systems
const audioSettings = loadAudioSettings();
const audio = new AudioSystem({ duckFadeMs: audioSettings.duckFadeMs, duckingDb: audioSettings.duckingDb });
// Apply persisted audio gains
for (const [bus, gain] of Object.entries(audioSettings.gains) as [keyof typeof audioSettings.gains, number][]) {
  audio.setBusGain(bus, gain);
}
const feedbackAudio = makeFeedbackAudioAdapter(audio);
// feedback system will consume `feedbackAudio` when integrated

// Ensure loop runs if not auto-started
startLoop();
