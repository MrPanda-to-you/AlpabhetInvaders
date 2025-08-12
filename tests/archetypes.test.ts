import { describe, it, expect } from 'vitest';
import { clearArchetypeCache, loadArchetypes, getArchetype } from '../src/systems/archetypes';

describe('Archetype Registry (T1.4)', () => {
  it('loads and validates 26 unique letter archetypes', () => {
    clearArchetypeCache();
    const map = loadArchetypes();
    expect(map.size).toBe(26);
    expect(getArchetype('A')).toBeDefined();
    expect(getArchetype('Z')).toBeDefined();
  });
});
