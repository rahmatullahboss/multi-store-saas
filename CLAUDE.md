# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ozzyl** is a multi-tenant SaaS e-commerce platform (Shopify-like) built on Cloudflare Workers with Remix.

- **Runtime**: Cloudflare Workers (Edge)
- **Frontend**: Remix (React 18) + Tailwind CSS v4 + Vite
- **Backend**: Hono.js (API gateway) + Cloudflare D1 (SQLite) + R2 (Storage) + KV (Cache)
- **ORM**: Drizzle ORM
- **Language**: TypeScript (`"strict": true`)
- **Testing**: Vitest + Playwright
- **Auth**: remix-auth with remix-auth-google (merchant), custom JWT (customer)
- **Package Manager**: npm (workspaces)
- **Node**: >=20.0.0

## Architecture

### Hono-to-Remix Gateway Pattern

The entry point is `apps/web/server/index.ts`. Hono handles **all** incoming requests first:

1. **Middleware chain** (in order): Request ID → Logger → Asset Skip → Security Headers → Bot Control → API Security → CSRF (admin/app routes only) → Dynamic CORS → Rate Limiting → Tenant Resolution → Telemetry → Structured Logging
2. **Hono API routes** at `/api/*` (defined in `server/api/`)
3. **Edge caching** for product pages
4. **Static assets** via `ASSETS.fetch()`
5. **Catch-all `app.all('*')`** forwards remaining requests to Remix via `createRequestHandler`

Hono passes `storeId`, `store`, and `isCustomDomain` to Remix's `loadContext`, available in every Remix `loader`/`action` as `context.storeId` and `context.store`.

### Multi-Tenancy

Hostname → `store_id` resolution happens in tenant middleware (`server/middleware/tenant.ts`). Uses KV cache with D1 fallback. **Every DB query must filter by `store_id`** (except super-admin operations).

Two store modes controlled by `store.storeEnabled`:

- **Landing mode**: Single-product landing pages only (e.g., `/p/:slug`)
- **Store mode**: Full e-commerce (products, cart, checkout, collections, etc.)

Route-level gating via `isRouteAllowedForMode()` in `app/lib/store.server.ts`.

### Dual Auth System

1. **Merchant Auth** (`app/services/auth.server.ts`): Cookie session (`__session`, 7-day, `.ozzyl.com` domain). PBKDF2 + SHA-256 password hashing via Web Crypto. Google OAuth. Key functions: `requireUserId()`, `requireSuperAdmin()`, `login()`, `register()`.
2. **Customer Auth** (`app/services/customer-auth.server.ts`): Separate session for storefront customers. Custom JWT via Web Crypto (HMAC SHA-256). Google OAuth for customers. Only enabled for Premium/Business plan stores.

### Route Organization (253 routes in `apps/web/app/routes/`)

| Prefix        | Purpose                             | Auth Guard            |
| ------------- | ----------------------------------- | --------------------- |
| `app.*`       | Merchant Dashboard (87 routes)      | `requireUserId()`     |
| `admin.*`     | Super Admin Panel (16 routes)       | `requireSuperAdmin()` |
| `api.*`       | Remix API endpoints (50+ routes)    | Varies                |
| `store.*`     | Storefront customer auth (6 routes) | Customer auth         |
| `account.*`   | Customer account pages (9 routes)   | Customer session      |
| `auth.*`      | Merchant auth (7 routes)            | Public                |
| `lead-gen.*`  | Lead generation auth (9 routes)     | Customer auth         |
| _(no prefix)_ | Public storefront                   | None                  |

**Hono-level API routes** live separately in `server/api/` (products, orders, stores, graphql, oauth, customers).

### Storefront Settings & Templates (MVP)

**Current active system** — Unified Storefront Settings + simple React component templates:

