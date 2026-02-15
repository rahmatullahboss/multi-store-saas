# Ozzyl Multi-Store SaaS - Agent Configuration

> **Project**: Ozzyl (Multi-Store E-commerce SaaS)  
> **Stack**: Remix + Hono + D1 + KV + Vectorize + R2 + Workers AI (Cloudflare Native)  
> **Domain**: E-commerce SaaS (Shopify of Bangladesh)  
> **Last Updated**: 2026-01-24  
> **Docs Verified**: ✅ Context7 MCP (Cloudflare, Remix v2, Hono, Drizzle ORM)

---

## 🚀 Quick Start for Agents

### Before Starting Any Task

1. **Read this file** for project context
2. **Check relevant workflow** in `.agent/workflows/`
3. **Check relevant skill** in `.agent/skills/ozzyl/`
4. **Run tests** before and after changes

### 🤖 Default Working Mode: MANUS

**Always use Manus Mode for complex tasks.**

```
Activation: Read planning files first
Files Used: task_plan.md, findings.md, progress.md
```

#### Manus Mode Rules:

1. **Before any action** → Update `task_plan.md` if needed
2. **After every 2-3 tool calls** → Update `progress.md`
3. **New discovery?** → Update `findings.md` immediately
4. **Continue until** → Current phase marked `[x]` in `task_plan.md`

### Key Workflows

| Workflow       | File                        | Use Case                    |
| -------------- | --------------------------- | --------------------------- |
| **Manus Mode** | Planning files              | 🌟 Autonomous planning      |
| Add Feature    | `workflows/add-feature.md`  | Implement new functionality |
| Fix Tests      | `workflows/fix-tests.md`    | Systematic test fixing      |
| Debug API      | `workflows/debug-api.md`    | Troubleshoot API issues     |
| Review         | `workflows/review.md`       | Code review                 |
| Deploy         | `workflows/deploy.md`       | Production deployment       |
| D1 Migration   | `workflows/d1-migration.md` | Database migrations         |
| Context7       | `workflows/cotext7.md`      | 🧠 Doc & Skill Management   |
| Consult        | `workflows/consult.md`      | 🙋 Ask Expert Subagents     |

### Key Skills (115 Installed via Context7)

| Category         | Skill                   | Path                                             | Use Case                        |
| ---------------- | ----------------------- | ------------------------------------------------ | ------------------------------- |
| **Domain**       | Ozzyl                   | `.agent/skills/ozzyl/SKILL.md`                   | E-commerce domain knowledge     |
| **Frontend**     | frontend-design         | `.agent/skills/frontend-design/SKILL.md`         | Production-grade UI (Anthropic) |
|                  | frontend-dev-guidelines | `.agent/skills/frontend-dev-guidelines/SKILL.md` | React/TS best practices         |
|                  | react-patterns          | `.agent/skills/react-patterns/SKILL.md`          | React component patterns        |
|                  | tailwind-patterns       | `.agent/skills/tailwind-patterns/SKILL.md`       | Tailwind CSS patterns           |
|                  | ui-ux-pro-max           | `.agent/skills/ui-ux-pro-max/SKILL.md`           | 50+ styles, 21 palettes         |
| **TypeScript**   | typescript-expert       | `.agent/skills/typescript-expert/SKILL.md`       | Type-safe coding                |
| **Backend**      | api-patterns            | `.agent/skills/api-patterns/SKILL.md`            | REST/GraphQL patterns           |
|                  | nodejs-best-practices   | `.agent/skills/nodejs-best-practices/SKILL.md`   | Node.js patterns                |
| **Testing**      | testing-patterns        | `.agent/skills/testing-patterns/SKILL.md`        | Test strategies                 |
|                  | tdd-workflow            | `.agent/skills/tdd-workflow/SKILL.md`            | Test-driven development         |
|                  | playwright-skill        | `.agent/skills/playwright-skill/SKILL.md`        | E2E testing                     |
| **Architecture** | senior-architect        | `.agent/skills/senior-architect/SKILL.md`        | System design                   |
|                  | architecture            | `.agent/skills/architecture/SKILL.md`            | Architecture patterns           |
| **Debug**        | systematic-debugging    | `.agent/skills/systematic-debugging/SKILL.md`    | Root cause analysis             |
|                  | performance-profiling   | `.agent/skills/performance-profiling/SKILL.md`   | Performance optimization        |
| **E-commerce**   | stripe-integration      | `.agent/skills/stripe-integration/SKILL.md`      | Payment integration             |
|                  | seo-fundamentals        | `.agent/skills/seo-fundamentals/SKILL.md`        | SEO best practices              |
| **i18n**         | i18n-localization       | `.agent/skills/i18n-localization/SKILL.md`       | Multi-language support          |
| **Planning**     | writing-plans           | `.agent/skills/writing-plans/SKILL.md`           | Task planning                   |

