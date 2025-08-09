// Archetype Registry + Runtime Validation (T1.4)
// Loads letters.json, validates against letters.schema.json, and exposes a typed Map.

import Ajv, { ErrorObject } from 'ajv';
import lettersData from '../../assets/data/archetypes/letters.json';
import lettersSchema from '../../assets/data/archetypes/letters.schema.json';

export type LetterId =
  | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M'
  | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z';

export interface EnemyArchetype {
  letter: LetterId;
  name: string;
  tier: number; // 1..5
  baseHP: number; // >=1
  basePoints: number; // >=0
  movementId: string;
  attackId: string;
  audioPhoneme: string; // path or key
  spriteSet: string[]; // sprite frame keys
  colorTheme: string;
  behaviors?: string[];
}

let cache: Map<LetterId, EnemyArchetype> | null = null;

function formatAjvErrors(errors: ErrorObject[] | null | undefined): string {
  if (!errors || errors.length === 0) return '';
  return errors
    .map((e) => `${e.instancePath || '(root)'} ${e.message ?? ''}`.trim())
    .join('; ');
}

export function clearArchetypeCache() {
  cache = null;
}

export function loadArchetypes(): Map<LetterId, EnemyArchetype> {
  if (cache) return cache;

  const data = lettersData as unknown as EnemyArchetype[];

  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validateFn = ajv.compile(lettersSchema as unknown as object);
  const ok = validateFn(data);
  if (!ok) {
    const detail = formatAjvErrors(validateFn.errors);
    throw new Error(`Archetype schema validation failed: ${detail}`);
  }

  const map = new Map<LetterId, EnemyArchetype>();
  for (const entry of data) {
    if (map.has(entry.letter)) {
      throw new Error(`Duplicate archetype letter: ${entry.letter}`);
    }
    // Freeze shallow copy in dev to avoid accidental mutation
    const frozen = Object.freeze({ ...entry, spriteSet: entry.spriteSet.slice() });
    map.set(entry.letter, frozen);
  }

  cache = map;
  return map;
}

export function getArchetype(letter: LetterId): EnemyArchetype | undefined {
  return (cache ?? loadArchetypes()).get(letter);
}
