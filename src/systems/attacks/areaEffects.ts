// Area effect system for advanced attacks
// T2.2: Manages ink slow zones, flame DoT areas, and other environmental effects

export interface AreaEffect {
  id: string;
  x: number;
  y: number;
  radius: number;
  duration: number; // total duration in ms
  elapsed: number; // time elapsed
  effect: 'slow' | 'damage' | 'ink';
  intensity: number; // effect strength (0-1)
  active: boolean;
}

export interface AreaEffectTarget {
  x: number;
  y: number;
  // Effects can be applied to entities with position
}

export class AreaEffectSystem {
  private activeEffects: AreaEffect[] = [];
  private nextId = 1;
  
  addAreaEffect(effect: Omit<AreaEffect, 'id' | 'elapsed' | 'active'>): string {
    const id = `area_${this.nextId++}`;
    this.activeEffects.push({
      ...effect,
      id,
      elapsed: 0,
      active: true
    });
    return id;
  }
  
  update(dtMs: number): void {
    this.activeEffects = this.activeEffects.filter(effect => {
      if (!effect.active) return false;
      
      effect.elapsed += dtMs;
      
      // Remove expired effects
      if (effect.elapsed >= effect.duration) {
        return false;
      }
      
      return true;
    });
  }
  
  checkEffectsOnTarget(target: AreaEffectTarget): AreaEffectResult {
    const result: AreaEffectResult = {
      slowFactor: 1.0,
      damage: 0,
      hasInk: false,
      affectedBy: []
    };
    
    for (const effect of this.activeEffects) {
      if (!effect.active) continue;
      
      const dx = target.x - effect.x;
      const dy = target.y - effect.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= effect.radius) {
        // Linear falloff based on distance
        const falloff = 1 - (distance / effect.radius);
        const effectStrength = effect.intensity * falloff;
        
        switch (effect.effect) {
          case 'slow':
            result.slowFactor = Math.min(result.slowFactor, 1 - (effectStrength * 0.7)); // Max 70% slow
            break;
          case 'damage':
            result.damage += effectStrength * 2; // Damage per frame
            break;
          case 'ink':
            result.hasInk = true;
            result.slowFactor = Math.min(result.slowFactor, 1 - (effectStrength * 0.5)); // Max 50% slow
            break;
        }
        
        result.affectedBy.push(effect.id);
      }
    }
    
    return result;
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    for (const effect of this.activeEffects) {
      if (effect.active) {
        this.renderEffect(ctx, effect);
      }
    }
  }
  
  private renderEffect(ctx: CanvasRenderingContext2D, effect: AreaEffect): void {
    ctx.save();
    
    const lifeRatio = 1 - (effect.elapsed / effect.duration);
    const alpha = 0.3 * lifeRatio;
    const pulseScale = 1 + Math.sin(effect.elapsed * 0.005) * 0.1;
    
    ctx.globalAlpha = alpha;
    
    switch (effect.effect) {
      case 'slow':
        this.renderSlowZone(ctx, effect, pulseScale);
        break;
      case 'damage':
        this.renderDamageZone(ctx, effect, pulseScale);
        break;
      case 'ink':
        this.renderInkZone(ctx, effect, pulseScale);
        break;
    }
    
    ctx.restore();
  }
  
  private renderSlowZone(ctx: CanvasRenderingContext2D, effect: AreaEffect, scale: number): void {
    const radius = effect.radius * scale;
    
    // Blue slow field
    ctx.strokeStyle = '#4444ff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Inner ripple effect
    const rippleRadius = radius * (0.5 + Math.sin(effect.elapsed * 0.008) * 0.3);
    ctx.strokeStyle = '#6666ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, rippleRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  private renderDamageZone(ctx: CanvasRenderingContext2D, effect: AreaEffect, scale: number): void {
    const radius = effect.radius * scale;
    
    // Fire/damage zone - orange/red
    const gradient = ctx.createRadialGradient(
      effect.x, effect.y, 0,
      effect.x, effect.y, radius
    );
    gradient.addColorStop(0, '#ff6600');
    gradient.addColorStop(0.7, '#ff3300');
    gradient.addColorStop(1, '#cc0000');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Flickering effect
    if (Math.random() < 0.3) {
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const length = radius * (0.8 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.moveTo(effect.x, effect.y);
        ctx.lineTo(
          effect.x + Math.cos(angle) * length,
          effect.y + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    }
  }
  
  private renderInkZone(ctx: CanvasRenderingContext2D, effect: AreaEffect, scale: number): void {
    const radius = effect.radius * scale;
    
    // Purple ink zone
    const gradient = ctx.createRadialGradient(
      effect.x, effect.y, 0,
      effect.x, effect.y, radius
    );
    gradient.addColorStop(0, '#800080');
    gradient.addColorStop(0.6, '#600060');
    gradient.addColorStop(1, '#400040');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ink spreading effect
    const spreadRadius = radius * (effect.elapsed / effect.duration);
    ctx.strokeStyle = '#aa00aa';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, spreadRadius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  removeEffect(id: string): void {
    const index = this.activeEffects.findIndex(effect => effect.id === id);
    if (index >= 0) {
      this.activeEffects.splice(index, 1);
    }
  }
  
  getActiveEffects(): readonly AreaEffect[] {
    return this.activeEffects;
  }
  
  clear(): void {
    this.activeEffects = [];
  }
}

export interface AreaEffectResult {
  slowFactor: number; // Multiplier for movement speed (1.0 = normal, 0.5 = half speed)
  damage: number; // Damage per frame
  hasInk: boolean; // Visual indicator
  affectedBy: string[]; // Effect IDs affecting this target
}

// Global area effect system instance
export const areaEffectSystem = new AreaEffectSystem();
