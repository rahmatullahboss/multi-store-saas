# AGENTS.md — Multi Store SaaS

## � Mission Statement

> **Build the Shopify of Bangladesh** — A world-class, multi-tenant e-commerce SaaS platform that empowers millions of merchants to sell online with zero technical knowledge, just like Shopify revolutionized e-commerce globally.

This AI Agent is a **World-Class, Award-Winning Software Engineer** with deep expertise in the Cloudflare native stack and modern web development. The agent operates with the precision, creativity, and architectural wisdom of a seasoned principal engineer who has shipped production-grade systems at scale.

### 🏆 Our Vision: Shopify-Level Excellence

| Shopify Standard          | Our Implementation                                  |
| ------------------------- | --------------------------------------------------- |
| **99.99% Uptime**         | Cloudflare's global edge network (300+ cities)      |
| **Sub-100ms TTFB**        | Edge-first architecture with D1 + KV caching        |
| **Infinite Scale**        | Workers auto-scale, D1 read replicas worldwide      |
| **No-Code Store Builder** | GrapesJS visual page builder                        |
| **Merchant Dashboard**    | Full-featured Remix SSR dashboard                   |
| **Payment Processing**    | bKash, Nagad, Stripe integrations                   |
| **AI-Powered Features**   | Workers AI + Vectorize for search & recommendations |

---

## 🛠️ Core Expertise & Technologies (Context7 Verified Latest)

| Category                 | Technologies                         | Latest Features (2025)                                           |
| ------------------------ | ------------------------------------ | ---------------------------------------------------------------- |
| **Edge Runtime**         | Cloudflare Workers, Cloudflare Pages | Smart Placement, Observability, `compatibility_date: 2025-04-14` |
| **Full-Stack Framework** | Remix SSR, React 19, TypeScript 5.x  | `defer()` streaming, `createPagesFunctionHandler`                |
| **Database**             | Cloudflare D1 (SQLite)               | **Sessions API**, Read Replication, Time Travel, Bookmarks       |
| **ORM**                  | Drizzle ORM                          | Type-safe migrations, batch operations                           |
| **Object Storage**       | Cloudflare R2                        | Direct uploads, signed URLs, CORS                                |
| **Key-Value**            | Cloudflare KV                        | Global replication, TTL caching                                  |
| **Vector Database**      | Cloudflare Vectorize                 | Semantic search, AI embeddings                                   |
| **AI/ML**                | Workers AI, AI Gateway               | Llama 3.1, embedding models, rate limiting                       |
| **API Framework**        | Hono.js                              | Edge-native, middleware, OpenAPI                                 |
| **Security**             | WAF, Turnstile, Zero Trust           | Bot protection, DDoS mitigation                                  |

---

## 🆕 Latest Cloudflare Features (Context7 Verified)

### D1 Sessions API (Read Replication)

```typescript
// Sequential consistency with read replicas
const bookmark = request.headers.get('x-d1-bookmark') ?? 'first-primary';
const session = env.DB.withSession(bookmark);

const result = await session
  .prepare(`SELECT * FROM products WHERE store_id = ?`)
  .bind(storeId)
  .run();

// Pass bookmark for next request
response.headers.set('x-d1-bookmark', session.getBookmark() ?? '');
```

### Workers AI with AI Gateway

```typescript
// AI Gateway for rate limiting and observability
const response = await env.AI.gateway('my-gateway').run({
  provider: 'workers-ai',
  endpoint: '@cf/meta/llama-3.1-8b-instruct',
  query: { prompt: 'Generate product description for: ' + productName },
});
```

### Remix Streaming with defer()

```typescript
import { defer } from '@remix-run/cloudflare';

export async function loader({ params }: LoaderFunctionArgs) {
  // Critical data - await immediately
  const product = await db.getProduct(params.productId);

  // Non-critical - stream later
  const reviewsPromise = db.getReviews(params.productId);

  return defer({
    product,
    reviews: reviewsPromise, // Streamed!
  });
}
```

### Modern wrangler.toml Configuration

```toml
"$schema" = "node_modules/wrangler/config-schema.json"
name = "multi-store-saas"
main = "src/index.ts"
compatibility_date = "2025-04-14"

[observability]
enabled = true
head_sampling_rate = 1

[ai]
binding = "AI"

[[d1_databases]]
binding = "DB"
database_name = "multi-store-prod"
database_id = "your-database-id"

[[r2_buckets]]
bucket_name = "store-assets"
binding = "R2"

[[kv_namespaces]]
binding = "KV"
id = "your-kv-id"

[[vectorize]]
binding = "VECTORIZE"
index_name = "product-embeddings"
```

---

## Communication Style

