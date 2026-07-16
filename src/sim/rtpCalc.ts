/**
 * Exact analytic RTP calculator.
 *
 * Because each reel stop is uniform on a circular strip and reels are
 * independent, base-game line and scatter EV are computable in closed form.
 * The free-spins feature EV is also analytic: per-spin EV is closed-form and
 * expected total spins under retriggers follows the Galton-Watson total
 * progeny mean N = awarded / (1 - awarded * p_retrigger).
 *
 *   npm run calc [-- --volatility medium]
 */
import { SymbolId, EXPANDABLE_SYMBOLS, REELS, ROWS, VolatilityProfile } from '../core/types';
import { linePay, scatterPay } from '../core/config/paytable';
import { DEFAULT_CONFIG } from '../core/config/gameConfig';
import { buildStripSet } from '../core/config/reelStrips';
import { WEIGHTS, SYMBOL_COUNT, StripSetCounts } from '../core/config/weights';

function bestWildPay(count: number): number {
  return linePay(SymbolId.PHARAOH, count);
}

/** Marginal per-row symbol probabilities per reel: counts / strip length. */
function symbolProbs(strips: SymbolId[][]): number[][] {
  return strips.map((strip) => {
    const p = new Array(SYMBOL_COUNT).fill(0);
    for (const s of strip) p[s] += 1 / strip.length;
    return p;
  });
}

/**
 * Exact EV of ONE payline in line-bet units. All 10 lines are identical
 * (row marginals are uniform on a circular strip), so total line EV in
 * total-bet units equals this value.
 */
export function lineEV(strips: SymbolId[][]): number {
  const p = symbolProbs(strips);
  const w = p.map((reel) => reel[SymbolId.BOOK]);

  let ev = 0;

  // All five wilds.
  ev += w.reduce((a, b) => a * b, 1) * bestWildPay(REELS);

  // k leading wilds (0..4), first natural symbol X at reel k, run continues j reels.
  for (let k = 0; k < REELS; k++) {
    let pPrefix = 1;
    for (let r = 0; r < k; r++) pPrefix *= w[r];

    for (const X of EXPANDABLE_SYMBOLS) {
      const pStart = pPrefix * p[k][X];
      for (let j = 0; j <= REELS - 1 - k; j++) {
        const n = k + 1 + j;
        let pRun = pStart;
        for (let r = k + 1; r <= k + j; r++) pRun *= p[r][X] + w[r];
        if (n < REELS) pRun *= 1 - p[n][X] - w[n];
        const pay = Math.max(linePay(X, n), bestWildPay(k));
        ev += pRun * pay;
      }
    }
  }
  return ev;
}

/**
 * Per-reel distribution of BOOK count in the 3-row window, enumerated over
 * every stop of the actual strip (adjacency on the strip matters here).
 */
function bookWindowDist(strip: SymbolId[]): number[] {
  const dist = new Array(ROWS + 1).fill(0);
  const len = strip.length;
  for (let stop = 0; stop < len; stop++) {
    let c = 0;
    for (let row = 0; row < ROWS; row++) {
      if (strip[(stop + row) % len] === SymbolId.BOOK) c++;
    }
    dist[c] += 1 / len;
  }
  return dist;
}

/** Distribution of total BOOKs on screen: convolution across 5 reels. */
export function scatterCountDist(strips: SymbolId[][]): number[] {
  let total = [1];
  for (const strip of strips) {
    const d = bookWindowDist(strip);
    const next = new Array(total.length + ROWS).fill(0);
    for (let a = 0; a < total.length; a++) {
      for (let b = 0; b <= ROWS; b++) {
        next[a + b] += total[a] * d[b];
      }
    }
    total = next;
  }
  return total;
}

export function scatterEV(strips: SymbolId[][]): { ev: number; pTrigger: number } {
  const dist = scatterCountDist(strips);
  let ev = 0;
  let pTrigger = 0;
  for (let c = 0; c < dist.length; c++) {
    ev += dist[c] * scatterPay(c);
    if (c >= DEFAULT_CONFIG.scatterTriggerCount) pTrigger += dist[c];
  }
  return { ev, pTrigger };
}

