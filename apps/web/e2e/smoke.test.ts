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

    // Remix dev server doesn't run the Worker/Hono hostname-based tenant resolver.
    // For deterministic E2E, use the supported `?store=<subdomain>` dev override.
    const origin = new URL(baseURL).origin;

    const productUrl = `${origin}/products/${seeded.productId}?store=${seeded.subdomain}`;
    const res = await page.goto(productUrl, { waitUntil: 'domcontentloaded' });
    expect(res?.ok()).toBeTruthy();

    // Product title should render (template markup can vary).
    await expect(page.getByText(seeded.productTitle).first()).toBeVisible();

    // Add to cart (button text can vary by template; support both BN/EN).
    const addToCartButton = page
      .getByRole('button', { name: /কার্টে যোগ করুন|Add to cart/i })
      .first();
    await expect(addToCartButton).toBeVisible();
  });
});
