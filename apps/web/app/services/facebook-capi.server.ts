/**
 * Facebook Conversion API (CAPI) Server Service
 * 
 * Sends server-side events to Facebook for more accurate tracking.
 * Complements browser-side Pixel, bypassing ad blockers and iOS 14+ restrictions.
 * 
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */

import { createHash } from 'crypto';

const FB_GRAPH_API_VERSION = 'v22.0';
const FB_GRAPH_API_BASE = 'https://graph.facebook.com';

/**
 * Platform identifier sent as partner_agent.
 * Helps Meta attribute events to our platform.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/set-up-conversions-api-as-a-platform
 */
const PARTNER_AGENT = 'ozzyl-saas-1.0';

// ============================================================================
// TYPES
// ============================================================================

interface CAPIUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  externalId?: string; // Customer/user ID for improved match quality
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string; // Facebook click ID (from _fbc cookie)
  fbp?: string; // Facebook browser ID (from _fbp cookie)
}

interface CAPIEventParams {
  pixelId: string;
  accessToken: string;
  eventName: string;
  eventTime?: number;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: CAPIUserData;
  customData?: Record<string, unknown>;
  actionSource?: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'system_generated' | 'other';
  /**
   * Test event code from Meta Events Manager > Test Events tab.
   * Include ONLY during testing — remove for production.
   * @see https://developers.facebook.com/docs/marketing-api/conversions-api/using-the-api#test-events-tool
   */
  testEventCode?: string;
}

interface PurchaseEventParams {
  pixelId: string;
  accessToken: string;
  orderId: number;
  orderNumber: string;
  total: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  /** Customer/user ID for improved match quality (hashed as external_id) */
  customerId?: string | number;
  /** Customer city/district name — improves EMQ score */
  city?: string;
  /** Customer state/division — improves EMQ score */
  state?: string;
  /** Customer postal/zip code — improves EMQ score */
  zip?: string;
  items?: Array<{
    productId: number;
    title: string;
    quantity: number;
    price: number;
  }>;
  eventSourceUrl?: string;
  clientIpAddress?: string;
  clientUserAgent?: string;
  /** Shared eventId for deduplication with browser Pixel */
  eventId?: string;
  /** Facebook browser ID from _fbp cookie (improves match rate) */
  fbp?: string;
  /** Facebook click ID from _fbc cookie (improves match rate) */
  fbc?: string;
}

interface ViewContentEventParams {
  pixelId: string;
  accessToken: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  customerEmail?: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerId?: string | number;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}

interface AddToCartEventParams {
  pixelId: string;
  accessToken: string;
  productId: string;
  productName: string;
  value: number;
  currency: string;
  quantity: number;
  customerEmail?: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerId?: string | number;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}

interface LeadEventParams {
  pixelId: string;
  accessToken: string;
  customerEmail?: string;
  customerPhone?: string;
  customerName?: string;
  customerId?: string | number;
  clientIpAddress?: string;
  clientUserAgent?: string;
  eventSourceUrl?: string;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Hash data using SHA256 as required by Meta CAPI.
 * Input must already be normalized BEFORE calling this function.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  if (!data.trim()) return undefined;
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Normalize phone number per Meta docs:
 * "Remove symbols, letters, and any leading zeros. Always include country code."
 * BD format: 01XXXXXXXXX → 8801XXXXXXXXX
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  // Remove ALL non-digit characters (spaces, dashes, parens, plus, letters)
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return undefined;
  // BD local format: starts with 01 (10 digits) → prepend 880
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    cleaned = '880' + cleaned.substring(1);
  } else if (cleaned.startsWith('8801') && cleaned.length === 13) {
    // Already has country code — fine
  } else if (cleaned.startsWith('880') && cleaned.length === 12) {
    // Already has country code (without leading zero) — fine
  }
  return cleaned;
}

/**
 * Normalize name per Meta docs:
 * "Lowercase only with no punctuation. Special characters in UTF-8."
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function normalizeName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return name
    .trim()
    .toLowerCase()
    // Remove punctuation — keep unicode letters (includes Bangla vowel marks \p{M}), numbers, spaces
    // \p{L} = letters, \p{M} = marks/diacritics (Bangla ি ু ে etc.), \p{N} = numbers
    .replace(/[^\p{L}\p{M}\p{N}\s]/gu, '')
    .trim();
}

/**
 * Normalize city per Meta docs:
 * "Lowercase only, no punctuation, special characters, or spaces."
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function normalizeCity(city: string | undefined): string | undefined {
  if (!city) return undefined;
  return city
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, ''); // Remove ALL non-letter/non-digit chars including spaces
}

/**
 * Normalize state per Meta docs:
 * "Lowercase with no punctuation, special characters, or spaces."
 * For US: 2-character ANSI abbreviation. For others: full name normalized.
 */
