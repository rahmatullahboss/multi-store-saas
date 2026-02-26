# `@ozzyl/sdk`

Official JavaScript/TypeScript SDK for the **Ozzyl Commerce Platform API**.

Build integrations with your Ozzyl store from WordPress, custom sites, serverless functions, Cloudflare Workers, and anywhere else JavaScript runs.

[![npm version](https://img.shields.io/npm/v/@ozzyl/sdk)](https://www.npmjs.com/package/@ozzyl/sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **Stripe-style API** — `new Ozzyl(apiKey)` with resource namespacing (`ozzyl.products`, `ozzyl.orders`, …)
- **Full TypeScript** — every response type is fully typed, zero `any`
- **Auto-retry** — exponential backoff on `429` / `5xx`, configurable retries
- **Typed error hierarchy** — `OzzylAuthError`, `OzzylRateLimitError`, `OzzylNotFoundError`, `OzzylValidationError`
- **Webhook verification** — static `Ozzyl.verifyWebhookSignature()` with replay-attack protection
- **Edge-compatible** — works in Cloudflare Workers, Deno, Node.js 18+, and browsers (Web Crypto API only)
- **Test mode** — auto-detected from `sk_test_` key prefix

---

## Installation

```bash
npm install @ozzyl/sdk
# or
pnpm add @ozzyl/sdk
# or
yarn add @ozzyl/sdk
```

> **Requirements**: Node.js ≥ 18, or any runtime with the [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) and `fetch`.

---

## Quick Start

```typescript
import { Ozzyl } from '@ozzyl/sdk';

const ozzyl = new Ozzyl('sk_live_your_api_key_here');

const { data: products } = await ozzyl.products.list({ limit: 10 });
console.log(products[0].title);
```

Get your API key from **Settings → Developer** in your [Ozzyl dashboard](https://app.ozzyl.com/settings/developer).

---

## API Reference

### Products

```typescript
// List products (paginated)
const { data, pagination } = await ozzyl.products.list();

// With filters
const { data } = await ozzyl.products.list({
  page: 1,
  limit: 20,          // 1–100, default 20
  search: 'shirt',    // Full-text search on title
  published: true,    // Filter by published status
});

// Paginate through all products
let page = 1;
let hasMore = true;
const allProducts = [];

while (hasMore) {
  const result = await ozzyl.products.list({ page, limit: 100 });
  allProducts.push(...result.data);
  hasMore = result.pagination.hasMore;
  page++;
}

// Get a single product by ID
const product = await ozzyl.products.get('123');
console.log(product.title);    // "Premium Cotton Shirt"
console.log(product.price);    // 999
console.log(product.images);   // ['https://...']
```

**Required scope**: `read_products`

---

### Orders

```typescript
// List orders
const { data: orders } = await ozzyl.orders.list();

// Filter by status
const { data: pending } = await ozzyl.orders.list({ status: 'pending' });
const { data: shipped } = await ozzyl.orders.list({ status: 'shipped', limit: 50 });

// Available statuses:
// 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

// Get a single order with all line items
const order = await ozzyl.orders.get('1001');
console.log(order.orderNumber);   // "ORD-1001"
console.log(order.total);         // 1059
console.log(order.status);        // "pending"

for (const item of order.items) {
  console.log(`${item.title} × ${item.quantity} = ৳${item.total}`);
}
```

**Required scope**: `read_orders`

---

### Analytics

```typescript
// Last 7 days (default)
const stats = await ozzyl.analytics.summary();

// Last 30 days
const monthly = await ozzyl.analytics.summary({ days: 30 });

// Specific date range
const january = await ozzyl.analytics.summary({
  from: '2026-01-01',
  to: '2026-01-31',
});

// Access totals
console.log(stats.totals.totalViews);      // 1500
console.log(stats.totals.uniqueVisitors);  // 900
console.log(stats.totals.mobileViews);     // 750

// Day-by-day breakdown
for (const day of stats.dailyStats) {
  console.log(`${day.date}: ${day.totalViews} views, ${day.ctaClicks} clicks`);
}

// Date range covered
console.log(stats.dateRange.from); // "2026-01-25"
console.log(stats.dateRange.to);   // "2026-01-31"
```

**Required scope**: `read_analytics`

---

### Store Info

```typescript
const store = await ozzyl.store.get();

console.log(store.name);               // "My Awesome Store"
console.log(store.subdomain);          // "my-awesome-store"
console.log(store.customDomain);       // "shop.mycompany.com" or null
console.log(store.currency);           // "BDT"
console.log(store.planType);           // "starter"
console.log(store.subscriptionStatus); // "active"
```

**Required scope**: any valid API key

---

### Webhooks

```typescript
// List all registered webhooks
const { data: webhooks } = await ozzyl.webhooks.list();
for (const wh of webhooks) {
  console.log(`${wh.id} — ${wh.url} (active: ${wh.isActive})`);
}

// Create a webhook endpoint
const webhook = await ozzyl.webhooks.create({
  url: 'https://mysite.com/webhooks/ozzyl',
  events: ['order/created', 'order/updated', 'order/cancelled'],
  secret: process.env.OZZYL_WEBHOOK_SECRET!, // Used to sign deliveries
});
console.log(`Created webhook ID: ${webhook.id}`);

// Available event types:
// 'order/created'    | 'order/updated'   | 'order/cancelled' | 'order/delivered'
// 'product/created'  | 'product/updated' | 'product/deleted'
// 'customer/created' | 'customer/updated'

// Delete a webhook
await ozzyl.webhooks.delete('789');
```

**Required scope**: `manage_webhooks`

---

### Webhook Signature Verification

Every webhook delivery from Ozzyl includes an `Ozzyl-Signature` header:

```
Ozzyl-Signature: t=1706745600,v1=abc123def456...
```

Verify it server-side to ensure the payload came from Ozzyl and is not a replay attack (signatures older than 5 minutes are rejected automatically).

```typescript
import { Ozzyl } from '@ozzyl/sdk';

// ── Cloudflare Worker / Hono ──────────────────────────────────────────────────
app.post('/webhooks/ozzyl', async (c) => {
  const rawBody = await c.req.text(); // Read body BEFORE parsing as JSON
  const signature = c.req.header('Ozzyl-Signature') ?? '';

  const isValid = await Ozzyl.verifyWebhookSignature(
    rawBody,
    signature,
    process.env.OZZYL_WEBHOOK_SECRET! // The secret you used when creating the webhook
  );

  if (!isValid) {
    return c.json({ error: 'Invalid webhook signature' }, 401);
  }

  const event = JSON.parse(rawBody);
  console.log('Event type:', event.type); // e.g. "order/created"

  return c.json({ ok: true });
});

// ── Express.js (Node.js 18+) ──────────────────────────────────────────────────
app.post(
  '/webhooks/ozzyl',
  express.raw({ type: 'application/json' }), // Important: raw body
  async (req, res) => {
    const rawBody = req.body.toString('utf-8');
    const signature = req.headers['ozzyl-signature'] ?? '';

    const isValid = await Ozzyl.verifyWebhookSignature(
      rawBody,
      signature,
      process.env.OZZYL_WEBHOOK_SECRET!
    );

    if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

    const event = JSON.parse(rawBody);
    // handle event...
    res.json({ ok: true });
  }
);

// ── Next.js App Router ────────────────────────────────────────────────────────
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('ozzyl-signature') ?? '';

  const isValid = await Ozzyl.verifyWebhookSignature(
    rawBody,
    signature,
    process.env.OZZYL_WEBHOOK_SECRET!
  );

  if (!isValid) {
    return Response.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  return Response.json({ ok: true });
}
```

**How it works**:
1. Ozzyl signs each delivery: `HMAC-SHA256(${timestamp}.${body}, secret)` 
2. The SDK recomputes the HMAC and compares using constant-time comparison
3. The timestamp is validated to be within ±5 minutes (replay attack prevention)

---

## Error Handling

All errors thrown by the SDK are instances of `OzzylError` or one of its subclasses:

```typescript
import {
  Ozzyl,
  OzzylError,
  OzzylAuthError,
  OzzylRateLimitError,
  OzzylNotFoundError,
  OzzylValidationError,
} from '@ozzyl/sdk';

const ozzyl = new Ozzyl('sk_live_...');

try {
  const product = await ozzyl.products.get('nonexistent');
} catch (err) {
  if (err instanceof OzzylNotFoundError) {
    // 404 — resource does not exist in your store
    console.log('Product not found');

  } else if (err instanceof OzzylAuthError) {
    // 401 / 403 — bad key, revoked, or missing scopes
    console.error('Auth error:', err.message);
    console.error('Code:', err.code);           // e.g. "invalid_api_key"
    console.error('Docs:', err.docs);            // link to documentation

  } else if (err instanceof OzzylRateLimitError) {
    // 429 — rate limited (SDK already retried 3 times)
    console.error(`Rate limited. Retry in ${err.retryAfter}s`);
    console.error(`Used ${err.used} of ${err.limit} requests`);

  } else if (err instanceof OzzylValidationError) {
    // 400 — invalid input, field-level errors available
    console.error('Validation errors:', err.fields);
    // { url: ['Must be a valid HTTPS URL'] }

  } else if (err instanceof OzzylError) {
    // Any other API error
    console.error(`API error [${err.status}/${err.code}]: ${err.message}`);
    console.error('Request ID:', err.requestId); // Share with support

  } else {
    // Network error, timeout, etc.
    throw err;
  }
}
```

### Error Properties

| Class | Extra properties |
|---|---|
| `OzzylError` (base) | `status`, `code`, `requestId`, `docs` |
| `OzzylAuthError` | _(inherits base)_ |
| `OzzylRateLimitError` | `retryAfter`, `limit`, `used` |
| `OzzylNotFoundError` | _(inherits base)_ |
| `OzzylValidationError` | `fields: Record<string, string[]>` |

---

## Configuration

```typescript
const ozzyl = new Ozzyl('sk_live_...', {
  // Override the API base URL (e.g. for a local dev server)
  baseUrl: 'http://localhost:8787/api/v1',

  // Maximum retry attempts on 429 / 5xx errors (default: 3)
  // Set to 0 to disable retries entirely
  maxRetries: 3,

  // Request timeout in milliseconds (default: 30000)
  timeout: 30_000,

  // Provide a custom fetch implementation (useful for testing)
  fetch: customFetchImpl,
});
```

---

## TypeScript Usage

The SDK ships with complete TypeScript types. All response shapes are fully typed:

```typescript
import type {
  Product,
  Order,
  OrderWithItems,
  OrderItem,
  OrderStatus,
  Store,
  Webhook,
  WebhookEvent,
  AnalyticsSummary,
  ListResponse,
  Pagination,
  OzzylClientOptions,
  ApiKeyScope,
} from '@ozzyl/sdk';

// Types are inferred from return values
const { data: products } = await ozzyl.products.list();
//    ^? Product[]  — fully typed

const order = await ozzyl.orders.get('1001');
//    ^? OrderWithItems — includes items: OrderItem[]

// Use types for your own functions
function processOrder(order: OrderWithItems): void {
  for (const item of order.items) {
    console.log(item.title, item.quantity);
  }
}

// Webhook event type for a type-safe event router
function handleWebhookEvent(type: WebhookEvent, data: unknown): void {
  switch (type) {
    case 'order/created': /* ... */ break;
    case 'order/updated': /* ... */ break;
    case 'product/created': /* ... */ break;
  }
}
```

---

## API Endpoints

| SDK Method | HTTP | Endpoint | Scope |
|---|---|---|---|
| `ozzyl.products.list(params?)` | `GET` | `/products` | `read_products` |
| `ozzyl.products.get(id)` | `GET` | `/products/:id` | `read_products` |
| `ozzyl.orders.list(params?)` | `GET` | `/orders` | `read_orders` |
| `ozzyl.orders.get(id)` | `GET` | `/orders/:id` | `read_orders` |
| `ozzyl.analytics.summary(params?)` | `GET` | `/analytics/summary` | `read_analytics` |
| `ozzyl.store.get()` | `GET` | `/store` | _(any key)_ |
| `ozzyl.webhooks.list()` | `GET` | `/webhooks` | `manage_webhooks` |
| `ozzyl.webhooks.create(data)` | `POST` | `/webhooks` | `manage_webhooks` |
| `ozzyl.webhooks.delete(id)` | `DELETE` | `/webhooks/:id` | `manage_webhooks` |

Base URL: `https://api.ozzyl.com/v1`

---

## Edge Runtime Compatibility

The SDK is built entirely on Web Platform APIs and works in all modern runtimes:

| Runtime | Supported |
|---|---|
| Cloudflare Workers | ✅ |
| Node.js 18+ | ✅ |
| Deno | ✅ |
| Bun | ✅ |
| Browsers | ✅ |
| Vercel Edge Functions | ✅ |
| AWS Lambda@Edge | ✅ |

No Node.js built-ins are used. The only dependencies are `fetch` and `crypto.subtle` (both available globally in all listed runtimes).

---

## Development

```bash
# Build (ESM + CJS + .d.ts)
npm run build

# Run tests
npm run test

# Type check
npm run typecheck

# Watch mode
npm run dev
```

---

## License

MIT © [Ozzyl](https://ozzyl.com)
