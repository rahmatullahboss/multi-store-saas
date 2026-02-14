# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Multi-tenant SaaS e-commerce platform (Ozzyl) built on Cloudflare Workers with Remix for SSR. Each merchant gets their own subdomain (e.g., store1.ozzyl.com) with isolated data via `store_id` scoping.

## Monorepo Structure

```
ozzyl-monorepo/
├── apps/
│   ├── web/           # Main e-commerce app (Remix + Cloudflare)
│   ├── landing/       # Marketing landing page
│   ├── page-builder/  # Visual page editor
│   ├── builder/       # Store builder interface
│   └── ai-builder/    # AI-powered store generation
├── packages/
│   ├── database/      # Drizzle ORM schema + migrations
│   ├── ui/            # Shared UI components
│   └── video-engine/  # Video processing utilities
└── turbo.json         # Turborepo build orchestration
```

## Common Commands

```bash
# Install dependencies
npm install

# Start dev server (turborepo)
npm run turbo:dev

# Build all apps
npm run turbo:build

# Run typecheck
npm run turbo:typecheck

# Run lint
npm run turbo:lint

# Run unit tests
npm run turbo:test

# Run e2e tests
npm run turbo:test -- --filter=@ozzyl/web && npm run e2e

# Format code
npm run format
```

### App-specific Commands (apps/web)

```bash
cd apps/web

# Dev with Cloudflare Wrangler
npm run dev:wrangler

# Generate Drizzle migrations
npm run db:generate

# Bootstrap local database
npm run db:bootstrap:local

# Deploy to production
npm run deploy:prod

# Run specific test file
npm run test -- tests/unit/some-test.test.ts

# Run e2e tests
npm run e2e

# Run smoke tests
npm run e2e:smoke
```

## Architecture

### Multi-tenancy
- Subdomain-based routing: `*.ozzyl.com`
- `shop_id` resolver via KV cache + D1 fallback
- All database queries MUST filter by `store_id`
- Capability gating via `store_enabled` + `home_entry` flags

### Tech Stack
| Layer | Technology |
|-------|------------|
| Runtime | Cloudflare Workers |
| Framework | Remix (React 18) |
| Backend API | Hono.js |
| Database | Cloudflare D1 (SQLite) |
| ORM | Drizzle ORM |
| Storage | Cloudflare R2 |
| Styling | Tailwind CSS |
| Build | Vite |

### Key Workers (apps/web/workers/)
- `cart-processor` - Cart operations
- `checkout-lock` - Checkout concurrency
- `order-processor` - Order handling
- `pdf-generator` - Invoice generation
- `subscription-cron` - Subscription management
- `courier-cron` - Shipping updates

## Database

Database schema lives in `packages/database/src/`. All writes use server-side Zod validation. Money values stored as integers (cents).

### Running Migrations
```bash
# Generate new migration
npm run db:generate

# Apply migrations locally
npm run db:migrate:local

# Apply migrations to production
npm run db:migrate:prod
```

## Key Patterns

### Remix Routes
- Use loader/action intent pattern for form handling
- Public routes read only published content (draft/published snapshot system)
- Optimistic UI with revalidate

### Authentication
- Session-based auth with `__session` cookie
- PBKDF2 password hashing
- `requireUserId()` middleware for protected routes

### R2 Image Upload
- Client-side compression via `imageCompression.ts`
- Signed uploads with metadata
- Returns: `{ url, key, size, type }`

## Environment Variables

Required in `.dev.vars` or `.env`:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_DATABASE_ID`
- `CLOUDFLARE_D1_API_TOKEN`
- `R2` (bucket binding)
- `R2_PUBLIC_URL`

## Testing

- Unit tests: Vitest (`tests/unit/`)
- E2E tests: Playwright (`e2e/`)
- Every bug fix should include a regression test

## Project-Specific Rules (from .agent/rules/PROJECT_RULES.md)

- Always enforce `store_id` scoping in database queries
- Use capability-based gating (not mutually exclusive modes)
- Builder pages and templates share same section registry
- Reorder uses `orderedIds` with batch update (avoid UNIQUE conflicts)
- Server-side Zod validation required for all writes
- Pricing service handles money in integer cents with cart/order snapshots
- Checkout uses `idempotency_key` for idempotency
- Payment abstraction supports COD/Stripe/SSLCommerz/bKash
- KV caching for published JSON with invalidation on publish
