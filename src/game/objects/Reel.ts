import Phaser from 'phaser';
import { SymbolId, ROWS } from '../../core/types';
import { symbolTextureKey } from '../assets/symbolSvg';
import { CELL_H, CELL_W } from '../layout';

type ReelState = 'idle' | 'accelerating' | 'spinning' | 'stopping';

const CRUISE_SPEED = 16.5; // symbols per second
const ACCEL_MS = 280;
const STOP_TWEEN_MS = 320;
const DECEL_DISTANCE = 2.1; // symbols of travel handled by the stop tween
/** Constant approach distance once a stop is requested (symbols). */
const APPROACH_DISTANCE = DECEL_DISTANCE + 1.0;

/**
 * One reel column. Spinning is an update-loop scroll over the REAL strip
 * (players see genuine strip order), not a texture shuffle. `pos` is the
 * fractional strip index shown at the top visible row; it decreases while
 * spinning so symbols travel downward.
 */
export class Reel {
  readonly container: Phaser.GameObjects.Container;
  private readonly scene: Phaser.Scene;
  private readonly sprites: Phaser.GameObjects.Image[] = [];

  private strip: SymbolId[];
  private pos = 0;
  private velocity = 0;
  private state: ReelState = 'idle';
  private targetStop: number | null = null;
  private onStopped: (() => void) | null = null;
  private accelTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, strip: SymbolId[]) {
    this.scene = scene;
    this.strip = strip;
    this.container = scene.add.container(x, y);

    // 3 visible rows + 1 buffer above and below.
    for (let i = 0; i < ROWS + 2; i++) {
      const img = scene.add.image(CELL_W / 2, 0, symbolTextureKey(SymbolId.A));
      img.setDisplaySize(CELL_W - 10, CELL_H - 8);
      this.sprites.push(img);
      this.container.add(img);
    }

    const maskShape = scene.add.graphics().setVisible(false);
    maskShape.fillRect(x, y, CELL_W, ROWS * CELL_H);
    this.container.setMask(maskShape.createGeometryMask());
    this.render();
  }

  get stripLength(): number {
    return this.strip.length;
  }

  get isIdle(): boolean {
    return this.state === 'idle';
  }

  /** Swap strip set (base <-> free spins) while idle. */
  setStrip(strip: SymbolId[]): void {
    if (this.state !== 'idle') throw new Error('cannot swap strip mid-spin');
    // Keep the same visible window if possible by keeping pos modulo new length.
    this.strip = strip;
    this.pos = ((this.pos % strip.length) + strip.length) % strip.length;
    this.render();
  }

  /** Instantly show a given stop (used at boot and by debug tools). */
  snapTo(stop: number): void {
    this.pos = stop;
    this.render();
  }

  startSpin(): void {
    if (this.state !== 'idle') return;
    this.state = 'accelerating';
    this.targetStop = null;
    // Wind-up: tiny upward nudge, then ease into cruise speed.
    this.accelTween = this.scene.tweens.add({
      targets: this,
      pos: this.pos + 0.18,
      duration: 110,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.accelTween = this.scene.tweens.addCounter({
          from: 0,
          to: CRUISE_SPEED,
          duration: ACCEL_MS,
          ease: 'Quad.easeIn',
          onUpdate: (tw) => (this.velocity = tw.getValue() ?? this.velocity),
          onComplete: () => {
            this.velocity = CRUISE_SPEED;
            this.state = 'spinning';
          },
        });
      },
    });
  }

  /**
   * Request a landing on `stop` (top-row strip index). The reel is an
   * unreadable blur at cruise speed, so it teleports to a constant approach
   * distance above the target — landing time is independent of where the
   * target sits on the strip, and the final approach still shows the genuine
   * strip neighborhood of the landing window.
   */
  stopAt(stop: number, onStopped: () => void): void {
    this.targetStop = stop;
    this.onStopped = onStopped;
    if (this.state === 'spinning' && this.distanceTo(stop) > APPROACH_DISTANCE) {
      const len = this.strip.length;
      const frac = this.pos - Math.floor(this.pos);
      this.pos = ((((stop + APPROACH_DISTANCE + frac) % len) + len) % len);
    }
  }

  private distanceTo(target: number): number {
    const len = this.strip.length;
    return (((this.pos - target) % len) + len) % len;
  }

  update(deltaMs: number): void {
    if (this.state === 'accelerating') {
      this.pos -= (this.velocity * deltaMs) / 1000;
      this.render();
      return;
    }
    if (this.state !== 'spinning') return;

    this.pos -= (this.velocity * deltaMs) / 1000;

    if (this.targetStop !== null) {
      const d = this.distanceTo(this.targetStop);
      // Hand over to the landing tween once within deceleration range.
      if (d <= DECEL_DISTANCE) {
        this.state = 'stopping';
        const target = this.pos - d;
        this.scene.tweens.add({
          targets: this,
          pos: target,
          duration: STOP_TWEEN_MS,
          ease: 'Back.easeOut',
          onUpdate: () => this.render(),
          onComplete: () => {
            const len = this.strip.length;
            this.pos = ((target % len) + len) % len;
            this.velocity = 0;
            this.state = 'idle';
            this.render();
            const cb = this.onStopped;
            this.onStopped = null;
            cb?.();
          },
        });
      }
    }
    this.render();
  }

  private render(): void {
    const len = this.strip.length;
    const base = Math.floor(this.pos);
    for (let i = 0; i < this.sprites.length; i++) {
      const stripIdx = base - 1 + i;
      const sym = this.strip[((stripIdx % len) + len) % len];
      const img = this.sprites[i];
      img.setTexture(symbolTextureKey(sym));
      img.setDisplaySize(CELL_W - 10, CELL_H - 8);
      img.y = (stripIdx - this.pos) * CELL_H + CELL_H / 2;
    }
  }
}
