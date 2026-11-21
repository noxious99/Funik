import { Server, Socket } from "socket.io";
import ticTacToeSocket from "./tictactoe_socket.js";
import battleshipSocket from "./battleship_socket.js";
import { verifyToken } from "../auth/jwt.js";


export default function registerSockets(io: Server) {
  // Attach the logged-in user, if any. Invalid or missing tokens just connect as a guest.
  io.use((socket, next) => {
    socket.data.user = verifyToken(socket.handshake.auth?.token);
    next();
  });

  io.on("connection", (socket: Socket) => {
    console.log("User connected:", socket.id, socket.data.user?.username ?? "(guest)");

    ticTacToeSocket(io, socket);
    battleshipSocket(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
}
