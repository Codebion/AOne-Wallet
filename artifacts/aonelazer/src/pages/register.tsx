import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

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
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <Link href="/">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 cursor-pointer hover:bg-primary/20 transition-colors">
              <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_15px_theme('colors.primary.DEFAULT')]" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Free forever. Start tracking your finances.
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
              className="bg-card border-input"
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
              className="bg-card border-input"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Mobile Number</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-card border border-input rounded-md text-sm text-muted-foreground whitespace-nowrap">
                +91
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="98765 43210"
                value={form.phone}
                onChange={set("phone")}
                className="bg-card border-input"
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
                className="bg-card border-input pr-10"
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
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-6 mt-2"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
