import { Server, Socket } from "socket.io";
export default function ticTacToeSocket(io, socket) {
    socket.on("player_move", (game_state, playerTurn, result) => {
        console.log("[TicTacToe] move:", game_state, playerTurn);
        socket.broadcast.emit("player_move", game_state, playerTurn, result);
    });
}
//# sourceMappingURL=tictactoe_socket.js.map