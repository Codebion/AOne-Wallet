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

export default router;
