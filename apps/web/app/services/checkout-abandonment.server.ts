/**
 * Checkout Abandonment Tracking Service
 *
 * Tracks checkout funnel progression and abandonment for both
 * one-page and multi-step checkout formats.
 *
 * Features:
 * - Session timeout detection (30 minutes)
 * - Multi-tenant isolation
 * - Type-safe updates
 */

import type { Database } from '~/lib/db.server';
import { checkoutAbandonmentLogs, stores } from '@db/schema';
import { eq, and, gte, lte, desc, sql, isNotNull } from 'drizzle-orm';
import { validateCheckoutSession, type CheckoutStepUpdate as ValidatedStepUpdate } from '~/lib/validations';

// Session timeout: 30 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

export interface CheckoutSession {
  db: Database;
  storeId: number;
  sessionId: string;
  customerEmail?: string;
  customerPhone?: string;
  cartValue: number;
  cartItemsCount: number;
  deviceType?: string;
  browser?: string;
  os?: string;
}

/**
 * Start tracking a checkout session
 */
export async function startCheckoutSession(
  params: CheckoutSession
): Promise<{ success: boolean; sessionId?: number; error?: string }> {
  const validation = validateCheckoutSession(params);
  if (!validation.valid) {
    return {
      success: false,
      error: `Validation failed: ${(validation.error || []).map((e: { message: string }) => e.message).join(', ')}`,
    };
  }

  const { db } = params;

  try {
    const thirtyMinutesAgo = new Date(Date.now() - SESSION_TIMEOUT_MS);
    const existingSession = await db.select().from(checkoutAbandonmentLogs)
      .where(and(
        eq(checkoutAbandonmentLogs.storeId, params.storeId),
        eq(checkoutAbandonmentLogs.sessionId, params.sessionId),
        gte(checkoutAbandonmentLogs.startedAt, thirtyMinutesAgo)
      ))
      .limit(1);

    if (existingSession.length > 0) {
      return {
        success: true,
        sessionId: existingSession[0].id,
      };
    }

    await db.insert(checkoutAbandonmentLogs).values({
      storeId: params.storeId,
      sessionId: params.sessionId,
      customerEmail: params.customerEmail || null,
      customerPhone: params.customerPhone || null,
      cartValue: params.cartValue,
      cartItemsCount: params.cartItemsCount,
      deviceType: params.deviceType,
      browser: params.browser,
      os: params.os,
      startedAt: new Date(),
    });

    return { success: true };
  } catch (error) {
    console.error('Error starting checkout session:', error);
    return { success: false, error: 'Database insert failed' };
  }
}

/**
 * Update checkout step progression
 */
