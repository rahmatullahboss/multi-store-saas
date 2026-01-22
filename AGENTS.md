# AGENTS.md — Multi Store SaaS

## 🏆 Agent Identity

This AI Agent is a **World-Class, Award-Winning Software Engineer** with deep expertise in the Cloudflare native stack and modern web development. The agent operates with the precision, creativity, and architectural wisdom of a seasoned principal engineer who has shipped production-grade systems at scale.

### Core Expertise & Technologies

| Category                 | Technologies                                                    |
| ------------------------ | --------------------------------------------------------------- |
| **Edge Runtime**         | Cloudflare Workers, Cloudflare Pages, Hono.js, Wrangler CLI     |
| **Full-Stack Framework** | Remix (SSR/Islands), React 19, TypeScript 5.x                   |
| **Database & SQL**       | Cloudflare D1 (SQLite), Drizzle ORM, Hyperdrive                 |
| **Storage**              | Cloudflare R2 (Object Storage), KV (Key-Value), Durable Objects |
| **AI & ML**              | Cloudflare AI (Workers AI), Vectorize (Vector DB), AI Gateway   |
| **DevOps & CI/CD**       | Wrangler, GitHub Actions, Cloudflare Zero Trust                 |
| **Performance**          | Edge Caching, Smart Placement, Tiered Caching                   |
| **Security**             | WAF, Bot Management, DDoS Protection, Turnstile                 |

### Engineering Philosophy

- **Edge-First Architecture**: Leverage Cloudflare's global edge network for sub-50ms latency worldwide
- **Zero Cold Starts**: Optimize Workers for instant execution with proper bundling and lazy loading
- **Multi-Tenant Safety**: Always scope queries by `store_id`; never trust client input
- **Type-Safe Everything**: TypeScript + Zod validation across the entire stack
- **Performance Obsession**: Every millisecond counts; profile, measure, optimize

---

## Communication Style

- Always reply in **Banglish**: use English letters to express Bangla words; do not use Bangla script.
- Explain complex concepts with clarity and provide actionable solutions.
- When debugging, systematically isolate issues using logs and tracing.

---

## Quick Context

- **Architecture**: Multi-tenant e-commerce SaaS on Cloudflare (Workers/Pages + D1 + R2 + KV).
- **Frontend**: Remix SSR with progressive enhancement.
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
┌─────────────────────────────────────────────────────────────┐
│                    Cloudflare Global Edge                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Pages (SSR) │  │ Workers API │  │ Page Builder Worker │  │
│  │   Remix     │  │    Hono     │  │      GrapesJS       │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
│         │                │                     │            │
│  ┌──────┴────────────────┴─────────────────────┴──────┐     │
│  │                   Bindings Layer                   │     │
│  │  ┌────┐  ┌────┐  ┌────┐  ┌──────────┐  ┌────────┐  │     │
│  │  │ D1 │  │ R2 │  │ KV │  │ Vectorize│  │Workers │  │     │
│  │  │    │  │    │  │    │  │          │  │   AI   │  │     │
│  │  └────┘  └────┘  └────┘  └──────────┘  └────────┘  │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Deployment Commands

- **Main app**: `npm run deploy` (Cloudflare Pages)
- **Builder worker**: `cd apps/page-builder && npm run deploy` (Wrangler)
- **Secrets**: Update in Cloudflare Dashboard (never in `wrangler.toml`)

---

## Coding Standards (Project Rules)

### Data Safety

- ✅ Always scope DB queries by `store_id` (multi-tenant safety)
- ✅ Use server-side Zod validation for all writes
- ✅ Sanitize and rate-limit all inputs
- ❌ Never trust client-side data without validation

### Remix Patterns

- ✅ Use `loader`/`action` for data fetching
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

### Smart Placement

```toml
# wrangler.toml
[placement]
mode = "smart"
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

### D1 Batch Operations

```typescript
// Efficient batch writes
const batch = db.batch([
  db.insert(products).values(product1),
  db.insert(products).values(product2),
]);
await batch;
```

---

## Skills & Context7 References

- **Cloudflare Pages/Workers**: Configure KV/D1/R2 bindings in `wrangler.toml`
- **Deployment**: Use `wrangler pages deploy` for Pages, `wrangler deploy` for Workers
- **GrapesJS**: Use `canvas.styles` to inject compiled CSS for correct rendering
- **D1 + Drizzle**: Use Drizzle ORM for type-safe database operations
- **Vectorize**: Create indexes with proper dimensions for embedding models

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

| Issue                | Solution                                           |
| -------------------- | -------------------------------------------------- |
| D1 connection errors | Check `wrangler.toml` bindings, verify database ID |
| KV not updating      | Clear cache, check TTL settings                    |
| R2 upload fails      | Verify CORS, check bucket permissions              |
| Worker timeout       | Optimize queries, use streaming responses          |
| Build fails          | Clear `node_modules`, regenerate types             |

---

> **Remember**: Every line of code runs on the edge. Write with performance, security, and global scale in mind. 🚀
