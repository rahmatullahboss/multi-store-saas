/**
 * v1/routes/webhooks.ts — Public API: Webhook Management
 * GET    /api/v1/webhooks       — list webhooks
 * POST   /api/v1/webhooks       — create webhook
 * DELETE /api/v1/webhooks/:id   — delete webhook
 */

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { requireScopes } from '@server/middleware/api-key-auth';
import { webhooks as webhooksTable } from '@db/schema';

export const webhooksRouter = new Hono<{ Bindings: Env }>();

const VALID_TOPICS = [
  'order/created', 'order/updated', 'order/cancelled', 'order/fulfilled',
  'product/created', 'product/updated', 'product/deleted',
  'customer/created', 'customer/updated',
  'inventory/updated',
] as const;

const CreateWebhookSchema = z.object({
  url:    z.string().url('Must be a valid HTTPS URL').refine(u => u.startsWith('https://'), 'URL must use HTTPS'),
  events: z.array(z.enum(VALID_TOPICS)).min(1, 'At least one event is required'),
  secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
});

// GET /api/v1/webhooks
webhooksRouter.get('/', requireScopes(['manage_webhooks']), async (c) => {
  const storeId = c.var.apiKey.storeId;
  const db = drizzle(c.env.DB);

  const rows = await db
    .select({
      id:           webhooksTable.id,
      url:          webhooksTable.url,
      topic:        webhooksTable.topic,
      events:       webhooksTable.events,
      isActive:     webhooksTable.isActive,
      failureCount: webhooksTable.failureCount,
      createdAt:    webhooksTable.createdAt,
    })
    .from(webhooksTable)
    .where(eq(webhooksTable.storeId, storeId));

  return c.json({ success: true, data: rows });
});

// POST /api/v1/webhooks
webhooksRouter.post(
  '/',
  requireScopes(['manage_webhooks']),
  zValidator('json', CreateWebhookSchema),
  async (c) => {
    const { url, events, secret } = c.req.valid('json');
    const storeId = c.var.apiKey.storeId;
    const db = drizzle(c.env.DB);

    // Generate secret if not provided
    const webhookSecret = secret ?? generateWebhookSecret();

    const result = await db
      .insert(webhooksTable)
      .values({
        storeId,
        url,
        topic: events[0], // primary topic (backward compat)
        events: JSON.stringify(events),
        secret: webhookSecret,
        isActive: true,
        failureCount: 0,
      })
      .returning({
        id:       webhooksTable.id,
        url:      webhooksTable.url,
        events:   webhooksTable.events,
        isActive: webhooksTable.isActive,
      });

    return c.json({
      success: true,
      data: result[0],
      // Return secret ONCE — not stored in future responses
      secret: webhookSecret,
      message: 'Save this secret — it will not be shown again.',
    }, 201);
  }
);

// DELETE /api/v1/webhooks/:id
webhooksRouter.delete('/:id', requireScopes(['manage_webhooks']), async (c) => {
  const id = parseInt(c.req.param('id'), 10);
  if (isNaN(id)) return c.json({ success: false, error: 'invalid_id', message: 'Webhook ID must be a number' }, 400);

  const storeId = c.var.apiKey.storeId;
  const db = drizzle(c.env.DB);

  const result = await db
    .delete(webhooksTable)
    .where(and(eq(webhooksTable.id, id), eq(webhooksTable.storeId, storeId)));

  // D1 result has meta.changes
  if ((result as unknown as { meta: { changes: number } }).meta?.changes === 0) {
    return c.json({ success: false, error: 'not_found', message: `Webhook ${id} not found` }, 404);
  }

  return c.json({ success: true, message: `Webhook ${id} deleted` });
});

function generateWebhookSecret(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return 'whsec_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
}
