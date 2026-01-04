# API Reference

> Multi-Store SaaS E-commerce Platform

---

## Authentication APIs

### POST `/auth/login`

Login a merchant with email and password.

**Request (form-data)**:

```
email: string (required)
password: string (required, min 6 chars)
```

**Response**: Redirect to `/app/dashboard/orders` with session cookie

---

### POST `/auth/register`

Register a new merchant with their store.

**Request (form-data)**:

```
name: string (required, min 2 chars)
email: string (required, valid email)
password: string (required, min 6 chars)
storeName: string (required, min 2 chars)
```

**Response**: Redirect to `/app/dashboard/orders` with session cookie

---

### POST `/auth/logout`

Destroy the current session.

**Response**: Redirect to `/auth/login`

---

## Image Upload API

### POST `/api/upload-image`

Upload an image to Cloudinary (signed upload).

**Request (multipart/form-data)**:

```
file: File (required, max 10MB)
folder: string (optional, default: "products")
```

**Allowed Types**: JPEG, PNG, WebP, GIF

**Response**:

```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "products/abc123",
  "width": 800,
  "height": 600,
  "format": "jpg"
}
```

**Errors**:

```json
{ "error": "No file provided" }           // 400
{ "error": "Invalid file type" }          // 400
{ "error": "File too large. Maximum 10MB" } // 400
{ "error": "Cloudinary not configured" }  // 500
```

---

## Order API

### POST `/api/create-order`

Create a new order (COD - Cash on Delivery).

**Request (JSON)**:

```json
{
  "customerName": "John Doe",
  "customerPhone": "01712345678",
  "customerEmail": "john@example.com",
  "shippingAddress": {
    "address": "123 Main St",
    "city": "Dhaka",
    "postalCode": "1000"
  },
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "orderId": 123,
  "orderNumber": "ORD-20260105-001"
}
```

---

## bKash Payment APIs

### POST `/api/bkash/initiate`

Initiate a bKash payment for an order.

**Request (JSON)**:

```json
{
  "orderId": 123,
  "storeId": 1,
  "amount": 1500,
  "customerPhone": "01712345678"
}
```

**Response**:

```json
{
  "success": true,
  "paymentID": "TR00...",
  "bkashURL": "https://sandbox.bka.sh/...",
  "amount": "1500.00"
}
```

### GET `/api/bkash/callback`

bKash callback after payment completion. Executes payment and redirects to:

| Status    | Redirect                                  |
| --------- | ----------------------------------------- |
| Success   | `/checkout/success?orderId=123&trxID=...` |
| Failed    | `/checkout/failed?orderId=123&error=...`  |
| Cancelled | `/checkout/cancelled?orderId=123`         |

**Environment Variables Required**:

```
BKASH_BASE_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_sandbox_username
BKASH_PASSWORD=your_sandbox_password
```

---

## Nagad Payment APIs

### POST `/api/nagad/initiate`

Initiate a Nagad payment for an order.

**Request (JSON)**:

```json
{
  "orderId": 123,
  "storeId": 1,
  "amount": 1500
}
```

**Response**:

```json
{
  "success": true,
  "callbackUrl": "https://nagad.com.bd/...",
  "paymentRefId": "REF..."
}
```

### GET `/api/nagad/callback`

Nagad callback after payment. Verifies and redirects similar to bKash.

**Environment Variables Required**:

```
NAGAD_BASE_URL=https://sandbox-ssl.nagad.com.bd/api/dfs/check-out
NAGAD_MERCHANT_ID=your_merchant_id
NAGAD_MERCHANT_NUMBER=your_merchant_number
NAGAD_PUBLIC_KEY=your_nagad_public_key
NAGAD_PRIVATE_KEY=your_private_key
```

---

## Protected Dashboard APIs

> All `/app/*` routes require authentication via session cookie.

### GET `/app/products`

List all products for the logged-in store.

### GET `/app/products/new`

Render product creation form.

### POST `/app/products/new`

Create a new product.

**Request (form-data)**:

```
title: string (required)
price: number (required)
stock: number (required)
category: string (optional)
description: string (optional)
imageUrl: string (optional, from upload API)
```

### GET `/app/dashboard`

Dashboard overview with store stats.

### GET `/app/dashboard/orders`

List all orders for the logged-in store.

### GET `/app/settings`

Store settings (read-only).

---

## Store Resolution

The platform uses subdomain-based multi-tenancy:

```
store1.stores.digitalcare.site → storeId = 1
store2.stores.digitalcare.site → storeId = 2
custom-domain.com → resolved by custom_domain field
```

For local development, use query parameter:

```
http://localhost:5173?store=demo
```

---

## Error Responses

| Status | Description                               |
| ------ | ----------------------------------------- |
| 400    | Validation error (missing/invalid fields) |
| 401    | Unauthorized (not logged in)              |
| 404    | Resource not found                        |
| 405    | Method not allowed                        |
| 500    | Server error                              |

All errors return:

```json
{
  "error": "Error message here"
}
```

---

## Session Cookie

| Property | Value                 |
| -------- | --------------------- |
| Name     | `__session`           |
| HttpOnly | Yes                   |
| Secure   | Yes                   |
| SameSite | Lax                   |
| Max-Age  | 7 days                |
| Content  | `{ userId, storeId }` |
