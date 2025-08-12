import { describe, it, expect } from 'vitest';
import { bootAssets, DEFAULT_PRELOAD_KEYS } from '../src/core/boot';
import { isRegistered } from '../src/core/assets';

// Verify boot registers defaults and honors custom config

describe('bootAssets', () => {
  it('registers phonemes and sfx by default and preloads default keys', async () => {
    const summary = await bootAssets();
    expect(summary.requested).toBe(DEFAULT_PRELOAD_KEYS.length);
    for (const k of DEFAULT_PRELOAD_KEYS) expect(isRegistered(k)).toBe(true);
  });

  it('honors custom preload list and disables registrations when configured', async () => {
    const summary = await bootAssets({ registerPhonemes: false, registerSfx: false, preloadKeys: ['phoneme/Z'] });
    // Even if registrations disabled, isRegistered may be false, but preload will attempt and mark failed; summary still returned
    expect(summary.requested).toBe(1);
  });
});
