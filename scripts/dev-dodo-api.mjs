/**
 * Local dev server for the Dodo Payments API functions.
 *
 * `vercel dev` needs a logged-in project link, which this repo doesn't have.
 * This runs the exact same handlers as `api/checkout.ts` and
 * `api/webhooks/dodo.ts` (the Vercel functions) behind a plain http server,
 * so both flows can be exercised locally without Vercel.
 *
 * Usage:
 *   npm run dev:api                          # listens on 127.0.0.1:3001
 *   PORT=4000 npm run dev:api
 *
 * Vite proxies /api → this server (see vite.config.ts).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT ?? 3001);

// --- load .env.local / .env into process.env (values never overwrite real env) ---
for (const file of [".env.local", ".env"]) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) continue;
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match) continue;
    let value = match[2];
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

// The api/ functions are CommonJS on Vercel (api/package.json pins
// "type": "commonjs"), so a dynamic import hands back the CJS exports object
// as `default`. Unwrap both shapes so the dev server works either way.
const interop = (mod) => mod?.default?.default ?? mod?.default ?? mod;

const checkoutHandler = interop(await import("../api/checkout.ts"));
const webhookModule = await import("../api/webhooks/dodo.ts");
const handleWebhook =
  webhookModule.handleWebhook ?? webhookModule.default?.handleWebhook;
const authHandler = interop(await import("../api/auth/[...all].ts"));
const accountHandler = interop(await import("../api/account.ts"));
const contentHandler = interop(await import("../api/content/ai-daily/[slug].ts"));
const redeemHandler = interop(await import("../api/credits/redeem.ts"));

function vresOf(res) {
  return {
    statusCode: 200,
    status(code) { this.statusCode = code; return this; },
    json(p) { res.writeHead(this.statusCode, { "Content-Type": "application/json" }); res.end(JSON.stringify(p)); },
    send(p) { res.writeHead(this.statusCode, { "Content-Type": "text/plain" }); res.end(String(p)); },
    setHeader(k, v) { res.setHeader(k, v); },
  };
}

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  const url = (req.url ?? "").split("?")[0];

  // --- Better Auth (all /api/auth/*) ---
  if (url.startsWith("/api/auth")) {
    if (req.method === "POST") {
      try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = raw; }
    }
    try {
      await authHandler(req, res);
    } catch (err) {
      console.error("[dev-auth]", err);
      if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: String(err?.message ?? err) }));
    }
    return;
  }

  // --- Credit redemption ---
  if (url.startsWith("/api/credits/redeem")) {
    if (req.method === "POST") { try { req.body = raw ? JSON.parse(raw) : {}; } catch { req.body = {}; } }
    try { await redeemHandler(req, vresOf(res)); }
    catch (e) { console.error("[dev-redeem]", e); if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: String(e?.message ?? e) })); }
    return;
  }

  // --- Gated content (paywall) ---
  if (url.startsWith("/api/content/")) {
    req.query = { slug: decodeURIComponent(url.split("/").pop() ?? "") };
    try { await contentHandler(req, vresOf(res)); }
    catch (e) { console.error("[dev-content]", e); if (!res.headersSent) res.writeHead(500, { "Content-Type": "application/json" }); res.end(JSON.stringify({ error: String(e?.message ?? e) })); }
    return;
  }

  // --- Account aggregation ---
  if (url.startsWith("/api/account")) {
    try { await accountHandler(req, vresOf(res)); } catch (e) { console.error(e); if(!res.headersSent){res.writeHead(500,{"Content-Type":"application/json"});} res.end(JSON.stringify({error:String(e?.message??e)})); }
    return;
  }

  // --- Dodo webhook (raw body, signature verified over the exact bytes) ---
  if (url.startsWith("/api/webhooks/dodo")) {
    if (req.method !== "POST") {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }
    const result = handleWebhook(raw, {
      "webhook-id": req.headers["webhook-id"] ?? "",
      "webhook-signature": req.headers["webhook-signature"] ?? "",
      "webhook-timestamp": req.headers["webhook-timestamp"] ?? "",
    });
    res.writeHead(result.status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result.body));
    return;
  }

  // --- Checkout session ---
  if (url.startsWith("/api/checkout") && req.method === "POST") {
    try {
      req.body = raw ? JSON.parse(raw) : {};
    } catch {
      req.body = {};
    }
  }

  // Minimal Vercel-style response adapter.
  const vres = {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      res.writeHead(this.statusCode, { "Content-Type": "application/json" });
      res.end(JSON.stringify(payload));
    },
    send(payload) {
      res.writeHead(this.statusCode, { "Content-Type": "text/plain" });
      res.end(String(payload));
    },
    setHeader(key, value) {
      res.setHeader(key, value);
    },
  };

  try {
    await checkoutHandler(req, vres);
  } catch (err) {
    console.error("[dev-dodo-api]", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ error: String(err?.message ?? err) }));
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`[dev-dodo-api] listening on http://127.0.0.1:${PORT}/api/checkout`);
  console.log(`[dev-dodo-api] webhook  → http://127.0.0.1:${PORT}/api/webhooks/dodo`);
  console.log(`[dev-dodo-api] environment=${process.env.DODO_PAYMENTS_ENVIRONMENT ?? "(unset)"}`);
});
