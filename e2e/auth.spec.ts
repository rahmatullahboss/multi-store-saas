/**
 * Authentication E2E Tests
 * 
 * Tests login, registration, and session management
 */

import { test, expect, testData } from './fixtures';

test.describe('Authentication', () => {
  
  test.describe('Login Page', () => {
    
    test('should load login page', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });
    
    test('should show validation errors for empty fields', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      // Click submit without filling
      await page.click('button[type="submit"]');
      
      // Should show validation errors
      await expect(page.locator('text=ইমেইল দিন')).toBeVisible();
    });
    
    test('should show error for invalid credentials', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      await page.fill('input[name="email"]', 'invalid@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error message
      await expect(page.locator('text=ইমেইল বা পাসওয়ার্ড ভুল')).toBeVisible({ timeout: 5000 });
    });
    
    test('should have Google OAuth button', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      await expect(page.locator('button:has-text("Google")')).toBeVisible();
    });
    
    test('should link to registration', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      await page.click('text=রেজিস্টার করুন');
      
      await expect(page).toHaveURL(/auth\/register/);
    });
    
    test('should link to forgot password', async ({ authPage, page }) => {
      await authPage.gotoLogin();
      
      await page.click('text=পাসওয়ার্ড ভুলে গেছেন');
      
      await expect(page).toHaveURL(/auth\/forgot-password/);
    });
  });
  
  test.describe('Registration Page', () => {
    
    test('should load registration page', async ({ authPage, page }) => {
      await authPage.gotoRegister();
      
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });
    
    test('should validate password strength', async ({ authPage, page }) => {
      await authPage.gotoRegister();
      
      await page.fill('input[name="password"]', 'weak');
      await page.click('button[type="submit"]');
      
      // Should show password strength warning
      await expect(page.locator('text=পাসওয়ার্ড কমপক্ষে')).toBeVisible();
    });
    
    test('should validate password confirmation', async ({ authPage, page }) => {
      await authPage.gotoRegister();
      
      await page.fill('input[name="password"]', 'StrongPass123');
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123');
      await page.click('button[type="submit"]');
      
      // Should show mismatch error
      await expect(page.locator('text=পাসওয়ার্ড মিলছে না')).toBeVisible();
    });
    
    test('should validate email format', async ({ authPage, page }) => {
      await authPage.gotoRegister();
      
      await page.fill('input[name="email"]', 'notanemail');
      await page.click('button[type="submit"]');
      
      // Should show email validation error
      await expect(page.locator('text=সঠিক ইমেইল')).toBeVisible();
    });
  });
  
  test.describe('Session Management', () => {
    test('should redirect to login when not authenticated', async ({ page }) => {
      await page.goto('/app');
      await expect(page).toHaveURL(/auth\/login/);
    });

    test('should have secure cookie attributes', async ({ page, context }) => {
      await page.goto('/');
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name.includes('session'));
      if (sessionCookie) {
        expect(sessionCookie.httpOnly).toBe(true);
        expect(sessionCookie.secure).toBe(true);
      }
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
