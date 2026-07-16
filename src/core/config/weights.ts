import { SymbolId, VolatilityProfile } from '../types';

/**
 * Per-reel symbol COUNT tables — the par sheet. All probability in the game
 * lives here: strips are generated from these counts and stops are uniform.
 *
 * counts[reel][symbolId] = number of occurrences of that symbol on that
 * reel's strip. Strip length = sum of the column.
 *
 * Order of symbols follows SymbolId:
 * BOOK, PHARAOH, HORUS, SCARAB, ANKH, PYRAMID, A, K, Q, J, TEN
 *
 * Values below are the TUNED tables (see src/sim/tune.ts). Target: 96.0% RTP
 * per profile; volatility changes the distribution shape, not the mean.
 */
export interface StripSetCounts {
  /** counts[reel][symbol] for the base game. */
  base: number[][];
  /** counts[reel][symbol] for free spins. */
  freeSpins: number[][];
}

export const WEIGHTS: Record<VolatilityProfile, StripSetCounts> = {
  //             BOOK PHA HOR SCA ANK PYR  A   K   Q   J  TEN
  low: {
    base: [
      [3, 1, 2, 3, 5, 5, 16, 16, 17, 17, 16],
      [3, 1, 2, 3, 5, 5, 16, 16, 17, 17, 16],
      [3, 1, 2, 3, 5, 5, 16, 16, 17, 17, 16],
      [3, 1, 2, 3, 5, 5, 16, 16, 17, 17, 16],
      [3, 1, 2, 3, 5, 5, 16, 16, 17, 17, 16],
    ],
    freeSpins: [
      [2, 2, 2, 3, 5, 5, 17, 17, 17, 17, 17],
      [2, 2, 2, 3, 5, 5, 17, 17, 17, 17, 17],
      [2, 2, 2, 3, 5, 5, 17, 17, 17, 17, 17],
      [2, 2, 2, 3, 5, 5, 17, 17, 17, 17, 17],
      [2, 2, 2, 3, 5, 5, 17, 17, 17, 17, 17],
    ],
  },
  medium: {
    base: [
      [3, 2, 3, 3, 4, 4, 16, 16, 17, 17, 16],
      [3, 2, 3, 3, 4, 4, 16, 16, 17, 17, 16],
      [3, 2, 2, 3, 4, 4, 16, 16, 17, 17, 17],
      [3, 2, 2, 3, 4, 4, 16, 16, 17, 17, 17],
      [3, 2, 2, 3, 4, 4, 16, 16, 17, 17, 17],
    ],
    freeSpins: [
      [2, 2, 3, 4, 4, 4, 6, 6, 6, 6, 6],
      [2, 2, 3, 4, 4, 4, 6, 6, 6, 6, 6],
      [2, 2, 3, 3, 4, 4, 6, 6, 7, 7, 6],
      [2, 2, 3, 3, 4, 4, 6, 6, 7, 7, 6],
      [2, 2, 3, 3, 4, 4, 6, 6, 7, 7, 6],
    ],
  },
  high: {
    base: [
      [3, 3, 3, 3, 4, 4, 16, 16, 17, 17, 17],
      [3, 3, 3, 3, 4, 4, 16, 16, 17, 17, 17],
      [3, 2, 2, 3, 4, 4, 17, 17, 18, 18, 18],
      [3, 2, 2, 3, 4, 4, 17, 17, 18, 18, 18],
      [3, 2, 2, 3, 4, 4, 17, 17, 18, 18, 18],
    ],
    freeSpins: [
      [2, 1, 2, 3, 3, 3, 12, 12, 12, 12, 12],
      [2, 1, 2, 3, 3, 3, 12, 12, 12, 12, 12],
      [2, 1, 2, 2, 3, 3, 12, 12, 13, 13, 13],
      [2, 1, 2, 2, 3, 3, 12, 12, 13, 13, 13],
      [2, 1, 2, 2, 3, 3, 12, 12, 13, 13, 13],
    ],
  },
};

export const SYMBOL_COUNT = 11;

export function assertCountTable(counts: number[][]): void {
  if (counts.length !== 5) throw new Error('count table must have 5 reels');
  for (const reel of counts) {
    if (reel.length !== SYMBOL_COUNT) {
      throw new Error(`each reel needs ${SYMBOL_COUNT} symbol counts`);
    }
    if (reel[SymbolId.BOOK] < 1) throw new Error('every reel needs at least one BOOK');
    for (const c of reel) {
      if (c < 0 || !Number.isInteger(c)) throw new Error('counts must be non-negative integers');
    }
  }
}
