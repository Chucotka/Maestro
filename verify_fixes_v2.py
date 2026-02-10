
import asyncio
from playwright.async_api import async_playwright
import os

async def verify_fixes():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to the app
        await page.goto("http://localhost:8080")

        # Wait for audio overlay and click it
        try:
            enable_btn = await page.wait_for_selector("button:has-text('Включить')", timeout=10000)
            await enable_btn.click()
        except:
            print("Enable audio button not found or already clicked")

        # 1. Check Chords mode
        await page.click("button[data-testid='mode-btn-chords']")
        await asyncio.sleep(2)
        await page.screenshot(path="verification/chords_fixed.png")
        print("Captured chords_fixed.png")

        # 2. Check Triads mode
        await page.click("button[data-testid='mode-btn-triads']")
        await asyncio.sleep(2)
        await page.screenshot(path="verification/triads_fixed.png")
        print("Captured triads_fixed.png")

        # 3. Check Toggle back to Chords
        await page.click("button[data-testid='mode-btn-chords']")
        await asyncio.sleep(2)
        await page.screenshot(path="verification/chords_toggled_back.png")
        print("Captured chords_toggled_back.png")

        # 4. Check a complex chord with fallback
        try:
            # Look for the button that says "Мажор" (default chord type in RU)
            chord_type_btn = await page.wait_for_selector("button:has-text('Мажор')")
            await chord_type_btn.click()
            await asyncio.sleep(1)
            # Select "11 (ундецимаккорд)" which likely has no voicing
            item = await page.wait_for_selector("div[role='menuitem']:has-text('11')")
            await item.click()
            await asyncio.sleep(2)
            await page.screenshot(path="verification/fallback_chord.png")
            print("Captured fallback_chord.png")
        except Exception as e:
            print(f"Could not check complex chord: {e}")

        await browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    asyncio.run(verify_fixes())
