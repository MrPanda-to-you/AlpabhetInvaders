import { setUpdater, startLoop } from './core/loop';
import { enableFpsOverlay, toggleFpsOverlay } from '@ui/fpsOverlay';
import { createInput, Action } from '@core/input';
import { bootAssets } from '@core/boot';
import { AudioSystem, makeFeedbackAudioAdapter } from './systems/audio';
import { loadAudioSettings, saveAudioSettings } from './core/settings';
import { mountAudioSettingsPanel } from './ui/audioSettingsPanel';
import { UIStateManager } from './ui/uiStates';
import { HUD } from './ui/hud';
import { StartScreen } from './ui/screens/startScreen';
import { WaveSummary } from './ui/screens/waveSummary';
import { AccessibilityManager } from './ui/accessibility';
import { createBossC, createBossO, createBossQ } from './systems/boss';
import { createBossManager } from './systems/bossManager';
import { createBossHUD } from './ui/bossHud';
import { makeEnemyFromAdd, type Enemy } from './systems/enemies';
import { shouldTriggerBoss } from './systems/spawner';

const canvas = document.getElementById('game') as HTMLCanvasElement | null;
if (!canvas) {
  console.warn('No #game canvas found. Using index.html static for now.');
}

// --- Game State ---
const enemies: Enemy[] = [];
let currentWave = 0;
let activeBossManager: ReturnType<typeof createBossManager> | null = null;

// --- UI State and HUD integration ---
const ui = new UIStateManager();
const hud = new HUD({ score: 0, lives: 3, wave: 1 });
const startScreen = new StartScreen(ui);
const summary = new WaveSummary(ui);
const accessibility = new AccessibilityManager();
const bossHUD = createBossHUD();

function update(dt: number) {
  // Update boss if active
  if (activeBossManager) {
    activeBossManager.update(dt);
  }
  
  // Update enemies
  // TODO: add proper enemy update context
  
  // Example: update HUD (replace with real game logic)
  // hud.update({ score: ..., lives: ..., wave: ..., targets: [...] });
}

function triggerBossEncounter(bossType: 'C' | 'O' | 'Q') {
  const bosses = {
    C: createBossC,
    O: createBossO,
    Q: createBossQ,
  };
  
  const boss = bosses[bossType]();
  
  activeBossManager = createBossManager(boss, {
    onTelegraph: (active) => {
      bossHUD.setTelegraph(active);
      if (active) {
        // Play telegraph SFX
        audio?.playTelegraphSfx(bossType === 'Q' ? 'heavy' : 'light');
      }
    },
    onHpChange: (hp, maxHp) => {
      bossHUD.updateHp(hp, maxHp);
    },
    onDefeated: () => {
      bossHUD.hide();
      activeBossManager = null;
      console.log(`Boss ${bossType} defeated!`);
    },
    onSpawnAdd: (spec) => {
      const enemy = makeEnemyFromAdd(spec);
      enemies.push(enemy);
      console.log(`Boss spawned add: ${spec.movementId}/${spec.attackId}`);
    },
  });
  
  bossHUD.show(`Boss ${bossType}`, boss.hp, boss.maxHp);
}

function checkForBossWave() {
  if (shouldTriggerBoss(currentWave)) {
    // Choose boss type based on wave
    const bossWave = Math.floor((currentWave + 1) / 5);
    let bossType: 'C' | 'O' | 'Q' = 'C';
    if (bossWave >= 3) bossType = 'Q';
    else if (bossWave >= 2) bossType = 'O';
    
    triggerBossEncounter(bossType);
    return true;
  }
  return false;
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

// Demo: after 5 seconds in play, show a summary (placeholder logic)
setTimeout(() => {
  if (ui.getState() === 'play') {
    summary.show({ wave: 1, score: 123, lettersHit: 20, accuracy: 0.85 });
  }
}, 5000);

setUpdater(update);

// Register and preload core assets via central boot
bootAssets().catch((e) => console.warn('Boot assets warning:', e));

// Enable FPS overlay in dev for quick diagnostics
if (import.meta && (import.meta as any).env?.DEV) {
  enableFpsOverlay();
}

// Dev hotkeys for testing
window.addEventListener('keydown', (e) => {
  if (e.key === 'F2') {
    toggleFpsOverlay();
  }
  if (e.key === 'F3') {
    mountAudioSettingsPanel(audio);
  }
  if (e.key === 'F6') { // Toggle dyslexia font
    accessibility.toggleDyslexiaFont();
  }
  if (e.key === 'F7') { // Toggle phoneme captions
    accessibility.setCaptionsEnabled(!accessibility.captionsEnabled());
  }
  if (e.key === 'F8') { // Next wave
    currentWave++;
    if (!checkForBossWave()) {
      console.log(`Regular wave ${currentWave} - no boss`);
    }
  }
  if (e.key === 'F9') { // Force boss C
    triggerBossEncounter('C');
  }
  if (e.key === 'F10') { // Force boss O
    triggerBossEncounter('O');
  }
  if (e.key === 'F11') { // Force boss Q
    triggerBossEncounter('Q');
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
// Wrap phoneme playback to also caption
const originalPlayPhoneme = feedbackAudio.playPhoneme.bind(feedbackAudio);
(feedbackAudio as any).playPhoneme = (letter: string, durationSec: number) => {
  originalPlayPhoneme(letter, durationSec);
  accessibility.captionPhoneme(letter);
};
// feedback system will consume `feedbackAudio` when integrated

// Ensure loop runs if not auto-started
startLoop();
