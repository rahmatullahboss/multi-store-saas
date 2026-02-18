# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository (Ozzyl - Multi-tenant SaaS).

## 🧠 Core Thinking Process (REQUIRED)

When asked to implement complex logic, refactor code, or debug issues, adopt this thinking process:

1.  **Analyze**: Understand the goal. Read relevant files first. Don't guess.
2.  **Plan**: Break down the task. If it's complex, use `Think step-by-step` or `Plan before executing` in your reasoning.
3.  **Context**: Check if a similar pattern exists in the codebase (e.g., how other services handle D1 queries).
4.  **Execute**: Write the code.
5.  **Verify**: Explain how you verified the change (tests, logs, or manual check).

**"Thinking" Keywords to use in prompts:**

- "Think step-by-step" -> Forces a detailed breakdown.
- "Analyze root cause" -> For debugging.
- "Verify assumptions" -> When dealing with unverified inputs.

## 📦 Project Overview

**Ozzyl** is a Multi-tenant SaaS e-commerce platform built on Cloudflare Workers with Remix.

- **Runtime**: Cloudflare Workers (Edge)
- **Frontend**: Remix (React 18) + Tailwind CSS v4 + Vite
- **Backend**: Hono.js (API) + Cloudflare D1 (SQLite) + R2 (Storage) + KV (Cache)
- **Language**: TypeScript (Strict Mode: `"strict": true`)
- **Testing**: Vitest + Playwright
- **Auth**: remix-auth with remix-auth-google

## 🛠 Coding Standards & Best Practices

### 1. TypeScript & General

- **Strict Mode**: `"strict": true` is enabled. No `any`. Use `unknown` with validation if needed.
- **Explicit Types**: Return types for all functions. Explicitly type arguments.
- **Immutability**: Prefer `const`.
- **Early Returns**: Reduce nesting by returning early on errors/edge cases.

### 2. Hono.js (API Layer)

- **Validation**: use `@hono/zod-validator` for all inputs. Define schemas in `src/schemas/`.
  ```typescript
  import { zValidator } from "@hono/zod-validator";
  app.post("/api/resource", zValidator("json", schema), async (c) => { ... });
  ```
- **Errors**: Throw `HTTPException`.
  ```typescript
  import { HTTPException } from 'hono/http-exception';
  if (!found) throw new HTTPException(404, { message: 'Not found' });
  ```
- **Context**: Typed Hono context via `Context<{ Bindings: Env }>` .

### 3. Cloudflare D1 (Database)

- **Parameterized Queries**: NEVER concatenate strings. Use `.bind()`.
  ```typescript
  // ✅ Correct
  await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
  // ❌ WRONG
  await c.env.DB.prepare(`SELECT * FROM users WHERE id = ${userId}`).first();
  ```
- **Batching**: Use `db.batch([])` for multiple writes to reduce round-trips.
- **Scoping**: **CRITICAL** - All queries must filter by `store_id` (except super-admin).

### 4. Remix (Frontend)

- **Data Loading**: Use `loader` for READs.
- **Mutations**: Use `action` for WRITEs.
- **State**: URL Search Params > Local State (`useState`).
- **Styles**: Tailwind CSS v4 utilities. Use `@tailwindcss/vite` plugin.
- **i18n**: Uses i18next with `remix-i18next`. Extract with `npm run i18n:extract`.

### 5. Cloudflare Workers (Background Jobs)

The web app has multiple Workers in `apps/web/workers/`:

- `order-processor/` - Order processing
- `cart-processor/` - Cart operations
- `checkout-lock/` - Checkout locking
- `rate-limiter/` - Rate limiting
- `store-config/` - Store configuration
- `editor-state/` - Editor state management
- `pdf-generator/` - PDF generation
- `webhook-dispatcher/` - Webhook dispatch
- `subdomain-proxy/` - Subdomain proxy
- `subscription-cron/` - Subscription cron jobs
- `courier-cron/` - Courier cron jobs

Each Worker has its own `tsconfig.json` and can be deployed independently.

## 📂 Monorepo Structure

```
ozzyl-monorepo/
├── apps/
│   ├── web/           # Main e-commerce app (Remix + Hono + Cloudflare)
│   ├── landing/       # Marketing site (Vercel)
│   ├── ai-builder/   # AI Gen features
│   ├── builder/      # Store builder
│   └── page-builder/ # Page builder
├── packages/
│   ├── database/     # Drizzle ORM schema & migrations
│   ├── ui/           # Shared React components (shadcn/ui based)
│   └── video-engine/ # Video processing
```

