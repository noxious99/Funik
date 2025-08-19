import { Server, Socket } from "socket.io";

export default function ticTacToeSocket(io: Server, socket: Socket) {
  socket.on("player_move", (game_state, playerTurn, result) => {
    console.log("[TicTacToe] move:", game_state, playerTurn);
    socket.broadcast.emit("player_move", game_state, playerTurn, result);
  });
}
