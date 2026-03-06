# Project Context - Multi Store SaaS

## Tech Stack

- **Runtime**: Cloudflare Workers / Pages (Compatibility: 2025-04-14)
- **Framework**: Remix v2 with streaming (defer())
- **API**: Hono (lightweight middleware)
- **Database**: D1 (SQLite-based) + Drizzle ORM
- **Cache**: KV Namespace
- **Storage**: R2 (S3-compatible)
- **AI/ML**: Workers AI + Vectorize
- **Styling**: Tailwind CSS 4.0
- **UI**: Radix UI
- **Testing**: Vitest + Playwright

## Architecture

- **Multi-tenant SaaS** - Every query MUST filter by `store_id`
- **Edge-first** - All code runs on Cloudflare Edge
- **Unified Settings** - Storefront settings in `stores.storefront_settings` JSON

## Database Rules

- ALL queries MUST include `store_id` filter
- Use Drizzle ORM with prepared statements
- Use batch operations for performance

## Code Standards

- TypeScript strict mode
- No `any` types
- Zod validation for all inputs
- Prettier formatting

## Key Files

- Database Schema: `packages/database/src/schema*.ts`
- Theme Registry: `app/templates/store-registry.ts`
- Store Templates: `app/components/store-templates/`

## Payment Gateways

- bKash (Bangladesh MFS)
- Stripe (Cards)
- SSLCommerz (Cards)

## Theme System

- MVP Simple Theme (React components)
- Active themes: starter-store, luxe-boutique, nova-lux
- Settings: storeName, logo, primaryColor, accentColor
