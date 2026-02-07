import { test, expect } from './fixtures';

test.describe('Critical Path: Seeded Storefront', () => {
  test('seed store + product, then render product + cart', async ({ page, request }, testInfo) => {
    const baseURL = String(testInfo.project.use.baseURL || 'http://localhost:5173');
    const port = new URL(baseURL).port || '5173';
    const token = process.env.E2E_TOKEN || 'local-e2e-token';

    const seedRes = await request.post('/api/e2e/seed', {
      headers: { 'x-e2e-token': token },
      data: { templateId: 'starter-store' },
    });
    expect(seedRes.ok()).toBeTruthy();
    const seeded = (await seedRes.json()) as {
      ok: boolean;
      subdomain: string;
      productId: number;
      productTitle: string;
    };
    expect(seeded.ok).toBeTruthy();

    const productUrls = [
      `http://${seeded.subdomain}.localhost:${port}/products/${seeded.productId}`,
      `http://${seeded.subdomain}.localhost:${port}/product/${seeded.productId}`,
    ];

    let navigated = false;
    for (const url of productUrls) {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
      if (res && res.ok()) {
        navigated = true;
        break;
      }
    }
    expect(navigated).toBeTruthy();

    // Product title should render (template markup can vary).
    await expect(page.getByText(seeded.productTitle).first()).toBeVisible();

    // Add to cart (button text can vary by template; support both BN/EN).
    const addToCartButton = page
      .getByRole('button', { name: /কার্টে যোগ করুন|Add to cart/i })
      .first();
    await expect(addToCartButton).toBeVisible();
    await addToCartButton.click();

    await page.goto(`http://${seeded.subdomain}.localhost:${port}/cart`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(page.getByText(seeded.productTitle)).toBeVisible();
  });
});
