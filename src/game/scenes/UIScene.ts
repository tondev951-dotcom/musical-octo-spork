import Phaser from 'phaser';
import { GameSession } from '../../core/session';
import { SessionStateSnapshot, SpinResult, SymbolId, SYMBOL_NAMES, ALL_SYMBOLS } from '../../core/types';
import { PAYTABLE, SCATTER_PAYS } from '../../core/config/paytable';
import { DEFAULT_CONFIG } from '../../core/config/gameConfig';
import { SoundFactory } from '../audio/SoundFactory';
import { symbolTextureKey } from '../assets/symbolSvg';
import { GAME_HEIGHT, GAME_WIDTH } from '../layout';

const BAR_Y = GAME_HEIGHT - 52;
const GOLD = '#e8b93b';

const LABEL_STYLE = { fontFamily: 'Georgia, serif', fontSize: '16px', color: '#b99b57' };
const VALUE_STYLE = {
  fontFamily: 'Georgia, serif',
  fontSize: '28px',
  fontStyle: 'bold',
  color: '#ffe9a8',
};

/** HUD, controls, paytable overlay and autoplay. Runs on top of GameScene. */
export class UIScene extends Phaser.Scene {
  private session!: GameSession;
  private sounds!: SoundFactory;
  private balanceText!: Phaser.GameObjects.Text;
  private betText!: Phaser.GameObjects.Text;
  private winText!: Phaser.GameObjects.Text;
  private fsBanner!: Phaser.GameObjects.Text;
  private spinButton!: Phaser.GameObjects.Container;
  private autoButton!: Phaser.GameObjects.Text;
  private toastText!: Phaser.GameObjects.Text;
  private paytablePanel: Phaser.GameObjects.Container | null = null;
  private autoplay = false;
  private idle = true;

  constructor() {
    super('UI');
  }

  create(): void {
    this.session = this.registry.get('session') as GameSession;
    this.sounds = this.registry.get('sounds') as SoundFactory;

    this.drawBar();
    this.buildTexts();
    this.buildButtons();

    this.game.events.on('game:state', this.onState, this);
    this.game.events.on('game:idle', this.onIdle, this);
    this.game.events.on('game:spin-started', this.onSpinStarted, this);
    this.game.events.on('game:win', (w: number) => this.winText.setText(w.toFixed(2)), this);
    this.game.events.on('game:toast', this.showToast, this);

    this.input.keyboard?.on('keydown-SPACE', () => this.requestSpin());

    this.onState(this.session.getState(), this.session.totalBet);
  }

  private drawBar(): void {
    const g = this.add.graphics();
    g.fillStyle(0x120b06, 0.9);
    g.fillRoundedRect(16, GAME_HEIGHT - 96, GAME_WIDTH - 32, 84, 14);
    g.lineStyle(2, 0xa97c16, 0.8);
    g.strokeRoundedRect(16, GAME_HEIGHT - 96, GAME_WIDTH - 32, 84, 14);
  }

