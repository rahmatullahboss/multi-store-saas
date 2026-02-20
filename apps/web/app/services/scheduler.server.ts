import type { Database } from '../lib/db.server';
import { abandonedCarts, customers, orders, shipments, stores } from '../../db/schema';
import { eq, and, lt, gt, not, like, notInArray } from 'drizzle-orm';
import { sendSmartNotification } from './messaging.server';
import { createEmailService } from './email.server';
import { getUnifiedStorefrontSettings } from './unified-storefront-settings.server';
import { createPathaoClient, PATHAO_STATUS_MAP } from './pathao.server';
import { createSteadfastClient, STEADFAST_STATUS_MAP } from './steadfast.server';
import { createRedXClient, REDX_STATUS_MAP } from './redx.server';

/**
 * SCHEDULER SERVICE
 * Handles background tasks like abandoned cart recovery, subscription checks, etc.
 * Now includes Lifecycle Marketing (Win-back, Review Requests).
 */

export async function runScheduledTasks(db: Database, env: Env) {
  const results = {
    abandonedCarts: 0,
    winbackCampaigns: 0,
    reviewRequests: 0,
    courierSync: 0,
    errors: [] as string[],
  };

  try {
    results.abandonedCarts = await processAbandonedCarts(db, env);
    results.winbackCampaigns = await processWinbackCampaigns(db, env);
    results.reviewRequests = await processReviewRequests(db, env);
    results.courierSync = await syncCourierStatuses(db);
  } catch (error: unknown) {
    console.error('[Scheduler] Error running tasks:', error);
    results.errors.push((error as Error).message);
  }

  return results;
}

// === ABANDONED CART RECOVERY ===

async function processAbandonedCarts(db: Database, env: Env) {
  // 1. Find carts abandoned > 1 hour ago AND < 24 hours ago (to avoid spamming old carts)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const targetCarts = await db.query.abandonedCarts.findMany({
    where: and(
      eq(abandonedCarts.status, 'abandoned'),
      eq(abandonedCarts.recoveryEmailSent, false),
      lt(abandonedCarts.abandonedAt, oneHourAgo), // older than 1 hour
      gt(abandonedCarts.abandonedAt, twentyFourHoursAgo) // newer than 24 hours
    ),
    with: {
      store: true, // Get store name/details
    },
    limit: 50, // Batch size
  });

  let processedCount = 0;

  for (const cart of targetCarts) {
    if (!cart.customerPhone) continue; // Skip if no phone number

    try {
      const storeUrl = cart.store.customDomain
        ? `https://${cart.store.customDomain}`
        : `https://${cart.store.subdomain}.ozzyl.com`;
      const cartUrl = `${storeUrl}/checkout?recovery=${cart.sessionId}`;

      // 2. Send Smart Notification (WhatsApp -> SMS)
      await sendSmartNotification(db, env, 0, cart.storeId, 'ABANDONED_CART', {
        phone: cart.customerPhone,
        customerName: cart.customerName || 'Guest',
        cartUrl,
        amount: cart.totalAmount,
        currency: cart.currency,
      });

      // 2b. Send recovery email if customer has email
      if (cart.customerEmail && !cart.customerEmail.includes('@phone.local')) {
        // Get unified settings for theme colors
        const unifiedSettings = await getUnifiedStorefrontSettings(db, cart.storeId, { env });
        const primaryColor = unifiedSettings.theme?.primary || undefined;

        const items = cart.cartItems ? JSON.parse(cart.cartItems) : [];

        const emailService = createEmailService(env.RESEND_API_KEY);
        await emailService.sendAbandonedCartRecovery({
          customerEmail: cart.customerEmail,
          customerName: cart.customerName || 'Guest',
          storeName: cart.store.name,
          cartUrl,
          currency: cart.currency || 'BDT',
          items,
          total: cart.totalAmount,
          storeLogo: cart.store.logo || undefined,
          primaryColor,
        });
      }

      // 3. Mark as sent
      await db
        .update(abandonedCarts)
        .set({
          recoveryEmailSent: true,
          recoveryEmailSentAt: new Date(),
        })
        .where(eq(abandonedCarts.id, cart.id));

      processedCount++;
    } catch (err) {
      console.error(`[Scheduler] Failed to process cart ${cart.id}:`, err);
    }
  }

  return processedCount;
}

// === WIN-BACK CAMPAIGN (30 Days Inactive) ===
async function processWinbackCampaigns(db: Database, env: Env) {
  // Find customers who haven't ordered in 30 days and haven't received winback msg
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const targetCustomers = await db
    .select()
    .from(customers)
    .where(
      and(
        lt(customers.lastOrderAt, thirtyDaysAgo),
        // We check tags to ensure we don't spam. Tag: 'winback_sent'
        not(like(customers.tags, '%winback_sent%'))
      )
    )
    .limit(20);

  let count = 0;
  for (const customer of targetCustomers) {
    if (!customer.phone) continue;

    try {
      await sendSmartNotification(db, env, customer.id, customer.storeId, 'WINBACK_OFFER', {
        phone: customer.phone,
        customerName: customer.name,
      });

      // Update Tag to prevent resending
      const newTags = customer.tags ? JSON.parse(customer.tags) : [];
      newTags.push('winback_sent');
      await db
        .update(customers)
        .set({ tags: JSON.stringify(newTags) })
        .where(and(eq(customers.id, customer.id), eq(customers.storeId, customer.storeId)));

      count++;
    } catch (e) {
      console.error(`[Scheduler] Winback error for ${customer.id}`, e);
    }
  }
  return count;
}

