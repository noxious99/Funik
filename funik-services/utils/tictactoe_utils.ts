export type Cell = "" | "X" | "O";

export type Board = [
  [Cell, Cell, Cell],
  [Cell, Cell, Cell],
  [Cell, Cell, Cell]
];

export type Position = [row: number, col: number];

const WINNING_LINES: Position[][] = [
  // rows
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  // columns
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  // diagonals
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

export const createEmptyBoard = (): Board => [
  ["", "", ""],
  ["", "", ""],
  ["", "", ""],
];

/** Returns the winning symbol and the line that won, or null if nobody has won. */
export const findWinner = (board: Board): { symbol: Cell; line: Position[] } | null => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line.map(([r, col]) => board[r]![col]!);
    if (a && a === b && b === c) {
      return { symbol: a, line };
    }
  }
  return null;
};

export const isBoardFull = (board: Board): boolean =>
  board.every((row) => row.every((cell) => cell !== ""));
