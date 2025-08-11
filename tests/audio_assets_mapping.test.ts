import { describe, it, expect } from 'vitest';
import { registerAssets, isRegistered, registerMinimalABCUi } from '../src/core/assets';

// Minimal mapping smoke: ensure ABC phoneme keys are present and can be preloaded later

describe('Phoneme asset mapping (smoke)', () => {
  it('registers minimal A/B/C phonemes via helper', () => {
    registerMinimalABCUi();
    expect(isRegistered('phoneme/A')).toBe(true);
    expect(isRegistered('phoneme/B')).toBe(true);
    expect(isRegistered('phoneme/C')).toBe(true);
  });

  it('supports custom additional phoneme registration', () => {
    registerAssets({ key: 'phoneme/Z', type: 'audio', url: '/phonemes/en/Z.ogg' });
    expect(isRegistered('phoneme/Z')).toBe(true);
  });
});
