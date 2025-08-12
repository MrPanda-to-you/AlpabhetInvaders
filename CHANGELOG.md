# Changelog

## Phase 1 – MVP Core (T1.1–T1.14)
Date: 2025-08-12
Tags: milestone/phase-1-complete, milestone/T1.1..T1.14

Highlights
- Game Loop & Timing (T1.1): Fixed timestep + interpolation, spiral-of-death guard, rich frame pacing stats, FPS overlay (F2).
- Input (T1.2): Keyboard/mouse/touch mapping with pressed-state tracking and subscriptions.
- Assets (T1.3): Async asset loader/registry; minimal A/B/C phonemes + UI stubs.
- Archetypes (T1.4): letters.json + schema validation via Ajv; 26 entries validated at boot.
- Enemies (T1.5): Basic Enemy model with update loop; movement and attack strategy registries (A/B/C).
- Collision & Projectiles (T1.6): Spatial hash broadphase, AABB checks with forgiveness; projectile model and culling.
- Adaptive + Spawner (T1.7): computeWeights, review picker, wave slot/grid generator; integration with archetypes; tests.
- Feedback (T1.8): Hit/miss particles, outline effect, SFX hook points; styling and optional pooling.
- Audio (T1.9): Buses (master/music/sfx/voice), decibel ducking with fade, equal-power music crossfade, phoneme preload (A–Z), runtime phoneme preload in wave factory, in-game audio panel (F3) with persistence.
- UI States & HUD (T1.10): UI state manager (title/play/summary), start screen & wave summary overlays, HUD (score/lives/wave/targets).
- Persistence (T1.11): Audio settings + SessionRecord + LetterStats with checksum integrity; helper APIs.
- Accessibility (T1.12): Dyslexia font toggle, phoneme captions via aria-live region, persisted settings.
- Archetype Expansion (T1.13): Minimal movement and attack strategies implemented for all 26 archetypes; registry coverage test.
- Tests & Performance Harness (T1.14): Comprehensive unit/integration tests; dense-scene performance smoke test (20 enemies + 30 projectiles, 3s sim).

Milestone Tags
- milestone/T1.1 … milestone/T1.14
- milestone/phase-1-complete

Test Status (local)
- 36 files, 59 tests passing.

Notes
- Thresholded FPS assertions deferred to CI/perf environment; current harness validates stability.
- Music stem layering (T3.2) scaffolding present; full layering/fades deferred.

