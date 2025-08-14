import { describe, it, expect } from 'vitest';
import { shouldTriggerBoss } from '../src/systems/spawner';

describe('Boss trigger logic', () => {
  it('triggers boss every 5 waves by default', () => {
    expect(shouldTriggerBoss(0)).toBe(false);
    expect(shouldTriggerBoss(1)).toBe(false);
    expect(shouldTriggerBoss(2)).toBe(false);
    expect(shouldTriggerBoss(3)).toBe(false);
    expect(shouldTriggerBoss(4)).toBe(true); // Wave 5
    expect(shouldTriggerBoss(5)).toBe(false);
    expect(shouldTriggerBoss(9)).toBe(true); // Wave 10
    expect(shouldTriggerBoss(14)).toBe(true); // Wave 15
  });

  it('respects custom cadence', () => {
    expect(shouldTriggerBoss(0, 3)).toBe(false);
    expect(shouldTriggerBoss(1, 3)).toBe(false);
    expect(shouldTriggerBoss(2, 3)).toBe(true); // Wave 3
    expect(shouldTriggerBoss(3, 3)).toBe(false);
    expect(shouldTriggerBoss(5, 3)).toBe(true); // Wave 6
  });
});
