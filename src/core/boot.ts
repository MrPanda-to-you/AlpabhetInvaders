import { registerPhonemesAZ, registerSfxDefaults, preload, type LoadSummary } from './assets';

export const DEFAULT_PRELOAD_KEYS = [
  'phoneme/A', 'phoneme/B', 'phoneme/C',
  'sfx/hit', 'sfx/miss',
];

export interface BootConfig {
  base?: string; // asset base path
  lang?: string; // phoneme language folder
  registerPhonemes?: boolean;
  registerSfx?: boolean;
  preloadKeys?: string[]; // keys to preload
}

export async function bootAssets(cfg: BootConfig = {}): Promise<LoadSummary> {
  const base = cfg.base ?? '';
  const lang = cfg.lang ?? 'en';
  if (cfg.registerPhonemes ?? true) registerPhonemesAZ(base, lang);
  if (cfg.registerSfx ?? true) registerSfxDefaults(base);

  const keys = cfg.preloadKeys ?? DEFAULT_PRELOAD_KEYS;
  return preload(keys);
}
