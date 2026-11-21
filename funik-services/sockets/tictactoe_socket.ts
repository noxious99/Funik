import { Server, Socket } from "socket.io";
import { gameManager, isGameMode } from "./gameManager/tictactoe_manager.js";
import { recordTicTacToeMatch } from "../services/match_service.js";
import type { AuthUser } from "../auth/jwt.js";

const isValidRoomId = (roomId: unknown): roomId is string =>
  typeof roomId === "string" && roomId.trim().length > 0 && roomId.length <= 64;

export default function ticTacToeSocket(io: Server, socket: Socket) {

  socket.on("join_game_one", (roomId: unknown, mode: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const user: AuthUser | null = socket.data.user ?? null;
    const room = gameManager.joinRoom(
      roomId,
      { id: socket.id, userId: user?.id ?? null, username: user?.username ?? null },
      isGameMode(mode) ? mode : "classic"
    );
    if (!room) {
      socket.emit("room_full", roomId);
      return;
    }

    socket.join(roomId);
    console.log(`[TicTacToe][${roomId}] Players:`, room.players.map((p) => p.username ?? `guest:${p.id}`));

    io.to(roomId).emit("room_state", room);
  });

  socket.on("player_move", (roomId: unknown, row: unknown, col: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const room = gameManager.makeMove(roomId, socket.id, row, col);
    if (!room) {
      console.log("[TicTacToe] Invalid move:", { roomId, player: socket.id, row, col });
      return;
    }

    console.log("[TicTacToe] Move made:", {
      player: socket.id,
      position: [row, col],
      winner: room.winner,
      nextTurn: room.turn
    });

    io.to(roomId).emit("room_state", room);

    // Moves after a round ends are rejected, so a winner here means this move finished the round.
    if (room.winner) {
      recordTicTacToeMatch(room).catch((err) => console.error("[TicTacToe] Failed to record match:", err));
    }
  });

  socket.on("reset_game", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const room = gameManager.resetGame(roomId, socket.id);
    if (!room) return;

    console.log("[TicTacToe] Game reset by:", socket.id);
    io.to(roomId).emit("room_state", room);
  });

  socket.on("set_mode", (roomId: unknown, mode: unknown) => {
    if (!isValidRoomId(roomId) || !isGameMode(mode)) return;

    const room = gameManager.setMode(roomId, socket.id, mode);
    if (!room) return;

    console.log(`[TicTacToe][${roomId}] Mode set to ${mode} by:`, socket.id);
    io.to(roomId).emit("room_state", room);
  });

  socket.on("leave_game", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;

    socket.leave(roomId);
    const room = gameManager.leaveRoom(roomId, socket.id);
    if (room) {
      io.to(roomId).emit("room_state", room);
    }
  });

  socket.on("disconnect", () => {
    const affectedRooms = gameManager.removePlayer(socket.id);

    affectedRooms.forEach(roomId => {
      const room = gameManager.getRoom(roomId);
      if (room) {
        io.to(roomId).emit("room_state", room);
      }
    });
  });
}
