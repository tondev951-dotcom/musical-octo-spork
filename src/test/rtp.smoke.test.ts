import { describe, expect, it } from 'vitest';
import { runSimulation } from '../sim/simulate';
import { computeRtp } from '../sim/rtpCalc';
import { WEIGHTS } from '../core/config/weights';

/**
 * Fast catastrophic-regression guards. The full acceptance run is
 * `npm run simulate -- --spins 5000000` per profile; this keeps CI quick.
 */
describe('RTP smoke', () => {
  it('analytic RTP is 96.0% ± 0.5% for every profile', () => {
    for (const profile of ['low', 'medium', 'high'] as const) {
      const r = computeRtp(WEIGHTS[profile]);
      expect(r.total).toBeGreaterThan(0.955);
      expect(r.total).toBeLessThan(0.965);
    }
  });

  it('200k seeded spins land inside a loose band around the analytic value', () => {
    const sim = runSimulation(200_000, 4242, 'medium');
    expect(sim.rtp).toBeGreaterThan(0.88);
    expect(sim.rtp).toBeLessThan(1.04);
    // Structural sanity, not statistical precision:
    expect(sim.hitRate).toBeGreaterThan(0.2);
    expect(sim.hitRate).toBeLessThan(0.45);
    expect(sim.featureFreq).toBeGreaterThan(90);
    expect(sim.featureFreq).toBeLessThan(260);
  });
});
