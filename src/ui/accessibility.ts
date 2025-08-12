// AccessibilityManager provides baseline accessibility features:
// - Dyslexia-friendly font toggle (applies body class "dyslexia-font") with persistence
// - Phoneme caption display (simple letter flash in an aria-live region for screen readers)
// Future extension points: reduced motion, high-contrast themes, color blindness filters.

import { getJSON, setJSON } from '../core/storage';

interface AccessibilitySettings {
  dyslexiaFont: boolean;
  captions: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  dyslexiaFont: false,
  captions: true,
};

const STORAGE_KEY = 'ai.settings.accessibility.v1';

function loadSettings(): AccessibilitySettings {
  const s = getJSON<AccessibilitySettings>(STORAGE_KEY, DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s };
}

function saveSettings(s: AccessibilitySettings) {
  setJSON(STORAGE_KEY, s);
}

export class AccessibilityManager {
  private settings: AccessibilitySettings;
  private captionEl: HTMLElement;
  private clearTimer: number | null = null;

  constructor() {
    this.settings = loadSettings();
    // Apply initial font state
    if (this.settings.dyslexiaFont) document.body.classList.add('dyslexia-font');
    // Ensure caption region exists
    this.captionEl = this.ensureCaptionRegion();
  }

  private ensureCaptionRegion(): HTMLElement {
    let el = document.getElementById('phonemeCaption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'phonemeCaption';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      el.style.position = 'absolute';
      el.style.bottom = '8px';
      el.style.left = '50%';
      el.style.transform = 'translateX(-50%)';
      el.style.padding = '4px 8px';
      el.style.fontSize = '20px';
      el.style.fontWeight = '600';
      el.style.background = 'rgba(0,0,0,0.5)';
      el.style.color = 'white';
      el.style.borderRadius = '4px';
      el.style.pointerEvents = 'none';
      el.style.fontFamily = 'inherit';
      el.style.transition = 'opacity 120ms';
      el.style.opacity = '0';
      document.body.appendChild(el);
    }
    return el;
  }

  toggleDyslexiaFont() {
    this.settings.dyslexiaFont = !this.settings.dyslexiaFont;
    document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont);
    saveSettings(this.settings);
  }

  isDyslexiaFontEnabled() { return this.settings.dyslexiaFont; }
  captionsEnabled() { return this.settings.captions; }

  setCaptionsEnabled(enabled: boolean) {
    this.settings.captions = !!enabled;
    if (!enabled) {
      this.captionEl.textContent = '';
      this.captionEl.style.opacity = '0';
    }
    saveSettings(this.settings);
  }

  // Show a letter caption for a phoneme being played (simple, single-letter)
  captionPhoneme(letter: string) {
    if (!this.settings.captions) return;
    const display = (letter || '').trim().toUpperCase().charAt(0);
    if (!display) return;
    this.captionEl.textContent = display;
    this.captionEl.style.opacity = '1';
    if (this.clearTimer) window.clearTimeout(this.clearTimer);
    // Fade out after 900ms
    this.clearTimer = window.setTimeout(() => {
      this.captionEl.style.opacity = '0';
    }, 900);
  }
}

// Lightweight inline style for dyslexia font class (can be replaced by external CSS)
(() => {
  if (document.getElementById('dyslexiaFontStyle')) return;
  const style = document.createElement('style');
  style.id = 'dyslexiaFontStyle';
  style.textContent = `
    @font-face { font-family: 'OpenDyslexic'; src: local('OpenDyslexic Regular'), local('OpenDyslexic'); }
    body.dyslexia-font, body.dyslexia-font * { font-family: 'OpenDyslexic', 'Arial', sans-serif !important; }
  `;
  document.head.appendChild(style);
})();
