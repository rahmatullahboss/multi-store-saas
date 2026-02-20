import { chromium } from 'playwright';

export async function getSteadfastSessionCookies(email?: string, password?: string) {
  if (!email || !password) {
    throw new Error('Steadfast credentials required to generate a session block.');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    const page = await context.newPage();

    // 1. Navigate to Steadfast Login
    await page.goto('https://steadfast.com.bd/login', { waitUntil: 'networkidle' });

    // 2. Fill in Credentials
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);

    // 3. Submit Login Form
    // The button doesn't have a reliable ID, so we use text or generic submit
    await page.click('button:has-text("Login")');

    // Wait for navigation after login
    await page.waitForTimeout(3000); // Wait for the dashboard to load

    // 4. Retrieve Cookies
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((c) => c.name === 'steadfast_courier_session')?.value;
    const xsrfToken = cookies.find((c) => c.name === 'XSRF-TOKEN')?.value;

    if (!sessionCookie || !xsrfToken) {
      throw new Error('Failed to extract steadfast session cookies after login attempt.');
    }

    return {
      sessionCookie,
      xsrfToken,
    };
  } finally {
    await browser.close();
  }
}
