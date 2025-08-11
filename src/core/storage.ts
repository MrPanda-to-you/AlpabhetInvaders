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
