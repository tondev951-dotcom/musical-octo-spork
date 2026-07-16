import Phaser from 'phaser';
import { ALL_SYMBOLS } from '../../core/types';
import { SYMBOL_SVGS, symbolTextureKey } from '../assets/symbolSvg';
import { GAME_HEIGHT, GAME_WIDTH } from '../layout';

/** Convert an SVG string into a Phaser texture via an HTMLImageElement. */
function loadSvgTexture(
  scene: Phaser.Scene,
  key: string,
  svg: string,
  size = 200,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image(size, size);
    img.onload = () => {
      scene.textures.addImage(key, img);
      resolve();
    };
    img.onerror = () => reject(new Error(`failed to rasterize SVG for ${key}`));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

/**
 * Builds every texture procedurally (symbol SVGs, background, panels) —
 * the game loads no external asset files at all.
 */
export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload');
  }

  create(): void {
    const barBg = this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, 420, 18, 0x2c2013);
    const bar = this.add
      .rectangle(GAME_WIDTH / 2 - 208, GAME_HEIGHT / 2, 4, 12, 0xe8b93b)
      .setOrigin(0, 0.5);
    this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40, 'BOOK OF ANUBIS', {
        fontFamily: 'Georgia, serif',
        fontSize: '36px',
        color: '#e8b93b',
      })
      .setOrigin(0.5);

    this.buildBackgroundTexture();

    const jobs = ALL_SYMBOLS.map((s) =>
      loadSvgTexture(this, symbolTextureKey(s), SYMBOL_SVGS[s]),
    );

    let done = 0;
    jobs.forEach((j) =>
      j.then(() => {
        done++;
        bar.width = 4 + (412 * done) / jobs.length;
      }),
    );

    Promise.all(jobs)
      .then(() => {
        barBg.destroy();
        bar.destroy();
        this.scene.start('Game');
        this.scene.launch('UI');
      })
      .catch((err) => {
        this.add
          .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40, `Asset error: ${err.message}`, {
            color: '#ff6666',
          })
          .setOrigin(0.5);
      });
  }

  /** Night-desert gradient with pyramid silhouettes, generated once. */
  private buildBackgroundTexture(): void {
    const g = this.add.graphics().setVisible(false);
    g.fillGradientStyle(0x120b2e, 0x120b2e, 0x3a1f0a, 0x2c1508, 1);
    g.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    // Dune line
    g.fillStyle(0x1c1006, 1);
    g.fillEllipse(GAME_WIDTH / 2, GAME_HEIGHT + 80, GAME_WIDTH * 1.6, 320);
    // Pyramids
    g.fillStyle(0x241408, 1);
    g.fillTriangle(140, 640, 420, 640, 280, 430);
    g.fillTriangle(880, 650, 1220, 650, 1050, 400);
    g.fillStyle(0x30190a, 1);
    g.fillTriangle(300, 650, 700, 650, 500, 380);
    // Stars
    g.fillStyle(0xfff2c4, 1);
    let sx = 37;
    for (let i = 0; i < 70; i++) {
      sx = (sx * 73 + 41) % 1279;
      const sy = (sx * 31 + i * 53) % 300;
      g.fillCircle(sx, 20 + sy, (i % 3) * 0.5 + 0.6);
    }
    // Moon
    g.fillStyle(0xfff2c4, 0.9);
    g.fillCircle(1150, 90, 38);
    g.fillStyle(0x120b2e, 1);
    g.fillCircle(1168, 78, 30);

    g.generateTexture('bg', GAME_WIDTH, GAME_HEIGHT);
    g.destroy();
  }
}
