import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/blog');
const articlesDir = path.join(__dirname, '../articles');
const dataOutputFile = path.join(__dirname, '../src/lib/blog-data.json');
const metaOutputFile = path.join(__dirname, '../src/lib/blog-meta.json');
const perSlugDir = path.join(__dirname, '../src/lib/blog-data');

function scanDirectory(dir, locale = null) {
  const items = [];

  if (!fs.existsSync(dir)) {
    return items;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      items.push(...scanDirectory(filePath, file));
    } else if (file.endsWith('.md')) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(content);

      const slug = file.replace('.md', '');

      items.push({
        slug,
        locale: locale || 'zh-Hans',
        title: data.title || '',
        description: data.description || '',
        content: markdownContent,
        date: data.date || new Date().toISOString(),
        author: data.author || 'TopDigg',
        tags: data.tags || [],
        categories: data.categories || []
      });
    }
  }

  return items;
}

/**
 * Scan `articles/<slug>/<slug>.md` (nested layout, zh-Hans only).
 *
 * Convention: `articles/` is for evergreen / un-dated deep-dives that don't follow
 * the `content/blog/zh-Hans/YYYY-MM-DD-slug.md` pattern. They still go through the
 * same blog pipeline (build-blog.js + blog-data.json + blog-meta.json + prerender),
 * so URL stays `/blog/<slug>/` (same as content/blog/).
 *
 * Frontmatter REQUIRED — same as content/blog/ (fail-fast enforces).
 */
function scanArticles() {
  // articles/X/*.md (filename = slug by convention; if mismatch, we still
  // pick up the first .md file in the directory so upstream mistakes don't
  // silently kill the article).
  const items = [];
  if (!fs.existsSync(articlesDir)) return items;
  for (const entry of fs.readdirSync(articlesDir)) {
    const subdir = path.join(articlesDir, entry);
    if (!fs.statSync(subdir).isDirectory()) continue;
    // Convention: X.md. Fallback: first *.md in dir.
    let md = path.join(subdir, `${entry}.md`);
    if (!fs.existsSync(md)) {
      const mds = fs.readdirSync(subdir).filter((f) => f.endsWith('.md'));
      if (mds.length === 0) continue;
      md = path.join(subdir, mds[0]);
      console.warn(`[build-blog] articles/${entry}/${mds[0]} used (filename ≠ directory)`);
    }
    const content = fs.readFileSync(md, 'utf-8');
    const { data, content: markdownContent } = matter(content);
    items.push({
      slug: entry,                                  // slug = directory name
      locale: 'zh-Hans',
      title: data.title || '',
      description: data.description || '',
      content: markdownContent,
      date: data.date || new Date().toISOString(),
      author: data.author || 'TopDigg',
      tags: data.tags || [],
      categories: data.categories || [],
    });
  }
  return items;
}

function generateBlogData() {
  const files = [
    ...scanDirectory(contentDir),
    ...scanArticles(),
  ];
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
        categories: file.categories
      };
    }

    posts[file.slug].title[file.locale] = file.title;
    posts[file.slug].description[file.locale] = file.description;
    posts[file.slug].content[file.locale] = file.content;
  }

  const sortedPosts = Object.values(posts).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Validate posts: missing title/description in all locales is a hard fail.
  // (Future-proofing: if upstream ships an articles/ file without frontmatter,
  // we'd rather fix that locally than skip silently — the file was meant to ship.)
  const missingFields = [];
  for (const post of sortedPosts) {
    const hasTitle = Object.values(post.title).some(Boolean);
    const hasDesc = Object.values(post.description).some(Boolean);
    if (!hasTitle || !hasDesc) {
      missingFields.push(`"${post.slug}"`);
    }
  }
  if (missingFields.length > 0) {
    console.error(`❌ ${missingFields.length} post(s) missing title/description in all locales: ${missingFields.join(", ")} — add frontmatter and re-run.`);
    process.exit(1);
  }

  const blogData = {
    posts: sortedPosts.map(({ categories, ...post }) => post)
  };

  // metadata-only variant (no content) for eager loading by list pages
  const blogMeta = {
    posts: sortedPosts.map(({ content, ...meta }) => meta)
  };

  fs.writeFileSync(dataOutputFile, JSON.stringify(blogData, null, 2));
  fs.writeFileSync(metaOutputFile, JSON.stringify(blogMeta, null, 2));
  console.log(`✅ Generated blog data with ${blogData.posts.length} posts`);

  // Generate per-locale meta files for code-splitting (80% bandwidth savings)
  const locales = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];
  for (const locale of locales) {
    const localizedMeta = {
      posts: sortedPosts.map(({ content, title, description, ...meta }) => ({
        ...meta,
        title: title[locale] || title['zh-Hans'] || title.en || Object.values(title).find(Boolean) || '',
        description: description[locale] || description['zh-Hans'] || description.en || Object.values(description).find(Boolean) || '',
      }))
    };
    const localeOutputFile = path.join(__dirname, `../src/lib/blog-meta-${locale}.json`);
    fs.writeFileSync(localeOutputFile, JSON.stringify(localizedMeta, null, 2));
    const sizeKB = Math.round(Buffer.byteLength(JSON.stringify(localizedMeta), 'utf8') / 1024);
    console.log(`✅ Generated blog-meta-${locale}.json (${sizeKB} KB, ${localizedMeta.posts.length} posts)`);
  }

  // Generate per-slug content files for lazy detail-page loading.
  // Each detail page imports only its own ~80-120 KB file instead of the
  // 9.9 MB monolithic blog-data.json. This slashes the network + parse
  // cost of prerendering /blog/:slug routes.
  if (!fs.existsSync(perSlugDir)) {
    fs.mkdirSync(perSlugDir, { recursive: true });
  }
  // Clean stale per-slug files (in case a post was deleted).
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
  console.log(`✅ Generated per-slug content (${sortedPosts.length} files in src/lib/blog-data/)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateBlogData();
}

export { generateBlogData };
