/**
 * 10 paylines, Novomatic-style. Each entry is the row index (0 = top)
 * per reel, left to right.
 */
export const PAYLINES: readonly (readonly number[])[] = [
  [1, 1, 1, 1, 1], // 1: middle
  [0, 0, 0, 0, 0], // 2: top
  [2, 2, 2, 2, 2], // 3: bottom
  [0, 1, 2, 1, 0], // 4: V
  [2, 1, 0, 1, 2], // 5: inverted V
  [1, 0, 0, 0, 1], // 6
  [1, 2, 2, 2, 1], // 7
  [0, 0, 1, 2, 2], // 8
  [2, 2, 1, 0, 0], // 9
  [1, 2, 1, 0, 1], // 10
];

export const LINE_COUNT = PAYLINES.length;
