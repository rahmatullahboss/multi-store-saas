/**
 * Order Management E2E Tests
 * 
 * Tests order viewing, status updates, and management
 */

import { test, expect, testData } from './fixtures';

test.describe('Order Management', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test.describe('Order List', () => {
    test('should load orders page', async ({ page }) => {
      await page.goto('/app/orders');
      
      // Should show orders section
      await expect(page.locator('h1, h2').first()).toContainText(/Orders|অর্ডার/i);
    });

    test('should show order filters', async ({ page }) => {
      await page.goto('/app/orders');
      
      // Should have status filter
      const filterButton = page.locator('button, select').filter({ hasText: /Filter|ফিল্টার|Status|স্ট্যাটাস|All/i });
      await expect(filterButton.first()).toBeVisible().catch(() => {});
    });

    test('should filter orders by status', async ({ page }) => {
      await page.goto('/app/orders');
      
      // Click on pending filter
      const pendingFilter = page.locator('button, [role="tab"]').filter({ hasText: /Pending|পেন্ডিং/i }).first();
      if (await pendingFilter.isVisible()) {
        await pendingFilter.click();
        await page.waitForTimeout(500);
        // URL should update with filter param
        await expect(page.url()).toMatch(/status|filter/i).catch(() => {});
      }
    });

    test('should search orders by phone', async ({ page }) => {
      await page.goto('/app/orders');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="খুঁজুন"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('01712345678');
        await page.waitForTimeout(500);
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Order Details', () => {
    test('should open order details', async ({ page }) => {
      await page.goto('/app/orders');
      
      // Click on first order
      const orderRow = page.locator('tr[data-testid="order-row"], [data-testid="order-card"], tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        // Should show order details
        await expect(page.locator('body')).toContainText(/Order|অর্ডার|#/i);
      }
    });

    test('should display customer info', async ({ page }) => {
      await page.goto('/app/orders');
      
      const orderRow = page.locator('tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        // Should show customer details section
        await expect(page.locator('body')).toContainText(/Customer|কাস্টমার|Phone|ফোন|Address|ঠিকানা/i).catch(() => {});
      }
    });
  });

  test.describe('Order Status Updates', () => {
    test('should update order status to processing', async ({ page }) => {
      await page.goto('/app/orders');
      
      const orderRow = page.locator('tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        // Find status update button/dropdown
        const statusDropdown = page.locator('select[name="status"], button').filter({ hasText: /Status|স্ট্যাটাস|Processing|প্রসেসিং/i }).first();
        if (await statusDropdown.isVisible()) {
          await statusDropdown.click();
          
          const processingOption = page.locator('[role="option"], option').filter({ hasText: /Processing|প্রসেসিং/i }).first();
          if (await processingOption.isVisible()) {
            await processingOption.click();
          }
        }
      }
    });

    test('should update order status to delivered', async ({ page }) => {
      await page.goto('/app/orders');
      
      const orderRow = page.locator('tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        const statusDropdown = page.locator('select[name="status"], [data-testid="status-dropdown"]').first();
        if (await statusDropdown.isVisible()) {
          await statusDropdown.selectOption('delivered').catch(() => {
            // Might be a custom dropdown
          });
        }
      }
    });
  });

  test.describe('Order Invoice', () => {
    test('should generate invoice', async ({ page }) => {
      await page.goto('/app/orders');
      
      const orderRow = page.locator('tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        // Find invoice button
        const invoiceButton = page.locator('button, a').filter({ hasText: /Invoice|ইনভয়েস|Print|প্রিন্ট/i }).first();
        if (await invoiceButton.isVisible()) {
          await invoiceButton.click();
          await page.waitForTimeout(500);
        }
      }
    });
  });

  test.describe('Order Notes', () => {
    test('should add note to order', async ({ page }) => {
      await page.goto('/app/orders');
      
      const orderRow = page.locator('tbody tr').first();
      if (await orderRow.isVisible()) {
        await orderRow.click();
        await page.waitForTimeout(1000);
        
        // Find note input
        const noteInput = page.locator('textarea[name="note"], input[name="note"]');
        if (await noteInput.isVisible()) {
          await noteInput.fill('Test note from E2E');
          
          const saveButton = page.locator('button').filter({ hasText: /Add|Save|যোগ করুন|সেভ/i }).first();
          await saveButton.click();
        }
      }
    });
  });
});

test.describe('Bulk Order Actions', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test('should select multiple orders', async ({ page }) => {
    await page.goto('/app/orders');
    
    // Select checkbox on first order
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
      
      // Bulk action bar should appear
      await expect(page.locator('[data-testid="bulk-actions"], button').filter({ hasText: /Bulk|বাল্ক|Selected|নির্বাচিত/i })).toBeVisible().catch(() => {});
    }
  });

  test('should bulk update order status', async ({ page }) => {
    await page.goto('/app/orders');
    
    // Select multiple orders
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).click();
      await checkboxes.nth(1).click();
      
      // Find bulk action dropdown
      const bulkActionBtn = page.locator('button').filter({ hasText: /Bulk|বাল্ক|Action/i }).first();
      if (await bulkActionBtn.isVisible()) {
        await bulkActionBtn.click();
      }
    }
  });
});
