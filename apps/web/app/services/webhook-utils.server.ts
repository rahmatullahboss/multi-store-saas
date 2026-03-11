/**
 * Webhook Utilities
 *
 * Idempotency helpers for incoming webhook processing.
 * Prevents duplicate processing of payment webhooks (bKash, Stripe, couriers).
 */

import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { webhookEvents } from '@db/schema';

type WebhookProvider =
  | 'stripe'
  | 'bkash'
  | 'nagad'
  | 'sslcommerz'
  | 'steadfast'
  | 'pathao'
  | 'redx'
  | 'meta';

/**
 * Check if a webhook event has already been processed
 * @returns true if already processed, false if new
 */
export async function isWebhookProcessed(
  db: D1Database,
  provider: WebhookProvider,
  eventId: string
): Promise<boolean> {
  const drizzleDb = drizzle(db);

  const existing = await drizzleDb
    .select({ id: webhookEvents.id })
    .from(webhookEvents)
    .where(and(eq(webhookEvents.provider, provider), eq(webhookEvents.eventId, eventId)))
    .limit(1);

  return existing.length > 0;
}

/**
 * Mark a webhook event as processed
 * Call this AFTER successfully processing the event
 */
export async function markWebhookProcessed(
  db: D1Database,
  provider: WebhookProvider,
  eventId: string,
  eventType: string,
  payload?: Record<string, unknown>,
  storeId?: number
): Promise<void> {
  const drizzleDb = drizzle(db);

  await drizzleDb.insert(webhookEvents).values({
    storeId: storeId || null,
    provider,
    eventId,
    eventType,
    payloadJson: payload ? JSON.stringify(payload) : null,
    status: 'processed',
    processedAt: new Date(),
  });
}

/**
 * Check and mark atomically (best effort)
 * Returns true if this is a NEW event that should be processed
 * Returns false if already processed (skip)
 */
export async function checkAndMarkWebhook(
  db: D1Database,
  provider: WebhookProvider,
  eventId: string,
  eventType: string,
  payload?: Record<string, unknown>,
  storeId?: number
): Promise<{ isNew: boolean }> {
  const drizzleDb = drizzle(db);

  try {
    // Try to insert first (will fail if duplicate due to UNIQUE constraint)
    await drizzleDb.insert(webhookEvents).values({
      storeId: storeId || null,
      provider,
      eventId,
      eventType,
      payloadJson: payload ? JSON.stringify(payload) : null,
      status: 'processed',
      processedAt: new Date(),
    });

    return { isNew: true };
  } catch (error) {
    // Check if it's a duplicate key error
    if (error instanceof Error && error.message.includes('UNIQUE')) {
      return { isNew: false };
    }
    // For other errors, log and treat as new (fail-open for availability)
    console.error('[Webhook Dedupe] Insert failed:', error);
    return { isNew: true };
  }
}

/**
 * Generate idempotency key for checkout sessions
 * Based on: storeId + phone + first product + timestamp bucket (1 min) + random
 *
 * FIXED: Added random suffix to prevent collisions when user retries checkout
 * within the same time bucket. Previous 5-minute bucket caused duplicate key
 * errors when customers refreshed or retried checkout quickly.
 */
export function generateCheckoutIdempotencyKey(
  storeId: number,
  phone: string,
  productId: number
): string {
  // 1 minute time bucket (reduced from 5 min for faster turnover)
  const timeBucket = Math.floor(Date.now() / (60 * 1000));
  const normalized = phone.replace(/[^\d]/g, '').slice(-10);
  // Add random suffix to prevent collisions on retry
  const random = Math.random().toString(36).substring(2, 8);
  return `${storeId}-${normalized}-${productId}-${timeBucket}-${random}`;
}
