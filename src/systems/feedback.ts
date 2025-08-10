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

export interface FeedbackOptions {
  particleCount?: number; // per burst
  lifeMs?: number; // particle lifetime
}

export type RNG = () => number;

let nextParticleId = 1;

export class FeedbackSystem {
  private particles: Particle[] = [];
  private opts: Required<FeedbackOptions>;
  constructor(opts: FeedbackOptions = {}) {
    this.opts = {
      particleCount: opts.particleCount ?? 6,
      lifeMs: opts.lifeMs ?? 900,
    };
  }

  getParticles() { return this.particles as readonly Particle[]; }

  hit(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('hit', x, y, rng);
  }

  miss(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('miss', x, y, rng);
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
  }

  purgeDead() {
    let i = 0;
    while (i < this.particles.length) {
      if (this.particles[i].ageMs >= this.particles[i].lifeMs) this.particles.splice(i, 1);
      else i++;
    }
  }
}
