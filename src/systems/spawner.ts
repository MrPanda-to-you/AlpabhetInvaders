import type { LetterId, EnemyArchetype } from './archetypes';
import { pickWithReview, type AdaptiveState } from './adaptive';
import { preloadPhonemesForLetters } from '../core/boot';
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

export interface SlotGenOptions {
  originX?: number;
  originY?: number;
  cols?: number; // number of columns in the grid
  dx?: number; // horizontal spacing
  dy?: number; // vertical spacing
}

// Generate n slots in a simple grid, row-major order
export function generateGridSlots(n: number, opts: SlotGenOptions = {}): SpawnSlot[] {
  const { originX = 0, originY = 0, cols = Math.max(1, n), dx = 32, dy = 32 } = opts;
  const slots: SpawnSlot[] = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    slots.push({ x: originX + col * dx, y: originY + row * dy });
  }
  return slots;
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

export interface WaveFactoryOptions {
  reviewPercent?: number;
  masteredThreshold?: number;
  rng?: () => number;
  slots?: SpawnSlot[]; // if omitted, caller must supply slots
  preloadPhonemes?: boolean; // opportunistically preload phonemes for selected letters (default: true)
}

export function createWave(
  archetypes: Map<LetterId, EnemyArchetype>,
  stats: AdaptiveState,
  n: number,
  opts: WaveFactoryOptions = {},
): SpawnResult {
  const letters = generateWaveLetters(archetypes, stats, n, opts);
  // Opportunistically preload phonemes for the selected letters; fire-and-forget
  if (opts.preloadPhonemes !== false) {
    void preloadPhonemesForLetters(letters as unknown as string[]);
  }
  const recipe = buildRecipeFromArchetypes(archetypes, letters);
  const slots = opts.slots ?? generateGridSlots(n);
  return spawnWave(slots, recipe);
}

export function shouldTriggerBoss(waveIndex: number, cadence = 5): boolean {
  // waveIndex is 0-based; triggers on waves 4, 9, 14... (every 5 waves)
  return (waveIndex + 1) % cadence === 0;
}
