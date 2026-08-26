/**
 * 生成 llms.txt 和 llms-full.txt
 *
 * llms.txt         — 站点简介 + 导航 + 各区说明（给 AI bot 阅读的入口索引）
 * llms-full.txt    — 所有博客文章全文 Markdown（单文件，供 LLM 训练/索引）
 *
 * 用法: node scripts/build-llms.mjs
 * 调用时机: npm run build 之后
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

/**
 * 从 site.ts 提取 twitter.analyses 的 slug + handle + name + date
 * (避免直接 import .ts 文件，保持 pure Node ESM)
 */
function readTwitterAnalyses() {
  const src = fs.readFileSync(path.join(PROJECT_ROOT, "src/config/site.ts"), "utf8");
  const start = src.search(/analyses:\s*\[/);
  if (start < 0) return [];
  let depth = 0, end = start;
  for (let i = start; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]") { depth--; if (depth === 0) { end = i; break; } }
  }
  const block = src.slice(start, end);

  const results = [];
  // 每个 analysis 是一个 {} block
  const blockDepth = (str, pos) => {
    let d = 0;
    for (let i = pos; i < str.length; i++) {
      if (str[i] === "{") d++;
      else if (str[i] === "}") { d--; if (d === 0) return i; }
    }
    return -1;
  };

  for (const m of block.matchAll(/slug:\s*"([^"]+)"/g)) {
    const slug = m[1];
    const objStart = block.indexOf("{", m.index);
    const objEnd = blockDepth(block, objStart);
    const objBlock = block.slice(objStart, objEnd + 1);

    const getStr = (key) => {
      const km = objBlock.match(new RegExp(`${key}:\\s*"([^"]*)"`));
      return km ? km[1] : "";
    };
    const getHandle = () => {
      const km = objBlock.match(/handle:\s*"([^"]*)"/);
      return km ? km[1] : "";
    };
    const getDate = () => {
      const km = objBlock.match(/date:\s*"([^"]*)"/);
      return km ? km[1] : "";
    };

    results.push({
      slug,
      handle: getHandle(),
      name: getStr("name"),
      date: getDate(),
      url: `https://x.com/${getHandle().replace("@", "")}`,
    });
  }
  return results;
}


// ---------------------------------------------------------------------------
// AI Products meta reader (从构建产物 src/lib/ai-products-meta.json)
// ---------------------------------------------------------------------------

function readAIProductsMeta() {
  const p = path.join(PROJECT_ROOT, "src/lib/ai-products-meta.json");
  if (!fs.existsSync(p)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(p, "utf-8"));
    return data.products || [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// nav.main reader (从 src/config/site.ts 解析，避免与 siteConfig 不一致)
// ---------------------------------------------------------------------------

function readNavMain() {
  const src = fs.readFileSync(path.join(PROJECT_ROOT, "src/config/site.ts"), "utf-8");
  // Find the nav.main block
  const navStart = src.search(/main:\s*\[/);
  if (navStart < 0) return [];
  let depth = 0;
  let end = navStart;
  for (let i = navStart; i < src.length; i++) {
    const ch = src[i];
    if (ch === "[") depth++;
    else if (ch === "]") {
      depth--;
      if (depth === 0) { end = i; break; }
    }
  }
  const block = src.slice(navStart, end + 1);
  // Each item: { label: { "zh-Hans": "X", ... }, href: "/path" }
  // Parse items by matching { ... } at top level inside the array
  const items = [];
  let depth2 = 0;
  let itemStart = -1;
  for (let i = 0; i < block.length; i++) {
    const ch = block[i];
    if (ch === "{") {
      if (depth2 === 0) itemStart = i;
      depth2++;
    } else if (ch === "}") {
      depth2--;
      if (depth2 === 0 && itemStart >= 0) {
        const itemBlock = block.slice(itemStart, i + 1);
        // Extract href
        const hrefMatch = itemBlock.match(/href:\s*"([^"]+)"/);
        // Extract first available label (prefer en, fallback to zh-Hans, then any)
        const labelMatch = itemBlock.match(/label:\s*{([^}]+)}/);
        let label = "";
        if (labelMatch) {
          const labelBlock = labelMatch[1];
          const enMatch = labelBlock.match(/"en":\s*"([^"]+)"/);
          const zhMatch = labelBlock.match(/"zh-Hans":\s*"([^"]+)"/);
          if (enMatch) label = enMatch[1];
          else if (zhMatch) label = zhMatch[1];
          else {
            const anyMatch = labelBlock.match(/"[^"]+":\s*"([^"]+)"/);
            if (anyMatch) label = anyMatch[1];
          }
        }
        if (hrefMatch) {
          items.push({ label, href: hrefMatch[1] });
        }
        itemStart = -1;
      }
    }
  }
  return items;
}

