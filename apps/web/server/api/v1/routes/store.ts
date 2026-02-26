/**
 * v1/routes/store.ts — Public API: Store Info
 * GET /api/v1/store — get public store info
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';

export const storeRouter = new Hono<{ Bindings: Env }>();

// GET /api/v1/store
storeRouter.get('/', async (c) => {
  const storeId = c.var.apiKey.storeId;
  const db = drizzle(c.env.DB);

  const rows = await db
    .select({
      id:           stores.id,
      name:         stores.name,
      subdomain:    stores.subdomain,
      customDomain: stores.customDomain,
      logo:         stores.logo,
      createdAt:    stores.createdAt,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  if (rows.length === 0) {
    return c.json({ success: false, error: 'not_found', message: 'Store not found' }, 404);
  }

  return c.json({ success: true, data: rows[0] });
});
