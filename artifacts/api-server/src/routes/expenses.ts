import { Router, type IRouter } from "express";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { db, expensesTable } from "@workspace/db";
import {
  CreateExpenseBody,
  UpdateExpenseBody,
  GetExpenseParams,
  UpdateExpenseParams,
  DeleteExpenseParams,
  ListExpensesQueryParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middleware/requireAuth";

const router: IRouter = Router();

router.get("/expenses", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const query = ListExpensesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { category, startDate, endDate, limit } = query.data;
  const conditions = [eq(expensesTable.userId, userId)];

  if (category) conditions.push(eq(expensesTable.category, category));
  if (startDate) conditions.push(gte(expensesTable.date, startDate));
  if (endDate) conditions.push(lte(expensesTable.date, endDate));

  const rows = await db
    .select()
    .from(expensesTable)
    .where(and(...conditions))
    .orderBy(desc(expensesTable.date))
    .limit(limit ?? 100);

  res.json(rows.map((r) => ({ ...r, amount: parseFloat(r.amount) })));
});

router.post("/expenses", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expense] = await db
    .insert(expensesTable)
    .values({ ...parsed.data, userId, amount: String(parsed.data.amount) })
    .returning();

  res.status(201).json({ ...expense, amount: parseFloat(expense.amount) });
});

router.get("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = GetExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [expense] = await db
    .select()
    .from(expensesTable)
    .where(and(eq(expensesTable.id, params.data.id), eq(expensesTable.userId, userId)));

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json({ ...expense, amount: parseFloat(expense.amount) });
});

router.patch("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = UpdateExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.amount !== undefined) {
    updateData.amount = String(parsed.data.amount);
  }

  const [expense] = await db
    .update(expensesTable)
    .set(updateData)
    .where(and(eq(expensesTable.id, params.data.id), eq(expensesTable.userId, userId)))
    .returning();

  if (!expense) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json({ ...expense, amount: parseFloat(expense.amount) });
});

router.delete("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteExpenseParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(expensesTable)
    .where(and(eq(expensesTable.id, params.data.id), eq(expensesTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
