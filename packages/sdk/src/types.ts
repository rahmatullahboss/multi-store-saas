/**
 * @ozzyl/sdk — TypeScript Types
 *
 * All public-facing types used by the SDK.
 * Mirrors the Ozzyl Commerce Platform API v1 response shapes exactly.
 */

// ─── Client Options ────────────────────────────────────────────────────────────

/** Configuration options for the OzzylClient. */
export interface OzzylClientOptions {
  /**
   * Override the default API base URL.
   * @default "https://api.ozzyl.com/v1"
   */
  baseUrl?: string;

  /**
   * Maximum number of automatic retries on retryable errors (429, 5xx).
   * Set to `0` to disable retries.
   * @default 3
   */
  maxRetries?: number;

  /**
   * Request timeout in milliseconds.
   * @default 30000
   */
  timeout?: number;

  /**
   * Custom fetch implementation. Useful for testing or environments where
   * the global `fetch` is not available.
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;
}

// ─── API Key Scopes ────────────────────────────────────────────────────────────

/**
 * All valid API key scopes.
 * Matches the scopes defined in the Ozzyl API Platform.
 */
export type ApiKeyScope =
  | 'read_products'
  | 'write_products'
  | 'read_orders'
  | 'write_orders'
  | 'read_customers'
  | 'write_customers'
  | 'read_analytics'
  | 'read_inventory'
  | 'write_inventory'
  | 'manage_webhooks';

// ─── Pagination ────────────────────────────────────────────────────────────────

/** Pagination metadata returned on list endpoints. */
export interface Pagination {
  /** Current page number (1-indexed). */
  page: number;
  /** Number of items per page. */
  limit: number;
  /** Whether there are more items beyond this page. */
  hasMore: boolean;
  /**
   * Cursor for the next page. Pass as `cursor` param to fetch the next page.
   * Present only when `hasMore` is true.
   */
  nextCursor: string | undefined;
}

/** A paginated list response. */
export interface ListResponse<T> {
  /** The list of items for the current page. */
  data: T[];
  /** Pagination metadata. */
  pagination: Pagination;
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * A product in the Ozzyl store.
 * Returned by `ozzyl.products.list()` and `ozzyl.products.get()`.
 */
export interface Product {
  /** Unique numeric ID of the product. */
  id: number;
  /** The store this product belongs to. */
  storeId: number;
  /** Product title / name. */
  title: string;
  /** Full product description (may contain HTML). */
  description: string | null;
  /** Selling price in the store's currency. */
  price: number;
  /** Original / compare-at price (for showing a strikethrough). */
  compareAtPrice: number | null;
  /** Available stock quantity. */
  inventory: number | null;
  /** Stock-keeping unit code. */
  sku: string | null;
  /** Primary image URL. */
  imageUrl: string | null;
  /** All product image URLs. */
  images: string[];
  /** Product category name. */
  category: string | null;
  /** Product tags for filtering and search. */
  tags: string[];
  /** Whether the product is visible in the storefront. */
  isPublished: boolean;
  /** SEO meta title. */
  seoTitle: string | null;
  /** SEO meta description. */
  seoDescription: string | null;
  /** SEO keywords list. */
  seoKeywords: string[] | null;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string;
}

/** Query parameters for `ozzyl.products.list()`. */
export interface ListProductsParams {
  /** Page number to fetch (1-indexed). @default 1 */
  page?: number;
  /** Number of products per page (1–100). @default 20 */
  limit?: number;
  /** Full-text search on product titles. */
  search?: string;
  /** Filter by published status. */
  published?: boolean;
}

// ─── Address ──────────────────────────────────────────────────────────────────

/** A structured postal address. Used for shipping and billing on orders. */
export interface Address {
  /** Recipient name. */
  name?: string;
  /** Street address line 1. */
  line1: string;
  /** Street address line 2 (apartment, suite, etc.). */
  line2?: string | null;
  /** City or town. */
  city: string;
  /** District or state. */
  district?: string | null;
  /** Postal / ZIP code. */
  postalCode?: string | null;
  /** ISO 3166-1 alpha-2 country code, e.g. `"BD"`. */
  country: string;
  /** Contact phone number. */
  phone?: string | null;
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/** Possible states of an order in its lifecycle. */
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

/** Payment status of an order. */
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'reversed';

/** Courier providers integrated with Ozzyl. */
export type CourierProvider = 'pathao' | 'redx' | 'steadfast';

/**
 * A single line-item within an order.
 */
export interface OrderItem {
  /** Unique numeric ID of the order item. */
  id: number;
  /** ID of the associated product (null if product was deleted). */
  productId: number | null;
  /** ID of the associated product variant (null if no variant or deleted). */
  variantId: number | null;
  /** Product title at time of purchase. */
  title: string;
  /** Variant label, e.g. `"Red / Large"`. */
  variantTitle: string | null;
  /** Number of units purchased. */
  quantity: number;
  /** Unit price at time of purchase. */
  price: number;
  /** Line total (`price × quantity`). */
  total: number;
}

/**
 * An order in the Ozzyl store.
 * Returned by `ozzyl.orders.list()` and `ozzyl.orders.get()`.
 */
export interface Order {
  /** Unique numeric ID of the order. */
  id: number;
  /** The store this order belongs to. */
  storeId: number;
  /** ID of the linked customer record (null for guest orders). */
  customerId: number | null;
  /** Human-readable order number, e.g. `"ORD-1042"`. */
  orderNumber: string;
  /** Customer email address. */
  customerEmail: string | null;
  /** Customer phone number. */
  customerPhone: string | null;
  /** Customer display name. */
  customerName: string | null;
  /** Shipping address. */
  shippingAddress: Address | null;
  /** Billing address. */
  billingAddress: Address | null;
  /** Current fulfillment status. */
  status: OrderStatus;
  /** Current payment status. */
  paymentStatus: PaymentStatus;
  /** Payment method used, e.g. `"cod"`, `"bkash"`. */
  paymentMethod: string | null;
  /** External transaction ID for digital payments. */
  transactionId: string | null;
  /** Courier provider assigned for delivery. */
  courierProvider: CourierProvider | null;
  /** Tracking / consignment ID from the courier. */
  courierConsignmentId: string | null;
  /** Latest status string from the courier. */
  courierStatus: string | null;
  /** Order subtotal before tax and shipping. */
  subtotal: number;
  /** Tax amount. */
  tax: number;
  /** Shipping cost. */
  shipping: number;
  /** Grand total charged to the customer. */
  total: number;
  /** Internal notes from the merchant. */
  notes: string | null;
  /** UTM source for attribution, e.g. `"facebook"`. */
  utmSource: string | null;
  /** UTM medium for attribution, e.g. `"cpc"`. */
  utmMedium: string | null;
  /** UTM campaign name. */
  utmCampaign: string | null;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string;
}

/** An order with its line items included. Returned by `ozzyl.orders.get()`. */
export interface OrderWithItems extends Order {
  /** The individual line items in this order. */
  items: OrderItem[];
}

/** Query parameters for `ozzyl.orders.list()`. */
export interface ListOrdersParams {
  /** Number of orders to return (1–100). @default 20 */
  limit?: number;
  /** Filter by fulfillment status. */
  status?: OrderStatus;
  /** Page number to fetch (1-indexed). @default 1 */
  page?: number;
  /** Cursor for the next page (page-based internally). */
  cursor?: string;
}

// ─── Analytics ────────────────────────────────────────────────────────────────

/** Daily analytics breakdown for the store. */
export interface AnalyticsDailyStat {
  /** Date in `YYYY-MM-DD` format. */
  date: string;
  /** Total page views. */
  totalViews: number;
  /** Unique visitors (privacy-safe fingerprint). */
  uniqueVisitors: number;
  /** Views from mobile devices. */
  mobileViews: number;
  /** Views from tablet devices. */
  tabletViews: number;
  /** Views from desktop devices. */
  desktopViews: number;
  /** Average scroll depth percentage (0–100). */
  avgScrollDepth: number;
  /** Number of CTA button clicks. */
  ctaClicks: number;
  /** Number of form submissions. */
  formSubmits: number;
}

/** Aggregated analytics totals over the requested period. */
export interface AnalyticsTotals {
  /** Total page views in the period. */
  totalViews: number;
  /** Unique visitors in the period. */
  uniqueVisitors: number;
  /** Average scroll depth across all views. */
  avgScrollDepth: number;
  /** Total CTA button clicks. */
  ctaClicks: number;
  /** Total mobile views. */
  mobileViews: number;
  /** Total tablet views. */
  tabletViews: number;
  /** Total desktop views. */
  desktopViews: number;
}

/**
 * Analytics summary response from `ozzyl.analytics.summary()`.
 */
export interface AnalyticsSummary {
  /** Day-by-day breakdown for the requested period. */
  dailyStats: AnalyticsDailyStat[];
  /** Aggregate totals for the entire period. */
  totals: AnalyticsTotals;
  /** The actual date range covered by the data. */
  dateRange: {
    /** Start date in `YYYY-MM-DD` format. */
    from: string;
    /** End date in `YYYY-MM-DD` format. */
    to: string;
  };
}

/** Query parameters for `ozzyl.analytics.summary()`. */
export interface AnalyticsSummaryParams {
  /** Start date in `YYYY-MM-DD` format. */
  from?: string;
  /** End date in `YYYY-MM-DD` format. */
  to?: string;
  /** Number of days to look back (alternative to from/to). @default 7 */
  days?: number;
}

// ─── Store ────────────────────────────────────────────────────────────────────

/** Store plan type. */
export type StorePlanType = 'free' | 'starter' | 'premium' | 'business' | 'custom';

/** Store subscription status. */
export type StoreSubscriptionStatus = 'active' | 'past_due' | 'canceled';

/**
 * Store information returned by `ozzyl.store.get()`.
 * Sensitive fields (payment credentials, internal config) are excluded.
 */
export interface Store {
  /** Unique numeric ID of the store. */
  id: number;
  /** Store display name. */
  name: string;
  /** Subdomain slug, e.g. `"my-store"` → `my-store.ozzyl.com`. */
  subdomain: string;
  /** Custom domain if configured, e.g. `"shop.mycompany.com"`. */
  customDomain: string | null;
  /** Store tagline / slogan. */
  tagline: string | null;
  /** Store description for SEO and about pages. */
  description: string | null;
  /** Logo image URL. */
  logo: string | null;
  /** Banner image URL. */
  bannerUrl: string | null;
  /** Active theme identifier. */
  theme: string | null;
  /** Store currency code, e.g. `"BDT"`. */
  currency: string;
  /** Default language code. */
  defaultLanguage: 'en' | 'bn';
  /** Current subscription plan. */
  planType: StorePlanType;
  /** Current subscription status. */
  subscriptionStatus: StoreSubscriptionStatus;
  /** Whether the store is active and publicly accessible. */
  isActive: boolean;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string;
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

/**
 * All webhook event types that Ozzyl can deliver.
 * Subscribe to one or more events when creating a webhook.
 */
export type WebhookEvent =
  | 'order/created'
  | 'order/updated'
  | 'order/cancelled'
  | 'order/delivered'
  | 'product/created'
  | 'product/updated'
  | 'product/deleted'
  | 'customer/created'
  | 'customer/updated';

/**
 * A registered webhook endpoint.
 * Returned by `ozzyl.webhooks.list()` and `ozzyl.webhooks.create()`.
 */
export interface Webhook {
  /** Unique numeric ID of the webhook. */
  id: number;
  /** The store this webhook belongs to. */
  storeId: number;
  /** The HTTPS URL that receives webhook POST requests. */
  url: string;
  /** The event topics this webhook is subscribed to. */
  events: WebhookEvent[];
  /**
   * @deprecated Use `events` instead.
   */
  topics: string;
  /** Whether the webhook is enabled and will receive deliveries. */
  isActive: boolean;
  /** Number of consecutive delivery failures. Reset on success. */
  failureCount: number;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** ISO 8601 last-update timestamp. */
  updatedAt: string | null;
}

/** Payload for `ozzyl.webhooks.create()`. */
export interface CreateWebhookParams {
  /** The HTTPS URL that will receive webhook POST requests. */
  url: string;
  /**
   * One or more event topics to subscribe to.
   * @example ['order/created', 'order/updated']
   */
  events: WebhookEvent[];
  /**
   * A secret string used to sign webhook payloads (HMAC-SHA256).
   * Store this securely — you'll use it to verify incoming requests.
   * If omitted, Ozzyl will generate one for you (but you won't see it again).
   */
  secret?: string;
}

// ─── Raw API Response Envelope ─────────────────────────────────────────────────

/** Internal: success response envelope from the Ozzyl API. */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/** Internal: error response envelope from the Ozzyl API. */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  fields?: Record<string, string[]>;
}

/** Internal: union of possible API response shapes. */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
