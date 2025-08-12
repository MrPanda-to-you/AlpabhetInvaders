import { AudioSystem } from '../systems/audio';
import { AudioBus, loadAudioSettings, saveAudioSettings } from '../core/settings';

export function mountAudioSettingsPanel(audio: AudioSystem) {
  const id = 'ai-audio-panel';
  let panel = document.getElementById(id);
  if (panel) return; // already mounted
  panel = document.createElement('div');
  panel.id = id;
  panel.style.position = 'fixed';
  panel.style.right = '12px';
  panel.style.bottom = '12px';
  panel.style.padding = '10px 12px';
  panel.style.background = 'rgba(0,0,0,0.6)';
  panel.style.color = '#fff';
  panel.style.font = '12px system-ui, sans-serif';
  panel.style.borderRadius = '8px';
  panel.style.backdropFilter = 'blur(4px)';
  panel.style.zIndex = '9999';
  panel.style.width = '260px';

  const s = loadAudioSettings();
  const buses: AudioBus[] = ['master', 'music', 'sfx', 'voice'];

  const rows: string[] = [];
  for (const b of buses) {
    const val = s.gains[b] ?? 1;
    rows.push(`
      <label style="display:flex;align-items:center;gap:8px;margin:4px 0">
        <span style="width:56px;text-transform:capitalize">${b}</span>
        <input type="range" min="0" max="1" step="0.01" value="${val}" data-bus="${b}" style="flex:1" />
        <input type="number" min="0" max="1" step="0.01" value="${val}" data-bus-num="${b}" style="width:56px;background:#111;border:1px solid #333;color:#fff;padding:2px 4px;border-radius:4px" />
      </label>
    `);
  }

  const duckDb = s.duckingDb ?? -6;
  const duckFade = s.duckFadeMs ?? 150;

  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <strong>Audio</strong>
      <button id="ai-audio-close" title="Close" style="background:#222;color:#fff;border:1px solid #444;border-radius:4px;padding:2px 6px;cursor:pointer">×</button>
    </div>
    ${rows.join('')}
    <label style="display:flex;align-items:center;gap:8px;margin:6px 0">
      <span style="width:56px">duck dB</span>
      <input type="number" step="1" min="-48" max="0" value="${duckDb}" id="ai-duck-db" style="flex:1;background:#111;border:1px solid #333;color:#fff;padding:2px 4px;border-radius:4px" />
    </label>
    <label style="display:flex;align-items:center;gap:8px;margin:6px 0">
      <span style="width:56px">fade ms</span>
      <input type="number" step="10" min="0" max="2000" value="${duckFade}" id="ai-duck-fade" style="flex:1;background:#111;border:1px solid #333;color:#fff;padding:2px 4px;border-radius:4px" />
    </label>
  `;

  document.body.appendChild(panel);

  // Wire close
  panel.querySelector('#ai-audio-close')?.addEventListener('click', () => panel?.remove());

  // Wire bus sliders and number inputs
  const syncSave = () => {
    const current = loadAudioSettings();
    const gains: Record<AudioBus, number> = { ...current.gains } as any;
    for (const b of buses) {
      const slider = panel!.querySelector<HTMLInputElement>(`input[data-bus="${b}"]`)!;
      gains[b] = clamp01(parseFloat(slider.value));
    }
    const duckDbEl = panel!.querySelector<HTMLInputElement>('#ai-duck-db')!;
    const duckFadeEl = panel!.querySelector<HTMLInputElement>('#ai-duck-fade')!;
    const next = { gains, duckingDb: clampDb(parseFloat(duckDbEl.value)), duckFadeMs: clampFade(parseFloat(duckFadeEl.value)) };
    saveAudioSettings(next);
    // Apply live
    for (const [bus, g] of Object.entries(gains) as [AudioBus, number][]) {
      audio.setBusGain(bus, g);
    }
    audio.setDuckingDb(next.duckingDb!);
    audio.setDuckFadeMs(next.duckFadeMs!);
  };

  const bindRow = (b: AudioBus) => {
    const slider = panel!.querySelector<HTMLInputElement>(`input[data-bus="${b}"]`)!;
    const inNum = panel!.querySelector<HTMLInputElement>(`input[data-bus-num="${b}"]`)!;
    const sync = (val: number) => {
      val = clamp01(val);
      slider.value = String(val);
      inNum.value = String(val);
      syncSave();
    };
    slider.addEventListener('input', () => sync(parseFloat(slider.value)));
    inNum.addEventListener('change', () => sync(parseFloat(inNum.value)));
  };
  for (const b of buses) bindRow(b);

  panel.querySelector<HTMLInputElement>('#ai-duck-db')!.addEventListener('change', syncSave);
  panel.querySelector<HTMLInputElement>('#ai-duck-fade')!.addEventListener('change', syncSave);
}

function clamp01(n: number) { return Math.max(0, Math.min(1, isFinite(n) ? n : 0)); }
function clampDb(n: number) { return Math.max(-48, Math.min(0, isFinite(n) ? n : -6)); }
function clampFade(n: number) { return Math.max(0, Math.min(2000, isFinite(n) ? n : 150)); }
