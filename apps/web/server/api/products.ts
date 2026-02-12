/**
 * Products API Routes
 * 
 * CRUD operations for products with automatic store_id filtering.
 */

import { Hono } from 'hono';
import { eq, and, desc, like } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products, type NewProduct, type Product } from '@db/schema';
import type { TenantEnv, TenantContext } from '../middleware/tenant';
import { KVCache, CACHE_TTL } from '../../app/services/kv-cache.server';
import { checkUsageLimit } from '../../app/utils/plans.server';

type ProductsContext = {
  Bindings: TenantEnv;
  Variables: TenantContext;
};

export const productsApi = new Hono<ProductsContext>();

/**
 * GET /api/products
 * List all products for the current store
 */
productsApi.get('/', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB);
  
  // Query params
  const category = c.req.query('category');
  const search = c.req.query('search');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const offset = parseInt(c.req.query('offset') || '0', 10);
  
  // Only cache unfiltered requests (most common)
  const canCache = !category && !search && offset === 0 && limit === 50;
  const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;
  
  // Try cache first for default queries
  if (canCache && kvCache) {
    const cached = await kvCache.getProducts<Product>(storeId);
    if (cached) {
      console.log(`[PRODUCTS] KV Cache hit for store ${storeId}`);
      return c.json({
        products: cached,
        pagination: { limit, offset, hasMore: cached.length === limit },
        cached: true,
      });
    }
  }
  
  // Build query with store_id filter (crucial for multi-tenancy!)
  const query = db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined,
        search ? like(products.title, `%${search}%`) : undefined
      )
    )
    .orderBy(desc(products.createdAt))
    .limit(limit)
    .offset(offset);
  
  const result = await query;
  
  // Cache the result for default queries
  if (canCache && kvCache && result.length > 0) {
    kvCache.cacheProducts(storeId, result).catch(() => {});
  }
  
  return c.json({
    products: result,
    pagination: {
      limit,
      offset,
      hasMore: result.length === limit,
    },
  });
});

/**
 * GET /api/products/:id
 * Get a single product by ID (filtered by store_id)
 */
productsApi.get('/:id', async (c) => {
  const storeId = c.get('storeId');
  const productId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  
  const result = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId) // Always filter by store!
      )
    )
    .limit(1);
  
  if (!result[0]) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  return c.json({ product: result[0] });
});

/**
 * POST /api/products
 * Create a new product for the current store
 */
productsApi.post('/', async (c) => {
  const storeId = c.get('storeId');
  const db = drizzle(c.env.DB);
  const body = await c.req.json<Omit<NewProduct, 'storeId'>>();

  const limitCheck = await checkUsageLimit(c.env.DB, storeId, 'product');
  if (!limitCheck.allowed) {
    return c.json(
      {
        error: limitCheck.error?.message ?? 'Product limit reached. Upgrade to add more products.',
        code: 'LIMIT_REACHED_PRODUCT',
        limit: limitCheck.error?.limit,
        current: limitCheck.error?.current,
      },
      402
    );
  }
  
  const result = await db
    .insert(products)
    .values({
      ...body,
      storeId, // Always set store_id from context!
    })
    .returning();
  
  // Invalidate products cache
  const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;
  if (kvCache) {
    kvCache.invalidateProducts(storeId).catch(() => {});
  }
  
  return c.json({ product: result[0] }, 201);
});

/**
 * PUT /api/products/:id
 * Update a product (with store_id verification)
 */
productsApi.put('/:id', async (c) => {
  const storeId = c.get('storeId');
  const productId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  const body = await c.req.json<Partial<NewProduct>>();
  
  // Remove storeId from body if present to prevent store switching
  const { storeId: _, ...updateData } = body as NewProduct & { storeId?: number };
  
  const result = await db
    .update(products)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId) // Verify ownership!
      )
    )
    .returning();
  
  if (!result[0]) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  // Invalidate cache on update
  const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;
  if (kvCache) {
    kvCache.invalidateProducts(storeId, productId).catch(() => {});
  }
  
  return c.json({ product: result[0] });
});

/**
 * DELETE /api/products/:id
 * Delete a product (with store_id verification)
 */
productsApi.delete('/:id', async (c) => {
  const storeId = c.get('storeId');
  const productId = parseInt(c.req.param('id'), 10);
  const db = drizzle(c.env.DB);
  
  const result = await db
    .delete(products)
    .where(
      and(
        eq(products.id, productId),
        eq(products.storeId, storeId) // Verify ownership!
      )
    )
    .returning();
  
  if (!result[0]) {
    return c.json({ error: 'Product not found' }, 404);
  }
  
  // Invalidate cache on delete
  const kvCache = c.env.STORE_CACHE ? new KVCache(c.env.STORE_CACHE) : null;
  if (kvCache) {
    kvCache.invalidateProducts(storeId, productId).catch(() => {});
  }
  
  return c.json({ success: true });
});
