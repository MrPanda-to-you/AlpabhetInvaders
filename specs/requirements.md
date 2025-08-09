# Alphabet Invaders – Requirements Specification

Version: 1.0 (Pedagogical Enemy Archetype Rewrite)
Status: Draft for Implementation
Last Updated: 2025-08-08

## 1. Introduction
### 1.1 Problem Statement
Young learners struggle to retain letter recognition and phonetic association when exposed only to static flashcards. We need a dynamic, repeatable, feedback‑rich experience that binds each letter to a memorable visual, movement pattern, sound, and interactive challenge.

### 1.2 Vision
Create a Space‑Invaders–inspired educational arcade where every letter (A–Z) is embodied by a distinct enemy archetype whose behavior reinforces memory through multi‑sensory cues (visual silhouette, motion style, audio sting, attack type, difficulty rhythm). The game adapts to player mastery, scaffolds learning, and produces actionable learning analytics.

### 1.3 Core Educational Objectives
1. Rapid uppercase letter recognition (target < 1.2s average identification per letter by Level 5)
2. Phoneme association (player can hear + optionally speak the letter sound)
3. Reinforcement via repetition spaced over sessions (SRS-lite scheduling)
4. Motivation through progression, badges, streaks, and boss archetypes
5. Accessibility for diverse learners (dyslexia-friendly fonts, color‑blind safe palettes, audio captioning)

### 1.4 Target Users
- Primary: Children ages 4–7 beginning alphabet mastery
- Secondary: Educators/parents wanting progress tracking
- Tertiary: Localization contributors expanding letter-sound sets

### 1.5 Success Criteria (High Level)
| Dimension | Metric | Target (Initial Release) |
|-----------|--------|--------------------------|
| Engagement | Avg session length | 6–10 min |
| Learning | Letter recognition accuracy | ≥ 90% after 3 sessions |
| Learning | Mean reaction time improvement | 20% reduction from session 1 to 3 |
| Retention | 7‑day return rate | ≥ 40% (child accounts) |
| Accessibility | WCAG contrast & keyboard operability | 100% core flows |
| Performance | Frame rate (desktop) | ≥ 55 FPS typical |

## 2. Pedagogical Model
Learning = (Salient Distinctiveness) × (Active Recall Frequency) × (Immediate Feedback Quality).

For each letter we bind: visual silhouette, pronounced phoneme, animated movement mnemonic, unique attack effect, on-hit or defeat vocalization, and reward particle color → creating multi-channel memory traces.

Adaptive loop: track per-letter accuracy & response latency → adjust spawn weight (harder / weaker letters appear more). Mastery threshold per letter: ≥ 5 consecutive correct identifications OR accuracy ≥ 95% over last 20 exposures.

## 3. Core Game Loop
1. Spawn wave containing curated subset of letters (mix of focus letters + mastered review + new introduction) 
2. Player identifies target letter(s) (varies by mode) and shoots / selects / types
3. Immediate feedback (positive: sparkle + phoneme replay; negative: gentle correction + slower repetition)
4. Wave clears → summary card (letters practiced, accuracy, new mastery progress)
5. Periodic boss (every 5 waves) representing aggregated challenge letter

## 4. Letter–Enemy Archetype Mapping (A–Z)
Attributes: Name (Mnemonic), Role, Movement Pattern, Attack Mechanic, Difficulty Tier (1=Intro, 5=Boss), Points (Base), Special Pedagogy Hook.

