/**
 * Checkout Cleanup Cron API
 * 
 * GET /api/cron/checkout-cleanup (protected by secret)
 * 
 * Marks pending checkout sessions as 'abandoned' after 30 minutes.
 * Called every 15 minutes via Cloudflare Cron Trigger.
 */

import { type LoaderFunctionArgs } from 'react-router';
import { json } from '~/lib/rr7-compat';
import { createDb } from '~/lib/db.server';
import { checkoutSessions, carts } from '@db/schema';
import { eq, lt, and } from 'drizzle-orm';

// Configurable thresholds (in milliseconds)
const CHECKOUT_ABANDON_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes
const CART_ABANDON_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Verify cron secret (set CRON_SECRET in wrangler.toml)
  const url = new URL(request.url);
  const secret = url.searchParams.get('secret');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const expectedSecret = (context.cloudflare.env as any).CRON_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = createDb(context.cloudflare.env.DB);
  const now = new Date();
  const checkoutCutoff = new Date(now.getTime() - CHECKOUT_ABANDON_THRESHOLD_MS);
  const cartCutoff = new Date(now.getTime() - CART_ABANDON_THRESHOLD_MS);

  let abandonedCheckouts = 0;
  let abandonedCarts = 0;

  try {
    // 1. Mark old pending checkout sessions as abandoned
    const checkoutResult = await db
      .update(checkoutSessions)
      .set({ 
        status: 'abandoned',
        updatedAt: now,
      })
      .where(
        and(
          eq(checkoutSessions.status, 'pending'),
          lt(checkoutSessions.createdAt, checkoutCutoff)
        )
      )
      .returning({ id: checkoutSessions.id });

    abandonedCheckouts = checkoutResult.length;

    // 2. Mark old active carts as abandoned
    const cartResult = await db
      .update(carts)
      .set({
        status: 'abandoned',
        updatedAt: now,
      })
      .where(
        and(
          eq(carts.status, 'active'),
          lt(carts.createdAt, cartCutoff)
        )
      )
      .returning({ id: carts.id });

    abandonedCarts = cartResult.length;

    console.warn(`[Cron] Cleanup completed: ${abandonedCheckouts} checkouts, ${abandonedCarts} carts marked abandoned`);

    return json({
      success: true,
      abandonedCheckouts,
      abandonedCarts,
      timestamp: now.toISOString(),
    });

  } catch (error) {
    console.error('[Cron] Checkout cleanup failed:', error);
    return json(
      { success: false, error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}


export default function() {}
