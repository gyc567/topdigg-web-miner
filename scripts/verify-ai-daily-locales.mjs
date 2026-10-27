#!/usr/bin/env node
/**
 * AI日报 多语言 locale 门禁校验器
 *
 * 用法:
 *   node scripts/verify-ai-daily-locales.mjs [YYYY-MM-DD]
 *   node scripts/verify-ai-daily-locales.mjs --all
 *
 * 退出码: 0 = 全部通过, 1 = 存在失败项
 *
 * 背景: 早前 cron 里用 shell 手写 `grep -cE "^(来源|來源|Source|ソース|Nguồn)"` 做校验，
 * 但日文实际 marker 是「出典」而非「ソース」, agent 照抄执行必然误判 FAIL。
 * 本脚本把校验固化为确定性逻辑, locale marker 表从 locale 语言本身推导, 不再手写。
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * locale -> 正文中「来源」标记的合法写法集合
 *
 * 注意: 日文历史文件里「出典」与「ソース」两种写法都存在, 都是合法日文,
 * 不能只认一个, 否则会误判 FAIL。同理越南语有「Nguồn」和「Nguồn:」两种标点变体。
 */
const LOCALE_MARKERS = {
  'zh-Hans': ['来源'],
  'zh-Hant': ['來源'],
  en: ['Source'],
  ja: ['出典', 'ソース'],
  vi: ['Nguồn'],
};

const LOCALES = Object.keys(LOCALE_MARKERS);

/** 必须全语言统一的内容 */
const BRAND = '瑞哥观势';
/** 已废弃的旧品牌名, 命中即失败 */
const DEAD_BRANDS = ['比特财商'];

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  return 1;
}

function checkFile(locale, date, errors, strict, legacy) {
  const file = join(ROOT, 'content', 'ai-daily', locale, `${date}-ai-daily.md`);
  if (!existsSync(file)) {
    // 该 locale 当天本来就没发 (历史缺失), 不算失败, 只记为 skip
    return { file, missing: true };
  }
  const text = readFileSync(file, 'utf8');
  const markers = LOCALE_MARKERS[locale];

  // 1. 来源标记必须存在 (接受该 locale 的任一合法写法)
  //    历史文件格式很多样: 行首的「来源：x」/「**来源**：x」/「**来源：**x」,
  //    也有把来源写在标题行内的。统一按「标记 + 可选加粗 + 冒号」匹配, 不限定行首。
  const markerRe = new RegExp(
    `(?:${markers.join('|')})\\*{0,2}\\s*[：:]`,
    'm'
  );
  const markerCount = markers.reduce(
    (sum, m) => sum + (text.match(new RegExp(m, 'g')) || []).length,
    0
  );
  // 旧格式把来源做成了标题链接本身 (如 ### [标题](https://aihot.news/items/xxx)),
  // 这种情况下 item 链接即来源, 算合法。
  const hasItemLink = /aihot\.news\/items\//.test(text);
  if (!markerRe.test(text) && !hasItemLink) {
    const msg = `${locale}: 缺少来源标记 (合法写法 ${markers.map((m) => `「${m}」`).join('/')}, 全文出现 ${markerCount} 次, 但匹配 0 次)`;
    if (strict) errors.push(msg);
    else legacy.push(msg);
  }

  // 2. frontmatter 完整性
  if (!text.startsWith('---\n')) {
    errors.push(`${locale}: frontmatter 缺失或未以 --- 开头`);
  } else {
    const end = text.indexOf('\n---\n', 4);
    if (end === -1) {
      errors.push(`${locale}: frontmatter 未闭合`);
    } else {
      const fm = text.slice(4, end);
      for (const key of ['title', 'date', 'description', 'tags', 'categories', 'source']) {
        if (!new RegExp(`^${key}\\s*:`, 'm').test(fm)) {
          errors.push(`${locale}: frontmatter 缺少字段 ${key}`);
        }
      }
      if (!fm.includes(date)) {
        errors.push(`${locale}: frontmatter date 未包含 ${date}`);
      }
      // source.original.name 必须是统一品牌
      if (!fm.includes(BRAND)) {
        errors.push(`${locale}: frontmatter source.original.name 未使用品牌「${BRAND}」`);
      }
    }
  }

  // 3. 旧品牌名零残留
  for (const dead of DEAD_BRANDS) {
    if (text.includes(dead)) {
      errors.push(`${locale}: 残留已废弃品牌名「${dead}」`);
    }
  }

  // 4. 域名必须是 aihot.news
  if (/aihot\.(virxact\.com|top|io|com|xyz|cc)\b/.test(text)) {
    errors.push(`${locale}: 残留已废弃的 AIHOT 域名`);
  }

  // 5. 无 emoji 标题 (公众号标题规则: 纯文字)
  const titleLine = text.split('\n').find((l) => l.startsWith('# '));
  if (titleLine && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(titleLine)) {
    errors.push(`${locale}: 一级标题含 emoji: ${titleLine}`);
  }

  return { file, markerCount, len: text.length };
}

function listDates() {
  const dir = join(ROOT, 'content', 'ai-daily', 'zh-Hans');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .map((f) => f.match(/^(\d{4}-\d{2}-\d{2})-ai-daily\.md$/)?.[1])
    .filter(Boolean)
    .sort();
}

function main() {
  const args = process.argv.slice(2);
  const all = args.includes('--all');
  const dates = all ? listDates() : [args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a))].filter(Boolean);

  if (dates.length === 0) {
    console.error('用法: node scripts/verify-ai-daily-locales.mjs [YYYY-MM-DD] | --all');
    return 1;
  }

  let errors = [];
  let legacy = [];
  let checked = 0;

  for (const date of dates) {
    const strict = date >= '2026-10-01'; // 2026-10-01 之前的历史文件走宽限期
    const dayErrors = [];
    const dayLegacy = [];
    let missing = 0;

    for (const locale of LOCALES) {
      const res = checkFile(locale, date, dayErrors, strict, dayLegacy);
      if (res.missing) missing++;
      else checked++;
    }

    if (missing === LOCALES.length) {
      console.log(`SKIP ${date} (全部 locale 均无文件)`);
      continue;
    }
    if (missing > 0) {
      console.log(`WARN ${date}: ${missing} 个 locale 缺失 (不算失败)`);
    }

    const dayResult = dayErrors.length === 0
      ? 'OK'
      : `FAIL (${dayErrors.length})`;
    console.log(`${dayResult} ${date}: ${checked - missing}/${LOCALES.length} locale 已校验`);
    for (const e of dayErrors) console.error(`  FAIL: ${e}`);
    for (const l of dayLegacy) console.error(`  WARN(legacy): ${l}`);
    errors = errors.concat(dayErrors);
  }

  if (errors.length === 0) {
    console.log('ALL_LOCALES_OK');
    return 0;
  }
  console.error(`共 ${errors.length} 项失败`);
  return 1;
}

process.exit(main());