function normalizeState(state: string | undefined): string | undefined {
  if (!state) return undefined;
  return state
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/**
 * Normalize zip/postal code per Meta docs:
 * "Lowercase with no spaces or dashes."
 */
function normalizeZip(zip: string | undefined): string | undefined {
  if (!zip) return undefined;
  return zip.trim().toLowerCase().replace(/[\s-]/g, '');
}

/**
 * Generate unique event ID for deduplication.
 */
function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Build user_data object with properly normalized + hashed values.
 * Per Meta docs: all PII must be SHA256 hashed AFTER normalization.
 * client_ip_address, client_user_agent, fbc, fbp — do NOT hash.
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function buildUserData(params: CAPIUserData): Record<string, string | undefined> {
  const userData: Record<string, string | undefined> = {};

  // em: trim + lowercase before hashing
  if (params.email) {
    userData.em = hashData(params.email.trim().toLowerCase());
  }
  // ph: remove non-digits + add country code before hashing
  if (params.phone) {
    userData.ph = hashData(normalizePhone(params.phone));
  }
  // fn: lowercase, no punctuation
  if (params.firstName) {
    userData.fn = hashData(normalizeName(params.firstName));
  }
  // ln: lowercase, no punctuation
  if (params.lastName) {
    userData.ln = hashData(normalizeName(params.lastName));
  }
  // ct: lowercase, no spaces/punctuation/special chars
  if (params.city) {
    userData.ct = hashData(normalizeCity(params.city));
  }
  // st: lowercase, no spaces/punctuation
  if (params.state) {
    userData.st = hashData(normalizeState(params.state));
  }
  // zp: lowercase, no spaces or dashes
  if (params.zip) {
    userData.zp = hashData(normalizeZip(params.zip));
  }
  // country: lowercase 2-letter ISO 3166-1 alpha-2
  if (params.country) {
    userData.country = hashData(params.country.trim().toLowerCase().slice(0, 2));
  }
  // external_id: hashing recommended
  if (params.externalId) {
    userData.external_id = hashData(params.externalId.trim());
  }

  // The following are NOT hashed — send raw per Meta docs
  if (params.clientIpAddress) {
    userData.client_ip_address = params.clientIpAddress;
  }
  if (params.clientUserAgent) {
    userData.client_user_agent = params.clientUserAgent;
  }
  if (params.fbc) {
    userData.fbc = params.fbc;
  }
  if (params.fbp) {
    userData.fbp = params.fbp;
  }

  return userData;
}

// ============================================================================
// CORE API
// ============================================================================

/**
 * Send event to Facebook Conversion API
 */
async function sendEvent(params: CAPIEventParams): Promise<{ success: boolean; error?: string }> {
  const {
    pixelId,
    accessToken,
    eventName,
    eventTime = Math.floor(Date.now() / 1000),
    eventId = generateEventId(),
    eventSourceUrl,
    userData = {},
    customData = {},
    actionSource = 'website',
    testEventCode,
  } = params;

  const url = `${FB_GRAPH_API_BASE}/${FB_GRAPH_API_VERSION}/${pixelId}/events`;

  const eventData = {
    event_name: eventName,
    event_time: eventTime,
    event_id: eventId,
    action_source: actionSource,
    user_data: buildUserData(userData),
    custom_data: customData,
    ...(eventSourceUrl && { event_source_url: eventSourceUrl }),
  };

  const body: Record<string, unknown> = {
    data: [eventData],
    access_token: accessToken,
    // partner_agent: identifies our platform to Meta for attribution
    // @see https://developers.facebook.com/docs/marketing-api/conversions-api/set-up-conversions-api-as-a-platform
    partner_agent: PARTNER_AGENT,
  };

  // test_event_code: only include during testing (Events Manager > Test Events tab)
  // NEVER include in production payloads
  if (testEventCode) {
    body.test_event_code = testEventCode;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const result = await response.json() as {
      events_received?: number;
      error?: { message: string; code?: number; fbtrace_id?: string };
      warnings?: string[];
    };

    if (!response.ok) {
      console.error(`[FB CAPI] Error sending ${eventName}:`, result.error);
      return {
        success: false,
        error: result.error?.message || 'Unknown error',
      };
    }

    if (result.warnings?.length) {
      console.warn(`[FB CAPI] ${eventName} warnings:`, result.warnings);
    }

    console.log(`[FB CAPI] ${eventName} sent (pixel: ${pixelId}, events_received: ${result.events_received ?? 1})`);
    return { success: true };
  } catch (error) {
    console.error('[FB CAPI] Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// ============================================================================
// EVENT FUNCTIONS
// ============================================================================

/**
 * Send Purchase event (after order completion)
 */
export async function sendPurchaseEvent(params: PurchaseEventParams): Promise<{ success: boolean; error?: string }> {
  const contentIds = params.items?.map(item => String(item.productId)) || [];
  const contents = params.items?.map(item => ({
    id: String(item.productId),
    quantity: item.quantity,
    item_price: item.price,
  })) || [];

  // Split customer name into first/last if provided
  const nameParts = params.customerName?.trim().split(/\s+/) || [];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

  return sendEvent({
    pixelId: params.pixelId,
    accessToken: params.accessToken,
    eventName: 'Purchase',
    eventId: params.eventId || `purchase_${params.orderId}_${Date.now()}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.customerEmail,
      phone: params.customerPhone,
      firstName,
      lastName,
      // Location fields — each improves EMQ score
      city: params.city,
      state: params.state,
      zip: params.zip,
      // Always send country for BD stores — improves global match rate
      country: 'bd',
      externalId: params.customerId != null ? String(params.customerId) : undefined,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    },
    customData: {
      value: params.total,
      // Meta docs: currency must be lowercase ISO 4217 code
      currency: params.currency.toLowerCase(),
      order_id: params.orderNumber,
      content_type: 'product',
      content_ids: contentIds,
      // contents items include delivery_category per Meta docs
      // Bangladesh is all home delivery
      contents: contents.map((c) => ({ ...c, delivery_category: 'home_delivery' })),
      num_items: params.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
    },
  });
}

/**
 * Send ViewContent event (product page view)
 */
export async function sendViewContentEvent(params: ViewContentEventParams): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    pixelId: params.pixelId,
    accessToken: params.accessToken,
    eventName: 'ViewContent',
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.customerEmail,
      phone: params.customerPhone,
      firstName: params.customerFirstName,
      lastName: params.customerLastName,
      country: 'bd',
      externalId: params.customerId != null ? String(params.customerId) : undefined,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    },
    customData: {
      value: params.value,
      currency: params.currency.toLowerCase(),
      content_type: 'product',
      content_ids: [params.productId],
      content_name: params.productName,
    },
  });
}

/**
 * Send AddToCart event
 */
export async function sendAddToCartEvent(params: AddToCartEventParams): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    pixelId: params.pixelId,
    accessToken: params.accessToken,
    eventName: 'AddToCart',
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.customerEmail,
      phone: params.customerPhone,
      firstName: params.customerFirstName,
      lastName: params.customerLastName,
      country: 'bd',
      externalId: params.customerId != null ? String(params.customerId) : undefined,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    },
    customData: {
      value: params.value * params.quantity,
      currency: params.currency.toLowerCase(),
      content_type: 'product',
      content_ids: [params.productId],
      content_name: params.productName,
      num_items: params.quantity,
    },
  });
}

// ============================================================================
// INITIATE CHECKOUT EVENT
// ============================================================================

interface InitiateCheckoutEventParams {
  pixelId: string;
  accessToken: string;
  value: number;
  currency: string;
  numItems: number;
  contentIds: string[];
  customerEmail?: string;
  customerPhone?: string;
  customerFirstName?: string;
  customerLastName?: string;
  customerId?: string | number;
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
  /** Shared eventId for deduplication with browser Pixel */
  eventId?: string;
}

/**
 * Send InitiateCheckout event — fired when user enters checkout flow.
 * @see https://developers.facebook.com/docs/meta-pixel/reference#standard-events
 */
export async function sendInitiateCheckoutEvent(
  params: InitiateCheckoutEventParams
): Promise<{ success: boolean; error?: string }> {
  return sendEvent({
    pixelId: params.pixelId,
    accessToken: params.accessToken,
    eventName: 'InitiateCheckout',
    eventId: params.eventId || `initiate_checkout_${Date.now()}`,
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.customerEmail,
      phone: params.customerPhone,
      firstName: params.customerFirstName,
      lastName: params.customerLastName,
      country: 'bd',
      externalId: params.customerId != null ? String(params.customerId) : undefined,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    },
    customData: {
      value: params.value,
      // Meta docs: currency must be lowercase ISO 4217 code
      currency: params.currency.toLowerCase(),
      num_items: params.numItems,
      content_type: 'product',
      content_ids: params.contentIds,
    },
  });
}

/**
 * Send Lead event (contact form submission, newsletter signup)
 */
export async function sendLeadEvent(params: LeadEventParams): Promise<{ success: boolean; error?: string }> {
  const nameParts = params.customerName?.trim().split(/\s+/) || [];
  const firstName = nameParts[0];
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

  return sendEvent({
    pixelId: params.pixelId,
    accessToken: params.accessToken,
    eventName: 'Lead',
    eventSourceUrl: params.eventSourceUrl,
    userData: {
      email: params.customerEmail,
      phone: params.customerPhone,
      firstName,
      lastName,
      country: 'bd',
      externalId: params.customerId != null ? String(params.customerId) : undefined,
      clientIpAddress: params.clientIpAddress,
      clientUserAgent: params.clientUserAgent,
    },
  });
}