- **Data**: Single JSON column `stores.storefrontSettings` managed by `app/services/unified-storefront-settings.server.ts`. This is the **single source of truth** for all storefront config (theme, branding, business info, social, announcements, SEO, checkout, shipping, navigation, hero, trust badges, typography, flags).
- **Schema**: `app/services/storefront-settings.schema.ts` defines `UnifiedStorefrontSettingsV1Schema` (Zod). `theme.templateId` selects the template.
- **Rendering**: Hardcoded React component templates from `app/templates/store-registry.ts`. Each template defines its own layout (Header, Footer, ProductPage, CartPage, CollectionPage, CheckoutPage). No dynamic section ordering.
- **MVP Templates**: `starter-store`, `luxe-boutique`, `nova-lux`, `dc-store` (+ `ghorer-bazar`, `tech-modern` allowed). All `React.lazy()` loaded.
- **Merchant config**: Dashboard at `app.store.settings.tsx` — reads via `getUnifiedStorefrontSettings()`, writes via `saveUnifiedStorefrontSettingsWithCacheInvalidation()`.
- **Landing templates** (`app/templates/registry.ts`): 10+ templates for single-product landing pages (separate system).

**Legacy/Archived** (still in codebase but NOT the primary rendering path):

- Shopify 2.0 section-based system: `themes`/`themeTemplates`/`templateSectionsDraft`/`templateSectionsPublished` DB tables, `app/lib/template-resolver.server.ts`, `app/lib/theme-seeding.server.ts`. Only `checkout.tsx` still calls `resolveTemplate()`. Theme seeding still runs during onboarding. Do NOT build new features on this system.
- `app/services/mvp-settings.server.ts` — old MVP key-value settings, now only used as fallback data source inside unified settings migration.

### Database & Services Layer

- **Schema**: Split across 6 files in `packages/database/src/` — core (`schema.ts`), AI agents (`schema_agent.ts`), metafields (`schema_metafields.ts`), page builder (`schema_page_builder.ts`), templates (`schema_templates.ts`), versions (`schema_versions.ts`)
- **DB Client**: `createDb(d1)` from `app/lib/db.server.ts` returns typed Drizzle client. Imported as `@db/schema` and `@db/types` via tsconfig paths.
- **Services**: 59 `.server.ts` files in `app/services/` plus 4 in `server/services/`. Business logic lives here.
- **Caching**: Multi-tier — D1Cache (`cache-layer.server.ts`) → KV Cache (`kv-cache.server.ts`) → Durable Object store-config cache → CF Edge Cache
- **Env validation**: `app/lib/env.server.ts` uses Zod schemas. Use `getEnv(context)` for required vars, `getOptionalEnv(context)` for optional.

### Monorepo Structure

```
apps/
├── web/           # Main e-commerce app (Remix + Hono + Cloudflare Workers)
├── landing/       # Marketing site (Vercel)
├── ai-builder/    # AI Gen features
├── builder/       # Store builder
└── page-builder/  # Page builder
packages/
├── database/      # Drizzle ORM schema & migrations (imported as @db/schema, @db/types)
├── ui/            # Shared React components (shadcn/ui based)
└── video-engine/  # Video processing (Remotion)
```

### Workers (in `apps/web/workers/`)

11 independently deployable workers: `order-processor`, `cart-processor`, `checkout-lock`, `rate-limiter`, `store-config`, `editor-state`, `pdf-generator`, `webhook-dispatcher`, `subdomain-proxy`, `subscription-cron`, `courier-cron`. Each has its own `tsconfig.json`.

Bound to the main app via Service Bindings (e.g., `ORDER_PROCESSOR_SERVICE`, `CART_SERVICE`).

## Commands

### Development (from `apps/web/`)

```bash
npm run dev              # Remix dev (basic, no Cloudflare bindings)
npm run dev:wrangler     # Dev with full Cloudflare environment (USE THIS)
```

### Building & Deploying (from `apps/web/`)

```bash
npm run build            # Build for production
npm run deploy:prod      # Build + deploy to production
npm run deploy:staging   # Build + deploy to staging
```

### Monorepo (from root)

```bash
npm install              # Install all deps
npm run turbo:dev        # Start all dev servers
npm run turbo:build      # Build all
npm run turbo:lint       # Lint all
npm run turbo:typecheck  # Typecheck all
```

### Database (from `apps/web/`)

