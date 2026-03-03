/**
 * Fraud Check API Route
 *
 * Route: /api/fraud-check
 *
 * Actions:
 * - CHECK: Calculate risk score for phone + order
 * - BLACKLIST_ADD: Add phone to blacklist
 * - BLACKLIST_REMOVE: Remove from blacklist
 * - RESOLVE: Merchant resolves a held order (approve/reject)
 * - GET_BLACKLIST: Get blacklisted phones for store
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, desc } from 'drizzle-orm';
import { stores, fraudEvents, phoneBlacklist, orders } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  performFraudCheck,
  parseFraudSettings,
  normalizePhone,
  addToBlacklist,
  removeFromBlacklist,
  fetchExternalFraudData,
} from '~/services/fraud-engine.server';

// ============================================================================
// LOADER - GET blacklist and fraud events
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context);

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const db = drizzle(context.cloudflare.env.DB);

  // External lookup — proxy to fraudchecker.link
  if (type === 'lookup') {
    const phone = url.searchParams.get('phone');
    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }
    const data = await fetchExternalFraudData(phone);
    if (!data) {
      return json({ error: 'No data found for this number' }, { status: 404 });
    }
    return json({ data });
  }

  // Get blacklist
  if (type === 'blacklist') {
    const list = await db
      .select()
      .from(phoneBlacklist)
      .where(eq(phoneBlacklist.storeId, storeId))
      .orderBy(desc(phoneBlacklist.createdAt))
      .limit(200);

    return json({ blacklist: list });
  }

  // Get recent fraud events (review queue)
  if (type === 'review-queue') {
    const events = await db
      .select({
        id: fraudEvents.id,
        orderId: fraudEvents.orderId,
        phone: fraudEvents.phone,
        riskScore: fraudEvents.riskScore,
        decision: fraudEvents.decision,
        signals: fraudEvents.signals,
        resolvedBy: fraudEvents.resolvedBy,
        resolvedAt: fraudEvents.resolvedAt,
        createdAt: fraudEvents.createdAt,
      })
      .from(fraudEvents)
      .where(
        and(
          eq(fraudEvents.storeId, storeId),
          eq(fraudEvents.decision, 'hold')
        )
      )
      .orderBy(desc(fraudEvents.createdAt))
      .limit(50);

    return json({ events });
  }

  // Get fraud events for a specific order
  if (type === 'order') {
    const orderId = parseInt(url.searchParams.get('orderId') || '0');
    if (!orderId) {
      return json({ error: 'Order ID required' }, { status: 400 });
    }

    const events = await db
      .select()
      .from(fraudEvents)
      .where(
        and(
          eq(fraudEvents.storeId, storeId),
          eq(fraudEvents.orderId, orderId)
        )
      )
      .orderBy(desc(fraudEvents.createdAt));

    return json({ events });
  }

  return json({ error: 'Missing type parameter' }, { status: 400 });
}

// ============================================================================
// ACTION HANDLER
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context);

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // ========================================
  // CHECK - Calculate risk for phone/order
  // ========================================
  if (intent === 'CHECK') {
    const phone = formData.get('phone') as string;
    const orderTotal = parseFloat(formData.get('orderTotal') as string) || 0;
    const paymentMethod = (formData.get('paymentMethod') as string) || 'cod';
    const shippingAddress = formData.get('shippingAddress') as string;
    const orderId = parseInt(formData.get('orderId') as string) || undefined;
    const isOTPVerified = formData.get('isOTPVerified') === 'true';

    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    try {
      // Get store fraud settings
      const storeResult = await db
        .select({ fraudSettings: stores.fraudSettings })
        .from(stores)
        .where(eq(stores.id, storeId))
        .limit(1);

      const settings = parseFraudSettings(storeResult[0]?.fraudSettings);

      if (!settings.enabled) {
        return json({
          riskScore: 0,
          decision: 'allow',
          signals: [],
          isBlacklisted: false,
          message: 'Fraud detection is disabled',
        });
      }

      const assessment = await performFraudCheck({
        phone,
        storeId,
        orderTotal,
        paymentMethod,
        shippingAddress,
        isOTPVerified,
        db,
        orderId,
        settings,
      });

      return json({
        riskScore: assessment.clampedScore,
        decision: assessment.decision,
        signals: assessment.signals,
        isBlacklisted: assessment.isBlacklisted,
      });
    } catch (error) {
      console.error('[FRAUD API] Check error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Fraud check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // BLACKLIST_ADD - Add phone to blacklist
  // ========================================
  if (intent === 'BLACKLIST_ADD') {
    const phone = formData.get('phone') as string;
    const reason = (formData.get('reason') as string) || 'Manually blacklisted by merchant';

    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    try {
      await addToBlacklist(phone, storeId, reason, 'merchant', db);
      return json({ success: true, message: `${normalizePhone(phone)} blacklisted` });
    } catch (error) {
      console.error('[FRAUD API] Blacklist add error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Failed to add to blacklist' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // BLACKLIST_REMOVE - Remove from blacklist
  // ========================================
  if (intent === 'BLACKLIST_REMOVE') {
    const phone = formData.get('phone') as string;

    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    try {
      await removeFromBlacklist(phone, storeId, db);
      return json({ success: true, message: `${normalizePhone(phone)} removed from blacklist` });
    } catch (error) {
      console.error('[FRAUD API] Blacklist remove error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Failed to remove from blacklist' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // RESOLVE - Merchant resolves held order
  // ========================================
  if (intent === 'RESOLVE') {
    const eventId = parseInt(formData.get('eventId') as string);
    const action = formData.get('action') as 'approve' | 'reject' | 'blacklist';

    if (!eventId || !action) {
      return json({ error: 'Event ID and action are required' }, { status: 400 });
    }

    try {
      // Get the event
      const event = await db
        .select()
        .from(fraudEvents)
        .where(
          and(
            eq(fraudEvents.id, eventId),
            eq(fraudEvents.storeId, storeId)
          )
        )
        .limit(1);

      if (!event[0]) {
        return json({ error: 'Fraud event not found' }, { status: 404 });
      }

      // Update the event
      await db
        .update(fraudEvents)
        .set({
          resolvedBy: `merchant:${action}`,
          resolvedAt: new Date(),
        })
        .where(eq(fraudEvents.id, eventId));

      // Handle action
      if (action === 'approve' && event[0].orderId) {
        // Allow the order to proceed
        await db
          .update(orders)
          .set({
            status: 'confirmed',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(orders.id, event[0].orderId),
              eq(orders.storeId, storeId)
            )
          );
      } else if (action === 'reject' && event[0].orderId) {
        await db
          .update(orders)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(orders.id, event[0].orderId),
              eq(orders.storeId, storeId)
            )
          );
      } else if (action === 'blacklist') {
        await addToBlacklist(
          event[0].phone,
          storeId,
          `Blacklisted from fraud review (Event #${eventId})`,
          'merchant',
          db
        );

        if (event[0].orderId) {
          await db
            .update(orders)
            .set({
              status: 'cancelled',
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(orders.id, event[0].orderId),
                eq(orders.storeId, storeId)
              )
            );
        }
      }

      return json({ success: true, message: `Order ${action}ed successfully` });
    } catch (error) {
      console.error('[FRAUD API] Resolve error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Resolution failed' },
        { status: 500 }
      );
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}

export default function () {}
