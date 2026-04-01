import React, { useState } from "react";
import { 
  useListExpenses, 
  useCreateExpense, 
  useDeleteExpense, 
  getListExpensesQueryKey 
} from "@workspace/api-client-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Expenses() {
  const { data: expenses, isLoading } = useListExpenses();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteExpense();
  
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
      }
    });
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-primary font-mono animate-pulse">LOADING_DATA...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground text-sm">Manage and track your outgoings</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle>New Expense</DialogTitle>
            </DialogHeader>
            <AddExpenseForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        {(!expenses || expenses.length === 0) ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Receipt className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-medium">No expenses yet</p>
            <p className="text-muted-foreground text-sm mb-6">Track your first expense to see it here.</p>
            <Button variant="outline" onClick={() => setIsAddOpen(true)}>Add Expense</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-mono text-xs">DATE</TableHead>
                <TableHead className="font-mono text-xs">TITLE</TableHead>
                <TableHead className="font-mono text-xs">CATEGORY</TableHead>
                <TableHead className="font-mono text-xs text-right">AMOUNT</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense, i) => (
                <TableRow key={expense.id} className="border-border hover:bg-white/5 transition-colors group">
                  <TableCell className="font-mono text-muted-foreground">{formatDate(expense.date)}</TableCell>
                  <TableCell className="font-medium">{expense.title}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs border border-border">
                      {expense.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-muted-foreground hover:text-destructive transition-all"
                      onClick={() => handleDelete(expense.id)}
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

function AddExpenseForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateExpense();
  
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Housing",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;
    
    createMutation.mutate({
      data: {
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: formData.category,
        date: formData.date
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListExpensesQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          placeholder="e.g. Rent, Groceries"
          className="bg-background border-input"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input 
            id="amount" 
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className="bg-background border-input font-mono"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date"
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="bg-background border-input"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select 
          value={formData.category} 
          onValueChange={v => setFormData({ ...formData, category: v })}
        >
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Housing">Housing</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Transportation">Transportation</SelectItem>
            <SelectItem value="Utilities">Utilities</SelectItem>
            <SelectItem value="Entertainment">Entertainment</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createMutation.isPending ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}
