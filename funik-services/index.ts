import express, { type NextFunction, type Request, type Response } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { config } from "./config.js";
import { connectDatabase } from "./db/connect.js";
import registerSockets from "./sockets/socket_manager.js";
import authRoutes from "./routes/auth_routes.js";
import userRoutes from "./routes/user_routes.js";

const app = express();
// Render (and most hosts) sit behind a proxy; needed for correct client IPs in rate limiting.
app.set("trust proxy", 1);
app.use(cors({ origin: config.corsOrigin }));
app.use(express.json({ limit: "10kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", accounts: config.authEnabled });
});

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// Express 5 forwards rejected promises from async handlers here.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if ((err as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON body." });
    return;
  }
  console.error("[HTTP] Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong." });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.corsOrigin,
    methods: ["GET", "POST"],
  },
});

registerSockets(io);

await connectDatabase();

server.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
