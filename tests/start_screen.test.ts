import { describe, it, expect, beforeEach } from 'vitest';
import { UIStateManager } from '../src/ui/uiStates';
import { StartScreen } from '../src/ui/screens/startScreen';

describe('StartScreen', () => {
  let ui: UIStateManager;
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="startOverlay" style="display:none"><button id="startBtn">Start Game</button><button id="howBtn">How</button></div>
      <div id="howOverlay" style="display:none"><button id="howBack">Back</button></div>
    `;
    ui = new UIStateManager();
    new StartScreen(ui);
  });
  it('transitions to play on start click', () => {
    (document.getElementById('startBtn') as HTMLButtonElement).click();
    expect(ui.getState()).toBe('play');
  });
  it('shows how overlay then back returns to start', () => {
    (document.getElementById('howBtn') as HTMLButtonElement).click();
    expect((document.getElementById('howOverlay') as HTMLElement).style.display).toBe('grid');
    (document.getElementById('howBack') as HTMLButtonElement).click();
    expect((document.getElementById('startOverlay') as HTMLElement).style.display).toBe('grid');
  });
});
