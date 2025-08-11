import { describe, it, expect } from 'vitest';
import { UIStateManager } from '../src/ui/uiStates';

describe('UIStateManager', () => {
  it('tracks and notifies state changes', () => {
    const mgr = new UIStateManager();
    let last: string = '';
    mgr.onChange(s => { last = s; });
    expect(mgr.getState()).toBe('title');
    mgr.setState('play');
    expect(mgr.getState()).toBe('play');
    expect(last).toBe('play');
    mgr.setState('summary');
    expect(mgr.getState()).toBe('summary');
    expect(last).toBe('summary');
  });
});
