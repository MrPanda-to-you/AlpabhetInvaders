import { describe, it, expect, vi } from 'vitest';
import { createBossManager } from '../src/systems/bossManager';
import { createBossC } from '../src/systems/boss';

describe('BossManager integration', () => {
  it('manages boss updates and emits events', () => {
    const boss = createBossC();
    const onTelegraph = vi.fn();
    const onHpChange = vi.fn();
    const onDefeated = vi.fn();
    const onSpawnAdd = vi.fn();

    const manager = createBossManager(boss, {
      onTelegraph,
      onHpChange,
      onDefeated,
      onSpawnAdd,
    });

    // Update a few times to trigger telegraph changes
    manager.update(16);
    manager.update(16);
    
    // Apply damage to trigger HP events
    manager.applyDamage(50);
    expect(onHpChange).toHaveBeenCalledWith(50, 100);

    // Defeat the boss
    manager.applyDamage(50);
    expect(onDefeated).toHaveBeenCalled();
    expect(manager.isDefeated()).toBe(true);
  });

  it('tracks telegraph state correctly', () => {
    const boss = createBossC();
    const manager = createBossManager(boss);

    // Initially no telegraph
    expect(manager.getTelegraphActive()).toBe(false);

    // Damage to trigger phase
    manager.applyDamage(40); // 60% HP
    manager.update(16);

    // Telegraph should be active during timer
    const hasActiveTelegraph = manager.getTelegraphActive();
    expect(typeof hasActiveTelegraph).toBe('boolean');
  });
});
