import { describe, it, expect } from 'vitest';
import { createBossC, updateBoss, applyDamage } from '../src/systems/boss';

function harness() {
  const adds: any[] = [];
  const emitted: any[] = [];
  const ctx = {
    width: 800,
    height: 600,
    emitProjectile: (p: any) => emitted.push(p),
    spawnAdd: (a: any) => adds.push(a),
  };
  return { ctx, adds, emitted };
}

describe('Boss framework (T2.1)', () => {
  it('advances phases based on HP thresholds, telegraphs, and spawns adds', () => {
    const b = createBossC(400, 100);
    const { ctx, adds, emitted } = harness();

    // Initially no phase active until hp drops below first threshold (0.66)
    updateBoss(b, ctx as any, 16);
    expect(emitted.length).toBe(0);
    expect(adds.length).toBe(0);

    // Damage to just under 66%
    applyDamage(b, 40); // maxHp 100 -> 60%
    updateBoss(b, ctx as any, 16);
    // Telegraph starts; still no attacks
    expect(b.telegraphTimer).toBeGreaterThan(0);
    const telegraphLeft = b.telegraphTimer;

    // Run out telegraph
    updateBoss(b, ctx as any, telegraphLeft + 16);

    // Active: should emit something over time
    for (let i = 0; i < 80; i++) updateBoss(b, ctx as any, 16);
    expect(emitted.length).toBeGreaterThan(0);

    // Push below second threshold (0.33) triggers adds
    applyDamage(b, 30); // now 30% -> advance phase
    updateBoss(b, ctx as any, 16);
    expect(adds.length).toBeGreaterThan(0);
  });
});
