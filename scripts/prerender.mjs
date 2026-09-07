/**
 * 阶段2：构建后预渲染所有路由为静态 HTML
 *
 * 工作流：
 *   1) vite build 产物在 dist/index.html (SPA shell)
 *   2) 本脚本启动一个临时静态服务器 (serve dist/)
 *   3) 用 puppeteer 访问每个路由
 *   4) 等待 React hydration + react-helmet-async 完成
 *   5) 抓取最终 HTML，按路由写入 dist/<route>/index.html
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import os from "node:os";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const DIST = path.join(projectRoot, "dist");

const SERVER_PORT = 4173;
const SERVER_HOST = "127.0.0.1";
const BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;
const READY_WAIT_MS = 500;
const DETAIL_ROUTE_RE = /^\/(blog|twitter|ai-daily)\/[^/]+\/?$/;
const POOL_SIZE = Math.max(
  2,
  Math.min(Number(process.env.PRERENDER_POOL_SIZE) || 4, os.cpus().length),
);

function isDetailRoute(route) {
  return DETAIL_ROUTE_RE.test(route);
}
const IS_VERCEL = process.env.VERCEL === "1";
const DETAIL_WAIT_TIMEOUT_MS = Number(process.env.PRERENDER_DETAIL_TIMEOUT_MS)
  || (IS_VERCEL ? 120_000 : 60_000);
const INDEX_WAIT_TIMEOUT_MS = Number(process.env.PRERENDER_INDEX_TIMEOUT_MS)
  || (IS_VERCEL ? 60_000 : 60_000);

async function loadBrowser() {
  if (IS_VERCEL) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteer = (await import("puppeteer-core")).default;
    const executablePath = await chromium.executablePath();
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 1280, height: 800 },
      executablePath,
      headless: chromium.headless,
    });
  }
  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

const { prerenderRoutes } = await import("./build-routes.mjs");

function log(...args) {
  console.log(`[prerender]`, ...args);
}

function serveStatic() {
  const fileCache = new Map();
  function readCached(filePath) {
    const stat = fs.statSync(filePath);
    const cached = fileCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached;
    const buf = fs.readFileSync(filePath);
    const entry = { buf, mtimeMs: stat.mtimeMs, size: stat.size };
    fileCache.set(filePath, entry);
    return entry;
  }

  function isHashedAsset(name) {
    return /\/assets\/[^/]*-[A-Za-z0-9_-]{6,}\.(js|css|woff2?|png|jpg|jpeg|webp|svg)$/.test(
      `/${name}`,
    );
  }

  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
    let filePath = path.join(DIST, urlPath);

    let entry;
    try {
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      entry = readCached(filePath);
      res.statusCode = 200;
    } catch {
      filePath = path.join(DIST, "index.html");
      try {
        entry = readCached(filePath);
        res.statusCode = 200;
      } catch {
        res.statusCode = 404;
        res.end("not found");
        return;
      }
    }

    const ext = path.extname(filePath).toLowerCase();
    const mime = {
      ".html": "text/html; charset=utf-8",
      ".js": "application/javascript; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".ico": "image/x-icon",
      ".woff2": "font/woff2",
      ".txt": "text/plain; charset=utf-8",
      ".md": "text/markdown; charset=utf-8",
    }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", mime);
    if (isHashedAsset(urlPath)) {
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      res.setHeader("Cache-Control", "no-cache");
    }
    res.setHeader("Content-Length", entry.size);
    res.end(entry.buf);
  });
  return new Promise((resolve) =>
    server.listen(SERVER_PORT, SERVER_HOST, () => resolve(server))
  );
}

function routeToOutputPath(route) {
  if (route === "/" || route === "") return ["", "index.html"];
  const parts = route.replace(/^\//, "").split("/").filter(Boolean);
  return [parts.join("/"), "index.html"];
}

/**
 * Render a route and return { html, detail, timedOut }.
 * - timedOut: true if waitForFunction timed out.
 * - html: "" if page was completely dead.
 */
async function renderRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  let html = "";
  let timedOut = false;
  const detail = isDetailRoute(route);
  const waitTimeout = detail ? DETAIL_WAIT_TIMEOUT_MS : INDEX_WAIT_TIMEOUT_MS;
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForFunction(
      (isDetail) => {
        const hasLoading = document.body && document.body.innerText.includes("Loading…");
        if (hasLoading) return false;
        if (isDetail) return document.querySelector("article") !== null;
        return document.querySelector("h1") !== null;
      },
      { timeout: waitTimeout },
      detail
    );
    await new Promise((r) => setTimeout(r, READY_WAIT_MS));
    html = await page.content();
  } catch (err) {
    timedOut = true;
    log(`  WARN  ${route}  -> ${err.message?.slice(0, 120)}`);
    try {
      html = await page.content();
    } catch {
      html = "";
    }
  }
  return { html, detail, timedOut };
}

