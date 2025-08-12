import { describe, it, expect } from 'vitest';
import data from '../assets/data/archetypes/letters.json';
import { MovementRegistry } from '../src/systems/movement';
import { AttackRegistry } from '../src/systems/attacks';

type Entry = { movementId: string; attackId: string; letter: string };

describe('T1.13: Movement/Attack strategy coverage for all archetypes', () => {
  it('all movementId and attackId map to implemented strategies', () => {
    const missing: string[] = [];
    (data as Entry[]).forEach((e) => {
      if (!MovementRegistry[e.movementId]) missing.push(`move:${e.letter}:${e.movementId}`);
      if (!AttackRegistry[e.attackId]) missing.push(`attack:${e.letter}:${e.attackId}`);
    });
    expect(missing, `Missing strategies: ${missing.join(', ')}`).toHaveLength(0);
  });
});