| Ltr | Archetype | Role | Movement Pattern | Attack Mechanic | Tier | Pts | Pedagogy Hook |
|-----|-----------|------|------------------|-----------------|------|-----|---------------|
| A | Alien | Baseline intro | Horizontal glide w/ gentle descent | Single slow pellet | 1 | 10 | "A says /æ/" voice; green A outline |
| B | Beetle | Disruptor | Erratic zigzag bursts | Spread of 2 small shots | 2 | 14 | Shell forms letter B silhouette when hit |
| C | Crab | Mini-boss | Side scuttle + pause claws | Dual lateral claw projectiles | 3 | 40 | Claw arc traces a C |
| D | Dragon | Power attacker | Sine hover + swoop | Short flame cone (DoT) | 4 | 55 | Flame curls into D on dissipate |
| E | Eagle | Diver | High-altitude dive bombs | Precision dive strike | 2 | 18 | Trail leaves 3-line E flash |
| F | Formidable Fighter | Tanky mid | Slow drift + shield pulses | Charged heavy shot after flash | 3 | 30 | Shield segments form F |
| G | Ghost | Elusive | Phase in/out drift | Only shoot while visible | 2 | 16 | Transparency outlines G |
| H | Hunter | Tracker | Locks x-position to player | Fast narrow shots | 3 | 28 | Tracking laser forms H grid |
| I | Insect Swarm | Swarm | Cluster micro drift | Many tiny weak pellets | 2 | 15 | Stack lines show I shape |
| J | Jet | Speedster | Rapid horizontal dashes | Backward exhaust projectile | 3 | 26 | Exhaust trail forms hook J |
| K | Knight | Armored | Staggered advance (step-step pause) | Reflect first shot, then strike | 4 | 48 | Shield break reveals K |
| L | Laser | Beam source | Slow vertical bob | Continuous vertical beam channel | 4 | 52 | Beam column edges = L |
| M | Monster | Large presence | Slow oscillation occupying space | Area shockwaves | 4 | 60 | Shockwave rings highlight M |
| N | Ninja | Unpredictable | Teleport short-range | Shuriken diagonal throws | 3 | 34 | Teleport dash draws N |
| O | Octopus | Boss | Tentacle wave cycles | Radial ink blobs (slow zones) | 5 | 120 | Ink circle leaves O gap |
| P | Progressive UFO | Scaling | Each hit speeds & changes color | Standard pellet escalating to burst | 3 | 36 | Color gradient through P palette |
| Q | Queen | Ultimate boss | Multi-phase pattern mix | Summons minions + spiral shots | 5 | 200 | Crown highlight forms Q tail |
| R | Robot | Rhythmic | Clockwork step timing | Timed volleys synced to ticks | 3 | 32 | Gears align R pattern |
| S | Shapeshifter Squid | Adaptive | Morphs every few seconds | Ink cloud (screen dim) | 4 | 58 | Shapes cycle S path |
| T | Tank | Heavy | Very slow push downward | Wide armor-piercing shell | 3 | 38 | T shaped chassis |
| U | UFO | Classic bonus | Smooth hover + dart escape | Occasional fast beam | 2 | 22 | Bonus chime says /juː/ |
| V | Viper | Serpentine | Wavy diagonal serpentine | Venom droplet arcs | 3 | 30 | Trail draws V chevrons |
| W | Wasp | Aggressor | Buzz loops around letter clusters | Rapid stingers | 3 | 30 | Buzz audio overlays W waveform |
| X | X-Fighter | Mystery | Cross pattern pivot | X-cross diagonal lasers | 4 | 64 | Laser cross makes X |
| Y | Yamato | Battleship | Slow cruise + turret rotation | Sequential turret salvos | 4 | 70 | Turret layout forms Y forks |
| Z | Zapper | Electric | Quick zigzag descents | Chain lightning (bounces) | 4 | 66 | Bolt path traces Z |

## 5. Game Modes
1. Learn Mode (Single Focus): Only 3–5 target letters per session; slowed speed; verbal call-outs.
2. Mixed Practice: Weighted spawn; adaptive difficulty.
3. Boss Gauntlet: Every 5th wave features a multi-hit archetype (C, O, Q rotation...)
4. Timed Challenge: 60–120s score chase measuring reaction time.
5. Spelling (Future): Player must shoot letters in sequence to spell prompted word (scaffold after mastery of ≥ 15 letters).

## 6. Functional Requirements
### FR-1 Letter Archetype System
Each letter must map to a unique data object (id, sprite set, movement script, attack script, phoneme audio file, difficulty tier, spawn weighting, mastery status).

### FR-2 Adaptive Spawner
Spawner evaluates per-letter performance metrics (accuracy %, avg reaction time, last exposure timestamp) every wave to compose next wave mix.

### FR-3 Feedback & Reinforcement
Positive: Distinct success sound + phoneme replay + particle forming letter outline. Negative: Soft error tone + highlight correct letter after grace period.

