/**
 * Stores API Routes
 * 
 * Store management endpoints (admin only in production).
 */

import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores, type NewStore } from '@db/schema';
import type { TenantEnv, TenantContext } from '../middleware/tenant';

type StoresContext = {
  Bindings: TenantEnv;
  Variables: TenantContext;
};

export const storesApi = new Hono<StoresContext>();

/**
 * GET /api/stores/current
 * Get current store details
 */
storesApi.get('/current', async (c) => {
  const store = c.get('store');
  
  return c.json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      planType: store.planType,
      logo: store.logo,
      theme: store.theme,
      currency: store.currency,
    },
  });
});

/**
 * PUT /api/stores/current
 * Update current store settings
 */
storesApi.put('/current', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB);
  const body = await c.req.json<Partial<NewStore>>();
  
  // Only allow updating specific fields
  const allowedUpdates: (keyof NewStore)[] = ['name', 'logo', 'theme', 'currency'];
  const updateData: Partial<NewStore> = {};
  
  for (const key of allowedUpdates) {
    if (key in body) {
      (updateData as Record<string, unknown>)[key] = body[key as keyof typeof body];
    }
  }
  
  const result = await db
    .update(stores)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId))
    .returning();
  
  return c.json({ store: result[0] });
});

/**
 * POST /api/stores
 * Create a new store (platform admin endpoint)
 * 
 * Note: In production, this should be protected by admin authentication
 */
storesApi.post('/', async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json<NewStore>();
  
  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(body.subdomain)) {
    return c.json({ 
      error: 'Invalid subdomain format. Use only lowercase letters, numbers, and hyphens.' 
    }, 400);
  }
  
  // Check if subdomain is taken
  const existing = await db
    .select()
    .from(stores)
    .where(eq(stores.subdomain, body.subdomain))
    .limit(1);
  
  if (existing[0]) {
    return c.json({ error: 'Subdomain already taken' }, 409);
  }
  
  // Check custom domain if provided
  if (body.customDomain) {
    const existingDomain = await db
      .select()
      .from(stores)
      .where(eq(stores.customDomain, body.customDomain))
      .limit(1);
    
    if (existingDomain[0]) {
      return c.json({ error: 'Custom domain already in use' }, 409);
    }
  }
  
  const result = await db
    .insert(stores)
    .values({
      ...body,
      isActive: true,
    })
    .returning();
  
  return c.json({ store: result[0] }, 201);
});

/**
 * PUT /api/stores/:id/domain
 * Update store custom domain (platform admin endpoint)
 */
storesApi.put('/:id/domain', async (c) => {
  const storeId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  const { customDomain } = await c.req.json<{ customDomain: string | null }>();
  
  // Check if domain is already in use
  if (customDomain) {
    const existing = await db
      .select()
      .from(stores)
      .where(eq(stores.customDomain, customDomain))
      .limit(1);
    
    if (existing[0] && existing[0].id !== storeId) {
      return c.json({ error: 'Custom domain already in use' }, 409);
    }
  }
  
  const result = await db
    .update(stores)
    .set({
      customDomain,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId))
    .returning();
  
  if (!result[0]) {
    return c.json({ error: 'Store not found' }, 404);
  }
  
  return c.json({ store: result[0] });
});
