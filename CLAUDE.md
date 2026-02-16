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
- **Frontend**: Remix (React 18) + Tailwind CSS
- **Backend**: Hono.js (API) + Cloudflare D1 (SQLite) + R2 (Storage) + KV (Cache)
- **Language**: TypeScript (Strict Mode)

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
- **Styles**: Tailwind CSS utilities. Avoid custom CSS files unless absolutely necessary.

## 📂 Monorepo Structure

```
ozzyl-monorepo/
├── apps/
│   ├── web/           # Main e-commerce app (Remix + Hono + Cloudflare)
│   ├── landing/       # Marketing site
│   └── ai-builder/    # AI Gen features
├── packages/
│   ├── database/      # Drizzle ORM schema & migrations
│   ├── ui/            # Shared React components (shadcn/ui based)
│   └── video-engine/  # Video processing
```

## ⚡ Common Commands

### Monorepo (Turbo)

- `npm install` - Install Deps
- `npm run turbo:dev` - Start Dev Server
- `npm run turbo:build` - Build All
- `npm run turbo:test` - Run Tests

### Apps/Web (`cd apps/web`)

- `npm run dev:wrangler` - Dev with Cloudflare environment
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate:local` - Apply migrations locally
- `npm run deploy:prod` - Deploy to Cloudflare

## 🚨 Critical Rules (DO NOT BREAK)

1.  **Secrets**: Never commit secrets. Use `wrangler secret put`.
2.  **Migrations**: Always use migration files. No manual DB changes in prod.
3.  **Local Test**: Test with `npm run dev:wrangler` (local D1) before deploying.
4.  **Store Isolation**: Verify `store_id` is present in every DB query.
5.  **Context7**: If docs are missing, use `context7` tool to fetch latest docs.

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
