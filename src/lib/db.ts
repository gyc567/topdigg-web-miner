/**
 * Drizzle client for the app's own Postgres (user/session via Better Auth,
 * plus our entitlement/webhook tables).
 *
 * Uses node-postgres (TCP) — works locally and with Neon's pooler connection
 * string in production. The @neondatabase/serverless HTTP driver is only
 * needed if a function runs on the Edge runtime; the auth handler is Node.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../db/schema.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool, { schema });
export { schema };
