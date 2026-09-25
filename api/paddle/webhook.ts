/**
 * Paddle webhook handler — Vercel Function at /api/paddle/webhook
 *
 * Verifies HMAC-SHA256 signature against the raw request body (Vercel
 * `bodyParser: false`), then idempotently processes subscription and
 * transaction events into Supabase tables.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

// Fail fast in production when env is missing — silent 401s would mask misconfig.
if (!PADDLE_WEBHOOK_SECRET) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "PADDLE_WEBHOOK_SECRET is required in production. Configure it in the Vercel project environment.",
    );
  }
  console.warn(
    "[webhook] PADDLE_WEBHOOK_SECRET not set — every webhook will be rejected with 401",
  );
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production.",
    );
  }
  console.warn("[webhook] Supabase env vars not set — event inserts will fail");
}

/**
 * Read the raw request body as a UTF-8 string.
 *
 * HMAC must be computed over exactly the bytes Paddle signed; if Vercel
 * has already JSON-parsed the body we cannot recover those bytes and
 * return a typed error instead of silently signing a re-stringified copy.
 *
 * Requires `export const config = { api: { bodyParser: false } }` below.
 */
function readRawBody(req: VercelRequest): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    if (typeof req.body === "string") {
      // Vercel already buffered it; use as-is.
      resolve(req.body);
      return;
    }
    if (req.body && typeof req.body === "object" && !Array.isArray(req.body)) {
      reject(new Error("raw body required — set bodyParser: false in this function's config"));
      return;
    }
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function verifySignature(rawBody: string, signature: string | undefined): boolean {
  if (!signature || !PADDLE_WEBHOOK_SECRET) return false;
  const hmac = crypto.createHmac("sha256", PADDLE_WEBHOOK_SECRET);
  const digest = hmac.update(rawBody, "utf8").digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
  } catch {
    return false;
  }
}

/**
 * Resolve a Supabase user from Paddle event customData, falling back to email.
 *
 * Prefers `customData.user_id` (set by CheckoutButton) because it scales O(1)
 * via `auth.admin.getUserById` instead of the O(n) `auth.admin.listUsers` scan.
 */
async function resolveUser(
  supabase: SupabaseClient,
  customData: Record<string, unknown> | null | undefined,
  fallbackEmail: string | null | undefined,
): Promise<{ userId: string } | null> {
  const uidFromCustom =
    typeof customData?.user_id === "string" ? customData.user_id : "";
  if (uidFromCustom.length > 0) {
    const { data, error } = await supabase.auth.admin.getUserById(uidFromCustom);
    if (error) {
      console.warn(
        `[webhook] getUserById(${uidFromCustom}) failed: ${error.message}; falling back to email lookup`,
      );
    } else if (data?.user) {
      return { userId: data.user.id };
    }
  }
  if (fallbackEmail) {
    const { data: list } = await supabase.auth.admin.listUsers();
    const matched = list?.users?.find(
      (u: { email?: string }) => u.email === fallbackEmail,
    );
    if (matched) return { userId: matched.id };
  }
  return null;
}

interface PaddleSubscriptionEvent {
  id?: string;
  customer_id?: string;
  customer?: { email?: string };
  custom_data?: Record<string, unknown>;
  status?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  items?: Array<{ price?: { id?: string } }>;
}

interface PaddleTransactionEvent {
  id?: string;
  customer?: { email?: string };
  custom_data?: Record<string, unknown>;
  details?: { totals?: { grand_total?: number | string } };
  currency_code?: string;
}

interface PaddleEvent {
  event_id?: string;
  event_type?: string;
  data?: Record<string, unknown>;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let rawBody: string;
  try {
    rawBody = await readRawBody(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Bad request";
    return res.status(400).json({ error: msg });
  }

  const signature = req.headers["paddle-signature"] as string | undefined;
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody) as PaddleEvent;
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }
  if (!event.event_id || !event.event_type) {
    return res.status(400).json({ error: "Missing event_id or event_type" });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Atomic idempotency — UNIQUE(event_id) on paddle_webhook_events.
  // 23505 (unique violation) means the event has already been processed.
  const { error: insErr } = await supabase
    .from("paddle_webhook_events")
    .insert({ event_id: event.event_id, event_type: event.event_type });

  if (insErr) {
    if (insErr.code === "23505") {
      return res.status(200).json({ ok: true, deduped: true });
    }
    return res.status(500).json({ error: `idempotency insert failed: ${insErr.message}` });
  }

  try {
    switch (event.event_type) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = (event.data ?? {}) as PaddleSubscriptionEvent;
        const userRef = await resolveUser(supabase, sub.custom_data, sub.customer?.email);
        if (!userRef) {
          console.warn(
            `[webhook] ${event.event_type} ${event.event_id}: no matching user (customData=${JSON.stringify(sub.custom_data)}, email=${sub.customer?.email ?? "<none>"}); skip`,
          );
          break;
        }
        await supabase.from("subscriptions").upsert({
          user_id: userRef.userId,
          paddle_subscription_id: sub.id,
          paddle_customer_id: sub.customer_id,
          status: sub.status,
          plan: sub.items?.[0]?.price?.id?.includes("yearly") ? "yearly" : "monthly",
          current_period_end: sub.current_period_end,
          cancel_at_period_end: sub.cancel_at_period_end ?? false,
          updated_at: new Date().toISOString(),
        });
        break;
      }

      case "subscription.canceled": {
        const sub = (event.data ?? {}) as PaddleSubscriptionEvent;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("paddle_subscription_id", sub.id);
        break;
      }

      case "transaction.completed": {
        const tx = (event.data ?? {}) as PaddleTransactionEvent;
        const slug = tx.custom_data?.post_slug;
        if (typeof slug !== "string" || slug.length === 0) {
          // Subscription renewal — not a single-post unlock; skip.
          break;
        }
        const userRef = await resolveUser(supabase, tx.custom_data, tx.customer?.email);
        if (!userRef) {
          console.warn(
            `[webhook] transaction.completed ${event.event_id}: no matching user; skip`,
          );
          break;
        }
        await supabase.from("unlocks").upsert({
          user_id: userRef.userId,
          post_slug: slug,
          paddle_transaction_id: tx.id,
          amount: Number(tx.details?.totals?.grand_total ?? 0),
          currency: tx.currency_code ?? "USD",
        });
        break;
      }

      default:
        // Event type not handled — already recorded as idempotent; return ok.
        break;
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[webhook] handler error", err);
    return res.status(500).json({ error: "Handler failed" });
  }
}

/**
 * Vercel Functions config — disable JSON body parsing so we receive raw bytes
 * for HMAC verification.
 * Docs: https://vercel.com/guides/how-can-i-read-the-request-body-of-a-serverless-function-as-a-raw-string
 */
export const config = {
  api: {
    bodyParser: false,
  },
};
