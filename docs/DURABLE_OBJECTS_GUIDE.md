# Durable Objects Guide - Multi-Store SaaS

## Overview

Ozzyl SaaS e **6ta Durable Object worker** use kora hoy - shobgulo **FREE plan compatible** (SQLite backend) ebong Shopify-level reliability provide kore.

## 🎯 All DO Workers

| Worker | Purpose | DO Pattern | Status |
|--------|---------|------------|--------|
| **order-processor** | Background task processing | `store-{storeId}` | ✅ Live |
| **cart-processor** | Race-condition free cart | `cart-{sessionId}` | ✅ Live |
| **checkout-lock** | Atomic checkout locking | `checkout-{cartId}` | ✅ Live |
| **rate-limiter** | Per-store/IP rate limiting | `ratelimit-{storeId}-{ip}` | ✅ Live |
| **store-config** | Fast config caching (D1) | `store-{storeId}` | ✅ Live |
| **editor-state** | Live page builder state | `editor-{pageId}` | ✅ Live |

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────────────────┐   │
│  │  Main App (Pages)   │         │      DO Workers (6)              │   │
│  │  multi-store-saas   │         │                                  │   │
│  │                     │ Service │  ┌────────────┐ ┌────────────┐   │   │
│  │  Service Bindings:  │ Binding │  │order-proc  │ │cart-proc   │   │   │
│  │  - ORDER_PROCESSOR  │ ──────► │  │SQLite      │ │SQLite      │   │   │
│  │  - CART_SERVICE     │         │  └────────────┘ └────────────┘   │   │
│  │  - CHECKOUT_SERVICE │         │  ┌────────────┐ ┌────────────┐   │   │
│  │  - RATE_LIMITER     │         │  │checkout    │ │rate-limit  │   │   │
│  │  - STORE_CONFIG     │         │  │lock/alarm  │ │in-memory   │   │   │
│  │  - EDITOR_STATE     │         │  └────────────┘ └────────────┘   │   │
│  └─────────────────────┘         │  ┌────────────┐ ┌────────────┐   │   │
│                                  │  │store-conf  │ │editor-state│   │   │
│                                  │  │D1+cache    │ │SQLite+undo │   │   │
│                                  │  └────────────┘ └────────────┘   │   │
│                                  └─────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## FREE Tier Limits

| Resource | Daily Limit | Our Estimate (10K orders/day) |
|----------|-------------|-------------------------------|
| Requests | 1M/day | ~30K (3%) |
| Duration | 400K GB-s | ~5K GB-s (1.25%) |
| SQLite Rows Read | 5M/day | ~100K (2%) |
| SQLite Rows Written | 100K/day | ~40K (40%) |
| Storage | 1 GB total | ~50 MB (5%) |

**Estimated Capacity: ~25K orders/day on FREE tier!**

## File Structure

```
apps/web/
├── workers/
│   ├── order-processor/      # Background task processing
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── cart-processor/       # Cart management
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── checkout-lock/        # Checkout locking
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── rate-limiter/         # Rate limiting
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── store-config/         # Config caching
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   ├── editor-state/         # Page builder state
│   │   ├── src/index.ts
│   │   ├── wrangler.toml
│   │   └── package.json
│   └── deploy-all.sh         # Deploy all workers
├── app/services/
│   ├── order-processor.server.ts
│   ├── cart-do.server.ts
│   ├── checkout-do.server.ts
│   ├── rate-limiter-do.server.ts
│   ├── store-config-do.server.ts
│   └── editor-state-do.server.ts
├── wrangler.toml             # Service bindings
└── env.d.ts                  # Type definitions
```

## Deployment

```bash
# Option 1: Deploy all workers at once (RECOMMENDED)
cd apps/web/workers
./deploy-all.sh

# Option 2: Deploy individually
cd apps/web/workers/order-processor && wrangler deploy
cd apps/web/workers/cart-processor && wrangler deploy
cd apps/web/workers/checkout-lock && wrangler deploy
cd apps/web/workers/rate-limiter && wrangler deploy
cd apps/web/workers/store-config && wrangler deploy
cd apps/web/workers/editor-state && wrangler deploy

# Then deploy main app (uses service bindings)
cd apps/web && npm run deploy

# Set secrets in Cloudflare Dashboard
# - RESEND_API_KEY (for email tasks)
```

## Usage Examples

### 1. Enqueue Tasks (Background Processing)

