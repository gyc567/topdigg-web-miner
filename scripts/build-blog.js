import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/blog');
const dataOutputFile = path.join(__dirname, '../src/lib/blog-data.json');
const metaOutputFile = path.join(__dirname, '../src/lib/blog-meta.json');

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

function generateBlogData() {
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
        categories: file.categories
      };
    }

    posts[file.slug].title[file.locale] = file.title;
    posts[file.slug].description[file.locale] = file.description;
    posts[file.slug].content[file.locale] = file.content;
  }

  const sortedPosts = Object.values(posts).sort((a, b) => new Date(b.date) - new Date(a.date));

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
  console.log(`✅ Generated blog meta with ${blogMeta.posts.length} posts`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateBlogData();
}

export { generateBlogData };
