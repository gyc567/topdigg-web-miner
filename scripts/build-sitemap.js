// 生成 public/sitemap.xml：静态路由 + 博客文章（取自 blog-data.json）+ Twitter 分析（取自 public/content/twitter）
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const BASE = 'https://topdigg.com';

const staticRoutes = [
  { loc: '/', priority: '1.0' },
  { loc: '/blog', priority: '0.9' },
  { loc: '/twitter', priority: '0.8' },
  { loc: '/columns/reddit', priority: '0.7' },
  { loc: '/columns/youtube', priority: '0.7' },
  { loc: '/columns/twitter', priority: '0.7' },
  { loc: '/external-links', priority: '0.5' },
];

const blogData = JSON.parse(
  fs.readFileSync(path.join(root, 'src/lib/blog-data.json'), 'utf-8')
);

const twitterDir = path.join(root, 'public/content/twitter');
const twitterSlugs = fs
  .readdirSync(twitterDir)
  .filter((f) => f.endsWith('.md'))
  .map((f) => f.replace(/\.md$/, ''));

const urls = [
  ...staticRoutes.map((r) => ({ loc: `${BASE}${r.loc}`, priority: r.priority })),
  ...blogData.posts.map((p) => ({
    loc: `${BASE}/blog/${p.slug}`,
    lastmod: p.date,
    priority: '0.8',
  })),
  ...twitterSlugs.map((s) => ({ loc: `${BASE}/twitter/${s}`, priority: '0.7' })),
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
console.log(`✅ Generated sitemap with ${urls.length} urls`);
