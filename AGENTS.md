# AGENTS.md — Multi Store SaaS

> **🎯 Mission**: Build the **Shopify of Bangladesh** — A world-class, multi-tenant e-commerce SaaS on Cloudflare's edge. 🇧🇩🚀  
> **Standard**: 99.99% Uptime, Sub-100ms TTFB, Infinite Scale.  
> **Last Updated**: 2026-02-01  
> **Docs Verified**: ✅ Context7 MCP (Cloudflare, Remix v2, Drizzle ORM, Shopify Themes)

---

## 📑 Table of Contents

1. [Quick Start](#-quick-start)
2. [Architecture & System Design](#-architecture--system-design)
3. [Monorepo Structure](#-monorepo-structure--commands)
4. [Tech Stack](#-tech-stack-cloudflare-native)
5. [Development Workflows](#-development-workflows)
6. [Code Patterns & Examples](#-code-patterns--examples)
7. [Shopify OS 2.0 Theme System](#-shopify-os-20-theme-system)
8. [MVP Simple Theme System (Recommended)](#-mvp-simple-theme-system-recommended)
9. [Store Routes](#-store-routes)
10. [Cloudflare Edge Patterns](#-cloudflare-edge-patterns)
11. [Performance Optimization](#-performance-optimization)
12. [Security & Compliance](#-security--compliance)
13. [AI/ML Integration](#-aiml-integration)
14. [Troubleshooting & Debugging](#-troubleshooting--debugging)
15. [Deployment & Ops](#-deployment--ops)
16. [API Reference](#-api-reference)

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 20+ required
node --version

# Install dependencies
npm install

# Set up local D1 database
npm run db:migrate:local
```

### Development Commands

| Action         | Root Command          | App-Specific (`apps/web`)              |
| -------------- | --------------------- | -------------------------------------- |
| **Dev**        | `npm run turbo:dev`   | `npm run dev` / `npm run dev:wrangler` |
| **Build**      | `npm run turbo:build` | `npm run build`                        |
| **Test**       | `npm run turbo:test`  | `npm run test` / `npm run e2e`         |
| **Lint**       | `npm run turbo:lint`  | `npm run lint`                         |
| **Type Check** | -                     | `npm run typecheck`                    |
| **DB Migrate** | -                     | `npm run db:migrate:local` / `:prod`   |

---

## 🏗️ Architecture & System Design

### C4 Context Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL SYSTEMS                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  bKash   │  │  Stripe  │  │SSLCommerz│  │ Courier  │  │   SMS    │       │
│  │  (MFS)   │  │(Cards)   │  │ (Cards)  │  │  APIs    │  │  Gateway │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼─────────────┼─────────────┘
        │             │             │             │             │
        └─────────────┴─────────────┴─────────────┴─────────────┘
                                    │
┌───────────────────────────────────┼─────────────────────────────────────────┐
│                         CLOUDFLARE EDGE NETWORK                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CLOUDFLARE PAGES                             │    │
│  │  ┌───────────────────────────────────────────────────────────────┐  │    │
│  │  │                    REMIX SSR APPLICATION                       │  │    │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │  │    │
│  │  │  │   Storefront │  │    Admin     │  │    Page Builder      │ │  │    │
│  │  │  │   (Public)   │  │   Dashboard  │  │   (Visual Editor)    │ │  │    │
│  │  │  └──────────────┘  └──────────────┘  └──────────────────────┘ │  │    │
│  │  └───────────────────────────────────────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         CLOUDFLARE WORKERS                           │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐       │    │
│  │  │ Page Builder │  │  Order Queue │  │  AI Services         │       │    │
│  │  │   Worker     │  │(Durable Obj) │  │ (Embeddings)         │       │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER                                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐     │    │
│  │  │   D1     │  │   KV     │  │   R2     │  │   Vectorize      │     │    │
│  │  │  (SQL)   │  │ (Cache)  │  │ (Assets) │  │  (AI Search)     │     │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────────────┘     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            REQUEST LIFECYCLE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

1. EDGE ROUTING
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │   Client    │────▶│  Cloudflare │────▶│   Worker    │
   │   Request   │     │    CDN      │     │   Router    │
   └─────────────┘     └─────────────┘     └──────┬──────┘
                                                  │
2. HOSTNAME RESOLUTION                            ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │   Custom    │────▶│  KV Cache   │────▶│  D1 Lookup  │
   │   Domain    │     │  (storeId)  │     │  (fallback) │
   └─────────────┘     └─────────────┘     └──────┬──────┘
                                                  │
3. MULTI-TENANT DATA FETCH                        ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │  Template   │◀────│  D1 Session │◀────│  KV Cache   │
   │   Render    │     │   (storeId) │     │  (config)   │
   └─────────────┘     └─────────────┘     └─────────────┘
          │
          ▼
4. THEME RENDERING
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ ThemeBridge │────▶│   Section   │────▶│   React     │
   │   Loader    │     │  Registry   │     │   Render    │
   └─────────────┘     └─────────────┘     └─────────────┘
```

### Multi-Tenancy Isolation Model

```typescript
// CRITICAL: Every query MUST include store_id filter
// This is enforced at the database level with composite indexes

// ✅ CORRECT - Scoped by store
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.storeId, currentStoreId));

// ❌ WRONG - Data leak vulnerability
const products = await db.select().from(productsTable);
```

---

## 📂 Monorepo Structure & Commands

### Project Layout

```
ozzyl-monorepo/
├── apps/
│   ├── web/                    # Main Remix SSR app (Cloudflare Pages)
│   │   ├── app/
│   │   │   ├── routes/         # Remix routes (200+ routes)
│   │   │   │   ├── _index.tsx           # Homepage
│   │   │   │   ├── store.home.tsx       # Store homepage
│   │   │   │   ├── products.$id.tsx     # Product page
│   │   │   │   ├── cart.tsx             # Cart
│   │   │   │   ├── checkout.tsx         # Checkout
│   │   │   │   ├── app._index.tsx       # Admin dashboard
│   │   │   │   ├── app.products.tsx     # Product management
│   │   │   │   ├── app.orders.tsx       # Order management
│   │   │   │   ├── api.*.ts             # API endpoints
│   │   │   │   └── ...
│   │   │   ├── components/     # React components
│   │   │   │   ├── store/              # Storefront components
│   │   │   │   ├── admin/              # Admin dashboard components
│   │   │   │   ├── store-builder/      # Theme editor components
│   │   │   │   └── shared/             # Shared components
│   │   │   ├── themes/         # Shopify OS 2.0 themes
│   │   │   │   ├── starter-store/
│   │   │   │   ├── daraz/
│   │   │   │   ├── luxe-boutique/
│   │   │   │   └── ... (15+ themes)
│   │   │   ├── lib/            # Utilities & core logic
│   │   │   │   ├── theme-engine/       # Theme system core
│   │   │   │   ├── db/                 # Database utilities
│   │   │   │   └── utils/              # Helper functions
│   │   │   ├── hooks/          # React hooks
│   │   │   └── services/       # Business logic
│   │   ├── server/             # Server-side code
│   │   │   ├── api/            # Hono API routes
│   │   │   ├── middleware/     # Auth, rate limiting
│   │   │   └── services/       # Backend services
│   │   ├── e2e/                # Playwright E2E tests
│   │   └── tests/              # Vitest unit tests
│   │
│   ├── page-builder/           # GrapesJS visual editor (Worker)
│   │   ├── app/
│   │   └── worker.ts
│   │
│   └── landing/                # Next.js marketing site
│       └── app/
│
├── packages/
│   ├── database/               # Drizzle ORM schemas & migrations
│   │   └── src/
│   │       ├── schema*.ts      # Table definitions
│   │       └── migrations/     # SQL migrations
│   ├── ui/                     # Shared UI components (Radix/Tailwind)
│   └── video-engine/           # Remotion video generation
│
├── .agent/                     # Agent configuration
│   ├── AGENT.md               # Main agent config
│   ├── workflows/             # Task workflows
│   ├── skills/                # Context7 skills
│   └── subagents/             # Review subagents
│
└── docs/                       # Documentation
```

---

## 🛠️ Tech Stack (Cloudflare Native)

| Layer         | Technology             | Purpose                                      |
| ------------- | ---------------------- | -------------------------------------------- |
| **Runtime**   | Workers / Pages        | Edge computing (Compatibility: `2025-04-14`) |
| **Framework** | Remix v2               | React SSR with streaming (`defer()`)         |
| **API**       | Hono                   | Lightweight middleware framework             |
| **Database**  | D1                     | SQLite-based SQL with read replicas          |
| **Cache**     | KV                     | Key-value caching for config & pages         |
| **Storage**   | R2                     | S3-compatible object storage                 |
| **AI/ML**     | Workers AI + Vectorize | Embeddings, search, recommendations          |
| **ORM**       | Drizzle ORM            | Type-safe migrations & batching              |
| **Styling**   | Tailwind CSS 4.0       | Utility-first CSS                            |
| **UI**        | Radix UI               | Accessible primitives                        |
| **Testing**   | Vitest + Playwright    | Unit & E2E testing                           |

---

## 🔄 Development Workflows

### 1. Adding a New Feature

```bash
# Step 1: Check workflow
cat .agent/workflows/add-feature.md

# Step 2: Follow the phases
# Phase 1: Planning - Understand requirements
# Phase 2: Database - Create migrations if needed
# Phase 3: TDD - Write tests first
# Phase 4: Implementation
# Phase 5: Verification
# Phase 6: Code Review
```

### 2. Database Migration Workflow

```bash
# 1. Update schema in packages/database/src/schema*.ts

# 2. Generate migration
npx drizzle-kit generate:sqlite --config=packages/database/drizzle.config.ts

# 3. Apply locally
npm run db:migrate:local

# 4. Verify with Drizzle Studio
npm run db:studio

# 5. Apply to production (when ready)
npm run db:migrate:prod
```

### 3. Creating a New Theme Section

```typescript
// 1. Create section file: app/themes/{theme}/sections/my-section.tsx

import type { SectionComponentProps } from '~/lib/theme-engine/types';

export function MySection({ section, context }: SectionComponentProps) {
  const { settings, blocks } = section;

  return (
    <section className="py-16">
      <h2>{settings.heading as string}</h2>
      {/* Section content */}
    </section>
  );
}

// 2. Define schema
export const schema: SectionSchema = {
  type: 'my-section',
  name: 'My Section',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome' },
    { type: 'color', id: 'bg_color', label: 'Background Color', default: '#ffffff' },
  ],
  blocks: [
    {
      type: 'feature',
      name: 'Feature',
      settings: [
        { type: 'text', id: 'title', label: 'Title' },
        { type: 'textarea', id: 'description', label: 'Description' },
      ],
    },
  ],
  max_blocks: 4,
};

// 3. Register in theme's index.ts
export { MySection, schema } from './sections/my-section';
```

### 4. API Development Workflow

```typescript
// Create: app/routes/api.my-feature.ts

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { z } from 'zod';

// Validation schema
const MyFeatureSchema = z.object({
  name: z.string().min(1).max(255),
  storeId: z.number().positive(),
});

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { DB } = context.cloudflare.env;

  // Always scope by store_id
  const storeId = getStoreIdFromRequest(request);

  const data = await db.select().from(myTable).where(eq(myTable.storeId, storeId));

  return json({ success: true, data });
}

export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const validated = MyFeatureSchema.parse(body);

    // Process...

    return json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ success: false, errors: error.errors }, { status: 400 });
    }
    return json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}
```

---

## 💻 Code Patterns & Examples

### TypeScript Best Practices

```typescript
// ✅ DO: Explicit types, Zod validation
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  storeId: z.string().uuid(),
});

// ✅ DO: Use loader/action patterns with proper typing
export async function loader({ context, params }: LoaderFunctionArgs) {
  const { DB } = context.cloudflare.env;
  // Always scope by store_id for multi-tenancy
  return db.select().from(products).where(eq(products.storeId, storeId));
}

// ✅ DO: Type inference from loader
export default function ProductPage() {
  const { product, reviews } = useLoaderData<typeof loader>();
  // Types are automatically inferred!
}

// ❌ DON'T: Use `any` types
// ❌ DON'T: Trust client data without validation
// ❌ DON'T: Query without store_id (breaks multi-tenancy)
```

### Database Patterns (D1 + Drizzle)

```typescript
// ✅ DO: Always scope queries by storeId (MULTI-TENANCY CRITICAL)
const products = await db.select().from(productsTable).where(eq(productsTable.storeId, storeId));

// ✅ DO: Use D1 Sessions API for read-after-write consistency
// Source: Cloudflare D1 Read Replication (2025-04-10)
const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-unconstrained';
const session = env.DB.withSession(bookmark);
const result = await session
  .prepare(`SELECT * FROM products WHERE store_id = ?`)
  .bind(storeId)
  .run();
// Store bookmark for next request
response.headers.set('x-d1-bookmark', session.getBookmark() ?? '');

// ✅ DO: Batch operations for performance (reduces network latency)
// Source: Drizzle ORM batch-api
const batchResponse = await db.batch([
  db.insert(productsTable).values(product1).returning({ id: productsTable.id }),
  db.insert(productsTable).values(product2).returning({ id: productsTable.id }),
  db
    .update(productsTable)
    .set({ inventory: sql`inventory - 1` })
    .where(eq(productsTable.id, productId)),
]);

// ❌ DON'T: Query without storeId filter (data leak!)
// ❌ DON'T: Use raw SQL without parameterization
// ❌ DON'T: Use "first-primary" for read-heavy loads (use "first-unconstrained" for non-critical reads)
```

### Remix Data Loading Patterns

```typescript
// ✅ DO: Use Remix data patterns with streaming
import { defer } from '@remix-run/cloudflare';
import { Await, useLoaderData } from '@remix-run/react';
import { Suspense } from 'react';

export async function loader({ params }: LoaderFunctionArgs) {
  // 👇 Critical data - await immediately
  const product = await db.getProduct(params.id);

  // 👇 Non-critical data - pass promise directly (NOT awaited)
  const reviewsPromise = db.getReviews(params.id);
  const relatedPromise = db.getRelatedProducts(params.id);

  return defer({
    product,
    reviews: reviewsPromise, // Streamed over the network!
    related: relatedPromise,
  });
}

export default function ProductPage() {
  const { product, reviews, related } = useLoaderData<typeof loader>();

  return (
    <>
      <ProductDetails product={product} />

      {/* Streaming deferred data with Suspense */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(reviews) => <Reviews reviews={reviews} />}
        </Await>
      </Suspense>

      <Suspense fallback={<RelatedSkeleton />}>
        <Await resolve={related}>
          {(related) => <RelatedProducts products={related} />}
        </Await>
      </Suspense>
    </>
  );
}

// ❌ DON'T: Use useEffect for data fetching
// ❌ DON'T: Await non-critical promises (blocks rendering)
```

### Error Handling Pattern

```typescript
// ✅ DO: Structured error responses
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const data = await request.json();
    const validated = ProductSchema.parse(data);
    // ... process
    return json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('Action error:', error);
    return json({ success: false, error: 'Internal error' }, { status: 500 });
  }
}

// ✅ DO: Error boundaries in routes
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <ErrorPage status={error.status} message={error.data} />;
  }

  return <ErrorPage status={500} message="Something went wrong" />;
}
```

### Hono + Cloudflare Bindings

```typescript
// Source: Hono Cloudflare Workers docs
import { Hono } from 'hono';

// Type-safe bindings definition
type Bindings = {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  AI: Ai;
  VECTORIZE: VectorizeIndex;
};

const app = new Hono<{ Bindings: Bindings }>();

// Access bindings via c.env
app.get('/api/products', async (c) => {
  const { DB } = c.env;
  const db = drizzle(DB);

  const storeId = c.req.header('x-store-id');
  const products = await db.select().from(productsTable).where(eq(productsTable.storeId, storeId));

  return c.json({ products });
});
```

---

## 🎨 Shopify OS 2.0 Theme System

### Overview

The storefront uses a **Shopify OS 2.0 compatible theme system** with:

- **JSON-based section schemas** with settings and blocks
- **ThemeBridge** for loading themes and sections
- **ThemeStoreRenderer** for rendering sections on storefront
- **LiveEditorV2** for visual editing (drag-and-drop)
- **Database-backed draft/publish workflow**

### Key Components

```
apps/web/app/
├── themes/                          # Shopify OS 2.0 themes
│   ├── starter-store/              # Default starter theme
│   ├── daraz/                      # Daraz-style marketplace
│   ├── bdshop/                     # BDShop variant
│   ├── ghorer-bazar/               # Grocery theme
│   ├── luxe-boutique/              # Luxury boutique
│   └── tech-modern/                # Tech/gadget theme
├── lib/theme-engine/               # Core engine
│   ├── ThemeBridge.ts             # Theme loader & section registry
│   ├── types/index.ts             # TypeScript types
│   ├── db-integration.ts          # DB CRUD operations
│   └── utils/page-renderer.tsx    # Dynamic page rendering
└── components/store/
    └── ThemeStoreRenderer.tsx     # Storefront section renderer
```

### Theme Structure (Shopify-like)

```
themes/starter-store/
├── index.ts                 # Theme exports & registration
├── theme.json              # Theme config (colors, typography)
├── templates/
│   └── index.json          # Homepage template (section order)
└── sections/
    ├── header.tsx          # Header section with schema
    ├── footer.tsx          # Footer section with schema
    ├── hero-banner.tsx     # Hero banner section
    ├── featured-collection.tsx
    └── ...
```

### Section Schema Format

```typescript
export const schema: SectionSchema = {
  type: 'hero-banner',
  name: 'Hero Banner',
  settings: [
    { type: 'text', id: 'heading', label: 'Heading', default: 'Welcome' },
    { type: 'image', id: 'background_image', label: 'Background' },
    { type: 'color', id: 'text_color', label: 'Text Color', default: '#ffffff' },
  ],
  blocks: [
    {
      type: 'button',
      name: 'Button',
      settings: [
        { type: 'text', id: 'text', label: 'Button Text' },
        { type: 'url', id: 'link', label: 'Link' },
      ],
    },
  ],
  max_blocks: 3,
};
```

### Using ThemeBridge

```typescript
import { getThemeBridge } from '~/lib/theme-engine/ThemeBridge';

const bridge = getThemeBridge('luxe-boutique');
const config = bridge.getConfig();
const registry = bridge.getSectionRegistry();
const SectionComponent = registry['hero-banner'].component;
```

### Using ThemeStoreRenderer

```tsx
<ThemeStoreRenderer
  themeId={storeTemplateId}
  sections={template.sections.map((s) => ({
    id: s.id,
    type: s.type,
    settings: s.props || {},
    blocks: s.blocks || [],
    enabled: s.enabled,
  }))}
  store={{ id: storeId, name: storeName, currency, logo }}
  pageType="index"
  products={products}
  collections={collections}
  skipHeaderFooter={true}
/>
```

### Registered Themes

| Theme ID         | Description           | Sections      |
| ---------------- | --------------------- | ------------- |
| `starter-store`  | Default minimal store | 8 sections    |
| `daraz`          | Marketplace style     | 6 sections    |
| `bdshop`         | BDShop variant        | Extends daraz |
| `ghorer-bazar`   | Grocery store         | Extends daraz |
| `luxe-boutique`  | Luxury boutique       | 5 sections    |
| `tech-modern`    | Tech/gadget store     | 5 sections    |
| `aurora-minimal` | Minimal aesthetic     | 4 sections    |
| `nova-lux`       | High-end fashion      | 6 sections    |
| `eclipse`        | Dark mode theme       | 5 sections    |
| `artisan-market` | Handmade/crafts       | 5 sections    |
| `freshness`      | Grocery/organic       | 6 sections    |
| `rovo`           | High-fashion          | 5 sections    |
| `sokol`          | Dark/contrast         | 5 sections    |
| `turbo-sale`     | Dropshipping          | 6 sections    |
| `zenith-rise`    | SaaS/Digital          | 6 sections    |

### Agent Rules for Theme System

1. **New sections** should be added to `~/themes/{theme-name}/sections/`
2. **Section schemas** must follow Shopify OS 2.0 format
3. **Always use ThemeStoreRenderer** for storefront rendering
4. **Use LiveEditorV2** for the theme editor (not old LiveEditor)

### DO NOT USE (Legacy - Removed)

- ❌ `StoreSectionRenderer` (deleted)
- ❌ `~/lib/unified-sections/` (deleted)
- ❌ `~/components/store/sections/` (deleted)
- ❌ `LiveEditor.client.tsx` (deleted - use LiveEditorV2)
- ❌ `template-render.tsx` route (deleted)

### File Locations

- **Theme sections**: `~/themes/{theme}/sections/*.tsx`
- **Theme config**: `~/themes/{theme}/theme.json`
- **Theme bridge**: `~/lib/theme-engine/ThemeBridge.ts`
- **Store renderer**: `~/components/store/ThemeStoreRenderer.tsx`
- **Live editor**: `~/components/store-builder/LiveEditorV2.client.tsx`

---

## 🏪 MVP Simple Theme System (Recommended)

> **⚠️ IMPORTANT**: For MVP launch, we recommend using the **Simple Theme System** instead of the full Shopify OS 2.0 system to avoid complexity and ensure consistency.

### The Problem with Current Dual System

The codebase currently has **two competing theme systems**:

1. **Old System** (`store-registry.ts`): React components with hardcoded themes
2. **New System** (Shopify OS 2.0): Database-driven sections with visual editor

**Issues:**

- Routes check both systems with complex fallback chains
- Color inconsistency: Sections use hardcoded defaults, not theme colors
- Header/footer vary across pages due to different fallback logic
- Too complex for MVP - needs extensive testing

### MVP Solution: Simple Theme Configuration

**Approach**: Use the old **React Component System** with a simple settings layer on top.

```
┌──────────────────────────────────────────────────────────────┐
│              MVP SIMPLE THEME SYSTEM                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Database (Simple Key-Value)                                 │
│  ┌─────────────────────────────────────┐                     │
│  │ store_mvp_settings                  │                     │
│  │  - storeName                        │                     │
│  │  - logo                             │                     │
│  │  - primaryColor                     │                     │
│  │  - accentColor                      │                     │
│  │  - announcementText                 │                     │
│  └─────────────────────────────────────┘                     │
│                          │                                   │
│                          ▼                                   │
│  Theme Registry (store-registry.ts)                          │
│  ┌─────────────────────────────────────┐                     │
│  │ 1. Get base theme colors            │                     │
│  │ 2. Merge with user settings         │                     │
│  │ 3. Pass to React components         │                     │
│  └─────────────────────────────────────┘                     │
│                          │                                   │
│                          ▼                                   │
│  React Components (Old System)                               │
│  ┌─────────────────────────────────────┐                     │
│  │ <Template.component />              │                     │
│  │ <template.Header />                 │                     │
│  │ <template.Footer />                 │                     │
│  │ <template.ProductPage />            │                     │
│  └─────────────────────────────────────┘                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Configuration Schema

**Only 5 settings for MVP** (inspired by Shopify's minimal color requirements):

```typescript
// ~/config/mvp-theme-settings.ts

export interface MVPThemeSettings {
  // Identity
  storeName: string; // Override default store name
  logo?: string | null; // Store logo URL
  favicon?: string | null; // Browser favicon

  // Colors (Only 2 for MVP simplicity)
  primaryColor: string; // Brand color (buttons, links)
  accentColor: string; // Highlights, badges, CTAs

  // Optional
  announcementText?: string; // Top banner text
  showAnnouncement: boolean; // Toggle banner
}

// Default values for each theme
export const DEFAULT_MVP_SETTINGS: Record<string, MVPThemeSettings> = {
  'starter-store': {
    storeName: 'My Store',
    primaryColor: '#4F46E5', // Indigo
    accentColor: '#F59E0B', // Amber
    showAnnouncement: false,
  },
  'ghorer-bazar': {
    storeName: 'ঘরের বাজার',
    primaryColor: '#fc8934', // Orange
    accentColor: '#e53935', // Red
    showAnnouncement: true,
    announcementText: '১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি!',
  },
  // ... other themes
};
```

### Database Schema

**Single table for all MVP settings**:

```sql
-- stores table already has themeConfig JSON column
-- Just add mvpSettings field or use separate table

CREATE TABLE store_mvp_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  theme_id TEXT NOT NULL DEFAULT 'starter-store',
  settings_json TEXT NOT NULL,  -- JSON: {storeName, logo, primaryColor, ...}
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX idx_mvp_settings_store ON store_mvp_settings(store_id);
```

### Route Implementation

**How to modify routes for MVP system**:

```typescript
// store.home.tsx - Simplified loader
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeContext = await resolveStore(context, request);
  if (!storeContext) throw new Response('Store not found', { status: 404 });

  const { storeId, store } = storeContext;
  const db = drizzle(context.cloudflare.env.DB);

  // 1. Get theme ID from store config
  const themeConfig = parseThemeConfig(store.themeConfig as string | null);
  const templateId = themeConfig?.storeTemplateId || 'starter-store';

  // 2. Fetch user settings from simple table
  const userSettings = await getMVPSettings(db, storeId);

  // 3. Get template from registry (OLD SYSTEM)
  const template = getStoreTemplate(templateId);

  // 4. Merge theme colors with user settings
  const themeColors = getStoreTemplateTheme(templateId);
  const mergedTheme = {
    ...themeColors,
    primary: userSettings.primaryColor || themeColors.primary,
    accent: userSettings.accentColor || themeColors.accent,
  };

  // 5. Fetch products
  const products = await db.select().from(productsTable)
    .where(eq(productsTable.storeId, storeId))
    .limit(12);

  return json({
    storeId,
    storeName: userSettings.storeName || store.name,
    logo: userSettings.logo || store.logo,
    templateId,
    theme: mergedTheme,
    userSettings,
    products,
  });
}

// Component - Use old template system
export default function StoreHomePage() {
  const { storeName, logo, templateId, theme, userSettings, products } = useLoaderData<typeof loader>();

  // Get template component from registry
  const template = getStoreTemplate(templateId);

  return (
    <StorePageWrapper
      storeName={storeName}
      logo={logo}
      theme={theme}
    >
      {/* Use old React component system - consistent across all pages */}
      <template.component
        storeName={storeName}
        logo={logo}
        theme={theme}
        products={products}
        categories={categories}
        config={userSettings}
        currency={currency}
      />
    </StorePageWrapper>
  );
}
```

### Admin Settings Page

**Simple form for merchants**:

```typescript
// routes/app.store.settings.tsx
export default function StoreSettingsPage() {
  const { store, currentSettings, availableThemes } = useLoaderData<typeof loader>();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Store Appearance</h1>

      <Form method="post" className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Theme</label>
          <div className="grid grid-cols-3 gap-4">
            {availableThemes.map((theme) => (
              <label key={theme.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="templateId"
                  value={theme.id}
                  defaultChecked={currentSettings.themeId === theme.id}
                  className="sr-only peer"
                />
                <div className="p-4 border-2 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50">
                  <img src={theme.thumbnail} alt={theme.name} className="w-full h-24 object-cover rounded mb-2" />
                  <p className="text-sm font-medium text-center">{theme.name}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium mb-1">Store Name</label>
          <input
            type="text"
            name="storeName"
            defaultValue={currentSettings.storeName}
            className="w-full border rounded p-2"
          />
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium mb-1">Logo</label>
          <ImageUploader
            name="logo"
            defaultValue={currentSettings.logo}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="primaryColor"
                defaultValue={currentSettings.primaryColor}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                name="primaryColorText"
                defaultValue={currentSettings.primaryColor}
                className="flex-1 border rounded p-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="accentColor"
                defaultValue={currentSettings.accentColor}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                name="accentColorText"
                defaultValue={currentSettings.accentColor}
                className="flex-1 border rounded p-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Announcement Banner */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              name="showAnnouncement"
              defaultChecked={currentSettings.showAnnouncement}
            />
            <span className="font-medium">Show Announcement Banner</span>
          </label>
          {currentSettings.showAnnouncement && (
            <input
              type="text"
              name="announcementText"
              defaultValue={currentSettings.announcementText}
              placeholder="e.g., Free delivery over 1000 TK"
              className="w-full border rounded p-2"
            />
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700"
        >
          Save Changes
        </button>
      </Form>
    </div>
  );
}
```

### Benefits of MVP Approach

| Aspect             | Full Shopify 2.0                         | MVP Simple                    |
| ------------------ | ---------------------------------------- | ----------------------------- |
| **Complexity**     | High - Sections, blocks, schemas         | Low - 5 settings only         |
| **Consistency**    | Risky - multiple fallback paths          | Guaranteed - single code path |
| **DB Queries**     | Multiple (templates, sections, settings) | Single settings query         |
| **Customization**  | Full visual editor                       | Basic colors + logo           |
| **Time to Launch** | Weeks of testing                         | Days to implement             |
| **Migration Path** | Complex                                  | Easy - add settings later     |

### Migration to Full System (Future)

When ready to migrate to Shopify 2.0 system:

```typescript
// 1. Keep MVP settings as base
const baseSettings = await getMVPSettings(db, storeId);

// 2. Create default template from MVP settings
const defaultTemplate = createTemplateFromMVP(baseSettings);

// 3. Save to new template system
await saveTemplateToShopifySystem(db, storeId, defaultTemplate);

// 4. Gradually migrate stores
```

### Implementation Checklist

- [ ] Create `store_mvp_settings` table migration
- [ ] Create `~/config/mvp-theme-settings.ts` with schema
- [ ] Create `~/services/mvp-settings.server.ts` for CRUD operations
- [ ] Modify `store.home.tsx` to use old template system
- [ ] Modify `products.$id.tsx` to use old template system
- [ ] Modify `cart.tsx` to use old template system
- [ ] Create `app.store.settings.tsx` admin page
- [ ] Test all 5 MVP themes with custom colors
- [ ] Document merchant-facing settings page

### Active MVP Themes

| Theme           | Primary              | Accent              | Best For          |
| --------------- | -------------------- | ------------------- | ----------------- |
| `starter-store` | #4F46E5 (Indigo)     | #F59E0B (Amber)     | General purpose   |
| `ghorer-bazar`  | #fc8934 (Orange)     | #e53935 (Red)       | Grocery/Food      |
| `luxe-boutique` | #1a1a1a (Black)      | #c9a961 (Gold)      | Fashion/Luxury    |
| `nova-lux`      | #1C1C1E (Charcoal)   | #C4A35A (Rose Gold) | Premium lifestyle |
| `tech-modern`   | #0f172a (Dark Slate) | #3b82f6 (Blue)      | Electronics       |

---

## 🏪 Store Routes

All storefront routes use `ThemeStoreRenderer`:

| Route        | File                    | Renderer                   |
| ------------ | ----------------------- | -------------------------- |
| Homepage     | `store.home.tsx`        | ThemeStoreRenderer         |
| Product      | `products.$id.tsx`      | ThemeStoreRenderer         |
| Cart         | `cart.tsx`              | ThemeStoreRenderer         |
| Collection   | `collections.$slug.tsx` | ThemeStoreRenderer         |
| Custom Pages | `pages.$slug.tsx`       | ThemeStoreRenderer         |
| Checkout     | `checkout.tsx`          | Custom (not section-based) |

### Route Pattern

```typescript
// Load template from DB
const template = await resolveTemplate(env.DB, storeId, 'home');

// Render with ThemeStoreRenderer
<ThemeStoreRenderer
  themeId={storeTemplateId}
  sections={template?.sections || []}
  store={{ id, name, currency }}
  pageType="index"
  products={products}
/>
```

---

## ☁️ Cloudflare Edge Patterns

### 1. KV Caching

Cache store configuration and published pages. Invalidate on publish.

```typescript
// Cache store configuration
const cacheKey = `store:${storeId}:config`;
const cached = await env.KV.get(cacheKey, 'json');

if (cached) {
  return json(cached);
}

// Fetch from D1 if not cached
const config = await db.query.stores.findFirst({
  where: eq(stores.id, storeId),
});

// Cache for 1 hour
await env.KV.put(cacheKey, JSON.stringify(config), {
  expirationTtl: 60 * 60, // 1 hour
});
```

### 2. R2 Storage

Use for product images and builder assets.

```typescript
// Upload to R2
const key = `stores/${storeId}/products/${productId}/${filename}`;
await env.R2.put(key, fileBuffer, {
  httpMetadata: { contentType: file.type },
});

// Generate signed URL for private assets
const signedUrl = await env.R2.createSignedUrl(key, {
  expiresIn: 3600, // 1 hour
});
```

### 3. Durable Objects (Order Queue)

Used for background tasks like sending emails and updating inventory.

```typescript
// Order queue Durable Object
export class OrderQueue {
  async fetch(request: Request) {
    const url = new URL(request.url);

    if (url.pathname === '/process') {
      // Process order asynchronously
      await this.processOrder(await request.json());
      return new Response('OK');
    }

    return new Response('Not Found', { status: 404 });
  }

  async processOrder(order: Order) {
    // Send confirmation email
    await sendEmail(order.customerEmail, 'order-confirmation', order);

    // Update inventory
    await updateInventory(order.items);

    // Notify admin
    await notifyAdmin(order);
  }
}
```

### 4. Cache API for HTTP Responses

```typescript
export default {
  async fetch(request, env, ctx): Promise<Response> {
    const cacheUrl = new URL(request.url);
    const cacheKey = new Request(cacheUrl.toString(), request);
    const cache = caches.default;

    // Check cache first
    let response = await cache.match(cacheKey);

    if (!response) {
      // Fetch from origin
      response = await fetch(request);
      response = new Response(response.body, response);

      // Cache for 10 seconds (adjust as needed)
      response.headers.append('Cache-Control', 's-maxage=10');

      ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  },
};
```

---

## ⚡ Performance Optimization

### D1 Query Optimization

```typescript
// ✅ DO: Use prepared statements for repeated queries
const stmt = env.DB.prepare('SELECT * FROM products WHERE store_id = ? AND status = ?');
const products = await stmt.bind(storeId, 'active').all();

// ✅ DO: Use indexes for common queries
// In schema: .primaryKey().references(() => stores.id)
//            .index('idx_store_status')

// ✅ DO: Limit result sets
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.storeId, storeId))
  .limit(50) // Always paginate
  .offset(offset);

// ✅ DO: Select only needed columns
const products = await db
  .select({
    id: productsTable.id,
    name: productsTable.name,
    price: productsTable.price,
  })
  .from(productsTable)
  .where(eq(productsTable.storeId, storeId));
```

### KV Caching Strategies

```typescript
// Multi-layer caching
const CACHE_TTL = {
  storeConfig: 60 * 60, // 1 hour
  publishedPage: 60 * 5, // 5 minutes
  productList: 60 * 2, // 2 minutes
  productDetail: 60 * 10, // 10 minutes
};

async function getCachedOrFetch<T>(
  kv: KVNamespace,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number
): Promise<T> {
  const cached = await kv.get(key, 'json');
  if (cached) return cached as T;

  const data = await fetcher();
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
  return data;
}
```

### Image Optimization

```typescript
// Use Cloudflare Images for automatic optimization
<OptimizedImage
  src={product.imageUrl}
  alt={product.name}
  width={400}
  height={400}
  fit="cover"
  loading="lazy"
/>

// Or use R2 with on-the-fly resizing
const imageUrl = `https://images.ozzyl.com/cdn-cgi/image/width=400,quality=80/${r2Key}`;
```

### Bundle Optimization

```typescript
// ✅ DO: Code split large components
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ DO: Use dynamic imports for routes
// Remix handles this automatically with route-based code splitting

// ✅ DO: Tree-shake unused exports
// Use `sideEffects: false` in package.json
```

---

## 🔒 Security & Compliance

### Multi-Tenancy Security (CRITICAL)

```typescript
// 🔴 CRITICAL: Every query MUST be scoped by store_id
// This is enforced at the database level

// ✅ SECURE
const orders = await db.select().from(ordersTable).where(eq(ordersTable.storeId, currentStoreId));

// ❌ VULNERABLE - Data leak!
const orders = await db.select().from(ordersTable);
```

### Authentication & Authorization

```typescript
// Protected route pattern
export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await requireUser(request, context);
  const store = await requireStoreAccess(user.id, storeId, context);

  // Now safe to query store data
  const data = await db.select().from(productsTable).where(eq(productsTable.storeId, store.id));

  return json({ data });
}

// Role-based access
const ROLES = {
  OWNER: 'owner', // Full access
  ADMIN: 'admin', // Most access
  MANAGER: 'manager', // Limited access
  STAFF: 'staff', // Read-only + specific actions
} as const;
```

### Input Validation

```typescript
// Zod validation for all inputs
const ProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive().max(10000000),
  description: z.string().max(5000).optional(),
  storeId: z.number().positive(),
});

// Validate in actions
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const raw = Object.fromEntries(formData);

  const result = ProductSchema.safeParse(raw);
  if (!result.success) {
    return json({ errors: result.error.flatten() }, { status: 400 });
  }

  // Safe to use result.data
}
```

### Rate Limiting

```typescript
// KV-based rate limiting
async function rateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  window: number // seconds
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(now / window) * window;
  const cacheKey = `ratelimit:${key}:${windowStart}`;

  const current = await kv.get(cacheKey);
  const count = current ? parseInt(current) : 0;

  if (count >= limit) {
    return false; // Rate limited
  }

  await kv.put(cacheKey, String(count + 1), { expirationTtl: window });
  return true;
}
```

### Security Checklist

- [ ] All DB queries filtered by `storeId`
- [ ] No cross-store data access
- [ ] Store ownership verified
- [ ] Protected routes have auth checks
- [ ] Session validated on every request
- [ ] All inputs validated with Zod
- [ ] Using Drizzle ORM (parameterized)
- [ ] No raw SQL with user input
- [ ] User content escaped in templates
- [ ] CSP headers configured
- [ ] Rate limiting on auth endpoints
- [ ] No hardcoded API keys
- [ ] Payment data never stored locally
- [ ] Webhook signatures verified

---

## 🤖 AI/ML Integration

### Workers AI for Embeddings

```typescript
// Generate product embeddings for semantic search
async function generateProductEmbedding(product: Product, env: Env) {
  const text = `${product.name} ${product.description} ${product.category}`;

  const embedding = await env.AI.run('@cf/baai/bge-base-en-v1.5', {
    text: [text],
  });

  return embedding.data[0];
}
```

### Vectorize for Semantic Search

```typescript
// Insert product embedding
await env.VECTORIZE.insert([
  {
    id: `product:${product.id}`,
    values: embedding,
    metadata: {
      storeId: product.storeId,
      productId: product.id,
      category: product.category,
    },
  },
]);

// Search similar products
const results = await env.VECTORIZE.query(embedding, {
  topK: 10,
  filter: {
    storeId: { $eq: storeId }, // Multi-tenant filter
  },
});
```

### AI-Powered Recommendations

```typescript
// Get personalized recommendations
async function getRecommendations(
  customerId: string,
  storeId: number,
  env: Env
): Promise<Product[]> {
  // Get customer's purchase history embedding
  const customerEmbedding = await getCustomerEmbedding(customerId, env);

  // Find similar products
  const similar = await env.VECTORIZE.query(customerEmbedding, {
    topK: 20,
    filter: {
      storeId: { $eq: storeId },
    },
  });

  // Fetch full product details
  const productIds = similar.matches.map((m) => m.metadata.productId);
  return db.select().from(products).where(inArray(products.id, productIds));
}
```

---

## 🛠️ Troubleshooting & Debugging

### Common Issues & Solutions

| Issue                           | Cause                                | Solution                                               |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| **D1 "database not found"**     | Wrong database ID in wrangler.toml   | Check `database_id` matches Cloudflare dashboard       |
| **KV cache not invalidating**   | TTL too long or wrong key format     | Use consistent key format: `store:{id}:config`         |
| **Theme not loading**           | Theme ID not in ThemeBridge registry | Check `ThemeBridge.ts` THEME_REGISTRY                  |
| **Sections not rendering**      | Section type not found in theme      | Verify section type exists in theme's section registry |
| **Type errors after DB change** | Schema not updated                   | Run `npm run turbo:typecheck` and regenerate types     |
| **E2E tests failing**           | Database state not reset             | Ensure test isolation with fresh DB per test           |

### Debug Commands

```bash
# View live logs in production
wrangler tail

# Check D1 local database
ls -la .wrangler/state/v3/d1/
sqlite3 .wrangler/state/v3/d1/*.sqlite3

# Run single test file
npx vitest app/path/to/file.test.ts

# Debug Playwright tests
npm run e2e -- --debug

# Check TypeScript errors
npm run typecheck

# Lint check
npm run lint
```

### Logging Best Practices

```typescript
// ✅ DO: Structured logging
console.log(
  JSON.stringify({
    level: 'info',
    message: 'Order created',
    orderId: order.id,
    storeId: store.id,
    timestamp: new Date().toISOString(),
  })
);

// ✅ DO: Error logging with context
console.error('Payment failed:', {
  error: error.message,
  orderId: order.id,
  paymentMethod: order.paymentMethod,
  timestamp: new Date().toISOString(),
});

// ❌ DON'T: Log sensitive data (passwords, tokens, card numbers)
// ❌ DON'T: Use console.log in production (use proper logging service)
```

---

## 🚀 Deployment & Ops

### Deployment Commands

```bash
# Main App (Cloudflare Pages)
cd apps/web
npm run build
wrangler pages deploy

# Page Builder Worker
cd apps/page-builder
wrangler deploy

# Landing Site (Vercel)
cd apps/landing
vercel --prod
```

### Environment Variables

Set via Cloudflare Dashboard, NEVER in `wrangler.toml`:

```bash
# Required secrets
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
BKASH_APP_KEY
BKASH_APP_SECRET
SSLCOMMERZ_STORE_ID
SSLCOMMERZ_STORE_PASSWORD
JWT_SECRET

# Optional
SENTRY_DSN
SENDGRID_API_KEY
```

### wrangler.toml Configuration

```toml
name = "ozzyl-web"
compatibility_date = "2025-04-14"
compatibility_flags = ["nodejs_compat"]

[site]
bucket = "./build/client"

[[d1_databases]]
binding = "DB"
database_name = "ozzyl-prod"
database_id = "your-database-id"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"

[[r2_buckets]]
binding = "R2"
bucket_name = "ozzyl-assets"

[ai]
binding = "AI"

[[vectorize]]
binding = "VECTORIZE"
index_name = "ozzyl-search"
```

---

## 📚 API Reference

### Key Files Reference

| Purpose             | Path                                                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Theme Bridge**    | [`app/lib/theme-engine/ThemeBridge.ts`](apps/web/app/lib/theme-engine/ThemeBridge.ts)                                   |
| **Store Renderer**  | [`app/components/store/ThemeStoreRenderer.tsx`](apps/web/app/components/store/ThemeStoreRenderer.tsx)                   |
| **Live Editor**     | [`app/components/store-builder/LiveEditorV2.client.tsx`](apps/web/app/components/store-builder/LiveEditorV2.client.tsx) |
| **Database Schema** | [`packages/database/src/schema*.ts`](packages/database/src/)                                                            |
| **Middleware**      | [`app/server/middleware/`](apps/web/app/server/middleware/)                                                             |
| **Services**        | [`app/services/`](apps/web/app/services/)                                                                               |

### Context7 Library References

Use these IDs with Context7 MCP for latest docs:

| Library         | Context7 ID                          | Snippets |
| --------------- | ------------------------------------ | -------- |
| Cloudflare Docs | `/cloudflare/cloudflare-docs`        | 20,980   |
| Remix v2        | `/websites/v2_remix_run`             | 966      |
| Hono            | `/honojs/website`                    | 1,360    |
| Drizzle ORM     | `/llmstxt/orm_drizzle_team_llms_txt` | 3,630    |

```bash
# Example: Query Cloudflare D1 docs
mcp__context7__invoke_tool query-docs /cloudflare/cloudflare-docs "D1 sessions API read replicas"
```

### Agent Resources

| Resource                 | Path                                                                             |
| ------------------------ | -------------------------------------------------------------------------------- |
| **Main Agent Config**    | [`.agent/AGENT.md`](.agent/AGENT.md)                                             |
| **Project Rules**        | [`.agent/rules/PROJECT_RULES.md`](.agent/rules/PROJECT_RULES.md)                 |
| **Add Feature Workflow** | [`.agent/workflows/add-feature.md`](.agent/workflows/add-feature.md)             |
| **Security Reviewer**    | [`.agent/subagents/security-reviewer.md`](.agent/subagents/security-reviewer.md) |

---

## 📏 Coding Standards & Style

### 1. Naming & Formatting

- **Files**: kebab-case (e.g., `product-card.tsx`, `auth.server.ts`)
- **Components**: PascalCase (e.g., `export function OrderTable()`)
- **Hooks**: camelCase starting with `use` (e.g., `useStoreData`)
- **Types/Interfaces**: PascalCase (e.g., `Product`, `OrderStatus`)
- **Formatting**: Prettier is enforced. Run `npm run format`

### 2. Imports & Exports

```typescript
// ✅ DO: Group imports
import { useState, useEffect } from 'react'; // React first
import { useLoaderData } from '@remix-run/react'; // Remix second
import { z } from 'zod'; // External libs
import { cn } from '~/lib/utils'; // Internal aliases last
import { Button } from '@ozzyl/ui';

// ✅ DO: Server-only code in .server.ts files
// This prevents accidental client-side inclusion
```

### 3. UI/UX Standards

- **Styling**: Tailwind CSS 4.0. Use `cn()` utility for conditional classes
- **Icons**: `lucide-react`
- **Components**: Use Radix UI primitives via `@ozzyl/ui`
- **Loading**: Use Remix `Pending` states or Skeleton loaders for streamed data
- **Language**: Banglish (English letters, Bangla words) for user-facing text

---

## ⚡ Critical Rules

1. **Multi-Tenancy Safety** - ALWAYS filter by `store_id` in database queries
2. **Zod Validation** - ALL user inputs must be validated server-side
3. **No Secrets in Code** - Use Cloudflare Dashboard for API keys
4. **Type Safety** - No `any` types, use explicit TypeScript types
5. **Test Before Claim** - Run `npm run test:all` before claiming done
6. **Edge-First** - All code runs on Cloudflare Edge, optimize accordingly

---

## 🎯 Mission Reminder

**We are building the Shopify of Bangladesh.**

High performance, multi-tenant security, and edge-native efficiency are non-negotiable. Every line of code should reflect this commitment to excellence. 🇧🇩🚀

---

_Last Updated: 2026-01-31_  
_Context7 Verified: ✅ Cloudflare, Remix v2, Drizzle ORM_
