import { describe, it, expect } from 'vitest';
import { registerPhonemesAZ, preload, isRegistered } from '../src/core/assets';

// Tiny integration to register A–Z phonemes and verify preload summary

describe('Phoneme A–Z registration and preload', () => {
  it('registers and preloads placeholders for phoneme A–Z', async () => {
    registerPhonemesAZ();
    for (let i = 65; i <= 90; i++) {
      const L = String.fromCharCode(i);
      expect(isRegistered(`phoneme/${L}`)).toBe(true);
    }
    const summary = await preload();
    expect(summary.requested).toBeGreaterThanOrEqual(26);
    expect(summary.failed).toBe(0);
  });
});
