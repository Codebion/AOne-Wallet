import React from "react";
import { Link } from "wouter";
import { 
  useGetDashboardSummary, 
  useGetSpendingTrend,
  useGetCategoryBreakdown,
  useListTransactions,
  useGetPortfolioSummary,
  useListBudgets
} from "@workspace/api-client-react";
import { formatCurrency, formatPercent, formatDate } from "@/lib/format";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { 
  ArrowUpRight, ArrowDownRight, Activity, PieChart as PieChartIcon, 
  ArrowDownLeft, ArrowRightLeft, LineChart as LineChartIcon, Wallet, ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export default function Dashboard() {
  const { data: summary, isLoading: loadingSummary } = useGetDashboardSummary();
  const { data: trend, isLoading: loadingTrend } = useGetSpendingTrend();
  const { data: categories, isLoading: loadingCategories } = useGetCategoryBreakdown();
  const { data: transactions, isLoading: loadingTx } = useListTransactions({ limit: 5 });
  const { data: portfolio, isLoading: loadingPortfolio } = useGetPortfolioSummary();
  const { data: budgets, isLoading: loadingBudgets } = useListBudgets();

  const isLoading = loadingSummary || loadingTrend || loadingCategories || loadingTx || loadingPortfolio || loadingBudgets;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING_DATA...</div>;
  }

  if (!summary || !trend || !categories) return null;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
        <div className="flex gap-2">
          <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">
            LAST_UPDATED: {new Date().toISOString().split('T')[0]}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Balance" 
          value={summary.totalBalance} 
          change={summary.monthlyChange} 
          delay={0.1}
        />
        <MetricCard 
          title="Monthly Income" 
          value={summary.monthlyIncome} 
          change={0} 
          delay={0.2}
          neutralChange
        />
        <MetricCard 
          title="Monthly Expenses" 
          value={summary.monthlyExpenses} 
          change={summary.expenseChange} 
          inverse
          delay={0.3}
        />
        <MetricCard 
          title="Savings Rate" 
          value={summary.savingsRate} 
          change={0} 
          delay={0.4}
          isPercent
          neutralChange
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Cash Flow Trend
            </h2>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(val) => `$${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-primary" />
              Spending by Category
            </h2>
            <Link href="/expenses" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="amount"
                    stroke="none"
                  >
                    {categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full mt-4 space-y-2">
              {categories.slice(0, 4).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-muted-foreground">{c.category}</span>
                  </div>
                  <span className="font-mono">{formatPercent(c.percentage)}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-1 border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-primary" />
              Investment Snapshot
            </h2>
            <Link href="/investments" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Details <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          {portfolio ? (
            <div className="space-y-6">
              <div className="relative overflow-hidden rounded-lg p-4 bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <p className="text-xs text-muted-foreground mb-1">Total Value</p>
                <h3 className="text-2xl font-bold font-mono">{formatCurrency(portfolio.totalValue)}</h3>
                <div className={`flex items-center gap-1 mt-1 text-xs font-mono ${portfolio.totalGainLoss >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                  {portfolio.totalGainLoss >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  <span>{formatCurrency(Math.abs(portfolio.totalGainLoss))}</span>
                  <span>({portfolio.totalGainLossPercent.toFixed(2)}%)</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground font-mono">TOP ALLOCATIONS</p>
                {portfolio.allocation.slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-muted-foreground">{a.type}</span>
                    <span className="font-mono">{formatPercent(a.percentage)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">No data available</div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:col-span-1 border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Budget Overview
            </h2>
            <Link href="/budgets" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              Manage <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          {budgets && budgets.length > 0 ? (
            <div className="space-y-5">
              {budgets.slice(0, 4).map((budget, i) => {
                const isOver = budget.percentage > 100;
                const progressValue = Math.min(budget.percentage, 100);
                
                return (
                  <div key={budget.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-muted-foreground">{budget.category}</span>
                      <span className="font-mono text-xs">{formatCurrency(budget.spent)} / {formatCurrency(budget.limit)}</span>
                    </div>
                    <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${progressValue}%`,
                          backgroundColor: isOver ? 'hsl(var(--destructive))' : budget.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-sm text-muted-foreground mb-4">No budgets set up yet.</p>
              <Link href="/budgets" className="text-xs font-medium text-primary hover:underline">
                Create a budget
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="lg:col-span-1 border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-primary" />
              Recent Transactions
            </h2>
            <Link href="/transactions" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center">
              View all <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
          
          {transactions && transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((tx) => {
                const isPositive = tx.type === "Income" || tx.type === "Investment";
                const Icon = isPositive ? ArrowUpRight : ArrowDownLeft;
                
                return (
                  <div key={tx.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                        isPositive 
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                          : 'bg-destructive/10 text-destructive border-destructive/20'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium leading-none mb-1">{tx.title}</span>
                        <span className="text-xs text-muted-foreground font-mono">{formatDate(tx.date)}</span>
                      </div>
                    </div>
                    <span className={`font-mono text-sm ${isPositive ? 'text-emerald-500' : 'text-foreground'}`}>
                      {isPositive ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              No recent transactions.
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, inverse = false, neutralChange = false, isPercent = false, delay }: { title: string, value: number, change: number, inverse?: boolean, neutralChange?: boolean, isPercent?: boolean, delay: number }) {
  const isPositive = change > 0;
  const isGood = neutralChange ? true : (inverse ? !isPositive : isPositive);
  const changeColor = neutralChange ? "text-muted-foreground" : (isGood ? "text-emerald-500" : "text-destructive");
  const Icon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="border border-border bg-card rounded-xl p-5 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <p className="text-sm text-muted-foreground mb-1 font-medium">{title}</p>
      <h3 className="text-2xl font-bold font-mono tracking-tight">
        {isPercent ? `${value.toFixed(1)}%` : formatCurrency(value)}
      </h3>
      
      {change !== 0 && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-mono ${changeColor}`}>
          <Icon className="w-3 h-3" />
          <span>{Math.abs(change)}%</span>
          <span className="text-muted-foreground ml-1">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
