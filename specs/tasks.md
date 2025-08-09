# Alphabet Invaders – Implementation Tasks (tasks.md)
Version: 1.0 (aligned with requirements v1.0 and design v1.0)
Status: Draft for execution
Last Updated: 2025-08-08

Legend: FR-x = Functional Requirement; AC-FR-x = Acceptance Criterion; AC-GF-x = Game Feel Acceptance.

Dependency convention: Tasks listed in order; subtasks within a group can run in parallel unless otherwise noted.

## Phase 0 – Project & Tooling Baseline
- [x] T0.1 Initialize project tooling (TypeScript, Vite, ESLint, Prettier).
  - Deliverables: package.json, tsconfig.json, vite.config.ts, .eslintrc, .prettierrc.
  - Success: dev server runs, TS builds.
  - Requirements: Non-functional (Maintainability), Performance targets scaffolding.

- [x] T0.2 Basic folder structure & aliases.
  - Deliverables: src/{core,systems,ui,assets,data}, public/.
  - Requirements: Maintainability.

- [x] T0.3 CI placeholders and test harness setup (Vitest + Playwright).
  - Deliverables: vitest.config.ts, playwright.config.ts, initial spec files.
  - Requirements: Testability (Non-Functional).

## Phase 1 – MVP Core Loop, Archetypes, Adaptive Basics (Roadmap P1)
Branch: feat/phase-1-mvp-core-archetypes (created)
- [ ] T1.1 GameLoop & Timing
  - Implement fixed timestep update + interpolated render; frame pacing stats collector.
  - Deliverables: src/core/loop.ts, FPS overlay debug toggle.
  - Success: AC-GF-9 threshold computed; 60s sample shows metrics.
  - Requirements: FR-7, AC-GF-9, AC-FR-12.
  - Progress: Fixed-timestep loop scaffolded; stats collector present; FPS overlay added with F2 toggle and dev auto-enable.

- [ ] T1.2 InputService
  - Map keyboard/mouse/touch to actions; latency budget monitoring hooks.
  - Deliverables: src/core/input.ts, action enums, listeners.
  - Success: Input→projectile spawn ≤80ms under harness.
  - Requirements: FR-12, AC-FR-12.
  - Progress: InputService added with key/mouse/touch mappings, pressed-state tracking, and subscription API; unit tests cover key mappings.

- [ ] T1.3 Asset Loader & Registry
  - Async loading for images/audio; lazy loading hooks.
  - Deliverables: src/core/assets.ts; preload minimal set (A,B,C, UI), lazy others.
  - Requirements: Performance, FR-5.

- [ ] T1.4 Archetype Registry + Schema
  - Create letters.json + Zod (or manual) validator; load to Map<LetterId, Archetype>.
  - Deliverables: assets/data/archetypes/letters.json; src/systems/archetypes.ts.
  - Success: 26 unique entries validated at boot.
  - Requirements: FR-1, AC-FR-1, Extensibility.
  - Progress: letters.json + letters.schema.json + README added; runtime loader with Ajv validation implemented; 26 entries verified in unit test.

- [ ] T1.5 EnemySystem (basic)
  - Implement entity model, movement & attack strategy registries; A, B, C minimal.
  - Deliverables: src/systems/enemies.ts, src/systems/movement.ts, src/systems/attacks.ts.
  - Requirements: FR-1; sets base for FR-10 later.

- [ ] T1.6 CollisionSystem + Projectiles
  - Broadphase grid + narrowphase AABB; forgiveness radius per design.
  - Deliverables: src/systems/collision.ts, src/systems/projectiles.ts.
  - Requirements: FR-7 (performance), AC-GF Polish.

- [ ] T1.7 Spawner v1 + Adaptive Engine v1
  - Implement weight formula, wave generator; guarantee 10% mastered review; no bosses yet.
  - Deliverables: src/systems/spawner.ts, src/systems/adaptive.ts.
  - Requirements: FR-2, FR-13, AC-FR-2.

- [ ] T1.8 Feedback System (basic)
  - Hit/miss particles, letter-outline effect; positive/negative SFX hooks.
  - Deliverables: src/systems/feedback.ts, particles.
  - Requirements: FR-3, AC-FR-3.