### FR-4 Progress Tracking
Per-player profile storing (letter exposures, correct count, avg RT, mastery flag, last practiced date, streaks).

### FR-5 Audio Phoneme Layer
On first appearance of a letter in a session, pronounce phoneme; optional replay on hover or tap (accessibility toggle).

### FR-6 Accessibility
Configurable font (OpenDyslexic), color blind palette toggle, captioning for all audio, complete keyboard control.

### FR-7 Performance & Smoothness
Maintain ≥ 55 FPS on baseline hardware with up to 20 concurrent enemies (worst-case swarm + projectiles).

### FR-8 Analytics Export (Educator)
Export JSON/CSV summary of last N sessions (accuracy, RT improvement, letters needing review).

### FR-9 Persistence
Local storage fallback + optional cloud sync (abstracted service interface) with conflict resolution (latest timestamp wins per-letter).

### FR-10 Boss Phases
Multi-phase templates (Intro -> Aggressive -> Frenzy) controlling speed multipliers, spawn adds, attack cadence.

### FR-11 UI States
Title, Mode Select, Active Play, Wave Summary, Session Report, Settings, Accessibility, Profile Switch, Pause.

### FR-12 Input Methods
Mouse / touch tap, keyboard (arrow + space / letter key direct), optional on-screen large letter bar (Learn Mode only).

### FR-13 Difficulty Scaling
Parameters: enemy speed, projectile speed, concurrent enemies, spawn interval, boss HP, reaction time target windows.

### FR-14 Error Recovery
If player misses 3 consecutive target letters, auto-slow plus highlight target silhouette until next correct.

### FR-15 Audio Mixing
Separate channels: music, SFX, phoneme voice; independent volume & mute; duck music during phoneme playback.

## 7. Non-Functional Requirements
| Category | Requirement |
|----------|------------|
| Performance | Cold load < 3s (desktop broadband), soft navigation < 150ms |
| Responsiveness | Input-to-visual response < 80ms |
| Reliability | Crash-free rate ≥ 99.5% sessions |
| Accessibility | WCAG 2.1 AA color contrast; full keyboard navigation |
| Localization | Letter audio + labels externalized; support EN first, structure for additional locales |
| Privacy | No personal data beyond nickname; COPPA-friendly (no external tracking without consent) |
| Security | Obfuscate local save to discourage tampering (checksum) |
| Maintainability | Archetype addition requires only data file + assets, no engine code change |
| Testability | 90% of gameplay logic covered by unit/integration tests |

## 8. Data Model (Conceptual)
LetterStat: { letter, exposures, correct, avgReactionMs, lastShown, mastery: bool }
EnemyArchetype: { letter, name, tier, movementId, attackId, baseHP, basePoints, audioPhoneme, spriteRefs, colorTheme }
SessionRecord: { id, date, mode, durationSec, perLetter: [LetterPerformance], accuracyOverall, avgReactionMs }

## 9. Adaptive Algorithm (Summary)
Spawn Weight W = BaseWeight × DifficultyMultiplier × (1 - MasteryBoost) × ReviewFactor
- If mastery=false & accuracy < 80% ⇒ DifficultyMultiplier = 1.3
- If avgReaction > target (1200ms) ⇒ ReactionPenalty = +0.2 added to weight
- Mastered letters appear at minimum 10% of wave cells for spaced review (MasteryBoost caps weight at 0.4 of base)

## 10. Acceptance Criteria (Representative)
Format uses GIVEN / WHEN / THEN (EARS style). Each major functional requirement has at least one testable criterion.

### AC-FR-1 (Letter Archetype System)
GIVEN the game is initialized WHEN loading archetypes THEN 26 unique letter entries SHALL be present AND each SHALL include movementId, attackId, audioPhoneme, spriteRefs.

### AC-FR-2 (Adaptive Spawner)
GIVEN a player with low accuracy (<80%) on letter "B" WHEN generating the next wave THEN the spawn probability of "B" SHALL be ≥ 1.2× its base weight until accuracy ≥ 90%.

