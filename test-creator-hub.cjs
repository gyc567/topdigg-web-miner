const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const consoleErrors = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  let passed = 0, failed = 0;
  const test = (name, ok) => {
    console.log(`${ok ? '✅' : '❌'} ${name}`);
    ok ? passed++ : failed++;
  };

  // Test 1: Creators hub loads
  await page.goto('https://www.topdigg.com/creators', { waitUntil: 'networkidle', timeout: 30000 });
  test('Creators hub page loads (not 404)', page.url().includes('creators') && !page.url().includes('not-found'));

  // Test 2: Admin button
  const adminBtn = page.locator('a:has-text("Admin")').first();
  test('Admin button visible in nav', await adminBtn.isVisible().catch(() => false));

  // Test 3: Export button
  const exportBtn = page.locator('button:has-text("Export CSV")').first();
  test('Export CSV button visible', await exportBtn.isVisible().catch(() => false));

  // Test 4: Submit page
  await page.goto('https://www.topdigg.com/creators/submit', { waitUntil: 'networkidle', timeout: 20000 });
  test('Submit page loads', page.url().includes('creators/submit'));
  const submitH1 = await page.textContent('h1').catch(() => '');
  test('Submit page has content', submitH1.length > 0);

  // Test 5: Admin login page
  await page.goto('https://www.topdigg.com/creators/admin', { waitUntil: 'networkidle', timeout: 20000 });
  test('Admin login page loads', page.url().includes('creators/admin'));
  const loginH1 = await page.textContent('h1').catch(() => '');
  test('Login page has content', loginH1.length > 0);

  // Test 6: Wrong password
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
  const errorEl = await page.locator('.bg-red-50, .text-red-600, .bg-red').first().textContent().catch(() => '');
  test('Wrong password shows error', errorEl.length > 0);

  // Test 7: Correct password
  await page.fill('input[type="password"]', 'Qwert$1688');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  test('Login redirects to /creators', page.url().includes('/creators'));

  // Test 8: Nav shows 🔓
  const navHtml = await page.locator('nav').first().innerHTML().catch(() => '');
  test('Nav shows unlocked admin status (🔓)', navHtml.includes('🔓'));

  // Test 9: Status dropdown visible (admin feature)
  const statusSelect = page.locator('select').first();
  test('Status dropdown visible in admin mode', await statusSelect.isVisible().catch(() => false));

  console.log(`\n=== ${passed}/9 passed, ${failed}/9 failed ===`);
  console.log('Console errors:', consoleErrors.slice(0,3).join(' | ') || 'none');

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