  private buildTexts(): void {
    this.add.text(60, BAR_Y - 26, 'BALANCE', LABEL_STYLE);
    this.balanceText = this.add.text(60, BAR_Y - 4, '', VALUE_STYLE);

    this.add.text(320, BAR_Y - 26, 'TOTAL BET', LABEL_STYLE);
    this.betText = this.add.text(348, BAR_Y - 4, '', VALUE_STYLE);

    this.add.text(880, BAR_Y - 26, 'WIN', LABEL_STYLE);
    this.winText = this.add.text(880, BAR_Y - 4, '0.00', VALUE_STYLE);

    this.fsBanner = this.add
      .text(GAME_WIDTH / 2, 92, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffe9a8',
        backgroundColor: '#3a1f0acc',
        padding: { x: 14, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(25)
      .setVisible(false);

    this.toastText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT - 130, '', {
        fontFamily: 'Georgia, serif',
        fontSize: '22px',
        color: '#ffe9a8',
        backgroundColor: '#000000aa',
        padding: { x: 12, y: 6 },
      })
      .setOrigin(0.5)
      .setDepth(50)
      .setVisible(false);
  }

  private textButton(x: number, y: number, label: string, onClick: () => void, size = 26): Phaser.GameObjects.Text {
    const btn = this.add
      .text(x, y, label, {
        fontFamily: 'Georgia, serif',
        fontSize: `${size}px`,
        fontStyle: 'bold',
        color: GOLD,
        backgroundColor: '#241a0e',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => btn.setColor('#ffe9a8'));
    btn.on('pointerout', () => btn.setColor(GOLD));
    btn.on('pointerdown', onClick);
    return btn;
  }

  private buildButtons(): void {
    // Bet stepper
    this.textButton(300, BAR_Y + 8, '−', () => this.stepBet(-1), 30);
    this.textButton(520, BAR_Y + 8, '+', () => this.stepBet(1), 30);

    // Spin button
    const circle = this.add.circle(0, 0, 46, 0xa97c16).setStrokeStyle(4, 0xffe9a8, 1);
    const arrow = this.add
      .text(0, 0, '⟳', { fontSize: '52px', color: '#1c140b', fontStyle: 'bold' })
      .setOrigin(0.5, 0.55);
    this.spinButton = this.add.container(700, BAR_Y - 2, [circle, arrow]);
    circle.setInteractive({ useHandCursor: true });
    circle.on('pointerdown', () => this.requestSpin());
    circle.on('pointerover', () => circle.setFillStyle(0xc89a2a));
    circle.on('pointerout', () => circle.setFillStyle(0xa97c16));

    this.autoButton = this.textButton(1020, BAR_Y - 2, 'AUTO: OFF', () => this.toggleAutoplay(), 22);
    this.textButton(1150, BAR_Y - 2, 'PAYS', () => this.togglePaytable(), 22);
    const muteBtn = this.textButton(1230, BAR_Y - 2, '♪', () => {
      this.sounds.muted = !this.sounds.muted;
      muteBtn.setText(this.sounds.muted ? '✕' : '♪');
    }, 22);
  }

  private requestSpin(): void {
    if (this.paytablePanel) this.togglePaytable();
    this.game.events.emit('ui:spin');
  }

  private stepBet(dir: number): void {
    const state = this.session.getState();
    if (state.mode !== 'BASE' || !this.idle) return;
    const levels = DEFAULT_CONFIG.betLevels;
    const idx = levels.indexOf(state.betPerLine);
    const next = Math.min(levels.length - 1, Math.max(0, idx + dir));
    this.session.setBetPerLine(levels[next]);
    this.onState(this.session.getState(), this.session.totalBet);
  }

  private toggleAutoplay(): void {
    this.autoplay = !this.autoplay;
    this.autoButton.setText(this.autoplay ? 'AUTO: ON' : 'AUTO: OFF');
    if (this.autoplay && this.idle) this.requestSpin();
  }

  private onState(state: SessionStateSnapshot, totalBet: number): void {
    this.balanceText.setText(state.balance.toFixed(2));
    this.betText.setText(totalBet.toFixed(2));
    if (state.mode === 'FREE_SPINS' && state.expandingSymbol !== null) {
      this.fsBanner
        .setText(
          `FREE SPINS: ${state.freeSpinsRemaining} left  •  special symbol: ${SYMBOL_NAMES[state.expandingSymbol]}`,
        )
        .setVisible(true);
    } else {
      this.fsBanner.setVisible(false);
    }
  }

  private onSpinStarted(result: SpinResult): void {
    this.idle = false;
    if (result.mode === 'BASE') this.winText.setText('0.00');
    this.spinButton.setAlpha(0.5);
  }

  private onIdle(): void {
    this.idle = true;
    this.spinButton.setAlpha(1);
    if (this.autoplay) {
      this.time.delayedCall(650, () => {
        if (this.autoplay && this.idle) this.requestSpin();
      });
    }
  }

  private showToast(msg: string): void {
    this.toastText.setText(msg).setVisible(true).setAlpha(1);
    this.tweens.add({
      targets: this.toastText,
      alpha: 0,
      delay: 1400,
      duration: 400,
      onComplete: () => this.toastText.setVisible(false),
    });
  }

  /** Paytable rendered from the live PAYTABLE object — it can never drift from the math. */
  private togglePaytable(): void {
    if (this.paytablePanel) {
      this.paytablePanel.destroy();
      this.paytablePanel = null;
      return;
    }
    const panel = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(60);
    const bg = this.add
      .rectangle(0, 0, 980, 620, 0x120b06, 0.97)
      .setStrokeStyle(3, 0xa97c16, 1)
      .setInteractive();
    panel.add(bg);
    panel.add(
      this.add
        .text(0, -280, 'PAYTABLE  (pays are × line bet, 10 lines)', {
          fontFamily: 'Georgia, serif',
          fontSize: '26px',
          fontStyle: 'bold',
          color: '#ffe9a8',
        })
        .setOrigin(0.5),
    );

    const symbols = ALL_SYMBOLS.filter((s) => s !== SymbolId.BOOK);
    symbols.forEach((s, i) => {
      const col = i % 2;
      const rowI = Math.floor(i / 2);
      const x = -460 + col * 490;
      const y = -220 + rowI * 88;
      panel.add(this.add.image(x + 40, y + 30, symbolTextureKey(s)).setDisplaySize(72, 72));
      const pays = PAYTABLE[s]
        .map((p, ci) => (p > 0 ? `${ci + 2}×: ${p}` : ''))
        .filter(Boolean)
        .join('   ');
      panel.add(
        this.add.text(x + 90, y + 6, SYMBOL_NAMES[s], {
          fontFamily: 'Georgia, serif',
          fontSize: '20px',
          fontStyle: 'bold',
          color: GOLD,
        }),
      );
      panel.add(
        this.add.text(x + 90, y + 32, pays, {
          fontFamily: 'Georgia, serif',
          fontSize: '18px',
          color: '#ffffff',
        }),
      );
    });

    const scatterLine = SCATTER_PAYS.map((p, c) => (p > 0 ? `${c}×: ${p}` : ''))
      .filter(Boolean)
      .join('   ');
    panel.add(
      this.add
        .text(
          0,
          236,
          `BOOK = wild + scatter (pays × total bet):  ${scatterLine}\n3+ BOOKs award 10 free spins with an expanding special symbol`,
          {
            fontFamily: 'Georgia, serif',
            fontSize: '19px',
            color: '#ffe9a8',
            align: 'center',
          },
        )
        .setOrigin(0.5),
    );
    panel.add(
      this.add
        .text(0, 288, 'click to close', { fontFamily: 'Georgia, serif', fontSize: '15px', color: '#b99b57' })
        .setOrigin(0.5),
    );
    bg.once('pointerdown', () => this.togglePaytable());
    this.paytablePanel = panel;
  }
}
