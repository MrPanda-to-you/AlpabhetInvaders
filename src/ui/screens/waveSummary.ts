import { UIStateManager } from '../uiStates';

export interface WaveSummaryData {
  wave: number;
  score: number;
  lettersHit: number;
  accuracy?: number; // 0..1
}

export class WaveSummary {
  private root: HTMLElement | null;
  private btn: HTMLElement | null;
  constructor(private ui: UIStateManager, selector = '#gameOver', continueButtonId = 'restartBtn') {
    this.root = document.querySelector(selector);
    this.btn = document.getElementById(continueButtonId);
    this.wire();
  }
  private wire() {
    this.btn?.addEventListener('click', () => {
      this.hide();
      this.ui.setState('play');
    });
  }
  show(data: WaveSummaryData) {
    if (!this.root) return;
    const scoreEl = this.root.querySelector('#finalScore');
    if (scoreEl) scoreEl.textContent = String(data.score);
    const waveEl = this.root.querySelector('#finalWave');
    if (waveEl) waveEl.textContent = String(data.wave);
    this.root.style.display = 'grid';
    this.ui.setState('summary');
  }
  hide() { if (this.root) this.root.style.display = 'none'; }
}
