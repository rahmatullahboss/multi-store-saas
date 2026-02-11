import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { z } from 'zod';
import { createDb } from '~/lib/db.server';
import { products, stores } from '@db/schema';

function getEnvValue(env: unknown, key: string): string | undefined {
  const v = (env as Record<string, unknown> | undefined)?.[key];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

function isE2EEnabled(env: unknown): boolean {
  // Hard gate: must be explicitly enabled.
  const enabled = getEnvValue(env, 'E2E_ENABLED') ?? process.env.E2E_ENABLED;
  return enabled === '1';
}

function getE2EToken(env: unknown): string | undefined {
  return getEnvValue(env, 'E2E_TOKEN') ?? process.env.E2E_TOKEN;
}

const SeedRequestSchema = z
  .object({
    templateId: z.string().min(1).optional(),
    storeName: z.string().min(1).optional(),
    productTitle: z.string().min(1).optional(),
    inventory: z.number().int().min(0).max(100000).optional(),
  })
  .strict()
  .optional();

/**
 * E2E-only seed endpoint.
 *
 * Security model:
 * - Returns 404 unless `E2E_ENABLED=1` and `x-e2e-token` matches `E2E_TOKEN`.
 * - Safe to keep deployed; production will not set these env vars.
 */
export async function action({ request, context }: ActionFunctionArgs) {
  const env = (context as any)?.cloudflare?.env;

  if (!isE2EEnabled(env)) {
    return new Response('Not Found', { status: 404 });
  }

  const token = getE2EToken(env);
  const headerToken = request.headers.get('x-e2e-token') ?? '';
  if (!token || headerToken !== token) {
    return new Response('Not Found', { status: 404 });
  }

  const body = SeedRequestSchema.parse(await request.json().catch(() => undefined)) ?? {};
  const templateId = body.templateId ?? 'starter-store';

  const d1 = (context as any)?.cloudflare?.env?.DB as D1Database | undefined;
  if (!d1) {
    return json(
      { ok: false, error: 'DB binding not available (expected context.cloudflare.env.DB)' },
      { status: 500 }
    );
  }

  const db = createDb(d1);

  const unique = Math.random().toString(36).slice(2, 10);
  const subdomain = `e2e-${unique}`;
  const storeName = body.storeName ?? `E2E Store ${unique}`;
  const productTitle = body.productTitle ?? `E2E Product ${unique}`;
  const inventory = body.inventory ?? 50;

  // Minimal store config: enable storefront + set WhatsApp/phone so floating buttons can render.
  const themeConfig = JSON.stringify({
    storeTemplateId: templateId,
    // IMPORTANT: leave sections undefined so templates use default sections (avoid empty sections rendering blank).
  });
  const businessInfo = JSON.stringify({ phone: '01712345678' });
  const socialLinks = JSON.stringify({ whatsapp: '01712345678' });

  const insertedStore = await db
    .insert(stores)
    .values({
      name: storeName,
      subdomain,
      storeEnabled: true,
      themeConfig,
      businessInfo,
      socialLinks,
      defaultLanguage: 'bn',
      currency: 'BDT',
      onboardingStatus: 'completed',
      setupStep: 999,
      isActive: true,
    })
    .returning({ id: stores.id });

  const storeId = insertedStore[0]?.id;
  if (!storeId) {
    return json({ ok: false, error: 'Failed to create store' }, { status: 500 });
  }

  const insertedProduct = await db
    .insert(products)
    .values({
      storeId,
      title: productTitle,
      description: 'Seeded product for Playwright E2E.',
      price: 499,
      compareAtPrice: 599,
      inventory,
      isPublished: true,
      imageUrl:
        'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/products/seeded-placeholder.webp',
      images: JSON.stringify([
        'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/products/seeded-placeholder.webp',
      ]),
      category: 'e2e',
      tags: JSON.stringify(['e2e', 'seed']),
    })
    .returning({ id: products.id });

  const productId = insertedProduct[0]?.id;
  if (!productId) {
    return json({ ok: false, error: 'Failed to create product' }, { status: 500 });
  }

  return json({
    ok: true,
    storeId,
    subdomain,
    productId,
    productTitle,
    templateId,
  });
}


export default function() {}
