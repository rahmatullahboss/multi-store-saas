---
name: Hono API Development
description: Expert skill for Hono.js API development - middleware patterns, Zod validation, error handling, OpenAPI documentation, and Cloudflare Workers integration.
---

# Hono API Development Skill

This skill covers building production-ready APIs with Hono.js on Cloudflare Workers, including middleware patterns, validation, error handling, and best practices.

## 1) Core Concepts

### Hono App Setup

```typescript
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

interface Env {
  DB: D1Database;
  R2: R2Bucket;
  KV: KVNamespace;
  AI: Ai;
}

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors());

export default app;
```

### Route Organization

```typescript
// src/routes/products.ts
import { Hono } from 'hono';

const products = new Hono<{ Bindings: Env }>();

products.get('/', async (c) => {
  /* ... */
});
products.get('/:id', async (c) => {
  /* ... */
});
products.post('/', async (c) => {
  /* ... */
});

export { products };

// src/index.ts
import { products } from './routes/products';

app.route('/api/products', products);
```

---

## 2) Middleware Patterns

### Authentication Middleware

```typescript
import { HTTPException } from 'hono/http-exception';
import { createMiddleware } from 'hono/factory';

interface AuthVariables {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff' | 'customer';
}

export const authMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: AuthVariables;
}>(async (c, next) => {
  const sessionId = c.req.header('Authorization')?.replace('Bearer ', '');

  if (!sessionId) {
    throw new HTTPException(401, { message: 'Unauthorized' });
  }

  const session = await c.env.KV.get(`session:${sessionId}`, 'json');

  if (!session) {
    throw new HTTPException(401, { message: 'Invalid session' });
  }

  c.set('userId', session.userId);
  c.set('storeId', session.storeId);
  c.set('role', session.role);

  await next();
});

// Usage
app.use('/api/*', authMiddleware);
```

### Store Scoping Middleware

```typescript
export const storeMiddleware = createMiddleware<{
  Bindings: Env;
  Variables: { storeId: string };
}>(async (c, next) => {
  // From subdomain or header
  const host = c.req.header('host') ?? '';
  const storeId = host.split('.')[0];

  if (!storeId || storeId === 'www') {
    throw new HTTPException(400, { message: 'Store not found' });
  }

  // Verify store exists
  const store = await c.env.DB.prepare('SELECT id FROM stores WHERE subdomain = ?')
    .bind(storeId)
    .first();

  if (!store) {
    throw new HTTPException(404, { message: 'Store not found' });
  }

  c.set('storeId', store.id as string);
  await next();
});
```

### Rate Limiting Middleware

```typescript
export const rateLimitMiddleware = (limit: number, windowSeconds: number) =>
  createMiddleware<{ Bindings: Env }>(async (c, next) => {
    const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
    const key = `ratelimit:${c.req.path}:${ip}`;

    const current = (await c.env.KV.get(key, 'json')) as { count: number } | null;
    const count = (current?.count ?? 0) + 1;

    if (count > limit) {
      throw new HTTPException(429, { message: 'Too many requests' });
    }

    await c.env.KV.put(key, JSON.stringify({ count }), {
      expirationTtl: windowSeconds,
    });

    c.header('X-RateLimit-Limit', String(limit));
    c.header('X-RateLimit-Remaining', String(limit - count));

    await next();
  });

// Usage: 100 requests per minute
app.use('/api/ai/*', rateLimitMiddleware(100, 60));
```

---

## 3) Zod Validation

### Schema Definition

```typescript
// src/schemas/product.ts
import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  price: z.number().int().positive(), // cents/paisa
  category: z.string().min(1),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string().url()).max(10).optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
  category: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
```

### Using zValidator

