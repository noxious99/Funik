import { Schema, model, type InferSchemaType } from "mongoose";

const matchPlayerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    /** Snapshot of the username at the time the match was played. */
    username: { type: String, required: true },
    /** Tic-tac-toe only. */
    symbol: { type: String, enum: ["X", "O"] },
  },
  { _id: false }
);

const matchSchema = new Schema(
  {
    game: { type: String, required: true, enum: ["tic_tac_toe", "battleship"] },
    mode: { type: String, required: true, enum: ["classic", "vanishing"] },
    players: { type: [matchPlayerSchema], required: true },
    /** Null for a draw. */
    winner: { type: Schema.Types.ObjectId, ref: "User", default: null },
    /** Game-specific result label (tic-tac-toe: "X" | "O" | "draw"). */
    result: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// A user's match history, newest first.
matchSchema.index({ "players.user": 1, createdAt: -1 });

export type Match = InferSchemaType<typeof matchSchema>;

export const MatchModel = model("Match", matchSchema);
