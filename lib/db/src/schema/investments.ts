import { pgTable, text, serial, timestamp, numeric, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const investmentsTable = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
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
  userId: true,
  createdAt: true,
});
export type InsertInvestment = z.infer<typeof insertInvestmentSchema>;
export type Investment = typeof investmentsTable.$inferSelect;
