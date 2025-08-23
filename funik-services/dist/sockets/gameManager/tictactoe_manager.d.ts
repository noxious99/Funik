import type { Board } from "../../utils/tictactoe_utils.js";
type RoomState = {
    players: string[];
    turn: number;
    board: Board;
    winner: string | null;
};
declare class TicTacToeGameManager {
    private rooms;
    private emptyBoard;
    createRoom(roomId: string): RoomState;
    joinRoom(roomId: string, playerId: string): RoomState | null;
    makeMove(roomId: string, playerId: string, row: number, col: number): RoomState | null;
    resetGame(roomId: string, playerId: string): RoomState | null;
    removePlayer(playerId: string): string[];
    getRoom(roomId: string): RoomState | null;
}
export declare const gameManager: TicTacToeGameManager;
export {};
//# sourceMappingURL=tictactoe_manager.d.ts.map