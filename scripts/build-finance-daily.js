import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../content/finance-daily');
const dataOutputFile = path.join(__dirname, '../src/lib/finance-daily-data.json');
const metaOutputFile = path.join(__dirname, '../src/lib/finance-daily-meta.json');

const LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];

function normalizeLocalized(value, locale) {
  if (!value) return {};
  if (typeof value === 'string') return { [locale]: value };
  if (typeof value === 'object') return value;
  return {};
}

// 2026-11-15: tags/categories 由全局改为 per-locale（{locale: [...]}），
// 这里把它按目标 locale 解析成扁平数组。
function resolveList(value, locale) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') {
    return (
      value[locale] ||
      value['zh-Hans'] ||
      value.en ||
      Object.values(value).find((v) => Array.isArray(v) && v.length) ||
      []
    );
  }
  return [];
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
        content: markdownContent,
        date: data.date || new Date().toISOString().split('T')[0],
        author: data.author || '瑞哥观势',
        tags: data.tags || [],
        categories: data.categories || [],
        source: data.source || null,
      });
    }
  }

  return items;
}

function generateFinanceDailyData() {
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
        // 2026-11-15: tags/categories 改为 per-locale（原为全局，取首个被扫描
        // locale 的值，导致 zh-Hans 页面显示英文标签）
        tags: {},
        categories: {},
        source: {
          ...file.source,
          original: {
            ...file.source.original,
            name: {},
          },
        },
      };
    }

    const titleObj = normalizeLocalized(file.title);
    for (const [l, v] of Object.entries(titleObj)) {
      reports[file.slug].title[l] = v;
    }

    const descObj = normalizeLocalized(file.description);
    for (const [l, v] of Object.entries(descObj)) {
      reports[file.slug].description[l] = v;
    }

    reports[file.slug].content[file.locale] = file.content;

    if (file.tags && file.tags.length) {
      reports[file.slug].tags[file.locale] = file.tags;
    }
    if (file.categories && file.categories.length) {
      reports[file.slug].categories[file.locale] = file.categories;
    }

    const nameObj = normalizeLocalized(file.source?.original?.name, file.locale);
    for (const [l, v] of Object.entries(nameObj)) {
      reports[file.slug].source.original.name[l] = v;
    }
  }

  const sortedReports = Object.values(reports).sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const financeDailyData = {
    reports: sortedReports.map(({ categories, ...report }) => report)
  };

  const financeDailyMeta = {
    reports: sortedReports.map(({ content, ...meta }) => meta)
  };

  fs.writeFileSync(dataOutputFile, JSON.stringify(financeDailyData, null, 2));
  fs.writeFileSync(metaOutputFile, JSON.stringify(financeDailyMeta, null, 2));
  console.log(
    `Generated finance-daily-data.json (${financeDailyData.reports.length} reports) and finance-daily-meta.json`
  );

  // Generate per-locale meta files — only the 30 most recent
  const recent30 = sortedReports.slice(0, 30);

  for (const locale of LOCALES) {
    const localizedMeta = {
      reports: recent30.map(({ content, title, description, source, tags, categories, ...meta }) => {
        const localizedName =
          (typeof source?.original?.name === 'object' &&
            (source.original.name[locale] ||
              source.original.name.en ||
              Object.values(source.original.name).find(Boolean))) ||
          '';
        return {
          ...meta,
          tags: resolveList(tags, locale),
          categories: resolveList(categories, locale),
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
      `../src/lib/finance-daily-meta-${locale}.json`
    );
    fs.writeFileSync(localeOutputFile, JSON.stringify(localizedMeta, null, 2));
    const sizeKB = Math.round(
      Buffer.byteLength(JSON.stringify(localizedMeta), 'utf8') / 1024
    );
    console.log(
      `Generated finance-daily-meta-${locale}.json (${sizeKB} KB, ${localizedMeta.reports.length} reports)`
    );
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateFinanceDailyData();
}

export { generateFinanceDailyData };