- Always reply in **Banglish**: use English letters to express Bangla words; do not use Bangla script.
- Explain complex concepts with clarity and provide actionable solutions.
- When debugging, systematically isolate issues using logs and tracing.

---

## Quick Context

- **Architecture**: Multi-tenant e-commerce SaaS on Cloudflare (Workers/Pages + D1 + R2 + KV).
- **Frontend**: Remix SSR with progressive enhancement and streaming.
- **Backend**: Hono.js API routes with edge-native bindings.
- **Page Builder**: Separate GrapesJS worker at `apps/page-builder`.

---

## Setup & Dev Commands (Main App)

```bash
npm install
npm run dev               # Remix dev server
npm run dev:wrangler      # Cloudflare Pages dev with full bindings
npm run build             # Production build
npm run deploy            # Pages deploy (main app)
```

## Setup & Dev Commands (Page Builder Worker)

```bash
cd apps/page-builder
npm install
npm run dev               # Remix dev
npm run start             # Wrangler dev (Worker)
npm run deploy            # Manual deploy (builder worker)
```

---

## Environment Variables (Critical)

Copy `.env.example` to `.env` for local dev and mirror secrets in Cloudflare Dashboard for prod.

### Required Variables

| Variable                 | Purpose                                            |
| ------------------------ | -------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare account identifier                      |
| `CLOUDFLARE_DATABASE_ID` | D1 database ID                                     |
| `CLOUDFLARE_API_TOKEN`   | API authentication                                 |
| `CLOUDFLARE_ZONE_ID`     | Domain zone configuration                          |
| `SESSION_SECRET`         | Auth session encryption (match across all workers) |
| `RESEND_API_KEY`         | Transactional email                                |
| `OPENROUTER_API_KEY`     | AI/LLM features                                    |
| `APP_URL`                | Base URL (local/prod)                              |

### Payment Gateways (as needed)

- `BKASH_*` — bKash integration
- `NAGAD_*` — Nagad integration
- `STRIPE_*` — Stripe integration

---

## Database & Storage

### D1 (SQLite at the Edge)

```bash
npm run db:migrate:local   # Local migrations
npm run db:migrate:prod    # Production migrations
```

### D1 Sessions API (Read Replication)

```typescript
// Use sessions for read-after-write consistency
const session = env.DB.withSession('first-primary');
const result = await session.prepare(`SELECT * FROM stores`).run();
const bookmark = session.getBookmark(); // Store for next request
```

### R2 (Object Storage)

- Used for product images, builder assets, and media
- Configure CORS for direct uploads
- Use signed URLs for secure access

### KV (Key-Value Store)

- Cache hot data (store configs, published pages)
- Invalidate on publish events
- TTL strategy: short for dynamic, long for static

### Vectorize (Vector Database)

- Semantic search for products
- AI-powered recommendations
- Embedding storage with metadata filtering

---

## Testing Strategy

```bash
npm run test              # Unit tests
npm run e2e               # End-to-end tests
npm run test:all          # Full test suite
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Edge (300+ Cities)             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐          │
│  │ Pages (SSR) │  │ Workers API │  │ Page Builder Worker │          │
│  │   Remix     │  │    Hono     │  │      GrapesJS       │          │
│  │  Streaming  │  │  REST/RPC   │  │   Visual Editor     │          │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘          │
│         │                │                     │                    │
│  ┌──────┴────────────────┴─────────────────────┴──────────────┐     │
│  │                   Edge Bindings Layer                      │     │
│  │  ┌────┐  ┌────┐  ┌────┐  ┌──────────┐  ┌────────┐ ┌──────┐ │     │
│  │  │ D1 │  │ R2 │  │ KV │  │ Vectorize│  │Workers │ │  AI  │ │     │
│  │  │Read│  │    │  │    │  │          │  │   AI   │ │Gateway│ │     │
│  │  │Repl│  │    │  │    │  │          │  │        │ │      │ │     │
│  │  └────┘  └────┘  └────┘  └──────────┘  └────────┘ └──────┘ │     │
│  └────────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

### Deployment Commands

- **Main app**: `npm run deploy` (Cloudflare Pages)
- **Builder worker**: `cd apps/page-builder && npm run deploy` (Wrangler)
- **Secrets**: Update in Cloudflare Dashboard (never in `wrangler.toml`)

---

## Coding Standards (Project Rules)

### Data Safety

- ✅ Always scope DB queries by `store_id` (multi-tenant safety)
- ✅ Use D1 Sessions API for read-after-write consistency
- ✅ Use server-side Zod validation for all writes
- ✅ Sanitize and rate-limit all inputs
- ❌ Never trust client-side data without validation

### Remix Patterns

- ✅ Use `loader`/`action` for data fetching
- ✅ Use `defer()` for streaming non-critical data
- ✅ Use `<Form>` or `useFetcher` for mutations
- ❌ Avoid `useEffect` for page data loading

### UI/UX Standards

- ✅ Tailwind CSS for styling
- ✅ `lucide-react` for icons
- ✅ `<OptimizedImage />` for images (Cloudinary integration)
- ❌ Avoid raw `<img>` tags

### Quality Assurance

- ✅ Add regression tests for bug fixes
- ✅ Document breaking changes
- ✅ Use TypeScript strict mode

---

## Builder Architecture Rules

- Pages and templates share the unified section registry
- Published pages must read published JSON only (not draft)
- Invalidate KV cache immediately on publish
- Canvas styles: inject compiled CSS via `canvas.styles`

---

## Advanced Cloudflare Patterns

### Smart Placement & Observability

```toml
# wrangler.toml
[placement]
mode = "smart"

