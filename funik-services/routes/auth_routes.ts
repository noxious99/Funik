import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { UserModel, USERNAME_PATTERN, toPublicUser } from "../models/user_model.js";
import { signToken } from "../auth/jwt.js";
import { requireAuth, requireDatabase } from "../auth/middleware.js";

const BCRYPT_ROUNDS = 12;
const PASSWORD_MIN = 8;
// bcrypt only uses the first 72 bytes of a password.
const PASSWORD_MAX = 72;
// Compared against when the username doesn't exist, so response timing doesn't reveal which usernames are taken.
const DUMMY_HASH = bcrypt.hashSync("funik-timing-guard", BCRYPT_ROUNDS);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in a few minutes." },
});

const readCredentials = (body: unknown) => {
  const { username, password } = (body ?? {}) as Record<string, unknown>;
  return {
    username: typeof username === "string" ? username.trim() : "",
    password: typeof password === "string" ? password : "",
  };
};

const router = Router();
router.use(requireDatabase);

router.post("/register", authLimiter, async (req, res) => {
  const { username, password } = readCredentials(req.body);

  if (!USERNAME_PATTERN.test(username)) {
    res.status(400).json({ error: "Username must be 3-20 characters: letters, numbers or underscores." });
    return;
  }
  if (password.length < PASSWORD_MIN || Buffer.byteLength(password) > PASSWORD_MAX) {
    res.status(400).json({ error: `Password must be ${PASSWORD_MIN}-${PASSWORD_MAX} characters.` });
    return;
  }

  const usernameKey = username.toLowerCase();
  if (await UserModel.exists({ usernameKey })) {
    res.status(409).json({ error: "That username is already taken." });
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({ username, usernameKey, passwordHash });
    res.status(201).json({ token: signToken({ id: user.id, username: user.username }), user: toPublicUser(user) });
  } catch (err) {
    // Lost a race with another registration for the same name.
    if ((err as { code?: number }).code === 11000) {
      res.status(409).json({ error: "That username is already taken." });
      return;
    }
    throw err;
  }
});

router.post("/login", authLimiter, async (req, res) => {
  const { username, password } = readCredentials(req.body);

  const user = username
    ? await UserModel.findOne({ usernameKey: username.toLowerCase() }).select("+passwordHash")
    : null;
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);

  if (!user || !passwordMatches) {
    res.status(401).json({ error: "Invalid username or password." });
    return;
  }

  res.json({ token: signToken({ id: user.id, username: user.username }), user: toPublicUser(user) });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await UserModel.findById(req.user!.id);
  if (!user) {
    res.status(401).json({ error: "Account no longer exists." });
    return;
  }
  res.json({ user: toPublicUser(user) });
});

export default router;
