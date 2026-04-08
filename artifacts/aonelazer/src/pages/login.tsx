import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, IndianRupee, BookOpen, Home, ArrowLeft } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";

function AuthHeader() {
  const { theme, setTheme } = useTheme();
  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };
  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm">AOneLazer Finance</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5" />
            Home
          </Link>
          <Link href="/blog" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            Blog
          </Link>
          <Link href="/register" className="text-sm font-medium text-primary hover:underline underline-offset-2">
            Create account
          </Link>
          <button onClick={cycleTheme} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <ThemeIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function AuthFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IndianRupee className="w-3 h-3 text-primary" />
            </div>
            <span className="text-sm font-semibold">AOneLazer Finance</span>
            <span className="text-xs text-muted-foreground">Free forever</span>
          </div>
          <nav className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Login</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Register</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          </nav>
        </div>
        <p className="text-xs text-muted-foreground text-center sm:text-left mt-3">
          Built for India. All amounts in INR. Your data stays private.
        </p>
      </div>
    </footer>
  );
}

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await login({ identifier, password });
      setLocation("/dashboard");
    } catch {
      setError("Invalid email/username or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AuthHeader />

      <div className="flex-1 flex pt-14">
        {/* Left panel — decorative, hidden on mobile */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-primary/5 to-background flex-col justify-between p-12 border-r border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl">AOneLazer Finance</span>
          </Link>

          <div>
            <blockquote className="text-2xl font-semibold leading-relaxed text-foreground/90 mb-4">
              "Track every rupee, grow every investment, achieve every goal."
            </blockquote>
            <div className="flex gap-3 mt-8">
              {[
                { label: "Users", value: "10K+" },
                { label: "Tracked Monthly", value: "₹50Cr+" },
                { label: "Investment Types", value: "11" },
              ].map((stat) => (
                <div key={stat.label} className="bg-card/60 border border-border rounded-xl p-4 flex-1 text-center">
                  <div className="text-xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              {[
                "Track expenses across 20+ categories",
                "Manage 11 investment types in one place",
                "Set budgets and get overspend alerts",
                "Multi-currency view with 25 currencies",
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            All amounts displayed in Indian Rupees (INR). Free forever.
          </p>
        </div>

        {/* Right panel — login form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-sm"
          >
            {/* Mobile back link */}
            <div className="lg:hidden mb-6">
              <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sign in to your financial dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-11"
                  required
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-primary font-semibold hover:underline underline-offset-2">
                  Create one free
                </Link>
              </p>

              <div className="pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/blog", label: "Blog" },
                    { href: "/register", label: "Register" },
                  ].map((link) => (
                    <Link key={link.href} href={link.href} className="text-xs text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded hover:bg-secondary">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}
