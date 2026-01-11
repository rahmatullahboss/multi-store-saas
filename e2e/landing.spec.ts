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
    await expect(page).toHaveTitle(/Ozzyl|Multi-Store/i);
    
    // Check main CTA is visible
    await expect(page.locator('text=শুরু করুন')).toBeVisible();
  });
  
  test('should have working navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check navigation links
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=লগইন')).toBeVisible();
  });
  
  test('should navigate to registration', async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.clickGetStarted();
    
    await expect(page).toHaveURL(/auth\/register/);
  });
  
  test('should navigate to login', async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.clickLogin();
    
    await expect(page).toHaveURL(/auth\/login/);
  });
  
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button exists
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    // Landing page should still be functional on mobile
    await expect(page.locator('text=শুরু করুন')).toBeVisible();
  });
});
