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
  color: string;
  intensity: number;
}

export interface FeedbackSfxHooks {
  onHit?(x: number, y: number): void;
  onMiss?(x: number, y: number): void;
  onOutline?(letter: string, x: number, y: number): void;
}

// Optional audio wiring for feedback events
export interface FeedbackAudio {
  playPhoneme(letter: string, durationSec: number): void;
  playSfx?(key: string, volume?: number): void;
}

export interface FeedbackOptions {
  particleCount?: number; // per burst
  lifeMs?: number; // particle lifetime
  outlineLifeMs?: number; // letter-outline lifetime
  sfx?: FeedbackSfxHooks; // SFX hook points
  hitColor?: string;
  missColor?: string;
  hitIntensity?: number;
  missIntensity?: number;
  pooling?: boolean;
  poolCap?: number; // max cached dead particles
  audio?: FeedbackAudio; // optional audio adapter
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
  private style: { hitColor: string; missColor: string; hitIntensity: number; missIntensity: number };
  private pooling = false;
  private poolCap = 128;
  private pool: Particle[] = [];
  private audio?: FeedbackAudio;
  constructor(opts: FeedbackOptions = {}) {
    this.opts = {
      particleCount: opts.particleCount ?? 6,
      lifeMs: opts.lifeMs ?? 900,
      outlineLifeMs: opts.outlineLifeMs ?? 600,
    };
    this.sfx = opts.sfx;
  this.audio = opts.audio;
    this.style = {
      hitColor: opts.hitColor ?? '#3ae374',
      missColor: opts.missColor ?? '#ff4757',
      hitIntensity: opts.hitIntensity ?? 1.0,
      missIntensity: opts.missIntensity ?? 0.7,
    };
  this.pooling = !!opts.pooling;
  this.poolCap = Math.max(0, opts.poolCap ?? 128);
  }

  getParticles() { return this.particles as readonly Particle[]; }
  getOutlines() { return this.outlines as readonly OutlineEffect[]; }

  hit(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('hit', x, y, rng);
  this.sfx?.onHit?.(x, y);
  // play a short positive click SFX via audio adapter if present
  this.audio?.playSfx?.('sfx/hit', 0.9);
  }

  miss(x: number, y: number, rng: RNG = Math.random) {
    this.spawnBurst('miss', x, y, rng);
  this.sfx?.onMiss?.(x, y);
  // play a subtle miss SFX if present
  this.audio?.playSfx?.('sfx/miss', 0.6);
  }

  outline(letter: string, x: number, y: number) {
    this.outlines.push({ id: nextOutlineId++, letter, x, y, ageMs: 0, lifeMs: this.opts.outlineLifeMs });
    this.sfx?.onOutline?.(letter, x, y);
  // pronounce the letter briefly via voice channel if adapter provided
  this.audio?.playPhoneme(letter, 0.5);
  }

  private spawnBurst(kind: EffectKind, x: number, y: number, rng: RNG) {
    const n = this.opts.particleCount;
  const styleColor = kind === 'hit' ? this.style.hitColor : this.style.missColor;
  const styleIntensity = kind === 'hit' ? this.style.hitIntensity : this.style.missIntensity;
    for (let i = 0; i < n; i++) {
      const angle = (rng() * Math.PI * 2);
      const speed = 40 + rng() * 60; // 40..100 px/s
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      let p: Particle | undefined;
      if (this.pooling && this.pool.length > 0) {
        p = this.pool.pop()!;
        // re-init
        p.id = nextParticleId++;
        p.kind = kind;
        p.x = x; p.y = y; p.vx = vx; p.vy = vy; p.ageMs = 0; p.lifeMs = this.opts.lifeMs; p.color = styleColor; p.intensity = styleIntensity;
      } else {
        p = { id: nextParticleId++, kind, x, y, vx, vy, ageMs: 0, lifeMs: this.opts.lifeMs, color: styleColor, intensity: styleIntensity };
      }
      this.particles.push(p);
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
      if (this.particles[i].ageMs >= this.particles[i].lifeMs) {
        const dead = this.particles.splice(i, 1)[0];
        if (this.pooling && this.pool.length < this.poolCap) this.pool.push(dead);
      }
      else i++;
    }
    i = 0;
    while (i < this.outlines.length) {
      if (this.outlines[i].ageMs >= this.outlines[i].lifeMs) this.outlines.splice(i, 1);
      else i++;
    }
  }
}
