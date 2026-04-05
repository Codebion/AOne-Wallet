import { Router, type IRouter } from "express";
import { eq, desc, and } from "drizzle-orm";
import { db, investmentsTable } from "@workspace/db";
import {
  CreateInvestmentBody,
  UpdateInvestmentBody,
  UpdateInvestmentParams,
  DeleteInvestmentParams,
} from "@workspace/api-zod";
import { requireAuth, getUserId } from "../middleware/requireAuth";

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

router.get("/investments", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db
    .select()
    .from(investmentsTable)
    .where(eq(investmentsTable.userId, userId))
    .orderBy(desc(investmentsTable.createdAt));
  res.json(rows.map(formatInvestment));
});

router.get("/investments/portfolio-summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const rows = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, userId));
  const formatted = rows.map(formatInvestment);

  const totalValue = formatted.reduce((sum, i) => sum + i.currentValue, 0);
  const totalPurchase = formatted.reduce((sum, i) => sum + i.purchaseValue, 0);
  const totalGainLoss = totalValue - totalPurchase;
  const totalGainLossPercent = totalPurchase > 0 ? (totalGainLoss / totalPurchase) * 100 : 0;

  const typeColors: Record<string, string> = {
    Stock: "#6366f1",
    "Mutual Fund": "#22d3ee",
    ETF: "#f59e0b",
    Crypto: "#10b981",
    Bond: "#f43f5e",
    "Real Estate": "#8b5cf6",
    Gold: "#eab308",
    "Fixed Deposit": "#06b6d4",
    PPF: "#84cc16",
    NPS: "#fb923c",
    Other: "#94a3b8",
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

router.post("/investments", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const parsed = CreateInvestmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [investment] = await db
    .insert(investmentsTable)
    .values({
      ...parsed.data,
      userId,
      currentValue: String(parsed.data.currentValue),
      purchaseValue: String(parsed.data.purchaseValue),
      shares: parsed.data.shares != null ? String(parsed.data.shares) : null,
    })
    .returning();

  res.status(201).json(formatInvestment(investment));
});

router.patch("/investments/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
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
    .where(and(eq(investmentsTable.id, params.data.id), eq(investmentsTable.userId, userId)))
    .returning();

  if (!investment) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.json(formatInvestment(investment));
});

router.delete("/investments/:id", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const params = DeleteInvestmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(investmentsTable)
    .where(and(eq(investmentsTable.id, params.data.id), eq(investmentsTable.userId, userId)))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Investment not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
