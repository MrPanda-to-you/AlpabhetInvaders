export interface Projectile {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alive: boolean;
}

let nextId = 1;

export function makeProjectile(p: Omit<Projectile, 'id' | 'alive'>): Projectile {
  return { id: nextId++, alive: true, ...p };
}

export interface WorldBounds { width: number; height: number }

export function updateProjectiles(list: Projectile[], dtMs: number, bounds: WorldBounds) {
  for (const p of list) {
    if (!p.alive) continue;
    p.x += (p.vx * dtMs) / 1000;
    p.y += (p.vy * dtMs) / 1000;
    // Cull when out of bounds with margin
    const m = p.radius + 4;
    if (p.x < -m || p.x > bounds.width + m || p.y < -m || p.y > bounds.height + m) {
      p.alive = false;
    }
  }
}

export function purgeDead(list: Projectile[]) {
  let i = 0;
  while (i < list.length) {
    if (!list[i].alive) list.splice(i, 1);
    else i++;
  }
}
