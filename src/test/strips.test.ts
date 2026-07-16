import { describe, expect, it } from 'vitest';
import { buildStrips } from '../core/config/reelStrips';
import { WEIGHTS, SYMBOL_COUNT } from '../core/config/weights';
import { VolatilityProfile } from '../core/types';

const PROFILES: VolatilityProfile[] = ['low', 'medium', 'high'];

describe('reel strips', () => {
  for (const profile of PROFILES) {
    it(`${profile}: generated strips match the count tables exactly`, () => {
      const strips = buildStrips(profile);
      const counts = WEIGHTS[profile];
      for (const [set, table] of [
        [strips.base, counts.base],
        [strips.freeSpins, counts.freeSpins],
      ] as const) {
        for (let reel = 0; reel < 5; reel++) {
          const seen = new Array(SYMBOL_COUNT).fill(0);
          for (const s of set[reel]) seen[s]++;
          expect(seen).toEqual(table[reel]);
        }
      }
    });

    it(`${profile}: no two identical symbols are circularly adjacent`, () => {
      const strips = buildStrips(profile);
      for (const set of [strips.base, strips.freeSpins]) {
        for (const strip of set) {
          for (let i = 0; i < strip.length; i++) {
            expect(strip[i]).not.toBe(strip[(i + 1) % strip.length]);
          }
        }
      }
    });
  }

  it('is deterministic (same profile → identical strips)', () => {
    expect(buildStrips('medium')).toEqual(buildStrips('medium'));
  });
});
