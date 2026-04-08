import React from "react";
import { Link } from "wouter";
import {
  useGetDashboardSummary,
  useGetSpendingTrend,
  useGetCategoryBreakdown,
  useListTransactions,
  useGetPortfolioSummary,
  useListBudgets,
} from "@workspace/api-client-react";
import { formatPercent, formatDate } from "@/lib/format";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon,
  ArrowDownLeft, ArrowRightLeft, LineChart as LineChartIcon, Wallet, ChevronRight,
  Plus, TrendingUp, AlertTriangle, ShieldCheck, Receipt, User, BarChart2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { formatAmount } = useCurrency();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: loadingTrend } = useGetSpendingTrend();
  const { data: categories, isLoading: loadingCategories } = useGetCategoryBreakdown();
  const { data: transactions, isLoading: loadingTx } = useListTransactions({ limit: 6 });
  const { data: portfolio, isLoading: loadingPortfolio } = useGetPortfolioSummary();
  const { data: budgets, isLoading: loadingBudgets } = useListBudgets();

  const isLoading = loadingSummary || loadingTrend || loadingCategories || loadingTx || loadingPortfolio || loadingBudgets;

  const firstName = user?.name?.split(" ")[0] || user?.username || "there";

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!summary || !trend || !categories) return null;

  const hasExpenses = summary.monthlyExpenses > 0;
  const hasInvestments = summary.totalInvestments != null && summary.totalInvestments > 0;
  const hasTrend = trend.some((t) => t.expenses > 0);
  const hasCategories = categories.length > 0;

  const overBudgets = budgets?.filter((b) => b.percentage > 100) ?? [];
  const nearBudgets = budgets?.filter((b) => b.percentage >= 80 && b.percentage <= 100) ?? [];

  const healthScore = calculateHealthScore({ summary, budgets, hasInvestments });

  const quickLinks = [
    { href: "/expenses", label: "Expenses", icon: Receipt, color: "text-red-500", bg: "bg-red-500/10" },
    { href: "/investments", label: "Invest", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { href: "/budgets", label: "Budgets", icon: Wallet, color: "text-blue-500", bg: "bg-blue-500/10" },
    { href: "/analytics", label: "Analytics", icon: BarChart2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { href: "/transactions", label: "Transactions", icon: ArrowRightLeft, color: "text-orange-500", bg: "bg-orange-500/10" },
    { href: "/account", label: "Account", icon: User, color: "text-muted-foreground", bg: "bg-secondary" },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Hello, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/expenses">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Expense
            </button>
          </Link>
          <Link href="/investments">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-semibold hover:bg-secondary/80 border border-border transition-colors">
              <TrendingUp className="w-3.5 h-3.5" /> Add Investment
            </button>
          </Link>
        </div>
      </div>

      {/* Budget Alerts */}
      {overBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 border border-destructive/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-destructive">Budget Exceeded</p>
            <p className="text-xs text-destructive/80 mt-0.5">
              {overBudgets.map((b) => `${b.category} (${b.percentage.toFixed(0)}%)`).join(", ")} {overBudgets.length === 1 ? "is" : "are"} over budget this month.
            </p>
          </div>
          <Link href="/budgets" className="text-xs text-destructive font-semibold hover:underline flex-shrink-0">
            View
          </Link>
        </motion.div>
      )}
      {overBudgets.length === 0 && nearBudgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
        >
          <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Nearing Budget Limit</p>
            <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 mt-0.5">
              {nearBudgets.map((b) => `${b.category} (${b.percentage.toFixed(0)}%)`).join(", ")} approaching the limit.
            </p>
          </div>
          <Link href="/budgets" className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold hover:underline flex-shrink-0">
            View
          </Link>
        </motion.div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Balance"
          value={summary.totalBalance}
          change={summary.monthlyChange}
          delay={0.05}
        />
        <MetricCard
          title="Monthly Expenses"
          value={summary.monthlyExpenses}
          change={summary.expenseChange}
          inverse
          delay={0.1}
        />
        <MetricCard
          title="Investments"
          value={summary.totalInvestments ?? 0}
          change={summary.investmentGain}
          delay={0.15}
        />
        <MetricCard
          title="Expense Change"
          value={summary.expenseChange}
          change={0}
          delay={0.2}
          isPercent
          neutralChange
        />
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
        {quickLinks.map((link, i) => {
          const Icon = link.icon;
          return (
            <motion.div key={link.href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
              <Link href={link.href}>
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all cursor-pointer group">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${link.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-4 h-4 ${link.color}`} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">{link.label}</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Financial Health + Spending Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Spending Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="lg:col-span-2 border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col min-h-[280px]"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Activity className="w-4 h-4 text-primary" />
              Spending Trend (6 months)
            </h2>
          </div>
          {hasTrend ? (
            <div className="flex-1 min-h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                    width={48}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(val: number) => [formatAmount(val), "Expenses"]}
                  />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Activity className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No expense data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add expenses to see your spending trend</p>
              <Link href="/expenses" className="mt-3 text-xs text-primary font-semibold hover:underline">Add your first expense</Link>
            </div>
          )}
        </motion.div>

        {/* Financial Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col"
        >
          <h2 className="font-semibold flex items-center gap-2 text-sm mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            Financial Health
          </h2>
          <div className="flex flex-col items-center justify-center flex-1 py-4">
            <HealthGauge score={healthScore.score} />
            <p className="text-lg font-bold mt-3">{healthScore.label}</p>
            <p className="text-xs text-muted-foreground text-center mt-1">{healthScore.summary}</p>
          </div>
          <div className="mt-4 space-y-2">
            {healthScore.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <div className={`w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0 ${tip.ok ? "bg-emerald-500" : "bg-yellow-500"}`} />
                {tip.text}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Category Breakdown + Budget Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Spending by Category
            </h2>
            <Link href="/expenses" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          {hasCategories ? (
            <div className="flex gap-4 items-center">
              <div className="h-[160px] w-[160px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categories} cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={2} dataKey="amount" stroke="none">
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => [formatAmount(value), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2">
                {categories.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground truncate">{c.category}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className="font-mono">{formatAmount(c.amount)}</span>
                      <span className="text-muted-foreground">{formatPercent(c.percentage)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <PieChartIcon className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No categories yet</p>
              <Link href="/expenses" className="mt-3 text-xs text-primary font-semibold hover:underline">Add an expense</Link>
            </div>
          )}
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <Wallet className="w-4 h-4 text-primary" />
              Budget Tracker
            </h2>
            <Link href="/budgets" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Manage <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {budgets && budgets.length > 0 ? (
            <div className="space-y-3.5">
              {budgets.slice(0, 6).map((budget) => {
                const isOver = budget.percentage > 100;
                const isNear = budget.percentage >= 80 && !isOver;
                const progressValue = Math.min(budget.percentage, 100);
                const progressColor = isOver
                  ? "hsl(var(--destructive))"
                  : isNear
                  ? "#eab308"
                  : budget.color;
                return (
                  <div key={budget.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium">{budget.category}</span>
                        {isOver && <span className="text-[10px] text-destructive font-semibold bg-destructive/10 px-1.5 py-0.5 rounded">OVER</span>}
                        {isNear && <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-semibold bg-yellow-500/10 px-1.5 py-0.5 rounded">NEAR</span>}
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatAmount(budget.spent)} / {formatAmount(budget.limit)}
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressValue}%`, backgroundColor: progressColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-10">
              <Wallet className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No budgets yet</p>
              <p className="text-xs text-muted-foreground mt-1">Set monthly limits for each category</p>
              <Link href="/budgets" className="mt-3 text-xs text-primary font-semibold hover:underline">Create a budget</Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Investment Snapshot + Recent Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {/* Investment Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <LineChartIcon className="w-4 h-4 text-primary" />
              Investment Snapshot
            </h2>
            <Link href="/investments" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Details <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {portfolio && hasInvestments ? (
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total Portfolio Value</p>
                <h3 className="text-xl font-bold font-mono">{formatAmount(portfolio.totalValue)}</h3>
                <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${portfolio.totalGainLoss >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {portfolio.totalGainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{portfolio.totalGainLoss >= 0 ? "+" : ""}{formatAmount(portfolio.totalGainLoss)}</span>
                  <span className="text-muted-foreground ml-1">({portfolio.totalGainLossPercent.toFixed(2)}%)</span>
                </div>
              </div>

              {portfolio.allocation && portfolio.allocation.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground font-medium mb-2">Allocation</p>
                  <div className="h-[100px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={portfolio.allocation.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="type" width={80} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "11px" }}
                          formatter={(val: number) => [`${val.toFixed(1)}%`, "Allocation"]}
                        />
                        <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                          {portfolio.allocation.slice(0, 5).map((a, i) => (
                            <Cell key={i} fill={a.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <TrendingUp className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No investments yet</p>
              <p className="text-xs text-muted-foreground mt-1">Track stocks, MF, gold, PPF and more</p>
              <Link href="/investments" className="mt-3 text-xs text-primary font-semibold hover:underline">Add investment</Link>
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Recent Transactions
            </h2>
            <Link href="/transactions" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((tx) => {
                const isPositive = tx.type === "Income" || tx.type === "Investment";
                const Icon = isPositive ? ArrowUpRight : ArrowDownLeft;
                return (
                  <div key={tx.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border flex-shrink-0 ${
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate leading-none mb-1">{tx.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-sm flex-shrink-0 ml-2 ${isPositive ? "text-emerald-500" : "text-foreground"}`}>
                      {isPositive ? "+" : "-"}{formatAmount(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <ArrowRightLeft className="w-10 h-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your activity will appear here</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Expense by Category Bar Chart */}
      {hasCategories && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="border border-border bg-card rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2 text-sm">
              <BarChart2 className="w-4 h-4 text-primary" />
              Category Breakdown (This Month)
            </h2>
            <Link href="/analytics" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Full analytics <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categories.slice(0, 8)} margin={{ top: 4, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal vertical={false} />
                <XAxis dataKey="category" stroke="hsl(var(--muted-foreground))" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                  width={44}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(val: number) => [formatAmount(val), "Spent"]}
                />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {categories.slice(0, 8).map((c, i) => (
                    <Cell key={i} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-border bg-card rounded-xl p-4 sm:p-5 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Expenses (Tracked)</p>
          <h3 className="text-xl font-bold font-mono">{formatAmount(summary.monthlyExpenses)}</h3>
          <p className="text-xs text-muted-foreground mt-1">This month across {hasCategories ? categories.length : 0} categories</p>
          <Link href="/expenses" className="mt-2 text-xs text-primary font-semibold hover:underline block">View all expenses</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="border border-border bg-card rounded-xl p-4 sm:p-5 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-medium mb-1">Portfolio Value</p>
          <h3 className="text-xl font-bold font-mono">{formatAmount(summary.totalInvestments ?? 0)}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {hasInvestments
              ? `${portfolio?.allocation?.length ?? 0} investment type${(portfolio?.allocation?.length ?? 0) === 1 ? "" : "s"} tracked`
              : "No investments tracked yet"}
          </p>
          <Link href="/investments" className="mt-2 text-xs text-primary font-semibold hover:underline block">Manage portfolio</Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border border-border bg-card rounded-xl p-4 sm:p-5 shadow-sm"
        >
          <p className="text-xs text-muted-foreground font-medium mb-1">Budgets Tracked</p>
          <h3 className="text-xl font-bold font-mono">{budgets?.length ?? 0}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {overBudgets.length > 0 && <span className="text-destructive font-medium">{overBudgets.length} over limit</span>}
            {nearBudgets.length > 0 && <span className="text-yellow-600 dark:text-yellow-400">{nearBudgets.length} near limit</span>}
            {overBudgets.length === 0 && nearBudgets.length === 0 && budgets && budgets.length > 0 && (
              <span className="text-emerald-500">All within limits</span>
            )}
            {(!budgets || budgets.length === 0) && <span>No budgets set</span>}
          </div>
          <Link href="/budgets" className="mt-2 text-xs text-primary font-semibold hover:underline block">Manage budgets</Link>
        </motion.div>
      </div>
    </div>
  );
}

function calculateHealthScore({
  summary,
  budgets,
  hasInvestments,
}: {
  summary: { monthlyExpenses: number; totalBalance: number; totalInvestments?: number | null };
  budgets?: { percentage: number }[];
  hasInvestments: boolean;
}) {
  let score = 50;
  const tips: { text: string; ok: boolean }[] = [];

  if (hasInvestments) {
    score += 20;
    tips.push({ text: "Great job! You have active investments.", ok: true });
  } else {
    tips.push({ text: "Start investing to grow your wealth.", ok: false });
  }

  const overBudgetCount = budgets?.filter((b) => b.percentage > 100).length ?? 0;
  if (overBudgetCount === 0 && budgets && budgets.length > 0) {
    score += 15;
    tips.push({ text: "All budgets within limits this month.", ok: true });
  } else if (overBudgetCount > 0) {
    score -= 10 * overBudgetCount;
    tips.push({ text: `${overBudgetCount} budget${overBudgetCount > 1 ? "s" : ""} exceeded — review spending.`, ok: false });
  } else {
    tips.push({ text: "Set monthly budgets to track spending.", ok: false });
  }

  if (summary.monthlyExpenses > 0) {
    score += 10;
    tips.push({ text: "You are tracking your expenses.", ok: true });
  } else {
    tips.push({ text: "Start logging expenses to gain insights.", ok: false });
  }

  if (summary.totalBalance > 0) {
    score += 5;
    tips.push({ text: "Positive balance detected.", ok: true });
  }

  const clamped = Math.max(0, Math.min(100, score));
  const label = clamped >= 80 ? "Excellent" : clamped >= 60 ? "Good" : clamped >= 40 ? "Fair" : "Needs Attention";
  const summary2 = clamped >= 80
    ? "Your finances are in great shape."
    : clamped >= 60
    ? "Good habits, a few areas to improve."
    : clamped >= 40
    ? "Room to improve — start investing or budgeting."
    : "Take action to improve your financial health.";

  return { score: clamped, label, summary: summary2, tips: tips.slice(0, 4) };
}

function HealthGauge({ score }: { score: number }) {
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#eab308" : "#ef4444";
  const circumference = 2 * Math.PI * 36;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-28 h-28">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="36" fill="none" stroke="hsl(var(--border))" strokeWidth="7" />
        <circle
          cx="40" cy="40" r="36" fill="none"
          stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{score}</span>
        <span className="text-[10px] text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  change,
  inverse = false,
  neutralChange = false,
  isPercent = false,
  delay,
}: {
  title: string;
  value: number;
  change: number;
  inverse?: boolean;
  neutralChange?: boolean;
  isPercent?: boolean;
  delay: number;
}) {
  const { formatAmount } = useCurrency();
  const isPositive = change > 0;
  const isGood = neutralChange ? true : inverse ? !isPositive : isPositive;
  const changeColor = neutralChange
    ? "text-muted-foreground"
    : isGood
    ? "text-emerald-500"
    : "text-destructive";
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="border border-border bg-card rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">{title}</p>
      <h3 className="text-lg sm:text-2xl font-bold font-mono tracking-tight">
        {isPercent ? `${value.toFixed(1)}%` : formatAmount(value)}
      </h3>
      {change !== 0 && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${changeColor}`}>
          <Icon className="w-3 h-3" />
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
