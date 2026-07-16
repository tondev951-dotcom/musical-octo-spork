import { describe, expect, it } from 'vitest';
import { evaluateWindow } from '../core/evaluator';
import { ReelWindow, SymbolId } from '../core/types';
import { LINE_COUNT } from '../core/lines';

const { BOOK, PHARAOH, HORUS, ANKH, Q, TEN, K, A, J, SCARAB } = SymbolId;

/** Build a window from per-reel columns (row 0 = top). */
function win(...reels: [SymbolId, SymbolId, SymbolId][]): ReelWindow {
  return reels.map((r) => [...r]);
}

/** Window whose middle row is `line`, other rows filled with junk that can't pay. */
function midRow(line: SymbolId[]): ReelWindow {
  // Alternate junk so no accidental vertical/diagonal line forms.
  const junk = [A, K, J, A, K];
  const junk2 = [Q, TEN, Q, TEN, Q];
  return line.map((s, i) => [junk[i], s, junk2[i]]);
}

describe('line evaluation', () => {
  it('pays leftmost-to-right only', () => {
    // Q Q A Q Q on the middle line: only 2 leftmost Qs, and Q pays from 3 → nothing.
    const r = evaluateWindow(midRow([Q, Q, A, Q, Q]));
    expect(r.lineWins.filter((w) => w.lineIndex === 0)).toHaveLength(0);
  });

  it('pays a natural 3-of-a-kind on the middle line', () => {
    const r = evaluateWindow(midRow([HORUS, HORUS, HORUS, Q, TEN]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.symbol).toBe(HORUS);
    expect(w.count).toBe(3);
    expect(w.payout).toBe(40);
    expect(w.positions).toEqual([
      [0, 1],
      [1, 1],
      [2, 1],
    ]);
  });

  it('wild (BOOK) substitutes inside a run', () => {
    const r = evaluateWindow(midRow([PHARAOH, BOOK, PHARAOH, Q, TEN]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.symbol).toBe(PHARAOH);
    expect(w.count).toBe(3);
    expect(w.payout).toBe(100);
  });

  it('takes the higher of natural run vs pure-wild-prefix substitution', () => {
    // BOOK BOOK TEN...: natural TEN x3 pays 5, but 2 wilds as PHARAOH pay 10.
    const r = evaluateWindow(midRow([BOOK, BOOK, TEN, Q, A]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.symbol).toBe(PHARAOH);
    expect(w.count).toBe(2);
    expect(w.payout).toBe(10);
  });

  it('prefers the natural run when it pays more', () => {
    // BOOK BOOK ANKH...: ANKH x3 = 15 > wild-pair-as-PHARAOH = 10.
    const r = evaluateWindow(midRow([BOOK, BOOK, ANKH, Q, A]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.symbol).toBe(ANKH);
    expect(w.count).toBe(3);
    expect(w.payout).toBe(15);
  });

  it('pays premium 2-of-a-kind', () => {
    const r = evaluateWindow(midRow([PHARAOH, PHARAOH, Q, A, K]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.payout).toBe(10);
  });

  it('five wilds pay as five PHARAOH', () => {
    const r = evaluateWindow(midRow([BOOK, BOOK, BOOK, BOOK, BOOK]));
    const w = r.lineWins.find((x) => x.lineIndex === 0)!;
    expect(w.payout).toBe(5000);
    expect(w.count).toBe(5);
  });

  it('evaluates diagonal payline geometry (line 4: V shape)', () => {
    const w = win(
      [SCARAB, A, K],
      [Q, SCARAB, TEN],
      [K, A, SCARAB],
      [J, SCARAB, Q],
      [SCARAB, K, A],
    );
    const r = evaluateWindow(w);
    const v = r.lineWins.find((x) => x.lineIndex === 3)!; // rows 0,1,2,1,0
    expect(v.symbol).toBe(SCARAB);
    expect(v.count).toBe(5);
    expect(v.payout).toBe(750);
  });
});

describe('scatter evaluation', () => {
  it('counts BOOKs anywhere, including two on one reel', () => {
    const w = win(
      [BOOK, A, BOOK],
      [Q, K, TEN],
      [K, BOOK, J],
      [J, A, Q],
      [TEN, K, A],
    );
    const r = evaluateWindow(w);
    expect(r.scatterCount).toBe(3);
    expect(r.scatterWin).toBe(2);
    expect(r.featureTriggered).toBe(true);
  });

  it('two scatters pay nothing and do not trigger', () => {
    const w = win(
      [BOOK, A, K],
      [Q, BOOK, TEN],
      [K, A, J],
      [J, A, Q],
      [TEN, K, A],
    );
    const r = evaluateWindow(w);
    expect(r.scatterWin).toBe(0);
    expect(r.featureTriggered).toBe(false);
  });
});

describe('expanding symbol (free spins)', () => {
  const ctx = { mode: 'FREE_SPINS' as const, expandingSymbol: HORUS };

  it('pays by reel count regardless of position/adjacency', () => {
    // HORUS present on reels 0, 2, 4 in scattered rows.
    const w = win(
      [HORUS, A, K],
      [Q, K, TEN],
      [K, A, HORUS],
      [J, A, Q],
      [TEN, HORUS, A],
    );
    const r = evaluateWindow(w, ctx);
    expect(r.expandedReels).toEqual([0, 2, 4]);
    expect(r.expandingWin).toBe(40 * LINE_COUNT); // HORUS x3 on all 10 lines
  });

  it('does not pay below the symbol minimum count', () => {
    // Q needs 3 reels; only 2 here.
    const w = win(
      [Q, A, K],
      [K, Q, TEN],
      [K, A, J],
      [J, A, HORUS],
      [TEN, K, A],
    );
    const r = evaluateWindow(w, { mode: 'FREE_SPINS', expandingSymbol: Q });
    expect(r.expandingWin).toBe(0);
    expect(r.expandedReels).toEqual([]);
  });

  it('never pays in base mode', () => {
    const w = win(
      [HORUS, A, K],
      [Q, HORUS, TEN],
      [K, A, HORUS],
      [J, HORUS, Q],
      [TEN, HORUS, A],
    );
    const r = evaluateWindow(w);
    expect(r.expandingWin).toBe(0);
  });
});

describe('totals', () => {
  it('totalWinX combines lines, expanding and scatter in total-bet units', () => {
    const w = midRow([HORUS, HORUS, HORUS, Q, TEN]); // 40 line-bets on middle line
    const r = evaluateWindow(w);
    expect(r.totalWinX).toBeCloseTo(40 / LINE_COUNT);
  });
});
