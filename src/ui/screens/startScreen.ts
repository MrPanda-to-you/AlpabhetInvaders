import { UIStateManager } from '../uiStates';

export interface StartScreenOptions {
  selector?: string; // overlay id
  startButtonId?: string;
  howButtonId?: string;
  backButtonId?: string;
}

export class StartScreen {
  private opts: Required<StartScreenOptions>;
  private overlay: HTMLElement | null;
  private how: HTMLElement | null;
  constructor(private ui: UIStateManager, opts: StartScreenOptions = {}) {
    this.opts = {
      selector: '#startOverlay',
      startButtonId: 'startBtn',
      howButtonId: 'howBtn',
      backButtonId: 'howBack',
      ...opts,
    } as Required<StartScreenOptions>;
    this.overlay = document.querySelector(this.opts.selector);
    this.how = document.getElementById('howOverlay');
    this.wire();
  }

  private wire() {
    document.getElementById(this.opts.startButtonId)?.addEventListener('click', () => this.startGame());
    document.getElementById(this.opts.howButtonId)?.addEventListener('click', () => this.showHow());
    document.getElementById(this.opts.backButtonId)?.addEventListener('click', () => this.back());
    if (this.overlay) this.overlay.style.display = 'grid';
  }

  private startGame() {
    if (this.overlay) this.overlay.style.display = 'none';
    if (this.how) this.how.style.display = 'none';
    this.ui.setState('play');
  }

  private showHow() {
    if (this.overlay) this.overlay.style.display = 'none';
    if (this.how) this.how.style.display = 'grid';
  }

  private back() {
    if (this.how) this.how.style.display = 'none';
    if (this.overlay) this.overlay.style.display = 'grid';
  }
}
