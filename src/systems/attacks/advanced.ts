import type { EnemyLike, AttackContext } from '../attacks';

// Advanced attack types with telegraphing and special mechanics
// T2.2: L beam channel, Z chain lightning bounce, O ink slow zones, D flame cone DoT

export interface AdvancedAttackContext extends AttackContext {
  // Extended context for advanced attacks (inherits emitProjectile from AttackContext)
  emitBeam?: (beam: BeamProjectile) => void;
  emitAreaEffect?: (area: AreaEffect) => void;
  getNearbyEnemies?: (x: number, y: number, radius: number) => EnemyLike[];
  emitTelegraph?: (telegraph: TelegraphEffect) => void;
}

export interface BeamProjectile {
  x: number;
  y: number;
  width: number;
  height: number;
  duration: number; // ms
  damage: number;
  channelId: string; // For tracking beam limits
}

export interface AreaEffect {
  x: number;
  y: number;
  radius: number;
  duration: number; // ms
  effect: 'slow' | 'damage' | 'ink';
  intensity: number;
}

export interface TelegraphEffect {
  x: number;
  y: number;
  type: 'beam' | 'cone' | 'area' | 'chain';
  duration: number; // ms
  color?: string;
}

// Beam channel tracking for L letter attacks
const activeBeamChannels = new Map<string, { count: number; maxChannels: number }>();

export function canCreateBeam(entityId: string, maxChannels = 2): boolean {
  const channels = activeBeamChannels.get(entityId) || { count: 0, maxChannels };
  return channels.count < channels.maxChannels;
}

export function createBeamChannel(entityId: string, maxChannels = 2): void {
  const channels = activeBeamChannels.get(entityId) || { count: 0, maxChannels };
  channels.count++;
  activeBeamChannels.set(entityId, channels);
}

export function releaseBeamChannel(entityId: string): void {
  const channels = activeBeamChannels.get(entityId);
  if (channels && channels.count > 0) {
    channels.count--;
    if (channels.count <= 0) {
      activeBeamChannels.delete(entityId);
    }
  }
}

// L: Advanced beam channel with telegraph and limits
export function createAdvancedBeamContinuous(entityId: string) {
  let telegraphTimer = 0;
  let beamTimer = 0;
  let isCharging = false;
  let isBeaming = false;
  const chargeDuration = 800; // ms telegraph
  const beamDuration = 2000; // ms active beam
  const cooldownDuration = 1500; // ms between beams
  
  return (e: EnemyLike, ctx: AdvancedAttackContext, dtMs: number) => {
    // Check if we can create a new beam channel
    if (!isCharging && !isBeaming && canCreateBeam(entityId)) {
      isCharging = true;
      telegraphTimer = 0;
      
      // Emit telegraph warning
      if (ctx.emitTelegraph) {
        ctx.emitTelegraph({
          x: e.x,
          y: e.y,
          type: 'beam',
          duration: chargeDuration,
          color: '#ffff00'
        });
      }
      
      createBeamChannel(entityId);
    }
    
    // Charging phase (telegraph)
    if (isCharging) {
      telegraphTimer += dtMs;
      if (telegraphTimer >= chargeDuration) {
        isCharging = false;
        isBeaming = true;
        beamTimer = 0;
        
        // Emit beam
        if (ctx.emitBeam) {
          ctx.emitBeam({
            x: e.x,
            y: e.y,
            width: 8,
            height: 600, // Full screen height
            duration: beamDuration,
            damage: 3,
            channelId: entityId
          });
        }
      }
    }
    
    // Beaming phase
    if (isBeaming) {
      beamTimer += dtMs;
      if (beamTimer >= beamDuration) {
        isBeaming = false;
        releaseBeamChannel(entityId);
        
        // Start cooldown (fallback to regular pellets)
        setTimeout(() => {
          // Beam is complete, can start next cycle
        }, cooldownDuration);
      }
    }
    
    // Fallback: regular pellets when not beaming
    if (!isCharging && !isBeaming) {
      const period = 400;
      telegraphTimer += dtMs;
      if (telegraphTimer >= period) {
        telegraphTimer -= period;
        ctx.emitProjectile({ x: e.x, y: e.y, vx: 0, vy: 280, radius: 2 });
      }
    }
  };
}

