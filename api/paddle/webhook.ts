/**
 * Paddle webhook handler — Vercel Function at /api/paddle/webhook
 * Verifies signature, idempotently processes subscription/transaction events.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const PADDLE_WEBHOOK_SECRET = process.env.PADDLE_WEBHOOK_SECRET ?? "";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const rawBody = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
  const signature = req.headers["paddle-signature"] as string | undefined;
  if (!verifySignature(rawBody, signature)) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const event = JSON.parse(rawBody);
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Idempotency check
  const { data: existing } = await supabase
    .from("paddle_webhook_events")
    .select("event_id")
    .eq("event_id", event.event_id)
    .single();

  if (existing) {
    return res.status(200).json({ ok: true, deduped: true });
  }

  await supabase.from("paddle_webhook_events").insert({
    event_id: event.event_id,
    event_type: event.event_type,
  });

  try {
    switch (event.event_type) {
      case "subscription.created":
      case "subscription.updated": {
        const sub = event.data;
        const userEmail = sub?.custom_data?.user_email ?? sub?.customer?.email;
        if (!userEmail) break;
        const { data: user } = await supabase.auth.admin.listUsers();
        const matched = user?.users?.find((u) => u.email === userEmail);
        if (!matched) break;
        await supabase.from("subscriptions").upsert({
          user_id: matched.id,
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
        const sub = event.data;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", updated_at: new Date().toISOString() })
          .eq("paddle_subscription_id", sub.id);
        break;
      }
      case "transaction.completed": {
        const tx = event.data;
        const slug = tx?.custom_data?.post_slug;
        if (!slug) break;
        const userEmail = tx?.customer?.email;
        if (!userEmail) break;
        const { data: user } = await supabase.auth.admin.listUsers();
        const matched = user?.users?.find((u) => u.email === userEmail);
        if (!matched) break;
        await supabase.from("unlocks").upsert({
          user_id: matched.id,
          post_slug: slug,
          paddle_transaction_id: tx.id,
          amount: tx.details?.totals?.grand_total ?? 0,
          currency: tx.currency_code ?? "USD",
        });
        break;
      }
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Webhook handler error", err);
    return res.status(500).json({ error: "Handler failed" });
  }
}