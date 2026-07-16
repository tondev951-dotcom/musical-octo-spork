import { describe, expect, it } from 'vitest';
import { createSeededRng, Xoshiro128 } from '../core/rng';

describe('Xoshiro128**', () => {
  it('is deterministic per seed', () => {
    const a = createSeededRng(123);
    const b = createSeededRng(123);
    for (let i = 0; i < 1000; i++) expect(a.int(50)).toBe(b.int(50));
  });

  it('differs across seeds', () => {
    const a = createSeededRng(1);
    const b = createSeededRng(2);
    const seqA = Array.from({ length: 20 }, () => a.int(1000));
    const seqB = Array.from({ length: 20 }, () => b.int(1000));
    expect(seqA).not.toEqual(seqB);
  });

  it('int(n) stays in range', () => {
    const rng = createSeededRng(7);
    for (let i = 0; i < 10000; i++) {
      const v = rng.int(51);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(51);
    }
  });

  it('int(n) is uniform (chi-square over 50 bins)', () => {
    const rng = createSeededRng(42);
    const bins = 50;
    const n = 500000;
    const counts = new Array(bins).fill(0);
    for (let i = 0; i < n; i++) counts[rng.int(bins)]++;
    const expected = n / bins;
    let chi2 = 0;
    for (const c of counts) chi2 += ((c - expected) * (c - expected)) / expected;
    // df = 49; 99.9th percentile ≈ 85.4. Seeded, so not flaky.
    expect(chi2).toBeLessThan(85.4);
  });

  it('rejects invalid n', () => {
    const rng = new Xoshiro128(1);
    expect(() => rng.int(0)).toThrow();
    expect(() => rng.int(-5)).toThrow();
    expect(() => rng.int(2.5)).toThrow();
  });
});
