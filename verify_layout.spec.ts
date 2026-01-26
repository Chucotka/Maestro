import { test, expect } from '@playwright/test';

test('verify fixed layout', async ({ page }) => {
  await page.goto('http://localhost:8083');

  // Wait for loading to finish (the button "Enable Realistic Audio" should appear)
  await page.waitForSelector('button:has-text("Включить реалистичный звук")');
  await page.click('button:has-text("Включить реалистичный звук")');

  // Wait for main UI
  await page.waitForSelector('text=Мастер Ладов и Клавиш');

  // Check Quiz Mode
  await page.click('button:has-text("Квиз")');
  await page.screenshot({ path: 'verification/quiz_fixed.png' });

  // Check Finder Mode
  await page.click('button:has-text("Поиск")');
  await page.screenshot({ path: 'verification/finder_fixed.png' });
});
