/**
 * Server-Side Tracking Routes — WooCommerce Power Layer
 * POST /api/v1/tracking/event — Fire Facebook CAPI / Google server-side event
 */

import { Hono } from 'hono';
import { z } from 'zod';
const tracking = new Hono<{ Bindings: Env }>();

const requireScope = (scope: string) => async (c: any, next: any) => {
  const apiKey = c.var.apiKey;
  if (!apiKey) return c.json({ error: 'unauthorized' }, 401);
  const scopes: string[] = Array.isArray(apiKey.scopes)
    ? apiKey.scopes
    : (apiKey.scopes ?? '').split(',').map((s: string) => s.trim());
  if (!scopes.includes(scope)) {
    return c.json({ error: 'insufficient_scope', required: scope, upgrade_url: `https://app.ozzyl.com/pricing?ref=wc-plugin&module=${scope}` }, 403);
  }
  await next();
};

const EventSchema = z.object({
  event_name: z.string().min(1),
  event_data: z.record(z.unknown()).optional().default({}),
  pixel_id: z.string().optional(),
  access_token: z.string().optional(),
  fbp: z.string().optional(),
  fbc: z.string().optional(),
  client_ip: z.string().optional(),
  client_user_agent: z.string().optional(),
  email_hash: z.string().optional(),
  phone_hash: z.string().optional(),
});

tracking.post('/event', requireScope('tracking'), async (c) => {
  try {
    const body = EventSchema.parse(await c.req.json());
    const storeId = c.var.apiKey.storeId;

    let pixelId = body.pixel_id;
    let accessToken = body.access_token;

    // Fall back to store-configured pixel
    if (!pixelId || !accessToken) {
      const store = await c.env.DB.prepare(
        `SELECT storefront_settings FROM stores WHERE id = ? LIMIT 1`
      ).bind(storeId).first<{ storefront_settings: string }>();

      if (store?.storefront_settings) {
        try {
          const settings = JSON.parse(store.storefront_settings);
          pixelId      = pixelId      ?? settings?.tracking?.facebookPixelId;
          accessToken  = accessToken  ?? settings?.tracking?.facebookAccessToken;
        } catch { /* ignore parse errors */ }
      }
    }

    if (!pixelId || !accessToken) {
      return c.json({ error: 'pixel_not_configured', message: 'Configure Facebook Pixel in Ozzyl settings' }, 422);
    }

    const eventId   = crypto.randomUUID();
    const eventTime = Math.floor(Date.now() / 1000);

    const capiPayload = {
      data: [{
        event_name:    body.event_name,
        event_time:    eventTime,
        event_id:      eventId,
        action_source: 'website',
        user_data: {
          ...(body.email_hash         && { em:                [body.email_hash] }),
          ...(body.phone_hash         && { ph:                [body.phone_hash] }),
          ...(body.fbp                && { fbp:               body.fbp }),
          ...(body.fbc                && { fbc:               body.fbc }),
          ...(body.client_ip          && { client_ip_address: body.client_ip }),
          ...(body.client_user_agent  && { client_user_agent: body.client_user_agent }),
        },
        custom_data: body.event_data,
      }],
    };

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(capiPayload) }
    );

    const result = await res.json() as { events_received?: number; error?: unknown };

    if (!res.ok) {
      console.error('[CAPI Error]', result);
      return c.json({ fired: false, error: result.error }, 502);
    }

    return c.json({ fired: true, platform: 'facebook', event_id: eventId, events_received: result.events_received ?? 1 });
  } catch (err) {
    if (err instanceof z.ZodError) return c.json({ error: 'validation_error', issues: err.errors }, 400);
    console.error('[Tracking Event Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { tracking as trackingWcRouter };
