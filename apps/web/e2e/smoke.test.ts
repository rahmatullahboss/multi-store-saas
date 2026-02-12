import { test, expect } from './fixtures';

test.describe('Critical Path: Seeded Storefront', () => {
  const seedEndpoint = '/api/e2e/seed?_data=routes/api.e2e.seed';
  const createOrderEndpoint = '/api/create-order?_data=routes/api.create-order';

  test('seed store + product, then render product + cart', async ({ page, request }, testInfo) => {
    const baseURL = String(testInfo.project.use.baseURL || 'http://localhost:5173');
    const port = new URL(baseURL).port || '5173';
    const token = process.env.E2E_TOKEN || 'local-e2e-token';

    const seedRes = await request.post(seedEndpoint, {
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

  test('idempotent order creation: double submit returns the same order', async ({
    request,
  }) => {
    const token = process.env.E2E_TOKEN || 'local-e2e-token';

    const seedRes = await request.post(seedEndpoint, {
      headers: { 'x-e2e-token': token },
      data: { templateId: 'starter-store' },
    });
    expect(seedRes.ok()).toBeTruthy();
    const seeded = (await seedRes.json()) as {
      ok: boolean;
      storeId: number;
      subdomain: string;
      productId: number;
      productTitle: string;
    };
    expect(seeded.ok).toBeTruthy();

    const payload = {
      store_id: seeded.storeId,
      product_id: seeded.productId,
      customer_name: 'টেস্ট কাস্টমার',
      phone: '01712345678',
      address: 'ঢাকা, মিরপুর ১০, টেস্ট ঠিকানা',
      division: 'dhaka',
      quantity: 1,
      payment_method: 'cod',
    };

    const first = await request.post(createOrderEndpoint, { data: payload });
    expect(first.status()).toBe(200);
    const firstJson = (await first.json()) as { success: boolean; orderId?: number; orderNumber?: string };
    expect(firstJson.success).toBe(true);
    expect(typeof firstJson.orderId).toBe('number');

    // Second submit: can be an idempotent success OR "processing" (409) depending on timing.
    const second = await request.post(createOrderEndpoint, { data: payload });

    if (second.status() === 200) {
      const secondJson = (await second.json()) as { success: boolean; orderId?: number; isIdempotent?: boolean };
      expect(secondJson.success).toBe(true);
      expect(secondJson.orderId).toBe(firstJson.orderId);
      return;
    }

    // Processing / duplicate protection path.
    expect([409, 429]).toContain(second.status());

    // Poll until the API returns the existing order (idempotent) or timeout.
    let finalJson: any | null = null;
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 500));
      const res = await request.post(createOrderEndpoint, { data: payload });
      if (res.status() === 200) {
        finalJson = await res.json();
        break;
      }
    }

    expect(finalJson?.success).toBe(true);
    expect(finalJson?.orderId).toBe(firstJson.orderId);
  });

  test('checkout should be blocked when stock is 0', async ({ request }) => {
    const token = process.env.E2E_TOKEN || 'local-e2e-token';

    const seedRes = await request.post(seedEndpoint, {
      headers: { 'x-e2e-token': token },
      data: { templateId: 'starter-store', inventory: 0 },
    });
    expect(seedRes.ok()).toBeTruthy();
    const seeded = (await seedRes.json()) as {
      ok: boolean;
      storeId: number;
      productId: number;
      productTitle: string;
    };
    expect(seeded.ok).toBe(true);

    const orderRes = await request.post(createOrderEndpoint, {
      data: {
        store_id: seeded.storeId,
        product_id: seeded.productId,
        customer_name: 'টেস্ট কাস্টমার',
        phone: '01712345679',
        address: 'ঢাকা, টেস্ট ঠিকানা',
        division: 'dhaka',
        quantity: 1,
        payment_method: 'cod',
      },
    });

    expect(orderRes.status()).toBe(400);
    const body = (await orderRes.json()) as { success: boolean; error?: string };
    expect(body.success).toBe(false);
    expect(body.error || '').toMatch(/Stock unavailable/i);
  });
});
