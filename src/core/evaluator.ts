import { GameMode, LineWin, ReelWindow, REELS, ROWS, SpinEvaluation, SymbolId } from './types';
import { PAYLINES, LINE_COUNT } from './lines';
import { linePay, scatterPay } from './config/paytable';

export interface EvalContext {
  mode: GameMode;
  /** Set only during free spins. */
  expandingSymbol: SymbolId | null;
}

const BASE_CONTEXT: EvalContext = { mode: 'BASE', expandingSymbol: null };

/**
 * Best pure-wild line pay for a run of `count` BOOKs: BOOK itself pays 0 on
 * lines, so `count` wilds are worth the best symbol they can substitute —
 * PHARAOH dominates the paytable at every count.
 */
function bestWildPay(count: number): number {
  return linePay(SymbolId.PHARAOH, count);
}

/**
 * Evaluate one payline: leftmost-to-right run with wild (BOOK) substitution,
 * only the highest pay on the line counts.
 */
function evaluateLine(window: ReelWindow, lineIndex: number): LineWin | null {
  const rows = PAYLINES[lineIndex];

  // Count leading wilds.
  let k = 0;
  while (k < REELS && window[k][rows[k]] === SymbolId.BOOK) k++;

  if (k === REELS) {
    // All five wilds: pays as the best possible substitution.
    const payout = bestWildPay(REELS);
    return {
      lineIndex,
      symbol: SymbolId.PHARAOH,
      count: REELS,
      payout,
      positions: rows.map((row, reel) => [reel, row] as [number, number]),
    };
  }

  const target = window[k][rows[k]];
  let n = k + 1;
  while (n < REELS) {
    const s = window[n][rows[n]];
    if (s !== target && s !== SymbolId.BOOK) break;
    n++;
  }

  const naturalPay = linePay(target, n);
  const wildPay = bestWildPay(k);

  if (naturalPay === 0 && wildPay === 0) return null;

  if (naturalPay >= wildPay) {
    return {
      lineIndex,
      symbol: target,
      count: n,
      payout: naturalPay,
      positions: rows.slice(0, n).map((row, reel) => [reel, row] as [number, number]),
    };
  }
  // A shorter run of pure wilds substituting the top symbol pays more.
  return {
    lineIndex,
    symbol: SymbolId.PHARAOH,
    count: k,
    payout: wildPay,
    positions: rows.slice(0, k).map((row, reel) => [reel, row] as [number, number]),
  };
}

export function evaluateWindow(
  window: ReelWindow,
  ctx: EvalContext = BASE_CONTEXT,
): SpinEvaluation {
  const lineWins: LineWin[] = [];
  for (let i = 0; i < LINE_COUNT; i++) {
    const win = evaluateLine(window, i);
    if (win) lineWins.push(win);
  }

  // Scatter: BOOKs anywhere on screen.
  let scatterCount = 0;
  const scatterPositions: [number, number][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    for (let row = 0; row < ROWS; row++) {
      if (window[reel][row] === SymbolId.BOOK) {
        scatterCount++;
        scatterPositions.push([reel, row]);
      }
    }
  }
  const scatterWin = scatterPay(scatterCount);
  const featureTriggered = scatterCount >= 3;

  // Expanding special symbol (free spins only): pays by the NUMBER OF REELS
  // it appears on, positions need not be adjacent or on a payline.
  let expandingWin = 0;
  let expandedReels: number[] = [];
  if (ctx.mode === 'FREE_SPINS' && ctx.expandingSymbol !== null) {
    const reelsWith: number[] = [];
    for (let reel = 0; reel < REELS; reel++) {
      for (let row = 0; row < ROWS; row++) {
        if (window[reel][row] === ctx.expandingSymbol) {
          reelsWith.push(reel);
          break;
        }
      }
    }
    const pay = linePay(ctx.expandingSymbol, reelsWith.length);
    if (pay > 0) {
      expandingWin = pay * LINE_COUNT;
      expandedReels = reelsWith;
    }
  }

  const lineTotal = lineWins.reduce((a, w) => a + w.payout, 0);
  const totalWinX = (lineTotal + expandingWin) / LINE_COUNT + scatterWin;

  return {
    lineWins,
    scatterWin,
    scatterCount,
    scatterPositions,
    featureTriggered,
    expandingWin,
    expandedReels,
    totalWinX,
  };
}
