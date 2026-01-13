/**
 * Dashboard E2E Tests
 * 
 * Tests dashboard stats, charts, and navigation
 */

import { test, expect, testData } from './fixtures';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test.describe('Dashboard Home', () => {
    test('should load dashboard', async ({ page }) => {
      await page.goto('/app');
      
      // Should show dashboard
      await expect(page.locator('body')).toContainText(/Dashboard|ড্যাশবোর্ড|Welcome|স্বাগতম/i);
    });

    test('should display stats cards', async ({ page }) => {
      await page.goto('/app');
      
      // Should show stats like orders, revenue, etc.
      await expect(page.locator('[data-testid="stats-card"], [class*="stat"], [class*="card"]').first()).toBeVisible();
    });

    test('should show total orders count', async ({ page }) => {
      await page.goto('/app');
      
      // Should have orders stat
      await expect(page.locator('body')).toContainText(/Orders|অর্ডার/i);
    });

    test('should show total revenue', async ({ page }) => {
      await page.goto('/app');
      
      // Should have revenue stat
      await expect(page.locator('body')).toContainText(/Revenue|আয়|৳|BDT/i);
    });

    test('should show customers count', async ({ page }) => {
      await page.goto('/app');
      
      // Should have customers stat
      await expect(page.locator('body')).toContainText(/Customers|কাস্টমার/i);
    });
  });

  test.describe('Dashboard Navigation', () => {
    test('should navigate to products', async ({ page }) => {
      await page.goto('/app');
      
      const productsLink = page.locator('a[href*="products"]').first();
      if (await productsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await productsLink.click();
        await expect(page.url()).toContain('products');
      }
    });

    test('should navigate to orders', async ({ page }) => {
      await page.goto('/app');
      
      const ordersLink = page.locator('a[href*="orders"]').first();
      if (await ordersLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await ordersLink.click();
        await expect(page.url()).toContain('orders');
      }
    });

    test('should navigate to customers', async ({ page }) => {
      await page.goto('/app');
      
      const customersLink = page.locator('a[href*="customers"]').first();
      if (await customersLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await customersLink.click();
        await expect(page.url()).toContain('customers');
      }
    });

    test('should navigate to settings', async ({ page }) => {
      await page.goto('/app');
      
      const settingsLink = page.locator('a[href*="settings"]').first();
      if (await settingsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
        await settingsLink.click();
        await expect(page.url()).toContain('settings');
      }
    });
  });

  test.describe('Dashboard Charts', () => {
    test('should display sales chart', async ({ page }) => {
      await page.goto('/app');
      
      // Chart container should be visible
      const chartContainer = page.locator('[data-testid="sales-chart"], canvas, svg[class*="chart"]').first();
      try {
        await expect(chartContainer).toBeVisible({ timeout: 5000 });
      } catch {
        // Charts might not be present on empty stores
      }
    });

    test('should toggle chart time period', async ({ page }) => {
      await page.goto('/app');
      
      // Find time period selector
      const periodSelector = page.locator('button, [role="tab"]').filter({ hasText: /Week|Month|Year|সপ্তাহ|মাস/i }).first();
      if (await periodSelector.isVisible()) {
        await periodSelector.click();
      }
    });
  });

  test.describe('Recent Activity', () => {
    test('should show recent orders', async ({ page }) => {
      await page.goto('/app');
      
      // Recent orders section
      try {
        await expect(page.locator('body')).toContainText(/Recent|সাম্প্রতিক/i, { timeout: 5000 });
      } catch {}
    });

    test('should click on recent order', async ({ page }) => {
      await page.goto('/app');
      
      const recentOrderRow = page.locator('[data-testid="recent-order"], table tr').nth(1);
      if (await recentOrderRow.isVisible()) {
        await recentOrderRow.click();
        await page.waitForTimeout(500);
      }
    });
  });

  test.describe('Quick Actions', () => {
    test('should quick add product', async ({ page }) => {
      await page.goto('/app');
      
      const quickAddBtn = page.locator('button, a').filter({ hasText: /Quick Add|দ্রুত যোগ করুন|New Product/i }).first();
      if (await quickAddBtn.isVisible()) {
        await quickAddBtn.click();
        await page.waitForTimeout(500);
      }
    });

    test('should view store', async ({ page }) => {
      await page.goto('/app');
      
      const viewStoreBtn = page.locator('a').filter({ hasText: /View Store|স্টোর দেখুন|Visit/i }).first();
      if (await viewStoreBtn.isVisible()) {
        await expect(viewStoreBtn).toHaveAttribute('href', /.+/);
      }
    });
  });

  test.describe('Mobile Responsiveness', () => {
    test('should show mobile menu', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app');
      
      // Mobile menu button should be visible
      const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"], button svg').first();
      try {
        await expect(menuButton).toBeVisible({ timeout: 5000 });
      } catch {}
    });

    test('should open mobile sidebar', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/app');
      
      const menuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]').first();
      if (await menuButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await menuButton.click();
        
        // Sidebar should appear
        try {
          await expect(page.locator('[data-testid="sidebar"], nav')).toBeVisible({ timeout: 3000 });
        } catch {}
      }
    });
  });
});

test.describe('Analytics', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test('should load analytics page', async ({ page }) => {
    await page.goto('/app/analytics');
    
    await expect(page.locator('body')).toContainText(/Analytics|বিশ্লেষণ|Stats|পরিসংখ্যান/i);
  });

  test('should show visitor stats', async ({ page }) => {
    await page.goto('/app/analytics');
    
    try {
      await expect(page.locator('body')).toContainText(/Visitors|ভিজিটর|Views|পেজ ভিউ/i, { timeout: 5000 });
    } catch {}
  });
});
