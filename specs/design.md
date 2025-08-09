# Alphabet Invaders – Technical Design (design.md)
Version: 1.0 (Aligned with requirements v1.0)
Status: Draft for Breakdown → tasks.md
Last Updated: 2025-08-08

## 1. Purpose
Translate the pedagogical & gameplay requirements into a concrete, modular, performant, testable architecture. This document defines systems, data contracts, lifecycle flows, performance strategies, extensibility rules, and requirement traceability.

## 2. Architectural Overview
The game is a browser-based HTML5 application using TypeScript, rendered via a single Canvas (WebGL preferred fallback to 2D), with a deterministic update loop and event-driven subsystems (audio, spawning, adaptive logic, engagement systems). UI overlays (HUD, menus) use lightweight DOM/Canvas hybrid.

### 2.1 Layered Model
```
┌──────────────────────────────────────────┐
│ UI Layer (DOM overlays)                 │  Menus, HUD, Accessibility Settings
├──────────────────────────────────────────┤
│ Presentation Layer (Canvas/WebGL)       │  Render System, Sprite Batch, Particles
├──────────────────────────────────────────┤
│ Gameplay Systems                        │  Spawner | Archetypes | AI | Collision | Combo
├──────────────────────────────────────────┤
│ Pedagogy & Adaptation                   │  LetterStats | AdaptiveEngine | MicroGoals
├──────────────────────────────────────────┤
│ Engagement & Events                     │  SurpriseEvents | SoftFailRecovery | MusicLayers
├──────────────────────────────────────────┤
│ Core Services                           │  ECS / Entity Registry | EventBus | Audio | RNG
├──────────────────────────────────────────┤
│ Persistence & Telemetry                 │  Storage (Local+Cloud) | Export | Analytics
├──────────────────────────────────────────┤
│ Platform                                │  Browser APIs | Input | Time | Asset Loader
└──────────────────────────────────────────┘
```

### 2.2 Key Patterns
- Data-Driven Archetypes (no engine code changes for new letters)
- Entity Component System (lightweight) or Modular Composition (selected approach: Modular Composition due to small scale & clarity)
- EventBus (publish/subscribe) decouples systems from main loop
- Deterministic Update (fixed timestep simulation + interpolated render)
- Asset Registry + Lazy Loading for audio/graphics

## 3. Technology Stack
| Concern | Choice | Rationale |
|---------|--------|-----------|
| Language | TypeScript | Types, tooling, safer refactors |
| Rendering | WebGL via PIXI.js (or custom minimal) | Batch sprites, particles, performance |
| Audio | Web Audio API | Mixing, ducking, layering |
| Build | Vite | Fast dev HMR, TS support |
| Testing | Vitest + Playwright | Unit + integration + visual/regression |
| Lint/Format | ESLint, Prettier | Consistency |
| Data Storage | localStorage + JSON; abstraction layer | Simple & portable |
| Optional Cloud | Future (REST adapter interface) | Extensibility |
| Accessibility | ARIA for menus, custom focus ring | Compliance |

## 4. High-Level Modules
| Module | Responsibilities | Key Requirements |
|--------|------------------|------------------|
| GameLoop | Timestep, update dispatch, frame pacing metrics | FR-7, AC-GF-9 |
| ArchetypeRegistry | Load 26 archetypes, validate schema | FR-1, AC-FR-1 |
| Spawner | Wave composition, weighting, boss logic | FR-2, FR-10, FR-13 |
| AdaptiveEngine | Calculate weight adjustments & mastery | FR-2, FR-4, AC-FR-9 |
| EnemySystem | Instantiate enemies, movement, attacks | FR-1, FR-10 |
| CollisionSystem | Broadphase + narrowphase; forgiveness | Performance, AC-GF Polish |
| FeedbackSystem | Particles, letter outline, hit/miss effects | FR-3, AC-FR-3 |
| AudioSystem | Phoneme playback, music stems, ducking | FR-5, FR-15, AC-FR-13, AC-GF-3 |
| ComboSystem | Track streaks, multipliers, aura | Engagement, AC-GF-1/2 |
| EventSystem | Surprise events scheduling/execution | 18.5, AC-GF-6/10 |
| SoftFailRecovery | Detect overwhelm & spawn pickup | FR-14 extended, AC-GF-5 |
| MicroGoalEngine | Select & track session goals | Engagement, 18.7 |
| ExportService | CSV/JSON generation | FR-8, AC-FR-11 |
| PersistenceService | Load/save stats, conflict resolve | FR-9 |
| AnalyticsService | Aggregate metrics, session record | FR-4 |
| AccessibilityService | Font toggle, captions, keyboard map | FR-6 |
| UI Layer | Menus, HUD, summaries | FR-11 |
| InputService | Map raw input to actions | FR-12 |
| LocalizationService | Phoneme mapping, runtime switches | FR-5, AC-FR-14 |

