import React, { useState } from "react";
import { 
  useGetPortfolioSummary, 
  useListInvestments, 
  useCreateInvestment, 
  useDeleteInvestment, 
  getListInvestmentsQueryKey, 
  getGetPortfolioSummaryQueryKey 
} from "@workspace/api-client-react";
import { formatPercent } from "@/lib/format";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, LineChart as LineChartIcon } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Investments() {
  const { formatAmount } = useCurrency();
  const { data: summary, isLoading: loadingSummary } = useGetPortfolioSummary();
  const { data: investments, isLoading: loadingInvestments } = useListInvestments();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteInvestment();
  
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvestmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
      }
    });
  };

  if (loadingSummary || loadingInvestments) {
    return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING_DATA...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investments</h1>
          <p className="text-muted-foreground text-sm">Portfolio overview and holdings</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Position
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle>New Investment</DialogTitle>
            </DialogHeader>
            <AddInvestmentForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1 border border-border bg-card rounded-xl p-6 shadow-sm flex flex-col justify-center items-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            <p className="text-sm text-muted-foreground mb-2 relative z-10">Total Portfolio Value</p>
            <h2 className="text-4xl font-bold font-mono tracking-tight relative z-10">{formatAmount(summary.totalValue)}</h2>
            
            <div className={`mt-4 flex items-center gap-2 font-mono text-sm px-3 py-1.5 rounded-full border ${summary.totalGainLoss >= 0 ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' : 'text-destructive border-destructive/20 bg-destructive/10'} relative z-10`}>
              <span>{summary.totalGainLoss >= 0 ? '+' : ''}{formatAmount(summary.totalGainLoss)}</span>
              <span>({summary.totalGainLoss >= 0 ? '+' : ''}{summary.totalGainLossPercent.toFixed(2)}%)</span>
              <span className="text-muted-foreground text-xs ml-1">All time</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 border border-border bg-card rounded-xl p-6 shadow-sm flex items-center"
          >
            <div className="w-1/2 h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.allocation}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {summary.allocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    formatter={(value: number) => formatAmount(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4 pl-4 border-l border-border/50">
              <h3 className="font-semibold text-sm text-muted-foreground font-mono">ALLOCATION</h3>
              <div className="space-y-3">
                {summary.allocation.map((a, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: a.color, boxShadow: `0 0 8px ${a.color}` }} />
                        <span className="font-medium">{a.type}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{formatPercent(a.percentage)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        {(!investments || investments.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <LineChartIcon className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No investments found</p>
            <p className="text-muted-foreground text-sm mb-6">Add your first holding to start tracking.</p>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add Position</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs">ASSET</TableHead>
                <TableHead className="font-mono text-xs">TYPE</TableHead>
                <TableHead className="font-mono text-xs text-right">PRICE / SHARES</TableHead>
                <TableHead className="font-mono text-xs text-right">VALUE</TableHead>
                <TableHead className="font-mono text-xs text-right">RETURN</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {investments.map((inv) => (
                <TableRow key={inv.id} className="border-border hover:bg-white/5 transition-colors group">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{inv.name}</span>
                      {inv.ticker && <span className="text-xs text-muted-foreground font-mono">{inv.ticker}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">
                      {inv.type}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col font-mono">
                      {inv.shares && inv.shares > 0 ? (
                        <>
                          <span className="text-sm">{formatAmount(inv.currentValue / inv.shares)}</span>
                          <span className="text-xs text-muted-foreground">{inv.shares} shrs</span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    {formatAmount(inv.currentValue)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <div className={`flex flex-col ${inv.gainLoss >= 0 ? 'text-emerald-500' : 'text-destructive'}`}>
                      <span className="text-sm">{inv.gainLoss >= 0 ? '+' : ''}{formatAmount(inv.gainLoss)}</span>
                      <span className="text-xs">{inv.gainLossPercent >= 0 ? '+' : ''}{inv.gainLossPercent.toFixed(2)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleDelete(inv.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

function AddInvestmentForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateInvestment();
  
  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    type: "Stock",
    currentValue: "",
    purchaseValue: "",
    shares: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.currentValue || !formData.purchaseValue) return;
    
    createMutation.mutate({
      data: {
        name: formData.name,
        ticker: formData.ticker || null,
        type: formData.type,
        currentValue: parseFloat(formData.currentValue),
        purchaseValue: parseFloat(formData.purchaseValue),
        shares: formData.shares ? parseFloat(formData.shares) : null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListInvestmentsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetPortfolioSummaryQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Asset Name</Label>
          <Input 
            id="name" 
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Apple Inc."
            className="bg-background border-input"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ticker">Ticker (Optional)</Label>
          <Input 
            id="ticker" 
            value={formData.ticker}
            onChange={e => setFormData({ ...formData, ticker: e.target.value })}
            placeholder="AAPL"
            className="bg-background border-input font-mono uppercase"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="type">Asset Class</Label>
        <Select 
          value={formData.type} 
          onValueChange={v => setFormData({ ...formData, type: v })}
        >
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Stock">Stock</SelectItem>
            <SelectItem value="Mutual Fund">Mutual Fund</SelectItem>
            <SelectItem value="ETF">ETF</SelectItem>
            <SelectItem value="Crypto">Crypto</SelectItem>
            <SelectItem value="Bond">Bond</SelectItem>
            <SelectItem value="Real Estate">Real Estate</SelectItem>
            <SelectItem value="Gold">Gold</SelectItem>
            <SelectItem value="Fixed Deposit">Fixed Deposit</SelectItem>
            <SelectItem value="PPF">PPF</SelectItem>
            <SelectItem value="NPS">NPS</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="purchaseValue">Cost Basis</Label>
          <Input 
            id="purchaseValue" 
            type="number"
            step="0.01"
            value={formData.purchaseValue}
            onChange={e => setFormData({ ...formData, purchaseValue: e.target.value })}
            placeholder="0.00"
            className="bg-background border-input font-mono"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Value</Label>
          <Input 
            id="currentValue" 
            type="number"
            step="0.01"
            value={formData.currentValue}
            onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
            placeholder="0.00"
            className="bg-background border-input font-mono"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="shares">Shares (Optional)</Label>
        <Input 
          id="shares" 
          type="number"
          step="0.0001"
          value={formData.shares}
          onChange={e => setFormData({ ...formData, shares: e.target.value })}
          placeholder="0.00"
          className="bg-background border-input font-mono"
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createMutation.isPending ? "Adding..." : "Add Position"}
        </Button>
      </div>
    </form>
  );
}
