import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, blogPostsTable } from "@workspace/db";
import { getUserId } from "../middleware/requireAuth";

const router: IRouter = Router();

function isAdmin(req: import("express").Request): boolean {
  return !!(req as Record<string, unknown> & { session: Record<string, unknown> }).session?.isAdmin;
}

function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction): void {
  const session = (req as Record<string, unknown> & { session: Record<string, unknown> }).session;
  if (!session?.userId) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  if (!session?.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }
  next();
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

router.get("/blog", async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogPostsTable)
    .where(eq(blogPostsTable.published, true))
    .orderBy(desc(blogPostsTable.createdAt));

  res.json(
    posts.map((p) => ({
      ...p,
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    }))
  );
});

router.get("/blog/all", requireAdmin, async (_req, res): Promise<void> => {
  const posts = await db
    .select()
    .from(blogPostsTable)
    .orderBy(desc(blogPostsTable.createdAt));

  res.json(
    posts.map((p) => ({
      ...p,
      tags: p.tags ? p.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    }))
  );
});

router.get("/blog/:slug", async (req, res): Promise<void> => {
  const { slug } = req.params;
  const session = (req as Record<string, unknown> & { session: Record<string, unknown> }).session;
  const isAdminUser = !!session?.isAdmin;

  const conditions = [eq(blogPostsTable.slug, slug)];
  if (!isAdminUser) conditions.push(eq(blogPostsTable.published, true));

  const [post] = await db
    .select()
    .from(blogPostsTable)
    .where(and(...conditions));

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({
    ...post,
    tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  });
});

router.post("/blog", requireAdmin, async (req, res): Promise<void> => {
  const { title, content, excerpt, coverImage, metaTitle, metaDescription, canonicalUrl, ogImage, tags, published } = req.body ?? {};

  if (!title || !content) {
    res.status(400).json({ error: "Title and content are required" });
    return;
  }

  const session = (req as Record<string, unknown> & { session: Record<string, unknown> }).session;
  const authorId = session?.userId as number | undefined;

  let slug = slugify(title);
  const existing = await db.select({ id: blogPostsTable.id }).from(blogPostsTable).where(eq(blogPostsTable.slug, slug));
  if (existing.length > 0) {
    slug = `${slug}-${Date.now()}`;
  }

  const siteUrl = process.env.SITE_URL ?? "https://aonelazer.replit.app";
  const canonical = canonicalUrl || `${siteUrl}/blog/${slug}`;

  const [post] = await db
    .insert(blogPostsTable)
    .values({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      coverImage: coverImage || null,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || excerpt || null,
      canonicalUrl: canonical,
      ogImage: ogImage || coverImage || null,
      tags: Array.isArray(tags) ? tags.join(", ") : (tags || null),
      published: published ?? false,
      authorId: authorId ?? null,
    })
    .returning();

  res.status(201).json({ ...post, tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] });
});

router.patch("/blog/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const { title, content, excerpt, coverImage, metaTitle, metaDescription, canonicalUrl, ogImage, tags, published, slug: newSlug } = req.body ?? {};

  const updateData: Record<string, unknown> = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
  if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
  if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
  if (ogImage !== undefined) updateData.ogImage = ogImage;
  if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.join(", ") : tags;
  if (published !== undefined) updateData.published = published;
  if (newSlug !== undefined) updateData.slug = slugify(newSlug);

  const [post] = await db
    .update(blogPostsTable)
    .set(updateData)
    .where(eq(blogPostsTable.id, id))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ ...post, tags: post.tags ? post.tags.split(",").map((t) => t.trim()).filter(Boolean) : [] });
});

router.delete("/blog/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(blogPostsTable)
    .where(eq(blogPostsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
