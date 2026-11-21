import { Schema, model, type InferSchemaType, type HydratedDocument } from "mongoose";

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;

const statsSchema = new Schema(
  {
    played: { type: Number, default: 0, min: 0 },
    wins: { type: Number, default: 0, min: 0 },
    losses: { type: Number, default: 0, min: 0 },
    draws: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    /** Display form, as the user typed it. */
    username: { type: String, required: true, trim: true, match: USERNAME_PATTERN },
    /** Lowercased copy so "Alice" and "alice" can't both register. */
    usernameKey: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    stats: { type: statsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

// Leaderboard ordering.
userSchema.index({ "stats.wins": -1, "stats.played": 1 });

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export const UserModel = model("User", userSchema);

/** The shape of a user that is safe to send to clients. */
export const toPublicUser = (user: UserDocument) => ({
  id: user.id as string,
  username: user.username,
  stats: {
    played: user.stats?.played ?? 0,
    wins: user.stats?.wins ?? 0,
    losses: user.stats?.losses ?? 0,
    draws: user.stats?.draws ?? 0,
  },
  createdAt: user.createdAt,
});

export type PublicUser = ReturnType<typeof toPublicUser>;
