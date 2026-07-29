/**
 * Bot Audit Script — PR8 监控
 *
 * 抓取并分析 AI 爬虫（GPTBot / ClaudeBot / PerplexityBot / Google-Extended）
 * 对 TopDigg 各路由的访问情况。
 *
 * 依赖：
 *   VERCEL_API_TOKEN   — Vercel API Token（https://vercel.com/account/tokens）
 *   VERCEL_PROJECT_ID  — 项目 ID（可选，从 vercel.json 读取）
 *
 * 用法：
 *   node scripts/bot-audit.mjs
 *
 * GSC indexed pages 部分（fetchGscStats）：
 *   需要 GOOGLE_SHEETS_API_KEY + GSC_SITE_URL，或手动从
 *   https://search.google.com/search-console 截图上传。
 *   如无凭证，该部分会跳过并提示手动操作。
 */
import https from "node:https";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const VERBOSE = process.argv.includes("-v");

const PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ||
  (() => {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(process.cwd(), "vercel.json"), "utf8"));
      return cfg?.projectId ?? undefined;
    } catch {
      return undefined;
    }
  })();

const TOKEN = process.env.VERCEL_API_TOKEN;

const BOTS = {
  GPTBot: "GPTBot",
  ClaudeBot: "ClaudeBot",
  "Claude-Web": "Claude-Web",
  PerplexityBot: "PerplexityBot",
  "Google-Extended": "Google-Extended",
  ApplebotExtended: "Applebot-Extended",
  CCBot: "CCBot",
  cohereai: "cohere-ai",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(...args) {
  if (VERBOSE) console.log("[bot-audit]", ...args);
}

function httpGet(url, headers = {}) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const opts = { headers: { "Content-Type": "application/json", ...headers } };
    mod.get(url, opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => resolve({ status: res.statusCode, data }));
    }).on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Vercel Logs — fetch and bucket by bot UA
// ---------------------------------------------------------------------------

async function fetchVercelLogs(botFilters) {
  if (!TOKEN) {
    console.warn("[bot-audit] VERCEL_API_TOKEN not set — skipping Vercel log analysis.");
    console.warn("           Set: vercel env add VERCEL_API_TOKEN");
    return null;
  }

  const projectId = PROJECT_ID;
  if (!projectId) {
    console.warn("[bot-audit] VERCEL_PROJECT_ID not found — skipping.");
    return null;
  }

  // Fetch last 100 log lines (max per request)
  const logsUrl = `https://api.vercel.com/v3/projects/${projectId}/logs?limit=100&direction=backward`;

  const { status, data } = await httpGet(logsUrl, {
    Authorization: `Bearer ${TOKEN}`,
  });

  if (status !== 200) {
    console.warn(`[bot-audit] Vercel API returned ${status} — skipping log analysis.`);
    return null;
  }

  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch {
    console.warn("[bot-audit] Failed to parse Vercel response — skipping.");
    return null;
  }

  const entries = parsed.logs || [];

  // Bucket counts
  const counts = {};
  for (const [key] of Object.entries(botFilters)) counts[key] = 0;

  for (const entry of entries) {
    const ua = entry.parsedUA || entry.headers?.["user-agent"] || "";
    for (const [key, label] of Object.entries(botFilters)) {
      if (ua.includes(label)) counts[key]++;
    }
  }

  return { counts, total: entries.length, projectId };
}

// ---------------------------------------------------------------------------
// GSC — fetch indexed pages count
// (uses PageSpeed Insights API as a lightweight proxy since direct GSC API
//  requires OAuth2. Manual alternative: screenshot GSC dashboard.)
// ---------------------------------------------------------------------------

