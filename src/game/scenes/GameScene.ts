import Phaser from 'phaser';
import { GameSession } from '../../core/session';
import { buildStrips, StripSet } from '../../core/config/reelStrips';
import { ROWS, REELS, SpinResult, SYMBOL_NAMES, VolatilityProfile } from '../../core/types';
import { SoundFactory } from '../audio/SoundFactory';
import { ReelsView } from '../objects/ReelsView';
import { WinLinePainter } from '../objects/WinLinePainter';
import { CountUpText } from '../objects/CountUpText';
import { ExpandingOverlay } from '../objects/ExpandingOverlay';
import { symbolTextureKey } from '../assets/symbolSvg';
import { CELL_H, CELL_W, GAME_HEIGHT, GAME_WIDTH, REELS_TOP, REEL_GAP, REELS_LEFT, reelX } from '../layout';

const FS_INTERSPIN_DELAY = 700;

/**
 * Presentation state machine over the math core. Every outcome shown here was
 * fully resolved by GameSession.spin() before a single frame animates.
 */
export class GameScene extends Phaser.Scene {
  private session!: GameSession;
  private sounds!: SoundFactory;
  private strips!: StripSet;
  private reelsView!: ReelsView;
  private painter!: WinLinePainter;
  private countUp!: CountUpText;
  private expander!: ExpandingOverlay;
  private busy = false;
  private debug = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.session = this.registry.get('session') as GameSession;
    this.sounds = this.registry.get('sounds') as SoundFactory;
    this.debug = this.registry.get('debug') as boolean;
    const volatility = this.registry.get('volatility') as VolatilityProfile;
    this.strips = buildStrips(volatility);

