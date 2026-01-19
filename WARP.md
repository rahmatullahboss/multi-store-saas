# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Multi-tenant e-commerce SaaS platform (similar to Shopify) built on Cloudflare's edge infrastructure. Merchants create subdomain stores (e.g., `store1.ozzyl.com`) or use custom domains. The platform supports both full e-commerce stores and landing page funnels with hybrid modes.

## Development Commands

### Main Application
```bash
npm install                    # Install dependencies
npm run dev                    # Remix dev server (http://localhost:5173)
npm run dev:wrangler           # Cloudflare Pages dev with bindings (http://localhost:8787)
npm run build                  # Production build
npm run deploy                 # Deploy main app to Cloudflare Pages

# Development & Testing
npm run typecheck              # TypeScript type checking
npm run lint                   # ESLint check
npm run lint:fix               # Auto-fix ESLint issues
npm run format                 # Format code with Prettier
npm run format:check           # Check formatting

# Testing
npm run test                   # Run unit tests (Vitest)
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Run tests with coverage
npm run test:ui                # Open Vitest UI
npm run test:all               # Run lint, typecheck, and tests
npm run e2e                    # Run E2E tests (Playwright)
npm run e2e:ui                 # Playwright UI mode
npm run e2e:headed             # Run E2E tests with browser visible
npm run e2e:debug              # Debug E2E tests
npm run ci:local               # Full CI suite locally

# Database
npm run db:generate            # Generate Drizzle migrations
npm run db:migrate:local       # Apply migrations locally
npm run db:migrate:prod        # Apply migrations to production
npm run db:studio              # Open Drizzle Studio
```

### Page Builder Worker (Separate Deployment)
```bash
cd apps/page-builder
npm install
npm run dev                    # Remix dev server
npm run start                  # Wrangler dev (Worker mode)
npm run deploy                 # Deploy builder worker to Cloudflare
```

### Local Development Flow
```bash
# Standard workflow
npm run dev                    # Start Remix dev
# Visit http://localhost:5173?store=demo

# With Cloudflare bindings (D1/R2/KV)
npm run dev:wrangler
# Visit http://localhost:8787?store=demo
```

## Architecture

### Tech Stack
- **Runtime**: Cloudflare Workers (edge compute)
- **Frontend**: Remix (React 18 SSR)
- **Backend**: Hono.js (fast API routing)
- **Database**: Cloudflare D1 (SQLite) + Drizzle ORM
- **Storage**: Cloudflare R2 (images), KV (caching)
- **Build**: Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React

### Request Flow
```
Client Request → Cloudflare Edge
  ↓
Hono Server (server/index.ts)
  ↓
Tenant Middleware (resolves store from hostname/subdomain)
  ↓
- API Routes (/api/*) → Hono handlers (server/api/)
- Page Routes → Remix SSR (app/routes/)
  ↓
Drizzle ORM (ALL queries filtered by store_id)
  ↓
Cloudflare D1 Database
```

### Multi-Tenancy Architecture
**Critical**: Every database query MUST be scoped by `store_id` for data isolation.

1. **Tenant Resolution** (`server/middleware/tenant.ts`):
   - Parses hostname → extracts subdomain or custom domain
   - Queries `stores` table (with KV/D1 caching)
   - Injects `storeId` and `store` into request context
   - Development: uses `?store=<subdomain>` query param

2. **Data Isolation**:
   - All tables include `store_id` foreign key to `stores.id`
   - Middleware sets `c.get('storeId')` for use in queries
   - Example pattern:
     ```typescript
     const products = await db
       .select()
       .from(products)
       .where(eq(products.storeId, storeId)) // Always filter by store
     ```

### Key Directories
```
app/
  routes/              # Remix routes (pages + API endpoints)
  components/          # React components
    store-templates/   # Full store themes (Daraz, BDShop, etc.)
    templates/         # Landing page templates (minimal, video-focus, etc.)
    page-builder/      # GrapesJS builder components
    store-sections/    # Reusable sections (ProductGrid, Hero, etc.)
  lib/                 # Utilities and business logic
    unified-sections/  # Unified section registry for pages/templates
    page-builder/      # Page builder actions and types
    validations/       # Zod schemas
  services/            # Server-side services (auth, email, analytics, etc.)
  utils/               # Helper functions

server/
  api/                 # Hono API route handlers
  middleware/          # Tenant resolution, security, rate limiting
  index.ts             # Hono app entry point

db/
  schema.ts            # Drizzle ORM schema
  migrations/          # SQL migration files

apps/page-builder/     # Separate Worker for GrapesJS editor
```

### Database Schema Highlights
- `stores`: Tenant table (subdomain, customDomain, planType, storeEnabled, etc.)
- `users`: Merchant accounts (linked to stores)
- `products`: Store products (with bundlePricing, seoTitle, etc.)
- `customers`: Store customers (with segments, loyaltyPoints, etc.)
- `orders`: Orders (with status, paymentMethod, courierProvider, etc.)
- `builder_pages`: GrapesJS page builder pages
- `saved_landing_configs`: Saved landing page configs (deprecated, moving to builder_pages)

## Critical Development Patterns

### Multi-Tenant Safety
**Always** scope queries by `storeId`:
```typescript
// ✅ Correct
const products = await db
  .select()
  .from(products)
  .where(eq(products.storeId, storeId));

// ❌ Wrong - data leak across tenants!
const products = await db.select().from(products);
```

### Server-Side Validation
Use Zod schemas for all form submissions and API endpoints:
```typescript
import { z } from 'zod';
const schema = z.object({ title: z.string().min(1) });
const validated = schema.parse(formData);
```

### Remix Patterns
- Use `loader` for data fetching (server-side)
- Use `action` for mutations (POST/PUT/DELETE)
- Avoid `useEffect` for data fetching - prefer loaders
- Use `useLoaderData()` and `useActionData()` hooks

