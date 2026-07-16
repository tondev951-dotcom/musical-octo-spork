import Phaser from 'phaser';
import { LineWin, ReelWindow, ROWS, REELS } from '../../core/types';
import { symbolTextureKey } from '../assets/symbolSvg';
import { CELL_H, CELL_W, REELS_TOP, REELS_LEFT, cellCenter } from '../layout';

const LINE_COLORS = [
  0xffd54a, 0x64d8ff, 0xff7a5c, 0x8bf58b, 0xd08bff,
  0xffb14a, 0x4affc7, 0xff5ca8, 0xa8c4ff, 0xf5f18b,
];

/**
 * Win presentation: dims the reel area, draws each winning payline as a
 * colored polyline through the winning cells and pulses the symbols on it.
 */
export class WinLinePainter {
  private readonly scene: Phaser.Scene;
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly dimmer: Phaser.GameObjects.Rectangle;
  private highlights: Phaser.GameObjects.Image[] = [];
  private cycleTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.dimmer = scene.add
      .rectangle(
        REELS_LEFT + (REELS * CELL_W + 4 * 8) / 2,
        REELS_TOP + (ROWS * CELL_H) / 2,
        REELS * (CELL_W + 8),
        ROWS * CELL_H,
        0x000000,
        0.55,
      )
      .setDepth(10)
      .setVisible(false);
    this.graphics = scene.add.graphics().setDepth(12);
  }

  /** Show all wins at once, then cycle them one by one until cleared. */
  showWins(wins: LineWin[], scatterPositions: [number, number][], window: ReelWindow): void {
    this.clear();
    if (wins.length === 0 && scatterPositions.length === 0) return;
    this.dimmer.setVisible(true);

    this.drawAll(wins, scatterPositions, window);
    if (wins.length > 1) {
      let idx = -1;
      this.cycleTimer = this.scene.time.addEvent({
        delay: 1500,
        loop: true,
        callback: () => {
          idx = (idx + 1) % (wins.length + 1);
          if (idx === wins.length) this.drawAll(wins, scatterPositions, window);
          else this.drawAll([wins[idx]], scatterPositions, window);
        },
      });
    }
  }

  private drawAll(
    wins: LineWin[],
    scatterPositions: [number, number][],
    window: ReelWindow,
  ): void {
    this.graphics.clear();
    this.highlights.forEach((h) => h.destroy());
    this.highlights = [];

    for (const win of wins) {
      const color = LINE_COLORS[win.lineIndex % LINE_COLORS.length];
      this.graphics.lineStyle(6, color, 0.95);
      this.graphics.beginPath();
      win.positions.forEach(([reel, row], i) => {
        const { x, y } = cellCenter(reel, row);
        if (i === 0) this.graphics.moveTo(x, y);
        else this.graphics.lineTo(x, y);
      });
      this.graphics.strokePath();

      // Pulse the symbol that is actually in the cell (a wild stays a BOOK
      // even when it substitutes into the line).
      for (const [reel, row] of win.positions) this.highlight(reel, row, window[reel][row]);
    }

    for (const [reel, row] of scatterPositions) {
      const { x, y } = cellCenter(reel, row);
      this.graphics.lineStyle(5, 0xffe9a8, 1);
      this.graphics.strokeCircle(x, y, CELL_W / 2 - 14);
    }
  }

  private highlight(reel: number, row: number, symbol: number): void {
    const { x, y } = cellCenter(reel, row);
    const img = this.scene.add
      .image(x, y, symbolTextureKey(symbol))
      .setDisplaySize(CELL_W - 10, CELL_H - 8)
      .setDepth(11);
    this.scene.tweens.add({
      targets: img,
      displayWidth: (CELL_W - 10) * 1.12,
      displayHeight: (CELL_H - 8) * 1.12,
      yoyo: true,
      repeat: -1,
      duration: 320,
      ease: 'Sine.easeInOut',
    });
    this.highlights.push(img);
  }

  clear(): void {
    this.cycleTimer?.remove();
    this.cycleTimer = null;
    this.graphics.clear();
    this.dimmer.setVisible(false);
    this.highlights.forEach((h) => {
      this.scene.tweens.killTweensOf(h);
      h.destroy();
    });
    this.highlights = [];
  }
}