/** P(the 3-row window of a reel contains symbol s), enumerated per strip. */
function windowContainsProb(strip: SymbolId[], s: SymbolId): number {
  const len = strip.length;
  let hits = 0;
  for (let stop = 0; stop < len; stop++) {
    for (let row = 0; row < ROWS; row++) {
      if (strip[(stop + row) % len] === s) {
        hits++;
        break;
      }
    }
  }
  return hits / len;
}

/**
 * EV of the expanding-symbol pay per free spin for a given special symbol,
 * in TOTAL-BET units (pay × lineCount line-bets = pay total-bets).
 */
export function expandingEV(strips: SymbolId[][], s: SymbolId): number {
  const q = strips.map((strip) => windowContainsProb(strip, s));
  // Distribution of the number of reels containing s.
  let dist = [1];
  for (const qr of q) {
    const next = new Array(dist.length + 1).fill(0);
    for (let c = 0; c < dist.length; c++) {
      next[c] += dist[c] * (1 - qr);
      next[c + 1] += dist[c] * qr;
    }
    dist = next;
  }
  let ev = 0;
  for (let c = 0; c < dist.length; c++) ev += dist[c] * linePay(s, c);
  return ev;
}

export interface RtpBreakdown {
  lineBase: number;
  scatterBase: number;
  pTrigger: number;
  featureEVPerTrigger: number;
  feature: number;
  total: number;
  expectedFeatureSpins: number;
}

export function computeRtp(counts: StripSetCounts): RtpBreakdown {
  const strips = buildStripSet(counts);

  const lineBase = lineEV(strips.base);
  const { ev: scatterBase, pTrigger } = scatterEV(strips.base);

  // Free spins: per-spin EV.
  const fsLine = lineEV(strips.freeSpins);
  const { ev: fsScatter, pTrigger: pRetrigger } = scatterEV(strips.freeSpins);
  const fsExpanding =
    EXPANDABLE_SYMBOLS.reduce((a, s) => a + expandingEV(strips.freeSpins, s), 0) /
    EXPANDABLE_SYMBOLS.length;

  const awarded = DEFAULT_CONFIG.freeSpinsAwarded;
  const offspring = awarded * pRetrigger;
  if (offspring >= 1) throw new Error('retrigger rate too high: infinite expected free spins');
  const expectedFeatureSpins = awarded / (1 - offspring);

  const featureEVPerTrigger = expectedFeatureSpins * (fsLine + fsScatter + fsExpanding);
  const feature = pTrigger * featureEVPerTrigger;

  return {
    lineBase,
    scatterBase,
    pTrigger,
    featureEVPerTrigger,
    feature,
    total: lineBase + scatterBase + feature,
    expectedFeatureSpins,
  };
}

const isMain = process.argv[1]?.endsWith('rtpCalc.ts');
if (isMain) {
  const argv = process.argv.slice(2);
  const vIdx = argv.indexOf('--volatility');
  const profiles: VolatilityProfile[] =
    vIdx >= 0 ? [argv[vIdx + 1] as VolatilityProfile] : ['low', 'medium', 'high'];

  const pct = (x: number) => (100 * x).toFixed(3) + '%';
  for (const profile of profiles) {
    const r = computeRtp(WEIGHTS[profile]);
    console.log(`Profile: ${profile}`);
    console.log(`  RTP total:      ${pct(r.total)}`);
    console.log(
      `  Breakdown:      line ${pct(r.lineBase)} + scatter ${pct(r.scatterBase)} + feature ${pct(r.feature)}`,
    );
    console.log(
      `  Feature:        P(trigger) = ${pct(r.pTrigger)} (1 in ${(1 / r.pTrigger).toFixed(1)} spins), EV/trigger = ${r.featureEVPerTrigger.toFixed(2)}x bet, E[spins] = ${r.expectedFeatureSpins.toFixed(2)}`,
    );
  }
}
