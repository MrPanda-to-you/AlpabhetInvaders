// Telegraph visual effects for advanced attacks
// T2.2: Visual warning system for beam, chain, area, and cone attacks

export interface TelegraphState {
  x: number;
  y: number;
  type: 'beam' | 'cone' | 'area' | 'chain';
  duration: number; // total duration
  elapsed: number; // time elapsed
  color: string;
  intensity: number; // 0-1, increases as telegraph progresses
}

export class TelegraphSystem {
  private activeTelegraphs: TelegraphState[] = [];
  
  addTelegraph(telegraph: Omit<TelegraphState, 'elapsed' | 'intensity'>): void {
    this.activeTelegraphs.push({
      ...telegraph,
      elapsed: 0,
      intensity: 0
    });
  }
  
  update(dtMs: number): void {
    this.activeTelegraphs = this.activeTelegraphs.filter(telegraph => {
      telegraph.elapsed += dtMs;
      telegraph.intensity = Math.min(1, telegraph.elapsed / telegraph.duration);
      
      return telegraph.elapsed < telegraph.duration;
    });
  }
  
  render(ctx: CanvasRenderingContext2D): void {
    for (const telegraph of this.activeTelegraphs) {
      this.renderTelegraph(ctx, telegraph);
    }
  }
  
  private renderTelegraph(ctx: CanvasRenderingContext2D, telegraph: TelegraphState): void {
    ctx.save();
    
    const alpha = 0.3 + (telegraph.intensity * 0.5);
    const pulseScale = 1 + Math.sin(telegraph.elapsed * 0.01) * 0.1;
    
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = telegraph.color;
    ctx.lineWidth = 2 + telegraph.intensity * 3;
    
    switch (telegraph.type) {
      case 'beam':
        this.renderBeamTelegraph(ctx, telegraph, pulseScale);
        break;
      case 'cone':
        this.renderConeTelegraph(ctx, telegraph, pulseScale);
        break;
      case 'area':
        this.renderAreaTelegraph(ctx, telegraph, pulseScale);
        break;
      case 'chain':
        this.renderChainTelegraph(ctx, telegraph, pulseScale);
        break;
    }
    
    ctx.restore();
  }
  
  private renderBeamTelegraph(ctx: CanvasRenderingContext2D, telegraph: TelegraphState, scale: number): void {
    const width = 8 * scale;
    const height = 600;
    
    ctx.strokeRect(
      telegraph.x - width / 2,
      telegraph.y,
      width,
      height
    );
    
    // Charging effect
    if (telegraph.intensity < 1) {
      ctx.fillStyle = telegraph.color;
      ctx.globalAlpha = 0.2 * telegraph.intensity;
      ctx.fillRect(
        telegraph.x - width / 2,
        telegraph.y,
        width,
        height * telegraph.intensity
      );
    }
  }
  
  private renderConeTelegraph(ctx: CanvasRenderingContext2D, telegraph: TelegraphState, scale: number): void {
    const coneLength = 120 * scale;
    const coneWidth = 60 * scale;
    
    ctx.beginPath();
    ctx.moveTo(telegraph.x, telegraph.y);
    ctx.lineTo(telegraph.x - coneWidth / 2, telegraph.y + coneLength);
    ctx.lineTo(telegraph.x + coneWidth / 2, telegraph.y + coneLength);
    ctx.closePath();
    ctx.stroke();
    
    // Fill with intensity
    if (telegraph.intensity > 0.3) {
      ctx.fillStyle = telegraph.color;
      ctx.globalAlpha = 0.3 * (telegraph.intensity - 0.3);
      ctx.fill();
    }
  }
  
  private renderAreaTelegraph(ctx: CanvasRenderingContext2D, telegraph: TelegraphState, scale: number): void {
    const radius = 80 * scale;
    
    ctx.beginPath();
    ctx.arc(telegraph.x, telegraph.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Pulsing inner circle
    if (telegraph.intensity > 0.2) {
      ctx.beginPath();
      ctx.arc(telegraph.x, telegraph.y, radius * (0.5 + telegraph.intensity * 0.5), 0, Math.PI * 2);
      ctx.fillStyle = telegraph.color;
      ctx.globalAlpha = 0.2 * telegraph.intensity;
      ctx.fill();
    }
  }
  
  private renderChainTelegraph(ctx: CanvasRenderingContext2D, telegraph: TelegraphState, scale: number): void {
    const radius = 15 * scale;
    
    // Main target indicator
    ctx.beginPath();
    ctx.arc(telegraph.x, telegraph.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Electric effect lines
    if (telegraph.intensity > 0.4) {
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2 + telegraph.elapsed * 0.01;
        const length = 30 + Math.sin(telegraph.elapsed * 0.008 + i) * 10;
        
        ctx.beginPath();
        ctx.moveTo(telegraph.x, telegraph.y);
        ctx.lineTo(
          telegraph.x + Math.cos(angle) * length,
          telegraph.y + Math.sin(angle) * length
        );
        ctx.stroke();
      }
    }
  }
  
  getActiveTelegraphs(): readonly TelegraphState[] {
    return this.activeTelegraphs;
  }
  
  clear(): void {
    this.activeTelegraphs = [];
  }
}

// Global telegraph system instance
export const telegraphSystem = new TelegraphSystem();
