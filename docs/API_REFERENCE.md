# API Reference

> Ozzyl Commerce Platform API — updated 2026-02-24

---

## Table of Contents

1. [Public API v1 (API Key Auth)](#public-api-v1-api-key-auth)
   - [Authentication](#authentication)
   - [Rate Limiting](#rate-limiting)
   - [Ping](#get-apiv1ping)
   - [Store](#get-apiv1store)
   - [Products](#products)
   - [Orders](#orders)
   - [Analytics](#analytics)
   - [Webhooks](#webhooks)
2. [Internal / Storefront Routes](#internal--storefront-routes)
3. [Error Reference](#error-reference)

---

## Public API v1 (API Key Auth)

Base URL: `https://api.ozzyl.com/v1`

All `/api/v1/*` endpoints require a valid API key. Keys are created in your store's **Settings → Developer** page.

### Authentication

Include your API key as a Bearer token in every request:

```
Authorization: Bearer sk_live_your_key_here
```

**Key prefixes**

| Prefix | Environment |
|--------|-------------|
| `sk_live_` | Production data |
| `sk_test_` | Test / sandbox data |

**Auth error responses**

```json
// 401 — missing or invalid key
{
  "success": false,
  "error": "invalid_api_key",
  "message": "API key is invalid, revoked, or expired"
}

// 403 — key valid but missing required scope
{
  "success": false,
  "error": "insufficient_scopes",
  "message": "Missing required scopes: read_products",
  "required": ["read_products"],
  "granted": ["read_orders"]
}
```

### Scopes

| Scope | Description |
|-------|-------------|
| `read_products` | List and retrieve products |
| `write_products` | Create, update, delete products |
| `read_orders` | List and retrieve orders |
| `write_orders` | Update order status; manage webhooks |
| `read_analytics` | Read store analytics |
| `read_store` | Read store metadata |
| `manage_webhooks` | Create, list, delete webhooks |

### Rate Limiting

Limits are per-API-key, per-minute, based on your plan.

| Plan | Requests/min | Requests/day |
|------|-------------|--------------|
| Free | 30 | 1,000 |
| Starter | 100 | 10,000 |
| Pro | 500 | 100,000 |
| Agency | 2,000 | 1,000,000 |

**Rate limit response headers** (on every request):

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1706745660
X-RateLimit-Plan: starter
```

**429 — Rate limit exceeded:**

```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Rate limit exceeded for plan 'starter'. Limit: 100 requests/minute.",
  "docs": "https://docs.ozzyl.com/api/rate-limiting"
}
```

Headers on 429: `Retry-After: 60`

### Response Envelope

All successful responses follow this shape:

```json
{
  "success": true,
  "data": { ... }
}
```

List endpoints include a `pagination` object:

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "limit": 20,
    "has_more": true,
    "next_cursor": "MTIz"
  }
}
```

Pass `next_cursor` as the `cursor` query parameter to fetch the next page.

### Response Headers

| Header | Description |
|--------|-------------|
| `X-Request-Id` | Unique request ID — include when reporting issues |
| `X-Response-Time` | Server processing time |
| `X-Api-Key-Mode` | `live` or `test` |

---

### `GET /api/v1/ping`

Quick connectivity and auth check. No additional scopes required beyond a valid key.

```bash
curl https://api.ozzyl.com/v1/ping \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
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

---

### `GET /api/v1/store`

Retrieve public info about the store associated with your API key.

Required scope: any valid key (no specific scope required)

```bash
curl https://api.ozzyl.com/v1/store \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "name": "My Awesome Store",
    "subdomain": "my-awesome-store",
    "customDomain": "mystore.com",
    "logo": "https://r2.ozzyl.com/stores/42/logo.png",
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
}
```

---

## Products

### `GET /api/v1/products`

List products with cursor pagination, sorting, and published filtering.

Required scope: `read_products`

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer (1–100) | `20` | Number of products to return |
| `cursor` | string | — | Pagination cursor from previous response |
| `sort` | enum | `created_desc` | `created_asc`, `created_desc`, `price_asc`, `price_desc`, `title_asc` |
| `published` | `true` \| `false` | — | Filter by published status |

```bash
# First page
curl "https://api.ozzyl.com/v1/products?limit=10&sort=price_asc&published=true" \
  -H "Authorization: Bearer sk_live_xxxx"

# Next page (using cursor from previous response)
curl "https://api.ozzyl.com/v1/products?limit=10&cursor=MTIz" \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "title": "Premium Cotton T-Shirt",
      "price": 1299,
      "compareAtPrice": 1599,
      "isPublished": true,
      "inventory": 50,
      "imageUrl": "https://r2.ozzyl.com/stores/42/products/tshirt.webp",
      "category": "Clothing",
      "sku": "TSH-001",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-20T14:30:00.000Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "has_more": true,
    "next_cursor": "MTIz"
  }
}
```

**Error `400` — Invalid cursor:**
```json
{
  "success": false,
  "error": "invalid_cursor",
  "message": "Invalid cursor value"
}
```

---

### `GET /api/v1/products/:id`

Retrieve a single product by its numeric ID.

Required scope: `read_products`

```bash
curl https://api.ozzyl.com/v1/products/123 \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "Premium Cotton T-Shirt",
    "price": 1299,
    "compareAtPrice": 1599,
    "isPublished": true,
    "inventory": 50,
    "imageUrl": "https://r2.ozzyl.com/stores/42/products/tshirt.webp",
    "category": "Clothing",
    "sku": "TSH-001",
    "description": "100% premium cotton, available in multiple sizes.",
    "createdAt": "2026-02-01T10:00:00.000Z",
    "updatedAt": "2026-02-20T14:30:00.000Z"
  }
}
```

**Error `404`:**
```json
{
  "success": false,
  "error": "not_found",
  "message": "Product 123 not found"
}
```

---

## Orders

### `GET /api/v1/orders`

List orders with cursor pagination and optional status filtering. Orders are sorted by `created_at` descending (newest first).

Required scope: `read_orders`

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer (1–100) | `20` | Number of orders to return |
| `cursor` | string | — | Pagination cursor from previous response |
| `status` | enum | — | `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`, `returned` |

```bash
curl "https://api.ozzyl.com/v1/orders?status=pending&limit=50" \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1001,
      "orderNumber": "ORD-ABC123",
      "status": "confirmed",
      "total": 2598,
      "subtotal": 2598,
      "customerName": "Rahmat Zisan",
      "customerEmail": "rahmat@example.com",
      "customerPhone": "01712345678",
      "paymentStatus": "paid",
      "paymentMethod": "sslcommerz",
      "createdAt": "2026-02-24T09:00:00.000Z",
      "updatedAt": "2026-02-24T09:05:00.000Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "has_more": false,
    "next_cursor": null
  }
}
```

---

### `GET /api/v1/orders/:id`

Retrieve a single order by its numeric ID, including all line items.

Required scope: `read_orders`

```bash
curl https://api.ozzyl.com/v1/orders/1001 \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": 1001,
    "orderNumber": "ORD-ABC123",
    "status": "confirmed",
    "total": 2598,
    "subtotal": 2598,
    "shippingCost": 0,
    "customerName": "Rahmat Zisan",
    "customerEmail": "rahmat@example.com",
    "customerPhone": "01712345678",
    "shippingAddress": "123 Main Street, Dhaka",
    "paymentStatus": "paid",
    "paymentMethod": "sslcommerz",
    "items": [
      {
        "id": 5001,
        "productId": 123,
        "title": "Premium Cotton T-Shirt",
        "quantity": 2,
        "price": 1299,
        "total": 2598
      }
    ],
    "createdAt": "2026-02-24T09:00:00.000Z",
    "updatedAt": "2026-02-24T09:05:00.000Z"
  }
}
```

---

## Analytics

### `GET /api/v1/analytics/summary`

Retrieve aggregated store analytics for a time period.

Required scope: `read_analytics`

**Query parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | enum | `30d` | `today`, `7d`, `30d`, `90d` |

```bash
curl "https://api.ozzyl.com/v1/analytics/summary?period=7d" \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "period": "7d",
    "since": "2026-02-17T10:00:00.000Z",
    "orders": {
      "total": 142,
      "revenue": 185430,
      "avg_value": 1306.55
    },
    "products": {
      "active": 38
    }
  }
}
```

> **Note:** `revenue` and `avg_value` are in the store's smallest currency unit (paisa for BDT).

---

## Webhooks

### `GET /api/v1/webhooks`

List all registered webhook endpoints for the store.

Required scope: `read_orders` (or `manage_webhooks`)

```bash
curl https://api.ozzyl.com/v1/webhooks \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "data": [
    {
      "id": 7,
      "url": "https://mysite.com/hooks/ozzyl",
      "topic": "order/created",
      "events": "[\"order/created\",\"order/updated\"]",
      "isActive": true,
      "failureCount": 0,
      "createdAt": "2026-02-20T12:00:00.000Z"
    }
  ]
}
```

---

### `POST /api/v1/webhooks`

Register a new webhook endpoint.

Required scope: `write_orders` (or `manage_webhooks`)

**Request body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `url` | string | ✅ | HTTPS URL to receive webhook POSTs |
| `events` | string[] | ✅ | At least one event topic (see below) |
| `secret` | string | — | HMAC signing secret (≥16 chars). Auto-generated if omitted |

**Supported event topics:**

```
order/created       order/updated       order/cancelled     order/fulfilled
product/created     product/updated     product/deleted
customer/created    customer/updated
inventory/updated
```

```bash
curl -X POST https://api.ozzyl.com/v1/webhooks \
  -H "Authorization: Bearer sk_live_xxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://mysite.com/hooks/ozzyl",
    "events": ["order/created", "order/updated"],
    "secret": "my_secret_at_least_16_chars"
  }'
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": 8,
    "url": "https://mysite.com/hooks/ozzyl",
    "events": "[\"order/created\",\"order/updated\"]",
    "isActive": true
  },
  "secret": "my_secret_at_least_16_chars",
  "message": "Save this secret — it will not be shown again."
}
```

> ⚠️ **Save the `secret` immediately** — it is shown only once.

---

### `DELETE /api/v1/webhooks/:id`

Delete a webhook endpoint. Deliveries to this URL stop immediately.

Required scope: `write_orders` (or `manage_webhooks`)

```bash
curl -X DELETE https://api.ozzyl.com/v1/webhooks/8 \
  -H "Authorization: Bearer sk_live_xxxx"
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Webhook 8 deleted"
}
```

---

### Webhook Delivery Format

Ozzyl signs every delivery with HMAC-SHA256. Verify using the `Ozzyl-Signature` header:

```
POST https://mysite.com/hooks/ozzyl
Content-Type: application/json
Ozzyl-Signature: t=1706745600,v1=abc123def456...
```

**Verification algorithm:**
```
payload_to_sign = timestamp + "." + raw_request_body
expected_sig    = HMAC-SHA256(payload_to_sign, webhook_secret)
valid           = constant_time_compare(expected_sig, v1) && |now - t| < 300
```

**Example payload:**
```json
{
  "event": "order/created",
  "deliveryId": "dlv_abc123",
  "storeId": 42,
  "data": {
    "id": 1001,
    "orderNumber": "ORD-ABC123",
    "status": "confirmed",
    "total": 2598
  }
}
```

---

## Internal / Storefront Routes

### Authentication Routes

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/auth/login` | Merchant login (session cookie) |
| `POST` | `/auth/register` | Merchant + store registration |
| `POST` | `/auth/logout` | Session logout |
| `GET` | `/auth/logout` | Navigation-safe logout |

