/**
 * Iterative weight tuner. Grid-searches a small set of par-sheet knobs
 * (royal density, BOOK count, free-spins premium density) against the exact
 * analytic calculator and prints the best candidate count tables to paste
 * into src/core/config/weights.ts. Read-only: it prints, a human commits.
 *
 *   npm run tune -- --profile medium --targetFeature 0.26
 */
import { SymbolId, VolatilityProfile } from '../core/types';
import { StripSetCounts, WEIGHTS } from '../core/config/weights';
import { computeRtp, RtpBreakdown } from './rtpCalc';

const ROYALS = [SymbolId.A, SymbolId.K, SymbolId.Q, SymbolId.J, SymbolId.TEN];
const PREMIUMS = [SymbolId.HORUS, SymbolId.SCARAB, SymbolId.ANKH, SymbolId.PYRAMID];

interface Knobs {
  royalAddBase: number;
  royalAddFs: number;
  bookBase: number;
  fsPharaoh: number;
  fsPremiumSub: number;
}

function applyKnobs(template: StripSetCounts, k: Knobs): StripSetCounts {
  const base = template.base.map((reel) => [...reel]);
  const freeSpins = template.freeSpins.map((reel) => [...reel]);
  for (const reel of base) {
    for (const r of ROYALS) reel[r] += k.royalAddBase;
    reel[SymbolId.BOOK] = k.bookBase;
  }
  for (const reel of freeSpins) {
    for (const r of ROYALS) reel[r] += k.royalAddFs;
    for (const p of PREMIUMS) reel[p] = Math.max(1, reel[p] - k.fsPremiumSub);
    reel[SymbolId.PHARAOH] = k.fsPharaoh;
  }
  return { base, freeSpins };
}

interface Candidate {
  knobs: Knobs;
  counts: StripSetCounts;
  rtp: RtpBreakdown;
  score: number;
}

function tuneProfile(profile: VolatilityProfile, targetFeatureShare: number): Candidate[] {
  const template = WEIGHTS[profile];
  const results: Candidate[] = [];

  for (let royalAddBase = 0; royalAddBase <= 10; royalAddBase++) {
    for (let royalAddFs = 0; royalAddFs <= 14; royalAddFs += 2) {
      for (const bookBase of [2, 3, 4]) {
        for (const fsPharaoh of [1, 2]) {
          for (const fsPremiumSub of [0, 1, 2]) {
            const knobs = { royalAddBase, royalAddFs, bookBase, fsPharaoh, fsPremiumSub };
            const counts = applyKnobs(template, knobs);
            let rtp: RtpBreakdown;
            try {
              rtp = computeRtp(counts);
            } catch {
              continue;
            }
            // Authentic Book-of-Ra-style math: the expanding-symbol feature is
            // expensive, so a 96% game triggers it roughly 1-in-100..220 spins
            // and the base game carries ~55-65% — same shape as the original.
            const featureFreq = 1 / rtp.pTrigger;
            if (featureFreq < 90 || featureFreq > 220) continue;
            const rtpErr = Math.abs(rtp.total - 0.96);
            if (rtpErr > 0.005) continue;
            const shareErr = Math.abs(rtp.feature / rtp.total - targetFeatureShare);
            results.push({ knobs, counts, rtp, score: rtpErr * 100 + shareErr });
          }
        }
      }
    }
  }
  results.sort((a, b) => a.score - b.score);
  return results;
}

function printCandidate(c: Candidate): void {
  const pct = (x: number) => (100 * x).toFixed(3) + '%';
  console.log(
    `  knobs: ${JSON.stringify(c.knobs)}\n` +
      `  RTP ${pct(c.rtp.total)} = line ${pct(c.rtp.lineBase)} + scatter ${pct(c.rtp.scatterBase)} + feature ${pct(c.rtp.feature)}\n` +
      `  feature: 1 in ${(1 / c.rtp.pTrigger).toFixed(1)} spins, ${c.rtp.featureEVPerTrigger.toFixed(1)}x/trigger`,
  );
  console.log('  base:      ' + c.counts.base.map((r) => `[${r.join(', ')}]`).join('\n             '));
  console.log('  freeSpins: ' + c.counts.freeSpins.map((r) => `[${r.join(', ')}]`).join('\n             '));
}

const argv = process.argv.slice(2);
function argOf(name: string, fallback: string): string {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : fallback;
}

const profiles: VolatilityProfile[] =
  argv.includes('--profile') ? [argOf('profile', 'medium') as VolatilityProfile] : ['low', 'medium', 'high'];
const shares: Record<VolatilityProfile, number> = { low: 0.28, medium: 0.35, high: 0.42 };

for (const profile of profiles) {
  const target = Number(argOf('targetFeature', String(shares[profile])));
  console.log(`\n=== Profile: ${profile} (target feature share ${target}) ===`);
  const candidates = tuneProfile(profile, target);
  if (candidates.length === 0) {
    console.log('  No candidate within constraints — widen knob ranges.');
    continue;
  }
  for (const c of candidates.slice(0, 3)) {
    printCandidate(c);
    console.log('');
  }
}