// ---------------------------------------------------------------------------
// llms.txt — site overview for AI crawlers
// ---------------------------------------------------------------------------

function buildLlmsTxt() {
  const meta = readJson(path.join(PROJECT_ROOT, "src/lib/blog-meta.json"));
  const twitterAnalyses = readTwitterAnalyses();
  const aiProducts = readAIProductsMeta();
  const BASE = "https://topdigg.com";

  const lines = [
    "# TopDigg — AI-Crawler Index",
    "",
    `Source: ${BASE}`,
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Site Overview",
    "",
    "TopDigg 是一个内容聚合平台，专注于 Twitter 头部账号的深度分析与趋势追踪。",
    "We deliver in-depth Twitter analytics and trend tracking for content creators and entrepreneurs.",
    "",
    "## Navigation",
    "",
    `| Section | URL | Description |`,
    `|---|---|---|`,
    (() => {
        const navItems = readNavMain();
        const descMap = {
          "/": "Discover Web Traffic & Business Opportunities",
          "/blog": "All articles",
          "/ai-products": "Deep analyses of profitable AI products",
          "/ai-daily": "Daily AI industry news digest",
          "/twitter": "In-depth Twitter account analysis reports",
          "/columns/twitter": "Curated Twitter growth accounts",
          "/external-links": "Curated external resources",
        };
        return navItems.map((it) => {
          const desc = descMap[it.href] || "";
          return `| ${it.label} | ${BASE}${it.href} | ${desc} |`;
        }).join("\n");
      })(),
    "",
    "## Latest Blog Posts (10 most recent)",
    "",
  ];

  const sortedPosts = [...meta.posts].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const post of sortedPosts.slice(0, 10)) {
    const title = post.title.en || post.title["zh-Hans"] || Object.values(post.title)[0];
    const desc = post.description.en || post.description["zh-Hans"] || Object.values(post.description)[0];
    lines.push(`### ${title}`);
    lines.push(`URL: ${BASE}/blog/${post.slug} | Date: ${post.date} | Author: ${post.author}`);
    lines.push(`Tags: ${post.tags.join(", ")}`);
    lines.push("");
    lines.push(desc.slice(0, 300));
    lines.push("");
  }

  // AI Products Analyses (latest 5)
  lines.push("## AI Product Analyses (latest 5)");
  lines.push("");
  const sortedProducts = [...aiProducts].sort((a, b) => new Date(b.date) - new Date(a.date));
  for (const product of sortedProducts.slice(0, 5)) {
    const title = product.title?.en || product.title?.["zh-Hans"] || Object.values(product.title || {})[0] || product.slug;
    const desc = product.description?.en || product.description?.["zh-Hans"] || Object.values(product.description || {})[0] || "";
    lines.push(`### ${title}`);
    lines.push(`URL: ${BASE}/ai-products/${product.slug} | Date: ${product.date} | Author: ${product.author}`);
    lines.push(`Product: ${product.product?.name || ""} | Category: ${product.product?.category || ""}`);
    if (product.product?.revenue) lines.push(`Revenue: ${product.product.revenue}`);
    lines.push("");
    if (desc) lines.push(desc.slice(0, 300));
    lines.push("");
  }

  lines.push("## Twitter Analysis Reports");
  lines.push("");
  for (const a of twitterAnalyses) {
    lines.push(`### ${a.name} (@${a.handle})`);
    lines.push(`URL: ${BASE}/twitter/${a.slug} | Date: ${a.date}`);
    lines.push(`Twitter: ${a.url}`);
    lines.push("");
  }

  lines.push("## Columns — Top Accounts");
  lines.push("");
  lines.push("### Twitter");
  lines.push("Top Twitter accounts for growth and entrepreneurship:");
  const twAccounts = [
    { name: "Sahil Bloom", handle: "@SahilBloom", url: "https://x.com/SahilBloom" },
    { name: "Julian Shapiro", handle: "@Julian", url: "https://x.com/Julian" },
    { name: "Brian Lovin", handle: "@brian_lovin", url: "https://x.com/brian_lovin" },
    { name: "Lenny Rachitsky", handle: "@lennysan", url: "https://x.com/lennysan" },
    { name: "Andrew Chen", handle: "@andrewchen", url: "https://x.com/andrewchen" },
  ];
  for (const acc of twAccounts) lines.push(`- ${acc.name} (${acc.handle}): ${acc.url}`);
  lines.push("");

  lines.push("---");
  lines.push(`End of llms.txt | ${meta.posts.length} blog posts | ${twitterAnalyses.length} Twitter analyses | ${aiProducts.length} AI products`);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// llms-full.txt — full blog content
