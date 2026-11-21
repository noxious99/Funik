import type { PlacedShip, Shot } from './fleet';

export type BattleshipPhase = "placing" | "battle" | "finished";

/** The server's per-player view; enemy ships only appear once sunk or the game is over. */
export type BattleshipView = {
    phase: BattleshipPhase
    ranked: boolean
    you: number
    players: { username: string | null, userId: string | null, ready: boolean }[]
    turn: number
    winner: number | null
    scores: [number, number]
    myFleet: PlacedShip[] | null
    myShots: Shot[]
    enemyShots: Shot[]
    revealedEnemyShips: PlacedShip[]
}
