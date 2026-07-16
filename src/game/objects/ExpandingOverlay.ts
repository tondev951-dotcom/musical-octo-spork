import Phaser from 'phaser';
import { ROWS, SymbolId } from '../../core/types';
import { symbolTextureKey } from '../assets/symbolSvg';
import { CELL_H, CELL_W, REELS_TOP, reelX } from '../layout';
import { SoundFactory } from '../audio/SoundFactory';

/**
 * Free-spins signature moment: the special symbol grows to cover each reel
 * it landed on, then the expanded pay is presented.
 */
export class ExpandingOverlay {
  private readonly scene: Phaser.Scene;
  private readonly sounds: SoundFactory;
  private sprites: Phaser.GameObjects.Image[] = [];

  constructor(scene: Phaser.Scene, sounds: SoundFactory) {
    this.scene = scene;
    this.sounds = sounds;
  }

  expand(symbol: SymbolId, reels: number[]): Promise<void> {
    this.clear();
    this.sounds.expand();
    const promises = reels.map(
      (reel, i) =>
        new Promise<void>((resolve) => {
          const x = reelX(reel) + CELL_W / 2;
          const yMid = REELS_TOP + (ROWS * CELL_H) / 2;
          const img = this.scene.add
            .image(x, yMid, symbolTextureKey(symbol))
            .setDisplaySize(CELL_W - 8, CELL_H - 8)
            .setAlpha(0.95)
            .setDepth(15);
          this.sprites.push(img);
          this.scene.tweens.add({
            targets: img,
            displayHeight: ROWS * CELL_H - 6,
            displayWidth: CELL_W - 4,
            duration: 420,
            delay: i * 140,
            ease: 'Back.easeOut',
            onComplete: () => resolve(),
          });
        }),
    );
    return Promise.all(promises).then(() => undefined);
  }

  clear(): void {
    this.sprites.forEach((s) => {
      this.scene.tweens.killTweensOf(s);
      s.destroy();
    });
    this.sprites = [];
  }
}
