/**
 * Local dev server for the Dodo Payments API function.
 *
 * `vercel dev` needs a logged-in project link, which this repo doesn't have.
 * This runs the exact same handler as `api/checkout.ts` (the Vercel Node
 * function) behind a plain http server, so the checkout flow can be
 * exercised locally without Vercel.
 *
 * Usage:
 *   node scripts/dev-dodo-api.mjs            # listens on 127.0.0.1:3001
 *   PORT=4000 node scripts/dev-dodo-api.mjs
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

const { default: handler } = await import("../api/checkout.ts");

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");

  if (req.method === "POST") {
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
    await handler(req, vres);
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
  console.log(`[dev-dodo-api] environment=${process.env.DODO_PAYMENTS_ENVIRONMENT ?? "(unset)"}`);
});
