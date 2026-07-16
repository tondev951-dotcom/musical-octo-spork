import Phaser from 'phaser';
import { GameSession } from '../../core/session';
import { createCryptoSeededRng, createSeededRng } from '../../core/rng';
import { DEFAULT_CONFIG } from '../../core/config/gameConfig';
import { VolatilityProfile } from '../../core/types';
import { SoundFactory } from '../audio/SoundFactory';

/**
 * Creates the authoritative GameSession (math core) and shared services,
 * parses dev/debug query flags, then hands over to preloading.
 *
 * Query flags:
 *   ?volatility=low|medium|high  pick the par-sheet profile
 *   ?seed=123                    seeded RNG (deterministic session)
 *   ?debug=1                     draw cell grid + log SpinResults
 *   ?forceBook=1                 next base spin fast-forwards to a feature trigger
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  create(): void {
    const params = new URLSearchParams(location.search);

    const volatility = (params.get('volatility') ?? DEFAULT_CONFIG.volatility) as VolatilityProfile;
    const seedParam = params.get('seed');
    const rng = seedParam ? createSeededRng(Number(seedParam)) : createCryptoSeededRng();

    const session = new GameSession(rng, { ...DEFAULT_CONFIG, volatility }, volatility);

    this.registry.set('session', session);
    this.registry.set('sounds', new SoundFactory());
    this.registry.set('volatility', volatility);
    this.registry.set('debug', params.get('debug') === '1');
    this.registry.set('forceBook', params.get('forceBook') !== null);

    this.scene.start('Preload');
  }
}
