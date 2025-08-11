import { describe, it, expect } from 'vitest';
import { preloadPhonemesForLetters } from '../src/core/boot';
import { registerPhonemesAZ } from '../src/core/assets';

describe('Runtime phoneme preload for upcoming letters', () => {
  it('preloads unique phoneme keys for letter list', async () => {
    registerPhonemesAZ();
    const summary = await preloadPhonemesForLetters(['a', 'B', 'a']);
    expect(summary.requested).toBeGreaterThanOrEqual(2);
    expect(summary.failed).toBe(0);
  });
});