## 5. Data Model (Extended)
```ts
type LetterId = 'A'|'B'|'C'| ... 'Z';

interface EnemyArchetype {
    letter: LetterId;
    name: string;
    tier: 1|2|3|4|5;
    baseHP: number;
    basePoints: number;
    movementId: string; // references movement strategy
    attackId: string;   // references attack strategy
    audioPhoneme: string; // file key
    spriteSet: string[]; // animation frames keys
    colorTheme: string;  // token key
    behaviors?: string[]; // optional tags (boss, beam, phase)
}

interface LetterStats {
    letter: LetterId;
    exposures: number;
    correct: number;
    avgReactionMs: number; // exponential moving average
    lastShown: number; // epoch ms
    mastery: boolean;
    streakCorrect: number; // consecutive correct
}

interface SessionRecord {
    id: string;
    date: number;
    mode: string;
    durationSec: number;
    perLetter: { letter: LetterId; exposures: number; correct: number; avgReactionMs: number; }[];
    accuracyOverall: number;
    avgReactionMs: number;
}

interface ComboState {
    count: number;
    multiplier: number; // 1..4
    lastHitTime: number;
}

interface MicroGoal {
    id: string;
    type: 'AccuracyRaise'|'AchieveCombo'|'MasterLetter'|'ReactionTimeImprove';
    letter?: LetterId;
    target: number;
    progress: number;
    complete: boolean;
}
```

## 6. Systems Design
### 6.1 Event Bus
Simple topic-based publish/subscribe.
Events (subset): `ENEMY_SPAWNED`, `ENEMY_HIT`, `ENEMY_DEFEATED`, `LETTER_EXPOSED`, `WAVE_END`, `COMBO_CHANGED`, `BOSS_PHASE_CHANGE`, `SOFT_FAIL_TRIGGER`, `MICRO_GOAL_PROGRESS`, `SURPRISE_EVENT_START/END`.

### 6.2 Movement Strategies
Registered functions `(entity, dt)` flagged by movementId. Example: `sineHover`, `zigZag`, `scuttleSide`, `teleportPattern`, `serpentine`, `beamStationaryBob`.

### 6.3 Attack Strategies
Implement interface:
```ts
interface AttackStrategy { prepare?(entity: Enemy); update(entity: Enemy, dt: number): void; canFire(entity: Enemy, now:number): boolean; fire(entity: Enemy): Projectile[]; }
```
Special patterns (beam, chain lightning) use channelled states with telegraphs.

### 6.4 Adaptive Engine Algorithm
Inputs: LetterStats[], baseWeights (per tier), session context.
Formula:
```
weight = base * difficultyFactor * exposureFactor * masteryFactor * reactionFactor
difficultyFactor = accuracy < 0.8 ? 1.3 : accuracy < 0.9 ? 1.1 : 1
exposureFactor = exposures < 5 ? 1.2 : 1
masteryFactor = mastery ? 0.4 : 1
reactionFactor = avgReactionMs > 1200 ? 1.2 : avgReactionMs > 1000 ? 1.1 : 1
```
Normalize weights → spawn selection. Guarantee: At least 10% slots = mastered review.

### 6.5 Spawner
Wave template: `slots = difficultyConfig.baseSlots + scaling`. Fill order: (boss if wave%5==0) → focus letters (under threshold) → mastered review → filler variety. Ensures variety rule (no >40% one archetype unless targeted coaching).

### 6.6 Combo System
On `ENEMY_DEFEATED`: update timestamps, increment count if delta < 2000ms else reset. Recompute multiplier tiers. Emit `COMBO_CHANGED`.

### 6.7 Surprise Event System
Wave end: check eligibility (≥ wave 4, lastEventWavesAgo ≥2). Roll probability 5–8% dynamic (higher if no event past 6 waves). Trigger selected event script (Strategy interface similar to attacks). Lock until completion.

### 6.8 Soft Fail Recovery
Window sampler maintains circular buffer of last N hits/misses (time). On detection, spawn pickup entity with type `SLOW_TIME`. On collect: apply global timescale factor.

### 6.9 Micro Goal Engine
At session start compute candidate pool, pick 3 non-conflicting (distinct types or letters). Listen to events to increment progress; mark complete & play reinforcement animation.

