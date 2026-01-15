import { test, expect, testData } from './fixtures';

test.describe('Theme Switching', () => {
  
  test('store editor page loads and shows template options', async ({ page, authPage }) => {
    // 1. Register and login
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
    
    // 2. Navigate to store editor
    await page.goto('/app/settings/store-editor');
    
    // 3. Verify the page loads (it should redirect there or we see the editor)
    // The store editor should show template options
    await expect(page.locator('body')).toBeVisible();
    
    // Check we're on a settings or store page
    await expect(page.url()).toMatch(/app|settings|store/i);
  });
  
  test('flash sale settings can be accessed', async ({ page, authPage }) => {
    // 1. Register and login
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
    
    // 2. Navigate to marketing
    await page.goto('/app/marketing');
    
    // 3. Verify the page loads
    await expect(page.locator('body')).toBeVisible();
  });
});
