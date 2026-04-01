import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

router.post("/auth/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
  if (!user || !verifyPassword(password, user.password)) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account disabled" });
    return;
  }

  (req.session as Record<string, unknown>).userId = user.id;

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
  });
});

router.post("/auth/logout", (req, res): void => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
  });
});

router.patch("/auth/update-profile", async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { name, email, phone, avatar } = req.body ?? {};
  const updateData: Record<string, unknown> = {};
  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (avatar !== undefined) updateData.avatar = avatar;

  const [user] = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, userId))
    .returning();

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
  });
});

router.post("/auth/change-password", async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { currentPassword, newPassword } = req.body ?? {};
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: "Current and new password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || !verifyPassword(currentPassword, user.password)) {
    res.status(400).json({ error: "Current password is incorrect" });
    return;
  }

  await db
    .update(usersTable)
    .set({ password: hashPassword(newPassword) })
    .where(eq(usersTable.id, userId));

  res.json({ success: true });
});

router.post("/auth/change-username", async (req, res): Promise<void> => {
  const userId = (req.session as Record<string, unknown>).userId as number | undefined;
  if (!userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { newUsername, password } = req.body ?? {};
  if (!newUsername || !password) {
    res.status(400).json({ error: "New username and password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user || !verifyPassword(password, user.password)) {
    res.status(400).json({ error: "Password is incorrect" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.username, newUsername));
  if (existing) {
    res.status(400).json({ error: "Username already taken" });
    return;
  }

  const [updated] = await db
    .update(usersTable)
    .set({ username: newUsername })
    .where(eq(usersTable.id, userId))
    .returning();

  res.json({
    id: updated.id,
    username: updated.username,
    name: updated.name,
    email: updated.email ?? null,
    phone: updated.phone ?? null,
    avatar: updated.avatar ?? null,
    role: updated.role,
  });
});

export default router;
