import Phaser from 'phaser';
import { SoundFactory } from '../audio/SoundFactory';

/** Tweened win-amount counter with tick sounds. */
export class CountUpText {
  private readonly scene: Phaser.Scene;
  private readonly sounds: SoundFactory;
  readonly text: Phaser.GameObjects.Text;
  private tween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, sounds: SoundFactory) {
    this.scene = scene;
    this.sounds = sounds;
    this.text = scene.add
      .text(x, y, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '54px',
        fontStyle: 'bold',
        color: '#ffe9a8',
        stroke: '#7a5410',
        strokeThickness: 8,
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);
  }

  countTo(amount: number, durationMs = 1200): Promise<void> {
    this.stop();
    this.text.setVisible(true).setScale(1);
    let lastTick = -1;
    return new Promise((resolve) => {
      this.tween = this.scene.tweens.addCounter({
        from: 0,
        to: amount,
        duration: durationMs,
        ease: 'Quad.easeOut',
        onUpdate: (tw) => {
          const v = tw.getValue() ?? 0;
          this.text.setText(v.toFixed(2));
          const tick = Math.floor((v / amount) * 14);
          if (tick !== lastTick) {
            lastTick = tick;
            this.sounds.winTick(tick);
          }
        },
        onComplete: () => {
          this.text.setText(amount.toFixed(2));
          this.scene.tweens.add({
            targets: this.text,
            scale: { from: 1.25, to: 1 },
            duration: 180,
            ease: 'Back.easeOut',
          });
          resolve();
        },
      });
    });
  }

  stop(): void {
    this.tween?.remove();
    this.tween = null;
  }

  hide(): void {
    this.stop();
    this.text.setVisible(false);
  }
}
