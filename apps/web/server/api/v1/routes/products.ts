/**
 * v1/routes/products.ts — Public API: Products
 * GET /api/v1/products        — list products (paginated)
 * GET /api/v1/products/:id    — get single product
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, asc, desc, gt, lt, sql } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireScopes } from '@server/middleware/api-key-auth';
import { products as productsTable } from '@db/schema';

export const productsRouter = new Hono<{ Bindings: Env }>();

// ─── Validation ───────────────────────────────────────────────────────────────

const ListProductsSchema = z.object({
  limit:  z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().max(64).optional(),
  sort:      z.enum(['created_asc', 'created_desc', 'price_asc', 'price_desc', 'title_asc']).default('created_desc'),
  published: z.enum(['true', 'false']).optional(),
});

// ─── Safe sort map (no dynamic key access) ────────────────────────────────────

const SORT_MAP = {
  created_asc:  () => asc(productsTable.createdAt),
  created_desc: () => desc(productsTable.createdAt),
  price_asc:    () => asc(productsTable.price),
  price_desc:   () => desc(productsTable.price),
  title_asc:    () => asc(productsTable.title),
} as const;

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/v1/products
productsRouter.get(
  '/',
  requireScopes(['read_products']),
  zValidator('query', ListProductsSchema),
  async (c) => {
    const { limit, cursor, sort, published } = c.req.valid('query');
    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    // Build WHERE clauses
    const conditions = [eq(productsTable.storeId, storeId)];
    if (published !== undefined) conditions.push(eq(productsTable.isPublished, published === 'true'));

    // Cursor pagination (cursor = base64 encoded last id)
    if (cursor) {
      try {
        const lastId = parseInt(atob(cursor), 10);
        if (!isNaN(lastId)) {
          const isAsc = sort.endsWith('_asc');
          conditions.push(isAsc ? gt(productsTable.id, lastId) : lt(productsTable.id, lastId));
        }
      } catch {
        return c.json({ success: false, error: 'invalid_cursor', message: 'Invalid cursor value' }, 400);
      }
    }

    const orderBy = SORT_MAP[sort]();

    const rows = await db
      .select({
        id:           productsTable.id,
        title:        productsTable.title,
        price:        productsTable.price,
        compareAtPrice: productsTable.compareAtPrice,
        isPublished:  productsTable.isPublished,
        inventory:    productsTable.inventory,
        imageUrl:     productsTable.imageUrl,
        category:     productsTable.category,
        sku:          productsTable.sku,
        createdAt:    productsTable.createdAt,
        updatedAt:    productsTable.updatedAt,
      })
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit + 1); // fetch one extra to determine hasMore

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && data.length > 0
      ? btoa(String(data[data.length - 1].id))
      : null;

    return c.json({
      success: true,
      data,
      pagination: {
        limit,
        has_more: hasMore,
        next_cursor: nextCursor,
      },
    });
  }
);

// GET /api/v1/products/:id
productsRouter.get(
  '/:id',
  requireScopes(['read_products']),
  async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) {
      return c.json({ success: false, error: 'invalid_id', message: 'Product ID must be a number' }, 400);
    }

    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    const rows = await db
      .select()
      .from(productsTable)
      .where(and(eq(productsTable.id, id), eq(productsTable.storeId, storeId)))
      .limit(1);

    if (rows.length === 0) {
      return c.json({ success: false, error: 'not_found', message: `Product ${id} not found` }, 404);
    }

    return c.json({ success: true, data: rows[0] });
  }
);