> 📦 **115 skills installed** via `npx ctx7 skills install --antigravity`
> List all: `npx ctx7 skills list --antigravity`

---

## 📂 Project Structure

```
ozzyl-monorepo/
├── apps/
│   ├── web/                    # Main Remix SSR app
│   │   ├── app/
│   │   │   ├── routes/         # Remix routes (200+ routes)
│   │   │   ├── components/     # React components
│   │   │   ├── services/       # Business logic
│   │   │   ├── lib/            # Utilities
│   │   │   └── hooks/          # React hooks
│   │   ├── server/
│   │   │   ├── api/            # Hono API routes
│   │   │   ├── middleware/     # Auth, rate limiting
│   │   │   └── services/       # Backend services
│   │   ├── e2e/                # Playwright E2E tests
│   │   └── tests/              # Vitest unit tests
│   └── page-builder/           # GrapesJS visual editor worker
├── packages/
│   ├── database/               # Drizzle ORM schemas & migrations
│   │   └── src/
│   │       ├── schema*.ts      # Table definitions
│   │       └── migrations/     # SQL migrations
│   ├── ui/                     # Shared UI components
│   └── video-engine/           # Remotion video generation
└── docs/                       # Documentation
```

---

## 🔧 Common Commands

| Command                    | Description                         |
| -------------------------- | ----------------------------------- |
| `npm run dev`              | Start Remix dev server              |
| `npm run dev:wrangler`     | Start with full Cloudflare bindings |
| `npm run build`            | Build for production                |
| `npm run deploy`           | Deploy to Cloudflare Pages          |
| `npm run test`             | Run Vitest unit tests               |
| `npm run test:watch`       | Watch mode tests                    |
| `npm run e2e`              | Run Playwright E2E tests            |
| `npm run lint`             | ESLint check                        |
| `npm run typecheck`        | TypeScript type check               |
| `npm run test:all`         | Lint + Typecheck + Test             |
| `npm run db:migrate:local` | Apply D1 migrations locally         |
| `npm run db:migrate:prod`  | Apply D1 migrations to production   |

---

## ✅ Coding Standards

### TypeScript Best Practices

```typescript
// ✅ DO: Explicit types, Zod validation
import { z } from 'zod';

const ProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  storeId: z.string().uuid(),
});

// ✅ DO: Use loader/action patterns
export async function loader({ context, params }: LoaderFunctionArgs) {
  const { DB } = context.cloudflare.env;
  // Always scope by store_id for multi-tenancy
  return db.select().from(products).where(eq(products.storeId, storeId));
}

// ❌ DON'T: Use `any` types
// ❌ DON'T: Trust client data without validation
// ❌ DON'T: Query without store_id (breaks multi-tenancy)
```

