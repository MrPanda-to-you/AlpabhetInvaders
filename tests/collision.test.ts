import { describe, it, expect } from 'vitest';
import { aabbIntersect, circleVsAABB, SpatialHash } from '../src/systems/collision';

describe('Collision basics', () => {
  it('AABB intersects with forgiveness', () => {
    const a = { x: 0, y: 0, w: 10, h: 10 };
    const b = { x: 10.1, y: 0, w: 10, h: 10 };
    expect(aabbIntersect(a, b)).toBe(false);
    expect(aabbIntersect(a, b, 1)).toBe(true);
  });

  it('Circle vs AABB', () => {
    const a = { x: 5, y: 5, w: 10, h: 10 };
    const c = { x: 0, y: 0, r: 4.9 };
    expect(circleVsAABB(c, a)).toBe(false);
    // sqrt( (5-0)^2 + (5-0)^2 ) ~= 7.07 -> r must exceed this to intersect
    expect(circleVsAABB({ ...c, r: 7.2 }, a)).toBe(true);
  });

  it('Spatial hash query de-duplicates ids', () => {
    const grid = new SpatialHash(8);
    grid.insert({ id: 1, aabb: { x: 0, y: 0, w: 16, h: 16 } });
    grid.insert({ id: 2, aabb: { x: 10, y: 10, w: 5, h: 5 } });
    const hits = grid.query({ x: 8, y: 8, w: 1, h: 1 });
    hits.sort();
    expect(hits).toEqual([1, 2]);
  });
});
