import type { Boss } from './boss';
import { updateBoss, applyDamage } from './boss';

export interface BossManager {
  boss: Boss;
  update(dtMs: number): void;
  applyDamage(damage: number): void;
  isDefeated(): boolean;
  getTelegraphActive(): boolean;
}

export interface BossManagerOptions {
  onTelegraph?: (active: boolean) => void;
  onHpChange?: (hp: number, maxHp: number) => void;
  onDefeated?: () => void;
  onSpawnAdd?: (spec: { x: number; y: number; movementId: string; attackId: string; hp: number }) => void;
}

export function createBossManager(boss: Boss, options: BossManagerOptions = {}): BossManager {
  let lastTelegraphState = false;
  let lastHp = boss.hp;

  const ctx = {
    width: 800,
    height: 600,
    emitProjectile: (p: { x: number; y: number; vx: number; vy: number; radius: number }) => {
      // TODO: wire to projectile system
      console.debug('[Boss] projectile:', p);
    },
    spawnAdd: (spec: { x: number; y: number; movementId: string; attackId: string; hp: number }) => {
      options.onSpawnAdd?.(spec);
    },
  };

  return {
    boss,
    update(dtMs: number) {
      if (!boss.active) return;

      updateBoss(boss, ctx, dtMs);

      // Check for telegraph state changes
      const telegraphActive = boss.telegraphTimer > 0;
      if (telegraphActive !== lastTelegraphState) {
        lastTelegraphState = telegraphActive;
        options.onTelegraph?.(telegraphActive);
      }

      // Check for HP changes
      if (boss.hp !== lastHp) {
        lastHp = boss.hp;
        options.onHpChange?.(boss.hp, boss.maxHp);
      }

      // Check if defeated
      if (!boss.active) {
        options.onDefeated?.();
      }
    },
    applyDamage(damage: number) {
      applyDamage(boss, damage);
      options.onHpChange?.(boss.hp, boss.maxHp);
      if (!boss.active) {
        options.onDefeated?.();
      }
    },
    isDefeated() {
      return !boss.active;
    },
    getTelegraphActive() {
      return boss.telegraphTimer > 0;
    },
  };
}
