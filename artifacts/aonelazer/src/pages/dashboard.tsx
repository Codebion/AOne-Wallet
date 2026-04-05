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
import { formatCurrency, formatPercent, formatDate } from "@/lib/format";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon,
  ArrowDownLeft, ArrowRightLeft, LineChart as LineChartIcon, Wallet, ChevronRight,
  Plus, TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: loadingTrend } = useGetSpendingTrend();
  const { data: categories, isLoading: loadingCategories } = useGetCategoryBreakdown();
  const { data: transactions, isLoading: loadingTx } = useListTransactions({ limit: 5 });
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MetricCard
          title="Total Balance"
          value={summary.totalBalance}
          change={summary.monthlyChange}
          delay={0.1}
        />
        <MetricCard
          title="Monthly Expenses"
          value={summary.monthlyExpenses}
          change={summary.expenseChange}
          inverse
          delay={0.2}
        />
        <MetricCard
          title="Investments"
          value={summary.totalInvestments ?? 0}
          change={summary.investmentGain}
          delay={0.3}
          isPercent={false}
        />
        <MetricCard
          title="Expense Change"
          value={summary.expenseChange}
          change={0}
          delay={0.4}
          isPercent
          neutralChange
        />
      </div>

      {/* Spending Trend + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[300px]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <Activity className="w-4 h-4 text-primary" />
              Spending Trend (6 months)
            </h2>
          </div>
          {hasTrend ? (
            <div className="flex-1 min-h-[220px] w-full">
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
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(val: number) => [formatCurrency(val), "Expenses"]}
                  />
                  <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No expense data yet</p>
              <p className="text-xs text-muted-foreground mt-1">Add expenses to see your spending trend</p>
              <Link href="/expenses" className="mt-4 text-xs text-primary font-semibold hover:underline">
                Add your first expense
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[300px]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Spending by Category
            </h2>
            <Link href="/expenses" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          {hasCategories ? (
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="amount"
                      stroke="none"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => [formatCurrency(value), ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full mt-3 space-y-2">
                {categories.slice(0, 4).map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-muted-foreground">{c.category}</span>
                    </div>
                    <span className="font-mono">{formatPercent(c.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <PieChartIcon className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No categories yet</p>
              <p className="text-xs text-muted-foreground mt-1">Expenses will appear here by category</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Investment + Budget + Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Investment Snapshot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[240px]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <LineChartIcon className="w-4 h-4 text-primary" />
              Investment Snapshot
            </h2>
            <Link href="/investments" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Details <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {portfolio && hasInvestments ? (
            <div className="space-y-5">
              <div className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                <h3 className="text-xl sm:text-2xl font-bold font-mono">{formatCurrency(portfolio.totalValue)}</h3>
                <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${portfolio.totalGainLoss >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  {portfolio.totalGainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{formatCurrency(Math.abs(portfolio.totalGainLoss))}</span>
                  <span>({portfolio.totalGainLossPercent.toFixed(2)}%)</span>
                </div>
              </div>
              <div className="space-y-2.5">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Top Allocations</p>
                {portfolio.allocation.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                      <span className="text-muted-foreground">{a.type}</span>
                    </div>
                    <span className="font-mono text-xs">{formatPercent(a.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No investments yet</p>
              <p className="text-xs text-muted-foreground mt-1">Start tracking your portfolio</p>
              <Link href="/investments" className="mt-4 text-xs text-primary font-semibold hover:underline">
                Add investment
              </Link>
            </div>
          )}
        </motion.div>

        {/* Budget Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[240px]"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
              <Wallet className="w-4 h-4 text-primary" />
              Budget Overview
            </h2>
            <Link href="/budgets" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Manage <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          {budgets && budgets.length > 0 ? (
            <div className="space-y-4">
              {budgets.slice(0, 4).map((budget) => {
                const isOver = budget.percentage > 100;
                const progressValue = Math.min(budget.percentage, 100);
                return (
                  <div key={budget.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium">{budget.category}</span>
                      <span className="text-muted-foreground font-mono">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progressValue}%`,
                          backgroundColor: isOver ? "hsl(var(--destructive))" : budget.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No budgets yet</p>
              <p className="text-xs text-muted-foreground mt-1">Set monthly limits for each category</p>
              <Link href="/budgets" className="mt-4 text-xs text-primary font-semibold hover:underline">
                Create a budget
              </Link>
            </div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="border border-border bg-card rounded-xl p-5 sm:p-6 shadow-sm flex flex-col min-h-[240px] md:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
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
                        <p className="text-xs text-muted-foreground font-mono">{formatDate(tx.date)}</p>
                      </div>
                    </div>
                    <span className={`font-mono text-sm flex-shrink-0 ml-2 ${isPositive ? "text-emerald-500" : "text-foreground"}`}>
                      {isPositive ? "+" : "-"}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <ArrowRightLeft className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">No transactions yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your activity will appear here</p>
            </div>
          )}
        </motion.div>
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
        {isPercent ? `${value.toFixed(1)}%` : formatCurrency(value)}
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
