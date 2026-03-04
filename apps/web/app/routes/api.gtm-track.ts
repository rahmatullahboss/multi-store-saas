/**
 * Google Tag Manager Tracking API
 *
 * Server-side endpoint for tracking GTM events
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { requireTenant } from '~/lib/tenant-guard.server';
import { createDb } from '~/lib/db.server';
import {
  trackGtmEvent,
  getGtmEventStats,
  getGtmFunnelData,
  getStoreGtmContainerId,
} from '~/services/gtm-tracking.server';
import { gtmTrackSchema } from '~/lib/validations';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    if (action === 'stats') {
      const startDate = new Date(url.searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
      const endDate = new Date(url.searchParams.get('endDate') || Date.now());

      const [stats, funnel] = await Promise.all([
        getGtmEventStats(db, storeId, startDate, endDate),
        getGtmFunnelData(db, storeId, startDate, endDate),
      ]);

      return json({
        success: true,
        data: { stats, funnel },
      });
    }

    if (action === 'container-id') {
      const containerId = await getStoreGtmContainerId(db, storeId);
      return json({
        success: true,
        data: { containerId },
      });
    }

    return json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching GTM data:', error);
    return json({ success: false, error: 'Failed to fetch GTM data' }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  try {
    const body = await request.json() as Record<string, unknown>;
    const parsed = gtmTrackSchema.safeParse(body);

    if (!parsed.success) {
      return json({
        success: false,
        error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(', ')}`,
      }, { status: 400 });
    }

    const { eventName, ...params } = parsed.data;

    await trackGtmEvent({
      db,
      storeId,
      sessionId: params.sessionId || `server-${Date.now()}-${Math.random()}`,
      eventName,
      ...params,
    });

    return json({ success: true, message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Error tracking GTM event:', error);
    return json({ success: false, error: 'Failed to track event' }, { status: 500 });
  }
}
