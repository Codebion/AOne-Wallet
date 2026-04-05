import React, { useState } from "react";
import { useListTransactions } from "@workspace/api-client-react";
import { formatDate } from "@/lib/format";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Transactions() {
  const { formatAmount } = useCurrency();
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const { data: transactions, isLoading } = useListTransactions(
    typeFilter !== "all" ? { type: typeFilter } : undefined
  );

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING_DATA...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm">Unified history of all activities</p>
        </div>
        
        <div className="w-[180px]">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="bg-card border-border">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Expense">Expenses</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Investment">Investments</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        {(!transactions || transactions.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ArrowRightLeft className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-muted-foreground text-sm">Your financial activity will appear here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs w-[120px]">DATE</TableHead>
                <TableHead className="font-mono text-xs">DETAILS</TableHead>
                <TableHead className="font-mono text-xs">CATEGORY</TableHead>
                <TableHead className="font-mono text-xs text-right">AMOUNT</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const isPositive = tx.type === "Income" || tx.type === "Investment";
                const Icon = isPositive ? ArrowUpRight : ArrowDownLeft;
                
                return (
                  <TableRow key={`${tx.type}-${tx.id}`} className="border-border hover:bg-white/5 transition-colors">
                    <TableCell className="font-mono text-muted-foreground text-sm">
                      {formatDate(tx.date)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                          isPositive 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{tx.title}</span>
                          <span className="text-xs text-muted-foreground font-mono">{tx.type}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">
                        {tx.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      <span className={isPositive ? 'text-emerald-500' : 'text-foreground'}>
                        {isPositive ? '+' : '-'}{formatAmount(tx.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
