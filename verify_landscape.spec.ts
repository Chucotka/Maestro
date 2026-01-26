import { test, expect } from '@playwright/test';

test('verify landscape mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape
  await page.goto('http://localhost:5173');

  // Wait for audio enable screen and click it
  const enableButton = page.locator('button:has-text("Enable Audio")');
  if (await enableButton.isVisible()) {
    await enableButton.click();
  }

  await page.waitForTimeout(2000); // Wait for animations/loading
  await page.screenshot({ path: 'landscape_mobile_verification.png', fullPage: true });
});
