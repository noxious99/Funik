export const GAME_KEYS = {
    TIC_TAC_TOE: "tic_tac_toe",
    BATTLESHIP: "battle_ship",
} as const;

export const gameObject: Record<string, string> = {
    [GAME_KEYS.TIC_TAC_TOE]: "Tic-Tac-Toe",
    [GAME_KEYS.BATTLESHIP]: "Battle Ship",
}

/** Game ids as stored in match history on the server. */
export const MATCH_GAME_NAMES: Record<string, string> = {
    tic_tac_toe: "Tic-Tac-Toe",
    battleship: "Battle Ship",
}
