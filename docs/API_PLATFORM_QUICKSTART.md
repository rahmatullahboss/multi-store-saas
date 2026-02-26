# Ozzyl API Platform — 5-Minute Quickstart

> Get your first API call working in under 5 minutes.

**Base URL:** `https://api.ozzyl.com/v1`

---

## Step 1 — Get Your API Key

1. Log in to your Ozzyl store at [app.ozzyl.com](https://app.ozzyl.com)
2. Go to **Settings → Developer**
3. Click **Create API Key**
4. Select the scopes you need (e.g. `read_products`, `read_orders`)
5. Copy the key — it starts with `sk_live_` and is shown **only once**

> Use `sk_test_` keys during development so you never touch production data.

---

## Step 2 — Make Your First Request

Verify your key is working with the ping endpoint:

```bash
curl https://api.ozzyl.com/v1/ping \
  -H "Authorization: Bearer sk_live_your_key_here"
```

Expected response:

```json
{
  "success": true,
  "message": "pong",
  "store_id": 42,
  "mode": "live",
  "scopes": ["read_products", "read_orders"],
  "timestamp": "2026-02-24T10:00:00.000Z"
}
```

If you see `"success": true` — you're connected. ✅

---

## Step 3 — Fetch Your Products

```bash
curl "https://api.ozzyl.com/v1/products?limit=5&published=true" \
  -H "Authorization: Bearer sk_live_your_key_here"
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Premium Cotton T-Shirt",
      "price": 1299,
      "isPublished": true,
      "inventory": 50,
      "sku": "TSH-001"
    }
  ],
  "pagination": {
    "limit": 5,
    "has_more": true,
    "next_cursor": "MTIz"
  }
}
```

To get the next page, pass the cursor:

```bash
curl "https://api.ozzyl.com/v1/products?limit=5&cursor=MTIz" \
  -H "Authorization: Bearer sk_live_your_key_here"
```

---

## Step 4 — Fetch Your Orders

```bash
curl "https://api.ozzyl.com/v1/orders?status=pending" \
  -H "Authorization: Bearer sk_live_your_key_here"
```

---

## Step 5 — (Optional) Set Up a Webhook

Register a URL to receive real-time order notifications:

```bash
curl -X POST https://api.ozzyl.com/v1/webhooks \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yoursite.com/hooks/ozzyl",
    "events": ["order/created", "order/updated"]
  }'
```

Ozzyl will `POST` a signed JSON payload to your URL whenever a matching event occurs. Save the `secret` from the response to verify deliveries.

**Verify the signature** in your endpoint:

```typescript
// Cloudflare Worker / Node.js 18+
import crypto from 'crypto';

function verifyOzzylWebhook(rawBody: string, signatureHeader: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signatureHeader.split(',').map(p => p.split('=') as [string, string])
  );
  const { t: timestamp, v1: sig } = parts;

  // Reject signatures older than 5 minutes
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
}
```

---

## Using the JavaScript SDK

Instead of raw `curl`, use the official `@ozzyl/sdk`:

```bash
npm install @ozzyl/sdk
```

```typescript
import { Ozzyl } from '@ozzyl/sdk';

const ozzyl = new Ozzyl('sk_live_your_key_here');

// List products
const { data: products } = await ozzyl.products.list({ limit: 10, published: true });
console.log(products[0].title);

// Get a specific order
const order = await ozzyl.orders.get('1001');
console.log(`Order ${order.orderNumber} — ${order.status}`);
```

→ Full SDK guide: [`docs/SDK_GUIDE.md`](./SDK_GUIDE.md)

---

## Authentication Quick Reference

| Header | Value |
|--------|-------|
| `Authorization` | `Bearer sk_live_xxxx` |
| `Content-Type` | `application/json` (POST requests) |

**Error codes you'll see:**

| HTTP | Code | Fix |
|------|------|-----|
| `401` | `invalid_api_key` | Check your key is correct and not revoked |
| `403` | `insufficient_scopes` | Add the required scope when creating the key |
| `429` | `rate_limit_exceeded` | Wait and retry — check `Retry-After` header |

---

## Rate Limits

| Plan | Requests/min |
|------|-------------|
| Free | 30 |
| Starter | 100 |
| Pro | 500 |
| Agency | 2,000 |

Watch the `X-RateLimit-Remaining` header on every response.

---

## Next Steps

| What | Where |
|------|-------|
| Full endpoint reference | [`docs/API_REFERENCE.md`](./API_REFERENCE.md) |
| JavaScript/TypeScript SDK | [`docs/SDK_GUIDE.md`](./SDK_GUIDE.md) |
| WordPress / WooCommerce plugin | [`docs/WORDPRESS_PLUGIN_GUIDE.md`](./WORDPRESS_PLUGIN_GUIDE.md) |
| Implementation plan | [`docs/API_PLATFORM_MASTER_PLAN/`](./API_PLATFORM_MASTER_PLAN/) |