async function fetchGscStats() {
  const siteUrl = process.env.GSC_SITE_URL || "https://topdigg.com";

  if (!process.env.GSC_API_KEY) {
    console.warn("[bot-audit] GSC_API_KEY not set — skipping GSC stats.");
    console.warn("           Manual alternative:");
    console.warn("             1. Open https://search.google.com/search-console");
    console.warn("             2. Select 'https://topdigg.com'");
    console.warn("             3. Screenshot Pages indexed curve");
    return null;
  }

  // GSC URL Inspection API: https://developers.google.com/webmaster-tools/search-console-api-original
  const apiUrl =
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/urlCrawlErrorsCount?category=authErrors`;

  const { status, data } = await httpGet(apiUrl, {
    Authorization: `Bearer ${process.env.GSC_API_KEY}`,
  });

  if (status !== 200) {
    console.warn(`[bot-audit] GSC API returned ${status} — skipping.`);
    return null;
  }

  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Main report
// ---------------------------------------------------------------------------

function printReport(vercelResult, gscResult) {
  console.log("\n========================================");
  console.log("  TopDigg Bot Audit Report");
  console.log(`  ${new Date().toISOString()}`);
  console.log("========================================\n");

  if (vercelResult) {
    const { counts, total, projectId } = vercelResult;
    console.log(`📊 Vercel Log Summary (last ${total} entries from project ${projectId})`);
    console.log("------------------------------------------------------------");
    const sorted = Object.entries(counts).sort(([, a], [, b]) => b - a);
    let totalBot = 0;
    for (const [key, count] of sorted) {
      const pct = total > 0 ? ((count / total) * 100).toFixed(1) : "0.0";
      const bar = "█".repeat(Math.min(Math.round(count / Math.max(...Object.values(counts), 1)) * 20, 20));
      console.log(`  ${key.padEnd(20)} ${String(count).padStart(5)} ${pct.padStart(6)}% ${bar}`);
      totalBot += count;
    }
    const nonBot = total - totalBot;
    const nonBotPct = total > 0 ? ((nonBot / total) * 100).toFixed(1) : "0.0";
    console.log(`  ${"(other)".padEnd(20)} ${String(nonBot).padStart(5)} ${nonBotPct.padStart(6)}%`);
    console.log("");
    console.log("  Action: If any bot shows 0 requests, check robots.txt is allowing it.");
    console.log("");
  } else {
    console.log("📊 Vercel Logs: skipped (set VERCEL_API_TOKEN + VERCEL_PROJECT_ID)\n");
  }

  if (gscResult) {
    console.log("🔍 Google Search Console");
    console.log("------------------------------------------------------------");
    console.log("  Status: data retrieved (set GSC_API_KEY for automated fetch)");
    console.log("");
  } else {
    console.log("🔍 Google Search Console: manual check required");
    console.log("   → https://search.google.com/search-console → topdigg.com → Pages\n");
  }

  console.log("========================================");
  console.log("  Next Steps");
  console.log("========================================");
  console.log("  1. Set VERCEL_API_TOKEN + VERCEL_PROJECT_ID in Vercel env vars");
  console.log("  2. Configure GSC: https://search.google.com/search-console");
  console.log("     - Verify ownership of https://topdigg.com");
  console.log("     - Submit sitemap: https://topdigg.com/sitemap.xml");
  console.log("     - Set preferred domain to www.topdigg.com");
  console.log("  3. Bing Webmaster: https://www.bing.com/webmasters");
  console.log("     - Add site, submit sitemap");
  console.log("  4. Run weekly: node scripts/bot-audit.mjs");
  console.log("========================================\n");
}

// ---------------------------------------------------------------------------
// Entry
// ---------------------------------------------------------------------------

async function main() {
  console.log("[bot-audit] Starting TopDigg bot audit...\n");

  const [vercelResult, gscResult] = await Promise.all([
    fetchVercelLogs(BOTS),
    fetchGscStats(),
  ]);

  printReport(vercelResult, gscResult);
}

main().catch((err) => {
  console.error("[bot-audit] Fatal:", err.message);
  process.exit(1);
});