async function main() {
  if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, "index.html"))) {
    log(`dist/ not found; run 'npm run build' first`);
    process.exit(1);
  }

  let browser;
  try {
    browser = await loadBrowser();
  } catch (err) {
    log(`WARN: chromium launch failed (${err.message?.slice(0, 100)}); prerender skipped.`);
    process.exit(0);
  }
  log(`chromium launched${IS_VERCEL ? " (sparticuz)" : ""}`);

  const server = await serveStatic();
  log(`static server: ${BASE_URL}`);

  const queue = prerenderRoutes.slice();
  const total = queue.length;
  let nextIdx = 0;
  let ok = 0, partial = 0, fail = 0;

  async function worker(workerId) {
    while (true) {
      const idx = nextIdx++;
      if (idx >= total) break;
      const route = queue[idx];
      let page;
      let rendered = null;

      // Retry loop: up to 3 attempts per route.
      // - renderRoute timeout: page may recover with fresh page; retry
      // - detached Frame / connection closed: skip immediately (partial)
      // - other errors: fail
      for (let attempt = 1; attempt <= 3; attempt++) {
        let isRetryable = false;
        try {
          page = await browser.newPage();
          try {
            await page.setCacheEnabled(true);
          } catch { /* older puppeteer */ }

          const result = await renderRoute(page, route);
          rendered = result;

          try { await page.close(); } catch { /* ignore */ }
          await new Promise((r) => setTimeout(r, 50));

          // No error: check if we should stop
          if (!result.timedOut || attempt === 3) break;

          log(`  WARN  ${route}  -> retry ${attempt}/3 after timeout…`);
          isRetryable = true;
        } catch (err) {
          const msg = err.message || "";
          const isDetached = msg.includes("detached Frame") || msg.includes("Frame at");
          const isConnClosed = msg.includes("Connection closed") || msg.includes("ConnectionClosedError");

          try { await page.close(); } catch { /* ignore */ }
          await new Promise((r) => setTimeout(r, 50));

          if (isDetached) {
            // Detached frame = page is stuck; skip immediately.
            partial++;
            log(`  ⚠ [w${workerId}] ${route} → skipped (detached Frame — page stuck)`);
            rendered = null;
            break;
          }

          if (isConnClosed) {
            if (attempt === 3) {
              partial++;
              log(`  ⚠ [w${workerId}] ${route} → skipped (connection closed after 3 attempts)`);
              rendered = null;
              break;
            }
            log(`  WARN  ${route}  -> retry ${attempt}/3 after connection closed…`);
            isRetryable = true;
          } else {
            fail++;
            log(`  ✗ [w${workerId}] ${route}: ${msg.slice(0, 120)}`);
            rendered = null;
            break;
          }
        }
        if (!isRetryable) break;
      }

      if (!rendered) continue;

      const { html, detail } = rendered;
      const [dir, file] = routeToOutputPath(route);
      const outDir = path.join(DIST, dir);
      const outFile = path.join(outDir, file);

      // Detect empty SPA-shell fallback: body text is mostly whitespace.
      const bodyMatch = html.match(/<body[^>]*>(.*)<\/body>/s);
      const bodyText = bodyMatch
        ? bodyMatch[1]
            .replace(/<script[^>]*>.*?<\/script>/gs, "")
            .replace(/<style[^>]*>.*?<\/style>/gs, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim()
        : "";
      const isEmptyShell = bodyText.length < 100;

      if (isEmptyShell) {
        partial++;
        log(`  ⚠ [w${workerId}] ${route} → skipped (empty shell — JS render failed)`);
        continue;
      }

      const stillLoading = html.includes("Loading…") && !html.includes("<h1");
      const detailMissing = detail && !html.includes("<article");
      if (stillLoading || detailMissing) {
        partial++;
        log(`  ⚠ [w${workerId}] ${route} → skipped (${stillLoading ? "still loading" : "missing <article>"})`);
      } else {
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(outFile, html);
        ok++;
        log(`  ✓ [w${workerId}] ${route} → ${path.relative(DIST, outFile)} (${html.length} bytes)`);
      }
    }
  }

  log(`worker pool: ${POOL_SIZE} pages (set PRERENDER_POOL_SIZE to override)`);
  await Promise.all(
    Array.from({ length: POOL_SIZE }, (_, i) => worker(i)),
  );

  await browser.close();
  server.close();

  log(`done: ${ok} ok, ${partial} skipped, ${fail} fail (${POOL_SIZE} workers)`);
  process.exit(ok > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
