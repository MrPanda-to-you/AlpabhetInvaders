# Phase 1 – MVP Core (T1.1–T1.14)

Tag: milestone/phase-1-complete
Target: main
Date: 2025-08-12

## Summary
Phase 1 delivers the MVP core loop, systems, and baseline content for Alphabet Invaders. It includes a fixed-timestep game loop with interpolation and frame pacing stats, enemy archetypes and strategies for all 26 letters, adaptive wave generation, audio with equal-power crossfades and ducking, UI overlays and HUD, local persistence (audio + session/letter stats with checksum), accessibility baseline (dyslexia font + phoneme captions), and a dense-scene performance smoke test.

See full details in CHANGELOG.md.

## Highlights
- Game Loop & Timing (T1.1): Fixed timestep + interpolation; stats; FPS overlay (F2).
- Input (T1.2): Keyboard/mouse/touch mapping; subscriptions.
- Assets (T1.3): Async loader/registry; minimal phoneme/UI stubs.
- Archetypes (T1.4): letters.json + Ajv validation; 26 entries.
- Enemies (T1.5): Base Enemy model; strategy registries.
- Collision & Projectiles (T1.6): Spatial hash; AABB with forgiveness.
- Adaptive + Spawner (T1.7): Weights + review picker; grid slots; integration.
- Feedback (T1.8): Particles (hit/miss), outline; SFX hooks; styling; pooling.
- Audio (T1.9): Buses, ducking with fade, equal-power crossfade; A–Z phonemes; runtime preload; in-game audio panel (F3) with persistence.
- UI & HUD (T1.10): State manager (title/play/summary), start & wave summary overlays; HUD (score/lives/wave/targets).
- Persistence (T1.11): Audio settings + SessionRecord + LetterStats with checksum and helpers.
- Accessibility (T1.12): Dyslexia font toggle; phoneme captions (aria-live); persisted.
- Archetypes Expansion (T1.13): Minimal movement/attack strategies for all letters; coverage test.
- Tests & Perf Harness (T1.14): Broad unit/integration coverage; dense-scene performance smoke test.

## Milestone Tags
- milestone/T1.1 … milestone/T1.14
- milestone/phase-1-complete

## Test Status (local)
- 36 files, 59 tests passing (Vitest).

## How to run locally
- Dev server: npm run dev
- Build: npm run build
- Tests: npm test

## Notes
- FPS thresholds are deferred to CI perf runs; harness ensures stability.
- Dynamic music layering (T3.2) scaffolding exists; full layering is future work.

