import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, transactionsTable } from "@workspace/db";
import { ListTransactionsQueryParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/transactions", async (req, res): Promise<void> => {
  const query = ListTransactionsQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const { limit, type } = query.data;

  let q = db
    .select()
    .from(transactionsTable)
    .orderBy(desc(transactionsTable.date))
    .limit(limit ?? 50)
    .$dynamic();

  if (type) {
    q = q.where(eq(transactionsTable.type, type));
  }

  const rows = await q;
  res.json(
    rows.map((r) => ({
      ...r,
      amount: parseFloat(r.amount),
    }))
  );
});

router.post("/transactions", async (req, res): Promise<void> => {
  const { title, amount, type, category, date, icon } = req.body ?? {};
  if (!title || !amount || !type || !category || !date) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [transaction] = await db
    .insert(transactionsTable)
    .values({ title, amount: String(amount), type, category, date, icon: icon ?? null })
    .returning();

  res.status(201).json({ ...transaction, amount: parseFloat(transaction.amount) });
});

router.delete("/transactions/:id", async (req, res): Promise<void> => {
  const id = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id, 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid ID" });
    return;
  }

  const [deleted] = await db
    .delete(transactionsTable)
    .where(eq(transactionsTable.id, id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Transaction not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
