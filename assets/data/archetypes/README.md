# Archetypes Data (A–Z)

This folder defines the data-driven enemy archetypes for each alphabet letter. The game loads `letters.json` and validates it against `letters.schema.json` (draft‑07).

- letters.json — the list of 26 letter archetypes
- letters.schema.json — JSON Schema for validation

See specs/requirements.md §4 and specs/design.md §10 for behavior/mapping details.

## Fields (per archetype)
Required
- letter: Uppercase A–Z
- name: Display name (e.g., "Alien")
- tier: 1..5 difficulty (1 intro, 5 boss)
- baseHP: integer ≥ 1
- basePoints: integer ≥ 0
- movementId: string key for movement strategy (e.g., "scuttle_side")
- attackId: string key for attack strategy (e.g., "beam_continuous")
- audioPhoneme: relative path or asset key (e.g., "phonemes/en/A.ogg")
- spriteSet: array of sprite frame keys (from atlas)
- colorTheme: token name (UI theme/color system)

Optional
- behaviors: string[] tags (e.g., "boss", "beam", "erratic")

## Naming Conventions
- Sprite frames: <Letter>_<state>_<index> (e.g., `C_attack_1`)
- Phoneme audio: phonemes/<locale>/<Letter>.ogg (e.g., `phonemes/en/B.ogg`)
- Movement/Attack IDs: match code registries (see systems/movement.ts, systems/attacks.ts)

## Add or Edit a Letter
1) Duplicate an existing entry in letters.json
2) Update fields (ensure unique letter)
3) Choose movementId and attackId from existing registries
   - If you need a new strategy, add it in code and document the new ID
4) Point audioPhoneme to the correct file
5) Provide at least one sprite frame key in spriteSet
6) Keep tier consistent with difficulty (bosses are 5; mini-bosses ~3–4)
7) (Optional) behaviors tags to hint special logic (e.g., "beam", "ink", "phase")

## Validation
The schema uses JSON Schema draft‑07.
- Ensure each entry includes all required properties
- Letters must be unique and in A–Z set
- Tiers 1..5; baseHP ≥ 1

## Example
```json
{
  "letter": "E",
  "name": "Eagle",
  "tier": 2,
  "baseHP": 2,
  "basePoints": 18,
  "movementId": "high_dive",
  "attackId": "dive_strike",
  "audioPhoneme": "phonemes/en/E.ogg",
  "spriteSet": ["E_idle_1", "E_dive_1", "E_attack_1"],
  "colorTheme": "sapphire",
  "behaviors": ["diver"]
}
```

## Localization
- To support another locale, duplicate phoneme files under phonemes/<locale>/ and point audioPhoneme accordingly.
- Letter shapes remain the same; only audio changes.

## Tips
- Keep silhouettes recognizable for quick letter association
- Telegraph heavy attacks (beam/flame/chain) with 300–500ms visual cues
- For performance, reuse sprite frames and keep spriteSet minimal at first
