/**
 * Track Visit API
 * 
 * Route: /api/track-visit
 * 
 * Lightweight endpoint to record page views for store analytics.
 * Used by storefront to track visitor activity.
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { pageViews, stores } from '@db/schema';
import { eq, sql } from 'drizzle-orm';

// Parse device type from user agent
function getDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

// Get client IP from various headers
function getClientIP(request: Request): string | null {
  // Cloudflare headers
  const cfIP = request.headers.get('CF-Connecting-IP');
  if (cfIP) return cfIP;
  
  // Standard forwarded header
  const forwarded = request.headers.get('X-Forwarded-For');
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Real IP header
  const realIP = request.headers.get('X-Real-IP');
  if (realIP) return realIP;
  
  return null;
}

// Check if we need to reset monthly visitor count
function shouldResetVisitorCount(lastResetAt: Date | null): boolean {
  if (!lastResetAt) return true;
  
  const now = new Date();
  const lastReset = new Date(lastResetAt);
  
  // Reset if we're in a different month
  return now.getMonth() !== lastReset.getMonth() || 
         now.getFullYear() !== lastReset.getFullYear();
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Only accept POST
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = await request.json() as {
      storeId?: number;
      path?: string;
      visitorId?: string;
      events?: Array<{ storeId?: number; path?: string; visitorId?: string }>;
    };

    const events = Array.isArray(body.events)
      ? body.events
      : [{ storeId: body.storeId, path: body.path, visitorId: body.visitorId }];

    const db = drizzle(context.cloudflare.env.DB);
    const userAgent = request.headers.get('User-Agent') || '';
    const referrer = request.headers.get('Referer') || '';
    const ipAddress = getClientIP(request);
    const deviceType = getDeviceType(userAgent);

    // Get country/city from Cloudflare headers if available
    const country = request.headers.get('CF-IPCountry') || null;
    const city = request.headers.get('CF-IPCity') || null;

    for (const event of events) {
      const { storeId, path, visitorId } = event;

      // Validate required fields
      if (!storeId || !path || !visitorId) {
        continue;
      }

      // Insert page view (wrapped in try-catch to not block on error)
      try {
        await db.insert(pageViews).values({
          storeId,
          path,
          visitorId,
          ipAddress,
          userAgent: userAgent.substring(0, 500), // Limit length
          referrer: referrer.substring(0, 500),
          country,
          city,
          deviceType,
        });
      } catch (insertError) {
        console.error('[api.track-visit] Page view insert failed:', insertError);
        // Continue to visitor count update
      }

      // Increment monthly visitor count for the store
      // Wrapped separately so failure here doesn't affect page view tracking
      try {
        const store = await db
          .select({
            visitorCountResetAt: stores.visitorCountResetAt,
            monthlyVisitorCount: stores.monthlyVisitorCount,
          })
          .from(stores)
          .where(eq(stores.id, storeId))
          .limit(1);

        if (store.length > 0) {
          const needsReset = shouldResetVisitorCount(store[0].visitorCountResetAt);

          if (needsReset) {
            // Reset counter to 1 and update reset timestamp
            await db
              .update(stores)
              .set({
                monthlyVisitorCount: 1,
                visitorCountResetAt: new Date(),
              })
              .where(eq(stores.id, storeId));
          } else {
            // Just increment the counter
            await db
              .update(stores)
              .set({
                monthlyVisitorCount: sql`COALESCE(${stores.monthlyVisitorCount}, 0) + 1`,
              })
              .where(eq(stores.id, storeId));
          }
        }
      } catch (visitorCountError) {
        console.error('[api.track-visit] Visitor count update failed:', visitorCountError);
        // Non-critical - continue
      }
    }

    return json({ success: true });
  } catch (error) {
    console.error('[api.track-visit] Unexpected error:', error);
    // Return success anyway to not block client-side rendering
    return json({ success: true });
  }
}

// Loader returns 405 - this is POST only
export function loader() {
  return json({ error: 'Method not allowed' }, { status: 405 });
}


export default function() {}
