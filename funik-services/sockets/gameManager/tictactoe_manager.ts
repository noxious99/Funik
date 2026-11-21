import { createEmptyBoard, findWinner, isBoardFull } from "../../utils/tictactoe_utils.js";
import type { Board, Position } from "../../utils/tictactoe_utils.js";
import { isRanked, type RoomPlayer } from "./room_player.js";

export type { RoomPlayer };

const MAX_PLAYERS = 2;
const SYMBOLS = ["X", "O"] as const;
/** In "vanishing" mode each player keeps at most this many marks; placing another removes their oldest. */
const VANISHING_MAX_MARKS = 3;

export const GAME_MODES = ["classic", "vanishing"] as const;
export type GameMode = typeof GAME_MODES[number];

export type RoomState = {
    players: RoomPlayer[];
    /** True when both players are different logged-in accounts, so results count toward stats. */
    ranked: boolean;
    mode: GameMode;
    /** Index into `players` of whose turn it is. Player 0 is always "X". */
    turn: number;
    /** Who opened the current round; alternates every round. */
    startingTurn: number;
    board: Board;
    /** Positions each player has marked, oldest first. */
    moves: [Position[], Position[]];
    winner: string | null;
    winningLine: Position[] | null;
    /** Rounds won, indexed like `players`. */
    scores: [number, number];
    draws: number;
}

const hasPlayer = (room: RoomState, playerId: string) =>
    room.players.some((p) => p.id === playerId);

const isValidIndex = (value: unknown): value is number =>
    Number.isInteger(value) && (value as number) >= 0 && (value as number) < 3;

export const isGameMode = (value: unknown): value is GameMode =>
    GAME_MODES.includes(value as GameMode);

class TicTacToeGameManager {
    private rooms: Record<string, RoomState> = {};

    private startRound(room: RoomState, startingTurn: number) {
        room.board = createEmptyBoard();
        room.moves = [[], []];
        room.winner = null;
        room.winningLine = null;
        room.startingTurn = startingTurn;
        room.turn = startingTurn;
    }

    private getOrCreateRoom(roomId: string, mode: GameMode): RoomState {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                players: [],
                ranked: false,
                mode,
                turn: 0,
                startingTurn: 0,
                board: createEmptyBoard(),
                moves: [[], []],
                winner: null,
                winningLine: null,
                scores: [0, 0],
                draws: 0,
            };
        }
        return this.rooms[roomId];
    }

    /** Returns the room, or null if the room is already full. `mode` only applies when the room is new. */
    joinRoom(roomId: string, player: RoomPlayer, mode: GameMode = "classic"): RoomState | null {
        const room = this.getOrCreateRoom(roomId, mode);
        if (hasPlayer(room, player.id)) return room;
        if (room.players.length >= MAX_PLAYERS) return null;

        room.players.push(player);
        room.ranked = isRanked(room.players);
        return room;
    }

    makeMove(roomId: string, playerId: string, row: unknown, col: unknown): RoomState | null {
        const room = this.rooms[roomId];
        if (!room || room.players.length < MAX_PLAYERS || room.winner) return null;
        if (!isValidIndex(row) || !isValidIndex(col)) return null;
        if (playerId !== room.players[room.turn]?.id || room.board[row]![col] !== "") return null;

        const symbol = SYMBOLS[room.turn]!;
        const myMoves = room.moves[room.turn as 0 | 1];

        if (room.mode === "vanishing" && myMoves.length >= VANISHING_MAX_MARKS) {
            const [oldRow, oldCol] = myMoves.shift()!;
            room.board[oldRow]![oldCol] = "";
        }
        room.board[row]![col] = symbol;
        myMoves.push([row, col]);

        const result = findWinner(room.board);
        if (result) {
            room.winner = result.symbol;
            room.winningLine = result.line;
            room.scores[room.turn as 0 | 1] += 1;
        } else if (isBoardFull(room.board)) {
            room.winner = "draw";
            room.draws += 1;
        } else {
            room.turn = (room.turn + 1) % MAX_PLAYERS;
        }

        return room;
    }

    /** Starts the next round, giving the other player the first move. */
    resetGame(roomId: string, playerId: string): RoomState | null {
        const room = this.rooms[roomId];
        if (!room || !hasPlayer(room, playerId)) return null;

        this.startRound(room, (room.startingTurn + 1) % MAX_PLAYERS);
        return room;
    }

    /** Switches the room's mode. Only allowed between rounds or before any move is made. */
    setMode(roomId: string, playerId: string, mode: GameMode): RoomState | null {
        const room = this.rooms[roomId];
        if (!room || !hasPlayer(room, playerId)) return null;
        const roundInProgress = !room.winner && room.moves.some((m) => m.length > 0);
        if (roundInProgress || room.mode === mode) return null;

        room.mode = mode;
        // A finished round hands the first move over, same as starting the next round.
        this.startRound(room, room.winner ? (room.startingTurn + 1) % MAX_PLAYERS : room.startingTurn);
        return room;
    }

    /** Removes the player from a single room. Returns the room if it still exists. */
    leaveRoom(roomId: string, playerId: string): RoomState | null {
        const room = this.rooms[roomId];
        if (!room) return null;

        const playerIndex = room.players.findIndex((p) => p.id === playerId);
        if (playerIndex === -1) return room;

        room.players.splice(playerIndex, 1);
        room.ranked = false;
        if (room.players.length === 0) {
            delete this.rooms[roomId];
            return null;
        }

        // The remaining player becomes "X" and starts fresh once someone new joins.
        room.scores = [0, 0];
        room.draws = 0;
        this.startRound(room, 0);
        return room;
    }

    /** Removes the player from every room they are in. Returns the affected room ids. */
    removePlayer(playerId: string): string[] {
        const affectedRooms: string[] = [];

        for (const [roomId, room] of Object.entries(this.rooms)) {
            if (hasPlayer(room, playerId)) {
                this.leaveRoom(roomId, playerId);
                affectedRooms.push(roomId);
            }
        }

        return affectedRooms;
    }

    getRoom(roomId: string): RoomState | null {
        return this.rooms[roomId] ?? null;
    }
}

export const gameManager = new TicTacToeGameManager();
