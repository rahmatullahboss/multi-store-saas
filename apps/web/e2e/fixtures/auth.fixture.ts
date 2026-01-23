import { test as base, expect } from '@playwright/test';

/**
 * E2E Auth Fixture
 * 
 * Provides authenticated test context for admin flows.
 * Uses session cookie approach matching remix-auth-google.
 */

// Extended test with authentication
export const test = base.extend<{
  authenticatedPage: typeof base;
}>({
  authenticatedPage: async ({ page }, runTest) => {
    // For E2E testing, we mock or bypass OAuth
    // Option 1: Set test session cookie directly
    // Option 2: Use a test-only login endpoint
    
    // Set mock session cookie (update path/values per your session config)
    await page.context().addCookies([
      {
        name: '__session',
        value: 'test-session-value', // Generate or use fixed test value
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
      },
    ]);
    
    await runTest(base);
  },
});

// Re-export expect for convenience
export { expect };

/**
 * Test User Data
 * Use these for consistent test scenarios
 */
export const TEST_USERS = {
  admin: {
    email: 'test-admin@example.com',
    name: 'Test Admin',
  },
  customer: {
    email: 'test-customer@example.com',
    name: 'Test Customer',
    phone: '01700000000',
  },
};

/**
 * Test Store Data
 */
export const TEST_STORES = {
  default: {
    name: 'Test Store',
    subdomain: 'test-store',
  },
};
