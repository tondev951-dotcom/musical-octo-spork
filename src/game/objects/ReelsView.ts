import Phaser from 'phaser';
import { SymbolId, ROWS, REELS } from '../../core/types';
import { StripSet } from '../../core/config/reelStrips';
import { Reel } from './Reel';
import { SoundFactory } from '../audio/SoundFactory';
import { CELL_H, CELL_W, REELS_TOP, reelX } from '../layout';

const FIRST_STOP_MS = 650;
const STOP_STAGGER_MS = 280;
const ANTICIPATION_EXTRA_MS = 950;

/**
 * The 5-reel assembly: spin choreography (staggered stops, BOOK anticipation)
 * over outcomes that are already fully resolved by the math core.
 */
export class ReelsView {
  private readonly scene: Phaser.Scene;
  private readonly sounds: SoundFactory;
  private readonly reels: Reel[] = [];
  private readonly glowRects: Phaser.GameObjects.Rectangle[] = [];
  private spinning = false;

  constructor(scene: Phaser.Scene, sounds: SoundFactory, strips: SymbolId[][]) {
    this.scene = scene;
    this.sounds = sounds;
    for (let r = 0; r < REELS; r++) {
      const reel = new Reel(scene, reelX(r), REELS_TOP, strips[r]);
      // Show an arbitrary but deterministic idle window at boot.
      reel.snapTo((r * 7) % strips[r].length);
      this.reels.push(reel);

      const glow = scene.add
        .rectangle(reelX(r) + CELL_W / 2, REELS_TOP + (ROWS * CELL_H) / 2, CELL_W + 6, ROWS * CELL_H + 6)
        .setStrokeStyle(5, 0xffd54a, 1)
        .setFillStyle(0xffd54a, 0.08)
        .setVisible(false)
        .setDepth(5);
      this.glowRects.push(glow);
    }
  }

  get isSpinning(): boolean {
    return this.spinning;
  }

  setStrips(strips: SymbolId[][]): void {
    this.reels.forEach((reel, i) => reel.setStrip(strips[i]));
  }

  /**
   * Spin all reels and land them on `stops`. `bookLandedByReel` drives the
   * anticipation effect: when ≥2 BOOKs sit on already-stopped reels, the
   * remaining reels get extra spin time, a golden glow and a tension tone.
   * Resolves when the last reel has settled.
   */
  spinTo(stops: number[], window: SymbolId[][]): Promise<void> {
    if (this.spinning) return Promise.resolve();
    this.spinning = true;
    this.sounds.startSpinLoop();
    this.reels.forEach((r) => r.startSpin());

    return new Promise((resolve) => {
      let stopped = 0;
      let booksLanded = 0;
      let anticipating = false;

      // All stop requests are scheduled upfront; landing time per reel is
      // constant (short teleport approach), so reels settle left-to-right at
      // a steady cadence. Pending timers are pushed back when anticipation
      // kicks in.
      const timers: (Phaser.Time.TimerEvent | null)[] = new Array(REELS).fill(null);

      const requestStop = (index: number) => {
        timers[index] = null;
        this.reels[index].stopAt(stops[index], () => finishReel(index));
      };

      const finishReel = (index: number) => {
        this.sounds.reelStop();
        booksLanded += window[index].filter((s) => s === SymbolId.BOOK).length;

        // Two books down, feature possible on remaining reels → tension:
        // delay every reel whose stop hasn't been requested yet.
        if (!anticipating && booksLanded >= 2 && index < REELS - 1) {
          anticipating = true;
          this.sounds.startTension();
          for (let r = index + 1; r < REELS; r++) {
            const pending = timers[r];
            if (pending) {
              const remaining = Math.max(0, pending.getRemaining());
              pending.remove();
              timers[r] = this.scene.time.delayedCall(
                remaining + ANTICIPATION_EXTRA_MS * (r - index),
                () => requestStop(r),
              );
            }
            this.glowRects[r].setVisible(true);
          }
          this.scene.tweens.add({
            targets: this.glowRects.filter((g) => g.visible),
            alpha: { from: 1, to: 0.35 },
            yoyo: true,
            repeat: -1,
            duration: 260,
          });
        }
        this.glowRects[index].setVisible(false);

        stopped++;
        if (stopped === REELS) {
          this.sounds.stopSpinLoop();
          this.sounds.stopTension();
          this.glowRects.forEach((g) => {
            this.scene.tweens.killTweensOf(g);
            g.setVisible(false).setAlpha(1);
          });
          this.spinning = false;
          resolve();
        }
      };

      for (let r = 0; r < REELS; r++) {
        timers[r] = this.scene.time.delayedCall(
          FIRST_STOP_MS + r * STOP_STAGGER_MS,
          () => requestStop(r),
        );
      }
    });
  }

  update(deltaMs: number): void {
    for (const reel of this.reels) reel.update(deltaMs);
  }
}
