/** Shared layout constants for the 1280x720 stage. */
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const CELL_W = 168;
export const CELL_H = 148;
export const REEL_GAP = 8;

export const REELS_LEFT = (GAME_WIDTH - (5 * CELL_W + 4 * REEL_GAP)) / 2;
export const REELS_TOP = 118;

export function reelX(reel: number): number {
  return REELS_LEFT + reel * (CELL_W + REEL_GAP);
}

export function cellCenter(reel: number, row: number): { x: number; y: number } {
  return {
    x: reelX(reel) + CELL_W / 2,
    y: REELS_TOP + row * CELL_H + CELL_H / 2,
  };
}
