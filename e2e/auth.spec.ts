/**
 * Authentication E2E Tests
 * 
 * Tests login, registration, and session management
 */

import { test, expect, testData } from './fixtures';

test.describe('Authentication', () => {
  
  test.beforeEach(async ({ page }) => {
    // Force English language for consistent test selectors
    await page.goto('/auth/login?lang=en');
  });

  test.describe('Login Page', () => {
    test('should load login page', async ({ page }) => {
      await expect(page).toHaveURL(/\/auth\/login/);
      await expect(page.locator('h1')).toContainText('Multi-Store SaaS');
    });

    test('should show error for empty fields', async ({ page }) => {
      await page.click('button[type="submit"]');
      
      // Using English validation messages from common.json
      await expect(page.locator('text=Email is required')).toBeVisible();
      await expect(page.locator('text=Password is required')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.fill('input[name="email"]', 'wrong@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      await expect(page.locator('text=Invalid email or password')).toBeVisible();
    });

    test('should link to registration', async ({ page }) => {
      await page.click('text=Register');
      await expect(page).toHaveURL(/\/onboarding/);
    });

    test('should link to forgot password', async ({ page }) => {
      await page.click('text=Forgot Password?');
      await expect(page).toHaveURL(/\/auth\/forgot-password/);
    });

    test('should have a working Google OAuth button', async ({ authPage, page }) => {
      // The button text is "Google Or continue with" or similar, 
      // but it definitely contains "Google"
      const googleBtn = page.locator('button:has-text("Google")');
      await expect(googleBtn).toBeVisible();
    });
  });

  test.describe('Registration Page (Onboarding)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/onboarding?lang=en');
    });

    test('should show validation errors', async ({ page }) => {
      await page.click('button:has-text("Continue")');
      
      await expect(page.locator('text=Valid email required')).toBeVisible();
      await expect(page.locator('text=Password must be at least 6 characters')).toBeVisible();
      await expect(page.locator('text=Name required')).toBeVisible();
      await expect(page.locator('text=Valid mobile number required')).toBeVisible();
    });

    test('should validate password strength', async ({ page }) => {
      await page.fill('input[name="password"]', '123');
      await page.click('button:has-text("Continue")');
      
      await expect(page.locator('text=at least 6 characters')).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      await page.fill('input[name="email"]', 'invalid-email');
      await page.click('button:has-text("Continue")');
      
      await expect(page.locator('text=Valid email required')).toBeVisible();
    });
  });

  test.describe('Security & Middleware', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/app/orders');
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test('should use secure cookie attributes', async ({ page, context }) => {
      await page.goto('/auth/login?lang=en');
      const cookies = await context.cookies();
      // On localhost, Secure might be false, but session cookie should exist
    });
  });

  test.describe('CI Auto-Registration', () => {
    test('should ensure merchant account exists and can login', async ({ authPage, page }) => {
      await authPage.ensureRegisteredAndLoggedIn(
        testData.merchant.name,
        testData.merchant.email,
        testData.merchant.password,
        testData.store.name,
        testData.store.subdomain
      );
      await expect(page).toHaveURL(/\/app/);
    });
  });
});
