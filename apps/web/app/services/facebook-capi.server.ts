/**
 * Facebook Conversion API (CAPI) Server Service
 * 
 * Sends server-side events to Facebook for more accurate tracking.
 * Complements browser-side Pixel, bypassing ad blockers and iOS 14+ restrictions.
 * 
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */

import { createHash } from 'crypto';

const FB_GRAPH_API_VERSION = 'v22.0';
const FB_GRAPH_API_BASE = 'https://graph.facebook.com';

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
  actionSource?: 'website' | 'app' | 'email' | 'phone_call' | 'chat' | 'physical_store' | 'other';
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
 * Hash user data using SHA256 (required by CAPI)
 */
function hashData(data: string | undefined): string | undefined {
  if (!data) return undefined;
  const normalized = data.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash('sha256').update(normalized).digest('hex');
}

/**
 * Normalize BD phone numbers to international format
 */
function normalizePhone(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  // Remove spaces, dashes
  let cleaned = phone.replace(/[\s-]/g, '');
  // Add country code if missing
  if (cleaned.startsWith('01')) {
    cleaned = '880' + cleaned.substring(1);
  } else if (cleaned.startsWith('+880')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

/**
 * Generate unique event ID for deduplication
 */
function generateEventId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
}

/**
 * Build user data object with hashed values
 * Per Meta docs: all PII must be SHA256 hashed (lowercase, trimmed)
 * except client_ip_address, client_user_agent, fbc, fbp
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api/parameters/customer-information-parameters
 */
function buildUserData(params: CAPIUserData): Record<string, string | undefined> {
  const userData: Record<string, string | undefined> = {};
  
  if (params.email) {
    userData.em = hashData(params.email);
  }
  if (params.phone) {
    userData.ph = hashData(normalizePhone(params.phone));
  }
  if (params.firstName) {
    userData.fn = hashData(params.firstName);
  }
  if (params.lastName) {
    userData.ln = hashData(params.lastName);
  }
  if (params.city) {
    // Docs: lowercase, no spaces/punctuation
    userData.ct = hashData(params.city.replace(/\s+/g, ''));
  }
  if (params.state) {
    userData.st = hashData(params.state.replace(/\s+/g, ''));
  }
  if (params.zip) {
    userData.zp = hashData(params.zip.replace(/\s+|-/g, '').toLowerCase());
  }
  if (params.country) {
    // Docs: lowercase 2-letter ISO 3166-1 alpha-2 country code
    userData.country = hashData(params.country.toLowerCase().slice(0, 2));
  }
  if (params.externalId) {
    // Docs: any unique ID from advertiser (loyalty ID, user ID) — recommended
    userData.external_id = hashData(params.externalId);
  }
  // Do NOT hash these — send as-is per Meta docs
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

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: [eventData],
        access_token: accessToken,
      }),
    });

    const result = await response.json() as { error?: { message: string } };
    
    if (!response.ok) {
      console.error('[FB CAPI] Error:', result);
      return { 
        success: false, 
        error: result.error?.message || 'Unknown error' 
      };
    }

    console.log(`[FB CAPI] ${eventName} event sent successfully for pixel ${pixelId}`);
    return { success: true };
  } catch (error) {
    console.error('[FB CAPI] Network error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Network error' 
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
      contents,
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
