from playwright.sync_api import Page, expect, sync_playwright

def verify_feature(page: Page):
  page.set_content("""
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body>
    <button
      class="p-2 rounded-full bg-black/20 hover:bg-black/30 transition-colors"
      aria-label="বন্ধ করুন"
    >
      X
    </button>
  </body>
  </html>
  """)
  page.wait_for_timeout(500)

  # Assert the button has the aria-label
  expect(page.get_by_role("button", name="বন্ধ করুন")).to_be_visible()

  page.screenshot(path="/home/jules/verification/verification.png")
  page.wait_for_timeout(1000)

if __name__ == "__main__":
  with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()
    try:
      verify_feature(page)
    finally:
      context.close()
      browser.close()
