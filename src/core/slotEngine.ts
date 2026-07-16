import { ReelWindow, REELS, ROWS, SymbolId } from './types';
import { Rng } from './rng';

/**
 * One RNG draw per reel selects a uniform stop index on the circular strip;
 * the visible window is the 3 symbols starting at that index. This is the
 * entire source of randomness in the game — identical for the browser game
 * and the Monte Carlo simulation.
 */
export function spinReels(
  strips: SymbolId[][],
  rng: Rng,
): { stops: number[]; window: ReelWindow } {
  const stops = new Array<number>(REELS);
  const window: ReelWindow = new Array(REELS);
  for (let reel = 0; reel < REELS; reel++) {
    const strip = strips[reel];
    const stop = rng.int(strip.length);
    stops[reel] = stop;
    const col = new Array<SymbolId>(ROWS);
    for (let row = 0; row < ROWS; row++) {
      col[row] = strip[(stop + row) % strip.length];
    }
    window[reel] = col;
  }
  return { stops, window };
}
