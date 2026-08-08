import type { NextFunction, Request, Response } from "express";
import { getAuth } from "@clerk/express";

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  next();
}

export function getRequiredUserId(req: Request): string {
  const userId = getAuth(req).userId;
  if (!userId) throw new Error("Authentication required");
  return userId;
}