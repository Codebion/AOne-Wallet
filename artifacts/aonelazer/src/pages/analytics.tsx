import React from "react";
import { 
  useGetMonthlySummary, 
  useGetTopExpenses, 
  useGetNetWorthTrend 
} from "@workspace/api-client-react";
import { formatPercent } from "@/lib/format";
import { useCurrency } from "@/contexts/CurrencyContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  AreaChart, Area, ComposedChart
} from "recharts";
import { motion } from "framer-motion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Analytics() {
  const { formatAmount } = useCurrency();
  const { data: monthlySummary, isLoading: loadingMonthly } = useGetMonthlySummary();
  const { data: topExpenses, isLoading: loadingTop } = useGetTopExpenses();
  const { data: netWorthTrend, isLoading: loadingNetWorth } = useGetNetWorthTrend();

  const isLoading = loadingMonthly || loadingTop || loadingNetWorth;

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING_DATA...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your financial data</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Net Worth Trend */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-6">Net Worth Trend (6 Months)</h2>
          {netWorthTrend && netWorthTrend.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorthTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorInvestments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => formatAmount(value)}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="netWorth" name="Net Worth" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorNetWorth)" />
                  <Area type="monotone" dataKey="investments" name="Investments" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorInvestments)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Not enough data to display trend</div>
          )}
        </motion.div>

        {/* Monthly Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border border-border bg-card rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-6">Income vs Expenses (12 Months)</h2>
          {monthlySummary && monthlySummary.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySummary} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `₹${val/1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    formatter={(value: number) => formatAmount(value)}
                  />
                  <Legend />
                  <Bar dataKey="totalIncome" name="Income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="totalExpenses" name="Expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Not enough data</div>
          )}
        </motion.div>

        {/* Top Expenses */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-border bg-card rounded-xl p-6 shadow-sm"
        >
          <h2 className="font-semibold mb-6">Top Expense Categories</h2>
          {topExpenses && topExpenses.length > 0 ? (
            <div className="space-y-6">
              <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart layout="vertical" data={topExpenses} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" hide />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      formatter={(value: number) => formatAmount(value)}
                    />
                    <Bar dataKey="amount" barSize={20} radius={[0, 4, 4, 0]}>
                      {topExpenses.map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.color || 'hsl(var(--primary))'} />
                      ))}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="font-mono text-xs">CATEGORY</TableHead>
                    <TableHead className="font-mono text-xs text-right">TOTAL</TableHead>
                    <TableHead className="font-mono text-xs text-right">% OF TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topExpenses.map((expense) => (
                    <TableRow key={expense.category} className="border-border">
                      <TableCell className="font-medium flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: expense.color || 'hsl(var(--primary))' }} />
                        {expense.category}
                      </TableCell>
                      <TableCell className="text-right font-mono">{formatAmount(expense.amount)}</TableCell>
                      <TableCell className="text-right font-mono">{formatPercent(expense.percentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">No expense data available</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
