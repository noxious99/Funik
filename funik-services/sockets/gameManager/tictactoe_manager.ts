import { checkDraw, checkWinner } from "../../utils/tictactoe_utils.js"
import type { Board } from "../../utils/tictactoe_utils.js";

type RoomState = {
    players: string[];
    turn: number;
    board: Board;
    winner: string | null;
}

class TicTacToeGameManager {
    private rooms: Record<string, RoomState> = {};
    private emptyBoard(): Board {
        return [["", "", ""], ["", "", ""], ["", "", ""]];
    }
    createRoom(roomId: string): RoomState {
        if (!this.rooms[roomId]) {
            this.rooms[roomId] = {
                players: [],
                turn: 0,
                board: this.emptyBoard(),
                winner: null,
            };
        }
        return this.rooms[roomId];
    }

    joinRoom(roomId: string, playerId: string): RoomState | null {
        const room = this.createRoom(roomId);
        if (room.players.length < 2 && !room.players.includes(playerId)) {
            room.players.push(playerId);
        }

        return room;
    }

    makeMove(roomId: string, playerId: string, row: number, col: number): RoomState | null {
        const room = this.rooms[roomId];
        if (!room) return null;
        if (room.players.length < 2) return null

        const currentPlayer = room.players[room.turn];
        if (playerId !== currentPlayer || room.winner || room.board[row]![col] !== "") {
            return null;
        }

        const symbol = room.turn === 0 ? "X" : "O";
        room.board[row]![col] = symbol;

        const winner = checkWinner(room.board);
        if (winner) {
            room.winner = winner;
        } else if (checkDraw(room.board)) {
            room.winner = "draw";
        } else {
            room.turn = (room.turn + 1) % 2;
        }

        return room;
    }

    resetGame(roomId: string, playerId: string): RoomState | null {
        const room = this.rooms[roomId];
        if (!room || !room.players.includes(playerId)) return null;

        room.board = [["", "", ""], ["", "", ""], ["", "", ""]];
        room.winner = null;
        room.turn = 0;

        return room;
    }

    removePlayer(playerId: string): string[] {
        const affectedRooms: string[] = [];

        for (const roomId in this.rooms) {
            const room = this.rooms[roomId];
            if (!room) continue
            const playerIndex: number | undefined = room.players.indexOf(playerId);

            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                affectedRooms.push(roomId);

                if (room.players.length === 0) {
                    delete this.rooms[roomId];
                }
            }
        }

        return affectedRooms;
    }

    getRoom(roomId: string): RoomState | null {
        return this.rooms[roomId] || null;
    }
}

export const gameManager = new TicTacToeGameManager();