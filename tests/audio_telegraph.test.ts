import { describe, it, expect, vi } from 'vitest';
import { AudioSystem } from '../src/systems/audio';

describe('Telegraph SFX', () => {
  it('plays light and heavy telegraph sounds', () => {
    const audio = new AudioSystem({});
    const playSfxSpy = vi.spyOn(audio, 'playSfx');

    audio.playTelegraphSfx('light');
    expect(playSfxSpy).toHaveBeenCalledWith('sfx/telegraph_light', { volume: 0.6 });

    audio.playTelegraphSfx('heavy');
    expect(playSfxSpy).toHaveBeenCalledWith('sfx/telegraph_heavy', { volume: 0.8 });

    // Default is light
    audio.playTelegraphSfx();
    expect(playSfxSpy).toHaveBeenCalledWith('sfx/telegraph_light', { volume: 0.6 });
  });
});
