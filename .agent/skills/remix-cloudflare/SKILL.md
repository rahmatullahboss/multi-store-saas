---
name: Remix Cloudflare Development
description: Expert skill for Remix on Cloudflare Pages - loaders, actions, streaming, defer, forms, and edge-native patterns.
---

# Remix Cloudflare Development Skill

This skill covers building full-stack applications with Remix on Cloudflare Pages, including data loading, mutations, streaming, and edge-native patterns.

## 1) Core Concepts

### Cloudflare Pages Setup

```typescript
// functions/[[path]].ts (Pages Function handler)
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '../build/server';
import { getLoadContext } from '../load-context';

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
```

### Load Context (Access Bindings)

```typescript
// load-context.ts
import { type AppLoadContext } from '@remix-run/cloudflare';

export function getLoadContext(context: {
  cloudflare: {
    env: Env;
    cf: CfProperties;
    ctx: ExecutionContext;
  };
}): AppLoadContext {
  return {
    cloudflare: context.cloudflare,
  };
}

declare module '@remix-run/cloudflare' {
  interface AppLoadContext {
    cloudflare: {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    };
  }
}
```

---

## 2) Data Loading (Loaders)

### Basic Loader

```typescript
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;

  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?')
    .bind(params.productId, params.storeId)
    .first();

  if (!product) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ product });
}

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
    </div>
  );
}
```

### Loader with Drizzle ORM

```typescript
import { eq, and } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { products } from '~/db/schema';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const db = drizzle(context.cloudflare.env.DB);

  const product = await db
    .select()
    .from(products)
    .where(and(eq(products.id, params.productId!), eq(products.storeId, params.storeId!)))
    .get();

  if (!product) {
    throw new Response('Not Found', { status: 404 });
  }

  return json({ product });
}
```

---

## 3) Streaming with defer()

### Why Streaming?

Streaming allows you to send critical data immediately while slower data loads in the background. This improves perceived performance.

### Basic defer() Usage

```typescript
import { defer, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, Await } from '@remix-run/react';
import { Suspense } from 'react';

export async function loader({ context, params }: LoaderFunctionArgs) {
  const { env } = context.cloudflare;

  // Critical data - await immediately
  const product = await env.DB.prepare('SELECT * FROM products WHERE id = ?')
    .bind(params.productId)
    .first();

  // Non-critical data - stream later
  const reviewsPromise = env.DB.prepare(
    'SELECT * FROM reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10'
  )
    .bind(params.productId)
    .all();

  const relatedPromise = env.DB.prepare(
    'SELECT * FROM products WHERE category = ? AND id != ? LIMIT 4'
  )
    .bind(product?.category, params.productId)
    .all();

  return defer({
    product,
    reviews: reviewsPromise, // Will stream!
    related: relatedPromise, // Will stream!
  });
}

export default function ProductPage() {
  const { product, reviews, related } = useLoaderData<typeof loader>();

  return (
    <div>
      {/* Critical content renders immediately */}
      <h1>{product.name}</h1>
      <p>{product.description}</p>

      {/* Reviews stream in later */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(resolvedReviews) => <ReviewsList reviews={resolvedReviews.results} />}
        </Await>
      </Suspense>

      {/* Related products stream in later */}
      <Suspense fallback={<RelatedSkeleton />}>
        <Await resolve={related}>
          {(resolvedRelated) => <RelatedProducts products={resolvedRelated.results} />}
        </Await>
      </Suspense>
    </div>
  );
}
```

### Error Handling with Await

```typescript
<Suspense fallback={<Loading />}>
  <Await resolve={reviews} errorElement={<p>Failed to load reviews</p>}>
    {(resolvedReviews) => <ReviewsList reviews={resolvedReviews} />}
  </Await>
</Suspense>
```

---

## 4) Mutations (Actions)

### Basic Action

```typescript
import { json, redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation } from '@remix-run/react';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000),
  price: z.coerce.number().int().positive(),
  category: z.string().min(1),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const formData = await request.formData();

  // Validate
  const parsed = productSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return json({ errors: parsed.error.flatten() }, { status: 400 });
  }

  // Insert
  const id = crypto.randomUUID();
  await env.DB.prepare(
    'INSERT INTO products (id, name, description, price, category) VALUES (?, ?, ?, ?, ?)'
  )
    .bind(id, parsed.data.name, parsed.data.description, parsed.data.price, parsed.data.category)
    .run();

  return redirect(`/products/${id}`);
}

export default function NewProductPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <Form method="post">
      <input name="name" placeholder="Product Name" />
      {actionData?.errors?.fieldErrors?.name && (
        <p className="error">{actionData.errors.fieldErrors.name}</p>
      )}

      <textarea name="description" placeholder="Description" />

      <input name="price" type="number" placeholder="Price (cents)" />

      <input name="category" placeholder="Category" />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </button>
    </Form>
  );
}
```

### Intent-Based Actions

For multiple actions in one route:

```typescript
export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent');

  switch (intent) {
    case 'create':
      return createProduct(formData, context);
    case 'update':
      return updateProduct(formData, context);
    case 'delete':
      return deleteProduct(formData, context);
    default:
      return json({ error: 'Invalid intent' }, { status: 400 });
  }
}

// In component
<Form method="post">
  <input type="hidden" name="intent" value="create" />
  {/* ... */}
</Form>;
```

