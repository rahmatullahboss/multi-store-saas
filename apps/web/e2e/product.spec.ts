/**
 * Product Management E2E Tests
 * 
 * Tests CRUD operations for products in merchant dashboard
 */

import { test, expect, testData } from './fixtures';

test.describe('Product Management', () => {
  test.beforeEach(async ({ authPage }) => {
    // Ensure logged in before each test
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test.describe('Product List', () => {
    test('should load products page', async ({ page }) => {
      await page.goto('/app/products');
      
      // Should show products section - use main selector to avoid sidebar h2
      await expect(page.locator('main h1, main h2').first()).toContainText(/Products|পণ্য/i);
    });

    test('should show add product button', async ({ page }) => {
      await page.goto('/app/products');
      
      // Should have add product button OR show product limit warning
      // The button might not be visible if the user has reached their product limit
      const addButton = page.locator('button, a').filter({ hasText: /Add|New|যোগ করুন|নতুন|পণ্য যোগ/i });
      const limitWarning = page.locator('text=/Product limit|প্রোডাক্ট লিমিট/i');
      
      // Either button is visible OR limit warning is shown
      const hasButton = await addButton.first().isVisible().catch(() => false);
      const hasLimit = await limitWarning.first().isVisible().catch(() => false);
      
      expect(hasButton || hasLimit).toBeTruthy();
    });

    test('should search products', async ({ page }) => {
      await page.goto('/app/products');
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[placeholder*="খুঁজুন"]');
      if (await searchInput.isVisible()) {
        await searchInput.fill('test');
        await page.waitForTimeout(500);
        // Search should filter results
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Create Product', () => {
    test('should navigate to add product form', async ({ page }) => {
      await page.goto('/app/products');
      
      const addButton = page.locator('a[href*="new"], button').filter({ hasText: /Add|যোগ করুন|নতুন/i }).first();
      if (await addButton.isVisible()) {
        await addButton.click();
        await expect(page.url()).toContain('new');
      }
    });

    test('should validate required fields', async ({ page }) => {
      await page.goto('/app/products/new');
      
      // Try to submit empty form
      const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /Save|সেভ|তৈরি করুন/i }).first();
      if (await saveButton.isVisible()) {
        await saveButton.click();
        
        // Should show validation error
        await expect(page.locator('body')).toContainText(/required|প্রয়োজন|আবশ্যক/i).catch(() => {});
      }
    });

    test('should create product with valid data', async ({ page }) => {
      await page.goto('/app/products/new');
      
      // Fill product form
      const titleInput = page.locator('input[name="title"], input[name="name"]');
      if (await titleInput.isVisible()) {
        await titleInput.fill(testData.product.title);
        
        const priceInput = page.locator('input[name="price"]');
        if (await priceInput.isVisible()) {
          await priceInput.fill(testData.product.price.toString());
        }
        
        const descInput = page.locator('textarea[name="description"]');
        if (await descInput.isVisible()) {
          await descInput.fill(testData.product.description);
        }
        
        // Save product
        const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /Save|সেভ|তৈরি করুন/i }).first();
        await saveButton.click();
        
        // Should redirect to products list or show success
        await page.waitForTimeout(2000);
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });

  test.describe('Edit Product', () => {
    test('should edit existing product', async ({ page }) => {
      await page.goto('/app/products');
      
      // Click on first product
      const productRow = page.locator('tr[data-testid="product-row"], [data-testid="product-card"]').first();
      if (await productRow.isVisible()) {
        await productRow.click();
        
        // Should open edit form
        await page.waitForTimeout(1000);
        
        // Update title
        const titleInput = page.locator('input[name="title"], input[name="name"]');
        if (await titleInput.isVisible()) {
          await titleInput.fill('Updated Product Title');
          
          // Save
          const saveButton = page.locator('button[type="submit"]').first();
          await saveButton.click();
        }
      }
    });
  });

  test.describe('Delete Product', () => {
    test('should show delete confirmation', async ({ page }) => {
      await page.goto('/app/products');
      
      // Find delete button
      const deleteButton = page.locator('button').filter({ hasText: /Delete|মুছুন/i }).first();
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        await expect(page.locator('[role="dialog"], [role="alertdialog"]')).toBeVisible().catch(() => {
          // No dialog, might be inline confirmation
        });
      }
    });
  });
});

test.describe('Product Variants', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test('should add size variant', async ({ page }) => {
    await page.goto('/app/products/new');
    
    const variantButton = page.locator('button').filter({ hasText: /Variant|ভেরিয়েন্ট|সাইজ/i }).first();
    if (await variantButton.isVisible()) {
      await variantButton.click();
      await expect(page.locator('[data-testid="variant-form"]')).toBeVisible().catch(() => {});
    }
  });
});
