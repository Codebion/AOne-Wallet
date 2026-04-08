import { Router, type IRouter } from "express";
import { db, expensesTable, investmentsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { desc, eq } from "drizzle-orm";
import { requireAuth, getUserId } from "../middleware/requireAuth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}`;

  const [currentExpenses] = await db
    .select({ total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(sql`${expensesTable.userId} = ${userId} AND ${expensesTable.date} like ${monthStr + "%"}`);

  const [prevExpenses] = await db
    .select({ total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(sql`${expensesTable.userId} = ${userId} AND ${expensesTable.date} like ${prevMonthStr + "%"}`);

  const investments = await db.select().from(investmentsTable).where(eq(investmentsTable.userId, userId));

  const totalInvestments = investments.reduce((sum, i) => sum + parseFloat(i.currentValue), 0);
  const totalPurchase = investments.reduce((sum, i) => sum + parseFloat(i.purchaseValue), 0);

  const monthlyExpenses = parseFloat(currentExpenses?.total ?? "0");
  const prevMonthlyExpenses = parseFloat(prevExpenses?.total ?? "0");

  const totalBalance = totalInvestments - monthlyExpenses;
  const savingsRate = 0;

  const expenseChange = prevMonthlyExpenses > 0
    ? ((monthlyExpenses - prevMonthlyExpenses) / prevMonthlyExpenses) * 100
    : 0;

  const investmentGain = totalPurchase > 0
    ? ((totalInvestments - totalPurchase) / totalPurchase) * 100
    : 0;

  res.json({
    totalBalance: Math.round(totalBalance * 100) / 100,
    monthlyIncome: 0,
    monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
    totalInvestments: Math.round(totalInvestments * 100) / 100,
    savingsRate: Math.round(savingsRate * 10) / 10,
    monthlyChange: Math.round(expenseChange * 10) / 10,
    expenseChange: Math.round(expenseChange * 10) / 10,
    investmentGain: Math.round(investmentGain * 10) / 10,
  });
});

router.get("/dashboard/spending-trend", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, "0")}`;
    const monthLabel = d.toLocaleString("en-IN", { month: "short" });

    const [row] = await db
      .select({ total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)` })
      .from(expensesTable)
      .where(sql`${expensesTable.userId} = ${userId} AND ${expensesTable.date} like ${monthStr + "%"}`);

    const expenses = parseFloat(row?.total ?? "0");

    months.push({
      month: monthLabel,
      expenses: Math.round(expenses * 100) / 100,
      income: 0,
      savings: Math.round(-expenses * 100) / 100,
    });
  }

  res.json(months);
});

router.get("/dashboard/category-breakdown", requireAuth, async (req, res): Promise<void> => {
  const userId = getUserId(req);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const monthStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;

  const rows = await db
    .select({
      category: expensesTable.category,
      total: sql<string>`coalesce(sum(${expensesTable.amount}), 0)`,
    })
    .from(expensesTable)
    .where(sql`${expensesTable.userId} = ${userId} AND ${expensesTable.date} like ${monthStr + "%"}`)
    .groupBy(expensesTable.category)
    .orderBy(desc(sql`sum(${expensesTable.amount})`));

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
    Other: "#94a3b8",
  };

  const totalAmount = rows.reduce((sum, r) => sum + parseFloat(r.total), 0);

  res.json(
    rows.map((r) => ({
      category: r.category,
      amount: Math.round(parseFloat(r.total) * 100) / 100,
      percentage: totalAmount > 0
        ? Math.round((parseFloat(r.total) / totalAmount) * 10000) / 100
        : 0,
      color: categoryColors[r.category] ?? "#94a3b8",
    }))
  );
});

export default router;
