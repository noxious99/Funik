import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { isDatabaseReady } from "../db/connect.js";
import { verifyToken, type AuthUser } from "./jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

const readBearerToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  return header?.startsWith("Bearer ") ? header.slice("Bearer ".length).trim() : null;
};

/** Rejects requests when accounts are unavailable (no database configured or not connected). */
export const requireDatabase = (_req: Request, res: Response, next: NextFunction) => {
  if (!config.authEnabled || !isDatabaseReady()) {
    res.status(503).json({ error: "Accounts are currently unavailable." });
    return;
  }
  next();
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const user = verifyToken(readBearerToken(req));
  if (!user) {
    res.status(401).json({ error: "You need to be logged in." });
    return;
  }
  req.user = user;
  next();
};
