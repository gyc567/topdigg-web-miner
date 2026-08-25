/**
 * 阶段2：构建后预渲染所有路由为静态 HTML
 *
 * 工作流：
 *   1) vite build 产物在 dist/index.html (SPA shell)
 *   2) 本脚本启动一个临时静态服务器 (serve dist/)
 *   3) 用 puppeteer 访问每个路由
 *   4) 等待 React hydration + react-helmet-async 完成 + dispatch('render-event')
 *   5) 抓取最终 HTML，按路由写入 dist/<route>/index.html
 *   6) 包含 client-side 路由 catch-all 时返回 dist/404.html
 *
 * 用法：
 *   1) npm run build       (生成 dist/)
 *   2) node scripts/prerender.mjs
 *   3) vercel deploy
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
const RENDER_EVENT = "render-event";
const READY_WAIT_MS = 500;
// Vercel sparticuz chromium is much slower than local; need longer timeouts
// for routes that lazy-load 9.9 MB blog-data.json + 9.5 MB ai-daily-data.
const WAIT_TIMEOUT_MS = Number(process.env.PRERENDER_WAIT_TIMEOUT_MS) || 60_000;
// Detail pages (blog/ai-daily/twitter post) load big data; index pages are fast.
const DETAIL_ROUTE_RE = /^\/(blog|twitter|ai-daily)\/[^/]+\/?$/;
// Worker pool size for concurrent prerender. Each worker owns one puppeteer page
// that reuses the same HTTP cache + connection pool across routes. 4 is a good
// default — enough parallelism to overlap chromium work without blowing memory
// (each page ≈ 100–300 MB resident).
const POOL_SIZE = Math.max(
  2,
  Math.min(Number(process.env.PRERENDER_POOL_SIZE) || 4, os.cpus().length),
);

function isDetailRoute(route) {
  return DETAIL_ROUTE_RE.test(route);
}
const IS_VERCEL = process.env.VERCEL === "1";

// Local: full puppeteer + system chromium. Vercel: sparticuz chromium.
async function loadBrowser() {
  if (IS_VERCEL) {
    // Lazy import so local devs do not bundle sparticuz
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

// 导入路由清单
const { prerenderRoutes } = await import("./build-routes.mjs");

function log(...args) {
  console.log(`[prerender]`, ...args);
}

function serveStatic() {
  // In-process file cache: same path served from many puppeteer pages would
  // otherwise re-stat + re-open + re-read per request. Keyed by absolute path,
  // invalidated by mtime (rebuilds change mtime on every dist file).
  const fileCache = new Map(); // filePath -> { buf: Buffer, mtimeMs: number, size: number }
  function readCached(filePath) {
    const stat = fs.statSync(filePath); // throws if missing
    const cached = fileCache.get(filePath);
    if (cached && cached.mtimeMs === stat.mtimeMs) return cached;
    const buf = fs.readFileSync(filePath);
    const entry = { buf, mtimeMs: stat.mtimeMs, size: stat.size };
    fileCache.set(filePath, entry);
    return entry;
  }

  // Hashed Vite assets (e.g. /assets/index-abc123.js) are immutable — long
  // max-age lets the puppeteer HTTP cache serve them on the second route visit
  // without re-reading disk. index.html stays no-cache so re-deploys are picked up.
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
      // 目录 → 找 index.html
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, "index.html");
      }
      entry = readCached(filePath);
      res.statusCode = 200;
    } catch {
      // SPA fallback: 不存在 → 落回 index.html (SFR shell)
      filePath = path.join(DIST, "index.html");
      try {
        entry = readCached(filePath);
        // 不存在的路径仍然返回 200（SPA shell），与原行为一致
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
    // Hashed Vite assets are content-addressed → safe to cache forever.
    // index.html and unknown paths stay no-cache so they reflect rebuilds.
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
  // "/" → dist/index.html
  // "/blog/foo" → dist/blog/foo/index.html
  if (route === "/" || route === "") return ["", "index.html"];
  const parts = route.replace(/^\//, "").split("/").filter(Boolean);
  return [parts.join("/"), "index.html"];
}

async function renderRoute(page, route) {
  const url = `${BASE_URL}${route}`;
  let html;
  const detail = isDetailRoute(route);
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60_000 });
    // 等待真正内容渲染。Layout.tsx 一直渲染 <main>，所以 <main> 太宽泛；
    // 详情页要等 <article>（只有数据加载完才出现），索引/静态页等 <h1>。
    // 同时确保 Suspense 的 "Loading…" 兜底已消失。
    await page.waitForFunction(
      (isDetail) => {
        const hasLoading = document.body && document.body.innerText.includes("Loading…");
        if (hasLoading) return false;
        if (isDetail) {
          return document.querySelector("article") !== null;
        }
        return document.querySelector("h1") !== null;
      },
      { timeout: WAIT_TIMEOUT_MS },
      detail
    );
    // 再延一会儿确保 react-helmet-async effect 已写完 head
    await new Promise((r) => setTimeout(r, READY_WAIT_MS));
    html = await page.content();
  } catch (err) {
    log(`  WARN  ${route}  -> ${err.message?.slice(0, 120)}`);
    html = await page.content(); // 抓部分 HTML 兜底
  }
  return html;
}

async function main() {
  if (!fs.existsSync(DIST) || !fs.existsSync(path.join(DIST, "index.html"))) {
    log(`dist/ not found; run 'npm run build' first`);
    process.exit(1);
  }

  // Sanity: require puppeteer + chromium to launch. On Vercel,
  // puppeteer may not be installed or chromium download may fail.
  // In either case, we exit 0 so the build does not fail.
  let browser;
  try {
    browser = await loadBrowser();
  } catch (err) {
    log(`WARN: chromium launch failed (${err.message?.slice(0, 100)}); prerender skipped.`);
    process.exit(0);
  }
  log(`chromium launched${IS_VERCEL ? " (sparticuz)" : ""}`);

  // Local: serve static files ourselves; on Vercel this is unnecessary since `dist/` is already mounted
  // but it does not hurt because puppeteer still needs HTTP to evaluate JS.
  const server = await serveStatic();
  log(`static server: ${BASE_URL}`);

  let ok = 0, fail = 0, partial = 0;

  // Worker pool: each worker owns ONE puppeteer page for its entire lifetime.
  // Reusing the same page across routes gives us a hot HTTP/2 connection to the
  // static server, browser-level HTTP cache for hashed Vite assets, and avoids
  // the ~200ms newPage() teardown cost per route.
  const queue = prerenderRoutes.slice();
  const total = queue.length;
  let nextIdx = 0;

  async function worker(workerId) {
    const page = await browser.newPage();
    try {
      await page.setCacheEnabled(true);
    } catch {
      // Older puppeteer: no-op, cache just won't be enabled for this page.
    }
    while (true) {
      const idx = nextIdx++;
      if (idx >= total) break;
      const route = queue[idx];
      try {
        const html = await renderRoute(page, route);
        const [dir, file] = routeToOutputPath(route);
        const outDir = path.join(DIST, dir);
        const outFile = path.join(outDir, file);
        // Detect incomplete render: "Loading…" text still present means
        // the page never finished hydrating. Don't write a partial file —
        // a static SPA shell with "Loading…" is worse for SEO than letting
        // the route fall back to client-side rendering at request time.
        const stillLoading = html.includes("Loading…") && !html.includes("<h1");
        if (stillLoading) {
          partial++;
          log(`  ⚠ [w${workerId}] ${route} → skipped (still loading after timeout)`);
          continue;
        }
        fs.mkdirSync(outDir, { recursive: true });
        fs.writeFileSync(outFile, html);
        ok++;
        log(`  ✓ [w${workerId}] ${route} → ${path.relative(DIST, outFile)} (${html.length} bytes)`);
      } catch (err) {
        fail++;
        log(`  ✗ [w${workerId}] ${route}: ${err.message?.slice(0, 80)}`);
      }
    }
    await page.close();
  }

  log(`worker pool: ${POOL_SIZE} pages (set PRERENDER_POOL_SIZE to override)`);
  await Promise.all(
    Array.from({ length: POOL_SIZE }, (_, i) => worker(i)),
  );

  await browser.close();
  server.close();

  log(`done: ${ok} ok, ${partial} skipped, ${fail} fail (${POOL_SIZE} workers)`);
  // Non-zero exit only when *none* of the routes succeeded
  process.exit(ok > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
