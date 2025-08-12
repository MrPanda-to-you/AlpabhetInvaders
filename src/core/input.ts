export enum Action {
  MoveLeft = 'MoveLeft',
  MoveRight = 'MoveRight',
  Fire = 'Fire',
  Pause = 'Pause'
}

type Handler = (evt: { action: Action; down: boolean; at: number; processingMs: number }) => void;

const defaultBindings: Record<Action, string[]> = {
  [Action.MoveLeft]: ['ArrowLeft', 'KeyA'],
  [Action.MoveRight]: ['ArrowRight', 'KeyD'],
  [Action.Fire]: ['Space', 'Enter', 'Mouse0', 'Touch'],
  [Action.Pause]: ['Escape']
};

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export class InputService {
  private bindings: Map<string, Action> = new Map();
  private listeners: Map<Action, Set<Handler>> = new Map();
  private pressed: Set<Action> = new Set();
  private attached = false;

  constructor(bindings: Partial<Record<Action, string[]>> = {}) {
    const merged: Record<Action, string[]> = { ...defaultBindings } as any;
    for (const k of Object.keys(bindings) as (keyof typeof bindings)[]) {
      const a = k as Action;
      const v = bindings[a];
      if (v && Array.isArray(v)) merged[a] = v;
    }
    // Flatten to reverse lookup
    Object.entries(merged).forEach(([action, keys]) => {
      for (const key of keys) this.bindings.set(key, action as Action);
    });
  }

  on(action: Action, handler: Handler): () => void {
    if (!this.listeners.has(action)) this.listeners.set(action, new Set());
    const set = this.listeners.get(action)!;
    set.add(handler);
    return () => set.delete(handler);
  }

  isDown(action: Action): boolean {
    return this.pressed.has(action);
  }

  attach() {
    if (this.attached) return;
    this.attached = true;
    window.addEventListener('keydown', this.onKeyDown, { passive: true });
    window.addEventListener('keyup', this.onKeyUp, { passive: true });
    window.addEventListener('mousedown', this.onMouseDown, { passive: true });
    window.addEventListener('mouseup', this.onMouseUp, { passive: true });
    window.addEventListener('touchstart', this.onTouchStart, { passive: true });
    window.addEventListener('touchend', this.onTouchEnd, { passive: true });
  }

  detach() {
    if (!this.attached) return;
    this.attached = false;
    window.removeEventListener('keydown', this.onKeyDown as any);
    window.removeEventListener('keyup', this.onKeyUp as any);
    window.removeEventListener('mousedown', this.onMouseDown as any);
    window.removeEventListener('mouseup', this.onMouseUp as any);
    window.removeEventListener('touchstart', this.onTouchStart as any);
    window.removeEventListener('touchend', this.onTouchEnd as any);
    this.pressed.clear();
  }

  // Private arrow fns to preserve this
  private onKeyDown = (e: KeyboardEvent) => {
    const key = e.code; // standardized
    this.dispatchKeyLike(key, true);
  };
  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.code;
    this.dispatchKeyLike(key, false);
  };
  private onMouseDown = (_e: MouseEvent) => {
    this.dispatchKeyLike('Mouse0', true);
  };
  private onMouseUp = (_e: MouseEvent) => {
    this.dispatchKeyLike('Mouse0', false);
  };
  private onTouchStart = (_e: TouchEvent) => {
    this.dispatchKeyLike('Touch', true);
  };
  private onTouchEnd = (_e: TouchEvent) => {
    this.dispatchKeyLike('Touch', false);
  };

  private dispatchKeyLike(code: string, down: boolean) {
    const action = this.bindings.get(code);
    if (!action) return;
    if (down) this.pressed.add(action);
    else this.pressed.delete(action);
    const at = now();
    const payload = { action, down, at, processingMs: 0 } as const;
    const listeners = this.listeners.get(action);
    if (!listeners || listeners.size === 0) return;
    const start = now();
    listeners.forEach((fn) => fn({ ...payload, processingMs: Math.max(0, now() - at) }));
    const _totalDispatchMs = now() - start;
  }
}

export function createInput(bindings?: Partial<Record<Action, string[]>>) {
  const svc = new InputService(bindings);
  svc.attach();
  return svc;
}
