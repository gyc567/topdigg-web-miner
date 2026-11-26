/**
 * Drizzle client for the app's own Postgres (user/session via Better Auth,
 * plus our entitlement/webhook tables).
 *
 * Driver choice follows the Neon agent skills:
 *   - App runtime on Vercel → node-postgres (`pg`) with the POOLED connection
 *     string. Pooling matters in serverless runtimes with bursty concurrency.
 *   - Migrations (drizzle-kit) → the DIRECT connection string, see
 *     drizzle.config.ts. PgBouncer transaction mode has no session state.
 *
 * @neondatabase/serverless is only needed on Edge runtimes; the auth handler
 * runs on Node, so `pg` is the right choice here.
 */
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { attachDatabasePool } from "@vercel/functions/db-connections";
import * as schema from "../db/schema.js";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Neon (and any remote Postgres) rejects plaintext connections with
// "connection is insecure (try using `sslmode=require`)". The production
// DATABASE_URL carries no sslmode param, so turn TLS on explicitly unless the
// URL is local or already states an sslmode (pg honours that one itself).
export function needsSsl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.searchParams.get("sslmode")) return false;
    return !["localhost", "127.0.0.1", "::1", "[::1]"].includes(u.hostname);
  } catch {
    return false;
  }
}

export const pool = new pg.Pool({
  connectionString,
  ...(needsSsl(connectionString) ? { ssl: { rejectUnauthorized: true } } : {}),
});

// Keep the function instance alive long enough for idle connections to be
// reaped (Vercel Fluid compute). No-op outside Vercel.
if (process.env.VERCEL) {
  try {
    attachDatabasePool(pool);
  } catch {
    // Older @vercel/functions without the export — pooling still works.
  }
}

export const db = drizzle(pool, { schema });
export { schema };
