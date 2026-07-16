/** Welford online mean/variance — no per-sample storage. */
export class RunningStats {
  n = 0;
  mean = 0;
  private m2 = 0;
  max = -Infinity;

  push(x: number): void {
    this.n++;
    const delta = x - this.mean;
    this.mean += delta / this.n;
    this.m2 += delta * (x - this.mean);
    if (x > this.max) this.max = x;
  }

  get variance(): number {
    return this.n > 1 ? this.m2 / (this.n - 1) : 0;
  }

  get std(): number {
    return Math.sqrt(this.variance);
  }

  /** Half-width of the 95% confidence interval of the mean. */
  get ci95(): number {
    return this.n > 1 ? (1.96 * this.std) / Math.sqrt(this.n) : Infinity;
  }
}

/** Fixed-edge histogram of win multipliers (in units of total bet). */
export class WinHistogram {
  /** Upper edges; last bucket is open-ended. */
  static readonly EDGES = [0, 1, 5, 20, 100];
  readonly counts = new Array(WinHistogram.EDGES.length + 1).fill(0);

  push(x: number): void {
    if (x <= 0) {
      this.counts[0]++;
      return;
    }
    for (let i = 1; i < WinHistogram.EDGES.length; i++) {
      if (x <= WinHistogram.EDGES[i]) {
        this.counts[i]++;
        return;
      }
    }
    this.counts[this.counts.length - 1]++;
  }

  format(total: number): string {
    const labels = ['0x', '(0,1]x', '(1,5]x', '(5,20]x', '(20,100]x', '>100x'];
    return labels
      .map((l, i) => `${l}: ${((100 * this.counts[i]) / total).toFixed(2)}%`)
      .join('  ');
  }
}
