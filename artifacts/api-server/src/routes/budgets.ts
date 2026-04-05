import { Router, type IRouter } from "express";
import { eq, and, sql } from "drizzle-orm";
import { db, budgetsTable, expensesTable } from "@workspace/db";
import {
  CreateBudgetBody,
  UpdateBudgetBody,
  UpdateBudgetParams,
  DeleteBudgetParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middleware/requireAuth";

const router: IRouter = Router();

router.get("/budgets", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const budgets = await db.select().from(budgetsTable).where(eq(budgetsTable.userId, userId));

  const now = new Date();
  const firstOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const lastOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const result = await Promise.all(
    budgets.map(async (budget) => {
      const [row] = await db
        .select({ total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)` })
        .from(expensesTable)
        .where(
          sql`${expensesTable.user_id} = ${userId} AND ${expensesTable.category} = ${budget.category} AND ${expensesTable.date} >= ${firstOfMonth} AND ${expensesTable.date} <= ${lastOfMonth}`
        );

      const spent = parseFloat(row?.total ?? "0");
      const limit = parseFloat(budget.limit);
      const remaining = Math.max(0, limit - spent);
      const percentage = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;

      return {
        ...budget,
        limit,
        spent: Math.round(spent * 100) / 100,
        remaining: Math.round(remaining * 100) / 100,
        percentage,
      };
    })
  );

  res.json(result);
});

router.post("/budgets", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [budget] = await db
    .insert(budgetsTable)
    .values({ ...parsed.data, userId, limit: String(parsed.data.limit) })
    .returning();

  res.status(201).json({
    ...budget,
    limit: parseFloat(budget.limit),
    spent: 0,
    remaining: parseFloat(budget.limit),
    percentage: 0,
  });
});

router.patch("/budgets/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateBudgetBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.limit !== undefined) updateData.limit = String(parsed.data.limit);

  const [budget] = await db
    .update(budgetsTable)
    .set(updateData)
    .where(and(eq(budgetsTable.id, params.data.id), eq(budgetsTable.userId, userId)))
    .returning();

  if (!budget) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.json({
    ...budget,
    limit: parseFloat(budget.limit),
    spent: 0,
    remaining: parseFloat(budget.limit),
    percentage: 0,
  });
});

router.delete("/budgets/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteBudgetParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(budgetsTable)
    .where(and(eq(budgetsTable.id, params.data.id), eq(budgetsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Budget not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
