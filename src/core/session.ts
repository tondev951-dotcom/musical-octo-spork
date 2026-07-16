import {
  EXPANDABLE_SYMBOLS,
  GameMode,
  SessionStateSnapshot,
  SpinResult,
  SymbolId,
  VolatilityProfile,
} from './types';
import { Rng } from './rng';
import { GameConfig } from './config/gameConfig';
import { buildStrips, StripSet } from './config/reelStrips';
import { spinReels } from './slotEngine';
import { evaluateWindow } from './evaluator';

/**
 * The single authoritative game state machine. Both the Phaser frontend and
 * the Node simulation drive the game exclusively through `spin()`; the
 * returned SpinResult is fully resolved — the frontend only animates it.
 */
export class GameSession {
  private readonly rng: Rng;
  private readonly config: GameConfig;
  private readonly strips: StripSet;

  private mode: GameMode = 'BASE';
  private balance: number;
  private betPerLine: number;
  private freeSpinsRemaining = 0;
  private totalFreeSpinsWon = 0;
  private expandingSymbol: SymbolId | null = null;
  private featureTotalWin = 0;

  constructor(rng: Rng, config: GameConfig, profile?: VolatilityProfile) {
    this.rng = rng;
    this.config = config;
    this.strips = buildStrips(profile ?? config.volatility);
    this.balance = config.startingBalance;
    this.betPerLine = config.betLevels[config.defaultBetLevelIndex];
  }

  get totalBet(): number {
    return this.betPerLine * this.config.lineCount;
  }

  getState(): SessionStateSnapshot {
    return {
      mode: this.mode,
      balance: this.balance,
      freeSpinsRemaining: this.freeSpinsRemaining,
      totalFreeSpinsWon: this.totalFreeSpinsWon,
      expandingSymbol: this.expandingSymbol,
      featureTotalWin: this.featureTotalWin,
      betPerLine: this.betPerLine,
    };
  }

  setBetPerLine(bet: number): void {
    if (this.mode !== 'BASE') throw new Error('cannot change bet during free spins');
    if (!this.config.betLevels.includes(bet)) throw new Error(`invalid bet level: ${bet}`);
    this.betPerLine = bet;
  }

  /** For dev/debug tooling only (e.g. topping the demo balance back up). */
  addBalance(amount: number): void {
    this.balance += amount;
  }

  canSpin(): boolean {
    return this.mode === 'FREE_SPINS' || this.balance >= this.totalBet;
  }

  spin(): SpinResult {
    const isFree = this.mode === 'FREE_SPINS';
    if (!isFree) {
      if (this.balance < this.totalBet) throw new Error('insufficient balance');
      this.balance -= this.totalBet;
    }

    const strips = isFree ? this.strips.freeSpins : this.strips.base;
    const { stops, window } = spinReels(strips, this.rng);
    const evaluation = evaluateWindow(window, {
      mode: this.mode,
      expandingSymbol: isFree ? this.expandingSymbol : null,
    });

    const totalWin = evaluation.totalWinX * this.totalBet;
    this.balance += totalWin;

    let freeSpinsAwarded = 0;
    let expandingSymbolChosen: SymbolId | null = null;

    if (isFree) {
      this.freeSpinsRemaining--;
      this.featureTotalWin += totalWin;
      if (evaluation.featureTriggered) {
        // Retrigger: more spins, same expanding symbol.
        freeSpinsAwarded = this.config.freeSpinsAwarded;
        this.freeSpinsRemaining += freeSpinsAwarded;
        this.totalFreeSpinsWon += freeSpinsAwarded;
      }
      if (this.freeSpinsRemaining <= 0) {
        this.mode = 'BASE';
        this.expandingSymbol = null;
      }
    } else if (evaluation.featureTriggered) {
      freeSpinsAwarded = this.config.freeSpinsAwarded;
      expandingSymbolChosen =
        EXPANDABLE_SYMBOLS[this.rng.int(EXPANDABLE_SYMBOLS.length)];
      this.mode = 'FREE_SPINS';
      this.freeSpinsRemaining = freeSpinsAwarded;
      this.totalFreeSpinsWon = freeSpinsAwarded;
      this.expandingSymbol = expandingSymbolChosen;
      this.featureTotalWin = 0;
    }

    return {
      mode: isFree ? 'FREE_SPINS' : 'BASE',
      stops,
      window,
      lineWins: evaluation.lineWins,
      scatterWin: evaluation.scatterWin,
      scatterCount: evaluation.scatterCount,
      scatterPositions: evaluation.scatterPositions,
      expandingWin: evaluation.expandingWin,
      expandedReels: evaluation.expandedReels,
      featureTriggered: evaluation.featureTriggered,
      freeSpinsAwarded,
      expandingSymbolChosen,
      totalWin,
      betPerLine: this.betPerLine,
      totalBet: this.totalBet,
      stateAfter: this.getState(),
    };
  }
}
