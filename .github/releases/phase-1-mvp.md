# Release: Phase 1 – MVP Core (T1.1–T1.14)

Tag: milestone/phase-1-complete
Date: 2025-08-12

Summary
- MVP gameplay loop, 26 archetypes, adaptive spawner, audio system with ducking + crossfade, HUD/overlays, local persistence, baseline accessibility, and comprehensive tests.

Highlights
- Game Loop & Timing (T1.1): Fixed timestep + interpolation, spiral-of-death guard, frame pacing stats, FPS overlay (F2).
- Input (T1.2): Keyboard/mouse/touch mapping with subscriptions.
- Assets (T1.3): Async loader/registry; minimal phoneme stubs.
- Archetypes (T1.4, T1.13): letters.json + schema validation; strategies for all 26 letters.
- Enemies (T1.5): Movement/attack registries, update loop.
- Collision & Projectiles (T1.6): Spatial hash, AABB, culling.
- Adaptive + Spawner (T1.7): Weights, review picker, wave slots.
- Feedback (T1.8): Hit/miss particles, outline, SFX hooks.
- Audio (T1.9): Buses (master/music/sfx/voice), ducking with fade, equal-power crossfade, A–Z phoneme registration, runtime preloads; in-game audio panel (F3) with persistence.
- UI & HUD (T1.10): State manager (title/play/summary), start screen + wave summary overlays, HUD (score/lives/wave/targets).
- Persistence (T1.11): Audio settings + SessionRecord + LetterStats with checksum integrity.
- Accessibility (T1.12): Dyslexia font toggle, phoneme captions (aria-live), persisted.
- Tests & Harness (T1.14): Unit/integration tests; dense-scene performance smoke test (20 enemies + 30 projectiles, 3s sim).

Breaking changes
- None.

How to run
```bash
npm install
npm run dev
```

How to test
```bash
npm test
```

Milestone tags
- milestone/T1.1 … milestone/T1.14
- milestone/phase-1-complete

Notes
- FPS threshold assertions are deferred to CI perf runs; current harness validates stability and emissions.
- Music stem layering (T3.2) is scaffolded; full layering/fades planned for Phase 3.
