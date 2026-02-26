/**
 * @ozzyl/sdk
 *
 * Official JavaScript/TypeScript SDK for the Ozzyl Commerce Platform API.
 *
 * @example
 * ```ts
 * import { Ozzyl } from '@ozzyl/sdk';
 *
 * const ozzyl = new Ozzyl('sk_live_your_api_key_here');
 *
 * // Products
 * const { data: products, pagination } = await ozzyl.products.list({ limit: 20 });
 * const product = await ozzyl.products.get('123');
 *
 * // Orders
 * const { data: orders } = await ozzyl.orders.list({ status: 'pending' });
 * const order = await ozzyl.orders.get('456');
 *
 * // Analytics
 * const stats = await ozzyl.analytics.summary({ from: '2026-01-01', to: '2026-01-31' });
 *
 * // Webhooks
 * const webhook = await ozzyl.webhooks.create({
 *   url: 'https://mysite.com/webhooks/ozzyl',
 *   events: ['order/created', 'order/updated'],
 *   secret: 'my_webhook_secret',
 * });
 * await ozzyl.webhooks.delete('789');
 *
 * // Store info
 * const store = await ozzyl.store.get();
 *
 * // Webhook signature verification (static — no instance needed)
 * const isValid = await Ozzyl.verifyWebhookSignature(rawBody, signature, secret);
 * ```
 *
 * @packageDocumentation
 */

// ─── Main Client ──────────────────────────────────────────────────────────────

export { Ozzyl } from './client.js';
export type { HttpClient } from './client.js';

// ─── Error Classes ────────────────────────────────────────────────────────────

export {
  OzzylError,
  OzzylAuthError,
  OzzylRateLimitError,
  OzzylNotFoundError,
  OzzylValidationError,
} from './errors.js';

// ─── Resource Classes ─────────────────────────────────────────────────────────

export { ProductsResource } from './resources/products.js';
export { OrdersResource } from './resources/orders.js';
export { AnalyticsResource } from './resources/analytics.js';
export { WebhooksResource } from './resources/webhooks.js';
export { StoreResource } from './resources/store.js';
export { EventsResource } from './resources/events.js';
export type { WebhookDeliveryLog } from './resources/events.js';
export type { ListWebhooksParams } from './resources/webhooks.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type {
  // Client options
  OzzylClientOptions,

  // Pagination
  Pagination,
  ListResponse,

  // API scopes
  ApiKeyScope,

  // Products
  Product,
  ListProductsParams,

  // Orders
  Order,
  OrderWithItems,
  OrderItem,
  OrderStatus,
  PaymentStatus,
  CourierProvider,
  ListOrdersParams,
  Address,

  // Analytics
  AnalyticsSummary,
  AnalyticsSummaryParams,
  AnalyticsDailyStat,
  AnalyticsTotals,

  // Store
  Store,
  StorePlanType,
  StoreSubscriptionStatus,

  // Webhooks
  Webhook,
  WebhookEvent,
  CreateWebhookParams,

  // Internal API envelope (useful for custom resource implementations)
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiResponse,
} from './types.js';
