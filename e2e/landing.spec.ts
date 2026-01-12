/**
 * Landing Page E2E Tests
 * 
 * Tests the public landing page functionality
 */

import { test, expect } from './fixtures';

test.describe('Landing Page', () => {
  
  test('should load successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/Multi-Store/i);
    // Button text in English is "Start for Free" or "Get Started"
    // MarketingHeader.tsx has "Start for Free" or similar
    await expect(page.locator('text=Start')).toBeVisible().catch(() => {
        // Fallback for any other start text
        return expect(page.locator('text=Get Started')).toBeVisible();
    });
  });

  test('should navigate to login', async ({ page }) => {
    // "Log in" or "Login"
    await page.click('text=Log in');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should navigate to registration', async ({ page }) => {
    // CTA button usually has "Start"
    const startBtn = page.locator('text=Start').first();
    await startBtn.click();
    await expect(page).toHaveURL(/\/onboarding/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('text=Start').first()).toBeVisible();
  });
});
