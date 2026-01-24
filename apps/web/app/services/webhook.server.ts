import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { webhooks, webhookDeliveryLogs } from '@db/schema';

/**
 * Generate a random secret for HMAC signing
 */
function generateSecret(length: number = 24): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Sign payload using HMAC SHA-256
 */
async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const msgData = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Register a new Webhook
 */
export async function registerWebhook(
  db: D1Database,
  storeId: number,
  url: string,
  topics: string[] = ['order.created']
) {
  const drizzleDb = drizzle(db);
  const secret = generateSecret();

  const result = await drizzleDb
    .insert(webhooks)
    .values({
      storeId,
      url,
      topic: topics[0] || 'order.created', // Schema uses single topic
      secret,
    })
    .returning();

  return result[0];
}

/**
 * Dispatch Webhook Event
 * (Fire and Forget - usually called via context.waitUntil)
 */
export async function dispatchWebhook(
  env: Env,
  storeId: number,
  topic: string,
  payload: Record<string, any>
) {
  const db = drizzle(env.DB);
  
  // 1. Get Active Webhooks for this Store
  const hooks = await db
    .select()
    .from(webhooks)
    .where(and(eq(webhooks.storeId, storeId), eq(webhooks.isActive, true)));

  if (hooks.length === 0) return;

  const payloadString = JSON.stringify(payload);

  // 2. Send to each URL
  const promises = hooks.map(async (hook) => {
    // Check if topic matches (schema uses single topic field)
    if (hook.topic !== topic) return;

    let statusCode: number | null = null;
    let responseBody: string | null = null;
    let success = false;
    let errorMessage: string | null = null;

    try {
      const signature = await signPayload(payloadString, hook.secret || '');
      
      const response = await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shop-Topic': topic,
          'X-Shop-Hmac-Sha256': signature,
          'X-Store-Id': storeId.toString(),
        },
        body: payloadString,
      });

      statusCode = response.status;
      responseBody = await response.text().catch(() => null);
      success = response.ok;

      if (!response.ok) {
        console.warn(`[Webhook Failed] ${hook.url} returned ${response.status}`);
        // Increment failure count
        await db
          .update(webhooks)
          .set({ failureCount: (hook.failureCount || 0) + 1 })
          .where(eq(webhooks.id, hook.id));

        // Disable if > 10 failures
        if ((hook.failureCount || 0) >= 10) {
          await db
            .update(webhooks)
            .set({ isActive: false })
            .where(eq(webhooks.id, hook.id));
        }
      } else {
        // Reset failure count on success
        if ((hook.failureCount || 0) > 0) {
          await db
            .update(webhooks)
            .set({ failureCount: 0 })
            .where(eq(webhooks.id, hook.id));
        }
      }
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`[Webhook Error] Failed to send to ${hook.url}`, err);
    }

    // Log the delivery attempt
    try {
      await db.insert(webhookDeliveryLogs).values({
        webhookId: hook.id,
        eventType: topic,
        payload: payloadString,
        statusCode,
        responseBody: responseBody?.substring(0, 500), // Limit response size
        success,
        errorMessage,
      });
    } catch (logErr) {
      console.error('[Webhook Log Error]', logErr);
    }
  });

  await Promise.all(promises);
}

