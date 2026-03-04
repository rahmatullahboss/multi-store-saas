/**
 * Google Tag Manager (GTM) Server-Side Tracking Service
 *
 * Tracks e-commerce events server-side for GTM dataLayer.
 * Supports standard e-commerce events: page_view, add_to_cart, begin_checkout,
 * purchase, add_payment_info, and more.
 *
 * GDPR Compliance: IP addresses are anonymized before storage
 */

import type { Database } from '~/lib/db.server';
import { gtmEvents, stores } from '@db/schema';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import { validateGtmEvent } from '~/lib/validations';

export interface GtmEventParams {
  db: Database;
  storeId: number;
  sessionId: string;
  eventName: GtmEventType;
  eventData?: Record<string, unknown>;
  customerId?: number;
  isLoggedIn?: boolean;
  pageUrl?: string;
  pageTitle?: string;
  referrer?: string;
  productId?: number;
  productName?: string;
  value?: number;
  currency?: string;
  transactionId?: string;
  deviceType?: string;
  userAgent?: string;
  ipAddress?: string;
}

export type GtmEventType =
  | 'page_view'
  | 'view_item'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'begin_checkout'
  | 'add_shipping_info'
  | 'add_payment_info'
  | 'purchase'
  | 'refund'
  | 'search'
  | 'select_item'
  | 'view_item_list'
  | 'contact'
  | 'generate_lead';

/**
 * Anonymize IP address for GDPR compliance
 * Removes last octet of IPv4 or last 3 hextets of IPv6
 */
function anonymizeIp(ip: string): string {
  if (!ip) return '';

  // IPv4: Remove last octet (e.g., 192.168.1.123 → 192.168.1.0)
  if (ip.includes('.') && !ip.includes(':')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      parts[3] = '0';
      return parts.join('.');
    }
  }

  // IPv6: Remove last 3 hextets (e.g., 2001:db8::1234:5678:9abc → 2001:db8::)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 5) {
      return parts.slice(0, 5).join(':') + '::';
    }
  }

  return ip;
}

/**
 * Track a GTM event server-side
 * Includes validation and IP anonymization
 */
export async function trackGtmEvent(params: GtmEventParams): Promise<{ success: boolean; error?: string }> {
  // Validate input
  const validation = validateGtmEvent(params);
  if (!validation.valid) {
    return {
      success: false,
      error: `Validation failed: ${(validation.error || []).map((e: { message: string }) => e.message).join(', ')}`,
    };
  }

  const {
    db,
    storeId,
    sessionId,
    eventName,
    eventData,
    customerId,
    isLoggedIn,
    pageUrl,
    pageTitle,
    referrer,
    productId,
    productName,
    value,
    currency = 'BDT',
    transactionId,
    deviceType,
    userAgent,
    ipAddress,
  } = params;

  try {
    await db.insert(gtmEvents).values({
      storeId,
      sessionId,
      eventName,
      eventData: eventData ? JSON.stringify(eventData) : null,
      customerId: customerId || null,
      isLoggedIn: isLoggedIn ? 1 : 0,
      pageUrl: pageUrl || null,
      pageTitle: pageTitle || null,
      referrer: referrer || null,
      productId: productId || null,
      productName: productName || null,
      value: value || null,
      currency,
      transactionId: transactionId || null,
      deviceType: deviceType || null,
      userAgent: userAgent || null,
      ipAddress: ipAddress ? anonymizeIp(ipAddress) : null, // GDPR: Anonymize IP
    });

    return { success: true };
  } catch (error) {
    console.error('Error tracking GTM event:', error);
    return { success: false, error: 'Database insert failed' };
  }
}

/**
 * Get GTM events for a store within a date range
 */
export async function getGtmEvents(
  db: Database,
  storeId: number,
  filters?: {
    startDate?: Date;
    endDate?: Date;
    eventName?: GtmEventType;
    sessionId?: string;
  }
): Promise<(typeof gtmEvents.$inferSelect)[]> {
  const { startDate, endDate, eventName, sessionId } = filters || {};

  const conditions = [eq(gtmEvents.storeId, storeId)];

  if (startDate) conditions.push(gte(gtmEvents.createdAt, startDate));
  if (endDate) conditions.push(lte(gtmEvents.createdAt, endDate));
  if (eventName) conditions.push(eq(gtmEvents.eventName, eventName));
  if (sessionId) conditions.push(eq(gtmEvents.sessionId, sessionId));

  return db.select().from(gtmEvents).where(and(...conditions)).orderBy(desc(gtmEvents.createdAt));
}

