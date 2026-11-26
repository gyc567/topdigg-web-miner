/**
 * App-owned tables (Better Auth manages its own — see auth-schema.ts).
 */
import { pgTable, text, timestamp, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { user } from "./auth-schema.js";

/** Content unlocked by purchase or credit redemption. */
export const contentUnlock = pgTable(
  "content_unlock",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    section: text("section").notNull(),
    contentSlug: text("content_slug").notNull(),
    source: text("source").notNull(), // 'purchase' | 'credit'
    creditsSpent: integer("credits_spent").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("content_unlock_user_slug_idx").on(table.userId, table.contentSlug)],
);
