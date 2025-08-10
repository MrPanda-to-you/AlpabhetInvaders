import { MovementRegistry, MovementStrategy, EnemyLike as MoveEnemy } from './movement';
import { AttackRegistry, AttackStrategy, EnemyLike as AttackEnemy } from './attacks';

export interface Enemy extends MoveEnemy, AttackEnemy {
  id: number;
  hp: number;
  movementId: string;
  attackId: string;
}

export interface WorldBounds { width: number; height: number }

export interface EnemyUpdateContext extends WorldBounds {
  emitProjectile: (p: { x: number; y: number; vx: number; vy: number; radius: number }) => void;
}

let nextId = 1;

export function makeEnemy(x: number, y: number, movementId: string, attackId: string, hp = 1): Enemy {
  return { id: nextId++, x, y, hp, movementId, attackId };
}

export function updateEnemy(e: Enemy, ctx: EnemyUpdateContext, dtMs: number) {
  const mv: MovementStrategy | undefined = MovementRegistry[e.movementId];
  if (mv) mv(e, dtMs, ctx);
  const atk: AttackStrategy | undefined = AttackRegistry[e.attackId];
  if (atk) atk(e, ctx, dtMs);
}

export function updateEnemies(list: Enemy[], ctx: EnemyUpdateContext, dtMs: number) {
  for (const e of list) updateEnemy(e, ctx, dtMs);
}
