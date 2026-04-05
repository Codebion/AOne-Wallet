import React, { useEffect, useState } from "react";
import { Link, useRoute } from "wouter";
import { motion } from "framer-motion";
import { Calendar, Tag, ArrowLeft, IndianRupee, Share2, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEO } from "@/components/SEO";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  ogImage: string | null;
  createdAt: string;
  updatedAt: string;
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug ?? "";
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    fetch(`${API_BASE}/api/blog/${slug}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = await r.json();
        setPost(data);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const date = post ? new Date(post.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric",
  }) : "";

  const readingTime = post ? Math.max(1, Math.ceil(post.content.split(/\s+/).length / 200)) : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: post?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading article...</p>
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-4">
        <SEO title="Article Not Found" noIndex />
        <BookOpen className="w-16 h-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Article not found</h1>
        <p className="text-muted-foreground mb-6">This article may have been removed or the URL is incorrect.</p>
        <Link href="/blog" className="text-primary font-semibold hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  const siteUrl = window.location.origin;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    image: post.ogImage || post.coverImage || `${siteUrl}/opengraph.jpg`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    url: post.canonicalUrl || `${siteUrl}/blog/${post.slug}`,
    publisher: {
      "@type": "Organization",
      name: "AOneLazer Finance",
      logo: { "@type": "ImageObject", url: `${siteUrl}/favicon.svg` },
    },
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt || undefined}
        canonical={post.canonicalUrl || `/blog/${post.slug}`}
        ogTitle={post.metaTitle || post.title}
        ogDescription={post.metaDescription || post.excerpt || undefined}
        ogImage={post.ogImage || post.coverImage || undefined}
        ogType="article"
        structuredData={structuredData}
      />

      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Blog</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IndianRupee className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-bold text-sm hidden sm:block">AOneLazer Finance</span>
          </Link>
          <button onClick={handleShare} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Share">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Article */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed mb-5 border-l-4 border-primary/30 pl-4">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{date}</span>
            </div>
            <span>·</span>
            <span>{readingTime} min read</span>
          </div>
        </motion.header>

        {post.coverImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden mb-10 border border-border"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover"
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-neutral dark:prose-invert max-w-none
            prose-headings:font-bold prose-headings:tracking-tight
            prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
            prose-p:text-base prose-p:leading-relaxed prose-p:text-foreground/90
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal
            prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-xl
            prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground
            prose-img:rounded-xl prose-img:border prose-img:border-border
            prose-hr:border-border
            prose-strong:text-foreground
            prose-ul:text-foreground/90 prose-ol:text-foreground/90
            prose-th:text-foreground prose-td:text-foreground/90"
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 text-center"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <IndianRupee className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-xl font-bold mb-2">Start Managing Your Finances Today</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Track expenses, grow investments, and hit your financial goals — all in one place.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors">
            Create Free Account <ArrowLeft className="w-4 h-4 rotate-180" />
          </Link>
        </motion.div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <Link href="/blog" className="text-sm text-primary font-semibold hover:underline">
            Read more articles
          </Link>
        </div>
      </article>
    </div>
  );
}
