/**
 * 生成预渲染路由清单
 * 来源：
 *   - src/lib/blog-meta.json（28 篇 blog 详情，metadata only）
 *   - src/config/site.ts twitter.analyses（4 篇 twitter 详情）
 *   - 静态路由
 * 仅 default locale 渲染；其他语言由 SPA 端处理
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

function readBlogSlugs() {
  const p = path.join(projectRoot, "src/lib/blog-meta.json");
  if (!fs.existsSync(p)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return (data.posts || []).map((post) => post.slug).filter(Boolean);
  } catch {
    return [];
  }
}

function readTwitterSlugs() {
  const p = path.join(projectRoot, "src/config/site.ts");
  if (!fs.existsSync(p)) return [];
  try {
    const src = fs.readFileSync(p, "utf8");
    // Find the `analyses: [` block, then collect all `slug: "..."` until matching ]
    const start = src.search(/analyses:\s*\[/);
    if (start < 0) return [];
    // Walk braces from the [
    let depth = 0;
    let end = start;
    for (let i = start; i < src.length; i++) {
      const ch = src[i];
      if (ch === "[") depth++;
      else if (ch === "]") {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }
    const block = src.slice(start, end);
    const slugs = [];
    for (const m of block.matchAll(/slug:\s*"([^"]+)"/g)) {
      slugs.push(m[1]);
    }
    return slugs;
  } catch {
    return [];
  }
}

export function buildRoutes() {
  const blogSlugs = readBlogSlugs();
  const twitterSlugs = readTwitterSlugs();

  const staticPaths = [
    "/",
    "/blog",
    "/twitter",
    "/columns/reddit",
    "/columns/youtube",
    "/columns/twitter",
    "/external-links",
    "/about",
    "/contact",
    "/privacy",
    "/notfound",
  ];

  const detailPaths = [
    ...blogSlugs.map((s) => `/blog/${s}`),
    ...twitterSlugs.map((s) => `/twitter/${s}`),
  ];

  return [...staticPaths, ...detailPaths];
}

export const prerenderRoutes = buildRoutes();
