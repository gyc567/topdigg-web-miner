/**
 * POST /api/credits/redeem — unlock one gated article with credits.
 *
 * Body: { slug: string, section?: string }   (section defaults to "ai-daily")
 *
 * Flow (idempotent, safe to retry):
 *   1. session check (401)
 *   2. already unlocked? → 200, no charge (unique user+slug index)
 *   3. credit balance >= ARTICLE_UNLOCK_CREDITS? → 402 if not
 *   4. insert the unlock row FIRST; on conflict → 200, no charge
 *   5. debit credits (idempotency_key derived from user+slug — retries cannot
 *      double-charge); on failure → remove the unlock row and error
 *
 * Responses: 401 / 400 / 402 / 200 { unlocked, alreadyUnlocked, creditsSpent }
 */
import { auth } from "../../src/lib/auth.js";
import { fromNodeHeaders } from "better-auth/node";
import { dodo } from "../../src/lib/dodo.js";
import { db } from "../../src/lib/db.js";
import { contentUnlock } from "../../src/db/app-schema.js";
import { and, eq } from "drizzle-orm";
import { ARTICLE_UNLOCK_CREDITS } from "../../src/config/paywall.js";
import { randomUUID } from "node:crypto";

const CREDIT_ENTITLEMENT_ID = process.env.DODO_CREDIT_ENTITLEMENT_ID ?? "";
const IDEMPOTENCY_PREFIX = "redeem";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const raw = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body ?? {});
  const slug = raw?.slug;
  const section = typeof raw?.section === "string" ? raw.section : "ai-daily";
  if (typeof slug !== "string" || !slug) {
    res.status(400).json({ error: "Missing slug" });
    return;
  }

  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers ?? {}) });
  if (!session?.user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = session.user.id;
  const customerId = (session.user as { dodoCustomerId?: string | null }).dodoCustomerId;

  // 2. Already unlocked → idempotent success, no charge.
  const existing = await db
    .select({ id: contentUnlock.id })
    .from(contentUnlock)
    .where(and(eq(contentUnlock.userId, userId), eq(contentUnlock.contentSlug, slug)))
    .limit(1);
  if (existing.length > 0) {
    res.status(200).json({ unlocked: true, alreadyUnlocked: true, creditsSpent: 0 });
    return;
  }

  // 3. Balance check.
  if (!customerId || !CREDIT_ENTITLEMENT_ID) {
    res.status(402).json({ error: "Credits unavailable" });
    return;
  }
  let balance = "0";
  try {
    const bal = await dodo.creditEntitlements.balances.retrieve(customerId, {
      credit_entitlement_id: CREDIT_ENTITLEMENT_ID,
    });
    balance = String((bal as any).balance ?? "0");
  } catch (err: any) {
    console.error("[redeem] balance check failed:", err?.message ?? err);
    res.status(502).json({ error: "Balance check failed" });
    return;
  }
  if (BigInt(balance) < BigInt(ARTICLE_UNLOCK_CREDITS)) {
    res.status(402).json({
      error: "Insufficient credits",
      balance,
      required: String(ARTICLE_UNLOCK_CREDITS),
    });
    return;
  }

  // 4. Claim the unlock row first — a concurrent duplicate hits the unique
  //    index here and returns without charging.
  const inserted = await db
    .insert(contentUnlock)
    .values({
      id: randomUUID(),
      userId,
      section,
      contentSlug: slug,
      source: "credit",
      creditsSpent: ARTICLE_UNLOCK_CREDITS,
    })
    .onConflictDoNothing()
    .returning({ id: contentUnlock.id });
  if (inserted.length === 0) {
    res.status(200).json({ unlocked: true, alreadyUnlocked: true, creditsSpent: 0 });
    return;
  }

  // 5. Debit. Idempotency key is derived from the operation, so retries are safe.
  try {
    await dodo.creditEntitlements.balances.createLedgerEntry(customerId, {
      credit_entitlement_id: CREDIT_ENTITLEMENT_ID,
      amount: String(ARTICLE_UNLOCK_CREDITS),
      entry_type: "debit",
      idempotency_key: `${IDEMPOTENCY_PREFIX}:${userId}:${slug}`,
      reason: `Unlock ${section}/${slug}`,
    });
  } catch (err: any) {
    // Compensate: roll back the unlock claim so the user is not charged.
    await db.delete(contentUnlock).where(eq(contentUnlock.id, inserted[0].id));
    console.error("[redeem] debit failed, unlock rolled back:", err?.message ?? err);
    res.status(502).json({ error: "Credit deduction failed" });
    return;
  }

  res.status(200).json({ unlocked: true, alreadyUnlocked: false, creditsSpent: ARTICLE_UNLOCK_CREDITS });
}