/**
 * Get GTM event statistics for analytics
 */
export async function getGtmEventStats(
  db: Database,
  storeId: number,
  startDate: Date,
  endDate: Date
): Promise<{
  totalEvents: number;
  eventsByType: Record<string, number>;
  totalRevenue: number;
  uniqueSessions: number;
  conversionRate: number;
}> {
  const events = await getGtmEvents(db, storeId, { startDate, endDate });

  const eventsByType: Record<string, number> = {};
  const uniqueSessions = new Set<string>();
  let totalRevenue = 0;
  let purchaseCount = 0;
  let checkoutCount = 0;

  for (const event of events) {
    eventsByType[event.eventName] = (eventsByType[event.eventName] || 0) + 1;
    uniqueSessions.add(event.sessionId);

    if (event.eventName === 'purchase' && event.value) {
      totalRevenue += event.value;
      purchaseCount++;
    }

    if (event.eventName === 'begin_checkout') {
      checkoutCount++;
    }
  }

  const conversionRate = checkoutCount > 0 ? (purchaseCount / checkoutCount) * 100 : 0;

  return {
    totalEvents: events.length,
    eventsByType,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    uniqueSessions: uniqueSessions.size,
    conversionRate: Math.round(conversionRate * 100) / 100,
  };
}

/**
 * Get GTM funnel conversion data
 */
export async function getGtmFunnelData(
  db: Database,
  storeId: number,
  startDate: Date,
  endDate: Date
): Promise<{
  pageViews: number;
  viewItems: number;
  addToCarts: number;
  checkouts: number;
  payments: number;
  purchases: number;
  viewToCartRate: number;
  cartToCheckoutRate: number;
  checkoutToPurchaseRate: number;
}> {
  const events = await getGtmEvents(db, storeId, { startDate, endDate });

  const counts: Record<string, number> = {
    page_view: 0,
    view_item: 0,
    add_to_cart: 0,
    begin_checkout: 0,
    add_payment_info: 0,
    purchase: 0,
  };

  for (const event of events) {
    if (counts[event.eventName] !== undefined) {
      counts[event.eventName]++;
    }
  }

  const viewToCartRate =
    counts.view_item > 0 ? (counts.add_to_cart / counts.view_item) * 100 : 0;
  const cartToCheckoutRate =
    counts.add_to_cart > 0 ? (counts.begin_checkout / counts.add_to_cart) * 100 : 0;
  const checkoutToPurchaseRate =
    counts.begin_checkout > 0 ? (counts.purchase / counts.begin_checkout) * 100 : 0;

  return {
    pageViews: counts.page_view,
    viewItems: counts.view_item,
    addToCarts: counts.add_to_cart,
    checkouts: counts.begin_checkout,
    payments: counts.add_payment_info,
    purchases: counts.purchase,
    viewToCartRate: Math.round(viewToCartRate * 100) / 100,
    cartToCheckoutRate: Math.round(cartToCheckoutRate * 100) / 100,
    checkoutToPurchaseRate: Math.round(checkoutToPurchaseRate * 100) / 100,
  };
}

/**
 * Get store's GTM container ID
 */
export async function getStoreGtmContainerId(db: Database, storeId: number): Promise<string | null> {
  const store = await db.select({ googleTagManagerId: stores.googleTagManagerId }).from(stores).where(eq(stores.id, storeId)).limit(1);
  return store[0]?.googleTagManagerId || null;
}

/**
 * Generate GTM script tag for storefront
 */
export function generateGtmScript(gtmId: string): string {
  return `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->
  `.trim();
}

/**
 * Generate GTM noscript tag for storefront
 */
export function generateGtmNoScript(gtmId: string): string {
  return `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
  `.trim();
}
