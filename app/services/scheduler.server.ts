import type { Database } from "../lib/db.server";
import { abandonedCarts, stores, customers, orders } from "../../db/schema";
import { eq, and, lt, gt, isNull, not, like } from "drizzle-orm";
import { sendSmartNotification } from "./messaging.server";
import { triggerAutomation } from "./automation.server";

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
    errors: [] as string[]
  };

  try {
    results.abandonedCarts = await processAbandonedCarts(db, env);
    results.winbackCampaigns = await processWinbackCampaigns(db, env);
    results.reviewRequests = await processReviewRequests(db, env);
  } catch (error: any) {
    console.error("[Scheduler] Error running tasks:", error);
    results.errors.push(error.message);
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
      store: true // Get store name/details
    },
    limit: 50 // Batch size
  });

  let processedCount = 0;

  for (const cart of targetCarts) {
    if (!cart.customerPhone) continue; // Skip if no phone number

    try {
      // 2. Send Smart Notification (WhatsApp -> SMS)
      await sendSmartNotification(db, env, 0, cart.storeId, 'ABANDONED_CART', {
        phone: cart.customerPhone,
        customerName: cart.customerName || 'Guest',
        cartUrl: `https://${cart.store.subdomain}.digitalcare.site/checkout?recovery=${cart.sessionId}`,
        amount: cart.totalAmount,
        currency: cart.currency
      });
      
      // 2b. Also trigger email automation if customer has email
      if (cart.customerEmail && !cart.customerEmail.includes('@phone.local')) {
        await triggerAutomation(
          env.DB,
          'cart_abandoned',
          {
            storeId: cart.storeId,
            customerEmail: cart.customerEmail,
            customerName: cart.customerName || 'Guest',
            metadata: {
              cartUrl: `https://${cart.store.subdomain}.digitalcare.site/checkout?recovery=${cart.sessionId}`,
              amount: cart.totalAmount,
              currency: cart.currency,
            }
          },
          env.RESEND_API_KEY
        );
      }

      // 3. Mark as sent
      await db.update(abandonedCarts)
        .set({
          recoveryEmailSent: true,
          recoveryEmailSentAt: new Date()
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
  
  const targetCustomers = await db.select().from(customers).where(and(
      lt(customers.lastOrderAt, thirtyDaysAgo),
      // We check tags to ensure we don't spam. Tag: 'winback_sent'
      not(like(customers.tags, '%winback_sent%')) 
  )).limit(20);

  let count = 0;
  for (const customer of targetCustomers) {
      if (!customer.phone) continue;

      try {
        await sendSmartNotification(db, env, customer.id, customer.storeId, 'WINBACK_OFFER', { 
            phone: customer.phone,
            customerName: customer.name 
        });
        
        // Update Tag to prevent resending
        const newTags = customer.tags ? JSON.parse(customer.tags) : [];
        newTags.push('winback_sent');
        await db.update(customers)
            .set({ tags: JSON.stringify(newTags) })
            .where(eq(customers.id, customer.id));
        
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
  
  const recentDeliveries = await db.select().from(orders).where(and(
      eq(orders.status, 'delivered'),
      eq(orders.reviewRequestSent, false),
      lt(orders.updatedAt, threeDaysAgo) 
  )).limit(20);

  let count = 0;
  for (const order of recentDeliveries) {
       if (!order.customerPhone) continue;

       try {
           await sendSmartNotification(db, env, 0, order.storeId, 'REVIEW_REQUEST', { 
               phone: order.customerPhone,
               customerName: order.customerName,
               reviewUrl: `https://store.com/orders/${order.orderNumber}/review` // Placeholder
           }); 
           await db.update(orders)
               .set({ reviewRequestSent: true, reviewRequestSentAt: new Date() })
               .where(eq(orders.id, order.id));
           count++;
       } catch (e) {
           console.error("[Scheduler] Review request error", e);
       }
  }
  return count;
}
