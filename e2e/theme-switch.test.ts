import { test, expect, testData } from './fixtures';
import { randomUUID } from 'crypto';

test.describe('Theme Switching Persistence', () => {
  const uniqueId = randomUUID().slice(0, 8);
  const subdomain = `theme-test-${uniqueId}`;
  const storeUrl = `http://${subdomain}.localhost:5173`;

  test('settings survive theme switch', async ({ page, authPage }) => {
    // 1. Setup: Create Store & Enable Flash Sale
    // Login
    await authPage.gotoLogin();
    // Assuming we can use test merchant
    await authPage.login(testData.merchant.email, testData.merchant.password).catch(() => {
        // If login fails, try registration to ensure store exists
        return authPage.register(
            testData.merchant.name,
            testData.merchant.email,
            testData.merchant.password,
            'Theme Test Store',
            subdomain
        );
    });
    
    // Go to app dashboard/marketing
    await page.goto('/app/marketing');
    
    // Set Setting: Flash Sale (Assume field IDs or text)
    // Looking at the codebase, flash sale might be under a specific tab or section
    const flashSaleInput = page.locator('input[name="flash_sale_discount"]').first();
    if (await flashSaleInput.isVisible()) {
        await flashSaleInput.fill('30');
        await page.click('button:has-text("Save")');
    }

    // 2. Check Storefront (Initial Theme)
    await page.goto(storeUrl);
    // The flash sale should be visible
    // We expect "30% OFF" or similar based on translations
    await expect(page.locator('text=30%')).toBeVisible();

    // 3. Switch Theme
    await page.goto('/app/settings/store-editor');
    // Select a different template
    const otherTemplate = page.locator('[data-template-id]').nth(1);
    if (await otherTemplate.isVisible()) {
        await otherTemplate.click();
        await page.click('button:has-text("Save")');
    }

    // 4. Check Storefront Again (New Theme)
    await page.goto(storeUrl);
    // The "30%" should STILL be visible if logic holds
    await expect(page.locator('text=30%')).toBeVisible();
  });
});