- [ ] T1.9 Audio System (phonemes + ducking)
  - Voice channel, music/sfx buses, ducking during phonemes.
  - Deliverables: src/systems/audio.ts, load phoneme files for A–Z.
  - Requirements: FR-5, FR-15, AC-FR-13.

- [ ] T1.10 UI States & HUD (minimal)
  - Title, Mode Select (Learn, Mixed), Play, Wave Summary; basic HUD (score, lives, targets).
  - Deliverables: src/ui/screens/*, src/ui/hud.ts.
  - Requirements: FR-11.

- [ ] T1.11 Persistence (Local)
  - Save/load LetterStats, SessionRecord; simple checksum.
  - Deliverables: src/core/storage.ts.
  - Requirements: FR-4, FR-9.

- [ ] T1.12 Accessibility (baseline)
  - Dyslexia font toggle, keyboard-only flow, captions for phonemes.
  - Deliverables: src/ui/accessibility.ts, CSS var themes.
  - Requirements: FR-6, Non-Functional Accessibility.

- [ ] T1.13 Expand archetypes to all 26
  - Implement movement/attack subsets to represent each letter minimally.
  - Deliverables: completed letters.json entries + placeholder sprites/audio wiring.
  - Requirements: FR-1, Table in §4 requirements.

- [ ] T1.14 MVP Tests & Harness
  - Unit: adaptive weights, archetype validation; Integration: 3-wave simulation; Performance harness (20 enemies + 30 projectiles, FPS ≥55).
  - Deliverables: tests/*.
  - Requirements: AC-FR-7, AC-FR-2, AC-FR-1.

## Phase 2 – Bosses, Advanced Attacks, Analytics, Reports (Roadmap P2)
- [ ] T2.1 Boss Framework & Phases
  - Multi-phase thresholds, telegraphs, add-spawns; implement C, O, Q bosses.
  - Deliverables: src/systems/boss.ts; updates to attacks.
  - Requirements: FR-10, AC-FR-8.

- [ ] T2.2 Advanced Attack Types
  - L beam channel, Z chain lightning bounce, O ink slow zones, D flame cone DoT.
  - Deliverables: src/systems/attacks/*.ts.
  - Requirements: FR-1 (per-letter uniqueness), AC-GF-4 (telegraphing).

- [ ] T2.3 Session Report & Wave Summary Polish
  - Detailed per-letter stats, mastery progress bars; skippable summaries.
  - Deliverables: src/ui/report.ts, summary component.
  - Requirements: FR-11, AC-GF-8.

- [ ] T2.4 Analytics Export (Educator)
  - CSV/JSON export; file download with required headers.
  - Deliverables: src/services/export.ts.
  - Requirements: FR-8, AC-FR-11.

- [ ] T2.5 Difficulty Scaling Refinements
  - Wave-to-wave smoothing cap (≤ +15% composite), limit pressure archetypes ≤ 30% of slots.
  - Deliverables: spawner/adaptive updates + tests.
  - Requirements: FR-13, 18.1 pillars.

- [ ] T2.6 Performance Polish
  - Particle caps, beam concurrency caps, pooling; ensure ≥55 FPS scenes.
  - Deliverables: performance config + tests.
  - Requirements: FR-7, AC-GF Polish list.

## Phase 3 – Engagement Layer (Combos, Music Layers, Events, Recovery, Goals)
- [ ] T3.1 Combo System
  - Track counts, tiers, aura visuals; multiplier application to score.
  - Deliverables: src/systems/combo.ts, HUD indicator.
  - Requirements: AC-GF-1, AC-GF-2.

- [ ] T3.2 Dynamic Music Layering
  - Percussion at x2, arpeggio at x3; 400ms fades; victory sting.
  - Deliverables: audio stem control in AudioSystem.
  - Requirements: AC-GF-3, FR-15.

- [ ] T3.3 Surprise Events
  - Event scheduler + scripts for Meteor Rain, Bonus Comet, Time Bubble; exclusivity + spacing.
  - Deliverables: src/systems/events.ts.
  - Requirements: 18.5, AC-GF-6, AC-GF-10.

- [ ] T3.4 Soft Fail Recovery
  - Detection window, SLOW_TIME pickup, cooldown.
  - Deliverables: src/systems/recovery.ts.
  - Requirements: FR-14 (extended), AC-GF-5.

- [ ] T3.5 Session Micro Goals
  - Goal selection at start, progress tracking, completion feedback.
  - Deliverables: src/systems/goals.ts, HUD micro-goal strip.
  - Requirements: 18.7, AC-GF-7.

## Phase 4 – Modes, Localization, Cloud, Spelling Prototype (Roadmap P3/P4)
- [ ] T4.1 Timed Challenge Mode
  - 60–120s score chase; RT measurement highlights.
  - Deliverables: mode flag, timer HUD, summary delta.
  - Requirements: Game Modes §5.

- [ ] T4.2 Localization Runtime Switching
  - Language pack structure for phonemes; reload without refresh.
  - Deliverables: src/services/i18n.ts; audio mapping swap.
  - Requirements: AC-FR-14, Non-Functional Localization.

- [ ] T4.3 Optional Cloud Sync
  - Abstract persistence; plug simple REST adapter; per-letter latest-timestamp merge.
  - Deliverables: src/services/cloud.ts; interface + mock.
  - Requirements: FR-9 (cloud), Security/Privacy.

- [ ] T4.4 Spelling Mode Prototype (Future)
  - Sequence target letters to spell words; gating on mastery ≥15 letters.
  - Deliverables: mode implementation + simple word list.
  - Requirements: Game Modes §5 (future), Pedagogical tie-in.

## Cross-Cutting – Accessibility, QA, and A/B
- [ ] C1 Accessibility Pass
  - Contrast checks, keyboard navigation, reduced motion option, captions.
  - Deliverables: automated tests + manual checklist.
  - Requirements: FR-6, Non-Functional Accessibility.

- [ ] C2 Playwright Scenarios
  - Simulate 5 waves incl. boss; verify telegraphs, skip, combo transitions.
  - Deliverables: e2e specs.
  - Requirements: AC-FR-8, AC-GF-8, AC-GF-1/2/4.

- [ ] C3 Performance Harness
  - Script to spawn worst-case entities and assert FPS distribution.
  - Deliverables: perf tests + CI threshold.
  - Requirements: FR-7, AC-GF-9, AC-FR-7.

- [ ] C4 Data Export Validation
  - Golden sample CSV compare; schema change detector.
  - Deliverables: tests for export headers/order.
  - Requirements: AC-FR-11.

## Asset Pipeline & Content Tasks
- [ ] A1 Sprite Atlas Generation
  - Texture packer config; atlas JSON; update loader.
  - Requirements: Performance, FR-7.

- [ ] A2 Phoneme Audio Prep
  - Normalize levels, compress (<50KB), naming convention; load list.
  - Requirements: FR-5, FR-15.

- [ ] A3 Visual Telegraphs
  - Create VFX assets for heavy attacks; ensure 300–500ms cues.
  - Requirements: AC-GF-4.

## Requirements Coverage Summary
- FR-1: T1.4, T1.5, T1.13, T2.2
- FR-2: T1.7 (+ tests T1.14)
- FR-3: T1.8
- FR-4: T1.11, T2.3 (report visuals)
- FR-5: T1.9, A2
- FR-6: T1.12, C1
- FR-7: T1.1, T1.6, T1.14, T2.6, C3, A1
- FR-8: T2.4, C4
- FR-9: T1.11, T4.3
- FR-10: T2.1
- FR-11: T1.10, T2.3
- FR-12: T1.2
- FR-13: T1.7, T2.5
- FR-14: T3.4
- FR-15: T1.9, T3.2, A2
- AC-FR-1..15: Covered across T1.1–T3.5 per task notes
- AC-GF-1..10: T3.1–T3.5, T2.5, T2.6, C2, C3

## Definition of Done (per task)
1) Code merged with tests; 2) All referenced acceptance checks pass locally; 3) No new lint/type errors; 4) Docs/comments updated; 5) Telemetry minimal & behind toggles where relevant.

## Notes
- Early vertical slice suggestion: complete T1.1–T1.3, T1.5 (A/B/C only), T1.8–T1.10 to demo playable loop in <1 week, then iterate.