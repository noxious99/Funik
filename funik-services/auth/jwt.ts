import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type AuthUser = {
  id: string;
  username: string;
};

export const signToken = (user: AuthUser): string =>
  jwt.sign({ username: user.username }, config.jwtSecret, {
    subject: user.id,
    expiresIn: config.jwtExpiresIn as jwt.SignOptions["expiresIn"] & string,
  });

/** Returns the user encoded in the token, or null if it is missing, invalid or expired. */
export const verifyToken = (token: unknown): AuthUser | null => {
  if (!config.authEnabled || typeof token !== "string" || !token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
    if (typeof payload === "string" || !payload.sub || typeof payload.username !== "string") return null;
    return { id: payload.sub, username: payload.username };
  } catch {
    return null;
  }
};