---

## 5) useFetcher for Non-Navigation Mutations

### Add to Cart (No Page Reload)

```typescript
import { useFetcher } from '@remix-run/react';

function AddToCartButton({ productId }: { productId: string }) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state === 'submitting';

  return (
    <fetcher.Form method="post" action="/api/cart">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="intent" value="add" />
      <button type="submit" disabled={isAdding}>
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </fetcher.Form>
  );
}
```

### Optimistic UI

```typescript
function LikeButton({ productId, initialLikes }: { productId: string; initialLikes: number }) {
  const fetcher = useFetcher();

  // Optimistic: show new count immediately
  const likes = fetcher.formData
    ? initialLikes + 1 // Optimistic update
    : initialLikes; // Actual value

  return (
    <fetcher.Form method="post" action="/api/likes">
      <input type="hidden" name="productId" value={productId} />
      <button type="submit">❤️ {likes}</button>
    </fetcher.Form>
  );
}
```

---

## 6) Resource Routes (API Endpoints)

### JSON API Route

```typescript
// app/routes/api.products.ts
import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const storeId = url.searchParams.get('storeId');

  if (!storeId) {
    return json({ error: 'storeId required' }, { status: 400 });
  }

  const { results } = await context.cloudflare.env.DB.prepare(
    'SELECT * FROM products WHERE store_id = ? LIMIT 50'
  )
    .bind(storeId)
    .all();

  return json({ products: results });
}

export async function action({ request, context }: ActionFunctionArgs) {
  // Handle POST, PUT, DELETE
  const method = request.method;

  if (method === 'POST') {
    // Create product
  } else if (method === 'DELETE') {
    // Delete product
  }
}
```

### Image Upload Route

```typescript
// app/routes/api.upload.ts
import { json, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request, context }: ActionFunctionArgs) {
  const { env } = context.cloudflare;
  const formData = await request.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return json({ error: 'No file provided' }, { status: 400 });
  }

  const key = `uploads/${Date.now()}-${file.name}`;

  await env.R2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return json({
    success: true,
    url: `${env.R2_PUBLIC_URL}/${key}`,
  });
}
```

---

## 7) Error Handling

### Error Boundaries

```typescript
import { useRouteError, isRouteErrorResponse } from '@remix-run/react';

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  );
}
```

### Throwing Responses

```typescript
export async function loader({ params, context }: LoaderFunctionArgs) {
  const product = await getProduct(context.cloudflare.env.DB, params.id);

  if (!product) {
    throw new Response('Product not found', { status: 404 });
  }

  if (!product.isPublished) {
    throw new Response('Product not available', { status: 403 });
  }

  return json({ product });
}
```

---

## 8) Meta & SEO

### Dynamic Meta Tags

```typescript
import { type MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) {
    return [{ title: 'Product Not Found' }];
  }

  return [
    { title: `${data.product.name} | Store` },
    { name: 'description', content: data.product.description?.slice(0, 160) },
    { property: 'og:title', content: data.product.name },
    { property: 'og:description', content: data.product.description?.slice(0, 160) },
    { property: 'og:image', content: data.product.image },
    { property: 'og:type', content: 'product' },
  ];
};
```

### Canonical URLs

```typescript
import { type LinksFunction } from '@remix-run/cloudflare';

export const links: LinksFunction = () => {
  return [{ rel: 'canonical', href: 'https://example.com/products/123' }];
};
```

---

## 9) Session Management

### Cookie-Based Sessions

```typescript
// app/services/session.server.ts
import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET!],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'));
}

export async function requireUser(request: Request) {
  const session = await getSession(request);
  const userId = session.get('userId');

  if (!userId) {
    throw redirect('/login');
  }

  return userId;
}
```

---

## 10) Best Practices

### Performance

| Strategy             | Implementation                 |
| -------------------- | ------------------------------ |
| **Use defer()**      | Stream non-critical data       |
| **Parallel loaders** | Nested routes load in parallel |
| **Edge caching**     | Use Cache-Control headers      |
| **Prefetch links**   | `<Link prefetch="intent">`     |

### Security

```typescript
// ✅ Always validate on server
const parsed = schema.safeParse(formData);

// ✅ Always scope by storeId
WHERE store_id = ?

// ✅ Use CSRF protection (built into Remix forms)
<Form method="post">  // CSRF token automatic

// ❌ Never trust client data
// ❌ Never expose secrets in loaders
```

### Remix Patterns

| Pattern         | When to Use              |
| --------------- | ------------------------ |
| `loader`        | Initial data fetching    |
| `action`        | Form mutations           |
| `useFetcher`    | Non-navigation mutations |
| `defer`         | Streaming slow data      |
| Resource routes | API endpoints            |

---

## Quick Reference

| Task             | Code                                           |
| ---------------- | ---------------------------------------------- |
| Get DB           | `context.cloudflare.env.DB`                    |
| Get R2           | `context.cloudflare.env.R2`                    |
| Get KV           | `context.cloudflare.env.KV`                    |
| Redirect         | `return redirect('/path')`                     |
| JSON response    | `return json({ data })`                        |
| Stream data      | `return defer({ fast, slow: promise })`        |
| Form submission  | `<Form method="post">`                         |
| Non-nav mutation | `<fetcher.Form>`                               |
| Error response   | `throw new Response('Error', { status: 400 })` |
