// Minimal local storage utilities for app settings and small state
// Not intended for large payloads; JSON-serializes values.

export function setJSON<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors (quota/permissions)
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function remove(key: string) {
  try { localStorage.removeItem(key); } catch {}
}

// --- Persistence for gameplay stats (T1.11) ---
export interface LetterStatRecord { letter: string; mastery: number; attempts: number; hits: number; lastTs?: number }
export interface SessionRecord {
  version: number;
  createdTs: number;
  updatedTs: number;
  letters: LetterStatRecord[];
  totalScore: number;
  wavesCleared: number;
  checksum?: string; // simple integrity check
}

const SESSION_KEY = 'ai.session.v1';

function simpleChecksum(payload: unknown): string {
  // Non-cryptographic: sum char codes of JSON string (mod 1e9) + length
  const json = JSON.stringify(payload);
  let sum = 0;
  for (let i = 0; i < json.length; i++) sum = (sum + json.charCodeAt(i)) % 1000000000;
  return `${json.length.toString(36)}-${sum.toString(36)}`;
}

export function createEmptySession(): SessionRecord {
  const now = Date.now();
  const base: SessionRecord = { version: 1, createdTs: now, updatedTs: now, letters: [], totalScore: 0, wavesCleared: 0 };
  base.checksum = simpleChecksum({ ...base, checksum: undefined });
  return base;
}

export function loadSession(): SessionRecord {
  const raw = getJSON<SessionRecord | undefined>(SESSION_KEY, undefined as any);
  if (!raw) return createEmptySession();
  const { checksum, ...rest } = raw as any;
  const expected = simpleChecksum(rest);
  if (checksum !== expected) {
    // Integrity failure -> start fresh but keep minimal fallback data
    return createEmptySession();
  }
  return raw;
}

export function saveSession(s: SessionRecord) {
  s.updatedTs = Date.now();
  s.checksum = simpleChecksum({ ...s, checksum: undefined });
  setJSON(SESSION_KEY, s);
}

export function updateLetterStat(session: SessionRecord, letter: string, mutate: (ls: LetterStatRecord) => void) {
  const L = (letter || '').toUpperCase();
  let rec = session.letters.find(r => r.letter === L);
  if (!rec) {
    rec = { letter: L, mastery: 0, attempts: 0, hits: 0 };
    session.letters.push(rec);
  }
  mutate(rec);
}

export function computeMastery(rec: LetterStatRecord): number {
  if (rec.attempts <= 0) return 0;
  // Simple mastery heuristic: hit ratio with diminishing returns
  const ratio = rec.hits / rec.attempts;
  return Math.min(1, Math.max(0, 0.2 + ratio * 0.8));
}