// Z: Chain lightning with bounce mechanics
export function createAdvancedChainLightning(entityId: string) {
  let timer = 0;
  let telegraphTimer = 0;
  let isCharging = false;
  const chargeDuration = 600; // ms telegraph
  const period = 1200; // ms between chain attacks
  
  return (e: EnemyLike, ctx: AdvancedAttackContext, dtMs: number) => {
    timer += dtMs;
    
    if (!isCharging && timer >= period) {
      isCharging = true;
      telegraphTimer = 0;
      
      // Telegraph chain lightning
      if (ctx.emitTelegraph) {
        ctx.emitTelegraph({
          x: e.x,
          y: e.y,
          type: 'chain',
          duration: chargeDuration,
          color: '#00ffff'
        });
      }
    }
    
    if (isCharging) {
      telegraphTimer += dtMs;
      if (telegraphTimer >= chargeDuration) {
        isCharging = false;
        timer = 0;
        
        // Find nearby enemies for chain bouncing
        const nearbyEnemies = ctx.getNearbyEnemies?.(e.x, e.y, 200) || [];
        
        // Initial lightning bolt
        ctx.emitProjectile({ 
          x: e.x, 
          y: e.y, 
          vx: Math.random() * 400 - 200, 
          vy: 220, 
          radius: 2 
        });
        
        // Chain to nearby enemies (up to 3 bounces)
        for (let i = 0; i < Math.min(3, nearbyEnemies.length); i++) {
          const target = nearbyEnemies[i];
          const dx = target.x - e.x;
          const dy = target.y - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0) {
            const speed = 300;
            ctx.emitProjectile({
              x: e.x,
              y: e.y,
              vx: (dx / dist) * speed,
              vy: (dy / dist) * speed,
              radius: 2
            });
          }
        }
      }
    }
  };
}

// O: Ink slow zones with area effects
export function createAdvancedInkSlowZones(entityId: string) {
  let timer = 0;
  let telegraphTimer = 0;
  let isCharging = false;
  const chargeDuration = 700; // ms telegraph
  const period = 1800; // ms between ink attacks
  
  return (e: EnemyLike, ctx: AdvancedAttackContext, dtMs: number) => {
    timer += dtMs;
    
    if (!isCharging && timer >= period) {
      isCharging = true;
      telegraphTimer = 0;
      
      // Telegraph ink area
      if (ctx.emitTelegraph) {
        ctx.emitTelegraph({
          x: e.x,
          y: e.y + 100, // Target area below enemy
          type: 'area',
          duration: chargeDuration,
          color: '#800080'
        });
      }
    }
    
    if (isCharging) {
      telegraphTimer += dtMs;
      if (telegraphTimer >= chargeDuration) {
        isCharging = false;
        timer = 0;
        
        // Emit ink projectile that creates slow zone on impact
        ctx.emitProjectile({ 
          x: e.x, 
          y: e.y, 
          vx: 0, 
          vy: 160, 
          radius: 5 
        });
        
        // Create area effect zone
        if (ctx.emitAreaEffect) {
          ctx.emitAreaEffect({
            x: e.x,
            y: e.y + 150, // Zone below the enemy
            radius: 80,
            duration: 4000, // 4 seconds
            effect: 'slow',
            intensity: 0.5 // 50% speed reduction
          });
        }
      }
    }
  };
}

// D: Flame cone DoT with spreading fire
export function createAdvancedFlameConeDoT(entityId: string) {
  let timer = 0;
  let telegraphTimer = 0;
  let isCharging = false;
  let coneActive = false;
  let coneTimer = 0;
  const chargeDuration = 500; // ms telegraph
  const coneDuration = 1500; // ms active cone
  const period = 2500; // ms total cycle
  
  return (e: EnemyLike, ctx: AdvancedAttackContext, dtMs: number) => {
    timer += dtMs;
    
    // Start charging flame cone
    if (!isCharging && !coneActive && timer >= period) {
      isCharging = true;
      telegraphTimer = 0;
      timer = 0;
      
      // Telegraph cone area
      if (ctx.emitTelegraph) {
        ctx.emitTelegraph({
          x: e.x,
          y: e.y,
          type: 'cone',
          duration: chargeDuration,
          color: '#ff6600'
        });
      }
    }
    
    // Charging phase
    if (isCharging) {
      telegraphTimer += dtMs;
      if (telegraphTimer >= chargeDuration) {
        isCharging = false;
        coneActive = true;
        coneTimer = 0;
      }
    }
    
    // Active cone phase - rapid DoT projectiles
    if (coneActive) {
      coneTimer += dtMs;
      
      // Emit flame particles rapidly in cone pattern
      const burstPeriod = 120; // ms between flame bursts
      if (coneTimer % burstPeriod < dtMs) {
        // Cone spread: 3 projectiles at different angles
        const angles = [-0.3, 0, 0.3]; // radians
        for (const angle of angles) {
          const speed = 250;
          ctx.emitProjectile({
            x: e.x,
            y: e.y,
            vx: Math.sin(angle) * speed,
            vy: Math.cos(angle) * speed,
            radius: 3
          });
        }
        
        // Create burning area effect
        if (ctx.emitAreaEffect && Math.random() < 0.3) {
          ctx.emitAreaEffect({
            x: e.x + (Math.random() - 0.5) * 60,
            y: e.y + 80 + Math.random() * 40,
            radius: 25,
            duration: 2000, // 2 seconds burn
            effect: 'damage',
            intensity: 1
          });
        }
      }
      
      if (coneTimer >= coneDuration) {
        coneActive = false;
        timer = 0; // Reset for next cycle
      }
    }
  };
}

export const AdvancedAttackRegistry = {
  advanced_beam_continuous: createAdvancedBeamContinuous,
  advanced_chain_lightning: createAdvancedChainLightning,
  advanced_ink_slow_zones: createAdvancedInkSlowZones,
  advanced_flame_cone_dot: createAdvancedFlameConeDoT,
};