```typescript
import { zValidator } from '@hono/zod-validator';
import { createProductSchema, productQuerySchema } from './schemas/product';

// Validate JSON body
app.post('/api/products', zValidator('json', createProductSchema), async (c) => {
  const data = c.req.valid('json'); // Fully typed!
  // data.name, data.price, etc. are typed
  return c.json({ success: true, data });
});

// Validate query parameters
app.get('/api/products', zValidator('query', productQuerySchema), async (c) => {
  const { category, page, limit } = c.req.valid('query');
  // All typed and validated
  return c.json({ category, page, limit });
});

// Validate URL parameters
const paramSchema = z.object({
  id: z.string().uuid(),
});

app.get('/api/products/:id', zValidator('param', paramSchema), async (c) => {
  const { id } = c.req.valid('param');
  return c.json({ id });
});
```

### Custom Validation Middleware

```typescript
import { validator } from 'hono/validator';

app.post(
  '/api/products',
  validator('json', (value, c) => {
    const parsed = createProductSchema.safeParse(value);
    if (!parsed.success) {
      return c.json(
        {
          error: 'Validation failed',
          details: parsed.error.flatten(),
        },
        400
      );
    }
    return parsed.data;
  }),
  async (c) => {
    const data = c.req.valid('json');
    // ...
  }
);
```

---

## 4) Error Handling

### Global Error Handler

```typescript
import { HTTPException } from 'hono/http-exception';

app.onError((err, c) => {
  console.error(`[ERROR] ${err.message}`, err.stack);

  // Handle HTTPException
  if (err instanceof HTTPException) {
    return c.json(
      {
        error: err.message,
        status: err.status,
      },
      err.status
    );
  }

  // Handle Zod errors
  if (err.name === 'ZodError') {
    return c.json(
      {
        error: 'Validation failed',
        details: err.flatten(),
      },
      400
    );
  }

  // Handle D1 errors
  if (err.message?.includes('D1_')) {
    return c.json(
      {
        error: 'Database error',
        message: 'An error occurred while processing your request',
      },
      500
    );
  }

  // Generic error
  return c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    },
    500
  );
});
```

### Custom Exceptions

```typescript
import { HTTPException } from 'hono/http-exception';

export class NotFoundError extends HTTPException {
  constructor(resource: string) {
    super(404, { message: `${resource} not found` });
  }
}

export class ValidationError extends HTTPException {
  constructor(message: string) {
    super(400, { message });
  }
}

export class UnauthorizedError extends HTTPException {
  constructor(message = 'Unauthorized') {
    super(401, { message });
  }
}

export class ForbiddenError extends HTTPException {
  constructor(message = 'Forbidden') {
    super(403, { message });
  }
}

// Usage
app.get('/api/products/:id', async (c) => {
  const product = await getProduct(c.env.DB, c.req.param('id'));
  if (!product) {
    throw new NotFoundError('Product');
  }
  return c.json(product);
});
```

---

## 5) Response Patterns

### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// Helper functions
export function success<T>(c: Context, data: T, status = 200) {
  return c.json<ApiResponse<T>>({ success: true, data }, status);
}

export function error(c: Context, message: string, status = 400) {
  return c.json<ApiResponse<never>>({ success: false, error: message }, status);
}

export function paginated<T>(
  c: Context,
  data: T[],
  meta: { page: number; limit: number; total: number }
) {
  return c.json<ApiResponse<T[]>>({
    success: true,
    data,
    meta: {
      ...meta,
      hasMore: meta.page * meta.limit < meta.total,
    },
  });
}
```

### Usage

```typescript
app.get('/api/products', async (c) => {
  const { page, limit } = c.req.valid('query');
  const storeId = c.get('storeId');

  const [products, total] = await Promise.all([
    getProducts(c.env.DB, storeId, { page, limit }),
    getProductCount(c.env.DB, storeId),
  ]);

  return paginated(c, products, { page, limit, total });
});

app.post('/api/products', async (c) => {
  const data = c.req.valid('json');
  const product = await createProduct(c.env.DB, data);
  return success(c, product, 201);
});
```

---

## 6) Request/Response Types

### Context Variables

```typescript
type Variables = {
  userId: string;
  storeId: string;
  role: 'owner' | 'staff' | 'customer';
};

