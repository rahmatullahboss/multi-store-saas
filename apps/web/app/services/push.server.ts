import webpush from 'web-push';
import { drizzle } from 'drizzle-orm/d1';
import { pushSubscriptions } from '@db/schema';
import { eq, and } from 'drizzle-orm';

export interface PushMessage {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushToCustomer(
  env: any,
  storeId: number,
  customerId: number,
  message: PushMessage
) {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn('[PUSH] VAPID keys not configured');
    return;
  }

  try {
    webpush.setVapidDetails(
      'mailto:contact@ozzyl.com',
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );

    const db = drizzle(env.DB);
    // In our schema, userId on pushSubscriptions can act as customerId for storefronts
    const subs = await db.select().from(pushSubscriptions).where(
      and(eq(pushSubscriptions.storeId, storeId), eq(pushSubscriptions.userId, customerId))
    );

    if (subs.length === 0) return;

    const payload = JSON.stringify({
      icon: message.icon || '/icons/icon-192x192.png',
      ...message,
    });

    await Promise.allSettled(
      subs.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[PUSH] Cleaning up expired subscription ${sub.id}`);
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.error('[PUSH] Send Error', error);
          }
        }
      })
    );
  } catch (e) {
    console.error('[PUSH] General Error', e);
  }
}

export async function sendPushToStore(
  env: any,
  storeId: number, 
  message: PushMessage
) {
  // Cloudflare Workers do not support Node's https.request used by web-push
  // Avoid noisy errors in Workers runtime
  const isCloudflareWorker = typeof (globalThis as any).WebSocketPair !== 'undefined';
  if (isCloudflareWorker) {
    console.warn('[PUSH] Skipping push in Workers runtime (web-push not supported)');
    return;
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn('[PUSH] VAPID keys not configured');
    return;
  }

  try {
    webpush.setVapidDetails(
      'mailto:contact@ozzyl.com',
      env.VAPID_PUBLIC_KEY,
      env.VAPID_PRIVATE_KEY
    );

    const db = drizzle(env.DB);
    const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.storeId, storeId));

    if (subs.length === 0) return;

    const payload = JSON.stringify({
    icon: message.icon || '/icons/icon-192x192.png',
    ...message,
  });

    await Promise.allSettled(
      subs.map(async (sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        };

        try {
          await webpush.sendNotification(pushSubscription, payload);
        } catch (error: any) {
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(`[PUSH] Cleaning up expired subscription ${sub.id}`);
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          } else {
            console.error('[PUSH] Send Error', error);
          }
        }
      })
    );
  } catch (e) {
    console.error('[PUSH] General Error', e);
  }
}

/**
 * Send a single push notification (Low-level)
 * Used when subscriptions are already fetched (e.g. api.create-order.ts)
 */
export async function sendPushNotification(
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushMessage | string,
  env: any
) {
  // Cloudflare Workers do not support Node's https.request used by web-push
  // Avoid noisy errors in Workers runtime
  const isCloudflareWorker = typeof (globalThis as any).WebSocketPair !== 'undefined';
  if (isCloudflareWorker) {
    console.warn('[PUSH] Skipping push in Workers runtime (web-push not supported)');
    return;
  }

  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn('[PUSH] VAPID keys not configured');
    return;
  }

  webpush.setVapidDetails(
    'mailto:contact@ozzyl.com',
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY
  );

  const body = typeof payload === 'string' ? payload : JSON.stringify(payload);

  try {
    await webpush.sendNotification(subscription, body);
  } catch (error: any) {
    if (error.statusCode === 410 || error.statusCode === 404) {
      console.log(`[PUSH] Subscription expired/invalid: ${subscription.endpoint.slice(0, 20)}...`);
      // Warning: We cannot delete from DB here easily without DB instance or ID.
      // Caller should handle cleanup if possible, or we ignore.
      // api.create-order.ts doesn't handle cleanup.
      // We'll just log.
    }
    throw error;
  }
}
