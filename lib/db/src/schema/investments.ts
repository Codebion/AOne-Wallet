import { pgTable, text, serial, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const investmentsTable = pgTable("investments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ticker: text("ticker"),
  type: text("type").notNull(),
  currentValue: numeric("current_value", { precision: 14, scale: 2 }).notNull(),
  purchaseValue: numeric("purchase_value", { precision: 14, scale: 2 }).notNull(),
  shares: numeric("shares", { precision: 14, scale: 6 }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertInvestmentSchema = createInsertSchema(investmentsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investmentsTable.$inferSelect;
