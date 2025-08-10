import type { LetterId } from './archetypes';
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
