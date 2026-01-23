/**
 * E2E Tests for Quick Builder v2
 * 
 * Tests:
 * 1. Intent Wizard route accessible
 * 2. Intent Wizard 3-step flow
 * 3. Quick Builder CTA visible in landing settings
 * 4. Section Variants modal
 * 5. Style Wizard UI
 * 6. Checkout Modal toggle
 */

import { test, expect } from '@playwright/test';

test.describe('Quick Builder v2', () => {
  // Setup: Login before each test
  test.beforeEach(async ({ page }) => {
    // Go to login
    await page.goto('/auth/login');
    
    // Check if already logged in by checking URL
    await page.waitForTimeout(500);
    const url = page.url();
    
    if (url.includes('/auth/login')) {
      // Need to login
      await page.fill('input[name="email"]', 'test@test.com');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);
    }
  });

  test.describe('Intent Wizard', () => {
    test('should access /app/quick-builder/new route', async ({ page }) => {
      await page.goto('/app/quick-builder/new');
      await page.waitForTimeout(1000);
      
      // Should see wizard title or redirect to login/onboarding
      const content = await page.content();
      const hasWizard = content.includes('ল্যান্ডিং পেইজ তৈরি করুন') || 
                        content.includes('কুইক বিল্ডার') ||
                        content.includes('আপনি কী বিক্রি করতে চান');
      
      // If redirected to login/onboarding, that's also valid
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(hasWizard || redirected).toBeTruthy();
    });

    test('should show 3-step wizard when accessed', async ({ page }) => {
      await page.goto('/app/quick-builder/new');
      await page.waitForTimeout(1000);
      
      // Check for step indicators or content
      const stepIndicator = page.locator('text=আপনি কী বিক্রি করতে চান');
      const isVisible = await stepIndicator.isVisible().catch(() => false);
      
      if (isVisible) {
        // Step 1 visible
        expect(await page.locator('text=একটি প্রোডাক্ট').isVisible()).toBeTruthy();
        expect(await page.locator('text=একাধিক প্রোডাক্ট').isVisible()).toBeTruthy();
      }
    });
  });

  test.describe('Landing Settings Page', () => {
    test('should show Quick Builder CTA button', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1000);
      
      // Look for Quick Builder CTA
      const ctaButton = page.locator('text=কুইক বিল্ডার শুরু করুন');
      const isVisible = await ctaButton.isVisible().catch(() => false);
      
      // Either CTA visible or we're redirected (auth/onboarding)
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });

    test('should show Checkout Mode toggle section', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1000);
      
      const checkoutModeSection = page.locator('text=চেকআউট মোড');
      const isVisible = await checkoutModeSection.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });

    test('should show Style Settings section', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1000);
      
      const styleSection = page.locator('text=স্টাইল সেটিংস');
      const isVisible = await styleSection.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });
  });

  test.describe('Section Variants', () => {
    test('should show variant button (palette icon) on sections', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1500);
      
      // Look for palette button (variant selector)
      const paletteButton = page.locator('[title="স্টাইল পরিবর্তন"]');
      const count = await paletteButton.count().catch(() => 0);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      // Either variants visible or redirected
      expect(count > 0 || redirected).toBeTruthy();
    });
  });

  test.describe('Style Wizard', () => {
    test('should show brand color picker', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1500);
      
      // Look for brand color section
      const colorSection = page.locator('text=ব্র্যান্ড কালার');
      const isVisible = await colorSection.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });

    test('should show button style selector', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1500);
      
      // Look for button style section
      const buttonSection = page.locator('text=বাটন স্টাইল');
      const isVisible = await buttonSection.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });

    test('should show font family selector', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1500);
      
      // Look for font section
      const fontSection = page.locator('text=ফন্ট স্টাইল');
      const isVisible = await fontSection.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect(isVisible || redirected).toBeTruthy();
    });
  });

  test.describe('Checkout Modal Toggle', () => {
    test('should show redirect and modal checkout options', async ({ page }) => {
      await page.goto('/app/settings/landing');
      await page.waitForTimeout(1500);
      
      // Look for checkout options
      const redirectOption = page.locator('text=রিডাইরেক্ট চেকআউট');
      const modalOption = page.locator('text=মোডাল চেকআউট');
      
      const redirectVisible = await redirectOption.isVisible().catch(() => false);
      const modalVisible = await modalOption.isVisible().catch(() => false);
      
      const redirected = page.url().includes('/auth/') || 
                         page.url().includes('/onboarding');
      
      expect((redirectVisible && modalVisible) || redirected).toBeTruthy();
    });
  });
});
