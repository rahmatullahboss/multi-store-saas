# AGENTS.md — Multi Store SaaS

## 🎯 Mission: Shopify of Bangladesh

Build a world-class, multi-tenant e-commerce SaaS on Cloudflare's edge. 🇧🇩🚀
**Standard**: 99.99% Uptime, Sub-100ms TTFB, Infinite Scale.

## 🏗️ Monorepo Structure & Commands

- **Main App**: `apps/web` (Remix SSR on Cloudflare Pages)
- **Page Builder**: `apps/page-builder` (GrapesJS Worker)
- **Packages**: `packages/database` (Drizzle/D1), `packages/ui` (Tailwind/Radix)

| Action          | Root Command          | App-Specific (`apps/web`)               |
| :-------------- | :-------------------- | :-------------------------------------- |
| **Install**     | `npm install`         | -                                       |
| **Dev**         | `npm run turbo:dev`   | `npm run dev` / `npm run dev:wrangler`  |
| **Build**       | `npm run turbo:build` | `npm run build`                         |
| **Lint**        | `npm run turbo:lint`  | `npm run lint`                          |
| **Test**        | `npm run turbo:test`  | `npm run test` (Vitest) / `npm run e2e` |
| **Single Test** | -                     | `npx vitest app/path/to/file.test.ts`   |
| **DB Migrate**  | -                     | `npm run db:migrate:local` / `:prod`    |

## 🛠️ Tech Stack (Cloudflare Native)

- **Runtime**: Workers / Pages (Compatibility: `2025-04-14`)
- **Framework**: Remix (React 19, Vite, Streaming with `defer()`)
- **Storage**: D1 (SQL), R2 (S3-compatible), KV (Cache), Vectorize (AI)
- **ORM**: Drizzle ORM (Type-safe migrations & batching)

## 📏 Coding Standards & Style

### 1. Naming & Formatting

- **Files**: kebab-case (e.g., `product-card.tsx`, `auth.server.ts`).
- **Components**: PascalCase (e.g., `export function OrderTable()`).
- **Hooks**: camelCase starting with `use` (e.g., `useStoreData`).
- **Types/Interfaces**: PascalCase, prefixed with `T` or `I` if helpful, but usually just `Product`.
- **Formatting**: Prettier is enforced. Run `npm run format`.

### 2. Imports & Exports

- Use path aliases: `~/` (app), `@db/` (database), `@server/` (server-only).
- **Group imports**: React/Remix first, then external libs, then internal aliases.
- **Server logic**: Keep in `.server.ts` files to prevent client-side leakage.

### 3. TypeScript & Types

- **Strict Mode**: Enabled and mandatory. No `any`.
- **Zod**: Use for all runtime validation (API inputs, environment variables).
- **Inference**: Use `typeof loader` for `useLoaderData` typing.

### 4. Data Safety (Multi-Tenant)

- 🔴 **CRITICAL**: Every query MUST be scoped by `store_id`.
- **Consistency**: Use D1 Sessions API for read-after-write consistency.

```typescript
const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-primary';
const session = env.DB.withSession(bookmark);
const data = await session.prepare('SELECT * FROM products WHERE store_id = ?').bind(storeId).all();
// Pass bookmark back in headers
```

### 5. D1 Batching

Use `.batch()` for multiple operations to minimize round-trips:

```typescript
await db.batch([
  db.insert(products).values(p1),
  db.update(stores).set({ lastUpdated: new Date() }).where(eq(stores.id, storeId)),
]);
```

### 6. Error Handling & Validation

- **Zod**: Required for `action` data and `env` validation.
- **Remix Boundary**: Every route should have an `ErrorBoundary`.
- **Toasts**: Use `sonner` for non-blocking feedback.
- **Banglish**: Communicate with users in Banglish (English letters, Bangla words).

## ☁️ Cloudflare Edge Patterns

### 1. KV Caching

Cache store configuration and published pages. Invalidate on publish.

```typescript
const cacheKey = `store:${storeId}:config`;
const cached = await env.KV.get(cacheKey, 'json');
```

### 2. R2 Storage

Use for product images and builder assets.

- Prefer signed URLs for private assets.
- Use `<OptimizedImage />` component for automatic resizing.

### 3. Durable Objects (Order Queue)

Used for background tasks like sending emails and updating inventory.

- Isolation: One DO per store (or per task type).
- Reliability: Built-in retries with exponential backoff.

## 🎨 UI/UX Standards

- **Styling**: Tailwind CSS 4.0. Use `cn()` utility for conditional classes.
- **Icons**: `lucide-react`.
- **Components**: Use Radix UI primitives via `@ozzyl/ui`.
- **Loading**: Use Remix `Pending` states or Skeleton loaders for streamed data.

## 🤖 Agent Rules (Cursor/Copilot)

- **Cursor**: No specific `.cursorrules` found, follow these standards.
- **Copilot**: No `.github/copilot-instructions.md` found.
- **AI Gateway**: Use `env.AI.gateway('my-gateway')` for LLM observability.

## 🛠️ Troubleshooting & Debugging

- **Logs**: Use `wrangler tail` to see live logs in production.
- **D1 Local**: Check `.wrangler/state/v3/d1` for local SQLite files.
- **Types**: If types are missing, run `npm run turbo:typecheck`.

## 🚀 Deployment & Ops

- **Main App**: `wrangler pages deploy` (from `apps/web`)
- **Builder**: `wrangler deploy` (from `apps/page-builder`)
- **Secrets**: Set via Cloudflare Dashboard, NEVER in `wrangler.toml`.
- **Compatibility**: Always use `compatibility_date = "2025-04-14"` or later.

---

**Remember**: We are building the **Shopify of Bangladesh**. High performance, multi-tenant security, and edge-native efficiency are non-negotiable. 🇧🇩🚀
