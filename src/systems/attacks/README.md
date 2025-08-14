# T2.2 Advanced Attack Types - Implementation Guide

## Overview
T2.2 implements four enhanced attack types with telegraphing and special mechanics:

- **L: Beam Channel** - Continuous beam with channel limits and telegraph warnings
- **Z: Chain Lightning** - Lightning that bounces between targets with chain effects  
- **O: Ink Slow Zones** - Projectiles that create persistent area effects
- **D: Flame Cone DoT** - Damage-over-time flame cone with spreading fire

## System Architecture

### Core Components

1. **Advanced Attack Strategies** (`src/systems/attacks/advanced.ts`)
   - Factory functions for each advanced attack type
   - Telegraph warning integration
   - Channel limiting for beam attacks
   - Bounce mechanics for chain lightning
   - Area effect creation for zones and DoT

2. **Telegraph System** (`src/systems/attacks/telegraph.ts`)
   - Visual warning system for all attack types
   - Configurable duration and visual effects
   - Type-specific rendering (beam, cone, area, chain)
   - Intensity scaling over time

3. **Area Effect System** (`src/systems/attacks/areaEffects.ts`)
   - Persistent environmental effects
   - Slow zones, damage areas, and ink effects
   - Distance-based falloff calculations
   - Effect stacking and coordination

4. **Integration Layer** (`src/systems/attacks/integration.ts`)
   - Unified manager for all advanced systems
   - Game loop integration hooks
   - Entity effect application
   - Performance monitoring

### Enhanced Attack Implementations

#### L: Advanced Beam Continuous
```typescript
// Phases: Telegraph (800ms) → Beam (2000ms) → Cooldown (1500ms)
- Telegraph warning with beam column preview
- Channel limit enforcement (max 2 concurrent beams per entity)
- Fallback to regular pellets during cooldown
- Beam-to-projectile conversion for compatibility
```

#### Z: Advanced Chain Lightning  
```typescript
// Phases: Telegraph (600ms) → Chain Attack → Cooldown (1200ms)
- Electric telegraph warning at source
- Multi-target bounce mechanics (up to 3 bounces)
- Dynamic projectile velocity for chain effect
- Nearby enemy detection for bounce targeting
```

#### O: Advanced Ink Slow Zones
```typescript
// Phases: Telegraph (700ms) → Ink Projectile + Zone Creation → Duration (4000ms)
- Area telegraph warning at target location
- Projectile that triggers zone creation on impact
- Persistent slow effect (50% speed reduction)
- Radius-based effect falloff
```

#### D: Advanced Flame Cone DoT
```typescript
// Phases: Telegraph (500ms) → Active Cone (1500ms) → Cooldown (2500ms)
- Cone-shaped telegraph warning
- Rapid projectile bursts in cone pattern (3 angles)
- Burning area effect creation (2000ms duration)
- Spreading fire with random placement
```

## Integration Guide

### Game Loop Integration
```typescript
import { advancedAttackManager } from './systems/attacks/integration';

// In main update loop:
advancedAttackManager.update(deltaTimeMs);

// In render loop:
advancedAttackManager.render(canvasContext);

// For enemies affected by area effects:
const effects = updateEnemyWithAdvancedEffects(enemy, deltaTimeMs);
```

### Enemy System Integration
```typescript
// Enhanced context for advanced attacks
const advancedCtx: AdvancedAttackContext = {
  emitProjectile: (p) => projectiles.push(p),
  emitTelegraph: (t) => telegraphSystem.addTelegraph({...t, color: t.color || '#fff'}),
  emitAreaEffect: (a) => areaEffectSystem.addAreaEffect(a),
  getNearbyEnemies: (x, y, r) => findEnemiesInRadius(x, y, r)
};
```

## Performance Characteristics

### Resource Management
- **Telegraph Limits**: Auto-cleanup of expired warnings
- **Area Effect Limits**: Duration-based cleanup
- **Beam Channels**: Concurrent limit enforcement (2 per entity)
- **Projectile Counts**: Reasonable emission rates maintained

### Testing Coverage
- **18 Advanced Attack Tests**: Core functionality validation
- **11 Integration Tests**: System coordination verification
- **Performance Tests**: Resource limit validation
- **Compatibility Tests**: Existing system integration

## Technical Decisions

### Telegraph System Design
- **Pre-attack Warnings**: 300-800ms advance notice for player reaction
- **Visual Intensity**: Progressive warning intensity (0→1 over duration)
- **Type-Specific Rendering**: Custom visuals for each attack pattern
- **Color Coding**: Distinctive colors per attack type

### Area Effect System Design  
- **Radius-Based Falloff**: Linear distance-based effect reduction
- **Effect Stacking**: Multiple overlapping areas supported
- **Duration Management**: Automatic cleanup of expired effects
- **Entity Integration**: Non-intrusive velocity/damage application

### Channel Limiting Strategy
- **Beam Concurrency**: Prevents beam spam while allowing tactical use
- **Entity-Specific Limits**: Per-enemy channel tracking
- **Graceful Degradation**: Fallback to regular attacks when limited
- **Resource Cleanup**: Automatic channel release on completion

## Usage Examples

### Using Enhanced Attacks in Archetypes
```json
{
  "L": {
    "attackId": "beam_continuous",
    "behaviors": ["beam", "telegraph"]
  },
  "Z": {
    "attackId": "chain_lightning", 
    "behaviors": ["chain", "bounce"]
  },
  "O": {
    "attackId": "ink_radial_slow",
    "behaviors": ["area", "slow"]
  },
  "D": {
    "attackId": "flame_cone_dot",
    "behaviors": ["cone", "dot"]
  }
}
```

### Checking Entity Effects
```typescript
// Check if entity is affected by area effects
const effects = areaEffectSystem.checkEffectsOnTarget(entity);
if (effects.slowFactor < 1.0) {
  // Entity is slowed
  entity.vx *= effects.slowFactor;
}
if (effects.damage > 0) {
  // Entity is taking damage
  entity.hp -= effects.damage;
}
```

## Acceptance Criteria Fulfillment

✅ **FR-1 (Per-letter uniqueness)**: L/Z/O/D have distinct advanced behaviors  
✅ **AC-GF-4 (Telegraphing)**: All attacks have visual warnings with appropriate timing  
✅ **Attack Pattern Complexity**: Beam channels, chain bounces, area zones, DoT cones  
✅ **Performance Constraints**: Reasonable projectile/effect counts maintained  
✅ **System Integration**: Compatible with existing enemy/projectile systems  
✅ **Test Coverage**: 29 tests covering all advanced attack functionality

## Future Enhancements

### Potential Extensions
- **Beam Visual Effects**: Actual beam rendering instead of projectile simulation
- **Chain Lightning VFX**: Electrical arcing between bounce points  
- **Advanced Area Effects**: Multiple effect types per zone
- **Telegraph Audio**: Sound cues to complement visual warnings
- **Player Interaction**: Telegraph-responsive player abilities
