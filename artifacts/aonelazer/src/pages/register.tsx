import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff, IndianRupee, BookOpen, Home, ArrowLeft, CheckCircle2 } from "lucide-react";
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
          <Link href="/login" className="text-sm font-medium text-primary hover:underline underline-offset-2">
            Sign in
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

const perks = [
  "Free forever — no hidden fees",
  "Track expenses across 20+ categories",
  "11 investment types: Stocks, MF, Gold, PPF, NPS...",
  "Smart budget alerts when you overspend",
  "View amounts in 25 currencies",
  "Full data privacy — your data stays yours",
];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const [, setLocation] = useLocation();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) { setError("Full name is required"); return; }
    if (!form.email.includes("@")) { setError("Enter a valid email address"); return; }
    if (!/^\d{10}$/.test(form.phone.replace(/\s+/g, ""))) {
      setError("Enter a valid 10-digit mobile number");
      return;
    }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }

    setIsLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
      });
      setLocation("/dashboard");
    } catch (err: unknown) {
      setError((err as Error)?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <AuthHeader />

      <div className="flex-1 flex pt-14">
        {/* Left panel */}
        <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-primary/15 via-primary/5 to-background flex-col justify-between p-12 border-r border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-xl">AOneLazer Finance</span>
          </Link>

          <div>
            <h2 className="text-2xl font-bold mb-2">Your complete financial dashboard</h2>
            <p className="text-muted-foreground text-sm mb-8">Everything you need to manage money wisely — built for India.</p>

            <div className="space-y-3">
              {perks.map((perk) => (
                <div key={perk} className="flex items-start gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">Sign in here</Link>
          </p>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Mobile back link */}
            <div className="lg:hidden mb-6">
              <Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Free forever. Start tracking your finances in minutes.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Arjun Sharma"
                  value={form.name}
                  onChange={set("name")}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="arjun@example.com"
                  value={form.email}
                  onChange={set("email")}
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 bg-card border border-input rounded-md text-sm text-muted-foreground whitespace-nowrap h-11">
                    +91
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set("phone")}
                    className="h-11"
                    maxLength={10}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={set("password")}
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-medium bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold mt-2"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>

              <div className="pt-2 border-t border-border">
                <div className="flex flex-wrap gap-2 justify-center">
                  {[
                    { href: "/", label: "Home" },
                    { href: "/blog", label: "Blog" },
                    { href: "/login", label: "Sign In" },
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
