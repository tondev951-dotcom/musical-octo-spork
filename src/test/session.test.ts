import { describe, expect, it } from 'vitest';
import { GameSession } from '../core/session';
import { createSeededRng } from '../core/rng';
import { DEFAULT_CONFIG } from '../core/config/gameConfig';

function newSession(seed = 1) {
  return new GameSession(createSeededRng(seed), DEFAULT_CONFIG, 'medium');
}

/** Spin until the feature triggers (bankroll topped up as needed). */
function spinToTrigger(session: GameSession, maxSpins = 100000) {
  for (let i = 0; i < maxSpins; i++) {
    if (session.getState().balance < session.totalBet) session.addBalance(10000);
    const r = session.spin();
    if (r.featureTriggered && r.mode === 'BASE') return r;
  }
  throw new Error('no trigger found');
}

describe('GameSession', () => {
  it('debits the bet and credits wins in base mode', () => {
    const s = newSession();
    const before = s.getState().balance;
    const r = s.spin();
    expect(s.getState().balance).toBeCloseTo(before - r.totalBet + r.totalWin, 6);
  });

  it('trigger awards exactly the configured free spins and picks a symbol', () => {
    const s = newSession(3);
    const r = spinToTrigger(s);
    expect(r.freeSpinsAwarded).toBe(DEFAULT_CONFIG.freeSpinsAwarded);
    expect(r.expandingSymbolChosen).not.toBeNull();
    const st = s.getState();
    expect(st.mode).toBe('FREE_SPINS');
    expect(st.freeSpinsRemaining).toBe(10);
    expect(st.expandingSymbol).toBe(r.expandingSymbolChosen);
  });

  it('free spins do not debit the balance', () => {
    const s = newSession(3);
    spinToTrigger(s);
    const before = s.getState().balance;
    const fs = s.spin();
    expect(fs.mode).toBe('FREE_SPINS');
    expect(s.getState().balance).toBeCloseTo(before + fs.totalWin, 6);
  });

  it('feature runs to completion and returns to base', () => {
    const s = newSession(3);
    spinToTrigger(s);
    let guard = 0;
    while (s.getState().mode === 'FREE_SPINS') {
      s.spin();
      if (++guard > 1000) throw new Error('feature never ended');
    }
    const st = s.getState();
    expect(st.mode).toBe('BASE');
    expect(st.expandingSymbol).toBeNull();
    expect(st.freeSpinsRemaining).toBe(0);
  });

  it('retrigger stacks spins and keeps the expanding symbol', () => {
    // Search seeds for a retrigger to keep the test deterministic.
    for (let seed = 1; seed < 300; seed++) {
      const s = newSession(seed);
      const trigger = spinToTrigger(s, 20000);
      while (s.getState().mode === 'FREE_SPINS') {
        const before = s.getState().freeSpinsRemaining;
        const fs = s.spin();
        if (fs.featureTriggered) {
          expect(fs.freeSpinsAwarded).toBe(10);
          expect(s.getState().freeSpinsRemaining).toBe(before - 1 + 10);
          expect(s.getState().expandingSymbol).toBe(trigger.expandingSymbolChosen);
          return;
        }
      }
    }
    throw new Error('no retrigger found across seeds');
  });

  it('replays identically for the same seed', () => {
    const a = newSession(77);
    const b = newSession(77);
    for (let i = 0; i < 2000; i++) {
      if (a.getState().balance < a.totalBet) {
        a.addBalance(10000);
        b.addBalance(10000);
      }
      const ra = a.spin();
      const rb = b.spin();
      expect(ra.stops).toEqual(rb.stops);
      expect(ra.totalWin).toBe(rb.totalWin);
    }
  });

  it('rejects bet changes during free spins and invalid bet levels', () => {
    const s = newSession(3);
    expect(() => s.setBetPerLine(123)).toThrow();
    s.setBetPerLine(2);
    expect(s.totalBet).toBe(20);
    spinToTrigger(s);
    expect(() => s.setBetPerLine(1)).toThrow();
  });
});
