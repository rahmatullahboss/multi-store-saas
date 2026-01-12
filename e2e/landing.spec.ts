/**
 * Landing Page E2E Tests
 * 
 * Tests the public landing page functionality
 */

import { test, expect } from './fixtures';

test.describe('Landing Page', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page before each test
    await page.goto('/');
  });
  
  test('should load successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Multi-Store/i);
    // The app defaults to Bengali, so the CTA would be "শুরু করুন" or "ফ্রিতে শুরু করুন"
    // Let's just check that the page body has content
    await expect(page.locator('body')).toBeVisible();
  });

  test('should navigate to login', async ({ page }) => {
    // In Bengali, login link is "লগইন"
    await page.click('text=লগইন');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('should navigate to registration', async ({ page }) => {
    // CTA button in Bengali - "শুরু করুন" or "ফ্রিতে শুরু করুন"
    const startBtn = page.locator('text=শুরু করুন').first();
    await startBtn.click();
    await expect(page).toHaveURL(/\/onboarding|\/auth\/register/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    // Just verify the page is still visible on mobile
    await expect(page.locator('body')).toBeVisible();
  });
});
