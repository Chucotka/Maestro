const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080');

  // Click the overlay to start audio
  await page.click('button:has-text("Включить реалистичный звук")');

  // Wait for ArpeggioPlayer to appear
  await page.waitForSelector('h3:has-text("Арпеджио")');

  // Click Play in ArpeggioPlayer
  const playButton = await page.locator('h3:has-text("Арпеджио")').locator('..').locator('button').first();
  await playButton.click();
  console.log('Clicked Arpeggio Play button');

  await page.waitForTimeout(2000);

  // Take screenshot
  await page.screenshot({ path: 'verification/arpeggio_test.png' });

  await browser.close();
})();
