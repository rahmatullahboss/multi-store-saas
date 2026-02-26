# @ozzyl/sdk — JavaScript / TypeScript SDK Guide

> Official SDK for the Ozzyl Commerce Platform API.  
> Package: `@ozzyl/sdk` | Source: `packages/sdk/`

---

## Installation

```bash
npm install @ozzyl/sdk
# or
yarn add @ozzyl/sdk
# or
pnpm add @ozzyl/sdk
```

**Requirements:** Node.js 18+ (uses native `fetch` and Web Crypto API). Works in Cloudflare Workers, Deno, and modern browsers.

---

## Quick Start

```typescript
import { Ozzyl } from '@ozzyl/sdk';

const ozzyl = new Ozzyl('sk_live_your_api_key_here');

// List products
const { data: products } = await ozzyl.products.list({ limit: 10 });

// Get a single order
const order = await ozzyl.orders.get('1001');

// Store info
const store = await ozzyl.store.get();
```

---

## Initialisation

```typescript
import { Ozzyl } from '@ozzyl/sdk';

// Minimal — uses all defaults
const ozzyl = new Ozzyl('sk_live_your_api_key_here');

// With options
const ozzyl = new Ozzyl('sk_live_your_api_key_here', {
  baseUrl: 'https://api.ozzyl.com/v1', // default
  maxRetries: 3,                        // default — retries on 429 / 5xx
  timeout: 30_000,                      // default — 30 seconds
});

// Test mode (uses sk_test_ key)
const testOzzyl = new Ozzyl('sk_test_your_test_key');
console.log(testOzzyl.isTestMode); // true
```

**Constructor options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | string | `https://api.ozzyl.com/v1` | API base URL |
| `maxRetries` | number | `3` | Auto-retry on 429 / 5xx |
| `timeout` | number | `30000` | Request timeout in ms |
| `fetch` | function | `globalThis.fetch` | Custom fetch implementation |

> The client is safe to instantiate once and share across requests in serverless / edge environments.

---

## Resources

### `ozzyl.products`

**`list(params?)`** — List products with pagination.

Required scope: `read_products`

```typescript
// Default: 20 products, newest first
const { data, pagination } = await ozzyl.products.list();

// Filter and sort
const { data } = await ozzyl.products.list({
  limit: 10,
  published: true,
  sort: 'price_asc',  // created_asc | created_desc | price_asc | price_desc | title_asc
});

// Paginate using cursor
let cursor: string | undefined;
do {
  const result = await ozzyl.products.list({ limit: 50, cursor });
  processBatch(result.data);
  cursor = result.pagination.nextCursor ?? undefined;
} while (cursor);
```

**`get(id)`** — Retrieve a single product.

Required scope: `read_products`

```typescript
const product = await ozzyl.products.get('123');
console.log(product.title, product.price);
```

---

### `ozzyl.orders`

**`list(params?)`** — List orders with optional status filter.

Required scope: `read_orders`

```typescript
// All orders
const { data: orders } = await ozzyl.orders.list();

// Filter by status
const { data: pending } = await ozzyl.orders.list({ status: 'pending' });

// Paginate
const { data, pagination } = await ozzyl.orders.list({ limit: 50 });
if (pagination.hasMore) {
  const page2 = await ozzyl.orders.list({
    limit: 50,
    cursor: pagination.nextCursor,
  });
}
```

Status values: `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `returned`

**`get(id)`** — Retrieve a single order with all line items.

Required scope: `read_orders`

```typescript
const order = await ozzyl.orders.get('1001');
console.log(`Order ${order.orderNumber} — ${order.items.length} items`);

for (const item of order.items) {
  console.log(`  ${item.title} × ${item.quantity} = ${item.total}`);
}
```

---

### `ozzyl.analytics`

**`summary(params?)`** — Retrieve store analytics summary.

Required scope: `read_analytics`

```typescript
// Last 30 days (default)
const stats = await ozzyl.analytics.summary();

// Specific period
const weekly = await ozzyl.analytics.summary({ days: 7 });

// Date range
const jan = await ozzyl.analytics.summary({
  from: '2026-01-01',
  to: '2026-01-31',
});