### Error Handling

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
```

### Database Patterns (D1 + Drizzle) — Context7 Verified ✅

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

### React/Remix Patterns — Context7 Verified ✅

```typescript
// ✅ DO: Use Remix data patterns
export default function ProductPage() {
  const { product, reviews } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();

  return (
    <>
      <ProductDetails product={product} />

      {/* Streaming deferred data with Suspense */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <Await resolve={reviews}>
          {(reviews) => <Reviews reviews={reviews} />}
        </Await>
      </Suspense>

      <fetcher.Form method="post">
        {/* Form fields */}
      </fetcher.Form>
    </>
  );
}

// ✅ DO: Use defer() for streaming non-critical data
// Source: Remix v2 Streaming Guide
import { defer } from "@remix-run/cloudflare";
import { Await, useLoaderData } from "@remix-run/react";
import { Suspense } from "react";

export async function loader({ params }: LoaderFunctionArgs) {
  // 👇 Critical data - await immediately
  const product = await db.getProduct(params.id);

  // 👇 Non-critical data - pass promise directly (NOT awaited)
  const reviewsPromise = db.getReviews(params.id);

  return defer({
    product,
    reviews: reviewsPromise, // Streamed over the network!
  });
}

// ❌ DON'T: Use useEffect for data fetching
// ❌ DON'T: Use raw <img> tags (use OptimizedImage)
// ❌ DON'T: Await non-critical promises (blocks rendering)
```

---

## 🎯 Decision Trees

### "What workflow should I use?"

```
Is this a COMPLEX task (3+ steps)?
├── YES → Manus Mode + relevant sub-workflow
└── NO
    ├── New feature? → /add-feature
    ├── Tests failing? → /fix-tests
    ├── API bug? → /debug-api
    ├── DB change? → /d1-migration
    ├── Review needed? → /review
    └── Deploying? → /deploy
```

### "Which file should I edit?"

```
What are you changing?
├── New route → apps/web/app/routes/
├── API endpoint → apps/web/app/routes/api.*.ts or server/api/
├── Component → apps/web/app/components/
├── Database schema → packages/database/src/schema*.ts
├── Business logic → apps/web/app/services/ or server/services/
├── Page Builder → apps/page-builder/
└── Shared UI → packages/ui/src/
```

---

## ⚡ Critical Rules

1. **Multi-Tenancy Safety** - ALWAYS filter by `store_id` in database queries
2. **Zod Validation** - ALL user inputs must be validated server-side
3. **No Secrets in Code** - Use Cloudflare Dashboard for API keys
4. **Type Safety** - No `any` types, use explicit TypeScript types
5. **Test Before Claim** - Run `npm run test:all` before claiming done
6. **Edge-First** - All code runs on Cloudflare Edge, optimize accordingly

---

## 🔍 Auto-Review (MANDATORY After Every Task)

### Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

### Verification Commands

```bash
# Run in apps/web directory
cd apps/web
npm run lint
npm run typecheck
npm run test
npm run e2e  # For UI changes
```

### Self-Review Checklist

- [ ] Code follows project patterns (check existing similar code)
- [ ] Multi-tenancy: All queries scoped by `storeId`
- [ ] Error handling: Try/catch with proper responses
- [ ] Validation: Zod schemas for all inputs
- [ ] Types: No `any`, explicit return types
- [ ] Tests: Unit tests written and passing
- [ ] Security: No SQL injection, auth checks in place
- [ ] No `console.log` in production code (use proper logging)

---

## 🤖 Review Subagents

| Subagent        | File                                    | Purpose                        |
| --------------- | --------------------------------------- | ------------------------------ |
| Security        | `subagents/security-reviewer.md`        | Multi-tenancy, auth, injection |
| Code Quality    | `subagents/code-quality-reviewer.md`    | Types, patterns, DRY           |
| Spec Compliance | `subagents/spec-compliance-reviewer.md` | Requirements match             |
| Test            | `subagents/test-reviewer.md`            | Test coverage & quality        |
| E-commerce      | `subagents/ecommerce-reviewer.md`       | Domain-specific review         |
| **Database**    | `subagents/database-architect.md`       | D1, Schemas, Migrations        |
| **Frontend**    | `subagents/frontend-specialist.md`      | Remix, React, UI/UX            |
| **QA**          | `subagents/qa-engineer.md`              | Vitest, Playwright, Strategies |

---

## 🛒 E-commerce Domain Quick Reference

### Key Entities

| Entity     | Table         | Key Fields                             |
| ---------- | ------------- | -------------------------------------- |
| Store      | `stores`      | id, name, slug, domain, ownerId        |
| Product    | `products`    | id, storeId, name, price, inventory    |
| Order      | `orders`      | id, storeId, customerId, status, total |
| Customer   | `customers`   | id, storeId, email, name               |
| Collection | `collections` | id, storeId, name, products            |

### Order Status Flow

```
pending → confirmed → processing → shipped → delivered
                   └→ cancelled
```

### Price Handling

- All prices stored in **cents** (integer)
- Display: `(price / 100).toFixed(2)`
- Currency: BDT (Bangladeshi Taka) primarily

---

---

## 🔌 Hono + Cloudflare Bindings — Context7 Verified ✅

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

// D1 with Sessions API in Hono
app.get('/api/orders', async (c) => {
  const { DB } = c.env;
  const bookmark = c.req.header('x-d1-bookmark') ?? 'first-unconstrained';
  const session = DB.withSession(bookmark);

  const result = await session
    .prepare('SELECT * FROM orders WHERE store_id = ?')
    .bind(storeId)
    .run();

  c.header('x-d1-bookmark', session.getBookmark() ?? '');
  return c.json(result.results);
});
```

---

## 📚 Additional Resources

- **Main AGENTS.md**: `./AGENTS.md` (root level)
- **Project Rules**: `.agent/rules/PROJECT_RULES.md`
- **API Reference**: `docs/API_REFERENCE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Cloudflare Setup**: `docs/CLOUDFLARE_SAAS_SETUP.md`

---

## 🔗 Context7 Library References

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

---

## 📦 Context7 Skills Management

```bash
# List all installed skills
npx ctx7 skills list --antigravity

# Search for skills
npx ctx7 skills search <keyword>

# Install a skill from antigravity-awesome-skills (223 available)
npx ctx7 skills install /sickn33/antigravity-awesome-skills <skill-name> --antigravity

# Install Anthropic official skills
npx ctx7 skills install /anthropics/skills <skill-name> --antigravity

# View skill info
npx ctx7 skills info /sickn33/antigravity-awesome-skills

# Remove a skill
npx ctx7 skills remove <skill-name> --antigravity
```

### Key Skill Repositories:

| Repository                              | Skills   | Best For                       |
| --------------------------------------- | -------- | ------------------------------ |
| `/anthropics/skills`                    | Official | frontend-design, web-artifacts |
| `/sickn33/antigravity-awesome-skills`   | 223      | Full-stack, testing, security  |
| `/nextlevelbuilder/ui-ux-pro-max-skill` | 1        | UI/UX design systems           |
