/**
 * Dodo LIVE-mode setup — run once with the live API key:
 *
 *   DODO_LIVE_API_KEY=dodo_live_... node scripts/setup-dodo-live.mjs
 *
 * Creates everything the production deployment needs (idempotent where the
 * API allows — re-running prints what already exists):
 *   1. three products (monthly / yearly / single)        → DODO_PRODUCT_* env
 *   2. the credit entitlement ("TopDigg 积分")            → DODO_CREDIT_ENTITLEMENT_ID
 *   3. attaches credits to each product (100 / 1500 / 20)
 *   4. webhook endpoint https://www.topdigg.com/api/webhooks/dodo
 *      (+ prints the signing key for DODO_PAYMENTS_WEBHOOK_KEY)
 */
// Load .env.local (values never overwrite real env).
import fs from "node:fs";
for (const file of [".env.local", ".env"]) {
  if (!fs.existsSync(file)) continue;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

const KEY = process.env.DODO_LIVE_API_KEY;
if (!KEY) {
  console.error("Set DODO_LIVE_API_KEY=dodo_live_... first (in .env.local or env).");
  process.exit(1);
}
const BASE = "https://live.dodopayments.com";
const HEADERS = { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Accept: "application/json" };
const SITE = "https://www.topdigg.com";

async function api(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: HEADERS,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, json };
}

console.log("=== Dodo live setup ===\n");

// 1) Products
const products = [
  { slug: "monthly", name: "TopDigg 会员 · 月付", price: 990, recurring: "Month", tax: "saas" },
  { slug: "yearly", name: "TopDigg 会员 · 年付", price: 8990, recurring: "Year", tax: "saas" },
  { slug: "single", name: "TopDigg 单篇解锁", price: 490, oneTime: true, tax: "digital_products" },
];
const existing = (await api("GET", "/products?limit=100")).json?.items ?? [];
const ids = {};
for (const p of products) {
  const found = existing.find((x) => x.name === p.name);
  if (found) {
    ids[p.slug] = found.product_id;
    console.log(`✓ ${p.slug} exists: ${found.product_id}`);
    continue;
  }
  const price = p.oneTime
    ? { type: "one_time_price", currency: "USD", price: p.price, discount: 0, purchasing_power_parity: false }
    : { type: "recurring_price", currency: "USD", price: p.price, discount: 0,
        payment_frequency_count: 1, payment_frequency_interval: p.recurring,
        subscription_period_count: 1, subscription_period_interval: p.recurring,
        purchasing_power_parity: false };
  const r = await api("POST", "/products", { name: p.name, description: `${p.name}（live）`, tax_category: p.tax, price });
  if (r.status === 200 || r.status === 201) {
    ids[p.slug] = r.json.product_id;
    console.log(`✓ ${p.slug} created: ${r.json.product_id}`);
  } else {
    console.error(`✗ ${p.slug} failed:`, JSON.stringify(r.json).slice(0, 200));
  }
}

// 2) Credit entitlement
let cde = null;
const cdes = (await api("GET", "/credit-entitlements?limit=100")).json?.items ?? [];
const foundCde = cdes.find((x) => x.name === "TopDigg 积分");
if (foundCde) {
  cde = foundCde.id;
  console.log(`\n✓ credit entitlement exists: ${cde}`);
} else {
  const r = await api("POST", "/credit-entitlements", {
    name: "TopDigg 积分", unit: "point", precision: 0,
    expires_after_days: 365, rollover_enabled: true, rollover_percentage: 100,
    max_rollover_count: 3, overage_enabled: false,
  });
  if (r.status === 200 || r.status === 201) {
    cde = r.json.id;
    console.log(`\n✓ credit entitlement created: ${cde}`);
  } else {
    console.error("\n✗ credit entitlement failed:", JSON.stringify(r.json).slice(0, 200));
  }
}

// 3) Attach credits to products
if (cde) {
  const grants = { monthly: "100", yearly: "1500", single: "20" };
  for (const [slug, amount] of Object.entries(grants)) {
    if (!ids[slug]) continue;
    const r = await api("PATCH", `/products/${ids[slug]}`, {
      credit_entitlements: [{ credit_entitlement_id: cde, credits_amount: amount }],
    });
    console.log(`${r.status === 200 ? "✓" : "✗"} attach ${slug} ×${amount} → ${r.status}`);
  }
}

// 4) Webhook endpoint
const hooks = (await api("GET", "/webhooks")).json?.data ?? [];
const foundHook = hooks.find((h) => h.url === `${SITE}/api/webhooks/dodo`);
if (foundHook) {
  const key = await api("GET", `/webhooks/${foundHook.webhook_id}/secret`);
  console.log(`\n✓ webhook exists: ${foundHook.webhook_id}`);
  console.log(`  DODO_PAYMENTS_WEBHOOK_KEY=${key.json?.webhook_key ?? key.json?.secret ?? "(get from dashboard)"}`);
} else {
  const r = await api("POST", "/webhooks", {
    url: `${SITE}/api/webhooks/dodo`,
    filter_types: ["payment.succeeded", "payment.failed", "subscription.active", "subscription.cancelled", "subscription.past_due", "credit.added", "credit.deducted", "credit.balance_low"],
  });
  if (r.status === 200 || r.status === 201) {
    const key = await api("GET", `/webhooks/${r.json.webhook_id}/secret`);
    console.log(`\n✓ webhook created: ${r.json.webhook_id}`);
    console.log(`  DODO_PAYMENTS_WEBHOOK_KEY=${key.json?.webhook_key ?? key.json?.secret ?? "(get from dashboard)"}`);
  } else {
    console.error("\n✗ webhook failed:", JSON.stringify(r.json).slice(0, 200));
  }
}

console.log("\n=== env vars for Vercel ===");
console.log(`DODO_PRODUCT_MONTHLY=${ids.monthly ?? ""}`);
console.log(`DODO_PRODUCT_YEARLY=${ids.yearly ?? ""}`);
console.log(`DODO_PRODUCT_SINGLE=${ids.single ?? ""}`);
console.log(`DODO_CREDIT_ENTITLEMENT_ID=${cde ?? ""}`);
