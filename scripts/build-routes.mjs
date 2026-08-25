/**
 * 生成预渲染路由清单
 * 来源：
 *   - src/lib/blog-meta.json（blog 详情 metadata only）
 *   - src/config/site.ts twitter.analyses（twitter 详情）
 *   - 静态路由
 * 仅 default locale 渲染；其他语言由 SPA 端处理
 *
 * 模式（PRERENDER_SKIP_ARCHIVE=1）：
 *   仅 prerender 30 天内的 blog + 所有静态 + 所有 twitter。
 *   旧的 archive blog 由 CSR 兜底（少量 SEO 损失换取 ~3× 提速）。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// Static paths that should always be prerendered.
const STATIC_PATHS = [
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

// Slugs without a date prefix are always treated as recent (hand-curated
// evergreen content like "cumora-analysis", "raft-analysis", etc.).
function isRecentSlug(slug, cutoffMs) {
  const m = slug.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return true;
  const date = new Date(`${m[1]}-${m[2]}-${m[3]}`).getTime();
  return !Number.isNaN(date) && date >= cutoffMs;
}

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

function readAiDailySlugs() {
  const p = path.join(projectRoot, "src/lib/ai-daily-meta.json");
  if (!fs.existsSync(p)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf8"));
    return (data.reports || []).map((r) => r.slug).filter(Boolean);
  } catch {
    return [];
  }
}

function readTwitterSlugs() {
  const p = path.join(projectRoot, "src/config/site.ts");
  if (!fs.existsSync(p)) return [];
  try {
    const src = fs.readFileSync(p, "utf8");
    const start = src.search(/analyses:\s*\[/);
    if (start < 0) return [];
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

export function buildRoutes(options = {}) {
  const { skipArchive = false, archiveAfterDays = 7 } = options;
  const blogSlugs = readBlogSlugs();
  const twitterSlugs = readTwitterSlugs();
  const aiDailySlugs = readAiDailySlugs();

  const cutoff = Date.now() - archiveAfterDays * 24 * 60 * 60 * 1000;
  const recentBlogSlugs = skipArchive
    ? blogSlugs.filter((s) => isRecentSlug(s, cutoff))
    : blogSlugs;

  const detailPaths = [
    ...recentBlogSlugs.map((s) => `/blog/${s}`),
    ...twitterSlugs.map((s) => `/twitter/${s}`),
    ...aiDailySlugs.map((s) => `/ai-daily/${s}`),
  ];

  return [...STATIC_PATHS, ...detailPaths];
}

// CLI / build-time selection.
//   PRERENDER_SKIP_ARCHIVE=1 → fast build (only recent blog posts)
//   PRERENDER_SKIP_ARCHIVE_DAYS=N → override the default 7-day cutoff
const skipArchive = process.env.PRERENDER_SKIP_ARCHIVE === "1";
const archiveAfterDays = Number(process.env.PRERENDER_SKIP_ARCHIVE_DAYS) || 7;
export const prerenderRoutes = buildRoutes({ skipArchive, archiveAfterDays });