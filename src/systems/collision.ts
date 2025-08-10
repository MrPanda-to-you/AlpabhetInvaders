export interface AABB { x: number; y: number; w: number; h: number }
export interface Circle { x: number; y: number; r: number }

export function aabbIntersect(a: AABB, b: AABB, forgiveness = 0): boolean {
  return (
    a.x + a.w > b.x - forgiveness &&
    a.x < b.x + b.w + forgiveness &&
    a.y + a.h > b.y - forgiveness &&
    a.y < b.y + b.h + forgiveness
  );
}

export function circleVsAABB(c: Circle, a: AABB, forgiveness = 0): boolean {
  // clamp circle center to rect
  const cx = Math.max(a.x, Math.min(c.x, a.x + a.w));
  const cy = Math.max(a.y, Math.min(c.y, a.y + a.h));
  const dx = c.x - cx;
  const dy = c.y - cy;
  const dist2 = dx * dx + dy * dy;
  const r = Math.max(0, c.r + forgiveness);
  return dist2 <= r * r;
}

// Spatial hash grid for broadphase
export interface SpatialItem {
  id: number;
  aabb: AABB;
}

export class SpatialHash {
  private cell: number;
  private map = new Map<string, number[]>();
  constructor(cellSize = 64) {
    this.cell = cellSize;
  }
  clear() { this.map.clear(); }
  private key(ix: number, iy: number) { return `${ix},${iy}`; }
  insert(item: SpatialItem) {
    const { x, y, w, h } = item.aabb;
    const c = this.cell;
    const x0 = Math.floor(x / c), y0 = Math.floor(y / c);
    const x1 = Math.floor((x + w) / c), y1 = Math.floor((y + h) / c);
    for (let iy = y0; iy <= y1; iy++) {
      for (let ix = x0; ix <= x1; ix++) {
        const k = this.key(ix, iy);
        let arr = this.map.get(k);
        if (!arr) { arr = []; this.map.set(k, arr); }
        arr.push(item.id);
      }
    }
  }
  query(aabb: AABB): number[] {
    const { x, y, w, h } = aabb;
    const c = this.cell;
    const x0 = Math.floor(x / c), y0 = Math.floor(y / c);
    const x1 = Math.floor((x + w) / c), y1 = Math.floor((y + h) / c);
    const out: number[] = [];
    const seen = new Set<number>();
    for (let iy = y0; iy <= y1; iy++) {
      for (let ix = x0; ix <= x1; ix++) {
        const k = this.key(ix, iy);
        const arr = this.map.get(k);
        if (!arr) continue;
        for (const id of arr) {
          if (!seen.has(id)) { seen.add(id); out.push(id); }
        }
      }
    }
    return out;
  }
}