```bash
npm run db:generate             # Generate Drizzle migrations
npm run db:bootstrap:local      # Run initial SQL migrations locally
npm run db:migrate:local        # Apply pending migrations locally
npm run db:migrate:prod         # Apply pending migrations to production
npm run db:studio               # Open Drizzle Studio
npm run db:export:prod          # Export production DB to ./tmp/
npm run db:integrity:prod       # Run integrity checks on production
```

### Testing (from `apps/web/`)

```bash
npm run test                    # Vitest run (all unit tests)
npm run test:watch              # Vitest watch mode
npm run test:coverage           # Run with v8 coverage
npm run test:ui                 # Vitest UI
vitest run tests/unit/foo.test.ts  # Run a single test file

npm run e2e                     # Playwright (all browsers)
npm run e2e:smoke               # Smoke tests (chromium only)
npm run e2e:ui                  # Playwright UI mode
npm run e2e:debug               # Playwright debug mode

npm run ci:local                # Lint + typecheck + test + e2e
npm run test:all                # Lint + typecheck + test (no e2e)
```

### i18n (from `apps/web/`)

```bash
npm run i18n:extract            # Extract translation keys
```

## Coding Standards

### TypeScript

- No `any`. Use `unknown` with validation if needed.
- Explicit return types for all functions. Early returns over nesting.

### Hono API Layer

- Validate all inputs with `@hono/zod-validator`. Define schemas in `src/schemas/`.
- Throw `HTTPException` from `hono/http-exception` for errors.
- Type context as `Context<{ Bindings: Env }>`.

### D1 / Drizzle

- **NEVER** concatenate strings in SQL. Use `.bind()` for raw D1, or Drizzle's typed queries.
- Use `db.batch([])` for multiple writes.
- **CRITICAL**: All queries must filter by `store_id` (except super-admin).
- Money values in integer cents. Cart/order price snapshots.

### Remix

- `loader` for reads, `action` for writes.
- Prefer URL search params over `useState` for state.
- Intent pattern for actions (multiple intents in one action).
- Tailwind CSS v4 via `@tailwindcss/vite` plugin.

### Key Patterns

- **Server-side Zod validation**: Mandatory for all writes; `props_json` safe parse/stringify.
- **Checkout idempotency**: Use `idempotency_key`; inventory reserve/release.
- **Payment abstraction**: COD/Stripe/SSLCommerz/bKash; webhook verify + dedupe.
- **KV caching**: For published JSON; invalidate on publish.
- **R2 assets**: Signed uploads + asset metadata.

## Critical Rules

1. **Secrets**: Never commit secrets. Use `wrangler secret put`.
2. **Migrations**: Always use migration files. No manual DB changes in prod.
3. **Local Test**: Test with `npm run dev:wrangler` (local D1) before deploying.
4. **Store Isolation**: Verify `store_id` is present in every DB query.
5. **Route Ownership**: Keep `*.ozzyl.com/*` route owned by main app worker only. Do not duplicate wildcard routes in proxy worker configs.
6. **Post-Deploy Health**: After every production deploy, run health check (`/api/healthz`) before declaring success.

## Health Monitoring

```bash
# Set token
cd apps/web
openssl rand -hex 24 | npx wrangler secret put HEALTH_CHECK_TOKEN --env production

# Post-deploy verification
cd /Users/rahmatullahzisan/Desktop/Dev/Multi\ Store\ Saas
HEALTH_CHECK_TOKEN='<token>' \
MAIN_APP_URL='https://app.ozzyl.com' \
MAIN_APP_FALLBACK_URL='https://multi-store-saas.rahmatullahzisan.workers.dev' \
bash apps/web/workers/health-check.sh --main
```

## Vite Config Notes

- `cloudflareDevProxyVitePlugin()` must come before Remix plugin in `vite.config.ts`.
- Heavy client-only libs externalized from SSR: jspdf, grapesjs, tiptap, d3.
- Remix v3 future flags enabled; `v3_lazyRouteDiscovery` disabled for cost optimization.
- React is kept in main bundle (not chunked) to avoid hydration errors.

## Subagents

- `@database-architect` — D1, Drizzle, and Schema design
- `@frontend-specialist` — React, Remix, and Tailwind
- `@qa-engineer` — Vitest, Playwright, and Test Strategy
