/**
 * v1/routes/orders.ts — Public API: Orders
 * GET  /api/v1/orders       — list orders (paginated)
 * GET  /api/v1/orders/:id   — get single order
 * POST /api/v1/orders/:id/fulfill — fulfill an order
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc, lt, gt } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireScopes } from '@server/middleware/api-key-auth';
import { orders as ordersTable } from '@db/schema';

export const ordersRouter = new Hono<{ Bindings: Env }>();

const ListOrdersSchema = z.object({
  limit:  z.coerce.number().min(1).max(100).default(20),
  cursor: z.string().max(64).optional(),
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']).optional(),
});

// GET /api/v1/orders
ordersRouter.get(
  '/',
  requireScopes(['read_orders']),
  zValidator('query', ListOrdersSchema),
  async (c) => {
    const { limit, cursor, status } = c.req.valid('query');
    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    const conditions = [eq(ordersTable.storeId, storeId)];
    if (status) conditions.push(eq(ordersTable.status, status));
    if (cursor) {
      try {
        const lastId = parseInt(atob(cursor), 10);
        if (!isNaN(lastId)) conditions.push(lt(ordersTable.id, lastId));
      } catch {
        return c.json({ success: false, error: 'invalid_cursor', message: 'Invalid cursor' }, 400);
      }
    }

    const rows = await db
      .select({
        id:            ordersTable.id,
        orderNumber:   ordersTable.orderNumber,
        status:        ordersTable.status,
        total:         ordersTable.total,
        subtotal:      ordersTable.subtotal,
        customerName:  ordersTable.customerName,
        customerEmail: ordersTable.customerEmail,
        customerPhone: ordersTable.customerPhone,
        paymentStatus: ordersTable.paymentStatus,
        paymentMethod: ordersTable.paymentMethod,
        createdAt:     ordersTable.createdAt,
        updatedAt:     ordersTable.updatedAt,
      })
      .from(ordersTable)
      .where(and(...conditions))
      .orderBy(desc(ordersTable.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore && data.length > 0
      ? btoa(String(data[data.length - 1].id))
      : null;

    return c.json({
      success: true,
      data,
      pagination: { limit, has_more: hasMore, next_cursor: nextCursor },
    });
  }
);

// GET /api/v1/orders/:id
ordersRouter.get(
  '/:id',
  requireScopes(['read_orders']),
  async (c) => {
    const id = parseInt(c.req.param('id'), 10);
    if (isNaN(id)) return c.json({ success: false, error: 'invalid_id', message: 'Order ID must be a number' }, 400);

    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    const rows = await db
      .select({
        id:            ordersTable.id,
        orderNumber:   ordersTable.orderNumber,
        status:        ordersTable.status,
        total:         ordersTable.total,
        subtotal:      ordersTable.subtotal,
        customerName:  ordersTable.customerName,
        customerEmail: ordersTable.customerEmail,
        customerPhone: ordersTable.customerPhone,
        paymentStatus: ordersTable.paymentStatus,
        paymentMethod: ordersTable.paymentMethod,
        createdAt:     ordersTable.createdAt,
        updatedAt:     ordersTable.updatedAt,
      })
      .from(ordersTable)
      .where(and(eq(ordersTable.id, id), eq(ordersTable.storeId, storeId)))
      .limit(1);

    if (rows.length === 0) return c.json({ success: false, error: 'not_found', message: `Order ${id} not found` }, 404);
    return c.json({ success: true, data: rows[0] });
  }
);
