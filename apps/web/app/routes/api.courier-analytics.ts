/**
 * Courier Analytics API Routes
 *
 * Provides endpoints for courier performance analytics
 */

import type { LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { requireTenant } from '~/lib/tenant-guard.server';
import { createDb } from '~/lib/db.server';
import {
  getCourierPerformance,
  getCourierPerformanceSummary,
  getCourierPerformanceTrends,
  updateShipmentDelivery,
} from '~/services/courier-analytics.server';
import { updateDeliverySchema } from '~/lib/validations';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  const url = new URL(request.url);
  const startDate = url.searchParams.get('startDate');
  const endDate = url.searchParams.get('endDate');
  const courier = url.searchParams.get('courier');

  try {
    const summary = await getCourierPerformanceSummary(db, storeId);
    const metrics = await getCourierPerformance(db, {
      storeId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      courier: courier || undefined,
    });
    const trends = await getCourierPerformanceTrends(db, storeId, 30);

    return json({
      success: true,
      data: { summary, metrics, trends },
    });
  } catch (error) {
    console.error('Error fetching courier analytics:', error);
    return json({ success: false, error: 'Failed to fetch courier analytics' }, { status: 500 });
  }
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId } = await requireTenant(request, context);
  const db = createDb(context.cloudflare.env.DB);

  const formData = await request.formData();
  const actionType = formData.get('action');

  try {
    switch (actionType) {
      case 'update-delivery': {
        const parsed = updateDeliverySchema.safeParse({
          shipmentId: Number(formData.get('shipmentId')),
          deliveredAt: formData.get('deliveredAt'),
          pickedUpAt: formData.get('pickedUpAt'),
          attemptCount: Number(formData.get('attemptCount')),
          deliveryCost: formData.get('deliveryCost') ? Number(formData.get('deliveryCost')) : undefined,
          failureReason: formData.get('failureReason') || undefined,
        });

        if (!parsed.success) {
          return json({
            success: false,
            error: `Validation failed: ${parsed.error.errors.map(e => e.message).join(', ')}`,
          }, { status: 400 });
        }

        const result = await updateShipmentDelivery(db, parsed.data.shipmentId, {
          deliveredAt: new Date(parsed.data.deliveredAt),
          pickedUpAt: new Date(parsed.data.pickedUpAt),
          attemptCount: parsed.data.attemptCount,
          deliveryCost: parsed.data.deliveryCost,
          failureReason: parsed.data.failureReason,
        }, storeId);

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }
        return json({ success: true, message: 'Delivery updated successfully' });
      }

      default:
        return json({ success: false, error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in courier analytics action:', error);
    return json({ success: false, error: 'Failed to process request' }, { status: 500 });
  }
}
