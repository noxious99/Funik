import { Router } from "express";
import { UserModel, toPublicUser } from "../models/user_model.js";
import { MatchModel } from "../models/match_model.js";
import { requireDatabase } from "../auth/middleware.js";

const LEADERBOARD_SIZE = 25;
const RECENT_MATCHES = 20;

const winRate = (stats: { wins: number; played: number }) =>
  stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

const router = Router();
router.use(requireDatabase);

router.get("/leaderboard", async (_req, res) => {
  const users = await UserModel.find({ "stats.played": { $gt: 0 } })
    .sort({ "stats.wins": -1, "stats.losses": 1, "stats.played": 1, createdAt: 1 })
    .limit(LEADERBOARD_SIZE);

  res.json({
    players: users.map((user, index) => {
      const publicUser = toPublicUser(user);
      return { rank: index + 1, ...publicUser, winRate: winRate(publicUser.stats) };
    }),
  });
});

router.get("/users/:username", async (req, res) => {
  const user = await UserModel.findOne({ usernameKey: req.params.username.toLowerCase() });
  if (!user) {
    res.status(404).json({ error: "Player not found." });
    return;
  }

  const matches = await MatchModel.find({ "players.user": user._id })
    .sort({ createdAt: -1 })
    .limit(RECENT_MATCHES)
    .lean();

  const publicUser = toPublicUser(user);
  res.json({
    user: { ...publicUser, winRate: winRate(publicUser.stats) },
    matches: matches.map((match) => {
      const me = match.players.find((p) => p.user.equals(user._id));
      const opponent = match.players.find((p) => !p.user.equals(user._id));
      return {
        id: String(match._id),
        game: match.game,
        mode: match.mode,
        symbol: me?.symbol ?? null,
        opponent: opponent?.username ?? "Unknown",
        outcome: !match.winner ? "draw" : match.winner.equals(user._id) ? "win" : "loss",
        playedAt: match.createdAt,
      };
    }),
  });
});

export default router;
