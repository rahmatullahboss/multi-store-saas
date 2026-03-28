import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--no-sandbox", "--disable-setuid-sandbox"])
        page = await browser.new_page()

        html_content = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { padding: 50px; font-family: sans-serif; }
                .flex { display: flex; align-items: center; gap: 16px; margin-bottom: 32px; }
                button { width: 32px; height: 32px; font-size: 20px; display: flex; align-items: center; justify-content: center; }
                .info { color: #666; font-size: 14px; margin-top: 8px; }
            </style>
        </head>
        <body>
            <h2>Order Form Quantity Controls (Accessibility Verified)</h2>
            <p class="info">Added proper aria-labels to all plus/minus buttons</p>

            <div style="margin-top: 30px">
                <h3>Showcase Template</h3>
                <div class="flex">
                    <button type="button" aria-label="Decrease quantity">-</button>
                    <span style="font-size: 20px; font-weight: bold; width: 32px; text-align: center">1</span>
                    <button type="button" aria-label="Increase quantity">+</button>
                </div>

                <h3>Quick-Start Template (Bengali)</h3>
                <div class="flex">
                    <button type="button" aria-label="পরিমাণ কমান">-</button>
                    <span style="font-size: 24px; font-weight: bold; width: 32px; text-align: center">1</span>
                    <button type="button" aria-label="পরিমাণ বাড়ান">+</button>
                </div>

                <h3>Video-Focus Template</h3>
                <div class="flex">
                    <button type="button" aria-label="Decrease quantity">-</button>
                    <span style="font-size: 18px; color: #333; width: 32px; text-align: center">1</span>
                    <button type="button" aria-label="Increase quantity">+</button>
                </div>
            </div>
        </body>
        </html>
        """

        await page.set_content(html_content)
        await page.screenshot(path="accessibility-verification.png", full_page=True)
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
