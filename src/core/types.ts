/** Symbol identifiers. BOOK is both wild and scatter. */
export enum SymbolId {
  BOOK = 0,
  PHARAOH = 1,
  HORUS = 2,
  SCARAB = 3,
  ANKH = 4,
  PYRAMID = 5,
  A = 6,
  K = 7,
  Q = 8,
  J = 9,
  TEN = 10,
}

export const ALL_SYMBOLS: readonly SymbolId[] = [
  SymbolId.BOOK,
  SymbolId.PHARAOH,
  SymbolId.HORUS,
  SymbolId.SCARAB,
  SymbolId.ANKH,
  SymbolId.PYRAMID,
  SymbolId.A,
  SymbolId.K,
  SymbolId.Q,
  SymbolId.J,
  SymbolId.TEN,
];

/** All symbols eligible to be the expanding special symbol in free spins. */
export const EXPANDABLE_SYMBOLS: readonly SymbolId[] = ALL_SYMBOLS.filter(
  (s) => s !== SymbolId.BOOK,
);

export const SYMBOL_NAMES: Record<SymbolId, string> = {
  [SymbolId.BOOK]: 'BOOK',
  [SymbolId.PHARAOH]: 'PHARAOH',
  [SymbolId.HORUS]: 'HORUS',
  [SymbolId.SCARAB]: 'SCARAB',
  [SymbolId.ANKH]: 'ANKH',
  [SymbolId.PYRAMID]: 'PYRAMID',
  [SymbolId.A]: 'A',
  [SymbolId.K]: 'K',
  [SymbolId.Q]: 'Q',
  [SymbolId.J]: 'J',
  [SymbolId.TEN]: '10',
};

export const REELS = 5;
export const ROWS = 3;

/** window[reel][row], row 0 = top */
export type ReelWindow = SymbolId[][];

export type VolatilityProfile = 'low' | 'medium' | 'high';

export interface LineWin {
  lineIndex: number;
  symbol: SymbolId;
  count: number;
  /** In units of line bet. */
  payout: number;
  /** [reel, row] cells that form the win. */
  positions: [number, number][];
}

export interface SpinEvaluation {
  lineWins: LineWin[];
  /** In units of total bet. */
  scatterWin: number;
  scatterCount: number;
  scatterPositions: [number, number][];
  featureTriggered: boolean;
  /** In units of line bet (already multiplied by line count). 0 outside free spins. */
  expandingWin: number;
  /** Reels (0-based) containing the expanding symbol when it pays. */
  expandedReels: number[];
  /** Sum of all wins in units of total bet. */
  totalWinX: number;
}

export type GameMode = 'BASE' | 'FREE_SPINS';

export interface SpinResult {
  mode: GameMode;
  stops: number[];
  window: ReelWindow;
  lineWins: LineWin[];
  scatterWin: number;
  scatterCount: number;
  scatterPositions: [number, number][];
  expandingWin: number;
  expandedReels: number[];
  featureTriggered: boolean;
  freeSpinsAwarded: number;
  /** Set on the spin that triggers the feature from BASE mode. */
  expandingSymbolChosen: SymbolId | null;
  /** Total win of this spin in currency (bet-scaled). */
  totalWin: number;
  betPerLine: number;
  totalBet: number;
  stateAfter: SessionStateSnapshot;
}

export interface SessionStateSnapshot {
  mode: GameMode;
  balance: number;
  freeSpinsRemaining: number;
  totalFreeSpinsWon: number;
  expandingSymbol: SymbolId | null;
  featureTotalWin: number;
  betPerLine: number;
}
