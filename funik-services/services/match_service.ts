import { isDatabaseReady } from "../db/connect.js";
import { MatchModel } from "../models/match_model.js";
import { UserModel } from "../models/user_model.js";
import type { RoomState } from "../sockets/gameManager/tictactoe_manager.js";

const SYMBOLS = ["X", "O"] as const;

type MatchInput = {
  game: "tic_tac_toe" | "battleship";
  mode: string;
  players: { userId: string; username: string; symbol?: "X" | "O" }[];
  /** Index into `players`, or null for a draw. */
  winnerIndex: number | null;
  /** Game-specific result label, e.g. "X" / "O" / "draw" for tic-tac-toe. */
  result?: string;
};

/**
 * Persists a finished match and updates every player's stats.
 * Callers only record ranked games (two different logged-in accounts); guest games are casual.
 */
export async function recordMatch({ game, mode, players, winnerIndex, result }: MatchInput): Promise<void> {
  if (!isDatabaseReady()) return;

  const winner = winnerIndex === null ? null : players[winnerIndex] ?? null;

  await MatchModel.create({
    game,
    mode,
    players: players.map(({ userId, username, symbol }) => ({ user: userId, username, symbol })),
    winner: winner?.userId ?? null,
    result,
  });

  await UserModel.bulkWrite(players.map((player) => {
    const outcome = !winner ? "stats.draws" : winner.userId === player.userId ? "stats.wins" : "stats.losses";
    return {
      updateOne: {
        filter: { _id: player.userId },
        update: { $inc: { "stats.played": 1, [outcome]: 1 } },
      },
    };
  }));
}

export async function recordTicTacToeMatch(room: RoomState): Promise<void> {
  if (!room.winner || !room.ranked) return;

  const winnerIndex = room.winner === "draw" ? null : SYMBOLS.indexOf(room.winner as "X" | "O");
  await recordMatch({
    game: "tic_tac_toe",
    mode: room.mode,
    players: room.players.map((player, index) => ({
      userId: player.userId!,
      username: player.username!,
      symbol: SYMBOLS[index]!,
    })),
    winnerIndex,
    result: room.winner,
  });
}
