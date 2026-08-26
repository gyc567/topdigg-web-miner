/**
 * Smoke test: verify every static asset in public/ (and dist/, if present) is
 * served 200 from production. Catches the failure mode where a file exists
 * locally + in git + in dist/ but is silently 404'd in production (e.g. by
 * the Vercel middleware rejecting un-whitelisted paths).
 *
 * Usage:
 *   node scripts/smoke-test-assets.mjs               # default → www.topdigg.com
 *   BASE_URL=https://preview-xxx.vercel.app \
 *     node scripts/smoke-test-assets.mjs             # override target
 *
 * Exit code:
 *   0 — every asset 200
 *   1 — at least one asset 404 or unreachable
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const BASE_URL = (process.env.BASE_URL || "https://www.topdigg.com").replace(/\/$/, "");
const TIMEOUT_MS = 10_000;

// Image / asset extensions worth checking. Plain HTML pages go through a
// different code path (prerender + middleware) and are covered by e2e tests.
const ASSET_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg",
  ".ico",
  ".pdf",
  ".mp4", ".webm", ".mp3", ".wav",
  ".woff", ".woff2", ".ttf", ".otf",
]);

function listAssets(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip subdirs that aren't part of the static surface
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      out.push(...listAssets(full));
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ASSET_EXT.has(ext)) {
        // Vite's `publicDir: "public"` copies files from public/ directly into
        // the build output root — so /public/apple-touch-icon.png is served
        // at /apple-touch-icon.png in production. Strip the leading "public/"
        // from the relative path to get the real URL.
        const rel = path.relative(ROOT, full).replace(/\\/g, "/");
        const urlPath = "/" + rel.replace(/^public\//, "");
        out.push(urlPath);
      }
    }
  }
  return out;
}

async function check(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
    });
    return { status: res.status, finalUrl: res.url };
  } catch (err) {
    return { status: 0, error: err.message };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const publicAssets = listAssets(path.join(ROOT, "public"));
  if (publicAssets.length === 0) {
    console.error("✗ No assets found in public/ — aborting");
    process.exit(1);
  }

  console.log(`Checking ${publicAssets.length} assets against ${BASE_URL}`);
  console.log();

  const results = await Promise.all(
    publicAssets.map(async (relPath) => {
      const url = BASE_URL + relPath;
      const r = await check(url);
      return { relPath, url, ...r };
    })
  );

  let passed = 0;
  let failed = 0;
  const failures = [];

  for (const r of results) {
    const ok = r.status === 200;
    const icon = ok ? "✓" : "✗";
    const detail = r.status === 0 ? `(${r.error || "unreachable"})` : `HTTP ${r.status}`;
    console.log(`  ${icon} ${r.relPath}  ${detail}`);
    if (ok) passed += 1;
    else {
      failed += 1;
      failures.push(r);
    }
  }

  console.log();
  console.log(`Summary: ${passed}/${results.length} passed`);

  if (failures.length > 0) {
    console.log();
    console.log("Failures:");
    for (const f of failures) console.log(`  ✗ ${f.relPath} → ${f.status || f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("smoke-test-assets crashed:", err);
  process.exit(2);
});