// === REVIEW REQUESTS (3 Days After Delivery) ===
// === review REQUESTS (3 Days After Delivery) ===
async function processReviewRequests(db: Database, env: Env) {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const recentDeliveries = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.status, 'delivered'),
        eq(orders.reviewRequestSent, false),
        lt(orders.updatedAt, threeDaysAgo)
      )
    )
    .limit(20);

  let count = 0;
  for (const order of recentDeliveries) {
    if (!order.customerPhone) continue;

    try {
      await sendSmartNotification(db, env, 0, order.storeId, 'REVIEW_REQUEST', {
        phone: order.customerPhone,
        customerName: order.customerName,
        reviewUrl: `https://store.com/orders/${order.orderNumber}/review`, // Placeholder
      });
      await db
        .update(orders)
        .set({ reviewRequestSent: true, reviewRequestSentAt: new Date() })
        .where(and(eq(orders.id, order.id), eq(orders.storeId, order.storeId)));
      count++;
    } catch (e) {
      console.error('[Scheduler] Review request error', e);
    }
  }
  return count;
}

// === COURIER STATUS AUTO-SYNC ===
/**
 * Automatically polls Pathao, Steadfast, and RedX for shipment status updates.
 * Runs every 30 minutes via the cron trigger in wrangler.toml.
 * Only processes active (non-terminal) shipments that have a tracking ID.
 */
async function syncCourierStatuses(db: Database): Promise<number> {
  const TERMINAL_STATUSES = ['delivered', 'cancelled', 'returned'];

  // Fetch all non-terminal shipments
  const activeShipments = await db.select({
      shipId: shipments.id,
      orderId: shipments.orderId,
      storeId: orders.storeId, // Joined to get storeId since shipments doesn't have it directly
      provider: shipments.courier, // It's named 'courier' in the schema, not 'provider'
      trackingId: shipments.trackingNumber, // It's named 'trackingNumber', not 'trackingId'
      currentStatus: shipments.status,
    })
    .from(shipments)
    .innerJoin(orders, eq(shipments.orderId, orders.id))
    .where(notInArray(shipments.status, TERMINAL_STATUSES as any))
    .limit(100);

  if (activeShipments.length === 0) return 0;

  // Group by storeId so we only fetch courier settings once per store
  const byStore = new Map<number, typeof activeShipments>();
  for (const s of activeShipments) {
    if (!s.trackingId) continue;
    const storeShipments = byStore.get(s.storeId) ?? [];
    storeShipments.push(s);
    byStore.set(s.storeId, storeShipments);
  }

  let syncedCount = 0;

  for (const [storeId, storeShipments] of byStore) {
    // Load courier credentials for this store
    const storeRow = await db
      .select({ courierSettings: stores.courierSettings })
      .from(stores)
      .where(eq(stores.id, storeId))
      .get();

    if (!storeRow?.courierSettings) continue;

    let courierConfig: Record<string, unknown>;
    try {
      courierConfig = JSON.parse(storeRow.courierSettings as string);
    } catch {
      continue;
    }

    const provider = (courierConfig.provider as string) || '';

    for (const shipment of storeShipments) {
      if (!shipment.trackingId) continue;

      try {
        let newStatus: string | null = null;

        // --- Pathao ---
        if (provider === 'pathao' && courierConfig.pathao) {
          const creds = courierConfig.pathao as {
            clientId: string;
            clientSecret: string;
            username: string;
            password: string;
            baseUrl?: string;
          };
          const client = createPathaoClient(creds);
          const statusResult = await client.getOrderStatus(shipment.trackingId);
          newStatus = PATHAO_STATUS_MAP[statusResult.order_status] ?? null;
        }

        // --- Steadfast ---
        else if (provider === 'steadfast' && courierConfig.steadfast) {
          const creds = courierConfig.steadfast as { apiKey: string; secretKey: string };
          const client = createSteadfastClient(creds);
          const statusResult = await client.checkStatus(shipment.trackingId);
          newStatus = STEADFAST_STATUS_MAP[statusResult.delivery_status] ?? null;
        }

        // --- RedX ---
        else if (provider === 'redx' && courierConfig.redx) {
          const creds = courierConfig.redx as { apiKey: string; baseUrl: string };
          const client = createRedXClient({ accessToken: creds.apiKey, baseUrl: creds.baseUrl });
          const trackingInfo = await client.trackParcel(shipment.trackingId);
          newStatus = REDX_STATUS_MAP[trackingInfo.current_status] ?? null;
        }

        if (!newStatus || newStatus === shipment.currentStatus) continue;

        // Update shipment record
        await db
          .update(shipments)
          .set({ status: newStatus as typeof shipment.currentStatus, updatedAt: new Date() })
          .where(eq(shipments.id, shipment.shipId));

        // Update order status
        const orderStatus =
          newStatus === 'delivered' ? 'delivered'
          : newStatus === 'returned' || newStatus === 'cancelled' ? 'returned'
          : 'shipped';

        await db
          .update(orders)
          .set({ courierStatus: newStatus as string, status: orderStatus, updatedAt: new Date() })
          .where(and(eq(orders.id, shipment.orderId), eq(orders.storeId, storeId)));

        syncedCount++;
        console.log(
          `[CourierSync] ${shipment.trackingId}: ${shipment.currentStatus} → ${newStatus}`
        );
      } catch (err) {
        console.error(`[CourierSync] Error syncing ${shipment.trackingId}:`, err);
      }
    }
  }

  return syncedCount;
}
