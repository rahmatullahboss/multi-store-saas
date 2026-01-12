import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Critical Path: Store Creation to Purchase', () => {
  
  // Use unique user per test run to avoid conflicts
  const uniqueId = randomUUID().slice(0, 8);
  const email = `test-merchant-${uniqueId}@example.com`;
  const subdomain = `test-store-${uniqueId}`;

  test('full merchant and customer journey', async ({ page }) => {
    // --- MERCHANT JOURNEY ---

    // 1. Sign Up
    await page.goto('/login'); // Assuming login/signup is at /login or similar
    // Note: Adjust selectors based on actual UI implementation
    // For this test template, we are assuming standard inputs.
    
    // Simulate generic login/signup flow if available, or direct to dashboard if using magic links.
    // Assuming we have a way to reach the onboarding flow:
    await page.goto('/auth/onboarding'); // Direct navigation to onboarding for testing if allowed
    
    // 2. Create Store
    await expect(page.getByText(/Create your store/i)).toBeVisible();
    await page.fill('input[name="storeName"]', `Test Store ${uniqueId}`);
    await page.fill('input[name="subdomain"]', subdomain);
    await page.click('button[type="submit"]');
    
    // Wait for dashboard redirection
    await page.waitForURL(/\/admin\/dashboard/);

    // 3. Add Product
    await page.goto('/admin/products/new');
    await page.fill('input[name="title"]', 'Test Product Red Dress');
    await page.fill('input[name="price"]', '1500');
    // Skipping complex image upload for smoke test, handling optional if possible
    await page.click('button:has-text("Save Product")');
    await expect(page.getByText('Product saved')).toBeVisible();

    // 4. Create Flash Sale
    await page.goto('/admin/marketing');
    await page.click('button:has-text("Create Campaign")'); // Logical guess
    // Assuming Flash Sale UI
    await page.fill('input[name="flash_sale_discount"]', '25');
    await page.click('button:has-text("Activate Flash Sale")');
    
    // --- CUSTOMER JOURNEY ---
    
    // 5. Storefront Visit
    // In E2E, we need to visit the subdomain. 
    // Playwright config baseURL is localhost:5173. 
    // Subdomains on localhost usually require /store/subdomain or specific host handling.
    // We will assume the app supports path-based access for checks: /store/<subdomain>
    await page.goto(`/store/${subdomain}`);
    
    // Check for Flash Sale Badge
    await expect(page.getByText('25% OFF')).toBeVisible();
    
    // 6. Add to Cart & Checkout
    await page.click('text=Test Product Red Dress');
    await page.click('button:has-text("Add to Cart")');
    await page.click('a[href="/cart"]'); // or button
    await page.click('button:has-text("Checkout")');
    
    // 7. Order Confirmation
    // Fill Guest Details
    await page.fill('input[name="fullName"]', 'Guest Customer');
    await page.fill('input[name="phone"]', '01700000000');
    await page.fill('textarea[name="address"]', 'Dhaka, Bangladesh');
    
    await page.click('button:has-text("Place Order")');
    
    await expect(page.locator('text="Order Confirmed"')).toBeVisible();
  });
});
