import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { action as trackVisitAction } from './api.track-visit';
import { action as trackCartAction } from './api.track-cart';

interface TrackEvent {
  type: 'visit' | 'cart';
  storeId?: number;
  path?: string;
  visitorId?: string;
  store_id?: number;
  product_id?: number;
  session_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  quantity?: number;
  variant_id?: number;
  variant_info?: string;
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = (await request.json()) as { events?: TrackEvent[] };
    const events = Array.isArray(body.events) ? body.events : [];

    if (events.length === 0) {
      return json({ success: true });
    }

    const visitEvents = events.filter((event) => event.type === 'visit');
    if (visitEvents.length > 0) {
      const visitPayload = {
        events: visitEvents.map((event) => ({
          storeId: event.storeId,
          path: event.path,
          visitorId: event.visitorId,
        })),
      };

      const visitRequest = new Request(request.url.replace('/api/track-events', '/api/track-visit'), {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(visitPayload),
      });

      await trackVisitAction({ request: visitRequest, context, params: {} } as ActionFunctionArgs);
    }

    const cartEvents = events.filter((event) => event.type === 'cart');
    for (const event of cartEvents) {
      const cartPayload = {
        store_id: event.store_id,
        product_id: event.product_id,
        session_id: event.session_id,
        customer_name: event.customer_name,
        customer_email: event.customer_email,
        customer_phone: event.customer_phone,
        quantity: event.quantity,
        variant_id: event.variant_id,
        variant_info: event.variant_info,
      };

      const cartRequest = new Request(request.url.replace('/api/track-events', '/api/track-cart'), {
        method: 'POST',
        headers: request.headers,
        body: JSON.stringify(cartPayload),
      });

      await trackCartAction({ request: cartRequest, context, params: {} } as ActionFunctionArgs);
    }

    return json({ success: true });
  } catch (error) {
    console.error('[api.track-events] Unexpected error:', error);
    return json({ success: true });
  }
}

export function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}


export default function() {}