export async function updateCheckoutStep(
  db: Database,
  storeId: number,
  params: ValidatedStepUpdate
): Promise<{ success: boolean; error?: string }> {
  const { sessionId, step, customerEmail, customerPhone } = params;

  try {
    const updateData: Record<string, unknown> = { abandonedAt: null };

    switch (step) {
      case 'info':
        updateData.reachedStep = 'info';
        updateData.completedInfo = 1;
        break;
      case 'address':
        updateData.reachedStep = 'address';
        updateData.completedInfo = 1;
        updateData.completedAddress = 1;
        break;
      case 'payment':
        updateData.reachedStep = 'payment';
        updateData.completedInfo = 1;
        updateData.completedAddress = 1;
        updateData.completedPayment = 1;
        break;
      case 'review':
        updateData.reachedStep = 'review';
        updateData.completedInfo = 1;
        updateData.completedAddress = 1;
        updateData.completedPayment = 1;
        updateData.completedReview = 1;
        break;
      case 'completed':
        updateData.reachedStep = 'completed';
        updateData.completedInfo = 1;
        updateData.completedAddress = 1;
        updateData.completedPayment = 1;
        updateData.completedReview = 1;
        updateData.completedCheckout = 1;
        break;
    }

    if (customerEmail) updateData.customerEmail = customerEmail;
    if (customerPhone) updateData.customerPhone = customerPhone;

    await db
      .update(checkoutAbandonmentLogs)
      .set(updateData)
      .where(
        and(
          eq(checkoutAbandonmentLogs.storeId, storeId),
          eq(checkoutAbandonmentLogs.sessionId, sessionId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Error updating checkout step:', error);
    return { success: false, error: 'Database update failed' };
  }
}

/**
 * Mark checkout as abandoned
 */
export async function markCheckoutAbandoned(
  db: Database,
  storeId: number,
  params: { sessionId: string; exitReason?: string; exitPage?: string }
): Promise<{ success: boolean; error?: string }> {
  const { sessionId, exitReason, exitPage } = params;

  try {
    await db
      .update(checkoutAbandonmentLogs)
      .set({
        exitReason: exitReason || null,
        exitPage: exitPage || null,
        abandonedAt: new Date(),
      })
      .where(
        and(
          eq(checkoutAbandonmentLogs.storeId, storeId),
          eq(checkoutAbandonmentLogs.sessionId, sessionId),
          eq(checkoutAbandonmentLogs.completedCheckout, 0)
        )
      );

    return { success: true };
  } catch (error) {
    console.error('Error marking checkout as abandoned:', error);
    return { success: false, error: 'Database update failed' };
  }
}

/**
 * Get checkout funnel statistics for a store
 */
export async function getCheckoutFunnelStats(
  db: Database,
  storeId: number,
  startDate: Date,
  endDate: Date
) {
  // Optimization: Pushed aggregations to the DB to reduce memory usage and avoid N+1 array iterations
  const [stats] = await db
    .select({
      totalStarted: sql<number>`count(*)`,
      completedInfo: sql<number>`sum(${checkoutAbandonmentLogs.completedInfo})`,
      completedAddress: sql<number>`sum(${checkoutAbandonmentLogs.completedAddress})`,
      completedPayment: sql<number>`sum(${checkoutAbandonmentLogs.completedPayment})`,
      completedReview: sql<number>`sum(${checkoutAbandonmentLogs.completedReview})`,
      completedCheckout: sql<number>`sum(${checkoutAbandonmentLogs.completedCheckout})`,
      abandoned: sql<number>`sum(case when ${checkoutAbandonmentLogs.completedCheckout} = 0 and ${checkoutAbandonmentLogs.abandonedAt} is not null then 1 else 0 end)`,
    })
    .from(checkoutAbandonmentLogs)
    .where(
      and(
        eq(checkoutAbandonmentLogs.storeId, storeId),
        gte(checkoutAbandonmentLogs.startedAt, startDate),
        lte(checkoutAbandonmentLogs.startedAt, endDate)
      )
    );

  const totalStarted = Number(stats?.totalStarted || 0);
  const abandoned = Number(stats?.abandoned || 0);
  const abandonmentRate = totalStarted > 0 ? (abandoned / totalStarted) * 100 : 0;

  return {
    totalStarted,
    completedInfo: Number(stats?.completedInfo || 0),
    completedAddress: Number(stats?.completedAddress || 0),
    completedPayment: Number(stats?.completedPayment || 0),
    completedReview: Number(stats?.completedReview || 0),
    completedCheckout: Number(stats?.completedCheckout || 0),
    abandoned,
    abandonmentRate: Math.round(abandonmentRate * 100) / 100,
  };
}

/**
 * Get exit reasons breakdown
 */
export async function getExitReasonsBreakdown(
  db: Database,
  storeId: number,
  startDate: Date,
  endDate: Date
): Promise<Record<string, number>> {
  // Optimization: Perform group by and count directly in DB rather than retrieving all rows
  const breakdown = await db
    .select({
      exitReason: checkoutAbandonmentLogs.exitReason,
      count: sql<number>`count(*)`,
    })
    .from(checkoutAbandonmentLogs)
    .where(
      and(
        eq(checkoutAbandonmentLogs.storeId, storeId),
        gte(checkoutAbandonmentLogs.startedAt, startDate),
        lte(checkoutAbandonmentLogs.startedAt, endDate),
        eq(checkoutAbandonmentLogs.completedCheckout, 0),
        isNotNull(checkoutAbandonmentLogs.exitReason)
      )
    )
    .groupBy(checkoutAbandonmentLogs.exitReason);

  const reasons: Record<string, number> = {};
  breakdown.forEach((row) => {
    if (row.exitReason) {
      reasons[row.exitReason] = Number(row.count);
    }
  });

  return reasons;
}

/**
 * Get device type breakdown for abandoned checkouts
 */
export async function getDeviceBreakdown(
  db: Database,
  storeId: number,
  startDate: Date,
  endDate: Date
) {
  // Optimization: Perform group by and count directly in DB rather than retrieving all rows
  const logs = await db
    .select({
      deviceType: checkoutAbandonmentLogs.deviceType,
      count: sql<number>`count(*)`,
    })
    .from(checkoutAbandonmentLogs)
    .where(
      and(
        eq(checkoutAbandonmentLogs.storeId, storeId),
        gte(checkoutAbandonmentLogs.startedAt, startDate),
        lte(checkoutAbandonmentLogs.startedAt, endDate),
        eq(checkoutAbandonmentLogs.completedCheckout, 0)
      )
    )
    .groupBy(checkoutAbandonmentLogs.deviceType);

  const breakdown = { mobile: 0, desktop: 0, tablet: 0, unknown: 0 };
  logs.forEach((row) => {
    const device = (row.deviceType || 'unknown') as keyof typeof breakdown;
    if (breakdown[device] !== undefined) {
      breakdown[device] += Number(row.count);
    } else {
      breakdown.unknown += Number(row.count);
    }
  });

  return breakdown;
}

/**
 * Get recent abandoned checkouts for recovery
 */
export async function getRecentAbandonedCheckouts(
  db: Database,
  storeId: number,
  limit: number = 50
) {
  const results = await db
    .select()
    .from(checkoutAbandonmentLogs)
    .where(
      and(
        eq(checkoutAbandonmentLogs.storeId, storeId),
        eq(checkoutAbandonmentLogs.completedCheckout, 0),
        gte(checkoutAbandonmentLogs.startedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      )
    )
    .orderBy(desc(checkoutAbandonmentLogs.startedAt))
    .limit(limit);

  return results.filter((r) => r.customerEmail && r.customerEmail.trim() !== '');
}

/**
 * Get checkout format preference for a store
 */
export async function getStoreCheckoutFormat(db: Database, storeId: number): Promise<'one-page' | 'multi-step'> {
  const storeData = await db.select({ checkoutFormat: stores.checkoutFormat }).from(stores).where(eq(stores.id, storeId)).limit(1);
  return (storeData[0]?.checkoutFormat as 'one-page' | 'multi-step') || 'one-page';
}

/**
 * Update store checkout format preference
 */
export async function updateStoreCheckoutFormat(
  db: Database,
  storeId: number,
  format: 'one-page' | 'multi-step'
): Promise<void> {
  await db.update(stores).set({ checkoutFormat: format }).where(eq(stores.id, storeId));
}
