/**
 * Xoshiro128** — fast, seedable 128-bit-state PRNG.
 * int(n) uses rejection sampling to avoid modulo bias.
 */
export interface Rng {
  /** Uniform integer in [0, n). */
  int(n: number): number;
  /** Uniform float in [0, 1). */
  float(): number;
}

function splitmix32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x9e3779b9) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 16), 0x21f0aaad);
    t = Math.imul(t ^ (t >>> 15), 0x735a2d97);
    return (t ^ (t >>> 15)) >>> 0;
  };
}

export class Xoshiro128 implements Rng {
  private s0: number;
  private s1: number;
  private s2: number;
  private s3: number;

  constructor(seed: number) {
    const sm = splitmix32(seed >>> 0);
    this.s0 = sm();
    this.s1 = sm();
    this.s2 = sm();
    this.s3 = sm();
    // Avoid the all-zero state (astronomically unlikely, but cheap to guard).
    if ((this.s0 | this.s1 | this.s2 | this.s3) === 0) this.s0 = 1;
  }

  /** Raw 32-bit unsigned output. */
  next(): number {
    const r = Math.imul(this.s1 * 5, 1) >>> 0;
    const result = ((((r << 7) | (r >>> 25)) * 9) | 0) >>> 0;
    const t = (this.s1 << 9) >>> 0;
    this.s2 ^= this.s0;
    this.s3 ^= this.s1;
    this.s1 ^= this.s2;
    this.s0 ^= this.s3;
    this.s2 ^= t;
    this.s3 = ((this.s3 << 11) | (this.s3 >>> 21)) >>> 0;
    return result;
  }

  float(): number {
    return this.next() / 4294967296;
  }

  int(n: number): number {
    if (n <= 0 || !Number.isInteger(n)) throw new Error(`int(n): n must be a positive integer, got ${n}`);
    if (n > 4294967296) throw new Error('int(n): n too large for 32-bit sampling');
    // Rejection sampling: discard values above the largest multiple of n.
    const limit = 4294967296 - (4294967296 % n);
    let v = this.next();
    while (v >= limit) v = this.next();
    return v % n;
  }
}

/** Seeded RNG for simulation / tests. */
export function createSeededRng(seed: number): Rng {
  return new Xoshiro128(seed);
}

/** Crypto-seeded RNG for the browser game. */
export function createCryptoSeededRng(): Rng {
  let seed: number;
  const g = globalThis as { crypto?: Crypto };
  if (g.crypto?.getRandomValues) {
    const buf = new Uint32Array(1);
    g.crypto.getRandomValues(buf);
    seed = buf[0];
  } else {
    seed = (Math.floor(Math.random() * 4294967296)) >>> 0;
  }
  return new Xoshiro128(seed);
}
