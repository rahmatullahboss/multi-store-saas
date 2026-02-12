# API Reference

> Multi-Store SaaS platform API (updated: 2026-02-12)

---

## Authentication Routes

### `POST /auth/login`

Merchant login via form-data.

Request fields:
- `email` (required)
- `password` (required)

Behavior:
- Success: session cookie + redirect (`/admin` or `/app/orders`)
- Validation/auth failure: `400`
- Rate limit: `429`

### `POST /auth/register`

Merchant + store registration via form-data.

### `POST /auth/logout`

Session logout.

### `GET /auth/logout`

Direct navigation-safe logout; clears session and redirects (default `/auth/login`).

---

## Storefront Order API

### `POST /api/create-order`

Create order from storefront checkout.

Allowed content types:
- `application/json`
- `multipart/form-data`

Important fields (snake_case):
- `store_id` (required)
- `product_id` (required for single-item checkout)
- `cart_items` (required for multi-item checkout)
- `customer_name` (required)
- `phone` (required, BD validation)
- `address` (required)
- `payment_method` (`cod` বা `sslcommerz`)

Notes:
- write-only endpoint: `GET /api/create-order` returns `405` with `Allow: POST`
- plan limit checks, anti-spam, rate-limit, stock checks, idempotency are enforced server-side

Success response (example):

```json
{
  "success": true,
  "orderId": 123,
  "orderNumber": "ORD-ABC123",
  "total": 1499
}
```

If `payment_method = "sslcommerz"`, response contains `paymentRedirectUrl`.

---

## SSLCommerz Webhook

### `POST /api/webhook/sslcommerz`

Gateway callback endpoint for payment validation/finalization.

Behavior:
- idempotent webhook dedupe
- validates `tran_id` and `val_id`
- updates order payment status (`paid`/`failed`)

---

## Media Upload API

### `POST /api/upload-image`

Upload image to R2 (authenticated merchant session required).

Request (`multipart/form-data`):
- `file` (required, max 5MB)
- `folder` (optional: `products | logos | banners | temp`, default `temp`)

Allowed MIME types:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

Success response:

```json
{
  "success": true,
  "url": "https://.../stores/1/products/1739-abc.webp",
  "key": "stores/1/products/1739-abc.webp",
  "size": 45678,
  "type": "image/webp"
}
```

Method behavior:
- `GET /api/upload-image` => `405` + `Allow: POST`

---

## Public API (API Key, v1)

Authentication:
- Header: `Authorization: Bearer sk_live_...`
- Invalid/missing token returns `401` with `WWW-Authenticate: Bearer ...`
- Missing scope returns `403`

### `GET /api/v1/products`

Required scope:
- `read_products`

Query params:
- `page` (integer, `>= 1`, default `1`)
- `limit` (integer, `1..100`, default `20`)
- `search` (optional)
- `published` (`true|false`, optional)

### `GET /api/v1/orders`

Required scope:
- `read_orders`

Query params:
- `limit` (integer, `1..100`, default `20`)
- `status` (optional):
  - `pending`
  - `confirmed`
  - `processing`
  - `shipped`
  - `delivered`
  - `cancelled`

### `GET /api/v1/orders/:id`

Required scope:
- `read_orders`

Returns single store-scoped order with items.

---

## Session-Protected Builder API

### `GET /api/products`

Returns current store products for builder/editor flows (session-based auth).

---

## Availability Notes

Currently active payment API flow:
- `sslcommerz` via `/api/create-order` + `/api/webhook/sslcommerz`

Not active as standalone endpoints in current codebase:
- `/api/bkash/*`
- `/api/nagad/*`
- `/api/stripe/*`

---

## Store Resolution

Tenant resolution follows `*.ozzyl.com` and mapped custom domains.

Examples:
- `store1.ozzyl.com`
- `app.ozzyl.com` (admin/main app)
- `custom-domain.com` (mapped store domain)

---

## Error Shape

Primary error patterns:

```json
{ "success": false, "error": "..." }
```

or

```json
{ "error": "..." }
```

Common status codes:
- `400` validation/request error
- `401` unauthorized
- `403` forbidden (scope/policy)
- `404` not found
- `405` method not allowed
- `429` rate limited
- `500` internal server error

---

## Machine-Readable Contract

OpenAPI source of truth:
- `/Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/docs/openapi.yaml`
