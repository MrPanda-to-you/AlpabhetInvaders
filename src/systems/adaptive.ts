import type { LetterId, EnemyArchetype } from './archetypes';

export interface LetterStat {
  mastery: number; // 0..1
}
export type AdaptiveState = Partial<Record<LetterId, LetterStat>>;

export interface WeightMap { [k: string]: number }

export interface ComputeWeightsOptions {
  nowMs?: number;
}

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

export interface PickOptions {
  n: number;
  reviewPercent?: number; // 0.1 default
  masteredThreshold?: number; // 0.8 default
  rng?: () => number; // inject for tests
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
