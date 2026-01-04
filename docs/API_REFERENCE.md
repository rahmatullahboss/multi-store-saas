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
