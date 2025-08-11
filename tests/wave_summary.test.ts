import { describe, it, expect, beforeEach } from 'vitest';
import { UIStateManager } from '../src/ui/uiStates';
import { WaveSummary } from '../src/ui/screens/waveSummary';

describe('WaveSummary', () => {
  let ui: UIStateManager;
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="gameOver" style="display:none"><span id="finalScore"></span><span id="finalWave"></span><button id="restartBtn">Restart</button></div>
    `;
    ui = new UIStateManager();
  });
  it('shows summary and sets UI state to summary', () => {
    const ws = new WaveSummary(ui);
    ws.show({ wave: 2, score: 500, lettersHit: 30 });
    expect(ui.getState()).toBe('summary');
    expect((document.getElementById('gameOver') as HTMLElement).style.display).toBe('grid');
  });
  it('hides on restart and returns to play', () => {
    const ws = new WaveSummary(ui);
    ws.show({ wave: 2, score: 500, lettersHit: 30 });
    (document.getElementById('restartBtn') as HTMLButtonElement).click();
    expect(ui.getState()).toBe('play');
  });
});
