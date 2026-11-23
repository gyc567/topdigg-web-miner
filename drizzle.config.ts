import { defineConfig } from "drizzle-kit";

// Migrations must use the DIRECT (non-pooled) connection string: Neon's
// pooled endpoint runs PgBouncer in transaction mode, which has no session
// state and breaks DDL. `neon deploy` writes both DATABASE_URL (pooled) and
// DATABASE_URL_UNPOOLED (direct) into .env.local.
const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
