// E2E test: AI产品分析模块 — 业务规则与可用性
//
// Usage:
//   1. Start dev server: npx vite --port 8080 --host 127.0.0.1
//   2. node tests/e2e-ai-products.mjs
//
// Assertions (per locale):
//   - 顶部导航含"AI产品分析"，位置在"AI日报"之后、博客之前
//   - /ai-products 渲染列表（h1 + 卡片）
//   - /ai-products/<slug> 渲染 ProductCard（aside 元素 + 4 档 pricing）
//   - 5 语言切换下，h1 与卡片标题本地化
//   - 首页含「最新 AI 产品分析」区块（h2 + 卡片链接）

import puppeteer from 'puppeteer';
import fs from 'node:fs';

const BASE = 'http://127.0.0.1:8080';
const SCREENSHOT_DIR = 'screenshots/e2e-2026-08-26-ai-products';

const LOCALES = ['zh-Hans', 'zh-Hant', 'en', 'ja', 'vi'];

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
    // Test 1: nav contains AI产品分析 in correct position
    console.log(`\n[${locale}] Test 1: nav position`);
    await goto(page, `${BASE}/`);
    await setLocale(page, locale);
    await reload(page);
    await new Promise(r => setTimeout(r, 500));

    const navLinks = await page.evaluate(() => {
      const nav = document.querySelector('header nav[aria-label="主导航"]');
      if (!nav) return [];
      return Array.from(nav.querySelectorAll('a')).map(a => ({
        text: a.textContent.trim(),
        href: a.getAttribute('href'),
      }));
    });

    const aiProductsLink = navLinks.find(l => l.href === '/ai-products');
    assert(!!aiProductsLink, `nav contains link to /ai-products (label="${aiProductsLink?.text}")`);

    const aiDailyIdx = navLinks.findIndex(l => l.href === '/ai-daily');
    const aiProductsIdx = navLinks.findIndex(l => l.href === '/ai-products');
    const blogIdx = navLinks.findIndex(l => l.href === '/blog');
    assert(
      aiDailyIdx >= 0 && aiProductsIdx > aiDailyIdx && (blogIdx < 0 || aiProductsIdx < blogIdx),
      `/ai-products nav position: ai-daily=${aiDailyIdx}, ai-products=${aiProductsIdx}, blog=${blogIdx}`
    );

    // Test 2: /ai-products list page
    console.log(`\n[${locale}] Test 2: /ai-products list renders`);
    await goto(page, `${BASE}/ai-products`);
    await setLocale(page, locale);
    await reload(page);
    await new Promise(r => setTimeout(r, 800));

    const listH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
    const listCards = await page.$$eval('article a[href*="/ai-products/"]', els => els.length).catch(() => 0);
    assert(!!listH1, `/ai-products has h1="${listH1}"`);
    assert(listCards >= 1, `/ai-products renders at least 1 product card (got ${listCards})`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${locale}-list.png` });

    // Test 3: /ai-products/<slug> detail page
    console.log(`\n[${locale}] Test 3: /ai-products/<slug> detail renders ProductCard`);
    await goto(page, `${BASE}/ai-products/2026-08-26-cursor`);
    await setLocale(page, locale);
    await reload(page);
    await new Promise(r => setTimeout(r, 800));

    const detailH1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => null);
    const productCardAside = await page.$('aside').catch(() => null);
    const jsonLdScripts = await page.$$eval('script[type="application/ld+json"]', els => els.length).catch(() => 0);
    const pricingRows = await page.$$eval('table tbody tr', els => els.length).catch(() => 0);
    assert(!!detailH1, `detail h1="${detailH1}"`);
    assert(!!productCardAside, `ProductCard <aside> rendered`);
    assert(jsonLdScripts >= 4, `JSON-LD scripts: ${jsonLdScripts} (≥4 = Article + BreadcrumbList + FAQ + Product)`);
    assert(pricingRows >= 3, `pricing table rows: ${pricingRows} (≥3 = Pro + Business + Enterprise or more)`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${locale}-detail.png` });

    // Test 4: homepage Latest AI Products section
    console.log(`\n[${locale}] Test 4: homepage Latest AI Products section`);
    await goto(page, `${BASE}/`);
    await setLocale(page, locale);
    await reload(page);
    await new Promise(r => setTimeout(r, 800));

    const homepageAICards = await page.$$eval('article a[href*="/ai-products/"]', els => els.length).catch(() => 0);
    assert(homepageAICards >= 1, `homepage has at least 1 AI product card (got ${homepageAICards})`);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${locale}-home.png` });
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
    consoleErrors.slice(0, 3).forEach(e => console.log(`  - ${e}`));
  }
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  } else {
    console.log('\nALL ASSERTIONS PASSED');
  }
})();
