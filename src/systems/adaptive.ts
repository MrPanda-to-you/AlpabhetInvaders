import type { LetterId, EnemyArchetype } from './archetypes';

export interface LetterStat {
  mastery: number; // 0..1
}
export type AdaptiveState = Partial<Record<LetterId, LetterStat>>;

export interface WeightMap { [k: string]: number }

export interface ComputeWeightsOptions {
  nowMs?: number;
}

export interface PickOptions {
  n: number;
  reviewPercent?: number; // 0..1, portion guaranteed to be mastered letters
  masteredThreshold?: number; // accuracy threshold for "mastered"
  rng?: () => number; // injectable for testing
}

export type DifficultyConfig = {
  maxPressureArchetypeRatio: number; // Max % of slots that can be "pressure" archetypes
  maxWaveToWaveIncrease: number; // Max composite difficulty increase between waves
  pressureLetters: Set<string>; // Letters considered high-pressure
};

export const DEFAULT_DIFFICULTY_CONFIG: DifficultyConfig = {
  maxPressureArchetypeRatio: 0.30, // ≤30% pressure archetypes
  maxWaveToWaveIncrease: 0.15, // ≤15% composite increase
  pressureLetters: new Set(['X', 'Z', 'Q', 'J', 'K']), // High-pressure letters
};

// Simple weighting: prioritizes low-mastery; scales mildly by tier
export function computeWeights(
  archetypes: Map<LetterId, EnemyArchetype>,
  stats: AdaptiveState,
  _opts: ComputeWeightsOptions = {}
): WeightMap {
  const out: WeightMap = {};
  for (const [letter, a] of archetypes) {
    const mastery = Math.min(1, Math.max(0, stats[letter]?.mastery ?? 0));
    const tierBoost = 1 + (a.tier ?? 1) * 0.1;
    const w = Math.max(0.0001, (1 - mastery) * tierBoost);
    out[letter] = w;
  }
  return out;
}

export function capPressureArchetypes(
  letters: string[], 
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG
): string[] {
  const maxPressureCount = Math.floor(letters.length * config.maxPressureArchetypeRatio);
  const pressureIndices: number[] = [];
  
  // Find pressure letter positions
  letters.forEach((letter, i) => {
    if (config.pressureLetters.has(letter)) {
      pressureIndices.push(i);
    }
  });
  
  // If we exceed the cap, replace excess with non-pressure alternatives
  if (pressureIndices.length > maxPressureCount) {
    const alternatives = ['A', 'E', 'I', 'O', 'S', 'T']; // Common, easier letters
    const result = [...letters];
    
    // Replace excess pressure letters (keep first maxPressureCount)
    for (let i = maxPressureCount; i < pressureIndices.length; i++) {
      const idx = pressureIndices[i];
      const alt = alternatives[Math.floor(Math.random() * alternatives.length)];
      result[idx] = alt;
    }
    
    return result;
  }
  
  return letters;
}

export function computeCompositeDifficulty(letters: string[]): number {
  if (letters.length === 0) return 0;
  
  // Simple heuristic: pressure letters = 2.0, common = 1.0, others = 1.5
  const pressureLetters = DEFAULT_DIFFICULTY_CONFIG.pressureLetters;
  const commonLetters = new Set(['A', 'E', 'I', 'O', 'S', 'T', 'N', 'R']);
  
  let total = 0;
  for (const letter of letters) {
    if (pressureLetters.has(letter)) total += 2.0;
    else if (commonLetters.has(letter)) total += 1.0;
    else total += 1.5;
  }
  
  return total / letters.length; // Average difficulty
}

export function applyWaveToWaveSmoothing(
  currentLetters: string[],
  previousDifficulty: number,
  config: DifficultyConfig = DEFAULT_DIFFICULTY_CONFIG
): string[] {
  // Handle edge case: no baseline difficulty
  if (previousDifficulty <= 0) {
    return currentLetters;
  }
  
  const currentDifficulty = computeCompositeDifficulty(currentLetters);
  const maxAllowedDifficulty = previousDifficulty * (1 + config.maxWaveToWaveIncrease);
  
  if (currentDifficulty <= maxAllowedDifficulty) {
    return currentLetters; // No smoothing needed
  }
  
  // Replace pressure and difficult letters with easier ones to reduce difficulty
  const alternatives = ['A', 'E', 'I', 'O', 'S']; // Common, easy letters (difficulty = 1.0)
  let result = [...currentLetters];
  let iterations = 0;
  
  while (computeCompositeDifficulty(result) > maxAllowedDifficulty && iterations < 20) {
    // Find the most difficult letter to replace (prioritize pressure letters, then non-common)
    let targetIdx = -1;
    
    // First try pressure letters
    targetIdx = result.findIndex(letter => config.pressureLetters.has(letter));
    
    // If no pressure letters, try non-common letters (difficulty = 1.5)
    if (targetIdx < 0) {
      const commonLetters = new Set(['A', 'E', 'I', 'O', 'S', 'T', 'N', 'R']);
      targetIdx = result.findIndex(letter => !commonLetters.has(letter) && !config.pressureLetters.has(letter));
    }
    
    if (targetIdx >= 0) {
      const alt = alternatives[Math.floor(Math.random() * alternatives.length)];
      result[targetIdx] = alt;
    } else {
      break; // No more difficult letters to replace
    }
    
    iterations++;
  }
  
  return result;
}

export function weightedPickN(weights: WeightMap, { n, rng = Math.random }: PickOptions): LetterId[] {
  const entries = Object.entries(weights) as [LetterId, number][];
  const total = entries.reduce((s, [, w]) => s + (w > 0 ? w : 0), 0);
  if (total <= 0) return [];
  const result: LetterId[] = [];
  const pool = entries.slice();
  for (let i = 0; i < n && pool.length > 0; i++) {
    let r = rng() * pool.reduce((s, [, w]) => s + (w > 0 ? w : 0), 0);
    let idx = 0;
    for (; idx < pool.length; idx++) {
      const w = Math.max(0, pool[idx][1]);
      if (r <= w) break;
      r -= w;
    }
    const [picked] = pool.splice(Math.min(idx, pool.length - 1), 1)[0];
    result.push(picked);
  }
  return result;
}

export function pickWithReview(
  archetypes: Map<LetterId, EnemyArchetype>,
  stats: AdaptiveState,
  opts: PickOptions & { weights?: WeightMap }
): LetterId[] {
  const { n, reviewPercent = 0.1, masteredThreshold = 0.8, rng } = opts;
  const weights = opts.weights ?? computeWeights(archetypes, stats, {});
  const letters = Array.from(archetypes.keys());
  const mastered = letters.filter((L) => (stats[L]?.mastery ?? 0) >= masteredThreshold);

  const reviewTarget = Math.max(0, Math.floor(n * reviewPercent));
  const res: LetterId[] = [];

  // pick review letters uniformly if available
  const pool = mastered.slice();
  while (res.length < reviewTarget && pool.length > 0) {
    const i = Math.floor((rng ?? Math.random)() * pool.length);
    res.push(pool.splice(i, 1)[0]);
  }

  // remaining by weights (excluding already picked)
  const w2: WeightMap = {};
  for (const [k, v] of Object.entries(weights)) if (!res.includes(k as LetterId)) w2[k] = v;
  const need = Math.max(0, n - res.length);
  const rest = weightedPickN(w2, { n: need, rng });
  return res.concat(rest);
}
