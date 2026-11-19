/**
 * GET /api/content/ai-daily/:slug — gated full content for AI Daily reports.
 *
 * The full text is bundled into THIS function only (api/_gated/ai-daily-data.json)
 * and never ships in the client bundle. Access requires:
 *   1. a valid Better Auth session, and
 *   2. an active Dodo subscription on the user's customer.
 *
 * Responses: 401 anonymous · 403 no active subscription · 404 unknown slug · 200 post JSON
 */
import { auth } from "../../../src/lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { dodo } from "../../../src/lib/dodo.ts";
import { db } from "../../../src/lib/db.ts";
import { contentUnlock } from "../../../src/db/app-schema.ts";
import { and, eq } from "drizzle-orm";
import gatedData from "../../_gated/ai-daily-data.json" with { type: "json" };

type GatedManifest = { reports: Array<Record<string, unknown> & { slug: string }> };

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const slug = req.query?.slug;
  if (typeof slug !== "string" || !slug) {
    res.status(400).json({ error: "Missing slug" });
    return;
  }

  const post = ((gatedData as GatedManifest).reports ?? []).find((r) => r.slug === slug);
  if (!post) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers ?? {}) });
  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const customerId = (session.user as { dodoCustomerId?: string | null }).dodoCustomerId;
  if (!customerId) {
    res.status(403).json({ error: "No subscription" });
    return;
  }

  // Access: active subscription, or an explicit unlock row (purchase / credit redemption).
  try {
    const subs = await dodo.subscriptions.list({ customer_id: customerId });
    const hasActiveSub = (subs.items ?? []).some((s: any) => s.status === "active");

    let hasUnlock = false;
    if (!hasActiveSub) {
      const rows = await db
        .select({ id: contentUnlock.id })
        .from(contentUnlock)
        .where(and(eq(contentUnlock.userId, session.user.id), eq(contentUnlock.contentSlug, slug)))
        .limit(1);
      hasUnlock = rows.length > 0;
    }

    if (!hasActiveSub && !hasUnlock) {
      res.status(403).json({ error: "No active subscription" });
      return;
    }
  } catch (err: any) {
    console.error("[api/content] subscription check failed:", err?.message ?? err);
    res.status(502).json({ error: "Subscription check failed" });
    return;
  }

  res.status(200).json(post);
}
