from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        print("Playwright successfully imported")

run()
