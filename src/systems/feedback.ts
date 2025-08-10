export type EffectKind = 'hit' | 'miss';

export interface Particle {
  id: number;
  kind: EffectKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ageMs: number;
  lifeMs: number;
}

export interface FeedbackSfxHooks {
  onHit?(x: number, y: number): void;
  onMiss?(x: number, y: number): void;
  onOutline?(letter: string, x: number, y: number): void;
}

export interface FeedbackOptions {
  particleCount?: number; // per burst
  lifeMs?: number; // particle lifetime
  outlineLifeMs?: number; // letter-outline lifetime
  sfx?: FeedbackSfxHooks; // SFX hook points
}

export type RNG = () => number;

let nextParticleId = 1;
let nextOutlineId = 1;

export interface OutlineEffect {
  id: number;
  letter: string; // placeholder; can map to LetterId later
  x: number;
  y: number;
  ageMs: number;
  lifeMs: number;
}

export class FeedbackSystem {
  private particles: Particle[] = [];
  private outlines: OutlineEffect[] = [];
  private opts: { particleCount: number; lifeMs: number; outlineLifeMs: number };
  private sfx?: FeedbackSfxHooks;
  constructor(opts: FeedbackOptions = {}) {
    this.opts = {
      particleCount: opts.particleCount ?? 6,
      lifeMs: opts.lifeMs ?? 900,
      outlineLifeMs: opts.outlineLifeMs ?? 600,
    };
    this.sfx = opts.sfx;
  }

  getParticles() { return this.particles as readonly Particle[]; }
  getOutlines() { return this.outlines as readonly OutlineEffect[]; }

  hit(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('hit', x, y, rng);
  this.sfx?.onHit?.(x, y);
  }

  miss(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('miss', x, y, rng);
  this.sfx?.onMiss?.(x, y);
  }

  outline(letter: string, x: number, y: number) {
    this.outlines.push({ id: nextOutlineId++, letter, x, y, ageMs: 0, lifeMs: this.opts.outlineLifeMs });
    this.sfx?.onOutline?.(letter, x, y);
  }

  private spawnBurst(kind: EffectKind, x: number, y: number, rng: RNG) {
    const n = this.opts.particleCount;
    for (let i = 0; i < n; i++) {
      const angle = (rng() * Math.PI * 2);
      const speed = 40 + rng() * 60; // 40..100 px/s
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      this.particles.push({
        id: nextParticleId++, kind, x, y, vx, vy, ageMs: 0, lifeMs: this.opts.lifeMs,
      });
    }
  }

  update(dtMs: number) {
    for (const p of this.particles) {
      p.ageMs += dtMs;
      if (p.ageMs > p.lifeMs) continue;
      p.x += (p.vx * dtMs) / 1000;
      p.y += (p.vy * dtMs) / 1000;
      // simple damping
      p.vx *= 0.98;
      p.vy *= 0.98;
    }
    for (const o of this.outlines) {
      o.ageMs += dtMs;
    }
  }

  purgeDead() {
    let i = 0;
    while (i < this.particles.length) {
      if (this.particles[i].ageMs >= this.particles[i].lifeMs) this.particles.splice(i, 1);
      else i++;
    }
    i = 0;
    while (i < this.outlines.length) {
      if (this.outlines[i].ageMs >= this.outlines[i].lifeMs) this.outlines.splice(i, 1);
      else i++;
    }
  }
}
