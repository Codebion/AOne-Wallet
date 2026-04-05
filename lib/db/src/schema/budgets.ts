import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const budgetsTable = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  category: text("category").notNull(),
  limit: numeric("limit", { precision: 12, scale: 2 }).notNull(),
  color: text("color").notNull().default("#6366f1"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBudgetSchema = createInsertSchema(budgetsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
});
export type InsertBudget = z.infer<typeof insertBudgetSchema>;
export type Budget = typeof budgetsTable.$inferSelect;
