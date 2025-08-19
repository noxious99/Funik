import { Server, Socket } from "socket.io";
import ticTacToeSocket from "./tictactoe_socket.js";
export default function registerSockets(io) {
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);
        socket.emit("your_player_id", socket.id);
        socket.broadcast.emit("other_player_id", socket.id);
        ticTacToeSocket(io, socket);
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });
}
//# sourceMappingURL=socket_manager.js.map