```typescript
import { enqueueOrderTasks } from '~/services/order-processor.server';

// In your action
export async function action({ request, context }) {
  const order = await createOrder(data);
  
  // Tasks processed in background via DO alarm
  await enqueueOrderTasks(
    context.cloudflare.env,
    order.id,
    storeId,
    [
      { 
        type: 'email', 
        payload: { 
          to: customer.email, 
          subject: 'Order Confirmed!',
          html: '<h1>Thank you!</h1>'
        } 
      },
      { 
        type: 'webhook', 
        payload: { 
          url: 'https://merchant.com/webhook',
          payload: { orderId: order.id }
        } 
      },
    ]
  );
  
  return json({ success: true });
}
```

### 2. Process Tasks Immediately (Sync)

```typescript
import { processOrderTasksSync } from '~/services/order-processor.server';

const result = await processOrderTasksSync(
  context.cloudflare.env,
  orderId,
  storeId,
  [{ type: 'email', payload: { to, subject, html } }]
);
// result.results = [{ type: 'email', success: true }]
```

### 3. Convenience Functions

```typescript
import { 
  sendOrderConfirmationEmail,
  notifyMerchantNewOrder,
  triggerOrderWebhooks
} from '~/services/order-processor.server';

// Send order confirmation
await sendOrderConfirmationEmail(env, orderId, storeId, customerEmail, {
  orderNumber: '#1234',
  total: 1500,
  currency: 'BDT',
  items: [{ name: 'Product', quantity: 1, price: 1500 }]
});

// Notify merchant
await notifyMerchantNewOrder(env, orderId, storeId, merchantEmail, 'New order!');

// Trigger webhooks
await triggerOrderWebhooks(env, orderId, storeId, webhooks, orderData);
```

## Task Types

| Type | Payload | Description |
|------|---------|-------------|
| `email` | `{ to, subject, html, from? }` | Send email via Resend |
| `webhook` | `{ url, payload, secret? }` | HTTP POST with HMAC signature |
| `inventory` | `{ productId, quantity, operation? }` | Update stock |
| `notification` | `{ title, body, url?, icon? }` | Push notification |

## Cost Optimization Features

### 1. Batch Processing
- 50 tasks per alarm cycle (reduces DO invocations)
- 500ms request batching window

### 2. Lazy Initialization
- Tables created only when first task arrives
- Zero cost if DO never used

### 3. Smart Indexing
- Single composite index `(status, next_retry)`
- Covers all query patterns

### 4. Memory Caching
- Status queries cached for 5 seconds
- Reduces SQLite reads

### 5. Alarm Debouncing
- Prevents redundant alarm scheduling
- Minimum 1 second between alarms

### 6. Aggressive Cleanup
- Completed tasks: 3 days retention
- Failed tasks: 30 days retention

## Retry Mechanism

```
Attempt 1: Immediate
Attempt 2: ~2s delay (exponential backoff)
Attempt 3: ~4s delay
→ After 3 failures: Mark as FAILED
```

- Exponential backoff with ±20% jitter
- Max delay capped at 2 minutes
- Error messages truncated to 200 chars

## Security Features

1. **Input Validation**: All requests validated
2. **Task Whitelist**: Only valid task types accepted
3. **Rate Limiting**: MAX_TASKS_PER_REQUEST: 100
4. **Memory Safety**: MAX_PENDING_BATCH: 100
5. **Webhook Signing**: HMAC-SHA256 signatures

## API Endpoints

### Worker Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/do/{storeId}/process` | Process tasks immediately |
| POST | `/do/{storeId}/enqueue` | Queue for background processing |
| GET | `/do/{storeId}/status` | Get pending/failed counts |
| POST | `/do/{storeId}/retry` | Retry failed tasks |
| GET | `/health` | Health check |

### Example API Calls

```bash
# Health check
curl https://order-processor.YOUR_SUBDOMAIN.workers.dev/health

# Enqueue tasks
curl -X POST https://order-processor.YOUR_SUBDOMAIN.workers.dev/do/123/enqueue \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 456,
    "storeId": 123,
    "tasks": [{"type": "email", "payload": {"to": "test@example.com", "subject": "Test"}}]
  }'

# Check status
curl https://order-processor.YOUR_SUBDOMAIN.workers.dev/do/123/status
```

## Troubleshooting

### DO not responding
```bash
# Check worker logs
wrangler tail order-processor
```

### Tasks stuck in pending
```bash
# Retry failed tasks
curl -X POST https://order-processor.../do/{storeId}/retry
```

### Local development
```bash
cd apps/web/workers/order-processor
wrangler dev
```

