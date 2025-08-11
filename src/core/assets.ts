export type AssetType = 'image' | 'audio';

export interface AssetDef {
  key: string;
  type: AssetType;
  url: string;
}

export interface LoadSummary {
  requested: number;
  loaded: number;
  failed: number;
  errors: Record<string, string>;
}

type ProgressCb = (loaded: number, total: number, key?: string) => void;

const manifest = new Map<string, AssetDef>();
const cache = new Map<string, unknown>();

export function registerAssets(defs: AssetDef[] | AssetDef) {
  const list = Array.isArray(defs) ? defs : [defs];
  for (const def of list) manifest.set(def.key, def);
}

export function isRegistered(key: string) {
  return manifest.has(key);
}

export function isLoaded(key: string) {
  return cache.has(key);
}

export function getAsset<T = unknown>(key: string): T | undefined {
  return cache.get(key) as T | undefined;
}

async function loadOne(def: AssetDef): Promise<void> {
  const isJsdom = typeof (globalThis as any).navigator !== 'undefined' &&
    ((globalThis as any).navigator.userAgent || '').includes('jsdom');

  if (def.type === 'image') {
    if (typeof Image === 'undefined' || isJsdom) {
      cache.set(def.key, { placeholder: true });
      return;
    }
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => { cache.set(def.key, img); resolve(); };
      img.onerror = () => reject(new Error(`image load failed: ${def.url}`));
      img.src = def.url;
    });
    return;
  }

  if (def.type === 'audio') {
    if (typeof Audio === 'undefined' || isJsdom) {
      cache.set(def.key, { placeholder: true });
      return;
    }
    const audio = new Audio();
    audio.src = def.url;
    try {
      await audio.play().catch(() => undefined);
    } catch {}
    cache.set(def.key, audio);
  }
}

export async function preload(keys?: string[], onProgress?: ProgressCb): Promise<LoadSummary> {
  const targets = (keys ?? Array.from(manifest.keys())).filter((k) => !cache.has(k));
  const summary: LoadSummary = { requested: targets.length, loaded: 0, failed: 0, errors: {} };
  let completed = 0;
  const report = (k?: string) => onProgress?.(++completed, targets.length, k);

  await Promise.all(targets.map(async (key) => {
    const def = manifest.get(key);
    if (!def) {
      summary.failed++;
      summary.errors[key] = 'Not registered';
      report(key);
      return;
    }
    try {
      await loadOne(def);
      summary.loaded++;
    } catch (e: any) {
      summary.failed++;
      summary.errors[key] = String(e?.message ?? e);
    } finally {
      report(key);
    }
  }));

  return summary;
}

export function registerMinimalABCUi() {
  const base = '';
  registerAssets([
    { key: 'ui/hud', type: 'image', url: `${base}/ui/hud.png` },
    { key: 'phoneme/A', type: 'audio', url: `${base}/phonemes/en/A.ogg` },
    { key: 'phoneme/B', type: 'audio', url: `${base}/phonemes/en/B.ogg` },
    { key: 'phoneme/C', type: 'audio', url: `${base}/phonemes/en/C.ogg` },
  ]);
}

// Helper to register all A–Z phoneme assets for a language (default 'en')
export function registerPhonemesAZ(base = '', lang = 'en') {
  const defs: AssetDef[] = [];
  for (let i = 65; i <= 90; i++) {
    const L = String.fromCharCode(i);
    defs.push({ key: `phoneme/${L}`, type: 'audio', url: `${base}/phonemes/${lang}/${L}.ogg` });
  }
  registerAssets(defs);
}

export function registerSfxDefaults(base = '') {
  registerAssets([
    { key: 'sfx/hit', type: 'audio', url: `${base}/sfx/hit.ogg` },
    { key: 'sfx/miss', type: 'audio', url: `${base}/sfx/miss.ogg` },
  ]);
}
