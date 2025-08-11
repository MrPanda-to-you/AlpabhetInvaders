import { setUpdater, startLoop } from './core/loop';
import { enableFpsOverlay, toggleFpsOverlay } from '@ui/fpsOverlay';
import { createInput, Action } from '@core/input';
import { bootAssets } from '@core/boot';
import { AudioSystem, makeFeedbackAudioAdapter } from './systems/audio';
import { loadAudioSettings, saveAudioSettings } from './core/settings';
import { mountAudioSettingsPanel } from './ui/audioSettingsPanel';
import { UIStateManager } from './ui/uiStates';
import { HUD } from './ui/hud';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}


// --- UI State and HUD integration ---
const ui = new UIStateManager();
const hud = new HUD({ score: 0, lives: 3, wave: 1 });

function update(_dt: number) {
  // Example: update HUD (replace with real game logic)
  // hud.update({ score: ..., lives: ..., wave: ..., targets: [...] });
}
// Example: wire up state transitions (replace with real game logic)
ui.onChange((state) => {
  if (state === 'title') {
    // Show title overlay, hide HUD
    document.querySelector('.hud')?.setAttribute('style', 'display:none');
  } else if (state === 'play') {
    document.querySelector('.hud')?.setAttribute('style', '');
  } else if (state === 'summary') {
    document.querySelector('.hud')?.setAttribute('style', 'display:none');
    // Show summary overlay (not implemented)
  }
});
// Start in title state
ui.setState('title');

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
