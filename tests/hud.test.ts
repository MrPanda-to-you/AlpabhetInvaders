import { describe, it, expect, beforeEach } from 'vitest';
import { HUD } from '../src/ui/hud';

describe('HUD', () => {
  let hud: HUD;
  let score: HTMLElement, lives: HTMLElement, wave: HTMLElement;
  beforeEach(() => {
    document.body.innerHTML = `
      <span id="score"></span>
      <span id="lives"></span>
      <span id="wave"></span>
    `;
    hud = new HUD({ score: 0, lives: 3, wave: 1 });
    score = document.getElementById('score')!;
    lives = document.getElementById('lives')!;
    wave = document.getElementById('wave')!;
  });

  it('renders initial state', () => {
    expect(score.textContent).toBe('0');
    expect(lives.textContent).toBe('♥♥♥');
    expect(wave.textContent).toBe('1');
  });

  it('updates state and targets', () => {
    hud.update({ score: 42, lives: 2, wave: 3, targets: ['A','B'] });
    expect(score.textContent).toBe('42');
    expect(lives.textContent).toBe('♥♥');
    expect(wave.textContent).toBe('3');
    const targets = document.getElementById('targets');
    expect(targets?.textContent).toContain('A, B');
  });
});
