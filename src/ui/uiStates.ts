// Minimal UI state manager for Title, Play, Summary
export type UIState = 'title' | 'play' | 'summary';

export class UIStateManager {
  private state: UIState = 'title';
  private listeners: ((s: UIState) => void)[] = [];

  getState() { return this.state; }
  setState(s: UIState) {
    if (s !== this.state) {
      this.state = s;
      this.listeners.forEach(fn => fn(s));
    }
  }
  onChange(fn: (s: UIState) => void) { this.listeners.push(fn); }
}
