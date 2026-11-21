import { Server, Socket } from "socket.io";
import { battleshipManager } from "./gameManager/battleship_manager.js";
import { recordMatch } from "../services/match_service.js";
import type { AuthUser } from "../auth/jwt.js";

const isValidRoomId = (roomId: unknown): roomId is string =>
  typeof roomId === "string" && roomId.trim().length > 0 && roomId.length <= 64;

// Socket.IO rooms are shared across games, so namespace them to avoid clashing with tic-tac-toe room ids.
const channel = (roomId: string) => `battleship:${roomId}`;

export default function battleshipSocket(io: Server, socket: Socket) {
  /** Each player gets their own view, since ship positions are secret. */
  const broadcast = (roomId: string) => {
    const room = battleshipManager.getRoom(roomId);
    if (!room) return;
    for (const player of room.players) {
      io.to(player.id).emit("bs_state", battleshipManager.viewFor(room, player.id));
    }
  };

  socket.on("bs_join", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const user: AuthUser | null = socket.data.user ?? null;
    const room = battleshipManager.joinRoom(roomId, {
      id: socket.id,
      userId: user?.id ?? null,
      username: user?.username ?? null,
    });
    if (!room) {
      socket.emit("bs_room_full", roomId);
      return;
    }

    socket.join(channel(roomId));
    console.log(`[Battleship][${roomId}] Players:`, room.players.map((p) => p.username ?? `guest:${p.id}`));
    broadcast(roomId);
  });

  socket.on("bs_place", (roomId: unknown, fleet: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const result = battleshipManager.placeFleet(roomId, socket.id, fleet);
    if ("error" in result) {
      socket.emit("bs_error", result.error);
      return;
    }
    if (result.room.phase === "battle") {
      console.log(`[Battleship][${roomId}] Battle started`);
    }
    broadcast(roomId);
  });

  socket.on("bs_unready", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;
    if (battleshipManager.unready(roomId, socket.id)) broadcast(roomId);
  });

  socket.on("bs_fire", (roomId: unknown, row: unknown, col: unknown) => {
    if (!isValidRoomId(roomId)) return;

    const result = battleshipManager.fire(roomId, socket.id, row, col);
    if (!result) return;
    broadcast(roomId);

    const { room, finished } = result;
    if (finished && room.ranked) {
      console.log(`[Battleship][${roomId}] Winner:`, room.players[room.winner!]?.username);
      recordMatch({
        game: "battleship",
        mode: "classic",
        players: room.players.map((p) => ({ userId: p.userId!, username: p.username! })),
        winnerIndex: room.winner,
      }).catch((err) => console.error("[Battleship] Failed to record match:", err));
    }
  });

  socket.on("bs_rematch", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;
    if (battleshipManager.rematch(roomId, socket.id)) broadcast(roomId);
  });

  socket.on("bs_leave", (roomId: unknown) => {
    if (!isValidRoomId(roomId)) return;

    socket.leave(channel(roomId));
    if (battleshipManager.leaveRoom(roomId, socket.id)) broadcast(roomId);
  });

  socket.on("disconnect", () => {
    battleshipManager.removePlayer(socket.id).forEach(broadcast);
  });
}