### Image Optimization
Use `<OptimizedImage />` component (from `app/components/OptimizedImage.tsx`) instead of raw `<img>` tags for automatic compression and lazy loading.

### Cloudflare Bindings
Access via `context.cloudflare.env` in loaders/actions:
```typescript
export async function loader({ context }: LoaderFunctionArgs) {
  const db = createDb(context.cloudflare.env.DB);
  const r2 = context.cloudflare.env.R2;
  const kv = context.cloudflare.env.STORE_CACHE;
}
```

### Page Builder Integration
- **Main app** (`app/routes/app.page-builder.tsx`): Lists pages, creates drafts
- **Builder worker** (`apps/page-builder`): GrapesJS editor at `builder.ozzyl.com`
- Shared session secret required for cross-subdomain auth
- Sections are registered in `app/lib/unified-sections/registry.ts`
- Published pages read from KV cache, drafts from D1

## Environment Variables

### Required (Set in Cloudflare Dashboard)
```bash
SESSION_SECRET           # Shared between main app + builder worker
RESEND_API_KEY          # Email service
OPENROUTER_API_KEY      # AI features (or XIAOMI_MIMO_API_KEY)
CLOUDFLARE_API_TOKEN    # SSL certificate management
GOOGLE_CLIENT_SECRET    # Google OAuth
VAPID_PRIVATE_KEY       # Push notifications
```

### Configured in wrangler.toml
- `SAAS_DOMAIN`, `R2_PUBLIC_URL`, `SUPER_ADMIN_EMAIL`, `CLOUDFLARE_ZONE_ID`
- `AI_MODEL`, `AI_BASE_URL`, `PAGE_BUILDER_URL`
- Bindings: `DB` (D1), `R2` (bucket), `STORE_CACHE` (KV), `AI_RATE_LIMIT` (KV), `VECTORIZE`, `AI`

## Common Workflows

### Adding a New Feature
1. Create Zod schema in `app/lib/validations/`
2. Add database columns/tables in `db/schema.ts`
3. Generate migration: `npm run db:generate`
4. Apply locally: `npm run db:migrate:local`
5. Create Remix route in `app/routes/`
6. Write tests in `app/tests/` or `tests/`

### Deploying Changes
1. Test locally: `npm run test:all`
2. Build: `npm run build`
3. Deploy main app: `npm run deploy`
4. If builder changed: `cd apps/page-builder && npm run deploy`
5. Apply prod migrations: `npm run db:migrate:prod`

### Testing Multi-Tenancy Locally
```bash
npm run dev:wrangler
# Visit these URLs:
# http://localhost:8787?store=demo
# http://localhost:8787?store=fashion
# http://localhost:8787?store=tech
```

### Debugging Tenant Resolution
Check server logs for `[TENANT]` prefixed messages - middleware logs hostname parsing, cache hits, and store lookups.

## Code Style & Conventions

### Remix Best Practices
- Server-side data fetching in `loader`, not `useEffect`
- Form submissions via `<Form>` component with `action` handlers
- Optimistic UI updates with `useFetcher()`
- Error boundaries for route-level error handling

### Component Organization
- Store templates: `app/components/store-templates/<template-name>/`
- Landing templates: `app/components/templates/<template-name>/`
- Shared sections: `app/components/store-sections/`
- UI components: `app/components/ui/`

### Styling
- Use Tailwind utility classes
- Avoid inline styles
- Use `cn()` utility (from `tailwind-merge`) for conditional classes
- Icons from `lucide-react`

## Testing Strategy
- **Unit tests**: `app/tests/unit/` (Vitest)
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/` (Playwright)
- **API tests**: `app/tests/api/` or `tests/api/`
- Run specific test: `npm run test -- <test-file-path>`

## Payment Integrations
- **Cash on Delivery (COD)**: Default, no external integration
- **bKash**: Tokenized/PGW (sandbox/production)
- **Nagad**: PGW integration
- **Manual payments**: Store-level config for personal bKash/Nagad numbers

## AI Features
- Chatbot: Customer-facing AI (requires `isCustomerAiEnabled`)
- Merchant AI: Product descriptions, marketing copy
- AI rate limiting via KV (`AI_RATE_LIMIT` namespace)
- Credits system: `stores.aiCredits` field

## Security Considerations
- CSRF protection via Remix sessions
- Rate limiting middleware: `/api/*` routes
- Input sanitization: Always use Zod validation
- SQL injection: Drizzle ORM with parameterized queries
- XSS protection: React auto-escapes, avoid `dangerouslySetInnerHTML`
- Session cookies: `__session` (httpOnly, secure, sameSite)

## Troubleshooting

### "Store not found" error
- Check `wrangler.toml` has correct `SAAS_DOMAIN`
- Verify store exists: `SELECT * FROM stores WHERE subdomain='demo'`
- Check tenant middleware logs for hostname parsing

### D1 migration fails
- Ensure database ID matches `wrangler.toml`
- Check migration file syntax (pure SQL, no TypeScript)
- Run migrations in order (0001, 0002, 0003)

### Builder pages not loading
- Verify `SESSION_SECRET` matches between main app and builder worker
- Check KV cache invalidation: pages publish to KV
- Builder worker must be deployed separately

### Type errors after schema changes
- Regenerate types: `npm run db:generate`
- Restart TypeScript server in editor

## Additional Documentation
- Full architecture: `docs/ARCHITECTURE.md`
- API reference: `docs/API_REFERENCE.md`
- Template building: `TEMPLATE_BUILDING_GUIDE.md`
- Testing guide: `TESTING_INSTRUCTIONS.md`
- Agent context: `AGENTS.md`
