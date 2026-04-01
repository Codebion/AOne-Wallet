import { Router, type IRouter } from "express";
import { db, expensesTable, investmentsTable } from "@workspace/db";
import { sql, desc } from "drizzle-orm";

const router: IRouter = Router();

const categoryColors: Record<string, string> = {
  Food: "#6366f1",
  Housing: "#22d3ee",
  Transport: "#f59e0b",
  Entertainment: "#10b981",
  Healthcare: "#f43f5e",
  Shopping: "#8b5cf6",
  Utilities: "#06b6d4",
  Education: "#84cc16",
  Travel: "#fb923c",
  Dental: "#ec4899",
  Personal: "#14b8a6",
  Insurance: "#f97316",
  "Mutual Fund": "#a855f7",
  Other: "#94a3b8",
};

router.get("/analytics/monthly-summary", async (_req, res): Promise<void> => {
  const now = new Date();
  const results = [];

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });

    const [row] = await db
      .select({
        total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)`,
        count: sql<string>`count(*)`,
      })
      .from(expensesTable)
      .where(sql`${expensesTable.date} like ${monthStr + "%"}`);

    const totalExpenses = parseFloat(row?.total ?? "0");
    const expenseCount = parseInt(row?.count ?? "0");
    const totalIncome = 85000;
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

    results.push({
      month: label,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalIncome,
      netSavings: Math.round(netSavings * 100) / 100,
      savingsRate: Math.round(savingsRate * 10) / 10,
      expenseCount,
    });
  }

  res.json(results);
});

router.get("/analytics/top-expenses", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      category: expensesTable.category,
      total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)`,
      count: sql<string>`count(*)`,
    })
    .from(expensesTable)
    .groupBy(expensesTable.category)
    .orderBy(desc(sql`sum(${expensesTable.amount})`));

  const grandTotal = rows.reduce((s, r) => s + parseFloat(r.total), 0);

  res.json(
    rows.map((r) => ({
      category: r.category,
      amount: Math.round(parseFloat(r.total) * 100) / 100,
      count: parseInt(r.count),
      percentage: grandTotal > 0 ? Math.round((parseFloat(r.total) / grandTotal) * 10000) / 100 : 0,
      color: categoryColors[r.category] ?? "#94a3b8",
    }))
  );
});

router.get("/analytics/net-worth-trend", async (_req, res): Promise<void> => {
  const now = new Date();
  const results = [];

  const investments = await db.select().from(investmentsTable);
  const totalInvestments = investments.reduce((s, i) => s + parseFloat(i.currentValue), 0);

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "short" });

    const [row] = await db
      .select({ total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)` })
      .from(expensesTable)
      .where(sql`${expensesTable.date} like ${monthStr + "%"}`);

    const expenses = parseFloat(row?.total ?? "0");
    const income = 85000;
    const cash = income - expenses;
    const investmentFactor = 1 - (i * 0.02);
    const investmentsForMonth = totalInvestments * investmentFactor;
    const netWorth = cash + investmentsForMonth;

    results.push({
      month: label,
      netWorth: Math.round(netWorth * 100) / 100,
      investments: Math.round(investmentsForMonth * 100) / 100,
      cash: Math.round(cash * 100) / 100,
    });
  }

  res.json(results);
});

export default router;
