# Durable Objects Guide - Order Processing System

## Overview

Ozzyl SaaS e order processing er jonno Cloudflare Durable Objects use kora hoy. Eta **FREE plan compatible** (SQLite backend) ebong instant task processing provide kore.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE EDGE                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────┐         ┌─────────────────────────────────┐   │
│  │  Main App (Pages)   │         │  Order Processor (Worker)       │   │
│  │  multi-store-saas   │ ──────► │  order-processor                │   │
│  │                     │ Service │                                 │   │
│  │  Uses:              │ Binding │  Contains:                      │   │
│  │  ORDER_PROCESSOR_   │         │  - OrderProcessor DO class      │   │
│  │  SERVICE            │         │  - SQLite storage               │   │
│  └─────────────────────┘         │  - Alarm-based retries          │   │
│                                  │                                 │   │
│                                  │  ┌───────────────────────────┐  │   │
│                                  │  │   Durable Object          │  │   │
│                                  │  │   store-{storeId}         │  │   │
│                                  │  │   - Per store isolation   │  │   │
│                                  │  │   - Persistent SQLite     │  │   │
│                                  │  └───────────────────────────┘  │   │
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
├── workers/order-processor/
│   ├── src/index.ts          # DO class + Worker entry
│   ├── wrangler.toml         # DO config (SQLite backend)
│   ├── package.json
│   └── tsconfig.json
├── app/services/
│   └── order-processor.server.ts   # Helper functions
├── wrangler.toml             # Service binding
└── env.d.ts                  # Type definitions
```

## Deployment

```bash
# Step 1: Deploy DO worker FIRST
cd apps/web/workers/order-processor
npm install
wrangler deploy

# Step 2: Deploy main app (uses service binding)
cd apps/web
npm run deploy

# Step 3: Set secrets in Cloudflare Dashboard
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
