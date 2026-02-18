import { json } from "@remix-run/cloudflare";
import type { LoaderFunctionArgs } from "@remix-run/cloudflare";
// import { drizzle } from "drizzle-orm/d1"; // REMOVED
import { createDb } from "~/lib/db.server";
import * as schema from "@db/schema";
import { eq, and, lt } from "drizzle-orm";
import { sendSmartNotification } from "~/services/messaging.server";

export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = (context as any).cloudflare?.env as Env || context.env as unknown as Env;
  // 1. Security Check (CRON_SECRET)
  // In production, Cloudflare Cron Triggers send their own headers or we use a query param
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");
  const envSecret = (env as unknown as Record<string, string>).CRON_SECRET || "development-secret";
  
  if (secret !== envSecret) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = createDb(env.DB);
  const results = {
    abandonedCarts: 0,
    winBacks: 0,
    reviewRequests: 0,
    errors: [] as string[]
  };

  try {
    // === 1. ABANDONED CART RECOVERY (1 Hour Delay) ===
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    // const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000); // Window check if needed

    const abandoned = await db.query.abandonedCarts.findMany({
      where: and(
        eq(schema.abandonedCarts.status, 'abandoned'),
        eq(schema.abandonedCarts.recoveryEmailSent, false),
        lt(schema.abandonedCarts.abandonedAt, oneHourAgo)
      ),
      with: {
        store: {
          columns: {
            customDomain: true,
            subdomain: true,
          },
        },
      },
      limit: 20 // Batch limit prevents timeout
    });

    for (const cart of abandoned) {
      if (cart.customerPhone) {
        const storeUrl = cart.store.customDomain
          ? `https://${cart.store.customDomain}`
          : `https://${cart.store.subdomain}.ozzyl.com`;

        await sendSmartNotification(
            db, 
            env, 
            0, // Customer ID might not exist yet
            cart.storeId, 
            'ABANDONED_CART', 
            { 
                phone: cart.customerPhone,
                customerName: cart.customerName || 'Guest',
                cartUrl: `${storeUrl}/checkout?recovery=${encodeURIComponent(cart.sessionId)}`,
                amount: cart.totalAmount,
                currency: cart.currency || 'BDT',
            }
        );
        
        await db.update(schema.abandonedCarts)
          .set({ recoveryEmailSent: true, recoveryEmailSentAt: new Date() })
          .where(eq(schema.abandonedCarts.id, cart.id));
        
        results.abandonedCarts++;
      }
    }

    // === 2. REVIEW REQUESTS (3 Days after Delivery) ===
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    
    // Find orders delivered > 3 days ago, review not sent
    // Note: We need deliveredAt. Schema has order.status='delivered'. 
    // Optimization: orders table doesn't have deliveredAt index, might be slow. 
    // Using shipments.deliveredAt if available or just updatedAt if status is delivered?
    // Going with orders.updatedAt + status for now.

    const deliveredOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.status, 'delivered'),
        eq(schema.orders.reviewRequestSent, false),
        lt(schema.orders.updatedAt, threeDaysAgo) 
      ),
      with: { customer: true },
      limit: 20
    });

    for (const order of deliveredOrders) {
      if (order.customerPhone) {
        await sendSmartNotification(
          db,
          env,
          order.customerId || 0,
          order.storeId,
          'REVIEW_REQUEST',
          {
            phone: order.customerPhone,
            customerName: order.customerName,
            reviewUrl: `https://${env.SAAS_DOMAIN}/review/${order.id}`
          }
        );

        await db.update(schema.orders)
            .set({ reviewRequestSent: true, reviewRequestSentAt: new Date() })
            .where(eq(schema.orders.id, order.id));

        results.reviewRequests++;
      }
    }

    // === 3. WIN-BACK (30 Days Inactive) ===
    // This is expensive to query every hour. Best done via a daily scheduled worker or a specific endpoint.
    // Skipping for hourly cron to save resources/time.

  } catch (e: any) {
    console.error("Cron Error:", e);
    results.errors.push(e.message);
  }

  return json({ success: true, results });
};


export default function() {}