### Storefront Order API

#### `POST /api/create-order`

Create order from storefront checkout (session-less, for customers).

Key fields: `store_id`, `product_id` or `cart_items`, `customer_name`, `phone`, `address`, `payment_method` (`cod` or `sslcommerz`)

Success response:
```json
{
  "success": true,
  "orderId": 123,
  "orderNumber": "ORD-ABC123",
  "total": 1499
}
```

If `payment_method = "sslcommerz"`, response includes `paymentRedirectUrl`.

#### `POST /api/webhook/sslcommerz`

SSLCommerz payment gateway callback. Validates `tran_id` / `val_id`, updates order payment status.

### Media Upload

#### `POST /api/upload-image`

Upload image to R2 (authenticated merchant session required). Max 5MB. Accepted: `image/jpeg`, `image/png`, `image/webp`, `image/gif`.

---

## Error Reference

All errors follow this envelope:

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable description",
  "request_id": "req_abc123",
  "docs": "https://docs.ozzyl.com/api/errors"
}
```

Validation errors (400) include field-level detail:

```json
{
  "success": false,
  "error": "validation_error",
  "message": "Invalid request parameters",
  "details": {
    "url": ["Must be a valid HTTPS URL"],
    "events": ["At least one event is required"]
  }
}
```

**HTTP status codes:**

| Code | Meaning |
|------|---------|
| `200` | OK |
| `201` | Created |
| `204` | No Content (DELETE success) |
| `400` | Validation / bad request |
| `401` | Missing or invalid API key |
| `403` | Insufficient scopes |
| `404` | Resource not found |
| `405` | Method not allowed |
| `429` | Rate limit exceeded |
| `500` | Internal server error |

---

## Machine-Readable Contract

OpenAPI spec: `docs/openapi.yaml`

