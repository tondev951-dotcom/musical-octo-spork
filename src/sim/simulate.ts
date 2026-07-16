/**
 * Monte Carlo simulation harness.
 *
 *   npm run simulate -- --spins 5000000 --seed 1234 --volatility medium [--histogram]
 *
 * A "round" = one paid base-game spin plus all free spins it produces.
 * RTP = total returned / total wagered.
 */
import { GameSession } from '../core/session';
import { createSeededRng } from '../core/rng';
import { DEFAULT_CONFIG } from '../core/config/gameConfig';
import { LINE_COUNT } from '../core/lines';
import { VolatilityProfile } from '../core/types';
import { RunningStats, WinHistogram } from './stats';

interface Args {
  spins: number;
  seed: number;
  volatility: VolatilityProfile;
  histogram: boolean;
}

function parseArgs(argv: string[]): Args {
  const args: Args = { spins: 1_000_000, seed: 1234, volatility: 'medium', histogram: false };
  for (let i = 0; i < argv.length; i++) {
    switch (argv[i]) {
      case '--spins':
        args.spins = Number(argv[++i]);
        break;
      case '--seed':
        args.seed = Number(argv[++i]);
        break;
      case '--volatility':
        args.volatility = argv[++i] as VolatilityProfile;
        break;
      case '--histogram':
        args.histogram = true;
        break;
    }
  }
  return args;
}

export interface SimReport {
  spins: number;
  rtp: number;
  rtpBase: number;
  rtpScatter: number;
  rtpFeature: number;
  ci95: number;
  stdPerRound: number;
  hitRate: number;
  featureFreq: number;
  avgFeatureWin: number;
  retriggerRate: number;
  maxWinX: number;
}

export function runSimulation(
  spins: number,
  seed: number,
  volatility: VolatilityProfile,
  histogram?: WinHistogram,
  onProgress?: (done: number) => void,
): SimReport {
  const config = { ...DEFAULT_CONFIG, volatility, startingBalance: 0 };
  const session = new GameSession(createSeededRng(seed), config, volatility);
  session.addBalance(Number.MAX_SAFE_INTEGER / 4);

  const totalBet = session.totalBet;
  const roundStats = new RunningStats();

  let wagered = 0;
  let returnedLineBase = 0;
  let returnedScatterBase = 0;
  let returnedFeature = 0;
  let baseHits = 0;
  let features = 0;
  let retriggers = 0;
  let featureSpins = 0;

  for (let i = 0; i < spins; i++) {
    wagered += totalBet;
    const base = session.spin();

    const lineTotal = base.lineWins.reduce((a, w) => a + w.payout, 0);
    returnedLineBase += (lineTotal / LINE_COUNT) * totalBet;
    returnedScatterBase += base.scatterWin * totalBet;

    let roundWin = base.totalWin;
    if (base.featureTriggered) {
      features++;
      while (session.getState().mode === 'FREE_SPINS') {
        const fs = session.spin();
        featureSpins++;
        if (fs.featureTriggered) retriggers++;
        returnedFeature += fs.totalWin;
        roundWin += fs.totalWin;
      }
    }

    if (base.totalWin > 0) baseHits++;
    roundStats.push(roundWin / totalBet);
    histogram?.push(roundWin / totalBet);

    if (onProgress && (i + 1) % 500_000 === 0) onProgress(i + 1);
  }

  const returned = returnedLineBase + returnedScatterBase + returnedFeature;
  return {
    spins,
    rtp: returned / wagered,
    rtpBase: returnedLineBase / wagered,
    rtpScatter: returnedScatterBase / wagered,
    rtpFeature: returnedFeature / wagered,
    ci95: roundStats.ci95,
    stdPerRound: roundStats.std,
    hitRate: baseHits / spins,
    featureFreq: features > 0 ? spins / features : Infinity,
    avgFeatureWin: features > 0 ? returnedFeature / totalBet / features : 0,
    retriggerRate: featureSpins > 0 ? retriggers / features : 0,
    maxWinX: roundStats.max,
  };
}

const isMain = process.argv[1]?.endsWith('simulate.ts');
if (isMain) {
  const { spins, seed, volatility, histogram } = parseArgs(process.argv.slice(2));
  const hist = histogram ? new WinHistogram() : undefined;
  const t0 = performance.now();
  const r = runSimulation(spins, seed, volatility, hist, (done) =>
    console.log(`  ... ${done.toLocaleString('en-US')} spins`),
  );
  const secs = (performance.now() - t0) / 1000;

  const pct = (x: number) => (100 * x).toFixed(2) + '%';
  console.log('');
  console.log(`Spins: ${spins.toLocaleString('en-US')}   Seed: ${seed}   Profile: ${volatility}`);
  console.log(
    `RTP:            ${pct(r.rtp)}  (base ${pct(r.rtpBase)} | scatter ${pct(r.rtpScatter)} | feature ${pct(r.rtpFeature)})`,
  );
  console.log(
    `95% CI:         ±${pct(r.ci95)}   (per-round σ = ${r.stdPerRound.toFixed(1)}x bet)`,
  );
  console.log(`Hit frequency:  ${pct(r.hitRate)}  (1 in ${(1 / r.hitRate).toFixed(2)} spins)`);
  console.log(
    `Feature freq:   1 in ${r.featureFreq.toFixed(1)} spins   avg feature win: ${r.avgFeatureWin.toFixed(1)}x bet   retriggers/feature: ${r.retriggerRate.toFixed(3)}`,
  );
  console.log(`Max win:        ${r.maxWinX.toFixed(0)}x bet`);
  if (hist) console.log(`Distribution:   ${hist.format(spins)}`);
  console.log(`Throughput:     ${Math.round(spins / secs).toLocaleString('en-US')} spins/s (${secs.toFixed(1)}s)`);
}
