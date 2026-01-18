---
name: Platform Engine (Full Stack SaaS)
description: Expert skill for managing multi-tenant SaaS architecture, builder engine, D1/Drizzle persistence, commerce logic, and Remix patterns.
---

# Platform Engine Skill

This skill encompasses the core architecture and features of the Multi Store SaaS platform, covering 20 key capabilities across System, Data, Commerce, Frontend, Infrastructure, and Quality.

## 1) System & Architecture

### Multi-tenant Request Resolution

- **Capability**: Resolve `shop_id` from hostname, subdomain, or custom domain.
- **Implementation**: Maintain a resolution pipeline using KV cache with D1 fallback.
- **Constraint**: **ENFORCE `shop_id` scoping in ALL queries.** No query without a `shop_id` filter.

### Capability-based Storefront Gating

- **Capability**: Implement routing based on `store_enabled` and `home_entry` (Store Home vs. Landing Page Home).
- **Constraint**: Capabilities are not mutually exclusive. **Server-side gating is mandatory** (do not just hide UI elements).

### Unified Builder Engine

- **Capability**: Single engine for Pages and Templates.
  - Pages: `page_sections_*`
  - Templates: `template_sections_*`
- **Constraint**: Maintain unified intent patterns for adding, reordering, toggling, and updating props.
- **Rule**: Public access must only read from **published** tables. Drafts are never served publicly.

## 2) Data & Persistence

### D1 Schema & Migrations

- **Capability**: Design SQLite/D1 schemas with appropriate indexes and constraints.
- **Constraint**: **No manual DB changes.** All changes must go through Wrangler migrations. Enforce unique constraints (e.g., `handle`, `sort_order`).

### Reorder Correctness

- **Capability**: Ensure deterministic reordering of sections/templates (`orderedIds` → `sort_order`).
- **Constraint**: Use **batch update strategies** to avoid `UNIQUE(sort_order)` conflicts. Implement optimistic locking or versioning for concurrency.

### Draft/Published Pipeline

- **Capability**: Atomic-ish publish action: overwrite published snapshot from draft (sections + theme settings).
- **Constraint**: Invalidate/refresh KV cache immediately after publish. Published snapshots must remain stable under concurrent edits.

### JSON Props & Validation

- **Capability**: Safe parse/stringify of `props_json`.
- **Constraint**: **Mandatory server-side validation** using Zod schemas before saving. Never trust client-provided props.

## 3) Commerce (Bangladesh-Ready)

### Money & Pricing Correctness

- **Capability**: Handle prices as **integer cents/paisa**. Implement a robust pricing service (subtotal, discount, shipping, tax, total).
- **Constraint**: **No float values for money.** Store snapshots of price and title in cart/order line items.

### Checkout & Order State Machine

- **Capability**: Implement idempotent `checkout_session` → `order` creation flows.
- **Constraint**: Utilize `idempotency_key`. Maintain basic inventory reserve/release logic.

### Payment Provider Abstraction

- **Capability**: Support COD, Stripe, SSLCommerz, and bKash through a consistent provider interface.
- **Constraint**: Verify webhook signatures and track events in a `webhook_events` table for deduplication. **Never mark an order as paid based solely on a client-side redirect.**

### Bangladesh Landing Order System

- **Capability**: District/Upazila-based address fields with Dhaka/outside shipping rules. Configurable form fields.
- **Constraint**: Server must validate phone formats and totals. Use anti-spam measures (rate limits, honeypots).

## 4) Frontend & UX (Remix + Builder)

### Remix Patterns & Fetcher Mutations

- **Capability**: Use intent-based actions (`intent=...`) and maintain optimistic UI strategies.
- **Constraint**: Mutations must return canonical state or trigger revalidation. Handle version conflicts gracefully.

### Drag & Drop Stability

- **Capability**: Maintain `dnd-kit` sortable implementations for section reordering.
- **Constraint**: **Never use array index as a React key.** Ensure rollback/refetch logic is in place for optimistic failures.

### Theme Tokens & Rendering

- **Capability**: Apply theme tokens (colors, fonts, layout) consistently across sections.
- **Constraint**: Reuse the same components for both admin preview and public rendering. Avoid arbitrary CSS injection.

## 5) Performance & Infrastructure

### KV Caching Strategy

- **Capability**: Design KV cache keys using `shop_id + version`.
- **Constraint**: Invalidate/refresh cache on every publish event. Handle stale risks with versioned keys.

### R2 Asset Pipeline

- **Capability**: Implement signed upload URLs. Maintain asset metadata in D1.
- **Constraint**: Validate file types/sizes server-side. **Do not store large binary blobs in D1.**

### Async Jobs with Queues

- **Capability**: Use Cloudflare Queues for emails, webhook processing, and cache rebuilds.
- **Constraint**: All queue jobs must be **idempotent**. Track job status or use deduplication keys.

## 6) Quality & Delivery

### Testing Discipline

- **Capability**: Write Vitest unit tests (pricing, reorder), D1 integration tests (snapshots), and Playwright E2E tests (builder flow, checkout).
- **Constraint**: **Every bug fix must include a regression test.** CI must gate on formatting, linting, typechecking, and tests.

### Security Hygiene

- **Capability**: Input validation (Zod), XSS sanitization (rich text), and Role-based access control (RBAC) scoped by `shop_id`.
- **Constraint**: Apply the principle of least privilege. Implement rate limiting on public endpoints.

### Debug Workflow & Refactoring

- **Capability**: Identify impacted areas via `git diff`. Perform incremental, small refactors.
- **Constraint**: **Never break public published rendering.** Maintain backward compatibility for migrations.
