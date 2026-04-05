import React from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Wallet,
  LineChart,
  ArrowRight,
  CheckCircle2,
  IndianRupee,
  Bell,
  Layers,
  BookOpen,
} from "lucide-react";
import SEO from "@/components/SEO";

const features = [
  {
    icon: IndianRupee,
    title: "Expense Tracking",
    description:
      "Log every rupee you spend across categories like food, travel, utilities, and more. See where your money goes at a glance.",
  },
  {
    icon: TrendingUp,
    title: "Investment Portfolio",
    description:
      "Track stocks, mutual funds, ETFs, gold, PPF, NPS, fixed deposits, and more — all in one place with live gain/loss.",
  },
  {
    icon: Wallet,
    title: "Budget Management",
    description:
      "Set monthly budgets per category and get colour-coded warnings when you are approaching your limit.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    description:
      "Understand your net worth trend, top spending categories, and monthly income vs. expense summaries through rich charts.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    description:
      "Your data stays in a private, session-secured account. No third-party sharing, ever.",
  },
  {
    icon: Bell,
    title: "All in One Place",
    description:
      "No need to juggle multiple apps. AOneLazer Finance combines expenses, investments, and budgets in a single dashboard.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create your free account",
    description:
      "Register with your name, email, mobile number, and a password. It takes less than 30 seconds.",
  },
  {
    number: "02",
    title: "Set up your budgets",
    description:
      "Define monthly budgets for categories such as Groceries, Rent, Entertainment, and Transport.",
  },
  {
    number: "03",
    title: "Add your expenses",
    description:
      "Record daily expenses under the matching category. The app automatically maps them to your budgets.",
  },
  {
    number: "04",
    title: "Track your investments",
    description:
      "Add your portfolio — stocks, mutual funds, gold, FDs, and more — to track current value and total gains.",
  },
  {
    number: "05",
    title: "Review your analytics",
    description:
      "Visit the Analytics page to see net worth trends, top spending categories, and monthly summaries.",
  },
];

const investmentTypes = [
  "Stocks",
  "Mutual Funds",
  "ETFs",
  "Gold",
  "Fixed Deposits",
  "PPF",
  "NPS",
  "Crypto",
  "Bonds",
  "Real Estate",
];

