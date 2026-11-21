import mongoose from "mongoose";
import { config } from "../config.js";

export async function connectDatabase(): Promise<void> {
  if (!config.mongoUri) {
    console.warn("[DB] MONGODB_URI is not set: accounts, stats and leaderboard are disabled (guest-only mode).");
    return;
  }

  mongoose.connection.on("error", (err) => console.error("[DB] Connection error:", err));
  mongoose.connection.on("disconnected", () => console.warn("[DB] Disconnected"));

  await mongoose.connect(config.mongoUri);
  console.log("[DB] Connected to MongoDB");
}

export const isDatabaseReady = (): boolean => mongoose.connection.readyState === 1;