    this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'bg');
    this.drawReelFrame();

    this.reelsView = new ReelsView(this, this.sounds, this.strips.base);
    this.painter = new WinLinePainter(this);
    this.countUp = new CountUpText(this, GAME_WIDTH / 2, REELS_TOP + (ROWS * CELL_H) / 2, this.sounds);
    this.expander = new ExpandingOverlay(this, this.sounds);

    if (this.debug) this.drawDebugGrid();

    this.game.events.on('ui:spin', this.onSpinRequested, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off('ui:spin', this.onSpinRequested, this);
    });

    this.emitState();
    this.game.events.emit('game:idle');
  }

  update(_time: number, delta: number): void {
    this.reelsView.update(delta);
  }

  private drawReelFrame(): void {
    const g = this.add.graphics();
    const w = REELS * CELL_W + (REELS - 1) * REEL_GAP;
    const h = ROWS * CELL_H;
    // Outer golden frame
    g.fillStyle(0x141414, 0.35);
    g.fillRoundedRect(REELS_LEFT - 18, REELS_TOP - 18, w + 36, h + 36, 18);
    g.lineStyle(6, 0xa97c16, 1);
    g.strokeRoundedRect(REELS_LEFT - 14, REELS_TOP - 14, w + 28, h + 28, 14);
    g.lineStyle(2, 0xffe9a8, 0.6);
    g.strokeRoundedRect(REELS_LEFT - 8, REELS_TOP - 8, w + 16, h + 16, 10);
    // Reel wells
    for (let r = 0; r < REELS; r++) {
      g.fillStyle(0x0d0a14, 0.92);
      g.fillRect(reelX(r), REELS_TOP, CELL_W, h);
    }
    // Title
    this.add
      .text(GAME_WIDTH / 2, 52, 'BOOK OF ANUBIS', {
        fontFamily: 'Georgia, serif',
        fontSize: '52px',
        fontStyle: 'bold',
        color: '#ffe9a8',
        stroke: '#7a5410',
        strokeThickness: 10,
      })
      .setOrigin(0.5);
  }

  private drawDebugGrid(): void {
    const g = this.add.graphics().setDepth(30);
    g.lineStyle(1, 0x00ff88, 0.8);
    for (let r = 0; r < REELS; r++) {
      for (let row = 0; row < ROWS; row++) {
        g.strokeRect(reelX(r), REELS_TOP + row * CELL_H, CELL_W, CELL_H);
      }
    }
  }

  private emitState(): void {
    this.game.events.emit('game:state', this.session.getState(), this.session.totalBet);
  }

  private onSpinRequested(): void {
    if (this.busy) return;
    void this.runRound();
  }

  /** One full round: paid base spin + any feature it triggers. */
  private async runRound(): Promise<void> {
    this.busy = true;
    this.painter.clear();
    this.countUp.hide();

    // Demo-friendly: top the balance back up instead of dead-ending.
    if (this.session.getState().mode === 'BASE' && !this.session.canSpin()) {
      this.session.addBalance(1000);
      this.game.events.emit('game:toast', 'Demo balance +1000');
    }

    const base = await this.playSpin();

    if (base.featureTriggered && base.expandingSymbolChosen !== null) {
      await this.featureIntro(base);
      while (this.session.getState().mode === 'FREE_SPINS') {
        await this.delay(FS_INTERSPIN_DELAY);
        this.painter.clear();
        this.countUp.hide();
        const fs = await this.playSpin();
        if (fs.featureTriggered) {
          this.sounds.fanfare();
          this.game.events.emit('game:toast', '+10 FREE SPINS!');
        }
      }
      await this.featureOutro();
    }

    this.busy = false;
    this.emitState();
    this.game.events.emit('game:idle');
  }

  /** Resolve one spin via the math core and animate the outcome. */
  private async playSpin(): Promise<SpinResult> {
    const isFree = this.session.getState().mode === 'FREE_SPINS';
    this.reelsView.setStrips(isFree ? this.strips.freeSpins : this.strips.base);

    let result = this.session.spin();

    // Dev shortcut: fast-forward the RNG to a triggering spin.
    if (!isFree && this.registry.get('forceBook') && !result.featureTriggered) {
      for (let i = 0; i < 100000 && !result.featureTriggered; i++) {
        if (!this.session.canSpin()) this.session.addBalance(100000);
        result = this.session.spin();
      }
      this.registry.set('forceBook', false);
    }

    if (this.debug) console.log('SpinResult', result);

    this.game.events.emit('game:spin-started', result);
    this.emitState();

    await this.reelsView.spinTo(result.stops, result.window);

    // Expanding symbol moment first (free spins), then regular win presentation.
    if (result.expandingWin > 0 && result.expandedReels.length > 0) {
      const sym = this.session.getState().expandingSymbol ?? result.expandingSymbolChosen;
      if (sym !== null) {
        await this.expander.expand(sym, result.expandedReels);
        await this.delay(450);
        this.expander.clear();
      }
    }

    if (result.totalWin > 0 || result.scatterCount >= 2) {
      this.painter.showWins(result.lineWins, result.scatterPositions, result.window);
    }
    if (result.totalWin > 0) {
      if (result.totalWin >= result.totalBet * 10) this.sounds.fanfare();
      else this.sounds.smallWin();
      this.game.events.emit('game:win', result.totalWin);
      await this.countUp.countTo(result.totalWin, result.totalWin >= result.totalBet * 5 ? 1600 : 900);
      await this.delay(500);
    }

    this.game.events.emit('game:spin-settled', result);
    this.emitState();
    return result;
  }

  private featureIntro(trigger: SpinResult): Promise<void> {
    this.sounds.fanfare();
    return this.banner((container) => {
      const sym = trigger.expandingSymbolChosen!;
      container.add(
        this.add
          .text(0, -70, '10 FREE SPINS!', {
            fontFamily: 'Georgia, serif',
            fontSize: '58px',
            fontStyle: 'bold',
            color: '#ffe9a8',
            stroke: '#7a5410',
            strokeThickness: 8,
          })
          .setOrigin(0.5),
      );
      container.add(
        this.add.image(0, 30, symbolTextureKey(sym)).setDisplaySize(CELL_W * 0.9, CELL_H * 0.9),
      );
      container.add(
        this.add
          .text(0, 118, `Special expanding symbol: ${SYMBOL_NAMES[sym]}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '26px',
            color: '#ffffff',
          })
          .setOrigin(0.5),
      );
    });
  }

  private featureOutro(): Promise<void> {
    // featureTotalWin persists on the session after the feature ends (it is
    // only reset by the next trigger), so it is safe to read here.
    const total = this.session.getState().featureTotalWin;
    return this.banner((container) => {
      container.add(
        this.add
          .text(0, -40, 'FEATURE COMPLETE', {
            fontFamily: 'Georgia, serif',
            fontSize: '46px',
            fontStyle: 'bold',
            color: '#ffe9a8',
            stroke: '#7a5410',
            strokeThickness: 8,
          })
          .setOrigin(0.5),
      );
      container.add(
        this.add
          .text(0, 30, `Total win: ${total.toFixed(2)}`, {
            fontFamily: 'Georgia, serif',
            fontSize: '38px',
            color: '#ffffff',
          })
          .setOrigin(0.5),
      );
    });
  }

  /** Dark-out banner shown for ~2.2s; click dismisses early. */
  private banner(fill: (container: Phaser.GameObjects.Container) => void): Promise<void> {
    return new Promise((resolve) => {
      const shade = this.add
        .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7)
        .setDepth(40)
        .setInteractive();
      const container = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20).setDepth(41);
      fill(container);
      container.setScale(0.6).setAlpha(0);
      this.tweens.add({
        targets: container,
        scale: 1,
        alpha: 1,
        duration: 320,
        ease: 'Back.easeOut',
      });
      const done = () => {
        shade.destroy();
        container.destroy();
        resolve();
      };
      const timer = this.time.delayedCall(2400, done);
      shade.once('pointerdown', () => {
        timer.remove();
        done();
      });
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((r) => this.time.delayedCall(ms, r));
  }
}
