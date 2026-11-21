import dotenv from "dotenv";

dotenv.config();

const mongoUri = process.env.MONGODB_URI?.trim() || "";
const jwtSecret = process.env.JWT_SECRET?.trim() || "";

if (mongoUri && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be set to at least 32 characters when MONGODB_URI is configured.");
}

export const config = {
  port: Number(process.env.PORT) || 8000,
  // Comma-separated list of allowed origins, e.g. "https://funik.vercel.app,http://localhost:5173".
  // Falls back to allowing any origin when unset.
  corsOrigin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
    : "*" as const,
  mongoUri,
  jwtSecret,
  jwtExpiresIn: "7d",
  /** Accounts, stats and the leaderboard need a database; without one the server runs guest-only. */
  authEnabled: Boolean(mongoUri),
};
