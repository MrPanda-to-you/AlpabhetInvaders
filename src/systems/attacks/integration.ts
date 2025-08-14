// Integration system for advanced attacks with game loop
// T2.2: Connects telegraph and area effect systems to main game rendering and update

import { telegraphSystem } from './telegraph';
import { areaEffectSystem } from './areaEffects';

export interface AdvancedAttackIntegration {
  update(dtMs: number): void;
  render(ctx: CanvasRenderingContext2D): void;
  applyEffectsToEntity(entity: { x: number; y: number; vx?: number; vy?: number }): {
    slowFactor: number;
    damage: number;
    hasInk: boolean;
  };
  clear(): void;
}

export class AdvancedAttackManager implements AdvancedAttackIntegration {
  update(dtMs: number): void {
    telegraphSystem.update(dtMs);
    areaEffectSystem.update(dtMs);
  }

  render(ctx: CanvasRenderingContext2D): void {
    // Render area effects first (behind other elements)
    areaEffectSystem.render(ctx);
    
    // Render telegraphs on top (warnings should be visible)
    telegraphSystem.render(ctx);
  }

  applyEffectsToEntity(entity: { x: number; y: number; vx?: number; vy?: number }): {
    slowFactor: number;
    damage: number;
    hasInk: boolean;
  } {
    const effects = areaEffectSystem.checkEffectsOnTarget(entity);
    
    // Apply movement speed modification
    if (entity.vx !== undefined && effects.slowFactor !== 1.0) {
      entity.vx *= effects.slowFactor;
    }
    if (entity.vy !== undefined && effects.slowFactor !== 1.0) {
      entity.vy *= effects.slowFactor;
    }
    
    return {
      slowFactor: effects.slowFactor,
      damage: effects.damage,
      hasInk: effects.hasInk
    };
  }

  clear(): void {
    telegraphSystem.clear();
    areaEffectSystem.clear();
  }
  
  getActiveTelegraphCount(): number {
    return telegraphSystem.getActiveTelegraphs().length;
  }
  
  getActiveAreaEffectCount(): number {
    return areaEffectSystem.getActiveEffects().length;
  }
}

// Global instance for easy integration
export const advancedAttackManager = new AdvancedAttackManager();

// Utility function to integrate with existing enemy update loops
export function updateEnemyWithAdvancedEffects(
  enemy: { x: number; y: number; vx?: number; vy?: number; hp?: number },
  dtMs: number
): { slowFactor: number; damage: number; hasInk: boolean } {
  const effects = advancedAttackManager.applyEffectsToEntity(enemy);
  
  // Apply damage if enemy has HP
  if (enemy.hp !== undefined && effects.damage > 0) {
    enemy.hp -= effects.damage;
  }
  
  return effects;
}

// Export individual systems for direct access if needed
export { telegraphSystem, areaEffectSystem };