// ---------------------------------------------------------------------------

function buildLlmsFullTxt() {
  const full = readJson(path.join(PROJECT_ROOT, "src/lib/blog-data.json"));

  const lines = [
    `# TopDigg — Full Content Export`,
    `Source: https://topdigg.com`,
    `Generated: ${new Date().toISOString()}`,
    ``,
  ];

  const sortedPosts = [...full.posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  for (const post of sortedPosts) {
    const titleEn = post.title?.en || "";
    const titleZh = post.title?.["zh-Hans"] || "";
    const descEn = post.description?.en || "";
    const descZh = post.description?.["zh-Hans"] || "";
    const contentEn = post.content?.en || "";
    const contentZh = post.content?.["zh-Hans"] || "";

    lines.push("---");
    lines.push(`# ${titleEn}`);
    if (titleZh) lines.push(`# ${titleZh}`);
    lines.push(`Date: ${post.date} | Author: ${post.author} | Tags: ${(post.tags || []).join(", ")}`);
    lines.push(`URL: https://topdigg.com/blog/${post.slug}`);
    lines.push("");
    if (descEn) { lines.push("## Description / English"); lines.push(descEn); lines.push(""); }
    if (descZh) { lines.push("## 描述 / 中文"); lines.push(descZh); lines.push(""); }
    if (contentEn) { lines.push("## Full Article Content / English"); lines.push(contentEn); lines.push(""); }
    if (contentZh) { lines.push("## 完整文章内容 / 中文"); lines.push(contentZh); lines.push(""); }
    lines.push("");
  }

  const totalBytes = Buffer.byteLength(lines.join("\n"), "utf8");
  lines.push("---");
  lines.push(`End of llms-full.txt | ${full.posts.length} articles | ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // llms.txt
  const llmsTxt = buildLlmsTxt();
  const llmsTxtPath = path.join(PUBLIC_DIR, "llms.txt");
  fs.writeFileSync(llmsTxtPath, llmsTxt, "utf8");
  const llmsTxtSize = (Buffer.byteLength(llmsTxt, "utf8") / 1024).toFixed(1);
  console.log(`[llms] wrote ${llmsTxtPath} (${llmsTxtSize} KB)`);

  // llms-full.txt
  try {
    const llmsFullTxt = buildLlmsFullTxt();
    const llmsFullPath = path.join(PUBLIC_DIR, "llms-full.txt");
    fs.writeFileSync(llmsFullPath, llmsFullTxt, "utf8");
    const sizeMB = (Buffer.byteLength(llmsFullTxt, "utf8") / 1024 / 1024).toFixed(2);
    console.log(`[llms] wrote ${llmsFullPath} (${sizeMB} MB)`);
  } catch (err) {
    console.error("[llms] ERROR building llms-full.txt:", err.message);
    process.exit(1);
  }
}

main();
