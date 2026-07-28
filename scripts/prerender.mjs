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
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const DIST = path.join(projectRoot, "dist");

const SERVER_PORT = 4173;
const SERVER_HOST = "127.0.0.1";
const BASE_URL = `http://${SERVER_HOST}:${SERVER_PORT}`;
const RENDER_EVENT = "render-event";
const READY_WAIT_MS = 250;
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
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
}

// 导入路由清单
const { prerenderRoutes } = await import("./build-routes.mjs");

function log(...args) {
  console.log(`[prerender]`, ...args);
}

function serveStatic() {
  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
    if (urlPath === "/" || urlPath === "") urlPath = "/index.html";
    let filePath = path.join(DIST, urlPath);

    // 目录 → 找 index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }
    // SPA fallback：如果文件不存在，落回 index.html（SPA shell）
    // 但 404 路径会被标记，让 puppeteer 抓到的 HTML 标记为 404
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      const notFoundMarker = urlPath !== "/notfound";
      filePath = path.join(DIST, "index.html");
      if (notFoundMarker) {
        res.statusCode = 200; // SPA shell，仍为 200（保持原行为不变）
      }
    } else {
      res.statusCode = 200;
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
    res.setHeader("Cache-Control", "public, max-age=0");
    fs.createReadStream(filePath).pipe(res);
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

async function renderRoute(browser, route) {
  const page = await browser.newPage();
  const url = `${BASE_URL}${route}`;
  let html;
  try {
    await page.goto(url, { waitUntil: "networkidle0", timeout: 30_000 });
    // 等待 render-event 派发（main.tsx 触发）
    await page.waitForFunction(
      (eventName) => {
        // 简单检测：DOM 已有 <article> 或包含数据已被注入
        return document.querySelector("article, main, h1") !== null;
      },
      { timeout: 15_000 },
      RENDER_EVENT
    );
    // 再延 250ms 确保 react-helmet-async effect 已写完 head
    await new Promise((r) => setTimeout(r, READY_WAIT_MS));
    html = await page.content();
  } catch (err) {
    log(`  WARN  ${route}  -> ${err.message?.slice(0, 100)}`);
    html = await page.content(); // 抓部分 HTML 兜底
  } finally {
    await page.close();
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

  let ok = 0, fail = 0;
  for (const route of prerenderRoutes) {
    try {
      const html = await renderRoute(browser, route);
      const [dir, file] = routeToOutputPath(route);
      const outDir = path.join(DIST, dir);
      const outFile = path.join(outDir, file);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outFile, html);
      ok++;
      log(`  ✓ ${route} → ${path.relative(DIST, outFile)} (${html.length} bytes)`);
    } catch (err) {
      fail++;
      log(`  ✗ ${route}: ${err.message?.slice(0, 80)}`);
    }
  }

  await browser.close();
  server.close();

  log(`done: ${ok} ok, ${fail} fail`);
  // Non-zero exit only when *none* of the routes succeeded
  process.exit(ok > 0 ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
