import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Theme Switching Persistence', () => {
  const uniqueId = randomUUID().slice(0, 8);
  const subdomain = `theme-test-${uniqueId}`;

  test('settings survive theme switch', async ({ page }) => {
    // 1. Setup: Create Store & Enable Flash Sale (Mocked flow assumption)
    // In a real E2E, we'd log in and create this. For brevity, assuming pre-setup or helper.
    // We will simulate the flow.
    
    // Login
    await page.goto('/login');
    // ... auth ...
    
    // Create Store
    await page.goto('/onboarding');
    await page.fill('input[name="subdomain"]', subdomain);
    await page.click('button:has-text("Create Store")');
    await page.waitForURL(/\/admin\/dashboard/);

    // Set Setting: Flash Sale 30%
    await page.goto('/admin/marketing');
    await page.fill('input[name="flash_sale_discount"]', '30');
    await page.click('button:has-text("Save")');

    // 2. Check Storefront (Theme A)
    await page.goto(`/store/${subdomain}`);
    await expect(page.getByText('30% OFF')).toBeVisible();

    // 3. Switch Theme
    await page.goto('/admin/appearance/themes');
    // Assume we are on 'Modern' default, switching to 'Minimal'
    await page.click('button[aria-label="Activate Minimal Theme"]');
    await expect(page.getByText('Theme Activated')).toBeVisible();

    // 4. Check Storefront Again (Theme B)
    await page.goto(`/store/${subdomain}`);
    // The "30% OFF" badge should STILL be visible if logic holds
    await expect(page.getByText('30% OFF')).toBeVisible();
  });
});
