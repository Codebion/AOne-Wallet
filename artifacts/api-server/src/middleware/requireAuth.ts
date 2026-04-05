import type { Request, Response, NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = (req.session as Record<string, unknown>).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  next();
}

export function getUserId(req: Request): number {
  return (req.session as Record<string, unknown>).userId as number;
}
