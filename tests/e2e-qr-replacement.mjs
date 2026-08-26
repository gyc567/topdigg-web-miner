// E2E test: AI Daily QR image replacement
// Loop Engineering batch close-out verification (2026-08-26)
//
// Usage:
//   1. Start dev server: npx vite --port 8080 --host 127.0.0.1
//   2. node tests/e2e-qr-replacement.mjs
//
// Assertions per page:
//   - <picture> present
//   - <source type="image/webp"> with srcset=/qr-scan-follow.webp
//   - <img> with src=/qr-scan-follow.png fallback
//   - <figcaption> contains locale-specific caption
//   - NO <a href="https://mp.weixin..."> links
//   - WebP image loaded (HTTP 200 + non-zero bytes)
//   - No console errors
//   - Image actually painted (offsetWidth > 0)

import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://127.0.0.1:8080';
const SCREENSHOT_DIR = 'screenshots/e2e-2026-08-26-qr';
const SLUG = '2026-08-20-ai-daily';

const LOCALES = [
  { lang: 'zh-Hans', expectCaption: '原文出处：', expectAlt: '扫码关注公众号获取原文' },
  { lang: 'zh-Hant', expectCaption: '原文出處：', expectAlt: '掃碼關注公眾號獲取原文' },
  { lang: 'en',      expectCaption: 'Original source:', expectAlt: 'Scan the QR code for the original article' },
  { lang: 'ja',      expectCaption: '原本情報：', expectAlt: 'QRコードをスキャンして原文を読む' },
  { lang: 'vi',      expectCaption: 'Nguồn gốc:', expectAlt: 'Quét mã QR để đọc bài gốc' },
];

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

let totalAsserts = 0;
let totalPassed = 0;
const failures = [];
const consoleErrors = [];

function assert(name, cond, detail) {
  totalAsserts += 1;
  if (cond) {
    totalPassed += 1;
    console.log(`  ✓ ${name}`);
  } else {
    failures.push({ name, detail });
    console.log(`  ✗ ${name}${detail ? ` -- ${detail}` : ''}`);
  }
}

const browser = await puppeteer.launch({
  headless: 'shell',
  executablePath: '/Users/jie/.cache/puppeteer/chrome-headless-shell/mac_arm-151.0.7922.71/chrome-headless-shell-mac-arm64/chrome-headless-shell',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

try {
  for (const locale of LOCALES) {
    console.log(`\n=== Locale: ${locale.lang} ===`);
    const page = await browser.newPage();

    // Track console errors and image network failures
    const localConsoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') localConsoleErrors.push(msg.text());
    });
    const imageResponses = [];
    page.on('response', (res) => {
      const u = res.url();
      if (u.includes('qr-scan-follow') || u.includes('mp.weixin')) {
        imageResponses.push({ url: u, status: res.status(), bytes: 0 });
      }
    });

    // Pre-load: simulate language preference
    await page.setExtraHTTPHeaders({ 'Accept-Language': locale.lang });
    const url = `${BASE}/ai-daily/${SLUG}?lang=${locale.lang}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait for QR figure to render
    await page.waitForSelector('figure img', { timeout: 10000 });

    // === Assertions ===
    const html = await page.content();
    const result = await page.evaluate(() => {
      const picture = document.querySelector('figure picture');
      const source = document.querySelector('figure picture source[type="image/webp"]');
      const img = document.querySelector('figure picture img');
      const figcaption = document.querySelector('figure figcaption');
      const oldWeixinLink = document.querySelector('a[href*="mp.weixin.qq.com"]');
      const altText = img ? img.getAttribute('alt') : null;
      const captionText = figcaption ? figcaption.textContent : null;
      const imgPainted = img ? img.offsetWidth > 0 && img.offsetHeight > 0 : false;
      const imgLoaded = img ? img.complete && img.naturalWidth > 0 : false;
      return {
        hasPicture: !!picture,
        altText,
        captionText,
        imgPainted,
        imgLoaded,
        srcset: source ? source.getAttribute('srcset') : null,
        src: img ? img.getAttribute('src') : null,
        hasOldWeixin: !!oldWeixinLink,
      };
    });

    assert('<picture> element present', result.hasPicture);
    assert('<source type="image/webp" srcSet="/qr-scan-follow.webp">', result.srcset === '/qr-scan-follow.webp', `got: ${result.srcset}`);
    assert('<img src="/qr-scan-follow.png"> fallback', result.src === '/qr-scan-follow.png', `got: ${result.src}`);
    assert(`<figcaption> starts with "${locale.expectCaption}"`, result.captionText && result.captionText.startsWith(locale.expectCaption), `got: ${result.captionText}`);
    assert(`<img alt> contains "${locale.expectAlt.substring(0, 20)}"`, result.altText && result.altText.includes(locale.expectAlt.substring(0, 20)), `got: ${result.altText}`);
    assert('Old weixin link removed (no <a href="mp.weixin...">)', !result.hasOldWeixin);
    assert('Image painted (offsetWidth > 0)', result.imgPainted);
    assert('Image loaded (naturalWidth > 0)', result.imgLoaded);

    // Network responses
    const webpResp = imageResponses.find(r => r.url.includes('.webp'));
    const pngResp = imageResponses.find(r => r.url.endsWith('.png') && !r.url.includes('mp.weixin'));
    const weixinResp = imageResponses.find(r => r.url.includes('mp.weixin'));
    assert('WebP loaded (HTTP 200 or 304)', webpResp && (webpResp.status === 200 || webpResp.status === 304), `got: ${webpResp ? webpResp.status : 'no response'}`);
    assert('No weixin URL requested by browser', !weixinResp);

    assert(`No console errors (locale=${locale.lang})`, localConsoleErrors.length === 0, localConsoleErrors.length ? localConsoleErrors.join(' | ') : '');

    // Screenshot
    const screenshotPath = path.join(SCREENSHOT_DIR, `${locale.lang}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  📸 screenshot: ${screenshotPath}`);

    await page.close();
  }

  // === Additional date coverage ===
  console.log(`\n=== Date coverage: 2026-08-24 (had real weixin URL pre-fix) ===`);
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-Hans' });
  await page.goto(`${BASE}/ai-daily/2026-08-24-ai-daily?lang=zh-Hans`, { waitUntil: 'networkidle0' });
  await page.waitForSelector('figure img', { timeout: 10000 });
  const r = await page.evaluate(() => {
    const weixin = document.querySelector('a[href*="mp.weixin.qq.com"]');
    const img = document.querySelector('figure img');
    return { hasOldWeixin: !!weixin, hasImg: !!img };
  });
  assert('2026-08-24 (former real weixin URL date) shows QR image, not link', r.hasImg && !r.hasOldWeixin);
  await page.close();

} finally {
  await browser.close();
}

console.log(`\n=== Summary ===`);
console.log(`Total: ${totalPassed}/${totalAsserts} passed (${Math.round(totalPassed/totalAsserts*100)}%)`);
if (failures.length) {
  console.log(`\nFailures:`);
  failures.forEach(f => console.log(`  ✗ ${f.name}: ${f.detail || ''}`));
}
process.exit(failures.length ? 1 : 0);