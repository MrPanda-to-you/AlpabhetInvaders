import type { LetterId, EnemyArchetype } from './archetypes';
import { pickWithReview, type AdaptiveState } from './adaptive';
import { makeEnemy, type Enemy } from './enemies';

export interface SpawnSlot { x: number; y: number }
export interface SpawnResult { enemies: Enemy[] }

export interface SpawnRecipe {
  letters: LetterId[];
  movementByLetter: Record<LetterId, string>;
  attackByLetter: Record<LetterId, string>;
  hpByLetter?: Partial<Record<LetterId, number>>;
}

export function spawnWave(slots: SpawnSlot[], recipe: SpawnRecipe): SpawnResult {
  const enemies: Enemy[] = [];
  const len = Math.min(slots.length, recipe.letters.length);
  for (let i = 0; i < len; i++) {
    const L = recipe.letters[i];
    const s = slots[i];
    enemies.push(
      makeEnemy(
        s.x,
        s.y,
        recipe.movementByLetter[L] ?? 'glide_horizontal',
        recipe.attackByLetter[L] ?? 'pellet_slow',
        recipe.hpByLetter?.[L] ?? 1,
      ),
    );
  }
  return { enemies };
}

// Helper: generate letters for a wave using adaptive engine with review guarantee
export function generateWaveLetters(
  archetypes: Map<LetterId, EnemyArchetype>,
  stats: AdaptiveState,
  n: number,
  opts: { reviewPercent?: number; masteredThreshold?: number; rng?: () => number } = {},
): LetterId[] {
  return pickWithReview(archetypes, stats, { n, reviewPercent: opts.reviewPercent, masteredThreshold: opts.masteredThreshold, rng: opts.rng });
}

// Helper: build a spawn recipe from archetype definitions for given letters
export function buildRecipeFromArchetypes(
  archetypes: Map<LetterId, EnemyArchetype>,
  letters: LetterId[],
): SpawnRecipe {
  const movementByLetter = {} as Record<LetterId, string>;
  const attackByLetter = {} as Record<LetterId, string>;
  const hpByLetter: Partial<Record<LetterId, number>> = {};
  for (const L of letters) {
    const a = archetypes.get(L);
    if (!a) continue;
    movementByLetter[L] = a.movementId;
    attackByLetter[L] = a.attackId;
    hpByLetter[L] = Math.max(1, Math.round(a.baseHP));
  }
  return { letters, movementByLetter, attackByLetter, hpByLetter } as SpawnRecipe;
}
