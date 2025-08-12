import { describe, it, expect } from 'vitest';
import { registerAssets, preload, isRegistered, isLoaded, getAsset, registerMinimalABCUi } from '../src/core/assets';

describe('Asset Loader & Registry (T1.3)', () => {
  it('registers assets and preloads them (jsdom-safe)', async () => {
    registerMinimalABCUi();
    expect(isRegistered('phoneme/A')).toBe(true);

    const summary = await preload();
    expect(summary.requested).toBeGreaterThan(0);
    expect(summary.loaded + summary.failed).toBe(summary.requested);

    // After preload, entries should be in cache (placeholder in jsdom)
    expect(isLoaded('phoneme/A')).toBe(true);
    expect(getAsset('phoneme/A')).toBeDefined();
  });
});
