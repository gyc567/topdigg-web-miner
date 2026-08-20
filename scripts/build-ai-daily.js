import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/ai-daily');
const dataOutputFile = path.join(__dirname, '../src/lib/ai-daily-data.json');
const metaOutputFile = path.join(__dirname, '../src/lib/ai-daily-meta.json');

const LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];

// Normalize title/description: can be string or { locale: string }
function normalizeLocalized(value, locale) {
  if (!value) return {};
  // Per-locale md files: a plain string belongs to this file's locale
  if (typeof value === 'string') return { [locale]: value };
  if (typeof value === 'object') return value;
  return {};
}

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
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { data, content: markdownContent } = matter(fileContent);

      const slug = file.replace('.md', '');

      items.push({
        slug,
        locale: locale || 'zh-Hans',
        title: normalizeLocalized(data.title, locale || 'zh-Hans'),
        description: normalizeLocalized(data.description, locale || 'zh-Hans'),
        locale: locale || 'zh-Hans',

        content: markdownContent,
        date: data.date || new Date().toISOString().split('T')[0],
        author: data.author || '比特财商',
        tags: data.tags || [],
        categories: data.categories || [],
        source: data.source || null,
        hn_count: typeof data.hn_count === 'number' ? data.hn_count : 0,
        hn_keywords: data.hn_keywords || ''
      });
    }
  }

  return items;
}

function generateAiDailyData() {
  const files = scanDirectory(contentDir);
  const reports = {};

  for (const file of files) {
    if (!reports[file.slug]) {
      reports[file.slug] = {
        slug: file.slug,
        title: {},
        description: {},
        content: {},
        date: file.date,
        author: file.author,
        tags: file.tags,
        categories: file.categories,
        source: {
          ...file.source,
          original: {
            ...file.source.original,
            name: {},
          },
        },
        hn_count: file.hn_count,
        hn_keywords: file.hn_keywords
      };
    }

    // Merge title
    const titleObj = normalizeLocalized(file.title);
    for (const [l, v] of Object.entries(titleObj)) {
      reports[file.slug].title[l] = v;
    }

    // Merge description
    const descObj = normalizeLocalized(file.description);
    for (const [l, v] of Object.entries(descObj)) {
      reports[file.slug].description[l] = v;
    }

    // Merge content
    reports[file.slug].content[file.locale] = file.content;

    // Merge source.original.name as per-locale record
    const nameObj = normalizeLocalized(file.source?.original?.name, file.locale);
    for (const [l, v] of Object.entries(nameObj)) {
      reports[file.slug].source.original.name[l] = v;
    }
  }

  // Sort by date descending
  const sortedReports = Object.values(reports).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Full data (with content)
  const aiDailyData = {
    reports: sortedReports.map(({ categories, ...report }) => report)
  };

  // Meta only (no content)
  const aiDailyMeta = {
    reports: sortedReports.map(({ content, ...meta }) => meta)
  };

  fs.writeFileSync(dataOutputFile, JSON.stringify(aiDailyData, null, 2));
  fs.writeFileSync(metaOutputFile, JSON.stringify(aiDailyMeta, null, 2));
  console.log(
    `✅ Generated ai-daily-data.json (${aiDailyData.reports.length} reports) and ai-daily-meta.json`
  );

  // Generate per-locale meta files — only the 30 most recent
  const recent30 = sortedReports.slice(0, 30);

  for (const locale of LOCALES) {
    const localizedMeta = {
      reports: recent30.map(({ content, title, description, source, ...meta }) => {
        const localizedName =
          (typeof source?.original?.name === 'object' &&
            (source.original.name[locale] ||
              source.original.name.en ||
              Object.values(source.original.name).find(Boolean))) ||
          '';
        return {
          ...meta,
          title:
            title[locale] ||
            title['zh-Hans'] ||
            title.en ||
            Object.values(title).find(Boolean) ||
            '',
          description:
            description[locale] ||
            description['zh-Hans'] ||
            description.en ||
            Object.values(description).find(Boolean) ||
            '',
          source: {
            ...source,
            original: {
              ...source.original,
              name: localizedName,
            },
          },
        };
      })
    };

    const localeOutputFile = path.join(
      __dirname,
      `../src/lib/ai-daily-meta-${locale}.json`
    );
    fs.writeFileSync(localeOutputFile, JSON.stringify(localizedMeta, null, 2));
    const sizeKB = Math.round(
      Buffer.byteLength(JSON.stringify(localizedMeta), 'utf8') / 1024
    );
    console.log(
      `✅ Generated ai-daily-meta-${locale}.json (${sizeKB} KB, ${localizedMeta.reports.length} reports)`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateAiDailyData();
}

export { generateAiDailyData };
