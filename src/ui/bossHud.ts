export interface BossHUD {
  show(name: string, hp: number, maxHp: number): void;
  updateHp(hp: number, maxHp: number): void;
  setTelegraph(active: boolean): void;
  hide(): void;
}

export function createBossHUD(): BossHUD {
  let container: HTMLElement | null = null;
  let hpBar: HTMLElement | null = null;
  let telegraphIndicator: HTMLElement | null = null;
  let nameDisplay: HTMLElement | null = null;

  function ensureElements() {
    if (container) return;

    // Create boss HUD container
    container = document.createElement('div');
    container.id = 'boss-hud';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      border: 2px solid #ff6b35;
      border-radius: 8px;
      padding: 12px 20px;
      color: white;
      font-family: system-ui, sans-serif;
      z-index: 1000;
      min-width: 300px;
      display: none;
    `;

    // Boss name
    nameDisplay = document.createElement('div');
    nameDisplay.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 8px;
      text-align: center;
    `;
    container.appendChild(nameDisplay);

    // HP bar background
    const hpBg = document.createElement('div');
    hpBg.style.cssText = `
      background: #333;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 8px;
    `;

    // HP bar fill
    hpBar = document.createElement('div');
    hpBar.style.cssText = `
      background: linear-gradient(90deg, #ff3030, #ffaa00);
      height: 100%;
      width: 100%;
      transition: width 0.3s ease;
    `;
    hpBg.appendChild(hpBar);
    container.appendChild(hpBg);

    // Telegraph indicator
    telegraphIndicator = document.createElement('div');
    telegraphIndicator.style.cssText = `
      text-align: center;
      font-size: 14px;
      color: #ffff00;
      font-weight: bold;
      min-height: 20px;
    `;
    container.appendChild(telegraphIndicator);

    document.body.appendChild(container);
  }

  return {
    show(name: string, hp: number, maxHp: number) {
      ensureElements();
      if (nameDisplay) nameDisplay.textContent = name;
      this.updateHp(hp, maxHp);
      if (container) container.style.display = 'block';
    },
    updateHp(hp: number, maxHp: number) {
      ensureElements();
      const percentage = Math.max(0, Math.min(100, (hp / maxHp) * 100));
      if (hpBar) hpBar.style.width = `${percentage}%`;
    },
    setTelegraph(active: boolean) {
      ensureElements();
      if (telegraphIndicator) {
        telegraphIndicator.textContent = active ? '⚠️ TELEGRAPH WARNING ⚠️' : '';
      }
    },
    hide() {
      if (container) container.style.display = 'none';
    },
  };
}
