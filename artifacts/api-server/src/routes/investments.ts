import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, investmentsTable } from "@workspace/db";
import {
  CreateInvestmentBody,
  UpdateInvestmentBody,
  UpdateInvestmentParams,
  DeleteInvestmentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatInvestment(row: typeof investmentsTable.$inferSelect) {
  const currentValue = parseFloat(row.currentValue);
  const purchaseValue = parseFloat(row.purchaseValue);
  const gainLoss = currentValue - purchaseValue;
  const gainLossPercent = purchaseValue > 0 ? (gainLoss / purchaseValue) * 100 : 0;

  return {
    ...row,
    currentValue,
    purchaseValue,
    shares: row.shares ? parseFloat(row.shares) : null,
    gainLoss: Math.round(gainLoss * 100) / 100,
    gainLossPercent: Math.round(gainLossPercent * 100) / 100,
  };
}

router.get("/investments", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investmentsTable).orderBy(desc(investmentsTable.createdAt));
  res.json(rows.map(formatInvestment));
});

router.get("/investments/portfolio-summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(investmentsTable);
  const formatted = rows.map(formatInvestment);

  const totalValue = formatted.reduce((sum, i) => sum + i.currentValue, 0);
  const totalPurchase = formatted.reduce((sum, i) => sum + i.purchaseValue, 0);
  const totalGainLoss = totalValue - totalPurchase;
  const totalGainLossPercent = totalPurchase > 0 ? (totalGainLoss / totalPurchase) * 100 : 0;

  const typeColors: Record<string, string> = {
    Stock: "#6366f1",
    ETF: "#22d3ee",
    Crypto: "#f59e0b",
    Bond: "#10b981",
    "Real Estate": "#f43f5e",
    Other: "#8b5cf6",
  };

  const allocationMap = new Map<string, number>();
  for (const inv of formatted) {
    allocationMap.set(inv.type, (allocationMap.get(inv.type) ?? 0) + inv.currentValue);
  }

  const allocation = Array.from(allocationMap.entries()).map(([type, value]) => ({
    type,
    value: Math.round(value * 100) / 100,
    percentage: totalValue > 0 ? Math.round((value / totalValue) * 10000) / 100 : 0,
    color: typeColors[type] ?? "#8b5cf6",
  }));

  res.json({
    totalValue: Math.round(totalValue * 100) / 100,
    totalGainLoss: Math.round(totalGainLoss * 100) / 100,
    totalGainLossPercent: Math.round(totalGainLossPercent * 100) / 100,
    allocation,
  });
});

router.post("/investments", async (req, res): Promise<void> => {
  const parsed = CreateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [investment] = await db
    .insert(investmentsTable)
    .values({
      ...parsed.data,
      currentValue: String(parsed.data.currentValue),
      purchaseValue: String(parsed.data.purchaseValue),
      shares: parsed.data.shares != null ? String(parsed.data.shares) : null,
    })
    .returning();

  res.status(201).json(formatInvestment(investment));
});

router.patch("/investments/:id", async (req, res): Promise<void> => {
  const params = UpdateInvestmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.currentValue !== undefined) updateData.currentValue = String(parsed.data.currentValue);
  if (parsed.data.purchaseValue !== undefined) updateData.purchaseValue = String(parsed.data.purchaseValue);
  if (parsed.data.shares !== undefined) updateData.shares = parsed.data.shares != null ? String(parsed.data.shares) : null;

  const [investment] = await db
    .update(investmentsTable)
    .set(updateData)
    .where(eq(investmentsTable.id, params.data.id))
    .returning();

  if (!investment) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.json(formatInvestment(investment));
});

router.delete("/investments/:id", async (req, res): Promise<void> => {
  const params = DeleteInvestmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(investmentsTable)
    .where(eq(investmentsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
