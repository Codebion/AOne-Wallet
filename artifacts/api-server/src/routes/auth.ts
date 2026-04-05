import { Router, type IRouter } from "express";
import { eq, or } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { hashPassword, verifyPassword } from "../lib/auth";

const router: IRouter = Router();

function userResponse(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    email: user.email ?? null,
    phone: user.phone ?? null,
    avatar: user.avatar ?? null,
    role: user.role,
  };
}

router.get("/create-admin", async (req, res) => {
  const existing = await db.select().from(usersTable).where(eq(usersTable.username, "admin"));
  if (existing.length > 0) return res.send("Admin already exists");

  await db.insert(usersTable).values({
    username: "admin",
    password: hashPassword("Admin@123"),
    name: "Admin",
    role: "admin",
    isActive: true,
  });

  res.send("Admin created");
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const { name, email, phone, password } = req.body ?? {};

  if (!name || !email || !phone || !password) {
    res.status(400).json({ error: "Name, email, phone, and password are required" });
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: "Password must be at least 6 characters" });
    return;
  }

  const [existing] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (existing) {
    res.status(400).json({ error: "An account with this email already exists" });
    return;
  }

  // Generate unique username from email prefix
  const emailPrefix = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").toLowerCase() || "user";
  let username = emailPrefix;
  let suffix = 1;
  while (true) {
    const [taken] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (!taken) break;
    username = `${emailPrefix}${suffix++}`;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      username,
      password: hashPassword(password),
      name,
      email,
      phone,
      role: "user",
      isActive: true,
    })
    .returning();

  (req.session as Record<string, unknown>).userId = user.id;
  res.status(201).json(userResponse(user));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const { identifier, password } = req.body ?? {};
  if (!identifier || !password) {
    res.status(400).json({ error: "Email/username and password required" });
    return;
  }

  const isEmail = identifier.includes("@");
  const [user] = isEmail
    ? await db.select().from(usersTable).where(eq(usersTable.email, identifier))
    : await db.select().from(usersTable).where(eq(usersTable.username, identifier));

  if (!user || !verifyPassword(password, user.password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account disabled" });
    return;
  }

  (req.session as Record<string, unknown>).userId = user.id;
  (req.session as Record<string, unknown>).isAdmin = user.role === "admin";
  res.json(userResponse(user));
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

  res.json(userResponse(user));
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

  res.json(userResponse(user));
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

  res.json(userResponse(updated));
});

export default router;
