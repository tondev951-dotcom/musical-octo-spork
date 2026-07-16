import type { VolatilityProfile } from '../types';
import { LINE_COUNT } from '../lines';

export interface GameConfig {
  lineCount: number;
  /** Selectable bet-per-line levels (currency units). */
  betLevels: readonly number[];
  defaultBetLevelIndex: number;
  startingBalance: number;
  freeSpinsAwarded: number;
  /** Minimum scatters to trigger the feature. */
  scatterTriggerCount: number;
  volatility: VolatilityProfile;
}

export const DEFAULT_CONFIG: GameConfig = Object.freeze({
  lineCount: LINE_COUNT,
  betLevels: [0.1, 0.2, 0.5, 1, 2, 5, 10],
  defaultBetLevelIndex: 3,
  startingBalance: 1000,
  freeSpinsAwarded: 10,
  scatterTriggerCount: 3,
  volatility: 'medium' as VolatilityProfile,
});
