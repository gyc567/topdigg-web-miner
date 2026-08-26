// 生成 public/sitemap.xml：静态路由 + 博客文章 + Twitter 分析 + AI 日报 + AI 产品分析
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const BASE = 'https://topdigg.com';

const staticRoutes = [
  { loc: '/', priority: '1.0' },
  { loc: '/blog', priority: '0.9' },
  { loc: '/ai-products', priority: '0.9' },
  { loc: '/ai-daily', priority: '0.8' },
  { loc: '/twitter', priority: '0.8' },
  { loc: '/columns/twitter', priority: '0.7' },
  { loc: '/external-links', priority: '0.5' },
  { loc: '/about', priority: '0.5' },
  { loc: '/privacy', priority: '0.3' },
];

const blogData = JSON.parse(
  fs.readFileSync(path.join(root, 'src/lib/blog-data.json'), 'utf-8')
);

const twitterDir = path.join(root, 'public/content/twitter');
const twitterSlugs = fs
  .readdirSync(twitterDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

// AI 日报：从 meta JSON 取 slug（构建产物，不读 content 目录）
let aiDailySlugs = [];
const aiDailyMetaPath = path.join(root, 'src/lib/ai-daily-meta.json');
if (fs.existsSync(aiDailyMetaPath)) {
  try {
    const aiDailyMeta = JSON.parse(fs.readFileSync(aiDailyMetaPath, 'utf-8'));
    aiDailySlugs = (aiDailyMeta.reports || []).map((r) => r.slug).filter(Boolean);
  } catch {}
}

// AI 产品分析：从 meta JSON 取 slug（构建产物）
let aiProductsData = { products: [] };
const aiProductsMetaPath = path.join(root, 'src/lib/ai-products-meta.json');
if (fs.existsSync(aiProductsMetaPath)) {
  try {
    aiProductsData = JSON.parse(fs.readFileSync(aiProductsMetaPath, 'utf-8'));
  } catch {}
}

const urls = [
  ...staticRoutes.map((r) => ({ loc: `${BASE}${r.loc}`, priority: r.priority })),
  ...blogData.posts.map((p) => ({
    loc: `${BASE}/blog/${p.slug}`,
    lastmod: p.date,
    priority: '0.8',
  })),
  ...twitterSlugs.map((s) => ({ loc: `${BASE}/twitter/${s}`, priority: '0.7' })),
  ...aiDailySlugs.map((s) => ({
    loc: `${BASE}/ai-daily/${s}`,
    priority: '0.6',
  })),
  ...(aiProductsData.products || []).map((p) => ({
    loc: `${BASE}/ai-products/${p.slug}`,
    lastmod: p.date,
    priority: '0.8',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const out = path.join(root, 'public/sitemap.xml');
fs.writeFileSync(out, xml);
console.log(`✅ Generated sitemap with ${urls.length} urls (${(aiProductsData.products || []).length} AI products, ${aiDailySlugs.length} AI daily reports)`);