console.log(`Revenue: ${stats.orders.revenue}`);
console.log(`Orders: ${stats.orders.total}`);
console.log(`Avg order: ${stats.orders.avg_value}`);
console.log(`Active products: ${stats.products.active}`);
```

---

### `ozzyl.store`

**`get()`** — Retrieve store information.

Required scope: any valid key

```typescript
const store = await ozzyl.store.get();
console.log(store.name);       // "My Awesome Store"
console.log(store.subdomain);  // "my-awesome-store"
```

---

### `ozzyl.webhooks`

**`list(params?)`** — List webhook endpoints.

Required scope: `manage_webhooks`

```typescript
const { data: webhooks } = await ozzyl.webhooks.list();
for (const wh of webhooks) {
  console.log(`${wh.id} — ${wh.url} (active: ${wh.isActive})`);
}
```

**`create(params)`** — Register a new webhook.

Required scope: `manage_webhooks`

```typescript
const webhook = await ozzyl.webhooks.create({
  url: 'https://mysite.com/hooks/ozzyl',
  events: ['order/created', 'order/updated', 'order/cancelled'],
  secret: 'my_webhook_secret_at_least_16_chars',
});

console.log(`Webhook created: ${webhook.id}`);
```

Supported events: `order/created`, `order/updated`, `order/cancelled`, `order/fulfilled`, `product/created`, `product/updated`, `product/deleted`, `customer/created`, `customer/updated`, `inventory/updated`

**`delete(id)`** — Delete a webhook.

Required scope: `manage_webhooks`

```typescript
await ozzyl.webhooks.delete('789');
```

---

### `ozzyl.events`

**`list(params?)`** — List webhook delivery logs.

Required scope: `manage_webhooks`

```typescript
// All recent logs
const logs = await ozzyl.events.list({ limit: 20 });

// Logs for a specific webhook
const logs = await ozzyl.events.list({ webhookId: 42, limit: 50 });

for (const log of logs) {
  console.log(`${log.topic} → ${log.success ? '✅' : '❌'} (${log.statusCode})`);
}
```

---

## Pagination

All list methods return a `pagination` object:

```typescript
interface Pagination {
  page: number;
  limit: number;
  hasMore: boolean;
  nextCursor?: string; // pass as `cursor` on the next call
}
```

**Iterate all pages:**

```typescript
async function* allProducts(ozzyl: Ozzyl) {
  let cursor: string | undefined;
  do {
    const result = await ozzyl.products.list({ limit: 100, cursor });
    yield* result.data;
    cursor = result.pagination.hasMore ? result.pagination.nextCursor : undefined;
  } while (cursor);
}

for await (const product of allProducts(ozzyl)) {
  console.log(product.title);
}
```

---

## Error Handling

The SDK throws typed errors — always wrap calls in try/catch:

```typescript
import {
  Ozzyl,
  OzzylAuthError,
  OzzylRateLimitError,
  OzzylNotFoundError,
  OzzylValidationError,
  OzzylError,
} from '@ozzyl/sdk';

try {
  const product = await ozzyl.products.get('999');
} catch (err) {
  if (err instanceof OzzylNotFoundError) {
    // 404 — product doesn't exist in this store
    console.log('Product not found');

  } else if (err instanceof OzzylAuthError) {
    // 401 / 403 — bad key or missing scope
    console.error('Auth error:', err.message);
    // err.status is 401 or 403

  } else if (err instanceof OzzylRateLimitError) {
    // 429 — rate limited (after all retries exhausted)
    console.warn(`Rate limited. Retry after ${err.retryAfter}s`);
    console.warn(`Used ${err.used} of ${err.limit} requests this minute`);

  } else if (err instanceof OzzylValidationError) {
    // 400 — invalid request params
    console.error('Validation failed:', err.fields);
    // err.fields = { url: ['Must be a valid HTTPS URL'], ... }

  } else if (err instanceof OzzylError) {
    // Any other Ozzyl API error
    console.error(`API error [${err.status}/${err.code}]:`, err.message);
    console.error('Request ID:', err.requestId); // share with support
    console.error('Docs:', err.docs);
  }
}
```

**Error class hierarchy:**

```
OzzylError (base)
├── OzzylAuthError        (401 / 403) — invalid key or missing scope
├── OzzylRateLimitError   (429)       — rate limit exceeded
├── OzzylNotFoundError    (404)       — resource doesn't exist
└── OzzylValidationError  (400)       — invalid request parameters
```

**All `OzzylError` instances include:**

| Property | Type | Description |
|----------|------|-------------|
| `message` | string | Human-readable error message |
| `status` | number | HTTP status code |
| `code` | string | Machine-readable error code |
| `requestId` | string | `X-Request-Id` — share with support |
| `docs` | string | Link to relevant docs page |

---

## Auto-Retry

The SDK automatically retries failed requests on `429`, `500`, `502`, `503`, `504` responses using exponential backoff with jitter:

- **Attempt 1:** immediate
- **Attempt 2:** ~500ms delay
- **Attempt 3:** ~1000ms delay
- **Attempt 4:** ~2000ms delay (capped at 10s)

For `429` responses, the SDK respects the `Retry-After` header.

Retries are exhausted before a typed error is thrown. To disable retries:

```typescript
const ozzyl = new Ozzyl('sk_live_xxxx', { maxRetries: 0 });
```

---

## Webhook Signature Verification

Use the static `Ozzyl.verifyWebhookSignature()` method — no API key needed:

```typescript
import { Ozzyl } from '@ozzyl/sdk';

