import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AccessibilityManager } from '../src/ui/accessibility';

describe('AccessibilityManager', () => {
  beforeEach(() => {
    document.body.className = '';
    // remove caption element if exists
    const existing = document.getElementById('phonemeCaption');
    if (existing) existing.remove();
    // clear storage shim (localStorage is jsdom provided)
    localStorage.clear();
  });

  it('toggles dyslexia font class and persists', () => {
    const a = new AccessibilityManager();
    expect(document.body.classList.contains('dyslexia-font')).toBe(false);
    a.toggleDyslexiaFont();
    expect(document.body.classList.contains('dyslexia-font')).toBe(true);
    // new instance should load persisted state
    const b = new AccessibilityManager();
    expect(b.isDyslexiaFontEnabled()).toBe(true);
  });

  it('shows and hides phoneme captions', () => {
    vi.useFakeTimers();
    const a = new AccessibilityManager();
    a.captionPhoneme('A');
    const el = document.getElementById('phonemeCaption')!;
    expect(el.textContent).toBe('A');
    expect(el.style.opacity).toBe('1');
    vi.advanceTimersByTime(950);
    expect(el.style.opacity).toBe('0');
    vi.useRealTimers();
  });

  it('can disable captions', () => {
    const a = new AccessibilityManager();
    a.setCaptionsEnabled(false);
    a.captionPhoneme('B');
    const el = document.getElementById('phonemeCaption')!;
    expect(el.textContent).toBe('');
  });
});
