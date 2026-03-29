
from playwright.sync_api import sync_playwright
import os

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the app
        page.goto("http://localhost:8080")

        # Wait for audio overlay and click it
        try:
            page.wait_for_selector("button:has-text('Включить')", timeout=10000)
            page.click("button:has-text('Включить')")
        except Exception as e:
            print(f"Enable audio button not found or already clicked: {e}")

        # Capture main screen
        page.wait_for_timeout(3000)
        page.screenshot(path="verification/main_screen.png")
        print("Captured main_screen.png")

        # Switch to Piano
        page.click("button[variant='ghost']:has-text('Пианино')") # Wait, it's in a Select?
        # Let's try to click the instrument select
        page.click("button:has-text('Акустика')") # Current instrument might be 'Акустика'
        page.wait_for_selector("div[role='listbox']")
        page.click("div[role='listbox'] >> text='Пианино'")
        page.wait_for_timeout(2000)
        page.screenshot(path="verification/piano_view.png")
        print("Captured piano_view.png")

        # Check Circle of Fifths
        page.click("button:has-text('Теория и прогрессии')")
        page.wait_for_timeout(1000)
        page.screenshot(path="verification/theory_tools.png")
        print("Captured theory_tools.png")

        browser.close()

if __name__ == "__main__":
    if not os.path.exists("verification"):
        os.makedirs("verification")
    verify_app()
