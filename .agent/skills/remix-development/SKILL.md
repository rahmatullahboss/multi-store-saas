---
name: remix-development
description: comprehensive guide for building high-quality, performant applications using Remix, specifically tailored for Cloudflare stack. Covers routing, data loading, mutations, state management, and error handling.
---

# Remix Development Skill

Use this skill when developing, refactoring, or debugging Remix applications, especially on the Cloudflare stack.

## Core Principles

1.  **Web Standards First**: Leverage native browser features (Forms, HTTP, URLs) before adding client-side JS.
2.  **Server-Side First**: Move logic to `loaders` and `actions`. Keep the client thin.
3.  **URL as State**: The URL should be the single source of truth for UI state (filters, pagination, tabs).
4.  **Progressive Enhancement**: The app should work without JS enabled (wherever possible), then hydrate for better UX.

## 1. Routing Strategy (Remix v2/v3)

Use **Flat Routes** or standard **File-based Routing** in `app/routes`.

### Naming Conventions

- **Index Routes**: `app/routes/_index.tsx` (Homepage).
- **Static Routes**: `app/routes/about.tsx`.
- **Dynamic Routes**: `app/routes/products.$productId.tsx`.
- **Layout Routes**: `app/routes/dashboard.tsx` (Layout) + `app/routes/dashboard._index.tsx` (Child).
- **Pathless Layouts**: `app/routes/_auth.tsx` (Layout wrapper without URL segment).
- **Resource Routes**: `app/routes/api.stripe-webhook.tsx` (No UI, just loader/action).

### Best Practices

- Colocate modules: Keep styles, components, and utilities specific to a route _in the same directory_ (if using folders) or near the route file.
- Use `Outlet` for nested layouts.

## 2. Data Loading (`loader`)

**READ** operations go here.

```typescript
import { json, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";

export async function loader({ request, context, params }: LoaderFunctionArgs) {
  // 1. Validation / Auth
  const user = await requireUser(request);

  // 2. Database Call (Cloudflare D1 example)
  const { results } = await context.env.DB.prepare("SELECT * FROM items").all();

  // 3. Return Raw Objects (Single Fetch)
  // With Single Fetch enabled (Remix v2.9+ / v3), you can return raw objects, Dates, Promises, etc.
  // No need for `json()` wrapper
  return { items: results, user };
}

export default function Page() {
  // 4. Consume Typed Data
  const { items, user } = useLoaderData<typeof loader>();
  return (/* JSX */);
}
```

- **Single Fetch**: Use Remix v2 Single Fetch to combine multiple loader requests into one HTTP call. It allows returning "naked objects" (Date, Error, Promise, etc.) which are serialized automatically via `turbo-stream`.
- **Streaming (Defer)**: Use `defer` (or just return a Promise in Single Fetch) to stream slow data while showing immediate UI.

```tsx
// Streaming Example
import { Await } from '@remix-run/react';
import { Suspense } from 'react';

export async function loader() {
  const critical = await getCriticalData();
  const slow = getSlowData(); // No await - return the promise!
  return { critical, slow };
}

export default function Page() {
  const { critical, slow } = useLoaderData<typeof loader>();
  return (
    <div>
      <h1>{critical}</h1>
      <Suspense fallback={<p>Loading slow data...</p>}>
        <Await resolve={slow}>{(data) => <p>{data}</p>}</Await>
      </Suspense>
    </div>
  );
}
```

- **No useEffect**: Do NOT use `useEffect` to fetch initial data. Use `loader`.

## 3. Mutations (`action`)

**WRITE** operations (POST, PUT, DELETE) go here.

```typescript
import { redirect, type ActionFunctionArgs } from '@remix-run/cloudflare';

export async function action({ request, context }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get('intent'); // Pattern: Intent-based actions

  // Validation (Zod recommended)
  const title = formData.get('title');
  if (typeof title !== 'string' || title.length === 0) {
    // Return validation errors
    return { errors: { title: 'Title is required' }, status: 400 };
  }

  // Database Write
  await context.env.DB.prepare('INSERT INTO items (title) VALUES (?)').bind(title).run();

  // Redirect helps avoid form resubmission warnings
  return redirect('/dashboard');
}
```

### Forms

Use Remix `<Form>` for navigation events, `useFetcher` for specific interactions.

- **`<Form method="post">`**: Full page transition. Good for extensive changes (e.g., creating a new entity).
- **`useFetcher()`**: No navigation. Good for "Like" buttons, "Add to Cart", or updating a single field.

```tsx
const fetcher = useFetcher();
// Optimistic UI
const isSubmitting = fetcher.state === 'submitting';

<fetcher.Form method="post">
  <button disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save'}</button>
</fetcher.Form>;
```

## 4. State Management

**Stop!** Do you need `useState`? Check if you can use the URL.

| functionality          | State Location   | Mechanism                               |
| :--------------------- | :--------------- | :-------------------------------------- |
| **Search Query**       | URL Search Param | `?q=shoes`                              |
| **Pagination**         | URL Search Param | `?page=2`                               |
| **Selected Tab**       | URL Search Param | `?tab=details`                          |
| **Modal Open**         | URL Search Param | `?modal=login` or Nested Route          |
| **Form Input**         | React State      | `useState` (controlled) or Uncontrolled |
| **Toast/Notification** | Session Flash    | `session.flash("toast", ...)`           |

## 5. Error Handling

Export an `ErrorBoundary` in _every_ route module.

```tsx
import { isRouteErrorResponse, useRouteError } from '@remix-run/react';

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
  } else if (error instanceof Error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error.message}</p>
      </div>
    );
  } else {
    return <h1>Unknown Error</h1>;
  }
}
```

## 6. Cloudflare Specifics

- **Bindings**: Access D1, KV, R2 via `context.env` (or just `context` depending on the adapter) in loaders/actions.
- **KV Example**:
  ```typescript
  export const loader = async ({ context, params }: LoaderFunctionArgs) => {
    const value = await context.env.MY_KV.get(`key-${params.id}`, { type: 'json' });
    return { value };
  };
  ```
- **Edge Types**: Use types from `@remix-run/cloudflare`.
- **Database**: D1 is SQLite. Use `?` bindings for security. Avoid raw string interpolation.

## 7. SEO

Use the `meta` function.

```tsx
import type { MetaFunction } from '@remix-run/cloudflare';

export const meta: MetaFunction = () => {
  return [
    { title: 'My Remix App' },
    { name: 'description', content: 'Built with Cloudflare and Remix' },
  ];
};
```