### AC-FR-3 (Feedback)
WHEN a player correctly defeats a letter enemy THEN a phoneme audio clip SHALL play within 300ms AND a letter-outline particle effect SHALL display for ≥ 0.5s.

### AC-FR-4 (Progress Tracking)
WHEN a session ends THEN a SessionRecord SHALL persist with per-letter accuracy and avg reaction times.

### AC-FR-5 (Phoneme Replay)
GIVEN Learn Mode is active WHEN the player clicks a letter on-screen THEN the associated phoneme SHALL replay without advancing the wave.

### AC-FR-6 (Accessibility Font)
GIVEN Accessibility > Dyslexia Font = ON WHEN rendering letter HUD THEN all letter glyphs SHALL use the configured dyslexia-friendly typeface.

### AC-FR-7 (Performance)
GIVEN 20 concurrent enemies + 30 active projectiles WHEN measuring frame time over 5s THEN average FPS SHALL be ≥ 55.

### AC-FR-8 (Boss Phase Transition)
GIVEN a boss reaches 50% HP WHEN phase threshold is crossed THEN movement speed multiplier SHALL increase by ≥ 1.25× AND a telegraph animation SHALL play before new attack pattern.

### AC-FR-9 (Mastery Flag)
GIVEN a letter has ≥5 consecutive correct identifications WHEN updating its stats THEN mastery SHALL be set true AND spawn weight reduced per algorithm.

### AC-FR-10 (Error Recovery)
GIVEN the player has 3 consecutive misses in the same wave WHEN the 4th target spawns THEN global enemy speed SHALL reduce by at least 25% until one correct hit.

### AC-FR-11 (Export)
WHEN educator export is invoked THEN a CSV with headers (Letter, Exposures, Correct, AccuracyPct, AvgReactionMs, Mastery) SHALL download.

### AC-FR-12 (Input Latency)
WHEN the player presses fire THEN the projectile spawn animation SHALL appear within 80ms.

### AC-FR-13 (Audio Ducking)
WHEN a phoneme plays THEN background music volume SHALL reduce by ≥ 40% and restore after playback ends.

### AC-FR-14 (Localization Placeholder)
GIVEN language pack is switched WHEN loading next session THEN all phoneme audio file references SHALL update without page reload.

### AC-FR-15 (Shapeshifter Behavior)
GIVEN S (Shapeshifter) is alive WHEN 4 seconds elapse since last morph THEN it SHALL change sprite form and movement variant.

## 11. Priority & Roadmap
| Phase | Scope |
|-------|-------|
| P1 (MVP) | Core loop (Learn + Mixed), 26 archetypes (simplified attacks), adaptive spawner v1, tracking, phoneme audio, accessibility basics |
| P2 | Boss phases, advanced attacks, export, difficulty scaling refinements, analytics dashboard |
| P3 | Timed Challenge, cloud sync, localization framework, spelling mode prototype |
| P4 | Advanced pedagogy (speech recognition for letter repetition), classroom multi-profile management |

## 12. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Over-complex enemy behaviors overwhelm learners | Reduced educational focus | Progressive unlocking; simpler patterns in early waves |
| Performance degradation with particle/audio layering | Choppy experience | Object pooling; sprite atlas; audio channel limiting |
| Audio fatigue | Lower engagement | Cooldowns for phoneme replays; user toggle |
| Accessibility regressions | Exclusion | Automated contrast tests in CI |
| Data loss (local storage clear) | Frustration | Optional cloud sync + periodic export reminder |

## 13. Telemetry (Ethical, Minimal)
Captured: session start/end time, per-letter accuracy, reaction times, mode played, settings toggles. Not captured: personal identity, location, external identifiers. All metrics anonymized / pseudonymous.

## 14. Extensibility Guidelines
To add a new letter variant (future multilingual): add archetype JSON, sprite sheet, phoneme audio, and optional movement script. No engine code edits required; runtime loads registry.

## 15. Definition of Done (Per Feature)
1. All mapped acceptance criteria passing
2. No critical accessibility violations
3. Performance thresholds validated in test harness
4. Automated tests updated (≥ 1 unit + 1 integration per new system)
5. Archetype data validated against schema
6. Documentation updated (README + archetype registry comments)

