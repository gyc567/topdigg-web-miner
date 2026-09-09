/**
 * prerender 增量缓存
 *
 * 目标：典型提交（新增/修改 1-2 篇内容）不需要重渲染全部 ~210 个路由。
 *
 * 缓存 key 设计（三层）：
 *   chromeHash  代码层 —— src/**（排除 src/lib 下的生成 JSON）+ 根配置文件。
 *               任何组件/文案/样式变更 → 所有路由失效（正确性优先）。
 *   dataHash    列表数据层 —— src/lib/*.json（blog-meta 等，不含 per-slug 目录）。
 *               新增文章 → 只有列表/静态页重渲染，detail 页缓存仍命中。
 *   contentHash 路由自身内容 —— detail 路由对应的 per-slug JSON / content md。
 *               改一篇文章 → 只有该 detail 页重渲染。
 *
 * 用法：
 *   const key = cacheKeyForRoute(root, route, hashes);
 *   const html = readCache(cacheDir, key);        // 命中则跳过渲染
 *   writeCache(cacheDir, key, html);              // 渲染成功后回写
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

/** 递归收集目录下所有文件（可按目录名排除）。 */
export function collectFiles(dir, { excludeDirs = [] } = {}) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) walk(full);
      } else {
        out.push(full);
      }
    }
  };
  walk(dir);
  return out.sort();
}

/** 对文件列表做 sha256（文件名 + 内容，排序后）。 */
export function hashFiles(files) {
  const h = crypto.createHash("sha256");
  for (const f of files) {
    try {
      h.update(path.basename(f));
      h.update(fs.readFileSync(f));
    } catch {
      // 文件在哈希计算间隙消失则跳过（构建期文件集合是稳定的）
    }
  }
  return h.digest("hex");
}

/**
 * 代码层 hash：任何 UI/chrome 变化都应使全部缓存失效。
 * 排除 src/lib 下的 JSON —— 它们是数据层，单独由 dataHash / contentHash 覆盖，
 * 否则改一篇文章就会打穿所有 detail 页的缓存。
 */
export function computeChromeHash(projectRoot) {
  const srcDir = path.join(projectRoot, "src");
  const files = collectFiles(srcDir, {
    excludeDirs: ["blog-data", "ai-products-data", "ai-daily-data"],
  }).filter((f) => {
    const rel = path.relative(srcDir, f);
    // src/lib 根下的 JSON 是生成数据（meta），归入 dataHash；per-slug 目录已排除
    if (rel.startsWith(`lib${path.sep}`) && f.endsWith(".json")) return false;
    return true;
  });
  for (const extra of ["vite.config.ts", "package-lock.json", "index.html"]) {
    const p = path.join(projectRoot, extra);
    if (fs.existsSync(p)) files.push(p);
  }
  return hashFiles(files.sort());
}

/** 列表数据层 hash：src/lib 根下的生成 JSON（meta 类）。 */
export function computeDataHash(projectRoot) {
  const libDir = path.join(projectRoot, "src", "lib");
  const files = fs
    .readdirSync(libDir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(libDir, e.name));
  return hashFiles(files.sort());
}

// detail 路由 → [per-slug 构建产物目录, 内容源目录]
const DETAIL_CONTENT = {
  blog: ["src/lib/blog-data", "content/blog"],
  "ai-products": ["src/lib/ai-products-data", "content/ai-products"],
  "ai-daily": ["src/lib/ai-daily-data", "content/ai-daily"],
  twitter: [null, "public/content/twitter"],
};

/** 取路由自身的内容文件；静态路由返回 []。 */
export function contentFilesForRoute(projectRoot, route) {
  const m = route.match(/^\/(blog|ai-products|ai-daily|twitter)\/([^/]+)\/?$/);
  if (!m) return [];
  const [, section, slug] = m;
  const [builtDir, contentDir] = DETAIL_CONTENT[section];
  const files = [];

  // 优先 per-slug 构建产物（单文件，构建时已生成）
  if (builtDir) {
    const built = path.join(projectRoot, builtDir, `${slug}.json`);
    if (fs.existsSync(built)) return [built];
  }
  // 回退：在内容目录里按文件名匹配所有语言版本
  const dir = path.join(projectRoot, contentDir);
  if (fs.existsSync(dir)) {
    const walk = (d) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (entry.name === `${slug}.md`) files.push(full);
      }
    };
    walk(dir);
  }
  return files.sort();
}

/**
 * 计算单个路由的缓存 key。hashes = { chrome, data }（由调用方一次性算好）。
 * detail 路由：chrome + 自身内容（列表数据变化不影响）。
 * 列表/静态路由：chrome + dataHash（新增文章 → 列表页重渲染，detail 页缓存仍命中）。
 */
export function cacheKeyForRoute(projectRoot, route, hashes) {
  const h = crypto.createHash("sha256");
  h.update(hashes.chrome);
  const contentFiles = contentFilesForRoute(projectRoot, route);
  if (contentFiles.length > 0) {
    h.update(hashFiles(contentFiles));
  } else {
    h.update(hashes.data);
  }
  h.update(route);
  return h.digest("hex");
}

export function readCache(cacheDir, key) {
  const p = path.join(cacheDir, `${key}.html`);
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

export function writeCache(cacheDir, key, html) {
  fs.mkdirSync(cacheDir, { recursive: true });
  fs.writeFileSync(path.join(cacheDir, `${key}.html`), html);
}
