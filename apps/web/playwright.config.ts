import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Test Configuration
 * 
 * Tests critical user flows:
 * - Store creation & setup
 * - Product management
 * - Customer checkout
 * - Order management
 */

const E2E_PORT = Number(process.env.E2E_PORT || 5174);
const E2E_BASE_URL = process.env.E2E_BASE_URL || `http://localhost:${E2E_PORT}`;

export default defineConfig({
  testDir: './e2e',
  
  // Run tests in parallel
  fullyParallel: true,
  
  // Fail the build on CI if test.only is left in code
  forbidOnly: !!process.env.CI,
  
  // Retry failed tests on CI
  retries: process.env.CI ? 2 : 0,
  
  // Parallel workers
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list'],
  ],
  
  // Shared settings
  use: {
    // Base URL for navigation
    baseURL: E2E_BASE_URL,

    // Stabilize page interactions when the dev server triggers a full reload (HMR/refresh).
    navigationTimeout: 30 * 1000,
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshots on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'on-first-retry',
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Accept downloads
    acceptDownloads: true,
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  
  // Web server configuration
  webServer: {
    command: 'npm run dev',
    url: E2E_BASE_URL,
    reuseExistingServer: false,
    timeout: 120 * 1000,
    // Environment variables for the web server process
    env: {
      ...process.env,
      E2E: '1',
      E2E_PORT: String(E2E_PORT),
      PORT: String(E2E_PORT),
      SESSION_SECRET: process.env.SESSION_SECRET || 'e2e-test-session-secret',
      COOKIE_SECRET: process.env.COOKIE_SECRET || 'e2e-test-cookie-secret',
      NODE_ENV: 'test',
    },
  },
  
  // Global timeout
  timeout: 120 * 1000,
  
  // Expect timeout
  expect: {
    timeout: 10 * 1000,
  },
});