## Cloudflare Dashboard

1. **Workers & Pages** → `order-processor` worker
2. **Settings** → **Bindings** → Durable Objects
3. **Storage & Databases** → **Durable Objects** → `OrderProcessor`

## New Worker Usage Examples

### Cart Processor

```typescript
import { addToCart, getCart, removeFromCart, clearCart } from '~/services/cart-do.server';

// In loader - get cart
export async function loader({ context }) {
  const sessionId = getCartSessionId(request);
  const result = await getCart(context.cloudflare.env, sessionId);
  return json({ cart: result.cart });
}

// In action - add to cart
export async function action({ request, context }) {
  const sessionId = getCartSessionId(request);
  const { productId, quantity, price, name, storeId } = await request.json();
  
  const result = await addToCart(context.cloudflare.env, sessionId, {
    productId, quantity, price, name, storeId
  });
  
  return json(result);
}
```

### Checkout Lock

```typescript
import { withCheckoutLock } from '~/services/checkout-do.server';

// In checkout action - prevents double payment
export async function action({ request, context }) {
  const { cartId, userId } = getCheckoutData(request);
  const orderId = generateOrderId();
  
  const result = await withCheckoutLock(
    context.cloudflare.env,
    cartId,
    orderId,
    userId,
    async () => {
      // This code runs ONLY if lock acquired
      await processPayment();
      await createOrder();
      return { orderId };
    }
  );
  
  if (!result.success) {
    return json({ error: 'Payment already processing' }, { status: 409 });
  }
  
  return json({ orderId: result.result.orderId });
}
```

### Rate Limiter

```typescript
import { rateLimitMiddleware, checkRateLimit } from '~/services/rate-limiter-do.server';

// As middleware in loader/action
export async function loader({ request, context }) {
  // Throws 429 if rate limited
  await rateLimitMiddleware(
    context.cloudflare.env,
    request,
    storeId,
    'api' // preset: api, auth, checkout, upload, search
  );
  
  // Continue with normal logic
  return json({ data });
}

// Or check manually
const result = await checkRateLimit(env, storeId, clientIP, 'auth');
if (!result.allowed) {
  return json({ error: 'Too many attempts' }, { status: 429 });
}
```

### Store Config Cache

```typescript
import { getStoreConfig, invalidateStoreConfig } from '~/services/store-config-do.server';

// Get cached config (1-min TTL)
export async function loader({ context, params }) {
  const result = await getStoreConfig(context.cloudflare.env, params.storeId);
  
  if (!result.success) {
    throw new Response('Store not found', { status: 404 });
  }
  
  return json({ 
    store: result.config,
    cached: result.cached  // true if from cache
  });
}

// Invalidate after settings update
export async function action({ context, params }) {
  await updateStoreSettings(params.storeId, newSettings);
  await invalidateStoreConfig(context.cloudflare.env, params.storeId);
  return json({ success: true });
}
```

### Editor State (Page Builder)

```typescript
import { initEditor, updateSection, undo, redo, publishPage } from '~/services/editor-state-do.server';

// Initialize editor
await initEditor(env, pageId, { storeId, sections, title, slug });

// Update section (auto-saves to SQLite draft)
await updateSection(env, pageId, sectionId, { title: 'New Title' });

// Undo/Redo
await undo(env, pageId);
await redo(env, pageId);

// Publish to D1
await publishPage(env, pageId);
```

---

## Worker URLs (Production)

| Worker | URL |
|--------|-----|
| order-processor | `https://order-processor.rahmatullahzisan.workers.dev` |
| cart-processor | `https://cart-processor.rahmatullahzisan.workers.dev` |
| checkout-lock | `https://checkout-lock.rahmatullahzisan.workers.dev` |
| rate-limiter | `https://rate-limiter.rahmatullahzisan.workers.dev` |
| store-config | `https://store-config.rahmatullahzisan.workers.dev` |
| editor-state | `https://editor-state.rahmatullahzisan.workers.dev` |

---

## Comparison: Queues vs Durable Objects

| Feature | Queues | Durable Objects |
|---------|--------|-----------------|
| FREE Plan | ❌ (needs paid) | ✅ (SQLite backend) |
| Latency | ~100-500ms | ~10-50ms |
| Retry | Automatic | Manual (alarm) |
| Persistent State | No | Yes |
| Per-Store Isolation | No | Yes |
| Ordering | FIFO | Per-object |

**We chose Durable Objects for FREE plan compatibility!**
