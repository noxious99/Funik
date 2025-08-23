import { Server, Socket } from "socket.io";
import { gameManager } from "./gameManager/tictactoe_manager.js";
export default function ticTacToeSocket(io, socket) {
    socket.on("join_game_one", (roomId) => {
        socket.join(roomId);
        const room = gameManager.joinRoom(roomId, socket.id);
        if (!room)
            return;
        console.log(`[${roomId}] Players:`, room.players);
        socket.emit("room_state", room);
        socket.to(roomId).emit("player joined", socket.id);
    });
    socket.on("player_move", (roomId, row, col) => {
        const room = gameManager.makeMove(roomId, socket.id, row, col);
        if (!room) {
            console.log("Invalid move:", { roomId, player: socket.id, row, col });
            return;
        }
        console.log("[TicTacToe] Move made:", {
            player: socket.id,
            symbol: room.turn === 1 ? "X" : "O",
            position: [row, col],
            winner: room.winner,
            nextTurn: room.turn
        });
        io.to(roomId).emit("room_state", room);
    });
    socket.on("reset_game", (roomId) => {
        const room = gameManager.resetGame(roomId, socket.id);
        if (!room)
            return;
        console.log("[TicTacToe] Game reset by:", socket.id);
        io.to(roomId).emit("room_state", room);
    });
    socket.on("disconnect", () => {
        console.log(`[TicTacToe] Socket ${socket.id} disconnected`);
        const affectedRooms = gameManager.removePlayer(socket.id);
        affectedRooms.forEach(roomId => {
            const room = gameManager.getRoom(roomId);
            if (room) {
                io.to(roomId).emit("player_disconnected", socket.id);
                io.to(roomId).emit("room_state", room);
            }
        });
    });
}
//# sourceMappingURL=tictactoe_socket.js.map