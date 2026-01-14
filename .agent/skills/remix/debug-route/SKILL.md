---
name: "debug-remix-route"
description: "Debug Remix route errors and performance issues"
when_to_use: "When a route shows errors, slow loading, or hydration mismatch"
allowed-tools: ["Read", "Write", "Grep", "Bash(npm run dev:*)"]
---

# Remix Route Debug Process

## Step 1: Identify Error

1. Read the route file: `app/routes/{route-name}.tsx`
2. Check loader function for:
   - N+1 queries (Use `drizzle` batching)
   - Missing error boundaries
3. Check component for:
   - Client-only code without `<ClientOnly>`
   - Props mismatch
   - Random values (`Math.random`, `Date.now`) causing hydration mismatch

## Step 2: Check Data Flow

1. Inspect loader return data type
2. Verify TypeScript types match between Loader and `useLoaderData`
3. Look for `useEffect` misuse (data fetching should be in loader)

## Step 3: Hydration Check

1. Search for `window` or `document` access without checks
2. Check `localStorage` access without `useEffect`
3. Use `<ClientOnly>` for non-SSR compatible libraries

## Step 4: Performance

1. Check bundle size: `npm run build && npm run analyze`
2. Look for large imports (icons, libs)
3. Lazy load heavy components using `React.lazy` + `Suspense`

## Output

Provide:

- Root cause
- Fixed code snippet
- Prevention tips