### 6.10 Boss Phases
Boss entity holds phase index, thresholds {0.75,0.5,0.25}. On crossing threshold: queue `phaseTransition` state → telegraph → apply multipliers (speed, fire rate) + optionally spawn adds.

## 7. Game Loop
Fixed timestep 1/60s simulation using accumulator; render interpolated.
Pseudo:
```ts
let last = performance.now();
let acc = 0;
const STEP = 1000/60;
function frame(now:number){
    let delta = now - last; last = now; acc += delta;
    while(acc >= STEP){ update(STEP); acc -= STEP; }
    render(acc/STEP); requestAnimationFrame(frame);
}
```
`update()` orchestrates: Input → Timers → EnemySystem (movement/attacks) → Projectiles → Collisions → Adaptive sampling (end-of-wave) → Event systems → Audio queue → UI state diff.

## 8. State Management
Central `GameState` object (mutable within update) + read-only selectors for UI. Avoid global singletons; inject dependencies. Use discriminated union for screen states: `'TITLE'|'MODE_SELECT'|'PLAY'|'WAVE_SUMMARY'|'SESSION_REPORT'|'PAUSE'|'SETTINGS'`.

## 9. Adaptive Difficulty (Detail)
Evaluation Interval: End of each wave. Track moving averages using exponential factor α=0.15 for reaction times. Mastery check triggered after each correct event. Provide debug overlay (toggle) to visualize weight computations (supports QA for AC-FR-2, AC-FR-9).

## 10. Enemy Archetype Implementation
Archetype JSON file: `archetypes/letters.json` loaded once.
Schema validation (Zod or manual) ensures required keys.
Runtime builds registry `Map<LetterId, EnemyArchetype>`.
Instantiation merges static archetype with runtime attributes (current HP, position, timers).

## 11. Engagement Systems
### 11.1 Combo Visuals
HUD multiplier text + aura ring intensity scale. Color tokens per tier.
### 11.2 Music Layer Logic
AudioSystem subscribes `COMBO_CHANGED`; cross-fades stems.
### 11.3 Events & Pickups
Pickup entity types: `SLOW_TIME`, `SCORE_BUNDLE`, future placeholders.

## 12. Audio System Design
Sub-mix buses: `music`, `sfx`, `voice`. Gain nodes chain: Master → (music|sfx|voice). Ducking: On phoneme play set `music.gain = base * 0.6` restore with linear ramp (250ms). Preload phoneme audio sequentially to avoid blocking initial interaction time.

## 13. Rendering & Performance
Strategies:
- Sprite Batching: Combine letter enemy frames into atlas.
- Object Pools: Enemies, projectiles, particles reuse arrays.
- Dirty Rect / Layered Render: HUD only re-drawn when state changes.
- Frame Budget Monitoring: GameLoop collects frame time stats; logs warning if >0.5% frames exceed 33ms (AC-GF-9).
- Particle Cap: ≤ 60 simultaneous to guarantee 55 FPS (FR-7).

## 14. Accessibility Implementation
| Feature | Approach |
|---------|----------|
| Dyslexia Font | CSS font-face loaded; toggle updates root class |
| Color Blind Palettes | Token set swap (CSS variables) |
| Captions for Audio | Subtitles overlay triggered by phoneme events |
| Keyboard Controls | InputService maps arrow/space/enter/escape; focus ring for menus |
| Screen Reader Menus | ARIA roles, `aria-live` wave summary |
| Reduced Motion | Option to reduce particles & large screen shakes |

## 15. Telemetry & Analytics
Session aggregator listens to: wave results, per-letter events, combo peaks. At session end produce `SessionRecord` persisted. ExportService converts stored stats into CSV (AC-FR-11). Telemetry filtered to ethical minimal dataset.

## 16. Error Handling & Recovery
Graceful degradation if WebGL unavailable → canvas 2D fallback (reduced effects). Data load failures -> show retry modal. Corrupt local save -> backup & reset after user confirmation. Cloud sync conflicts -> letter-wise latest timestamp resolution.

## 17. Testing Strategy
| Test Type | Focus |
|----------|-------|
| Unit | Adaptive formula, combo transitions, weight normalization |
| Integration | Wave generation respecting constraints, boss phase transitions |
| Performance | Stress simulation (20 enemies + 30 projectiles) frame rate harness |
| Accessibility | Automated contrast & tab order tests |
| Audio | Ducking, stem activation logic |
| Data Persistence | Mastery flag triggers, export correctness |
| Event Exclusivity | Surprise event non-overlap |

