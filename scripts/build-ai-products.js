import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/ai-products');
const dataOutputFile = path.join(__dirname, '../src/lib/ai-products-data.json');
const metaOutputFile = path.join(__dirname, '../src/lib/ai-products-meta.json');
const perSlugDir = path.join(__dirname, '../src/lib/ai-products-data');

const LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];
const DEFAULT_AUTHOR = 'ERIC';

// Normalize title/description: per-locale md files use plain strings.
function normalizeLocalized(value, locale) {
  if (!value) return {};
  if (typeof value === 'string') return { [locale]: value };
  if (typeof value === 'object') return value;
  return {};
}

function scanDirectory(dir, locale = null) {
  const items = [];
  if (!fs.existsSync(dir)) return items;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      items.push(...scanDirectory(filePath, file));
    } else if (file.endsWith('.md')) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(fileContent);
      const slug = file.replace('.md', '');
      items.push({
        slug,
        locale: locale || 'zh-Hans',
        title: normalizeLocalized(data.title, locale || 'zh-Hans'),
        description: normalizeLocalized(data.description, locale || 'zh-Hans'),
        content: markdownContent,
        date: data.date || new Date().toISOString().split('T')[0],
        author: data.author || DEFAULT_AUTHOR,
        tags: data.tags || [],
        categories: data.categories || [],
        // Product-specific fields (optional in frontmatter but required at runtime)
        product: data.product || null,
        pricing: data.pricing || null,
        metrics: data.metrics || null,
        sources: data.sources || null,
      });
    }
  }
  return items;
}

function generateAIProductsData() {
  const files = scanDirectory(contentDir);
  const posts = {};

  for (const file of files) {
    if (!posts[file.slug]) {
      posts[file.slug] = {
        slug: file.slug,
        title: {},
        description: {},
        content: {},
        date: file.date,
        author: file.author,
        tags: file.tags,
        categories: file.categories,
        product: file.product,
        pricing: file.pricing,
        metrics: file.metrics,
        sources: file.sources,
      };
    }

    // Merge per-locale fields
    for (const [l, v] of Object.entries(normalizeLocalized(file.title))) {
      posts[file.slug].title[l] = v;
    }
    for (const [l, v] of Object.entries(normalizeLocalized(file.description))) {
      posts[file.slug].description[l] = v;
    }
    posts[file.slug].content[file.locale] = file.content;
  }

  const sortedPosts = Object.values(posts).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Full data (with content + product info)
  const aiProductsData = {
    products: sortedPosts.map(({ categories, ...post }) => post)
  };

  // Meta only (no content) — used by build-routes + slug lookup
  const aiProductsMeta = {
    products: sortedPosts.map(({ content, ...meta }) => meta)
  };

  fs.writeFileSync(dataOutputFile, JSON.stringify(aiProductsData, null, 2));
  fs.writeFileSync(metaOutputFile, JSON.stringify(aiProductsMeta, null, 2));
  console.log(
    `✅ Generated ai-products-data.json (${aiProductsData.products.length} products) and ai-products-meta.json`
  );

  // Per-locale meta for code-splitting (eager loading by list pages)
  for (const locale of LOCALES) {
    const localizedMeta = {
      products: sortedPosts.map(({ content, title, description, ...meta }) => ({
        ...meta,
        title: title[locale] || title['zh-Hans'] || title.en || Object.values(title).find(Boolean) || '',
        description: description[locale] || description['zh-Hans'] || description.en || Object.values(description).find(Boolean) || '',
      }))
    };
    const localeOutputFile = path.join(__dirname, `../src/lib/ai-products-meta-${locale}.json`);
    fs.writeFileSync(localeOutputFile, JSON.stringify(localizedMeta, null, 2));
    const sizeKB = Math.round(Buffer.byteLength(JSON.stringify(localizedMeta), 'utf8') / 1024);
    console.log(
      `✅ Generated ai-products-meta-${locale}.json (${sizeKB} KB, ${localizedMeta.products.length} products)`
    );
  }

  // Per-slug content files for lazy detail-page loading (~50-80KB/slug).
  // Each detail page imports only its own slug file instead of the full data.json.
  if (!fs.existsSync(perSlugDir)) {
    fs.mkdirSync(perSlugDir, { recursive: true });
  }
  // Clean stale per-slug files (in case a product was deleted).
  for (const f of fs.readdirSync(perSlugDir)) {
    if (f.endsWith('.json')) fs.unlinkSync(path.join(perSlugDir, f));
  }
  for (const post of sortedPosts) {
    const { categories, slug, ...rest } = post;
    fs.writeFileSync(
      path.join(perSlugDir, `${slug}.json`),
      JSON.stringify({ slug, ...rest }, null, 2)
    );
  }
  console.log(`✅ Generated per-slug content (${sortedPosts.length} files in src/lib/ai-products-data/)`);

  // Product existence assertion: at least one product file expected after first content is added.
  // Empty state is allowed during scaffolding (Phase 1) but warn to surface the situation.
  if (sortedPosts.length === 0) {
    console.warn(
      '⚠️  No AI products found in content/ai-products/. ' +
      'Add at least one product markdown file before shipping.'
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAIProductsData();
}

export { generateAIProductsData };
