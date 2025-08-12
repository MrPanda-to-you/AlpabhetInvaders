import { describe, it, expect } from 'vitest';
import { generateGridSlots } from '../src/systems/spawner';

describe('Slot generator', () => {
  it('generates positions in a grid row-major order', () => {
    const slots = generateGridSlots(5, { originX: 10, originY: 20, cols: 2, dx: 15, dy: 8 });
    expect(slots).toEqual([
      { x: 10, y: 20 },
      { x: 25, y: 20 },
      { x: 10, y: 28 },
      { x: 25, y: 28 },
      { x: 10, y: 36 },
    ]);
  });
});
