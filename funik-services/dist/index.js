import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // React frontend port
        methods: ["GET", "POST"]
    }
});
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    socket.emit("your_player_id", socket.id);
    socket.broadcast.emit("other_player_id", socket.id);
    socket.on('player_move', (game_state, playerTurn, result) => {
        console.log('player_move:', game_state, playerTurn);
        socket.broadcast.emit('player_move', game_state, playerTurn, result); // send to all except sender
    });
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map