[observability]
enabled = true
head_sampling_rate = 1
```

### Tiered Caching

```typescript
// Edge caching with stale-while-revalidate
const response = await fetch(request, {
  cf: {
    cacheTtlByStatus: { '200-299': 3600, 404: 1, '500-599': 0 },
    cacheEverything: true,
  },
});
```

### Durable Objects (Order Processing)

```typescript
// Enqueue order tasks for background processing
import { enqueueOrderTasks } from '~/services/order-processor.server';

await enqueueOrderTasks(env, orderId, storeId, [
  { type: 'email', payload: { to, subject, html } },
  { type: 'webhook', payload: { url, payload, secret } },
  { type: 'inventory', payload: { productId, quantity } },
]);
```

**Architecture:**
- Separate worker: `apps/web/workers/order-processor/`
- SQLite backend (FREE plan compatible)
- Per-store isolation via DO naming
- Exponential backoff retries

**See:** `docs/DURABLE_OBJECTS_GUIDE.md` for full documentation.

### D1 Batch Operations

```typescript
// Efficient batch writes
const batch = db.batch([
  db.insert(products).values(product1),
  db.insert(products).values(product2),
]);
await batch;
```

### Cloudflare Pages Handler

```typescript
import { createPagesFunctionHandler } from '@remix-run/cloudflare-pages';
import * as build from '../build/server';
import { getLoadContext } from '../load-context';

export const onRequest = createPagesFunctionHandler({
  build,
  getLoadContext,
});
```

---

## Skills & Context7 References

- **Cloudflare Pages/Workers**: Configure KV/D1/R2 bindings in `wrangler.toml`
- **D1 Sessions API**: Use `withSession()` for read replica consistency
- **Deployment**: Use `wrangler pages deploy` for Pages, `wrangler deploy` for Workers
- **GrapesJS**: Use `canvas.styles` to inject compiled CSS for correct rendering
- **Vectorize**: Create indexes with proper dimensions for embedding models
- **AI Gateway**: Use `env.AI.gateway()` for rate limiting and observability

---

## Configuration Files Reference

| Purpose         | Path                              |
| --------------- | --------------------------------- |
| Main app config | `wrangler.toml`                   |
| Main app deps   | `package.json`                    |
| Builder config  | `apps/page-builder/wrangler.toml` |
| Builder deps    | `apps/page-builder/package.json`  |
| Project rules   | `.agent/rules/PROJECT_RULES.md`   |
| DB schema       | `src/db/schema/`                  |
| API routes      | `src/api/`                        |

---

## Troubleshooting Guide

| Issue                 | Solution                                           |
| --------------------- | -------------------------------------------------- |
| D1 connection errors  | Check `wrangler.toml` bindings, verify database ID |
| D1 read inconsistency | Use Sessions API with `first-primary` bookmark     |
| KV not updating       | Clear cache, check TTL settings                    |
| R2 upload fails       | Verify CORS, check bucket permissions              |
| Worker timeout        | Optimize queries, use streaming responses          |
| Build fails           | Clear `node_modules`, regenerate types             |
| AI Gateway errors     | Check rate limits, verify model availability       |

---

## 🚀 Shopify-Level Goals Checklist

- [x] Multi-tenant architecture (store isolation)
- [x] Edge-first deployment (global CDN)
- [x] Visual page builder (GrapesJS)
- [x] SSR with streaming (Remix + defer)
- [x] Real-time inventory management
- [ ] AI-powered product recommendations
- [ ] Automated marketing campaigns
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Marketplace integration

---

> **Remember**: We're building the **Shopify of Bangladesh**. Every line of code runs on the edge. Write with performance, security, and Shopify-level scale in mind. Our merchants deserve world-class technology. 🇧🇩🚀
