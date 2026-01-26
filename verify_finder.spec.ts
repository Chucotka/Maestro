import { test, expect } from '@playwright/test';

test('verify finder mode', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Enable audio
  await page.getByRole('button', { name: /Включить реалистичный звук|Enable Realistic Audio/ }).click();

  // Click Finder
  await page.getByRole('button', { name: /Поиск|Finder/ }).click();

  // Type notes in finder
  const input = page.locator('input[placeholder="C E G"]');
  await input.fill('C E G');

  // Wait for results
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'finder_results.png', fullPage: true });
});
