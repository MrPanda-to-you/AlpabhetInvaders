import { describe, it, expect } from 'vitest';
import { createEmptySession, loadSession, saveSession, updateLetterStat, computeMastery } from '../src/core/storage';

// Simulate localStorage for jsdom environment safety
const mem: Record<string,string> = {};
(globalThis as any).localStorage = {
  setItem: (k:string,v:string)=>{ mem[k]=v; },
  getItem: (k:string)=> mem[k] ?? null,
  removeItem: (k:string)=>{ delete mem[k]; }
};

describe('Session persistence (T1.11)', () => {
  it('creates empty session and saves/loads with checksum', () => {
    const s = createEmptySession();
    expect(s.letters.length).toBe(0);
    saveSession(s);
    const s2 = loadSession();
    expect(s2.version).toBe(1);
    expect(s2.checksum).toBeDefined();
  });

  it('updates letter stats and computes mastery', () => {
    const s = createEmptySession();
    updateLetterStat(s, 'a', ls => { ls.attempts += 10; ls.hits += 7; ls.mastery = computeMastery(ls); });
    expect(s.letters[0].letter).toBe('A');
    expect(s.letters[0].mastery).toBeGreaterThan(0);
    saveSession(s);
    const s2 = loadSession();
    expect(s2.letters[0].hits).toBe(7);
  });

  it('detects checksum mismatch and resets', () => {
    const s = createEmptySession();
    saveSession(s);
    const key = 'ai.session.v1';
    // Corrupt stored data
    mem[key] = mem[key].replace(/"totalScore":0/, '"totalScore":999');
    const loaded = loadSession();
    expect(loaded.totalScore).toBe(0); // reset happened
  });
});