function Navbar() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <div className="w-3 h-3 bg-primary rounded-full shadow-[0_0_10px_theme('colors.primary.DEFAULT')]" />
          </div>
          <span className="font-bold text-lg tracking-tight">AOneLazer Finance</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/blog" className="hidden sm:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-4 h-4" />
            Blog
          </Link>
          <Link href="/login">
            <button className="px-4 py-2 text-sm font-medium text-foreground border border-border rounded-lg hover:bg-secondary transition-colors">
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
              Get Started Free
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="AOneLazer Finance — Free Indian Personal Finance Dashboard"
        description="Track expenses, investments, and budgets in one place. AOneLazer Finance is a free, privacy-first personal finance tool built for India with INR support, 25 currencies, and powerful analytics."
        keywords="personal finance India, expense tracker, investment portfolio, budget planner, INR, mutual funds tracker, financial dashboard"
        type="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "AOneLazer Finance",
          "description": "Free Indian personal finance dashboard for expense tracking, investments, and budgets",
          "url": "https://aonelazer.com",
        }}
      />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,theme(colors.primary.DEFAULT/0.15),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-sm text-primary font-medium mb-6">
              <IndianRupee className="w-3.5 h-3.5" />
              Built for India. Priced at Zero.
            </div>

            <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
              Your Complete
              <br />
              <span className="text-primary">Financial Dashboard</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              Track expenses in INR, manage your investment portfolio across 10+ asset types,
              set smart budgets, and understand your finances through powerful analytics — all
              in one beautifully designed app.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/login">
                <button className="inline-flex items-center gap-2 px-8 py-3.5 border border-border font-semibold rounded-xl hover:bg-secondary transition-colors text-base">
                  Sign In
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Dashboard preview mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-4 flex-1 bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground">
                  aonelazer.replit.app/dashboard
                </div>
              </div>
              <div className="p-6 grid grid-cols-3 gap-4">
                {[
                  { label: "Total Balance", value: "₹12,84,500", change: "+8.2%" },
                  { label: "Monthly Spend", value: "₹38,240", change: "-3.1%" },
                  { label: "Investments", value: "₹8,52,000", change: "+14.6%" },
                ].map((card) => (
                  <div key={card.label} className="bg-background rounded-xl p-4 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-xl font-bold">{card.value}</p>
                    <p className={`text-xs mt-1 font-medium ${card.change.startsWith("+") ? "text-green-500" : "text-red-400"}`}>
                      {card.change} this month
                    </p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-4">
                <div className="bg-background rounded-xl p-4 border border-border h-28 flex items-end justify-around gap-1">
                  {[40, 60, 45, 80, 55, 70, 90].map((h, i) => (
                    <div key={i} className="flex-1 rounded-sm bg-primary/20 flex items-end">
                      <div className="w-full rounded-sm bg-primary" style={{ height: `${h}%` }} />
                    </div>
                  ))}
                </div>
                <div className="bg-background rounded-xl p-4 border border-border h-28 flex flex-col justify-center gap-2">
                  {[
                    { label: "Groceries", pct: 72, color: "bg-primary" },
                    { label: "Transport", pct: 48, color: "bg-emerald-500" },
                    { label: "Dining", pct: 91, color: "bg-amber-500" },
                  ].map((b) => (
                    <div key={b.label}>
                      <div className="flex justify-between text-xs text-muted-foreground mb-0.5">
                        <span>{b.label}</span>
                        <span>{b.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full ${b.color} rounded-full`} style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/5 pointer-events-none" />
          </motion.div>
        </div>
      </section>

      {/* Investment Types Ticker */}
      <section className="py-8 border-y border-border bg-secondary/30 overflow-hidden">
        <div className="flex gap-6 animate-none">
          <div className="flex gap-6 whitespace-nowrap">
            {[...investmentTypes, ...investmentTypes].map((type, i) => (
              <span key={i} className="inline-flex items-center gap-2 text-sm text-muted-foreground px-4 py-2 bg-background rounded-full border border-border">
                <Layers className="w-3.5 h-3.5 text-primary" />
                {type}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Everything you need to manage your money
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            AOneLazer Finance brings together every aspect of your personal finances
            into a single, clean interface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/40 transition-colors group"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-secondary/20 border-y border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How to get started</h2>
            <p className="text-muted-foreground">
              Follow these five simple steps to take full control of your finances.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex gap-6 items-start"
              >
                <div className="flex-shrink-0 w-14 h-14 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm font-mono">{step.number}</span>
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-base mb-1.5">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What you can track */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Track every investment type
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              From blue-chip stocks to gold and government savings schemes — AOneLazer Finance
              supports 10+ investment types so your entire portfolio is in one place.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {investmentTypes.map((type) => (
                <div key={type} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                  <span>{type}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Portfolio Snapshot</h3>
              <span className="text-xs text-emerald-500 font-medium">+14.6% overall</span>
            </div>
            {[
              { name: "Mutual Funds", value: "₹3,20,000", pct: 38, color: "bg-primary" },
              { name: "Stocks", value: "₹2,50,000", pct: 29, color: "bg-emerald-500" },
              { name: "Gold", value: "₹1,20,000", pct: 14, color: "bg-amber-500" },
              { name: "PPF & NPS", value: "₹95,000", pct: 11, color: "bg-violet-500" },
              { name: "Fixed Deposits", value: "₹67,000", pct: 8, color: "bg-cyan-500" },
            ].map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    {item.name}
                  </span>
                  <span className="text-muted-foreground">{item.value}</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_50%_50%,theme(colors.primary.DEFAULT/0.12),transparent)] pointer-events-none" />
        <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-4">
            Start managing your money today
          </h2>
          <p className="text-muted-foreground mb-8">
            Free to use. No credit card required. Get started in under a minute.
          </p>
          <Link href="/register">
            <button className="inline-flex items-center gap-2 px-10 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 text-base">
              Create Free Account
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-primary/10 border border-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-primary rounded-full" />
            </div>
            <span className="text-sm font-semibold">AOneLazer Finance</span>
          </div>
          <p className="text-xs text-muted-foreground">
            All amounts in Indian Rupees (INR). For personal use only.
          </p>
        </div>
      </footer>
    </div>
  );
}