## 16. Glossary
Phoneme: The basic sound associated with a letter (English initial sound baseline)
Mastery: Flag indicating learner meets accuracy & repetition thresholds
Reaction Time (RT): Time from enemy on-screen spawn (or highlight) to correct hit
Archetype: Bundle of behavior + presentation reinforcing a letter

## 17. Appendices
### A. Test Hooks
- Deterministic RNG seed toggle for reproducible waves
- Performance overlay (FPS, entity counts)
- Letter debug overlay (spawn weight, accuracy, mastery)

### B. Future Enhancements (Not in Scope Now)
- Speech recognition (player repeats phoneme aloud)
- Cooperative mode (parent + child)
- Narrative campaign (letter galaxies)
- Dynamic music layering by letter category

---
This requirements specification operationalizes the pedagogical alphabet mapping into concrete, testable systems ensuring each letter becomes a distinctive, memorable encounter that accelerates learning while sustaining engagement.

## 18. Game Feel & Engagement Specification
Purpose: Ensure the experience is not only educational but intrinsically fun, fluid, and motivating—driving repeated voluntary play while sustaining learning outcomes.

### 18.1 Core Fluidity Pillars
1. Input Latency Budget: ≤ 80ms (already AC-FR-12) end-to-end (key/tap to projectile spawn).
2. Frame Pacing: No more than 2 consecutive frames > 33ms during standard waves (target 16–18ms average).
3. Telegraph Clarity: Heavy enemy attacks must display a distinct pre-attack cue (flash / outline / sound) lasting 300–500ms; no unavoidable / instant hits.
4. Difficulty Gradient Smoothness: Adjust at most two difficulty parameters per wave, with per-wave total composite difficulty delta ≤ +15% (speed + spawn density + projectile speed combined weighting model TBD).
5. Between-Wave Downtime: Summary screen auto-continue at 4s; skippable immediately via input.
6. Time to First Interaction: < 3s from initial load (after assets cached).

### 18.2 Retention & Motivation Layer
- Micro Combos: Consecutive correct hits without a miss increment combo multiplier (x1 → x2 → x3 → x4 cap) resetting on miss or 3s inactivity.
- Per-Letter Streak Badge: After 3 flawless recent hits on the same letter, a mini badge animates onto the HUD; losing after 2 consecutive misses on that letter.
- Dynamic Music Layering: Base track + percussion layer (combo ≥ x2), synth arpeggio (combo ≥ x3), triumph sting on boss defeat; layers fade in/out with 400ms crossfade.
- Surprise Events (low frequency): 5–8% chance every 4th + wave to trigger one event (e.g., Meteor Letter Rain: rapid low-value letters; Bonus Comet: moving target that grants letter XP).
- Session Micro Goals (3 per session): Auto-picked SMART style (e.g., "Raise B accuracy to 85%", "Achieve a 5x combo", "Master letter G"). Display progress bar in a slim top strip.
- Soft Fail Cushion: On detection of overwhelm (≥ 5 misses in last 20s & accuracy < 60%) spawn a Slow-Time Pickup (25% global slow for 5s) – max 1 per 3 minutes.

### 18.3 Combo System (Detail)
State: currentComboCount, currentMultiplier, lastHitTimestamp.
Rules:
- Increment combo if correct hit within 2s of previous correct hit.
- Decay: If 2s pass without a correct hit, reduce combo tier by 1 every additional second until baseline.
- Multipliers: 0–4 hits (x1), 5–9 (x2), 10–19 (x3), 20+ (x4). Visual aura color changes each tier.
- Educational Tie-In: While ≥ x3, spawn weighting slightly biases weaker letters (reinforcement while engaged) without exceeding base algorithm fairness (cap +10% weight shift).

### 18.4 Dynamic Music Layering (Audio Logic)
- Track stems: base.ogg, perc.ogg, arp.ogg, victory_sting.ogg.
- Activation: perc when multiplier ≥ x2; arp when ≥ x3; both mute if combo resets to x1 for > 3s.
- Ducking: Phoneme playback reduces all music stems -6 dB then restores with 250ms ramp.

