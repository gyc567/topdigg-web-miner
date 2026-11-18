/**
 * POST /api/webhooks/dodo — Dodo Payments webhook receiver.
 *
 * Runs on the Edge runtime so the request body arrives as exact raw bytes.
 * This matters: the signature is computed over
 * `webhook-id.webhook-timestamp.<raw body>`, so re-serialising a parsed JSON
 * body breaks verification. The Node runtime parses JSON bodies for you,
 * which is why this handler does NOT use the `dodopayments` SDK's
 * `webhooks.unwrap()` — we verify with `standardwebhooks` directly, exactly
 * as the Dodo guide describes for clients that cannot use the SDK.
 *
 * Docs: https://docs.dodopayments.com/developer-resources/webhooks
 */
import { Webhook } from "standardwebhooks";

export const config = { runtime: "edge" };

/** Webhook types we act on. Everything else is acknowledged and ignored. */
const HANDLED_TYPES = new Set([
  "payment.succeeded",
  "payment.failed",
  "subscription.active",
  "subscription.updated",
  "subscription.cancelled",
  "subscription.past_due",
  "subscription.expired",
  // Credits: keep the cached balance in sync (see docs/membership-system-plan.md §7.5)
  "credit.added",
  "credit.deducted",
  "credit.manual_adjustment",
  "credit.expired",
  "credit.rolled_over",
  "credit.balance_low",
]);

/**
 * Idempotency claim for `webhook-id`.
 *
 * Dodo retries on any non-2xx and does not guarantee ordering, so the same
 * webhook can arrive more than once. A durable store (unique insert on
 * webhook-id, committed in the same transaction as the fulfilment work) is
 * required before going live — this in-memory map only survives within a
 * single isolate. See webhooks.md, "Production handler: durable and
 * idempotent".
 */
const claimed = new Map<string, number>();
const CLAIM_TTL_MS = 10 * 60 * 1000;

function claimWebhookId(webhookId: string): boolean {
  const now = Date.now();
  for (const [id, at] of claimed) {
    if (now - at > CLAIM_TTL_MS) claimed.delete(id);
  }
  if (claimed.has(webhookId)) return false;
  claimed.set(webhookId, now);
  return true;
}

/**
 * Fulfilment seam.
 *
 * There is no database in this repo yet, so there is nowhere durable to
 * record a membership. Until then we only log what *would* be granted —
 * access must never be granted from the return_url query parameters, only
 * from a verified webhook like this one.
 */
function fulfil(event: any): void {
  const data = event?.data ?? {};
  const customerEmail = data?.customer?.email ?? "(unknown)";
  const plan = data?.metadata?.plan ?? "(unknown)";

  switch (event.type) {
    case "payment.succeeded":
      console.log(
        `[dodo-webhook] payment.succeeded — grant one-time access to ${customerEmail} (payment ${data.payment_id}, plan ${plan})`,
      );
      break;
    case "subscription.active":
      console.log(
        `[dodo-webhook] subscription.active — grant membership to ${customerEmail} (subscription ${data.subscription_id}, plan ${plan})`,
      );
      break;
    case "subscription.cancelled":
    case "subscription.expired":
      console.log(
        `[dodo-webhook] ${event.type} — revoke membership for ${customerEmail} (subscription ${data.subscription_id})`,
      );
      break;
    case "subscription.past_due":
      console.log(
        `[dodo-webhook] subscription.past_due — mark past due for ${customerEmail} (subscription ${data.subscription_id})`,
      );
      break;
    case "credit.added":
    case "credit.deducted":
    case "credit.manual_adjustment":
    case "credit.expired":
    case "credit.rolled_over":
      console.log(
        `[dodo-webhook] ${event.type} — balance for ${customerEmail} now ${data?.balance_after ?? "?"} (entry ${data?.id ?? "?"})`,
      );
      // TODO: refresh credit_balance_cache here once the table lands (Phase 3 follow-up).
      break;
    case "credit.balance_low":
      console.log(
        `[dodo-webhook] credit.balance_low — ${customerEmail} at ${data?.available_balance ?? "?"}; offer a top-up checkout`,
      );
      break;
    case "payment.failed":
    case "subscription.updated":
      console.log(`[dodo-webhook] ${event.type} — ${JSON.stringify(data).slice(0, 300)}`);
      break;
    default:
      console.log(`[dodo-webhook] unhandled type ${event.type} — acknowledged`);
  }
}

/**
 * Core handler, shared by the Edge entry point and the local dev server.
 * `raw` MUST be the exact bytes Dodo sent.
 */
export function handleWebhook(
  raw: string,
  headers: { "webhook-id": string; "webhook-signature": string; "webhook-timestamp": string },
): { status: number; body: Record<string, unknown> } {
  const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
  if (!webhookKey) {
    return { status: 500, body: { error: "DODO_PAYMENTS_WEBHOOK_KEY is not configured" } };
  }

  let event: any;
  try {
    new Webhook(webhookKey).verify(raw, headers);
    event = JSON.parse(raw);
  } catch (err: any) {
    console.warn("[dodo-webhook] signature verification failed:", err?.message ?? err);
    return { status: 401, body: { error: "Invalid signature" } };
  }

  const webhookId = headers["webhook-id"];
  if (!claimWebhookId(webhookId)) {
    console.log(`[dodo-webhook] duplicate webhook ${webhookId} — ignored`);
    return { status: 200, body: { received: true, duplicate: true } };
  }

  try {
    if (HANDLED_TYPES.has(event?.type)) {
      fulfil(event);
    } else {
      console.log(`[dodo-webhook] type ${event?.type} not handled — acknowledged`);
    }
    return { status: 200, body: { received: true } };
  } catch (err: any) {
    // Non-2xx tells Dodo to retry, so let failures propagate.
    console.error("[dodo-webhook] processing failed:", err?.message ?? err);
    return { status: 500, body: { error: "Processing failed" } };
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Raw text — never re-serialise a parsed body before verifying.
  const raw = await request.text();

  const result = handleWebhook(raw, {
    "webhook-id": request.headers.get("webhook-id") ?? "",
    "webhook-signature": request.headers.get("webhook-signature") ?? "",
    "webhook-timestamp": request.headers.get("webhook-timestamp") ?? "",
  });

  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { "Content-Type": "application/json" },
  });
}