Automation: Vitest for logic; Playwright for interactive flows (simulate 3 waves). Performance harness script outputs FPS distribution (assert percentile). CI gate: fail if AC-FR-7 or AC-GF-9 violated.

## 18. Requirements Traceability (Excerpt)
| Requirement | Module(s) |
|-------------|-----------|
| FR-1 | ArchetypeRegistry, EnemySystem |
| FR-2 | AdaptiveEngine, Spawner |
| FR-3 | FeedbackSystem, AudioSystem |
| FR-4 | AnalyticsService, PersistenceService |
| FR-5 | AudioSystem, LocalizationService |
| FR-6 | AccessibilityService, UI Layer |
| FR-7 | GameLoop, Rendering, Performance Harness |
| FR-8 | ExportService, PersistenceService |
| FR-9 | PersistenceService |
| FR-10 | EnemySystem (boss logic), Spawner |
| FR-11 | UI Layer |
| FR-12 | InputService, GameLoop |
| FR-13 | Spawner, AdaptiveEngine |
| FR-14 | SoftFailRecovery, GameLoop |
| FR-15 | AudioSystem |
| AC-GF-1/2 | ComboSystem |
| AC-GF-3 | AudioSystem |
| AC-GF-4 | EnemySystem (telegraphs) |
| AC-GF-5 | SoftFailRecovery |
| AC-GF-6/10 | EventSystem |
| AC-GF-7 | MicroGoalEngine |
| AC-GF-8 | UI Layer, InputService |
| AC-GF-9 | GameLoop, Performance Monitor |

Full matrix can be expanded in tasks.md for per-task referencing.

## 19. Extensibility Rules
Adding a new letter (future locale): add JSON entry + assets (sprite frames, phoneme). Movement/attack reuse or register new strategies by ID (Strategy Registry). No modifications to core loops. Schema versioning supports optional new fields with defaults.

## 20. Security & Privacy
No personal identifiers stored. Nicknames hashed (non-reversible) for multi-profile separation. Local storage data integrity check via SHA-256 of JSON + salt. Export only triggered by explicit user action.

## 21. Build & Asset Pipeline
Assets folder structure:
```
assets/
    sprites/letters/*.png
    audio/phonemes/*.ogg
    audio/music/{base,perc,arp,victory}.ogg
    data/archetypes/letters.json
```
Vite preloads critical assets (A, B, C, UI). Remaining letters lazy-loaded on first spawn. Generate atlas via pre-build script (texture packer). Phoneme audio small (<50KB compressed) to meet TTFI target.

## 22. Definition of Ready (for tasks derivation)
Each task must reference requirement ID(s), list touched module(s), success measure (test(s) to add), acceptance simulation step, rollback notes.

## 23. Pseudocode Highlights
### 23.1 Wave Generation
```ts
function generateWave(context){
    const weights = adaptiveEngine.computeWeights(context.letterStats);
    const slots = computeSlotCount(context.waveIndex, context.mode);
    const selection = pickLetters(weights, slots, constraints);
    if(isBossWave(context.waveIndex)) selection.overrideWithBoss(context);
    return selection.map(letter => createEnemy(letter));
}
```
### 23.2 Mastery Update
```ts
function registerHit(letter:LetterId, reactionMs:number){
    const ls = stats[letter];
    ls.exposures++; ls.correct++; updateAvgReaction(ls, reactionMs);
    if(ls.streakCorrect >= 5 || ls.correct/ls.exposures >= .95 && ls.exposures >= 20){ ls.mastery = true; }
}
```
### 23.3 Combo Update
```ts
function onEnemyDefeated(now:number){
    if(now - combo.lastHitTime <= 2000) combo.count++; else combo.count = 1;
    combo.lastHitTime = now;
    combo.multiplier = computeMultiplier(combo.count);
    eventBus.emit('COMBO_CHANGED', combo);
}
```

## 24. Open Questions (To Resolve Before Implementation)
1. Choose PIXI.js vs custom minimal WebGL? (Prototype both for performance & bundle size) – Decision deadline P1 mid.
2. Localization pipeline for phonemes (per locale letter-sound differences) – design by P2 start.
3. Speech recognition feasibility (browser support for young voices) – evaluate after P2.

## 25. Glossary (See requirements.md for shared terms)
Additional: Stem (audio layer), Telegraph (pre-attack warning visual), Timescale (global speed multiplier).

---
This design provides the actionable blueprint to implement the educational, adaptive, and engaging Alphabet Invaders experience while maintaining testability, performance, and accessibility.