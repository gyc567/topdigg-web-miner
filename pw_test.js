
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Test creators hub page
  await page.goto('http://localhost:4175/creators');
  await page.waitForTimeout(3000);
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  
  const title = await page.textContent('h1');
  console.log('Page title:', title);
  
  // Test submit page
  await page.goto('http://localhost:4175/creators/submit');
  await page.waitForTimeout(2000);
  const submitTitle = await page.textContent('h1');
  console.log('Submit page title:', submitTitle);
  
  // Test navigation link
  await page.goto('http://localhost:4175/');
  await page.waitForTimeout(1000);
  const navLinks = await page.$$eval('nav a', links => links.map(l => l.textContent.trim()));
  console.log('Nav links:', JSON.stringify(navLinks));
  const hasCreatorHub = navLinks.some(l => l.includes('Creator') || l.includes('创作者'));
  console.log('Has Creator Hub nav:', hasCreatorHub);
  
  if (errors.length > 0) console.log('Console errors:', errors.join('; '));
  
  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