## ⚡ Common Commands

### Monorepo (Turbo)

- `npm install` - Install Deps
- `npm run turbo:dev` - Start Dev Server
- `npm run turbo:build` - Build All
- `npm run turbo:lint` - Lint All
- `npm run turbo:typecheck` - TypeCheck All
- `npm run turbo:test` - Run Tests

### Apps/Web (`cd apps/web`)

- `npm run dev` - Remix dev (basic)
- `npm run dev:wrangler` - Dev with Cloudflare environment (use this for full testing)
- `npm run build` - Build for production
- `npm run typecheck` - Type check
- `npm run lint` / `npm run lint:fix` - Lint with ESLint

### Database

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:bootstrap:local` - Run all SQL migrations locally (initial + seed + hybrid)
- `npm run db:bootstrap:prod` - Run all SQL migrations on prod
- `npm run db:migrate:local` - Apply pending migrations locally
- `npm run db:migrate:prod` - Apply pending migrations to prod
- `npm run db:studio` - Open Drizzle Studio

### Deploy

- `npm run deploy:prod` - Deploy to Cloudflare production
- `npm run deploy:staging` - Deploy to Cloudflare staging

### Testing

- `npm run test` - Run Vitest unit tests
- `npm run e2e` - Run Playwright e2e tests
- `npm run e2e:smoke` - Run smoke tests (chromium only)
- `npm run ci:local` - Run lint + typecheck + tests + e2e

## 🚨 Critical Rules (DO NOT BREAK)

1.  **Secrets**: Never commit secrets. Use `wrangler secret put`.
2.  **Migrations**: Always use migration files. No manual DB changes in prod.
3.  **Local Test**: Test with `npm run dev:wrangler` (local D1) before deploying.
4.  **Store Isolation**: Verify `store_id` is present in every DB query.
5.  **Context7**: If docs are missing, use `context7` tool to fetch latest docs.
6.  **Route Ownership**: Keep `*.ozzyl.com/*` route owned by main app worker only. Do not duplicate wildcard routes in proxy worker configs.
7.  **Post-Deploy Health**: After every production deploy, run token-protected health check (`/api/healthz`) before declaring success.

## 🩺 Health Monitoring (Production Standard)

- Monitoring endpoint: `GET /api/healthz`
- Auth: `x-health-token` (or bearer/query fallback)
- Secret: `HEALTH_CHECK_TOKEN` (must be set in both `production` and `staging`)

Set secret:

```bash
cd apps/web
openssl rand -hex 24 | npx wrangler secret put HEALTH_CHECK_TOKEN --env production
openssl rand -hex 24 | npx wrangler secret put HEALTH_CHECK_TOKEN --env staging
```

Post-deploy verification:

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas
HEALTH_CHECK_TOKEN='<token>' \
MAIN_APP_URL='https://app.ozzyl.com' \
MAIN_APP_FALLBACK_URL='https://multi-store-saas.rahmatullahzisan.workers.dev' \
bash apps/web/workers/health-check.sh --main
```

Reference:

- `docs/HEALTH_MONITORING_RUNBOOK_2026-02-17.md`

## 🤖 Slash Commands & Tips

- `/help` - See available commands.
- `/clear` - clear context (do this often to save tokens).
- `git status` / `git diff` - Check your changes before asking for more.
- **Guide**: See `.agent/skills/Claude Code Guide/SKILL.md` for advanced config.

## 🔌 MCP Servers (Recommended)

Add these MCP servers to enhance Claude Code's capabilities:

```bash
# Context7 - Up-to-date library documentation
claude mcp add --transport stdio context7 -- npx -y @upstash/context7-mcp

# Sequential Thinking - Structured problem solving
claude mcp add --transport stdio sequential-thinking -- npx -y @gotza02/seq-thinking

# Filesystem - Enhanced file operations
claude mcp add --transport stdio filesystem -- npx -y @modelcontextprotocol/server-filesystem ~/

# Verify setup
claude mcp list
```

## 👥 Subagents

Invoking specialized agents:

- `@database-architect` - For D1, Drizzle, and Schema design.
- `@frontend-specialist` - For React, Remix, and Tailwind.
- `@qa-engineer` - For Vitest, Playwright, and Test Strategy.
