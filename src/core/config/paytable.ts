import { SymbolId } from '../types';

/**
 * Line pays in multiples of the LINE bet, indexed by match count (2..5).
 * Leftmost-to-right, highest win per line only. BOOK substitutes as wild.
 */
export const PAYTABLE: Readonly<Record<SymbolId, readonly [number, number, number, number]>> =
  Object.freeze({
    // [2x, 3x, 4x, 5x]
    [SymbolId.BOOK]: [0, 0, 0, 0], // Book pays as scatter only
    [SymbolId.PHARAOH]: [10, 100, 1000, 5000],
    [SymbolId.HORUS]: [5, 40, 400, 2000],
    [SymbolId.SCARAB]: [5, 30, 100, 750],
    [SymbolId.ANKH]: [0, 15, 60, 250],
    [SymbolId.PYRAMID]: [0, 15, 60, 250],
    [SymbolId.A]: [0, 10, 40, 150],
    [SymbolId.K]: [0, 10, 40, 150],
    [SymbolId.Q]: [0, 5, 25, 100],
    [SymbolId.J]: [0, 5, 25, 100],
    [SymbolId.TEN]: [0, 5, 25, 100],
  });

export function linePay(symbol: SymbolId, count: number): number {
  if (count < 2) return 0;
  return PAYTABLE[symbol][Math.min(count, 5) - 2];
}

/**
 * Scatter (BOOK) pays in multiples of the TOTAL bet, indexed by count (3..5).
 */
export const SCATTER_PAYS: readonly number[] = Object.freeze([0, 0, 0, 2, 20, 200]);

export function scatterPay(count: number): number {
  return SCATTER_PAYS[Math.min(count, 5)] ?? 0;
}