type AppEnv = {
  Bindings: Env;
  Variables: Variables;
};

const app = new Hono<AppEnv>();

// Now c.get('userId') is typed
app.get('/api/me', (c) => {
  const userId = c.get('userId'); // string
  const role = c.get('role'); // 'owner' | 'staff' | 'customer'
  return c.json({ userId, role });
});
```

### Factory Pattern

```typescript
import { createFactory } from 'hono/factory';

const factory = createFactory<AppEnv>();

// Create typed handler
const getProducts = factory.createHandlers(zValidator('query', productQuerySchema), async (c) => {
  const query = c.req.valid('query');
  const storeId = c.get('storeId');
  // ...
});

app.get('/api/products', ...getProducts);
```

---

## 7) API Routes Organization

### Modular Structure

```
src/
├── index.ts          # Main app, mount routes
├── middleware/
│   ├── auth.ts
│   ├── store.ts
│   └── rateLimit.ts
├── routes/
│   ├── products.ts
│   ├── orders.ts
│   ├── customers.ts
│   └── ai.ts
├── schemas/
│   ├── product.ts
│   ├── order.ts
│   └── common.ts
├── services/
│   ├── productService.ts
│   └── orderService.ts
└── utils/
    ├── response.ts
    └── errors.ts
```

### Route Registration

```typescript
// src/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

import { products } from './routes/products';
import { orders } from './routes/orders';
import { ai } from './routes/ai';
import { authMiddleware } from './middleware/auth';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', cors());

// Public routes
app.get('/health', (c) => c.json({ status: 'ok' }));

// Protected routes
app.use('/api/*', authMiddleware);

app.route('/api/products', products);
app.route('/api/orders', orders);
app.route('/api/ai', ai);

// 404 handler
app.notFound((c) => c.json({ error: 'Not found' }, 404));

export default app;
```

---

## 8) Testing

### Vitest Setup

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'miniflare',
    globals: true,
  },
});
```

### Route Tests

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import app from '../src/index';

describe('Products API', () => {
  it('GET /api/products returns products', async () => {
    const res = await app.request('/api/products', {
      headers: {
        Authorization: 'Bearer test-session',
      },
    });

    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  it('POST /api/products validates input', async () => {
    const res = await app.request('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-session',
      },
      body: JSON.stringify({
        name: '', // Invalid: empty
        price: -100, // Invalid: negative
      }),
    });

    expect(res.status).toBe(400);
  });
});
```

---

## 9) Best Practices

### Performance

| Strategy             | Implementation                        |
| -------------------- | ------------------------------------- |
| **Early returns**    | Check auth/validation first           |
| **Parallel queries** | Use `Promise.all` for independent ops |
| **Minimal response** | Only return needed fields             |
| **Streaming**        | Use streams for large responses       |

### Security

```typescript
// ✅ Always validate input
app.post('/api/products', zValidator('json', createProductSchema), ...);

// ✅ Always scope by storeId
const product = await db.query('SELECT * FROM products WHERE store_id = ?', storeId);

// ✅ Use parameterized queries
await db.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();

// ❌ Never trust client data
// ❌ Never expose internal errors
// ❌ Never use string concatenation for SQL
```

---

## Quick Reference

| Pattern       | Code                                           |
| ------------- | ---------------------------------------------- |
| Create app    | `new Hono<{ Bindings: Env }>()`                |
| Middleware    | `app.use('/path', middleware)`                 |
| Route group   | `app.route('/api/products', productsRouter)`   |
| Validate JSON | `zValidator('json', schema)`                   |
| Get validated | `c.req.valid('json')`                          |
| Get variable  | `c.get('userId')`                              |
| Set variable  | `c.set('userId', id)`                          |
| JSON response | `c.json(data, status)`                         |
| Throw error   | `throw new HTTPException(status, { message })` |
