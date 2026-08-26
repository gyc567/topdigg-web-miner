// E2E test: Reddit/YouTube column removal — business rule enforcement
// (Remove Reddit & YouTube from main navigation across all pages)
//
// Usage:
//   1. Start dev server: npx vite --port 8080 --host 127.0.0.1
//   2. node tests/e2e-nav-no-removed-columns.mjs
//
// Assertions per language:
//   - Header nav contains no Reddit/YouTube column labels (any locale string)
//   - Direct visit /columns/reddit returns "未找到该专栏" not-found message
//   - Direct visit /columns/youtube returns "未找到该专栏" not-found message
//   - Homepage Hero has only one CTA (Read Blog), no "进入专栏" link
//   - Homepage Column grid renders only ONE card (Twitter), not three
//   - About page "我们做什么" list has only ONE item, not three

import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8080';
const SCREENSHOT_DIR = 'screenshots/e2e-2026-08-26-nav-no-removed-columns';

const LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];

const FORBIDDEN_LABELS = [
  'Reddit专栏', 'YouTube专栏',
  'Reddit專欄', 'YouTube專欄',
  'Reddit Column', 'YouTube Column',
  'Redditコラム', 'YouTubeコラム',
  'Chuyên mục Reddit', 'Chuyên mục YouTube',
  '进入专栏',
];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let totalAsserts = 0;
let totalPassed = 0;
const failures = [];
const consoleErrors = [];

function assert(cond, msg) {
  totalAsserts++;
  if (cond) {
    totalPassed++;
    console.log(`  PASS ${msg}`);
  } else {
    failures.push(msg);
    console.log(`  FAIL ${msg}`);
  }
}

function pageUrl(locale, path) {
  // SPA: language is set via localStorage, no path prefix
  return `${BASE}${path}`;
}

async function setLocale(page, locale) {
  await page.evaluate((lang) => {
    localStorage.setItem('i18nextLng', lang);
  }, locale);
}

async function goto(page, url) {
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 15000 });
}

async function reload(page) {
  await page.reload({ waitUntil: 'networkidle0', timeout: 15000 });
}

async function checkLocale(browser, locale) {
  console.log(`\n[${locale}] starting checks`);
  const page = await browser.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(`[${locale}] ${msg.text()}`);
  });

  try {
    // Test 1: home page header nav
    console.log(`\n[${locale}] Test 1: home page header nav`);
    await goto(page, `${BASE}/`);
    await setLocale(page, locale);
    await reload(page);

    const headerText = await page.evaluate(() => {
      const nav = document.querySelector('header nav[aria-label="主导航"]');
      return nav ? nav.textContent : '';
    });
    for (const label of FORBIDDEN_LABELS) {
      assert(!headerText.includes(label), `header nav does NOT contain "${label}"`);
    }

    // Test 2: home page Hero CTA count - target by distinctive hero class
    console.log(`\n[${locale}] Test 2: home page Hero CTA count`);
    const heroCTA = await page.evaluate(() => {
      // Hero section has 'rounded-2xl border bg-gradient-to-b'
      const hero = document.querySelector('section.relative.overflow-hidden');
      if (!hero) return [];
      return Array.from(hero.querySelectorAll('a')).map(a => a.textContent.trim());
    });
    console.log(`  hero CTA labels: ${JSON.stringify(heroCTA)}`);
    assert(heroCTA.length === 1, `Hero has exactly 1 CTA (got ${heroCTA.length})`);

    // Test 3: home page column card count - target by 'flex justify-center' section
    console.log(`\n[${locale}] Test 3: home page column card count`);
    const columnCards = await page.evaluate(() => {
      const gridSection = document.querySelector('section.flex.justify-center');
      if (!gridSection) return 0;
      return gridSection.querySelectorAll('article').length;
    });
    assert(columnCards === 1, `Column grid has exactly 1 card (got ${columnCards})`);

    // Test 4: About page list count
    console.log(`\n[${locale}] Test 4: About page what-we-do list count`);
    await goto(page, `${BASE}/about`);
    await setLocale(page, locale);
    await reload(page);
    // Wait for i18n to settle
    await new Promise(r => setTimeout(r, 500));
    const aboutItemCount = await page.evaluate(() => {
      // First ul inside <article> main content
      const ul = document.querySelector('article ul.space-y-3');
      return ul ? ul.querySelectorAll('li').length : -1;
    });
    assert(aboutItemCount === 1, `About list has exactly 1 item (got ${aboutItemCount})`);

    // Test 5: /columns/reddit returns not-found
    console.log(`\n[${locale}] Test 5: /columns/reddit not-found`);
    await goto(page, `${BASE}/columns/reddit`);
    await setLocale(page, locale);
    await reload(page);
    const redditNF = await page.evaluate(() => {
      const t = document.body.textContent;
      return t.includes('未找到该专栏') || t.includes('未找到該專欄') ||
             t.includes('Column not found') || t.includes('コラムが見つかりません') ||
             t.includes('Không tìm thấy chuyên mục');
    });
    assert(redditNF, `/columns/reddit shows not-found message`);

    // Test 6: /columns/youtube returns not-found
    console.log(`\n[${locale}] Test 6: /columns/youtube not-found`);
    await goto(page, `${BASE}/columns/youtube`);
    await setLocale(page, locale);
    await reload(page);
    const ytNF = await page.evaluate(() => {
      const t = document.body.textContent;
      return t.includes('未找到该专栏') || t.includes('未找到該專欄') ||
             t.includes('Column not found') || t.includes('コラムが見つかりません') ||
             t.includes('Không tìm thấy chuyên mục');
    });
    assert(ytNF, `/columns/youtube shows not-found message`);

    // Screenshot home
    await goto(page, `${BASE}/`);
    await setLocale(page, locale);
    await reload(page);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${locale}-home.png`, fullPage: false });
  } finally {
    await page.close();
  }
}

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    for (const locale of LOCALES) {
      await checkLocale(browser, locale);
    }
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log(`Total assertions: ${totalAsserts}`);
  console.log(`Passed: ${totalPassed}`);
  console.log(`Failed: ${failures.length}`);
  if (consoleErrors.length) {
    console.log(`Console errors: ${consoleErrors.length}`);
    consoleErrors.forEach(e => console.log(`  - ${e}`));
  }
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL ASSERTIONS PASSED');
  }
})();
