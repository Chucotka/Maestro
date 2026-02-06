import { test, expect } from '@playwright/test';

test('has connect guitar button', async ({ page }) => {
  await page.goto('http://localhost:8080/');

  // Wait for the app to load (it might show the Enable Audio screen first)
  await page.waitForSelector('button');

  // Click Enable Audio if it exists
  const enableAudioBtn = page.getByRole('button', { name: /Включить звук/i });
  if (await enableAudioBtn.isVisible()) {
    await enableAudioBtn.click();
  }

  // Check for the Connect Guitar button (in Russian it's "Подключить гитару")
  const connectBtn = page.getByText(/Подключить гитару/i);
  await expect(connectBtn).toBeVisible();

  await page.screenshot({ path: 'guitar-connection.png' });
});