### 18.5 Surprise Events (Catalog v1)
1. Meteor Letter Rain: 8–12 low-HP letters (only already-mastered) fall quickly; each correct hit grants +small XP to a weak letter (reallocated).
2. Bonus Comet: Fast-moving object; hitting it grants +1 session micro goal progress (random eligible goal) + small score bundle.
3. Time Bubble: Spawns a sphere that slows enemy projectiles crossing its interior.
Constraints: Only one active event at a time; minimum 2 waves between events.

### 18.6 Soft Fail Recovery
Trigger Condition: (rolling 20s window) misses ≥ 5 AND accuracy < 60% AND no recovery event active.
Effect: Slow-Time Pickup entity appears mid-screen edge; if collected → globalTimescale = 0.75 for 5s + highlight next target letter with gentle pulse.
Cooldown: 180s real-time.

### 18.7 Session Micro Goal Engine
Goal Types:
- AccuracyRaise(letter, target%)
- AchieveCombo(threshold)
- MasterLetter(letter)
- ReactionTimeImprove(letter, deltaMs)
Selection: At session start choose 3 distinct types prioritizing letters with accuracy 60–80% (growth zone). Persist partly completed goals across session pause/resume only.

### 18.8 Polish Checklist
1. Collision forgiveness window ±6 pixels around projectile center for fast letters.
2. Impact VFX lifespan ≤ 650ms (avoid clutter).
3. Limit simultaneous continuous beams to 1 (L or bonus) + 1 boss.
4. Cap concurrent ink/slow zones at 2.
5. Audio Channel Cap: 6 SFX channels + 1 voice + 3 music stems.
6. RNG Pattern Diversity: No wave may contain > 40% of same archetype unless that archetype's letter is targeted for mastery coaching and labeled.
7. Flash Intensity: Avoid > 70% luminance jump to reduce sensory overload.
8. Color Blind Safety: Distinguishing hues validated (simulate deuteranopia / protanopia / tritanopia).

### 18.9 Additional Acceptance Criteria (Game Feel)
AC-GF-1 (Combo Timing): GIVEN a player hits 5 letters within intervals < 2s each WHEN the 5th hit registers THEN multiplier SHALL display x2 within 100ms.
AC-GF-2 (Combo Decay): GIVEN multiplier x3 active AND 2s elapse without a hit THEN multiplier SHALL degrade to x2 and visual aura update accordingly.
AC-GF-3 (Music Layering): GIVEN multiplier rises from x1 to x2 WHEN state updates THEN percussion layer SHALL fade in within 400ms.
AC-GF-4 (Telegraph Minimum): GIVEN a heavy attack (beam, flame cone, chain lightning) WHEN it is about to fire THEN a telegraph visual SHALL persist ≥ 300ms before damage frames.
AC-GF-5 (Soft Fail Trigger): GIVEN miss conditions met (≥5 misses/20s & accuracy <60%) WHEN system evaluates triggers THEN a recovery pickup SHALL spawn exactly once per cooldown window.
AC-GF-6 (Surprise Event Spacing): GIVEN an event just concluded WHEN fewer than 2 waves have passed THEN no new event SHALL trigger.
AC-GF-7 (Micro Goal Progress): GIVEN goal AchieveCombo(10) active WHEN player reaches combo count 10 THEN goal progress SHALL mark complete immediately.
AC-GF-8 (Downtime Skip): GIVEN wave summary screen visible WHEN player presses any input after 0.5s THEN next wave SHALL start within 300ms.
AC-GF-9 (Frame Pacing): GIVEN a standard wave (≤ 12 enemies) WHEN measuring 60s sample THEN ≤ 0.5% of frames SHALL exceed 33ms.
AC-GF-10 (Event Exclusivity): GIVEN a Surprise Event active WHEN another event trigger roll passes success criteria THEN it SHALL be deferred (discarded) preserving exclusivity.

### 18.10 Future Engagement Ideas (Backlog)
- Letter Fusion Mini-Puzzle (combine shapes to form target letter)
- Seasonal Event Skins (non-intrusive to letter silhouettes)
- Parent Dashboard Tips (auto-generated improvement suggestions)

Rationale: These systems layer motivation (competence, autonomy, surprise) without overshadowing the educational core, and all have testable criteria ensuring measurable quality.