/**
 * Build script for Money Lab content.
 * Scans content/money-lab/ directory and generates:
 *   src/lib/money-lab-data.json       - all posts, all locales
 *   src/lib/money-lab-meta.json       - all locales, metadata only (for slug lookups)
 *   src/lib/money-lab-meta-{locale}.json - per-locale metadata (for list page, code-split)
 *   src/lib/money-lab-data/           - per-slug JSON files for lazy loading
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, "../content/money-lab");
const dataOutputFile = path.join(__dirname, "../src/lib/money-lab-data.json");
const metaOutputFile = path.join(__dirname, "../src/lib/money-lab-meta.json");
const perSlugDir = path.join(__dirname, "../src/lib/money-lab-data");

const DEFAULT_AUTHOR = "TopDigg";

// Normalize localized field: if string, duplicate to all locales; if object, use as-is
function normalizeLocalized(value, locale) {
  if (typeof value === "string") {
    return {
      "zh-Hans": value,
      "zh-Hant": value,
      en: value,
      ja: value,
      vi: value,
    };
  }
  if (value && typeof value === "object") {
    return value;
  }
  return { "zh-Hans": "", "zh-Hant": "", en: "", ja: "", vi: "" };
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
    } else if (file.endsWith(".md")) {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content: markdownContent } = matter(fileContent);
      const slug = file.replace(".md", "");
      items.push({
        slug,
        locale: locale || "zh-Hans",
        title: normalizeLocalized(data.title, locale || "zh-Hans"),
        description: normalizeLocalized(data.description, locale || "zh-Hans"),
        content: markdownContent,
        date: data.date || new Date().toISOString().split("T")[0],
        author: data.author || DEFAULT_AUTHOR,
        tags: data.tags || [],
        categories: data.categories || [],
        coverImage: data.coverImage || null,
        earnings: data.earnings || null,
        difficulty: data.difficulty || null,
        timeRequired: data.timeRequired || null,
      });
    }
  }
  return items;
}

function generateMoneyLabData() {
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
        coverImage: file.coverImage,
        earnings: file.earnings,
        difficulty: file.difficulty,
        timeRequired: file.timeRequired,
      };
    }

    posts[file.slug].title[file.locale] = file.title[file.locale] || file.title["zh-Hans"] || "";
    posts[file.slug].description[file.locale] = file.description[file.locale] || file.description["zh-Hans"] || "";
    posts[file.slug].content[file.locale] = file.content;
  }

  const sortedPosts = Object.values(posts).sort((a, b) => new Date(b.date) - new Date(a.date));

  // Validate
  for (const post of sortedPosts) {
    const hasTitle = Object.values(post.title).some(Boolean);
    const hasDesc = Object.values(post.description).some(Boolean);
    if (!hasTitle || !hasDesc) {
      console.error(`❌ Post "${post.slug}" is missing ${!hasTitle ? "title" : "description"} in all locales — fix content/money-lab/ and re-run.`);
      process.exit(1);
    }
  }

  const blogData = { posts: sortedPosts };
  const blogMeta = { posts: sortedPosts.map(({ content, ...meta }) => meta) };

  fs.writeFileSync(dataOutputFile, JSON.stringify(blogData, null, 2));
  fs.writeFileSync(metaOutputFile, JSON.stringify(blogMeta, null, 2));
  console.log(`✅ Generated money-lab data with ${blogData.posts.length} posts`);

  // Per-locale meta files
  const locales = ["zh-Hans", "zh-Hant", "en", "ja", "vi"];
  for (const locale of locales) {
    const localizedMeta = {
      posts: sortedPosts.map(({ content, title, description, ...meta }) => ({
        ...meta,
        title: title[locale] || title["zh-Hans"] || title.en || Object.values(title).find(Boolean) || "",
        description: description[locale] || description["zh-Hans"] || description.en || Object.values(description).find(Boolean) || "",
      })),
    };
    const localeOutputFile = path.join(__dirname, `../src/lib/money-lab-meta-${locale}.json`);
    fs.writeFileSync(localeOutputFile, JSON.stringify(localizedMeta, null, 2));
    const sizeKB = Math.round(Buffer.byteLength(JSON.stringify(localizedMeta), "utf8") / 1024);
    console.log(`✅ Generated money-lab-meta-${locale}.json (${sizeKB} KB, ${localizedMeta.posts.length} posts)`);
  }

  // Per-slug content files
  if (!fs.existsSync(perSlugDir)) {
    fs.mkdirSync(perSlugDir, { recursive: true });
  }
  for (const f of fs.readdirSync(perSlugDir)) {
    if (f.endsWith(".json")) fs.unlinkSync(path.join(perSlugDir, f));
  }
  for (const post of sortedPosts) {
    const { slug, ...rest } = post;
    fs.writeFileSync(path.join(perSlugDir, `${slug}.json`), JSON.stringify({ slug, ...rest }, null, 2));
  }
  console.log(`✅ Generated ${sortedPosts.length} per-slug content files`);
}

generateMoneyLabData();
