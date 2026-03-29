const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  await page.goto('http://localhost:8080');

  // Click the overlay to start audio
  await page.click('button:has-text("Включить реалистичный звук")');

  // 1. Check Triads mode
  await page.click('button[data-testid="mode-btn-triads"]');
  console.log('Clicked Triads button');
  await page.waitForTimeout(500);
  const triadBadge = await page.locator('div:has-text("Triad")').first();
  if (await triadBadge.isVisible()) {
    console.log('Triad badge is visible');
  } else {
    console.log('Triad badge NOT visible');
  }

  // 2. Check Arpeggio button scrolls and switches tab
  await page.click('button[data-testid="mode-btn-arpeggios"]');
  console.log('Clicked Arpeggio button');
  await page.waitForTimeout(1000);

  // Check if Practice tab is active
  const practiceTab = await page.locator('button[value="practice"][data-state="active"]');
  if (await practiceTab.isVisible()) {
    console.log('Practice tab is active after clicking Arpeggio button');
  } else {
    console.log('Practice tab NOT active');
  }

  // 3. Check more shapes
  await page.click('button[data-testid="mode-btn-chords"]');
  const nextButton = page.locator('button:has(svg.lucide-chevron-right)').first();
  for(let i=0; i<5; i++) {
    await nextButton.click();
    await page.waitForTimeout(200);
  }
  console.log('Cycled through 5 shapes');

  await page.screenshot({ path: 'verification/fixes_verified.png' });
  await browser.close();
})();
