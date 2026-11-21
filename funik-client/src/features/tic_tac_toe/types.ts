export type GameMode = "classic" | "vanishing";

export type Position = [row: number, col: number];

export type RoomPlayer = {
    id: string;
    userId: string | null;
    username: string | null;
}

export type RoomState = {
    players: RoomPlayer[];
    /** Both players are different logged-in accounts, so the result counts toward stats. */
    ranked: boolean;
    mode: GameMode;
    turn: number;
    startingTurn: number;
    board: string[][];
    moves: [Position[], Position[]];
    winner: string | null;
    winningLine: Position[] | null;
    scores: [number, number];
    draws: number;
}

export const GAME_MODE_INFO: Record<GameMode, { label: string, description: string }> = {
    classic: {
        label: "Classic",
        description: "Three in a row wins. Fill the board and it's a draw.",
    },
    vanishing: {
        label: "Vanishing",
        description: "You only keep 3 marks. Your 4th erases your oldest. No draws.",
    },
};

/** Must match VANISHING_MAX_MARKS on the server. */
export const VANISHING_MAX_MARKS = 3;
