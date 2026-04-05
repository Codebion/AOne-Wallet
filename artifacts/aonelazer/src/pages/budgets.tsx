import React, { useState } from "react";
import { 
  useListBudgets, 
  useCreateBudget, 
  useDeleteBudget,
  useUpdateBudget,
  getListBudgetsQueryKey 
} from "@workspace/api-client-react";
import { formatPercent } from "@/lib/format";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Wallet, Edit2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";

export default function Budgets() {
  const { formatAmount } = useCurrency();
  const { data: budgets, isLoading } = useListBudgets();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteBudget();
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{id: number, limit: number, category: string} | null>(null);

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
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
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground text-sm">Monthly spending limits</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle>New Budget Limit</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground mb-2">Tip: Add expenses with the same category name to track spending automatically.</p>
            <AddBudgetForm onSuccess={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>

        <Dialog open={!!editingBudget} onOpenChange={(open) => !open && setEditingBudget(null)}>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle>Edit Budget: {editingBudget?.category}</DialogTitle>
            </DialogHeader>
            {editingBudget && (
              <EditBudgetForm budget={editingBudget} onSuccess={() => setEditingBudget(null)} />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {(!budgets || budgets.length === 0) ? (
        <div className="border border-border bg-card rounded-xl shadow-sm flex flex-col items-center justify-center py-16 text-center">
          <Wallet className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium">No budgets set</p>
          <p className="text-muted-foreground text-sm mb-6">Set spending limits to keep your finances on track.</p>
          <Button variant="outline" onClick={() => setIsAddOpen(true)}>Create Budget</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map((budget, i) => {
            const isOver = budget.percentage > 100;
            const isWarning = budget.percentage >= 70 && budget.percentage <= 100;
            const isSafe = budget.percentage < 70;
            const progressValue = Math.min(budget.percentage, 100);
            
            let colorClass = budget.color;
            if (isOver) colorClass = 'hsl(var(--destructive))';
            else if (isWarning) colorClass = '#fbbf24'; // amber
            else if (isSafe) colorClass = '#10b981'; // green

            return (
              <motion.div 
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="border border-border bg-card rounded-xl p-6 shadow-sm relative group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorClass, boxShadow: `0 0 10px ${colorClass}` }} />
                    <h3 className="font-medium text-lg">{budget.category}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all -mt-2 -mr-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => setEditingBudget({id: budget.id, limit: budget.limit, category: budget.category})}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(budget.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-2 font-mono text-sm">
                  <div>
                    <span className="text-muted-foreground">SPENT: </span>
                    <span className={isOver ? "text-destructive font-medium" : "text-foreground"}>
                      {formatAmount(budget.spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-muted-foreground">LIMIT: </span>
                    <span className="text-foreground">{formatAmount(budget.limit)}</span>
                  </div>
                </div>

                <div className="relative h-2 w-full bg-secondary rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ 
                      width: `${progressValue}%`,
                      backgroundColor: colorClass 
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs font-mono">
                  <span className={isOver ? "text-destructive" : "text-muted-foreground"}>
                    {formatPercent(budget.percentage)} used
                  </span>
                  <span className="text-muted-foreground">
                    {budget.remaining >= 0 ? `${formatAmount(budget.remaining)} left` : `${formatAmount(Math.abs(budget.remaining))} over`}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AddBudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const createMutation = useCreateBudget();
  
  const [formData, setFormData] = useState({
    category: "",
    limit: "",
    color: "#10b981"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.limit) return;
    
    createMutation.mutate({
      data: {
        category: formData.category,
        limit: parseFloat(formData.limit),
        color: formData.color
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input 
          id="category" 
          value={formData.category}
          onChange={e => setFormData({ ...formData, category: e.target.value })}
          placeholder="e.g. Dining, Dental, Travel"
          className="bg-background border-input"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="limit">Monthly Limit</Label>
        <Input 
          id="limit" 
          type="number"
          step="0.01"
          value={formData.limit}
          onChange={e => setFormData({ ...formData, limit: e.target.value })}
          placeholder="0.00"
          className="bg-background border-input font-mono"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="color">Accent Color</Label>
        <div className="flex gap-2">
          <Input 
            id="color" 
            type="color"
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
            className="w-16 h-10 p-1 bg-background border-input"
          />
          <Input 
            type="text"
            value={formData.color}
            onChange={e => setFormData({ ...formData, color: e.target.value })}
            className="flex-1 bg-background border-input font-mono uppercase"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={createMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {createMutation.isPending ? "Creating..." : "Create Budget"}
        </Button>
      </div>
    </form>
  );
}

function EditBudgetForm({ budget, onSuccess }: { budget: {id: number, limit: number, category: string}, onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateBudget();
  
  const [limit, setLimit] = useState(budget.limit.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!limit) return;
    
    updateMutation.mutate({
      id: budget.id,
      data: {
        limit: parseFloat(limit)
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListBudgetsQueryKey() });
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="space-y-2">
        <Label htmlFor="edit-limit">Monthly Limit</Label>
        <Input 
          id="edit-limit" 
          type="number"
          step="0.01"
          value={limit}
          onChange={e => setLimit(e.target.value)}
          placeholder="0.00"
          className="bg-background border-input font-mono"
          required
        />
      </div>

      <div className="flex justify-end pt-4">
        <Button 
          type="submit" 
          disabled={updateMutation.isPending}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {updateMutation.isPending ? "Updating..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
