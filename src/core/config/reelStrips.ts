import { SymbolId, VolatilityProfile } from '../types';
import { StripSetCounts, WEIGHTS, SYMBOL_COUNT, assertCountTable } from './weights';

export interface StripSet {
  base: SymbolId[][];
  freeSpins: SymbolId[][];
}

/**
 * Deterministically lay one reel strip out of a symbol-count column using
 * largest-remainder ("ideal position") spacing: each symbol's occurrences are
 * spread at even fractional intervals with a per-symbol phase, rarest symbols
 * placed first so they get the best spacing (this is what keeps the two BOOKs
 * ~half a strip apart). Followed by a local repair pass that guarantees no two
 * identical symbols are circularly adjacent.
 */
export function buildStrip(counts: number[], reelIndex: number): SymbolId[] {
  const len = counts.reduce((a, b) => a + b, 0);
  const strip: (SymbolId | null)[] = new Array(len).fill(null);

  const entries = counts
    .map((count, sym) => ({ sym: sym as SymbolId, count }))
    .filter((e) => e.count > 0)
    .sort((a, b) => a.count - b.count || a.sym - b.sym);

  entries.forEach((e, order) => {
    // Deterministic per-symbol/per-reel phase so reels aren't clones of each other.
    const phase = ((reelIndex * 13 + order * 7 + e.sym * 3) % len) + 0.5;
    for (let k = 0; k < e.count; k++) {
      const ideal = Math.floor(phase + (k * len) / e.count) % len;
      // Nearest free slot, scanning outward.
      let placed = -1;
      for (let d = 0; d < len; d++) {
        const fwd = (ideal + d) % len;
        if (strip[fwd] === null) {
          placed = fwd;
          break;
        }
        const back = (ideal - d + len) % len;
        if (strip[back] === null) {
          placed = back;
          break;
        }
      }
      strip[placed] = e.sym;
    }
  });

  const result = strip as SymbolId[];
  repairAdjacency(result);
  validateStrip(result, counts);
  return result;
}

/** Swap-based repair: eliminate circularly adjacent identical symbols. */
function repairAdjacency(strip: SymbolId[]): void {
  const len = strip.length;
  const conflict = (i: number) =>
    strip[i] === strip[(i + 1) % len] || strip[i] === strip[(i - 1 + len) % len];

  for (let pass = 0; pass < 4; pass++) {
    let fixedAll = true;
    for (let i = 0; i < len; i++) {
      if (strip[i] !== strip[(i + 1) % len]) continue;
      fixedAll = false;
      // Find a swap target j for position i that resolves both spots.
      for (let j = 0; j < len; j++) {
        if (strip[j] === strip[i]) continue;
        const a = strip[i];
        const b = strip[j];
        strip[i] = b;
        strip[j] = a;
        if (!conflict(i) && !conflict(j) && !conflict((i + 1) % len)) break;
        strip[i] = a;
        strip[j] = b;
      }
    }
    if (fixedAll) return;
  }
}

function validateStrip(strip: SymbolId[], counts: number[]): void {
  const len = strip.length;
  const seen = new Array(SYMBOL_COUNT).fill(0);
  for (const s of strip) seen[s]++;
  for (let sym = 0; sym < SYMBOL_COUNT; sym++) {
    if (seen[sym] !== counts[sym]) {
      throw new Error(`strip count mismatch for symbol ${sym}: ${seen[sym]} != ${counts[sym]}`);
    }
  }
  for (let i = 0; i < len; i++) {
    if (strip[i] === strip[(i + 1) % len]) {
      throw new Error(`identical adjacent symbols at strip position ${i}`);
    }
  }
}

export function buildStripSet(counts: StripSetCounts): StripSet {
  assertCountTable(counts.base);
  assertCountTable(counts.freeSpins);
  return {
    base: counts.base.map((c, r) => buildStrip(c, r)),
    freeSpins: counts.freeSpins.map((c, r) => buildStrip(c, r)),
  };
}

export function buildStrips(profile: VolatilityProfile): StripSet {
  return buildStripSet(WEIGHTS[profile]);
}
