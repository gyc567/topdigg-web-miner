/**
 * GET /api/account — aggregated account data for the signed-in user.
 *
 * Requires a valid Better Auth session cookie. Returns the user, their Dodo
 * subscriptions (membership status) and credit balances. Falls back to cached
 * balances when Dodo is unreachable, marked with `stale: true`.
 */
import { auth } from "../src/lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { dodo, DODO_ENVIRONMENT } from "../src/lib/dodo.ts";
import { db } from "../src/lib/db.ts";
import { contentUnlock } from "../src/db/app-schema.ts";
import { desc, eq } from "drizzle-orm";

/** The Dodo plugin adds dodoCustomerId to the user row at runtime. */
type SessionUser = {
  id: string;
  email: string;
  name: string;
  emailVerified?: boolean;
  dodoCustomerId?: string | null;
};

async function getSessionUser(req: any): Promise<SessionUser | null> {
  const headers = fromNodeHeaders(req.headers ?? {});
  const session = await auth.api.getSession({ headers });
  return (session?.user as SessionUser | undefined) ?? null;
}

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const user = await getSessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const result: any = {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified ?? false,
      dodoCustomerId: user.dodoCustomerId,
    },
    environment: DODO_ENVIRONMENT,
    subscriptions: [],
    credits: [],
    unlocks: [],
  };

  // Unlocked content (purchase or credit redemption).
  try {
    const rows = await db
      .select({
        id: contentUnlock.id,
        section: contentUnlock.section,
        contentSlug: contentUnlock.contentSlug,
        source: contentUnlock.source,
        creditsSpent: contentUnlock.creditsSpent,
        createdAt: contentUnlock.createdAt,
      })
      .from(contentUnlock)
      .where(eq(contentUnlock.userId, user.id))
      .orderBy(desc(contentUnlock.createdAt));
    result.unlocks = rows.map((r: any) => ({
      id: r.id,
      section: r.section,
      contentSlug: r.contentSlug,
      source: r.source,
      creditsSpent: r.creditsSpent,
      createdAt: r.createdAt,
    }));
  } catch (err: any) {
    console.error("[api/account] unlocks failed:", err?.message ?? err);
  }

  if (user.dodoCustomerId) {
    // Subscriptions → membership status. Fail soft: empty list, not an error.
    try {
      const subs = await dodo.subscriptions.list({ customer_id: user.dodoCustomerId });
      result.subscriptions = (subs.items ?? []).map((s: any) => ({
        subscriptionId: s.subscription_id,
        status: s.status,
        productId: s.product_id,
        nextBillingDate: s.next_billing_date,
        amount: s.recurring_pre_tax_amount,
        currency: s.currency,
      }));
    } catch (err: any) {
      console.error("[api/account] subscriptions failed:", err?.message ?? err);
      result.subscriptionsError = true;
    }

    // Credit balances. Fail soft with a stale marker.
    try {
      const credits = await dodo.customers.listCreditEntitlements(user.dodoCustomerId);
      result.credits = (credits.items ?? []).map((c: any) => ({
        creditEntitlementId: c.credit_entitlement_id,
        name: c.credit_entitlement_name ?? c.name,
        balance: c.balance,
        stale: false,
      }));
    } catch (err: any) {
      console.error("[api/account] credits failed:", err?.message ?? err);
      result.creditsStale = true;
    }
  }

  res.status(200).json(result);
}
