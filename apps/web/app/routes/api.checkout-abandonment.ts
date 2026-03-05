/**
 * Checkout Abandonment Tracking API
 *
 * Server-side endpoint for tracking checkout funnel and abandonment
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { requireTenant } from '~/lib/tenant-guard.server';
import { createDb } from '~/lib/db.server';
import {
  startCheckoutSession,
  updateCheckoutStep,
  markCheckoutAbandoned,
  getCheckoutFunnelStats,
  getExitReasonsBreakdown,
  getDeviceBreakdown,
  getRecentAbandonedCheckouts,
  getStoreCheckoutFormat,
  updateStoreCheckoutFormat,
} from '~/services/checkout-abandonment.server';
import {
  startCheckoutSessionSchema,
  updateCheckoutStepSchema,
  markAbandonedSchema,
  checkoutFormatSchema,
} from '~/lib/validations';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'funnel-stats') {
      const startDate = new Date(url.searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(url.searchParams.get('endDate') || Date.now());

      const [funnel, exitReasons, deviceBreakdown] = await Promise.all([
        getCheckoutFunnelStats(db, storeId, startDate, endDate),
        getExitReasonsBreakdown(db, storeId, startDate, endDate),
        getDeviceBreakdown(db, storeId, startDate, endDate),
      ]);

      return json({ success: true, data: { funnel, exitReasons, deviceBreakdown } });
    }

    if (action === 'abandoned-list') {
      const limit = Number(url.searchParams.get('limit') || 50);
      const abandoned = await getRecentAbandonedCheckouts(db, storeId, limit);
      return json({ success: true, data: { abandoned } });
    }

    if (action === 'checkout-format') {
      const format = await getStoreCheckoutFormat(db, storeId);
      return json({ success: true, data: { format } });
    }

    return json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching checkout data:', error);
    return json({ success: false, error: 'Failed to fetch checkout data' }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  try {
    const body = await request.json() as Record<string, unknown>;
    const actionType = typeof body.actionType === 'string' ? body.actionType : '';

    switch (actionType) {
      case 'start-session': {
        const parsed = startCheckoutSessionSchema.safeParse(body);
        if (!parsed.success) {
          return json({ success: false, error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(', ')}` }, { status: 400 });
        }
        await startCheckoutSession({ db, storeId, ...parsed.data });
        return json({ success: true, message: 'Checkout session started' });
      }

      case 'update-step': {
        const parsed = updateCheckoutStepSchema.safeParse(body);
        if (!parsed.success) {
          return json({ success: false, error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(', ')}` }, { status: 400 });
        }
        await updateCheckoutStep(db, storeId, parsed.data);
        return json({ success: true, message: 'Checkout step updated' });
      }

      case 'mark-abandoned': {
        const parsed = markAbandonedSchema.safeParse(body);
        if (!parsed.success) {
          return json({ success: false, error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(', ')}` }, { status: 400 });
        }
        await markCheckoutAbandoned(db, storeId, parsed.data);
        return json({ success: true, message: 'Checkout marked as abandoned' });
      }

      case 'update-format': {
        const parsed = checkoutFormatSchema.safeParse(body.format);
        if (!parsed.success) {
          return json({ success: false, error: 'Invalid checkout format' }, { status: 400 });
        }
        await updateStoreCheckoutFormat(db, storeId, parsed.data);
        return json({ success: true, message: 'Checkout format updated' });
      }

      default:
        return json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in checkout abandonment action:', error);
    return json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
