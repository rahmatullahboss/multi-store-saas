import { test, expect } from '@playwright/test';
import { randomUUID } from 'crypto';

test.describe('Critical Path: Store Creation to Purchase', () => {
  
  const uniqueId = randomUUID().slice(0, 8);
  const email = `test-merchant-${uniqueId}@example.com`;
  const subdomain = `test-store-${uniqueId}`;
  const password = 'Password123!';

  test('full merchant and customer journey', async ({ page }) => {
    // --- MERCHANT JOURNEY ---

    // 1. Start Onboarding
    await page.goto('/auth/register');
    await page.waitForURL('/onboarding');
    
    // Switch to English for reliable selectors
    const englishBtn = page.getByRole('button', { name: /English/i });
    if (await englishBtn.isVisible()) {
      await englishBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Step 1: Account
    await page.fill('input[name="name"]', 'Test Merchant');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="phone"]', '01739416661');
    await page.getByRole('button', { name: /Continue|Next|এগিয়ে যান/i }).click();
    
    // Step 2: Store Setup
    await page.waitForTimeout(2000);
    await page.getByPlaceholder(/Fashion House BD|Store Name/i).fill(`Test Store ${uniqueId}`);
    await page.getByPlaceholder(/my-store|subdomain/i).fill(subdomain);
    // Select "Fashion" category which creates "Premium Fashion Item"
    await page.getByRole('button', { name: /Fashion|ফ্যাশন/i }).click();
    await page.getByRole('button', { name: /Continue|Next|এগিয়ে যান/i }).click();
    
    // Step 3: Plan Selection (Free)
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /Create My Store|আমার স্টোর তৈরি করুন/i }).click();
    
    // Wait for Dashboard (Redirected to /app/orders)
    await page.waitForURL(/\/app\/orders/, { timeout: 60000 });
    await expect(page).toHaveURL(/\/app\/orders/);

    // 2. Verify Product exists (Auto-created by onboarding)
    await page.goto('/app/products');
    await expect(page.getByRole('link', { name: /Premium Fashion Item/i })).toBeVisible({ timeout: 10000 });

    // --- CUSTOMER JOURNEY ---
    
    // 3. Storefront Visit via subdomain (Free plan = Landing Page Mode)
    await page.goto(`http://${subdomain}.localhost:5173/`);
    await page.waitForTimeout(3000);
    
    // Free plan shows landing page with order form directly
    // Look for the order form and fill it
    await expect(page.locator('text=অর্ডার কনফার্ম করুন').first()).toBeVisible({ timeout: 10000 });
    
    // 4. Fill Order Form (Landing Page has embedded form)
    await page.getByPlaceholder(/আপনার নাম|Your Name/i).fill('Guest Customer');
    await page.getByPlaceholder(/017XXXXXXXX|Phone/i).fill('01700000000');
    await page.getByPlaceholder(/বাসা নং|Address/i).fill('Dhaka, Bangladesh');
    
    // Select delivery area (inside Dhaka) - use the one in the order form
    await page.locator('#order-form').getByText('ঢাকা সিটির ভিতরে').click();
    
    // Submit order
    await page.getByRole('button', { name: /অর্ডার কনফার্ম করুন|Confirm Order/i }).click();
    
    // Success check - look for thank you message or order confirmation
    await page.waitForURL(/\/thank-you|\/order-success|checkout\/success/, { timeout: 15000 }).catch(() => {
      // If no redirect, check for inline success message
    });
    
    // Check for success indicator (could be inline or redirected)
    await expect(page.getByText(/ধন্যবাদ|Thank you|Order Confirmed|অর্ডার সম্পন্ন/i)).toBeVisible({ timeout: 10000 });
  });
});
