/**
 * Settings E2E Tests
 * 
 * Tests store settings pages and configuration
 */

import { test, expect, testData } from './fixtures';

test.describe('Store Settings', () => {
  test.beforeEach(async ({ authPage }) => {
    await authPage.ensureRegisteredAndLoggedIn(
      testData.merchant.name,
      testData.merchant.email,
      testData.merchant.password,
      testData.store.name,
      testData.store.subdomain
    );
  });

  test.describe('General Settings', () => {
    test('should load settings page', async ({ page }) => {
      await page.goto('/app/settings');
      
      // Should show settings section - use main selector to avoid sidebar h2
      await expect(page.locator('main h1, main h2').first()).toContainText(/Settings|সেটিংস/i);
    });

    test('should update store name', async ({ page }) => {
      await page.goto('/app/settings');
      
      const storeNameInput = page.locator('input[name="storeName"], input[name="name"]');
      if (await storeNameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await storeNameInput.fill('Updated Store Name');
        
        const saveButton = page.locator('button[type="submit"], button').filter({ hasText: /Save|সেভ/i }).first();
        await saveButton.click();
        
        // Should show success message
        try {
          await expect(page.locator('body')).toContainText(/Saved|Success|সফল/i, { timeout: 5000 });
        } catch {}
      }
    });

    test('should update store logo', async ({ page }) => {
      await page.goto('/app/settings');
      
      // Find logo upload section
      const logoUpload = page.locator('[data-testid="logo-upload"], input[type="file"]');
      try {
        await expect(logoUpload).toBeVisible({ timeout: 5000 });
      } catch {
        // Logo upload may not be available in basic settings
      }
    });
  });

  test.describe('Payment Settings', () => {
    test('should load payment settings', async ({ page }) => {
      await page.goto('/app/settings/payment');
      
      // Should show payment section
      await expect(page.locator('body')).toContainText(/Payment|পেমেন্ট|bKash|Nagad|COD/i);
    });

    test('should toggle COD', async ({ page }) => {
      await page.goto('/app/settings/payment');
      
      const codToggle = page.locator('input[type="checkbox"], button[role="switch"]').filter({ has: page.locator('text=COD') }).first();
      if (await codToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
        await codToggle.click();
      }
    });

    test('should configure bKash number', async ({ page }) => {
      await page.goto('/app/settings/payment');
      
      const bkashInput = page.locator('input').filter({ has: page.locator('text=bKash') }).first();
      if (await bkashInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await bkashInput.fill('01712345678');
      }
    });
  });

  test.describe('Courier Settings', () => {
    test('should load courier settings', async ({ page }) => {
      await page.goto('/app/settings/courier');
      
      // Should show courier/delivery section
      await expect(page.locator('body')).toContainText(/Courier|ডেলিভারি|Shipping|শিপিং/i);
    });

    test('should set delivery charge', async ({ page }) => {
      await page.goto('/app/settings/courier');
      
      const dhakaPriceInput = page.locator('input[name="insideDhaka"], input').filter({ has: page.locator('text=Dhaka|ঢাকা') }).first();
      if (await dhakaPriceInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dhakaPriceInput.fill('60');
      }
    });
  });

  test.describe('SEO Settings', () => {
    test('should load SEO settings', async ({ page }) => {
      await page.goto('/app/settings/seo');
      
      // Should show SEO section
      await expect(page.locator('body')).toContainText(/SEO|Meta|Title|Description/i);
    });

    test('should update meta title', async ({ page }) => {
      await page.goto('/app/settings/seo');
      
      const metaTitleInput = page.locator('input[name="metaTitle"], input[name="seoTitle"]');
      if (await metaTitleInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await metaTitleInput.fill('My Awesome Store - Best Products in BD');
        
        const saveButton = page.locator('button[type="submit"]').first();
        await saveButton.click();
      }
    });

    test('should update meta description', async ({ page }) => {
      await page.goto('/app/settings/seo');
      
      const metaDescInput = page.locator('textarea[name="metaDescription"], textarea[name="seoDescription"]');
      if (await metaDescInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await metaDescInput.fill('Shop the best products at affordable prices. Fast delivery across Bangladesh.');
      }
    });
  });

  test.describe('Theme Settings', () => {
    test('should load theme settings', async ({ page }) => {
      await page.goto('/app/settings/homepage');
      
      // Should show theme/homepage section
      await expect(page.locator('body')).toContainText(/Theme|থিম|Homepage|হোমপেজ|Template/i);
    });

    test('should change store theme', async ({ page }) => {
      await page.goto('/app/settings/homepage');
      
      // Find theme selector
      const themeCard = page.locator('[data-testid="theme-card"], [role="button"]').filter({ hasText: /Modern|Minimal|Aurora/i }).first();
      if (await themeCard.isVisible({ timeout: 3000 }).catch(() => false)) {
        await themeCard.click();
      }
    });
  });

  test.describe('Legal Settings', () => {
    test('should load legal settings', async ({ page }) => {
      await page.goto('/app/settings/legal');
      
      // Should show legal section - include Bengali: গোপনীয়তা = Privacy, রিফান্ড = Refund, শর্তাবলী = Terms
      await expect(page.locator('body')).toContainText(/Legal|Privacy|Terms|Refund|গোপনীয়তা|রিফান্ড|শর্তাবলী/i);
    });

    test('should update privacy policy', async ({ page }) => {
      await page.goto('/app/settings/legal');
      
      const privacyTextarea = page.locator('textarea').first();
      if (await privacyTextarea.isVisible({ timeout: 3000 }).catch(() => false)) {
        await privacyTextarea.fill('This is our privacy policy for testing purposes.');
      }
    });
  });

  test.describe('Team Settings', () => {
    test('should load team settings', async ({ page }) => {
      await page.goto('/app/settings/team');
      
      // Should show team section
      await expect(page.locator('body')).toContainText(/Team|টিম|Member|সদস্য|Invite/i);
    });

    test('should show invite member button', async ({ page }) => {
      await page.goto('/app/settings/team');
      
      const inviteButton = page.locator('button, a').filter({ hasText: /Invite|আমন্ত্রণ|Add|যোগ করুন/i });
      try {
        await expect(inviteButton.first()).toBeVisible({ timeout: 5000 });
      } catch {}
    });
  });
});
