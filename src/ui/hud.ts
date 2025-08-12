// Minimal HUD: score, lives, wave/targets
export interface HUDState {
  score: number;
  lives: number;
  wave: number;
  targets?: string[];
}

export class HUD {
  private state: HUDState;
  private elScore: HTMLElement;
  private elLives: HTMLElement;
  private elWave: HTMLElement;
  private elTargets: HTMLElement;

  constructor(state: HUDState) {
    this.state = state;
    this.elScore = document.getElementById('score')!;
    this.elLives = document.getElementById('lives')!;
    this.elWave = document.getElementById('wave')!;
    // For targets, create or use an element
    let el = document.getElementById('targets');
    if (!el) {
      el = document.createElement('span');
      el.id = 'targets';
      this.elWave.parentElement?.appendChild(el);
    }
    this.elTargets = el;
    this.render();
  }

  update(state: Partial<HUDState>) {
    Object.assign(this.state, state);
    this.render();
  }

  render() {
    this.elScore.textContent = String(this.state.score);
    this.elLives.textContent = '♥'.repeat(this.state.lives);
    this.elWave.textContent = String(this.state.wave);
    if (this.state.targets && this.state.targets.length) {
      this.elTargets.textContent = ' | Targets: ' + this.state.targets.join(', ');
      this.elTargets.style.display = '';
    } else {
      this.elTargets.textContent = '';
      this.elTargets.style.display = 'none';
    }
  }
}
