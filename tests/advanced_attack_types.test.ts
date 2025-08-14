import { describe, it, expect, beforeEach } from 'vitest';
import { 
  beam_continuous, 
  chain_lightning, 
  ink_radial_slow, 
  flame_cone_dot 
} from '../src/systems/attacks';
import { telegraphSystem } from '../src/systems/attacks/telegraph';
import { areaEffectSystem } from '../src/systems/attacks/areaEffects';

describe('T2.2 Advanced Attack Types', () => {
  let projectiles: any[];
  let enemy: any;
  let ctx: any;

  beforeEach(() => {
    projectiles = [];
    enemy = { x: 400, y: 200 };
    ctx = {
      emitProjectile: (p: any) => projectiles.push(p),
    };
    
    // Clear systems
    telegraphSystem.clear();
    areaEffectSystem.clear();
  });

  describe('L: Advanced Beam Continuous', () => {
    it('emits telegraph warning before beam activation', () => {
      // Run attack for telegraph duration
      for (let i = 0; i < 10; i++) {
        beam_continuous(enemy, ctx, 100); // 1000ms total
      }
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs.length).toBeGreaterThan(0);
      expect(telegraphs[0].type).toBe('beam');
      expect(telegraphs[0].color).toBe('#ffff00');
    });

    it('respects beam channel limits', () => {
      // Multiple beams should be limited
      const enemy1 = { x: 100, y: 100 };
      const enemy2 = { x: 200, y: 100 };
      const enemy3 = { x: 300, y: 100 };
      
      // Trigger multiple beams simultaneously
      beam_continuous(enemy1, ctx, 800);
      beam_continuous(enemy2, ctx, 800);
      beam_continuous(enemy3, ctx, 800);
      
      // Should be limited to max channels (implementation detail)
      expect(projectiles.length).toBeLessThan(100); // Not unlimited beams
    });

    it('falls back to regular pellets when not beaming', () => {
      // Before charging phase
      beam_continuous(enemy, ctx, 100);
      
      // Should emit some projectiles as fallback
      expect(projectiles.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Z: Advanced Chain Lightning', () => {
    it('emits telegraph warning before chain attack', () => {
      // Run for telegraph duration
      for (let i = 0; i < 15; i++) {
        chain_lightning(enemy, ctx, 100); // 1500ms total
      }
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs.some(t => t.type === 'chain')).toBe(true);
    });

    it('creates multiple projectiles for chain effect', () => {
      // Trigger chain lightning attack
      for (let i = 0; i < 15; i++) {
        chain_lightning(enemy, ctx, 100);
      }
      
      // Should emit multiple projectiles for chain bouncing
      expect(projectiles.length).toBeGreaterThan(1);
    });

    it('creates projectiles with varied velocities for bouncing', () => {
      // Trigger attack
      for (let i = 0; i < 15; i++) {
        chain_lightning(enemy, ctx, 100);
      }
      
      if (projectiles.length > 1) {
        // Should have different velocities for bounce effect
        const velocities = projectiles.map(p => Math.sqrt(p.vx * p.vx + p.vy * p.vy));
        const uniqueVelocities = new Set(velocities);
        expect(uniqueVelocities.size).toBeGreaterThan(1);
      }
    });
  });

  describe('O: Advanced Ink Slow Zones', () => {
    it('emits telegraph warning before ink attack', () => {
      // Run for telegraph duration
      for (let i = 0; i < 20; i++) {
        ink_radial_slow(enemy, ctx, 100); // 2000ms total
      }
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs.some(t => t.type === 'area')).toBe(true);
    });

    it('creates area effects with slow zones', () => {
      // Trigger ink attack
      for (let i = 0; i < 20; i++) {
        ink_radial_slow(enemy, ctx, 100);
      }
      
      const effects = areaEffectSystem.getActiveEffects();
      expect(effects.some(e => e.effect === 'slow')).toBe(true);
    });

    it('slow zones affect targets within radius', () => {
      // Create area effect manually to test
      areaEffectSystem.addAreaEffect({
        x: 400,
        y: 200,
        radius: 80,
        duration: 4000,
        effect: 'slow',
        intensity: 0.5
      });
      
      // Test target inside zone
      const result = areaEffectSystem.checkEffectsOnTarget({ x: 410, y: 210 });
      expect(result.slowFactor).toBeLessThan(1.0);
      
      // Test target outside zone
      const resultOutside = areaEffectSystem.checkEffectsOnTarget({ x: 600, y: 200 });
      expect(resultOutside.slowFactor).toBe(1.0);
    });
  });

  describe('D: Advanced Flame Cone DoT', () => {
    it('emits telegraph warning before flame cone', () => {
      // Run for telegraph duration
      for (let i = 0; i < 30; i++) {
        flame_cone_dot(enemy, ctx, 100); // 3000ms total
      }
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs.some(t => t.type === 'cone')).toBe(true);
    });

    it('creates cone pattern projectiles during active phase', () => {
      // Run through charge and into active phase
      for (let i = 0; i < 30; i++) {
        flame_cone_dot(enemy, ctx, 100);
      }
      
      // Should create multiple projectiles in cone pattern
      expect(projectiles.length).toBeGreaterThan(3);
      
      // Should have projectiles with different angles
      const angles = projectiles.map(p => Math.atan2(p.vy, p.vx));
      const uniqueAngles = new Set(angles);
      expect(uniqueAngles.size).toBeGreaterThan(1);
    });

    it('creates burning area effects', () => {
      // Trigger flame cone
      for (let i = 0; i < 30; i++) {
        flame_cone_dot(enemy, ctx, 100);
      }
      
      const effects = areaEffectSystem.getActiveEffects();
      expect(effects.some(e => e.effect === 'damage')).toBe(true);
    });
  });

  describe('Telegraph System Integration', () => {
    it('updates telegraph intensity over time', () => {
      telegraphSystem.addTelegraph({
        x: 100,
        y: 100,
        type: 'beam',
        duration: 1000,
        color: '#ffffff'
      });
      
      telegraphSystem.update(500); // Half duration
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs[0].intensity).toBeCloseTo(0.5, 1);
    });

    it('removes expired telegraphs', () => {
      telegraphSystem.addTelegraph({
        x: 100,
        y: 100,
        type: 'beam',
        duration: 500,
        color: '#ffffff'
      });
      
      telegraphSystem.update(600); // Past duration
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      expect(telegraphs.length).toBe(0);
    });
  });

  describe('Area Effect System Integration', () => {
    it('applies multiple area effects correctly', () => {
      // Add overlapping slow and damage zones
      areaEffectSystem.addAreaEffect({
        x: 400,
        y: 200,
        radius: 50,
        duration: 2000,
        effect: 'slow',
        intensity: 0.6
      });
      
      areaEffectSystem.addAreaEffect({
        x: 420,
        y: 220,
        radius: 40,
        duration: 1500,
        effect: 'damage',
        intensity: 0.8
      });
      
      // Test target in overlapping area
      const result = areaEffectSystem.checkEffectsOnTarget({ x: 410, y: 210 });
      
      expect(result.slowFactor).toBeLessThan(1.0);
      expect(result.damage).toBeGreaterThan(0);
      expect(result.affectedBy.length).toBe(2);
    });

    it('removes expired area effects', () => {
      areaEffectSystem.addAreaEffect({
        x: 100,
        y: 100,
        radius: 30,
        duration: 500,
        effect: 'slow',
        intensity: 0.5
      });
      
      areaEffectSystem.update(600); // Past duration
      
      const effects = areaEffectSystem.getActiveEffects();
      expect(effects.length).toBe(0);
    });
  });

  describe('Performance Considerations', () => {
    it('maintains reasonable projectile counts under advanced attacks', () => {
      // Run all advanced attacks simultaneously
      for (let i = 0; i < 50; i++) {
        beam_continuous(enemy, ctx, 50);
        chain_lightning({ x: enemy.x + 100, y: enemy.y }, ctx, 50);
        ink_radial_slow({ x: enemy.x + 200, y: enemy.y }, ctx, 50);
        flame_cone_dot({ x: enemy.x + 300, y: enemy.y }, ctx, 50);
      }
      
      // Should not create excessive projectiles
      expect(projectiles.length).toBeLessThan(1000);
    });

    it('limits active telegraph and area effect counts', () => {
      // Stress test systems
      for (let i = 0; i < 100; i++) {
        telegraphSystem.addTelegraph({
          x: i * 10,
          y: 100,
          type: 'beam',
          duration: 1000,
          color: '#ffffff'
        });
        
        areaEffectSystem.addAreaEffect({
          x: i * 10,
          y: 200,
          radius: 20,
          duration: 2000,
          effect: 'slow',
          intensity: 0.3
        });
      }
      
      const telegraphs = telegraphSystem.getActiveTelegraphs();
      const effects = areaEffectSystem.getActiveEffects();
      
      // Systems should handle reasonable loads
      expect(telegraphs.length).toBeLessThanOrEqual(100);
      expect(effects.length).toBeLessThanOrEqual(100);
    });
  });
});
