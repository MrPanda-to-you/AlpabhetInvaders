import { describe, it, expect } from 'vitest';
import { 
  capPressureArchetypes, 
  applyWaveToWaveSmoothing, 
  computeCompositeDifficulty,
  DEFAULT_DIFFICULTY_CONFIG,
  type DifficultyConfig
} from '../src/systems/adaptive';

describe('T2.5 Difficulty Scaling Refinements', () => {
  describe('capPressureArchetypes', () => {
    it('limits pressure archetypes to 30% by default', () => {
      const letters = ['X', 'X', 'X', 'X', 'A', 'B', 'C', 'D', 'E', 'F']; // 40% pressure
      const result = capPressureArchetypes(letters);
      
      const pressureCount = result.filter(l => DEFAULT_DIFFICULTY_CONFIG.pressureLetters.has(l)).length;
      const maxAllowed = Math.floor(letters.length * DEFAULT_DIFFICULTY_CONFIG.maxPressureArchetypeRatio);
      
      expect(pressureCount).toBeLessThanOrEqual(maxAllowed);
      expect(result.length).toBe(letters.length);
    });

    it('preserves non-pressure letters', () => {
      const letters = ['A', 'B', 'C', 'Y', 'Z']; // Y is not in pressure letters, Z is pressure
      const result = capPressureArchetypes(letters);
      
      // Count how many of A, B, C, Y should remain (Y is not pressure)
      const nonPressureCount = result.filter(l => ['A', 'B', 'C', 'Y'].includes(l)).length;
      expect(nonPressureCount).toBeGreaterThanOrEqual(4); // All 4 non-pressure should be preserved
    });

    it('handles custom difficulty config', () => {
      const config: DifficultyConfig = {
        maxPressureArchetypeRatio: 0.1, // Only 10%
        maxWaveToWaveIncrease: 0.15,
        pressureLetters: new Set(['X', 'Z']),
      };
      
      const letters = ['X', 'X', 'X', 'A', 'B', 'C', 'D', 'E', 'F', 'G']; // 30% pressure
      const result = capPressureArchetypes(letters, config);
      
      const pressureCount = result.filter(l => config.pressureLetters.has(l)).length;
      const maxAllowed = Math.floor(letters.length * config.maxPressureArchetypeRatio);
      
      expect(pressureCount).toBeLessThanOrEqual(maxAllowed);
    });

    it('handles edge case with no pressure letters', () => {
      const letters = ['A', 'B', 'C', 'D'];
      const result = capPressureArchetypes(letters);
      
      expect(result).toEqual(letters);
    });

    it('handles empty input', () => {
      const result = capPressureArchetypes([]);
      expect(result).toEqual([]);
    });
  });

  describe('applyWaveToWaveSmoothing', () => {
    it('reduces difficulty when increase exceeds 15% limit', () => {
      const letters = ['X', 'Z', 'Q', 'J', 'K']; // High difficulty letters
      const previousDifficulty = 1.0;
      
      const result = applyWaveToWaveSmoothing(letters, previousDifficulty);
      const newDifficulty = computeCompositeDifficulty(result);
      
      const difficultyIncrease = (newDifficulty - previousDifficulty) / previousDifficulty;
      expect(difficultyIncrease).toBeLessThanOrEqual(DEFAULT_DIFFICULTY_CONFIG.maxWaveToWaveIncrease + 0.01); // Small tolerance
    });

    it('preserves difficulty when within 15% limit', () => {
      const letters = ['A', 'B', 'C']; // Low difficulty letters
      const previousDifficulty = 2.0;
      
      const result = applyWaveToWaveSmoothing(letters, previousDifficulty);
      expect(result).toEqual(letters); // Should be unchanged
    });

    it('handles custom max increase threshold', () => {
      const config: DifficultyConfig = {
        maxPressureArchetypeRatio: 0.3,
        maxWaveToWaveIncrease: 0.05, // Only 5% increase allowed
        pressureLetters: new Set(['X', 'Z']),
      };
      
      const letters = ['X', 'A', 'B'];
      const previousDifficulty = 1.0;
      
      const result = applyWaveToWaveSmoothing(letters, previousDifficulty, config);
      const newDifficulty = computeCompositeDifficulty(result);
      
      const difficultyIncrease = (newDifficulty - previousDifficulty) / previousDifficulty;
      expect(difficultyIncrease).toBeLessThanOrEqual(config.maxWaveToWaveIncrease + 0.01);
    });

    it('handles zero previous difficulty', () => {
      const letters = ['X', 'Z'];
      const result = applyWaveToWaveSmoothing(letters, 0);
      
      expect(result).toEqual(letters); // Should be unchanged when no baseline
    });
  });

  describe('computeCompositeDifficulty', () => {
    it('assigns higher scores to pressure letters', () => {
      const pressureOnly = ['X', 'Z', 'Q'];
      const normalOnly = ['A', 'B', 'C'];
      
      const pressureDifficulty = computeCompositeDifficulty(pressureOnly);
      const normalDifficulty = computeCompositeDifficulty(normalOnly);
      
      expect(pressureDifficulty).toBeGreaterThan(normalDifficulty);
    });

    it('scales with wave size', () => {
      const smallWave = ['X']; // 1 pressure letter = 2.0 difficulty
      const largeWave = ['X', 'X', 'X']; // 3 pressure letters = 2.0 difficulty but more total
      
      const smallDifficulty = computeCompositeDifficulty(smallWave);
      const largeDifficulty = computeCompositeDifficulty(largeWave);
      
      // Since both have same letter types, they should have same average difficulty
      expect(smallDifficulty).toBe(largeDifficulty);
      
      // But test with mixed difficulties
      const mixedWave = ['X', 'A']; // pressure + common = (2.0 + 1.0) / 2 = 1.5
      const mixedDifficulty = computeCompositeDifficulty(mixedWave);
      expect(mixedDifficulty).toBeLessThan(smallDifficulty);
    });

    it('returns zero for empty wave', () => {
      expect(computeCompositeDifficulty([])).toBe(0);
    });

    it('provides consistent scoring', () => {
      const letters = ['X', 'A', 'Z', 'B'];
      const difficulty1 = computeCompositeDifficulty(letters);
      const difficulty2 = computeCompositeDifficulty(letters);
      
      expect(difficulty1).toBe(difficulty2);
    });
  });

  describe('Integration tests', () => {
    it('applies both pressure cap and wave smoothing', () => {
      const config: DifficultyConfig = {
        maxPressureArchetypeRatio: 0.2, // 20% pressure limit
        maxWaveToWaveIncrease: 0.1, // 10% difficulty increase limit
        pressureLetters: new Set(['X', 'Z', 'Q']),
      };
      
      // Start with high-pressure, high-difficulty wave
      let letters = ['X', 'X', 'Z', 'Z', 'Q', 'A', 'B', 'C', 'D', 'E']; // 50% pressure
      const previousDifficulty = 1.0;
      
      // Apply pressure cap first
      letters = capPressureArchetypes(letters, config);
      const pressureCount = letters.filter(l => config.pressureLetters.has(l)).length;
      expect(pressureCount).toBeLessThanOrEqual(Math.floor(letters.length * config.maxPressureArchetypeRatio));
      
      // Apply wave smoothing
      letters = applyWaveToWaveSmoothing(letters, previousDifficulty, config);
      const newDifficulty = computeCompositeDifficulty(letters);
      const difficultyIncrease = (newDifficulty - previousDifficulty) / previousDifficulty;
      
      expect(difficultyIncrease).toBeLessThanOrEqual(config.maxWaveToWaveIncrease + 0.01);
    });

    it('maintains wave composition under constraints', () => {
      const originalLetters = ['X', 'Y', 'Z', 'A', 'B', 'C'];
      const previousDifficulty = 2.0;
      
      // Apply constraints
      let constrainedLetters = capPressureArchetypes(originalLetters);
      constrainedLetters = applyWaveToWaveSmoothing(constrainedLetters, previousDifficulty);
      
      // Should maintain same length
      expect(constrainedLetters.length).toBe(originalLetters.length);
      
      // Should have valid letter composition
      expect(constrainedLetters.every(l => typeof l === 'string' && l.length === 1)).toBe(true);
    });
  });
});