// Cloudflare Worker (Hono)
app.post('/hooks/ozzyl', async (c) => {
  const rawBody = await c.req.text();
  const signature = c.req.header('Ozzyl-Signature') ?? '';
  const secret = env.OZZYL_WEBHOOK_SECRET;

  const isValid = await Ozzyl.verifyWebhookSignature(rawBody, signature, secret);
  if (!isValid) {
    return c.json({ error: 'Invalid signature' }, 401);
  }

  const event = JSON.parse(rawBody);
  console.log('Event type:', event.event);   // e.g. "order/created"
  console.log('Delivery ID:', event.deliveryId);

  // Handle the event
  if (event.event === 'order/created') {
    await handleNewOrder(event.data);
  }

  return c.json({ ok: true });
});

// Express.js (Node.js 18+)
app.post('/hooks/ozzyl', express.raw({ type: 'application/json' }), async (req, res) => {
  const rawBody = req.body.toString('utf-8');
  const signature = req.headers['ozzyl-signature'] as string ?? '';

  const isValid = await Ozzyl.verifyWebhookSignature(
    rawBody,
    signature,
    process.env.OZZYL_WEBHOOK_SECRET!
  );

  if (!isValid) return res.status(401).json({ error: 'Invalid signature' });

  const event = JSON.parse(rawBody);
  // handle event...
  res.json({ ok: true });
});
```

**Signature format** (`Ozzyl-Signature` header):
```
t=1706745600,v1=abc123def456...
```

The SDK verifies:
1. `HMAC-SHA256(timestamp + "." + rawBody, secret) === v1`
2. Signature is not older than 5 minutes (replay-attack prevention)
3. Constant-time byte comparison (timing-attack prevention)

> ⚠️ Always pass the **raw request body string** — do not `JSON.parse` it first.

---

## Next.js / React Server Components

```typescript
// app/page.tsx (React Server Component)
import { Ozzyl } from '@ozzyl/sdk';

const ozzyl = new Ozzyl(process.env.OZZYL_API_KEY!);

export default async function ProductsPage() {
  const { data: products } = await ozzyl.products.list({
    limit: 12,
    published: true,
  });

  return (
    <ul>
      {products.map(p => (
        <li key={p.id}>{p.title} — ৳{p.price}</li>
      ))}
    </ul>
  );
}
```

---

## Cloudflare Workers

```typescript
import { Ozzyl } from '@ozzyl/sdk';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const ozzyl = new Ozzyl(env.OZZYL_API_KEY);
    const store = await ozzyl.store.get();
    return Response.json({ store });
  },
};
```

---

## TypeScript Types

Key types exported from `@ozzyl/sdk`:

```typescript
import type {
  Product,
  Order,
  OrderWithItems,
  OrderItem,
  Webhook,
  Store,
  AnalyticsSummary,
  ListResponse,
  OzzylClientOptions,
} from '@ozzyl/sdk';
```

All resource methods are fully typed — `list()` returns `Promise<ListResponse<T>>` and `get()` returns `Promise<T>` directly.

---

## Further Reading

- [API Reference](./API_REFERENCE.md) — full endpoint documentation
- [Quickstart](./API_PLATFORM_QUICKSTART.md) — 5-minute setup guide
- [WordPress Plugin](./WORDPRESS_PLUGIN_GUIDE.md) — WooCommerce integration
- Source: `packages/sdk/src/`
