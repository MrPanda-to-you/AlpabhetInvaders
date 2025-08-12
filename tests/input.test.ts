import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Action, InputService } from '../src/core/input';

function dispatchKey(code: string, type: 'keydown' | 'keyup') {
  const evt = new KeyboardEvent(type, { code, bubbles: true });
  window.dispatchEvent(evt);
}

describe('InputService (T1.2)', () => {
  let svc: InputService;
  beforeEach(() => {
    svc = new InputService();
    svc.attach();
  });
  afterEach(() => {
    svc.detach();
  });

  it('maps keyboard to actions and tracks pressed state', () => {
    let firedDown = false;
    let firedUp = false;
    svc.on(Action.Fire, (e) => {
      if (e.down) firedDown = true;
      else firedUp = true;
    });
    dispatchKey('Space', 'keydown');
    expect(svc.isDown(Action.Fire)).toBe(true);
    dispatchKey('Space', 'keyup');
    expect(svc.isDown(Action.Fire)).toBe(false);
    expect(firedDown).toBe(true);
    expect(firedUp).toBe(true);
  });

  it('supports left/right movement keys', () => {
    dispatchKey('ArrowLeft', 'keydown');
    expect(svc.isDown(Action.MoveLeft)).toBe(true);
    dispatchKey('ArrowLeft', 'keyup');
    expect(svc.isDown(Action.MoveLeft)).toBe(false);

    dispatchKey('KeyD', 'keydown');
    expect(svc.isDown(Action.MoveRight)).toBe(true);
    dispatchKey('KeyD', 'keyup');
    expect(svc.isDown(Action.MoveRight)).toBe(false);
  });
});
