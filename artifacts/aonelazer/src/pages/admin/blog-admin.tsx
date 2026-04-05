import React, { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ArrowLeft, Save, X, Check, BookOpen, Tag, Globe
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEO } from "@/components/SEO";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  tags: string[];
  published: boolean;
  createdAt: string;
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const EMPTY_FORM = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  metaTitle: "",
  metaDescription: "",
  canonicalUrl: "",
  tags: "",
  published: false,
};

export default function BlogAdmin() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [preview, setPreview] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadPosts = () => {
    fetch(`${API_BASE}/api/blog/all`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (Array.isArray(data)) setPosts(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setIsCreating(true);
    setError("");
    setSuccess("");
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content,
      coverImage: post.coverImage ?? "",
      metaTitle: post.metaTitle ?? "",
      metaDescription: post.metaDescription ?? "",
      canonicalUrl: post.canonicalUrl ?? "",
      tags: post.tags.join(", "),
      published: post.published,
    });
    setEditing(post);
    setIsCreating(true);
    setError("");
    setSuccess("");
  };

  const slugify = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

  const handleTitleChange = (v: string) => {
    setForm((f) => ({
      ...f,
      title: v,
      slug: editing ? f.slug : slugify(v),
      metaTitle: f.metaTitle || v,
    }));
  };

  const handleSave = async () => {
    if (!form.title || !form.content) {
      setError("Title and content are required.");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");

    const body = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      excerpt: form.excerpt || null,
      content: form.content,
      coverImage: form.coverImage || null,
      metaTitle: form.metaTitle || form.title,
      metaDescription: form.metaDescription || form.excerpt || null,
      canonicalUrl: form.canonicalUrl || null,
      tags: form.tags,
      published: form.published,
    };

    try {
      const url = editing ? `${API_BASE}/api/blog/${editing.id}` : `${API_BASE}/api/blog`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      if (!r.ok) {
        const err = await r.json();
        setError(err.error || "Failed to save post.");
        return;
      }

      setSuccess(editing ? "Post updated successfully." : "Post created successfully.");
      setIsCreating(false);
      setEditing(null);
      loadPosts();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    await fetch(`${API_BASE}/api/blog/${id}`, { method: "DELETE", credentials: "include" });
    loadPosts();
  };

  const togglePublish = async (post: BlogPost) => {
    await fetch(`${API_BASE}/api/blog/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ published: !post.published }),
    });
    loadPosts();
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <SEO title="Admin Access Required" noIndex />
        <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold mb-2">Admin Access Required</h2>
        <p className="text-muted-foreground text-sm mb-4">You need an admin account to manage blog posts.</p>
        <Link href="/dashboard" className="text-primary text-sm font-semibold hover:underline">Go to Dashboard</Link>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto">
        <SEO title={editing ? "Edit Post" : "New Post"} noIndex />

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 gap-4">
          <button onClick={() => { setIsCreating(false); setEditing(null); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to posts
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(!preview)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors"
            >
              {preview ? <Pencil className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {preview ? "Edit" : "Preview"}
            </button>
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm cursor-pointer hover:bg-secondary transition-colors">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))} className="rounded" />
              Publish
            </label>
            <Button onClick={handleSave} disabled={saving} className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
              <Save className="w-3.5 h-3.5 mr-1.5" />
              {saving ? "Saving..." : editing ? "Update" : "Publish"}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
            <X className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        {preview ? (
          <div className="border border-border rounded-2xl p-8 bg-card">
            <h1 className="text-3xl font-bold mb-2">{form.title || "Untitled"}</h1>
            {form.excerpt && <p className="text-muted-foreground text-lg mb-6 border-l-4 border-primary/30 pl-4">{form.excerpt}</p>}
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || "*No content yet*"}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Main Content */}
            <div className="border border-border rounded-2xl bg-card p-5 space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Post title"
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-muted-foreground/50 text-foreground"
                />
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span>Slug:</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                    className="bg-transparent border-none outline-none text-primary font-mono"
                    placeholder="post-slug"
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <textarea
                  placeholder="Brief excerpt / summary (shown in blog listing)..."
                  value={form.excerpt}
                  onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                  rows={2}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm text-muted-foreground placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="border-t border-border pt-4">
                <textarea
                  placeholder="Write your post content in Markdown...&#10;&#10;## Heading&#10;**Bold**, *italic*, [links](url), `code`, lists...&#10;&#10;Supports full GitHub Flavored Markdown."
                  value={form.content}
                  onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                  rows={20}
                  className="w-full bg-transparent border-none outline-none resize-none text-sm font-mono leading-relaxed placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            {/* SEO & Meta */}
            <div className="border border-border rounded-2xl bg-card p-5 space-y-4">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                SEO &amp; Meta Settings
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Meta Title</Label>
                  <Input value={form.metaTitle} onChange={(e) => setForm((f) => ({ ...f, metaTitle: e.target.value }))} placeholder="SEO title (default: post title)" className="text-sm h-9" />
                  <p className="text-xs text-muted-foreground">{form.metaTitle.length}/60 chars</p>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Canonical URL</Label>
                  <Input value={form.canonicalUrl} onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))} placeholder="https://..." className="text-sm h-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Meta Description</Label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) => setForm((f) => ({ ...f, metaDescription: e.target.value }))}
                  placeholder="SEO description (120–160 chars recommended)"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/30"
                />
                <p className="text-xs text-muted-foreground">{form.metaDescription.length}/160 chars</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Cover Image URL</Label>
                  <Input value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} placeholder="https://..." className="text-sm h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Tags (comma separated)</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="Investing, Budgeting, Mutual Funds" className="text-sm h-9 pl-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <SEO title="Blog Management" noIndex />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{posts.length} post{posts.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/blog">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors">
              <Eye className="w-3.5 h-3.5" /> View Blog
            </button>
          </Link>
          <Button onClick={openCreate} className="h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> New Post
          </Button>
        </div>
      </div>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
          <Check className="w-4 h-4" /> {success}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="font-medium mb-1">No posts yet</p>
          <p className="text-sm text-muted-foreground mb-4">Create your first blog post to get started.</p>
          <Button onClick={openCreate} className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Create First Post
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-border bg-card rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-colors group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${post.published ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{post.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                    <span className="font-mono">/{post.slug}</span>
                    <span>·</span>
                    <span>{new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {post.tags.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{post.tags.slice(0, 2).join(", ")}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${post.published ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                  {post.published ? "Live" : "Draft"}
                </span>
                <button
                  onClick={() => togglePublish(post)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  title={post.published ? "Unpublish" : "Publish"}
                >
                  {post.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => openEdit(post)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <Link href={`/blog/${post.slug}`}>
                  <button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="View post">
                    <Globe className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReactMarkdown({ children, remarkPlugins }: { children: string; remarkPlugins: unknown[] }) {
  const [ReactMD, setReactMD] = useState<React.ComponentType<{ children: string; remarkPlugins: unknown[] }> | null>(null);
  const [rGfm, setRGfm] = useState<unknown>(null);

  useEffect(() => {
    Promise.all([
      import("react-markdown").then((m) => m.default),
      import("remark-gfm").then((m) => m.default),
    ]).then(([md, gfm]) => {
      setReactMD(() => md as React.ComponentType<{ children: string; remarkPlugins: unknown[] }>);
      setRGfm(gfm);
    });
  }, []);

  if (!ReactMD || !rGfm) return <p className="text-muted-foreground text-sm">Loading preview...</p>;
  return <ReactMD remarkPlugins={[rGfm]}>{children}</ReactMD>;
}
