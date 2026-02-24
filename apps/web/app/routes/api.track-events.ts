import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { action as trackVisitAction } from './api.track-visit';
import { action as trackCartAction } from './api.track-cart';
import { sendAddToCartEvent } from '~/services/facebook-capi.server';

interface TrackEvent {
  type: 'visit' | 'cart' | 'add_to_cart';
  storeId?: number;
  path?: string;
  visitorId?: string;
  store_id?: number;
  product_id?: number;
  product_name?: string;
  value?: number;
  currency?: string;
  quantity?: number;
  session_id?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_id?: string | number;
  variant_id?: number;
  variant_info?: string;
  fbp?: string;
  fbc?: string;
  event_source_url?: string;
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

    // ── SERVER-SIDE AddToCart CAPI ─────────────────────────────────────────
    // Fire AddToCart CAPI for improved ad attribution (bypasses ad blockers).
    // Client calls this endpoint with product details when user adds to cart.
    const addToCartEvents = events.filter((event) => event.type === 'add_to_cart');
    if (addToCartEvents.length > 0) {
      const db = drizzle(context.cloudflare.env.DB);
      const clientIp =
        request.headers.get('CF-Connecting-IP') ||
        request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
        undefined;
      const userAgent = request.headers.get('User-Agent') ?? undefined;

      for (const event of addToCartEvents) {
        const storeIdForEvent = event.storeId || event.store_id;
        if (!storeIdForEvent) continue;

        // Fetch store CAPI credentials
        const storeRows = await db
          .select({
            facebookPixelId: stores.facebookPixelId,
            facebookAccessToken: stores.facebookAccessToken,
            currency: stores.currency,
          })
          .from(stores)
          .where(eq(stores.id, storeIdForEvent))
          .limit(1);

        const storeData = storeRows[0];
        if (!storeData?.facebookPixelId || !storeData?.facebookAccessToken) continue;
        if (!event.product_id || !event.value) continue;

        context.cloudflare.ctx.waitUntil(
          sendAddToCartEvent({
            pixelId: storeData.facebookPixelId,
            accessToken: storeData.facebookAccessToken,
            productId: String(event.product_id),
            productName: event.product_name || 'Product',
            value: event.value,
            currency: event.currency || storeData.currency || 'BDT',
            quantity: event.quantity || 1,
            customerEmail: event.customer_email,
            customerId: event.customer_id,
            clientIpAddress: clientIp,
            clientUserAgent: userAgent,
            fbp: event.fbp,
            fbc: event.fbc,
            eventSourceUrl: event.event_source_url,
          }).catch((e) => console.error('[FB CAPI] AddToCart event failed:', e))
        );
      }
    }
    // ──────────────────────────────────────────────────────────────────────

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
