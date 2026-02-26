# 🚀 Ozzyl Landing Page Builder — Complete Implementation Plan

> **Context7 Verified**: ✅ Cloudflare D1, Remix v2, Hono, Drizzle ORM, Workers AI  
> **Date**: 2026-02-24  
> **Status**: ACTIVE — Engineering Source of Truth — Ready for Implementation  
> **Audience**: Full-stack engineers building on the Cloudflare-native stack  
> **UI Prototype**: ✅ [Stitch Project `3619206955577216335`](https://stitch.google.com/projects/3619206955577216335) — 8 screens complete  
> **Adversarial Review**: ✅ Completed 2026-02-24 — All 15 issues found and fixed  

---

## 🎨 UI Prototype — Stitch Screens

> **Stitch Project ID:** `3619206955577216335`  
> **Generated:** 2026-02-24 | **Total Screens:** 8  

| # | Screen Title | Stitch Screen ID | Description |
|---|-------------|-----------------|-------------|
| 1 | 🖥️ Main 3-Panel Editor | `63233d8c41634daa9940f62ee2833fad` | Dark left sidebar (section list + drag handles) + center live preview iframe + right Bengali settings panel + Pro Mode button |
| 2 | ➕ Add Section Modal | `6d015a0ffd5a41258452f65bfabbf644` | Category sidebar + 3-col section card grid with wireframe thumbnails + search bar + Pro Mode GrapesJS link |
| 3 | 🧞 Genie Mode Wizard | `f33cfd42f70b4ceabcaf231c9c3ba49a` | Bengali business info form (Step 2 of 4) — store name, industry, target audience, goals |
| 4 | ✅ Genie Mode Success | `39cdc740192f46cf9ac75230a3b26509` | Split layout — celebration left + live generated page preview right + Edit / Publish Now CTAs |
| 5 | 🗂️ Template Gallery | `d3956736a8224147b6c65f99df2a360e` | 6 templates with category filter, conversion score badges, Use Template button |
| 6 | 📊 Analytics Dashboard | `9f432351f12f49e98fd5bd7acf3e1fde` | KPI cards + daily visits line chart + section heatmap + device breakdown + traffic sources |
| 7 | 🎨 Global Styles Panel | `dbbfcb3359984313a6def88c9b7b5245` | 400px right drawer — brand colors, typography, spacing, button style, live preview card |
| 8 | ⚙️ Page Settings Modal | `bdc9144ee5a74c15b9d17a46e473adfc` | General/SEO/Social tabs — Bengali slug, published toggle, custom domain, danger zone |

### Complete User Journey (Prototype Flow)

```
/app/new-builder (Entry Point)
    ↓
[Screen 5] Template Gallery — Pick 1 of 6 templates
    ↓
[Screen 3] Genie Mode Wizard — Fill Bengali business info
    ↓
AI Generating... (Workers AI writes Bengali copy)
    ↓
[Screen 4] Success Screen — Preview generated page
    ↓
[Screen 1] 3-Panel Editor — Fine-tune sections
    ├── [Screen 2] Add Section Modal
    ├── [Screen 7] Global Styles Panel
    └── [Screen 8] Page Settings Modal
    ↓
Publish Button → KV static publish → live URL
    ↓
[Screen 6] Analytics Dashboard — Track visits, section heatmap
```

---

## 📑 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Boss Decisions — Confirmed](#2-boss-decisions--confirmed)
3. [Codebase Reality — Current State](#3-codebase-reality--current-state)
4. [Architecture Overview](#4-architecture-overview)
5. [Database Schema](#5-database-schema)
6. [File Structure (Target)](#6-file-structure-target)
7. [Phase 1 — Cleanup & Default Switch](#7-phase-1--cleanup--default-switch)
8. [Phase 2 — 3-Panel Editor Polish](#8-phase-2--3-panel-editor-polish)
9. [Phase 3 — Section Variant Picker](#9-phase-3--section-variant-picker)
10. [Phase 4 — Genie Mode 2.0 (AI Bengali Copy)](#10-phase-4--genie-mode-20-ai-bengali-copy)
11. [Phase 5 — 6-Template Gallery](#11-phase-5--6-template-gallery)
12. [Phase 6 — Custom D1 Analytics](#12-phase-6--custom-d1-analytics)
13. [Phase 7 — Static KV Publishing](#13-phase-7--static-kv-publishing)
14. [Competitor Inspiration Map](#14-competitor-inspiration-map)
15. [API Reference](#15-api-reference)
16. [Acceptance Criteria](#16-acceptance-criteria)
17. [Risk Register](#17-risk-register)

---

## 1. Executive Summary

Ozzyl is building a **Shopify-of-Bangladesh** multi-tenant SaaS on Cloudflare's edge. The Landing Page Builder is a first-class merchant tool that lets store owners create high-converting landing pages in minutes — without design skills.

### Core Design Philosophy

```
┌─────────────────────────────────────────────────────────────┐
│              LANDING PAGE BUILDER — ENTRY FLOW              │
│                                                             │
│  Merchant clicks "Create Page"                              │
│          │                                                  │
│          ▼                                                  │
│  ┌───────────────────┐    ┌─────────────────────────┐       │
│  │  🧞 Genie Mode    │    │  📋 Template Gallery    │       │
│  │  (DEFAULT)        │    │  (Manual Start)         │       │
│  │  5-question wizard│    │  6 industry templates   │       │
│  │  AI Bengali copy  │    │  Conversion scores      │       │
│  └────────┬──────────┘    └──────────┬──────────────┘       │
│           │                          │                      │
│           └──────────┬───────────────┘                      │
│                      ▼                                      │
│          ┌────────────────────────┐                         │
│          │  3-Panel Editor        │                         │
│          │  Sections │ Preview    │                         │
│          │  List     │ iframe     │                         │
│          │           │ Settings   │                         │
│          └────────────────────────┘                         │
│                      │                                      │
│                      ▼                                      │
│          ┌────────────────────────┐                         │
│          │  ⚙️ Pro Mode Button   │                         │
│          │  → GrapesJS (Advanced) │                         │
│          └────────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### What We Ship in 7 Phases

| Phase | Feature | Duration | Priority |
|-------|---------|----------|----------|
| 1 | Cleanup & Default Switch | 3 days | 🔴 Critical |
| 2 | 3-Panel Editor Polish | 5–7 days | 🔴 Critical |
| 3 | Section Variant Picker | 3–4 days | 🟠 High |
| 4 | Genie Mode 2.0 (AI Copy) | 4–5 days | 🟠 High |
| 5 | 6-Template Gallery | 3–4 days | 🟠 High |
| 6 | Custom D1 Analytics | 4–5 days | 🟡 Medium |
| 7 | Static KV Publishing | 3–4 days | 🟡 Medium |

---

## 2. Boss Decisions — Confirmed

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Default Entry** | New Section Builder | Genie Mode as first UX, not GrapesJS |
| **GrapesJS** | Pro Mode only | Kept for power users, not default |
| **Launch Templates** | 6 templates | Industry-specific, conversion-scored |
| **AI Copy Language** | Bengali (Workers AI) | Bangladesh market, llama-3.1-8b |
| **Analytics** | Custom D1-built | No third-party, full data ownership |
| **Real-time collab** | Phase 7+ (Durable Objects) | Not needed for MVP |

---

## 3. Codebase Reality — Current State

### Existing Routes Audit

| Route | System | DB Table | Rows | Action |
|-------|--------|----------|------|--------|
| `app.page-builder.tsx` | OLD (GrapesJS) | `landing_pages` | 0 | Redirect to `/app/new-builder`, add Pro Mode button |
| `app.new-builder._index.tsx` | NEW (active) | `builder_pages` | 5 ✅ | Keep, enhance with Genie Mode entry |
| `app.new-builder.$pageId.tsx` | NEW (active) | `builder_sections` | 40 ✅ | Polish 3-panel editor |
| `app.page-builder_.preview.$pageId.tsx` | OLD preview | GrapesJS HTML | — | Deprecate, replace with new preview |

### Existing Dead Tables — Safe to Drop

```sql
-- These tables have 0 rows and zero code references. Drop them.
DROP TABLE IF EXISTS advanced_builder_pages;
DROP TABLE IF EXISTS advanced_builder_sections;
```

### Existing Assets We Keep & Build On

- ✅ **`BuilderLayout.tsx`** — 3-panel layout skeleton (needs polish)
- ✅ **Section registry** — 23 section types with Zod schemas
- ✅ **`publishedPropsJson`** — Draft/Publish split pattern already in place
- ✅ **`postMessage` BUILDER_UPDATE** — Live preview update mechanism
- ✅ **IntentWizard / Genie Mode v1** — Exists, needs AI integration
- ✅ **`SECTION_REGISTRY`** — Full registry in `lib/page-builder/registry.ts`
- ✅ **Zod schemas** — `BaseSectionStyleSchema`, per-section schemas in `lib/page-builder/schemas.ts`
- ✅ **Bengali section names** — Already in registry (`name: 'হিরো'`, etc.)
- ✅ **`TEMPLATE_PRESETS`** — Rich templates in `lib/page-builder/templates.ts`

### Existing Section Types (23 registered)

```
hero, features, testimonials, faq, gallery, video, cta,
trust-badges, benefits, comparison, delivery, guarantee,
problem-solution, pricing, how-to-order, showcase,
product-grid, custom-html, order-button, header,
countdown, stats, contact, footer
```

---

## 4. Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     LANDING PAGE BUILDER SYSTEM                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  CLOUDFLARE PAGES (Remix v2)                                         │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  Admin Routes (/app/new-builder/*)                          │     │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐│     │
│  │  │ Dashboard    │ │ Editor       │ │ Genie Wizard         ││     │
│  │  │ _index.tsx   │ │ $pageId.tsx  │ │ genie.tsx            ││     │
│  │  └──────────────┘ └──────────────┘ └──────────────────────┘│     │
│  │  ┌──────────────┐ ┌──────────────┐                         │     │
│  │  │ Templates    │ │ Preview      │                         │     │
│  │  │ templates.tsx│ │ preview.tsx  │                         │     │
│  │  └──────────────┘ └──────────────┘                         │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  HONO API LAYER (type-safe endpoints)                                │
│  ┌─────────────────────────────────────────────────────────────┐     │
│  │  /api/builder/save     → D1 (auto-save sections)           │     │
│  │  /api/builder/publish  → D1 + KV (publish to edge)         │     │
│  │  /api/builder/ai-copy  → Workers AI (Bengali generation)   │     │
│  │  /api/builder/analytics→ D1 (event ingestion)              │     │
│  └─────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  DATA LAYER                                                          │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ ┌──────────────┐    │
│  │ D1 (SQL)   │ │ KV (cache) │ │ Workers AI   │ │ R2 (assets)  │    │
│  │ builder_   │ │ page:{id}  │ │ llama-3.1-8b │ │ images/      │    │
│  │ pages,     │ │ :{slug}    │ │ Bengali copy │ │ uploads/     │    │
│  │ sections,  │ │ TTL: 5min  │ │              │ │              │    │
│  │ analytics  │ │            │ │              │ │              │    │
│  └────────────┘ └────────────┘ └──────────────┘ └──────────────┘    │
└──────────────────────────────────────────────────────────────────────┘
```

### Data Flow: Edit → Save → Publish

```
Editor (browser)
    │
    │  useFetcher() every 2s
    ▼
POST /api/builder/save
    │
    │  Zod validate → D1 batch upsert
    ▼
builder_sections (draft props)
    │
    │  Merchant clicks "Publish"
    ▼
POST /api/builder/publish
    │
    │  Read all sections → render JSON
    │  Copy draftPropsJson → publishedPropsJson
    │  Store in KV: page:{storeId}:{slug}
    ▼
KV (TTL: 5 min)
    │
    │  Public visitor hits /{slug}
    ▼
GET /[slug]  → reads from KV → sub-100ms TTFB
```

### Multi-Tenancy: store_id Enforcement

```
⚠️ CRITICAL: Every DB query MUST include store_id.
No exceptions. Data leakage = security breach.

✅ CORRECT:
  db.select().from(builderPages)
    .where(and(
      eq(builderPages.storeId, storeId),
      eq(builderPages.id, pageId)
    ))

❌ WRONG (data leak):
  db.select().from(builderPages)
    .where(eq(builderPages.id, pageId))
```

---

## 5. Database Schema

### Core Tables (Keep & Migrate Forward)

```sql
-- ─────────────────────────────────────────────────────────────
-- builder_pages: Top-level page record (5 rows in prod — KEEP)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS builder_pages (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  store_id    INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Untitled Page',
  slug        TEXT NOT NULL,
  template_id TEXT DEFAULT 'blank',
  status      TEXT NOT NULL DEFAULT 'draft'
                CHECK(status IN ('draft', 'published', 'archived')),
  meta_title       TEXT,
  meta_description TEXT,
  og_image         TEXT,
  published_at DATETIME,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_builder_pages_store_slug
  ON builder_pages(store_id, slug);
CREATE INDEX IF NOT EXISTS idx_builder_pages_store_status
  ON builder_pages(store_id, status);

-- ─────────────────────────────────────────────────────────────
-- builder_sections: Individual sections per page (40 rows — KEEP)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS builder_sections (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  page_id      TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id     INTEGER NOT NULL,           -- denormalized for fast queries
  section_type TEXT NOT NULL,              -- matches SECTION_REGISTRY key
  position     INTEGER NOT NULL DEFAULT 0, -- display order
  variant      TEXT DEFAULT 'default',     -- glassmorphism, neubrutalist, etc.
  draft_props_json     TEXT NOT NULL DEFAULT '{}',
  published_props_json TEXT,               -- NULL until first publish
  is_hidden    INTEGER NOT NULL DEFAULT 0,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_builder_sections_page
  ON builder_sections(page_id, position);
CREATE INDEX IF NOT EXISTS idx_builder_sections_store
  ON builder_sections(store_id);

-- ─────────────────────────────────────────────────────────────
-- page_revisions: Version history (already active)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_revisions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  page_id     TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id    INTEGER NOT NULL,
  snapshot    TEXT NOT NULL, -- full JSON snapshot of all sections at publish time
  label       TEXT,          -- optional human label ("Before Black Friday")
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_revisions_page
  ON page_revisions(page_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- saved_blocks: Reusable block library (already active)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_blocks (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  store_id     INTEGER NOT NULL,
  name         TEXT NOT NULL,
  section_type TEXT NOT NULL,
  variant      TEXT DEFAULT 'default',
  props_json   TEXT NOT NULL DEFAULT '{}',
  thumbnail    TEXT,
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_saved_blocks_store
  ON saved_blocks(store_id, section_type);

-- ─────────────────────────────────────────────────────────────
-- page_analytics: Custom analytics (NEW — Phase 6)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_analytics (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  page_id     TEXT NOT NULL REFERENCES builder_pages(id) ON DELETE CASCADE,
  store_id    INTEGER NOT NULL,
  event_type  TEXT NOT NULL
                CHECK(event_type IN ('view','click','cta_click','scroll_50','scroll_75','scroll_100','section_view')),
  section_id  TEXT,          -- NULL for page-level events
  session_id  TEXT NOT NULL,
  device_type TEXT CHECK(device_type IN ('mobile','tablet','desktop')),
  country     TEXT,
  referrer    TEXT,
  metadata    TEXT,          -- JSON blob for extra context
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_page_analytics_page_event
  ON page_analytics(page_id, event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_analytics_store
  ON page_analytics(store_id, created_at DESC);

-- ─────────────────────────────────────────────────────────────
-- DROP dead tables (migration file)
-- ─────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS advanced_builder_pages;
DROP TABLE IF EXISTS advanced_builder_sections;
```

### Drizzle ORM Schema (TypeScript)

```typescript
// packages/database/src/schema-builder.ts

import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { stores } from './schema';

export const builderPages = sqliteTable('builder_pages', {
  id:              text('id').primaryKey(),
  storeId:         integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  title:           text('title').notNull().default('Untitled Page'),
  slug:            text('slug').notNull(),
  templateId:      text('template_id').default('blank'),
  status:          text('status', { enum: ['draft', 'published', 'archived'] }).notNull().default('draft'),
  metaTitle:       text('meta_title'),
  metaDescription: text('meta_description'),
  ogImage:         text('og_image'),
  publishedAt:     text('published_at'),
  createdAt:       text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:       text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  storeSlugIdx: uniqueIndex('idx_builder_pages_store_slug').on(t.storeId, t.slug),
  storeStatusIdx: index('idx_builder_pages_store_status').on(t.storeId, t.status),
}));

export const builderSections = sqliteTable('builder_sections', {
  id:                  text('id').primaryKey(),
  pageId:              text('page_id').notNull().references(() => builderPages.id, { onDelete: 'cascade' }),
  storeId:             integer('store_id').notNull(),
  sectionType:         text('section_type').notNull(),
  position:            integer('position').notNull().default(0),
  variant:             text('variant').default('default'),
  draftPropsJson:      text('draft_props_json').notNull().default('{}'),
  publishedPropsJson:  text('published_props_json'),
  isHidden:            integer('is_hidden', { mode: 'boolean' }).notNull().default(false),
  createdAt:           text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt:           text('updated_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pageIdx:  index('idx_builder_sections_page').on(t.pageId, t.position),
  storeIdx: index('idx_builder_sections_store').on(t.storeId),
}));

export const pageAnalytics = sqliteTable('page_analytics', {
  id:         text('id').primaryKey(),
  pageId:     text('page_id').notNull().references(() => builderPages.id, { onDelete: 'cascade' }),
  storeId:    integer('store_id').notNull(),
  eventType:  text('event_type', {
    enum: ['view','click','cta_click','scroll_50','scroll_75','scroll_100','section_view']
  }).notNull(),
  sectionId:  text('section_id'),
  sessionId:  text('session_id').notNull(),
  deviceType: text('device_type', { enum: ['mobile','tablet','desktop'] }),
  country:    text('country'),
  referrer:   text('referrer'),
  metadata:   text('metadata'),
  createdAt:  text('created_at').default(sql`CURRENT_TIMESTAMP`),
}, (t) => ({
  pageEventIdx: index('idx_page_analytics_page_event').on(t.pageId, t.eventType, t.createdAt),
  storeIdx:     index('idx_page_analytics_store').on(t.storeId, t.createdAt),
}));
```

---

## 6. File Structure (Target)

```
apps/web/app/
├── routes/
│   ├── app.new-builder._index.tsx          # Builder dashboard (DEFAULT ENTRY)
│   ├── app.new-builder.$pageId.tsx         # 3-panel editor
│   ├── app.new-builder.$pageId.preview.tsx # Live preview iframe route
│   ├── app.new-builder.genie.tsx           # Genie Mode 2.0 wizard
│   ├── app.new-builder.templates.tsx       # Template gallery
│   ├── app.page-builder.tsx                # OLD → redirect to new-builder + Pro Mode btn
│   ├── api.builder.save.ts                 # Auto-save endpoint (useFetcher target)
│   ├── api.builder.publish.ts              # Publish sections → KV
│   ├── api.builder.ai-copy.ts              # Bengali AI copy (SSE streaming)
│   └── api.builder.analytics.ts           # Analytics event ingestion
│
├── components/builder/
│   ├── BuilderLayout.tsx                   # 3-panel outer shell
│   ├── SectionList.tsx                     # Left panel: drag-reorder section list
│   ├── PreviewFrame.tsx                    # Center: live iframe with postMessage
│   ├── SettingsPanel.tsx                   # Right panel: Zod-driven form fields
│   ├── VariantPicker.tsx                   # Section variant thumbnail grid
│   ├── GenieWizard.tsx                     # AI onboarding 5-question flow
│   ├── TemplateGallery.tsx                 # Template picker with conversion scores
│   ├── AddSectionModal.tsx                 # Modal to add new section from registry
│   ├── SectionCard.tsx                     # Single section card in left panel
│   ├── PublishButton.tsx                   # Publish + KV invalidation trigger
│   └── UndoRedoToolbar.tsx                 # Keyboard shortcut + history UI
│
└── lib/page-builder/
    ├── registry.ts                         # Section type registry (23 types)
    ├── schemas.ts                          # Zod schemas per section type
    ├── templates.ts                        # 6 launch template definitions
    ├── publisher.server.ts                 # KV publish logic (server-only)
    ├── ai-copy.server.ts                   # Workers AI Bengali generator (server-only)
    ├── analytics.server.ts                 # D1 analytics write/read helpers
    ├── actions.server.ts                   # CRUD helpers (already exists)
    ├── cache.server.ts                     # KV read helpers (already exists)
    └── types.ts                            # Shared TypeScript types
```


---

## 7. Phase 1 — Cleanup & Default Switch

**Duration**: 3 days | **Priority**: 🔴 Critical

### Goal
Make `app/new-builder` the single, clean default entry point. Retire the old GrapesJS route gracefully with a "Pro Mode" escape hatch.

### Tasks

#### 1.1 — Update `app.page-builder.tsx` (redirect + Pro Mode button)

```typescript
// apps/web/app/routes/app.page-builder.tsx
// Replace entire loader with redirect to new builder
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const proMode = url.searchParams.get('pro');

  if (proMode === '1') {
    // Allow access to GrapesJS for power users
    const env = context.cloudflare.env;
    const builderUrl = env.PAGE_BUILDER_URL || 'https://builder.ozzyl.com';
    return redirect(builderUrl);
  }

  // Default: redirect everyone to the new builder
  return redirect('/app/new-builder');
}
```

Add a "Pro Mode (Advanced)" button in `app.new-builder._index.tsx` header:

```tsx
// In the dashboard header area
<a
  href="/app/page-builder?pro=1"
  className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 border border-gray-700 rounded px-3 py-1"
>
  <Settings className="w-3 h-3" />
  Pro Mode (GrapesJS)
</a>
```

#### 1.2 — Drop Dead Tables Migration

```sql
-- packages/database/src/migrations/0016_drop_dead_builder_tables.sql
-- ✅ FIX #11: Correct migration number (0015 was last — use 0016)
-- ✅ FIX #4: Backup tables BEFORE dropping — safety net in case prod has unexpected data

-- Step 1: Backup first (idempotent — safe to run multiple times)
CREATE TABLE IF NOT EXISTS advanced_builder_pages_backup
  AS SELECT * FROM advanced_builder_pages;
CREATE TABLE IF NOT EXISTS advanced_builder_sections_backup
  AS SELECT * FROM advanced_builder_sections;

-- Step 2: Verify backup row counts match originals before dropping
-- Run manually: SELECT COUNT(*) FROM advanced_builder_pages_backup;
-- Run manually: SELECT COUNT(*) FROM advanced_builder_sections_backup;

-- Step 3: Drop dead tables (only after verifying backup)
DROP TABLE IF EXISTS advanced_builder_sections;
DROP TABLE IF EXISTS advanced_builder_pages;

-- Step 4: Cleanup backups after 30 days (run manually when confident)
-- DROP TABLE IF EXISTS advanced_builder_pages_backup;
-- DROP TABLE IF EXISTS advanced_builder_sections_backup;
```

```bash
# Apply locally
npm run db:migrate:local

# Verify it worked
wrangler d1 execute ozzyl-local --command \
  "SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'advanced%';"
# Expected: 0 rows returned
```

#### 1.3 — Update Admin Nav Link

```typescript
// Wherever the sidebar nav is defined, update the "Page Builder" link:
{ label: 'পেজ বিল্ডার', href: '/app/new-builder', icon: 'Layout' }
// Remove any nav entry pointing to /app/page-builder
```

### Acceptance Criteria Phase 1
- [ ] Visiting `/app/page-builder` redirects to `/app/new-builder`
- [ ] "Pro Mode" button with `?pro=1` still reaches GrapesJS
- [ ] `advanced_builder_*` tables gone from schema and migration
- [ ] Admin nav points to `/app/new-builder`
- [ ] No broken links in the UI

---

## 8. Phase 2 — 3-Panel Editor Polish

**Duration**: 5–7 days | **Priority**: 🔴 Critical

### Goal
Transform the partially-built `app.new-builder.$pageId.tsx` into a production-quality, Shopify-like 3-panel editor.

### Panel Layout

```
┌────────────────────────────────────────────────────────────────┐
│  TOOLBAR: [← Back] [Page Title] [Undo][Redo] [Preview] [Publish]│
├──────────────┬─────────────────────────────┬───────────────────┤
│ LEFT PANEL   │   CENTER: Live Preview      │  RIGHT PANEL      │
│ (280px)      │   (fills remaining width)   │  (320px)          │
│              │                             │                   │
│ + Add Section│  ┌─────────────────────┐   │  Section Settings │
│              │  │                     │   │                   │
│ ┌──────────┐ │  │   Preview iframe    │   │  [field inputs    │
│ │ Hero  ⠿  │ │  │   postMessage       │   │   based on        │
│ │ [Edit]   │ │  │   BUILDER_UPDATE    │   │   Zod schema]     │
│ └──────────┘ │  │                     │   │                   │
│ ┌──────────┐ │  └─────────────────────┘   │  Variant Picker   │
│ │Features ⠿│ │                             │  [thumbnails]     │
│ │ [Edit]   │ │  [Mobile] [Tablet] [Desktop]│                   │
│ └──────────┘ │                             │  Style Options    │
│              │                             │  [bg, padding...] │
│ ┌──────────┐ │                             │                   │
│ │   CTA  ⠿ │ │                             │                   │
│ └──────────┘ │                             │                   │
└──────────────┴─────────────────────────────┴───────────────────┘
```

### Key Implementation Details

#### 2.0 — Required Dependencies (Install First)

```bash
# ✅ FIX #8: dnd-kit must be installed — not in package.json yet
cd apps/web
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# ✅ FIX #7: Add @db alias to apps/web/tsconfig.json
# In tsconfig.json compilerOptions.paths:
# "@db/*": ["../../packages/database/src/*"]
# Also create: packages/database/src/schema-builder.ts (new file per Section 5)
```

```json
// apps/web/tsconfig.json — add to compilerOptions.paths:
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./app/*"],
      "@db/*": ["../../packages/database/src/*"]
    }
  }
}
```

#### 2.1 — Drag-Reorder (dnd-kit recommended over react-beautiful-dnd)

```typescript
// apps/web/app/components/builder/SectionList.tsx
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableSectionCard({ section, isActive, onSelect }: SortableSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`group flex items-center gap-2 p-3 rounded-lg border cursor-pointer
        ${isActive ? 'border-blue-500 bg-blue-950' : 'border-gray-700 hover:border-gray-500'}`}
      onClick={() => onSelect(section.id)}
    >
      {/* Drag handle */}
      <button {...attributes} {...listeners} className="cursor-grab text-gray-500 hover:text-gray-300">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="text-sm text-gray-200 flex-1">{section.nameEn}</span>
      {section.isHidden && <EyeOff className="w-3 h-3 text-gray-500" />}
    </div>
  );
}

function SectionList({ sections, activeSectionId, onSelect, onReorder }: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = sections.findIndex(s => s.id === active.id);
      const newIdx = sections.findIndex(s => s.id === over.id);
      onReorder(arrayMove(sections, oldIdx, newIdx));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
        {sections.map(section => (
          <SortableSectionCard
            key={section.id}
            section={section}
            isActive={section.id === activeSectionId}
            onSelect={onSelect}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
```

#### 2.2 — Auto-Save with `useFetcher` (every 2 seconds)

```typescript
// apps/web/app/routes/app.new-builder.$pageId.tsx
// ✅ FIX #15: useCallback import added
import { useFetcher } from '@remix-run/react';
import { useEffect, useRef, useCallback } from 'react';

// ✅ FIX #14: Always export ErrorBoundary on editor routes
export function ErrorBoundary() {
  const error = useRouteError();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center p-8 bg-gray-900 rounded-2xl border border-red-800 max-w-md">
        <h2 className="text-red-400 text-xl font-bold mb-2">এডিটর লোড হয়নি</h2>
        <p className="text-gray-400 text-sm mb-4">
          {isRouteErrorResponse(error) ? error.data : 'অপ্রত্যাশিত সমস্যা হয়েছে'}
        </p>
        <a href="/app/new-builder" className="text-blue-400 hover:text-blue-300 text-sm">
          ← ড্যাশবোর্ডে ফিরে যান
        </a>
      </div>
    </div>
  );
}

export default function BuilderEditor() {
  const saveFetcher = useFetcher();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Debounced auto-save: fires 2s after last change
  const scheduleAutoSave = useCallback((sections: BuilderSection[]) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveFetcher.submit(
        { sections: JSON.stringify(sections), intent: 'auto-save' },
        { method: 'POST', action: '/api/builder/save' }
      );
    }, 2000);
  }, [saveFetcher]);

  // Show save status in toolbar
  const saveStatus = saveFetcher.state === 'submitting'
    ? '⏳ Saving...'
    : saveFetcher.state === 'loading'
    ? '✅ Saved'
    : '●  Draft';

  // ...
}
```

#### 2.3 — `/api/builder/save` Endpoint

```typescript
// apps/web/app/routes/api.builder.save.ts
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { requireAuth } from '~/lib/auth.server';
import { builderSections } from '@db/schema-builder';

const SavePayloadSchema = z.object({
  sections: z.string().transform(s => JSON.parse(s) as SectionSaveItem[]),
  intent: z.enum(['auto-save', 'manual-save']),
});

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = drizzle(context.cloudflare.env.DB);

  const formData = await request.formData();
  const parsed = SavePayloadSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  const { sections } = parsed.data;

  // ✅ FIX #5: Use INSERT OR REPLACE (true upsert) — handles both new AND existing sections
  // Pure UPDATE would silently drop newly added sections that haven't been saved yet
  const now = new Date().toISOString();
  await context.cloudflare.env.DB.batch(
    sections.map(section =>
      context.cloudflare.env.DB.prepare(`
        INSERT INTO builder_sections (id, page_id, store_id, section_type, position, variant, draft_props_json, updated_at)
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
        ON CONFLICT(id) DO UPDATE SET
          draft_props_json = excluded.draft_props_json,
          variant          = excluded.variant,
          position         = excluded.position,
          updated_at       = excluded.updated_at
        WHERE builder_sections.store_id = ?3  -- ← MULTI-TENANCY GUARD on upsert
      `).bind(
        section.id,
        section.pageId,
        store.id,
        section.sectionType,
        section.position,
        section.variant ?? 'default',
        JSON.stringify(section.props),
        now,
      )
    )
  );

  return json({ success: true, savedAt: now });
}
```

#### 2.4 — Live Preview `postMessage` Pattern

```typescript
// apps/web/app/components/builder/PreviewFrame.tsx
export function PreviewFrame({ pageId, sections, activeViewport }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Send update to iframe whenever sections change
  // ✅ FIX #1: Use explicit origin, never '*' — prevents XSS data leakage
  const PREVIEW_ORIGIN = typeof window !== 'undefined' ? window.location.origin : '';
  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage({
      type: 'BUILDER_UPDATE',
      sections,
    }, PREVIEW_ORIGIN); // ← NEVER use '*' here
  }, [sections]);

  const viewportWidths = { mobile: '390px', tablet: '768px', desktop: '100%' };

  return (
    <div className="flex flex-col h-full">
      {/* Viewport switcher */}
      <div className="flex gap-2 justify-center py-2 border-b border-gray-800">
        {(['mobile','tablet','desktop'] as const).map(vp => (
          <button key={vp} onClick={() => setViewport(vp)}
            className={`px-3 py-1 text-xs rounded ${activeViewport === vp ? 'bg-blue-600' : 'bg-gray-800'}`}
          >
            {vp}
          </button>
        ))}
      </div>
      {/* Preview iframe */}
      <div className="flex-1 flex justify-center overflow-auto bg-gray-950 p-4">
        <iframe
          ref={iframeRef}
          src={`/app/new-builder/${pageId}/preview`}
          style={{ width: viewportWidths[activeViewport], height: '100%', border: 'none' }}
          title="Page Preview"
        />
      </div>
    </div>
  );
}
```

#### 2.5 — Keyboard Shortcuts

```typescript
// apps/web/app/hooks/useBuilderKeyboard.ts
export function useBuilderKeyboard({ onUndo, onRedo, onSave }: KeyboardHookProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'z' && !e.shiftKey) { e.preventDefault(); onUndo(); }
      if (ctrl && e.key === 'z' && e.shiftKey)  { e.preventDefault(); onRedo(); }
      if (ctrl && e.key === 's')                 { e.preventDefault(); onSave(); }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, onSave]);
}
```

#### 2.6 — ✅ FIX #12 — Mobile Responsiveness for the Editor UI

The 3-panel layout (280px + center + 320px) is unusable on small screens. The editor itself is an admin tool — not customer-facing — so mobile support is secondary but still needed for tablets.

```typescript
// BuilderLayout.tsx — responsive panel strategy
// < 768px  (mobile):  Show only ONE panel at a time with tab switcher
// 768–1024px (tablet): Collapse left panel to icon-only (48px), hide right panel by default
// > 1024px (desktop): Full 3-panel layout

// CSS approach using Tailwind:
<div className="flex h-screen overflow-hidden">
  {/* Left panel — collapses to icons on tablet, hidden on mobile */}
  <div className={`
    hidden md:flex flex-col
    ${leftPanelOpen ? 'w-72' : 'w-12'}
    transition-all duration-200 border-r border-gray-800 bg-gray-900
  `}>
    {/* ... section list */}
  </div>

  {/* Center preview — always visible */}
  <div className="flex-1 min-w-0 overflow-hidden">
    {/* ... preview iframe */}
  </div>

  {/* Right panel — hidden on tablet/mobile, toggle via button */}
  <div className={`
    hidden lg:flex flex-col w-80
    border-l border-gray-800 bg-gray-900
  `}>
    {/* ... settings panel */}
  </div>

  {/* Mobile: bottom sheet for settings (< md) */}
  <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 z-50">
    {/* Tab bar: [Sections] [Settings] [Preview] */}
  </div>
</div>
```

### Acceptance Criteria Phase 2
- [ ] Sections drag-reorder and save new positions
- [ ] Auto-save fires 2s after any change, shows status in toolbar
- [ ] `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+S` all work
- [ ] Preview iframe updates instantly via postMessage
- [ ] Mobile / Tablet / Desktop viewport switcher works
- [ ] Settings panel renders correct fields for each section type
- [ ] Editor is usable on tablet (768px+) — panels collapse gracefully
- [ ] Mobile (< 768px) shows bottom tab bar for panel switching

---

## 9. Phase 3 — Section Variant Picker

**Duration**: 3–4 days | **Priority**: 🟠 High

### Goal
Give merchants a visual thumbnail grid to swap section variants — inspired by Framer's component picker. No code needed; click to apply.

### Variants Per Section

| Variant ID | Description | Visual Style |
|------------|-------------|--------------|
| `default` | Clean, minimal | White bg, standard typography |
| `dark` | Dark background | Dark bg, light text |
| `glassmorphism` | Frosted glass | Blur + transparency + border |
| `neubrutalist` | Bold borders | Thick black borders, solid shadows |
| `gradient` | Color gradient | Linear gradient background |
| `minimal` | Ultra-clean | Max whitespace, no decorations |

At least 3 variants required per section for launch. Start with `hero`, `features`, `cta`, `testimonials`.

### `VariantPicker` Component

```typescript
// apps/web/app/components/builder/VariantPicker.tsx
import type { SectionVariant } from '~/lib/page-builder/types';

interface VariantPickerProps {
  sectionType: SectionType;
  currentVariant: string;
  onVariantChange: (variant: string) => void;
}

const SECTION_VARIANTS: Record<string, SectionVariant[]> = {
  hero: [
    { id: 'default',        label: 'Classic',       thumbnail: '/variants/hero-default.png' },
    { id: 'dark',           label: 'Dark',          thumbnail: '/variants/hero-dark.png' },
    { id: 'glassmorphism',  label: 'Glass',         thumbnail: '/variants/hero-glass.png' },
    { id: 'neubrutalist',   label: 'Bold',          thumbnail: '/variants/hero-bold.png' },
    { id: 'gradient',       label: 'Gradient',      thumbnail: '/variants/hero-gradient.png' },
    { id: 'minimal',        label: 'Minimal',       thumbnail: '/variants/hero-minimal.png' },
  ],
  // ... other section types
};

export function VariantPicker({ sectionType, currentVariant, onVariantChange }: VariantPickerProps) {
  const variants = SECTION_VARIANTS[sectionType] ?? [];
  if (variants.length === 0) return null;

  return (
    <div className="border-b border-gray-700 pb-4 mb-4">
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Layout Style</p>
      <div className="grid grid-cols-3 gap-2">
        {variants.map(variant => (
          <button
            key={variant.id}
            onClick={() => onVariantChange(variant.id)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all
              ${currentVariant === variant.id
                ? 'border-blue-500 ring-2 ring-blue-500/30'
                : 'border-gray-700 hover:border-gray-500'
              }`}
          >
            {/* Thumbnail */}
            <img
              src={variant.thumbnail}
              alt={variant.label}
              className="w-full h-14 object-cover"
              onError={(e) => {
                // Fallback to colored block if thumbnail missing
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {/* Label */}
            <div className="px-1 py-1 bg-gray-900 text-center">
              <span className="text-[10px] text-gray-300">{variant.label}</span>
            </div>
            {/* Active checkmark */}
            {currentVariant === variant.id && (
              <div className="absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Variant Storage in DB

Variant is stored in `builder_sections.variant` (TEXT column, already in schema). When a variant changes:

1. Update local state immediately (optimistic UI)
2. postMessage `BUILDER_UPDATE` to iframe → preview re-renders
3. Auto-save debounce picks it up within 2 seconds

### ✅ FIX #9 — Variant Thumbnail Generation Plan

**Reality check:** 6 variants × 23 section types = 138 PNGs needed. This is 2–3 days of work alone. Phased approach:

**Phase 3a (MVP — CSS-based thumbnails, 0 PNGs needed):**
Instead of PNG screenshots, render each variant as a tiny CSS-only thumbnail directly in React:

```typescript
// Replace img thumbnails with CSS mini-previews — no file generation needed
const VARIANT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  default:       { bg: 'bg-white',        text: 'text-gray-900', border: 'border-gray-200' },
  dark:          { bg: 'bg-gray-900',     text: 'text-white',    border: 'border-gray-700' },
  glassmorphism: { bg: 'bg-white/20',     text: 'text-white',    border: 'border-white/30' },
  neubrutalist:  { bg: 'bg-yellow-300',   text: 'text-black',    border: 'border-black' },
  gradient:      { bg: 'bg-gradient-to-r from-blue-500 to-purple-500', text: 'text-white', border: 'border-transparent' },
  minimal:       { bg: 'bg-gray-50',      text: 'text-gray-500', border: 'border-gray-100' },
};

// In VariantPicker — replace <img> with styled div:
<div className={`w-full h-14 ${VARIANT_COLORS[variant.id].bg} flex items-center justify-center`}>
  <div className={`w-3/4 h-2 rounded ${VARIANT_COLORS[variant.id].text === 'text-white' ? 'bg-white/60' : 'bg-gray-400/40'}`} />
</div>
```

**Phase 3b (Post-launch — real PNGs via automated Playwright script):**
```bash
# apps/web/scripts/generate-variant-thumbnails.mjs
# Auto-generates all 138 PNGs in one run
const SECTION_TYPES = ['hero','features','cta','testimonials']; // start with 4
const VARIANTS = ['default','dark','glassmorphism','neubrutalist','gradient','minimal'];
for (const type of SECTION_TYPES) {
  for (const variant of VARIANTS) {
    await page.goto(`http://localhost:5173/preview/section/${type}?variant=${variant}`);
    await page.screenshot({ path: `public/variants/${type}-${variant}.png`, clip: { x:0, y:0, width:300, height:180 } });
  }
}
```

For production, variant PNGs are uploaded to R2 and served via `images.ozzyl.com`.

### Acceptance Criteria Phase 3
- [ ] VariantPicker visible in right Settings Panel for every section
- [ ] Clicking a variant updates the preview iframe instantly (postMessage)
- [ ] Selected variant persists on auto-save
- [ ] At least 3 variants exist for: hero, features, cta, testimonials
- [ ] Thumbnails load (or graceful fallback if missing)

---

## 10. Phase 4 — Genie Mode 2.0 (AI Bengali Copy)

**Duration**: 4–5 days | **Priority**: 🟠 High

### Goal
Carrd-inspired 5-minute onboarding wizard that generates a full landing page with real Bengali copy via Workers AI — making it the DEFAULT entry for new pages.

### User Flow

```
Step 1: "আপনার ব্যবসার ধরন কী?"
        [General Store] [Fashion] [Food] [Tech] [Services] [Beauty]

Step 2: "আপনার প্রধান পণ্য/সেবা?"
        (text input — merchant describes their product)

Step 3: "আপনার ব্র্যান্ডের টোন কেমন?"
        [Professional] [Friendly] [Luxurious] [Playful]

Step 4: "আপনার লক্ষ্য কী?"
        [Order পাওয়া] [Lead Collect করা] [Brand Awareness] [Product Launch]

Step 5: "আপনার স্টোরের নাম ও যোগাযোগ"
        (storeName, phone, area — pre-filled from store data)

→ [🧞 আমার পেজ তৈরি করো!] button

→ AI generates → Page created with Bengali copy → Opens in editor
```

### `GenieWizard` Component

```typescript
// apps/web/app/components/builder/GenieWizard.tsx
import { useState } from 'react';
import { useFetcher } from '@remix-run/react';

interface GenieIntent {
  industry: 'general' | 'fashion' | 'food' | 'tech' | 'services' | 'beauty';
  productDescription: string;
  tone: 'professional' | 'friendly' | 'luxurious' | 'playful';
  goal: 'orders' | 'leads' | 'awareness' | 'launch';
  storeName: string;
  phone?: string;
}

export function GenieWizard({ storeData, onComplete }: GenieWizardProps) {
  const [step, setStep] = useState(1);
  const [intent, setIntent] = useState<Partial<GenieIntent>>({
    storeName: storeData.name,
    phone: storeData.phone,
  });
  const fetcher = useFetcher();
  const isGenerating = fetcher.state !== 'idle';

  function handleSubmit() {
    fetcher.submit(
      { intent: JSON.stringify(intent) },
      { method: 'POST', action: '/app/new-builder/genie' }
    );
  }

  // When AI completes, redirect to new page editor
  useEffect(() => {
    if (fetcher.data?.pageId) {
      onComplete(fetcher.data.pageId);
    }
  }, [fetcher.data]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-full max-w-lg p-8 bg-gray-900 rounded-2xl border border-gray-700">
        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full transition-colors
              ${s <= step ? 'bg-blue-500' : 'bg-gray-700'}`} />
          ))}
        </div>

        {/* Step content — each step conditionally rendered */}
        {step === 1 && <IndustryStep value={intent.industry} onChange={v => setIntent(p => ({...p, industry: v}))} />}
        {step === 2 && <ProductStep value={intent.productDescription} onChange={v => setIntent(p => ({...p, productDescription: v}))} />}
        {step === 3 && <ToneStep value={intent.tone} onChange={v => setIntent(p => ({...p, tone: v}))} />}
        {step === 4 && <GoalStep value={intent.goal} onChange={v => setIntent(p => ({...p, goal: v}))} />}
        {step === 5 && <StoreInfoStep value={intent} onChange={v => setIntent(p => ({...p, ...v}))} />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)} className="text-gray-400 hover:text-white">
              ← পেছনে
            </button>
          )}
          {step < 5 ? (
            <button onClick={() => setStep(s => s + 1)}
              className="ml-auto bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg">
              পরবর্তী →
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isGenerating}
              className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
              {isGenerating ? '🧞 তৈরি হচ্ছে...' : '🧞 আমার পেজ তৈরি করো!'}
            </button>
          )}
        </div>

        {/* AI streaming progress */}
        {isGenerating && (
          <div className="mt-4 text-center text-sm text-blue-400 animate-pulse">
            AI আপনার জন্য Bengali কপি লিখছে...
          </div>
        )}
      </div>
    </div>
  );
}
```

### `app.new-builder.genie.tsx` — Server Action

```typescript
// apps/web/app/routes/app.new-builder.genie.tsx
import { redirect } from '@remix-run/cloudflare';
import { generateBengaliCopy } from '~/lib/page-builder/ai-copy.server';
import { getOptimalSectionsForGoal } from '~/lib/page-builder/templates';

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const ai = context.cloudflare.env.AI;

  const formData = await request.formData();
  const intent: GenieIntent = JSON.parse(formData.get('intent') as string);

  // 1. Determine optimal section types for this goal
  const sectionTypes = getOptimalSectionsForGoal(intent.goal, intent.industry);

  // 2. Generate Bengali copy via Workers AI
  const aiCopy = await generateBengaliCopy(ai, intent);

  // 3. Create page in D1
  const pageId = crypto.randomUUID().slice(0, 16);

  // ✅ FIX #6: Slug collision — use crypto random suffix, handle unique constraint violation
  const randomSuffix = crypto.randomUUID().slice(0, 8);
  const baseSlug = `${store.slug}-landing-${randomSuffix}`;

  // Verify slug is unique (D1 unique index will also enforce, but give friendly error)
  const existing = await context.cloudflare.env.DB
    .prepare('SELECT id FROM builder_pages WHERE store_id = ? AND slug = ?')
    .bind(store.id, baseSlug).first();
  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  await db.prepare(`
    INSERT INTO builder_pages (id, store_id, title, slug, template_id, status)
    VALUES (?, ?, ?, ?, 'genie', 'draft')
  `).bind(pageId, store.id, `${intent.storeName} Landing Page`, slug).run();

  // 4. Insert sections with AI-generated Bengali props (D1 batch)
  const sectionInserts = sectionTypes.map((type, idx) => {
    const props = aiCopy[type] ?? {};
    return db.prepare(`
      INSERT INTO builder_sections (id, page_id, store_id, section_type, position, draft_props_json)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID().slice(0, 16),
      pageId, store.id, type, idx,
      JSON.stringify(props)
    );
  });

  await db.batch(sectionInserts);

  // 5. Redirect to editor
  return redirect(`/app/new-builder/${pageId}`);
}
```

### `ai-copy.server.ts` — Workers AI Bengali Generator

```typescript
// apps/web/app/lib/page-builder/ai-copy.server.ts

export async function generateBengaliCopy(
  ai: Ai,
  intent: GenieIntent
): Promise<Record<string, Record<string, string>>> {
  const prompt = buildGeniePrompt(intent);

  // ✅ FIX #10: Bengali AI quality — test both models, use qwen2.5 as primary (better multilingual)
  // Fallback chain: qwen2.5-7b → llama-3.1-8b → curated Bengali template defaults
  // IMPORTANT: Test Bengali output quality before launch with real merchant data!
  let response;
  try {
    response = await ai.run('@cf/qwen/qwen2.5-7b-instruct', {
      messages: [
        { role: 'system', content: `তুমি একজন দক্ষ বাংলাদেশি ই-কমার্স কপিরাইটার। সবসময় বাংলায় লেখো।` },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });
  } catch {
    // Fallback to llama if qwen unavailable
    response = await ai.run('@cf/meta/llama-3.1-8b-instruct', {
    messages: [
      {
        role: 'system',
        content: `You are an expert Bangladeshi e-commerce copywriter. 
Generate compelling Bengali (বাংলা) marketing copy for landing pages.
Always respond in valid JSON format with Bengali text values.
Use natural, conversational Bengali — not formal or stiff language.
Include relevant emojis. Keep headlines short and punchy.`,
      },
      { role: 'user', content: prompt },
    ],
    max_tokens: 1500,
    temperature: 0.7,
  });

  // ✅ FIX #3: Validate AI output with Zod — never return silent empty object
  const AICopySchema = z.object({
    hero: z.object({
      headline: z.string().default('আমাদের পণ্য দেখুন'),
      subheadline: z.string().default('সেরা মানের পণ্য, সেরা দামে'),
      ctaText: z.string().default('এখনই অর্ডার করুন'),
      badgeText: z.string().default('বিশেষ অফার'),
    }).optional(),
    features: z.object({
      heading: z.string().default('আমাদের বিশেষত্ব'),
      items: z.array(z.string()).default(['দ্রুত ডেলিভারি', 'সেরা মান', 'সহজ রিটার্ন']),
    }).optional(),
    testimonials: z.object({
      heading: z.string().default('আমাদের খুশি গ্রাহকরা'),
      items: z.array(z.object({
        name: z.string(),
        text: z.string(),
        rating: z.number().min(1).max(5).default(5),
      })).default([{ name: 'রহিম', text: 'অসাধারণ পণ্য!', rating: 5 }]),
    }).optional(),
    cta: z.object({
      heading: z.string().default('আজই শুরু করুন'),
      subheading: z.string().default('সীমিত সময়ের অফার'),
      buttonText: z.string().default('অর্ডার করুন'),
    }).optional(),
  });

  try {
    const raw = JSON.parse(response.response ?? '{}');
    const validated = AICopySchema.safeParse(raw);
    if (validated.success) return validated.data as Record<string, Record<string, unknown>>;
    // Partial parse failed — log and use defaults
    console.error('AI copy validation failed:', validated.error.flatten());
    return AICopySchema.parse({}); // Returns all defaults
  } catch {
    console.error('AI response parse failed, using Bengali defaults');
    return AICopySchema.parse({}); // Always returns meaningful Bengali defaults
  }
}

function buildGeniePrompt(intent: GenieIntent): string {
  return `
Generate Bengali landing page copy for:
- Business: ${intent.storeName}
- Industry: ${intent.industry}
- Product/Service: ${intent.productDescription}
- Tone: ${intent.tone}
- Goal: ${intent.goal}

Return JSON with this structure:
{
  "hero": {
    "headline": "...",
    "subheadline": "...",
    "ctaText": "...",
    "badgeText": "..."
  },
  "features": {
    "heading": "...",
    "items": ["feature 1", "feature 2", "feature 3"]
  },
  "testimonials": {
    "heading": "...",
    "items": [
      { "name": "...", "text": "...", "rating": 5 }
    ]
  },
  "cta": {
    "heading": "...",
    "subheading": "...",
    "buttonText": "..."
  }
}

All text values MUST be in Bengali (বাংলা script). Be persuasive and conversion-focused.
`;
}

// Rate limiting: max 10 AI requests per store per hour
export async function checkAiRateLimit(kv: KVNamespace, storeId: number): Promise<boolean> {
  const key = `ratelimit:ai:${storeId}:${Math.floor(Date.now() / 3_600_000)}`;
  const count = parseInt((await kv.get(key)) ?? '0');
  if (count >= 10) return false;
  await kv.put(key, String(count + 1), { expirationTtl: 3600 });
  return true;
}
```

### Acceptance Criteria Phase 4
- [ ] Genie wizard shows as default modal when clicking "Create Page"
- [ ] All 5 steps complete, form validates before proceeding
- [ ] Workers AI call succeeds and returns Bengali text
- [ ] Rate limit: 10 AI calls / store / hour enforced via KV
- [ ] Page created in D1 with AI-generated props in sections
- [ ] Fallback to English defaults if AI fails (no broken page)
- [ ] Total Genie flow < 30 seconds from submit to editor open

---

## 11. Phase 5 — 6-Template Gallery

**Duration**: 3–4 days | **Priority**: 🟠 High

### Goal
Give merchants a curated gallery of 6 industry-specific templates with conversion-score badges and visual thumbnails — inspired by Unbounce's template picker.

### The 6 Launch Templates

| # | ID | Name | Industry | Primary Color | Conversion Focus |
|---|-----|------|----------|---------------|-----------------|
| 1 | `general-store` | General Store | All-purpose | `#4F46E5` Indigo | Products + orders |
| 2 | `fashion` | Fashion & Clothing | Apparel | `#1a1a1a` Black | Lifestyle imagery |
| 3 | `food-restaurant` | Food & Restaurant | Food/Beverage | `#EA580C` Orange | Menu + order CTA |
| 4 | `tech-electronics` | Tech & Electronics | Gadgets | `#0EA5E9` Sky Blue | Specs + comparison |
| 5 | `services-agency` | Services & Agency | B2B/Services | `#7C3AED` Purple | Lead capture form |
| 6 | `beauty-cosmetics` | Beauty & Cosmetics | Beauty | `#DB2777` Pink | Before/after + luxury |

### Template Definition Schema

```typescript
// apps/web/app/lib/page-builder/templates.ts

export interface LaunchTemplate {
  id: string;
  name: string;             // English name
  nameBn: string;           // Bengali name
  description: string;
  thumbnail: string;        // R2/CDN URL to preview image
  industry: string;
  goal: 'orders' | 'leads' | 'awareness';
  conversionScore: number;  // 1–100 score from industry benchmarks
  colors: { primary: string; accent: string; bg: string };
  sections: TemplateSectionDef[];
  tags: string[];
}

export const LAUNCH_TEMPLATES: LaunchTemplate[] = [
  {
    id: 'general-store',
    name: 'General Store',
    nameBn: 'জেনেরাল স্টোর',
    description: 'যেকোনো পণ্যের জন্য সেরা অল-পারপাস ল্যান্ডিং পেজ',
    thumbnail: '/templates/general-store.png',
    industry: 'general',
    goal: 'orders',
    conversionScore: 78,
    colors: { primary: '#4F46E5', accent: '#F59E0B', bg: '#ffffff' },
    tags: ['all-purpose', 'products', 'orders'],
    sections: [
      { type: 'header',           variant: 'default', props: {} },
      { type: 'hero',             variant: 'default', props: { ctaText: 'এখনই অর্ডার করুন' } },
      { type: 'trust-badges',     variant: 'default', props: {} },
      { type: 'product-grid',     variant: 'default', props: {} },
      { type: 'benefits',         variant: 'default', props: {} },
      { type: 'testimonials',     variant: 'default', props: {} },
      { type: 'faq',              variant: 'default', props: {} },
      { type: 'cta',              variant: 'default', props: {} },
      { type: 'footer',           variant: 'default', props: {} },
    ],
  },
  {
    id: 'fashion',
    name: 'Fashion & Clothing',
    nameBn: 'ফ্যাশন ও পোশাক',
    description: 'লাইফস্টাইল ইমেজারি এবং মিনিমাল ডিজাইনে ফ্যাশন ব্র্যান্ড',
    thumbnail: '/templates/fashion.png',
    industry: 'fashion',
    goal: 'orders',
    conversionScore: 82,
    colors: { primary: '#1a1a1a', accent: '#c9a961', bg: '#fafaf9' },
    tags: ['fashion', 'clothing', 'luxury', 'lifestyle'],
    sections: [
      { type: 'header',           variant: 'minimal',       props: {} },
      { type: 'hero',             variant: 'dark',          props: { ctaText: 'কালেকশন দেখুন' } },
      { type: 'showcase',         variant: 'default',       props: {} },
      { type: 'product-grid',     variant: 'minimal',       props: {} },
      { type: 'testimonials',     variant: 'minimal',       props: {} },
      { type: 'cta',              variant: 'dark',          props: {} },
      { type: 'footer',           variant: 'minimal',       props: {} },
    ],
  },
  {
    id: 'food-restaurant',
    name: 'Food & Restaurant',
    nameBn: 'খাবার ও রেস্টুরেন্ট',
    description: 'উষ্ণ রং, মেনু সেকশন এবং অর্ডার CTA সহ ফুড বিজনেস',
    thumbnail: '/templates/food-restaurant.png',
    industry: 'food',
    goal: 'orders',
    conversionScore: 85,
    colors: { primary: '#EA580C', accent: '#FCD34D', bg: '#fffbeb' },
    tags: ['food', 'restaurant', 'delivery', 'menu'],
    sections: [
      { type: 'header',           variant: 'default',       props: {} },
      { type: 'hero',             variant: 'gradient',      props: { ctaText: 'এখনই অর্ডার করুন 🍔' } },
      { type: 'trust-badges',     variant: 'default',       props: {} },
      { type: 'showcase',         variant: 'default',       props: {} },
      { type: 'how-to-order',     variant: 'default',       props: {} },
      { type: 'testimonials',     variant: 'default',       props: {} },
      { type: 'delivery',         variant: 'default',       props: {} },
      { type: 'contact',          variant: 'default',       props: {} },
      { type: 'footer',           variant: 'default',       props: {} },
    ],
  },
  {
    id: 'tech-electronics',
    name: 'Tech & Electronics',
    nameBn: 'টেক ও ইলেকট্রনিক্স',
    description: 'ফিচার কমপেরিজন, স্পেক সেকশন সহ গ্যাজেট পেজ',
    thumbnail: '/templates/tech-electronics.png',
    industry: 'tech',
    goal: 'orders',
    conversionScore: 80,
    colors: { primary: '#0EA5E9', accent: '#8B5CF6', bg: '#0f172a' },
    tags: ['tech', 'gadgets', 'electronics', 'specs'],
    sections: [
      { type: 'header',           variant: 'dark',          props: {} },
      { type: 'hero',             variant: 'glassmorphism', props: { ctaText: 'এখনই কিনুন ⚡' } },
      { type: 'trust-badges',     variant: 'glow',          props: {} },
      { type: 'features',         variant: 'dark',          props: {} },
      { type: 'comparison',       variant: 'dark',          props: {} },
      { type: 'guarantee',        variant: 'dark',          props: {} },
      { type: 'testimonials',     variant: 'dark',          props: {} },
      { type: 'faq',              variant: 'dark',          props: {} },
      { type: 'cta',              variant: 'gradient',      props: {} },
      { type: 'footer',           variant: 'dark',          props: {} },
    ],
  },
  {
    id: 'services-agency',
    name: 'Services & Agency',
    nameBn: 'সার্ভিস ও এজেন্সি',
    description: 'লিড ক্যাপচার ফর্ম, টেস্টিমোনিয়াল এবং টিম সেকশন সহ',
    thumbnail: '/templates/services-agency.png',
    industry: 'services',
    goal: 'leads',
    conversionScore: 88,
    colors: { primary: '#7C3AED', accent: '#F59E0B', bg: '#fafafa' },
    tags: ['services', 'agency', 'leads', 'b2b'],
    sections: [
      { type: 'header',           variant: 'default',       props: {} },
      { type: 'hero',             variant: 'gradient',      props: { ctaText: 'ফ্রি কনসালটেশন নিন' } },
      { type: 'problem-solution', variant: 'default',       props: {} },
      { type: 'features',         variant: 'default',       props: {} },
      { type: 'stats',            variant: 'default',       props: {} },
      { type: 'testimonials',     variant: 'default',       props: {} },
      { type: 'contact',          variant: 'default',       props: {} },
      { type: 'footer',           variant: 'default',       props: {} },
    ],
  },
  {
    id: 'beauty-cosmetics',
    name: 'Beauty & Cosmetics',
    nameBn: 'বিউটি ও কসমেটিক্স',
    description: 'লাক্সারি ফিল, ইনগ্রেডিয়েন্ট সেকশন এবং বিফোর/আফটার',
    thumbnail: '/templates/beauty-cosmetics.png',
    industry: 'beauty',
    goal: 'orders',
    conversionScore: 83,
    colors: { primary: '#DB2777', accent: '#F9A8D4', bg: '#fff7fb' },
    tags: ['beauty', 'cosmetics', 'skincare', 'luxury'],
    sections: [
      { type: 'header',           variant: 'minimal',       props: {} },
      { type: 'hero',             variant: 'gradient',      props: { ctaText: 'এখনই কিনুন ✨' } },
      { type: 'trust-badges',     variant: 'default',       props: {} },
      { type: 'benefits',         variant: 'default',       props: {} },
      { type: 'showcase',         variant: 'default',       props: {} },
      { type: 'guarantee',        variant: 'default',       props: {} },
      { type: 'testimonials',     variant: 'default',       props: {} },
      { type: 'cta',              variant: 'gradient',      props: {} },
      { type: 'footer',           variant: 'minimal',       props: {} },
    ],
  },
];
```

### `TemplateGallery` Component

```typescript
// apps/web/app/components/builder/TemplateGallery.tsx
export function TemplateGallery({ onSelectTemplate, onStartGenie }: TemplateGalleryProps) {
  const [filter, setFilter] = useState<string>('all');

  const industries = ['all', 'general', 'fashion', 'food', 'tech', 'services', 'beauty'];
  const filtered = LAUNCH_TEMPLATES.filter(t =>
    filter === 'all' || t.industry === filter
  );

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header with Genie CTA */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">পেজ শুরু করুন</h1>
          <p className="text-gray-400">টেমপ্লেট বেছে নিন অথবা AI দিয়ে তৈরি করুন</p>
          <button onClick={onStartGenie}
            className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
            🧞 Genie Mode — AI দিয়ে তৈরি করুন (প্রস্তাবিত)
          </button>
        </div>

        {/* Industry filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {industries.map(ind => (
            <button key={ind} onClick={() => setFilter(ind)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors
                ${filter === ind ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
              {ind === 'all' ? 'সব টেমপ্লেট' : ind}
            </button>
          ))}
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(template => (
            <div key={template.id} className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden hover:border-gray-500 transition-colors group">
              {/* Thumbnail */}
              <div className="relative">
                <img src={template.thumbnail} alt={template.name}
                  className="w-full h-44 object-cover" />
                {/* Conversion score badge */}
                <div className="absolute top-3 right-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {template.conversionScore}% Conversion
                </div>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: template.colors.primary }} />
                  <h3 className="font-semibold text-white">{template.nameBn}</h3>
                </div>
                <p className="text-xs text-gray-400 mb-3">{template.description}</p>
                <div className="flex gap-1 mb-4 flex-wrap">
                  {template.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <button onClick={() => onSelectTemplate(template.id)}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                  এই টেমপ্লেট ব্যবহার করুন →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Template Instantiation (Clone to New Page)

When a merchant selects a template, clone its sections into a new `builder_pages` row:

```typescript
// In the action for app.new-builder.templates.tsx
export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const db = context.cloudflare.env.DB;
  const formData = await request.formData();
  const templateId = formData.get('templateId') as string;

  const template = LAUNCH_TEMPLATES.find(t => t.id === templateId);
  if (!template) return json({ error: 'Template not found' }, { status: 404 });

  const pageId = crypto.randomUUID().slice(0, 16);
  const slug = `${store.slug}-${templateId}-${Date.now()}`;

  // Create page + batch insert sections
  const inserts = [
    db.prepare(`INSERT INTO builder_pages (id, store_id, title, slug, template_id, status) VALUES (?,?,?,?,?,'draft')`)
      .bind(pageId, store.id, template.name, slug, templateId),
    ...template.sections.map((s, idx) =>
      db.prepare(`INSERT INTO builder_sections (id, page_id, store_id, section_type, position, variant, draft_props_json) VALUES (?,?,?,?,?,?,?)`)
        .bind(
          crypto.randomUUID().slice(0, 16),
          pageId, store.id, s.type, idx, s.variant,
          JSON.stringify(s.props)
        )
    ),
  ];

  await db.batch(inserts);
  return redirect(`/app/new-builder/${pageId}`);
}
```

### Acceptance Criteria Phase 5
- [ ] All 6 templates render in gallery with thumbnails and conversion score badges
- [ ] Industry filter tabs work correctly
- [ ] "Use This Template" clones sections into a new page and opens editor
- [ ] Genie Mode CTA button is prominently featured above template grid
- [ ] Template sections use correct variants (dark for tech, minimal for fashion, etc.)

---

## 12. Phase 6 — Custom D1 Analytics

**Duration**: 4–5 days | **Priority**: 🟡 Medium

### Goal
Build a zero-dependency analytics system using D1. Track page views, CTA clicks, scroll depth, and section engagement. Display results in a simple merchant dashboard. No Plausible, no GA — 100% data ownership.

### Analytics Event Types

| Event | Trigger | Data |
|-------|---------|------|
| `view` | Page load | device_type, country, referrer |
| `scroll_50` | 50% scroll depth | session_id |
| `scroll_75` | 75% scroll depth | session_id |
| `scroll_100` | 100% scroll depth | session_id |
| `cta_click` | CTA button click | section_id, button_text |
| `section_view` | Section enters viewport | section_id, section_type |
| `click` | Any link/button click | element, href |

### ✅ FIX #2 — Analytics Endpoint Auth & Rate Limiting

The analytics endpoint is called from **public pages** (no session cookie). Protect it with:

1. **Origin check** — only accept requests from known store domains
2. **Signed pageId token** — embed a HMAC-signed token in the injected JS snippet
3. **KV-based rate limiting** — max 100 events per session per minute

```typescript
// apps/web/app/routes/api.builder.analytics.ts
const RATE_LIMIT_WINDOW = 60;    // seconds
const RATE_LIMIT_MAX    = 100;   // events per window per session

export async function action({ request, context }: ActionFunctionArgs) {
  const { KV } = context.cloudflare.env;

  const body = await request.json();
  const { pageId, sessionId, eventType, token } = AnalyticsEventSchema.parse(body);

  // ✅ Rate limit by sessionId — prevent event flooding
  const rateLimitKey = `analytics:rl:${sessionId}`;
  const current = parseInt(await KV.get(rateLimitKey) ?? '0');
  if (current >= RATE_LIMIT_MAX) {
    return json({ success: false, error: 'rate_limited' }, { status: 429 });
  }
  await KV.put(rateLimitKey, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });

  // ✅ Verify HMAC token — pageId was signed server-side when page was published
  const expectedToken = await signPageToken(pageId, context.cloudflare.env.JWT_SECRET);
  if (token !== expectedToken) {
    return json({ success: false, error: 'invalid_token' }, { status: 403 });
  }

  // Safe to write analytics event
  // ... (insert to D1 page_analytics table)
}
```

---

### Analytics JS Snippet (Injected into Published Pages)

```javascript
// Injected into published page <head> via publisher.server.ts
// Lightweight — no external dependencies, ~2KB

(function() {
  const PAGE_ID = '__PAGE_ID__';        // replaced at publish time
  const STORE_ID = '__STORE_ID__';      // replaced at publish time
  const API = '/api/builder/analytics';

  // Session ID: stored in sessionStorage
  const sessionId = sessionStorage.getItem('_oz_sid') || (() => {
    const id = Math.random().toString(36).slice(2, 11);
    sessionStorage.setItem('_oz_sid', id);
    return id;
  })();

  const device = window.innerWidth < 768 ? 'mobile'
               : window.innerWidth < 1024 ? 'tablet' : 'desktop';

  function track(eventType, extra = {}) {
    navigator.sendBeacon(API, JSON.stringify({
      pageId: PAGE_ID,
      storeId: STORE_ID,
      sessionId,
      eventType,
      deviceType: device,
      referrer: document.referrer || null,
      ...extra,
    }));
  }

  // Page view
  track('view');

  // Scroll depth
  const scrolled = { 50: false, 75: false, 100: false };
  window.addEventListener('scroll', () => {
    const pct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    if (!scrolled[50] && pct >= 50)  { scrolled[50] = true;  track('scroll_50'); }
    if (!scrolled[75] && pct >= 75)  { scrolled[75] = true;  track('scroll_75'); }
    if (!scrolled[100] && pct >= 100){ scrolled[100] = true; track('scroll_100'); }
  }, { passive: true });

  // CTA click tracking
  document.querySelectorAll('[data-track-cta]').forEach(el => {
    el.addEventListener('click', () => {
      track('cta_click', {
        sectionId: el.closest('[data-section-id]')?.dataset.sectionId,
        metadata: JSON.stringify({ text: el.textContent?.trim() }),
      });
    });
  });

  // Intersection Observer for section_view
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        track('section_view', {
          sectionId: entry.target.dataset.sectionId,
          metadata: JSON.stringify({ type: entry.target.dataset.sectionType }),
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('[data-section-id]').forEach(el => observer.observe(el));
})();
```

### `/api/builder/analytics` Endpoint

```typescript
// apps/web/app/routes/api.builder.analytics.ts
import { z } from 'zod';

const AnalyticsEventSchema = z.object({
  pageId:     z.string(),
  storeId:    z.number(),
  eventType:  z.enum(['view','click','cta_click','scroll_50','scroll_75','scroll_100','section_view']),
  sessionId:  z.string().max(32),
  sectionId:  z.string().optional(),
  deviceType: z.enum(['mobile','tablet','desktop']).optional(),
  referrer:   z.string().url().optional().or(z.null()),
  metadata:   z.string().optional(),
});

export async function action({ request, context }: ActionFunctionArgs) {
  // No auth required — public endpoint for published pages
  const body = await request.json().catch(() => null);
  const parsed = AnalyticsEventSchema.safeParse(body);
  if (!parsed.success) return new Response(null, { status: 204 });

  const ev = parsed.data;
  const db = context.cloudflare.env.DB;

  // Verify page belongs to the claimed store_id (multi-tenancy guard)
  const page = await db.prepare(
    'SELECT id FROM builder_pages WHERE id = ? AND store_id = ?'
  ).bind(ev.pageId, ev.storeId).first();

  if (!page) return new Response(null, { status: 204 });

  // Insert analytics event
  await db.prepare(`
    INSERT INTO page_analytics
      (id, page_id, store_id, event_type, section_id, session_id, device_type, referrer, metadata)
    VALUES (lower(hex(randomblob(8))), ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    ev.pageId, ev.storeId, ev.eventType, ev.sectionId ?? null,
    ev.sessionId, ev.deviceType ?? null, ev.referrer ?? null, ev.metadata ?? null
  ).run();

  return new Response(null, { status: 204 });
}
```

### Analytics Dashboard Queries

```typescript
// apps/web/app/lib/page-builder/analytics.server.ts

// Total views and unique sessions for a page (last 30 days)
export async function getPageStats(db: D1Database, pageId: string, storeId: number) {
  const session = db.withSession('first-unconstrained');

  const [views, ctaClicks, scrollDepth, deviceBreakdown] = await db.batch([
    // Total views + unique sessions
    db.prepare(`
      SELECT COUNT(*) as total_views,
             COUNT(DISTINCT session_id) as unique_visitors
      FROM page_analytics
      WHERE page_id = ? AND store_id = ? AND event_type = 'view'
        AND created_at >= datetime('now', '-30 days')
    `).bind(pageId, storeId),

    // CTA click-through rate
    db.prepare(`
      SELECT COUNT(DISTINCT session_id) as cta_clicks
      FROM page_analytics
      WHERE page_id = ? AND store_id = ? AND event_type = 'cta_click'
        AND created_at >= datetime('now', '-30 days')
    `).bind(pageId, storeId),

    // Scroll depth completion
    db.prepare(`
      SELECT
        SUM(CASE WHEN event_type = 'scroll_50' THEN 1 ELSE 0 END) as reached_50,
        SUM(CASE WHEN event_type = 'scroll_75' THEN 1 ELSE 0 END) as reached_75,
        SUM(CASE WHEN event_type = 'scroll_100' THEN 1 ELSE 0 END) as reached_100
      FROM page_analytics
      WHERE page_id = ? AND store_id = ?
        AND created_at >= datetime('now', '-30 days')
    `).bind(pageId, storeId),

    // Device breakdown
    db.prepare(`
      SELECT device_type, COUNT(DISTINCT session_id) as count
      FROM page_analytics
      WHERE page_id = ? AND store_id = ? AND event_type = 'view'
        AND created_at >= datetime('now', '-30 days')
      GROUP BY device_type
    `).bind(pageId, storeId),
  ]);

  return { views, ctaClicks, scrollDepth, deviceBreakdown };
}

// Daily views for chart (last 14 days)
export async function getDailyViews(db: D1Database, pageId: string, storeId: number) {
  return db.prepare(`
    SELECT date(created_at) as day, COUNT(*) as views
    FROM page_analytics
    WHERE page_id = ? AND store_id = ? AND event_type = 'view'
      AND created_at >= datetime('now', '-14 days')
    GROUP BY date(created_at)
    ORDER BY day ASC
  `).bind(pageId, storeId).all();
}
```

### Acceptance Criteria Phase 6
- [ ] Analytics snippet injected into every published page
- [ ] `view` event fires on page load (verified in D1)
- [ ] Scroll depth events fire at 50%, 75%, 100%
- [ ] CTA clicks tracked with `data-track-cta` attribute
- [ ] Analytics dashboard shows total views, unique visitors, CTR
- [ ] Daily views chart renders for last 14 days
- [ ] Multi-tenancy guard: events rejected if page_id/store_id mismatch

---

## 13. Phase 7 — Static KV Publishing

**Duration**: 3–4 days | **Priority**: 🟡 Medium

### Goal
Published pages serve from Cloudflare KV — delivering sub-100ms TTFB globally. No database reads on public page load.

### Publish Flow

```
Merchant clicks "Publish"
        │
        ▼
POST /api/builder/publish
        │
        ├─ 1. Read all sections from D1 (draft_props_json)
        │
        ├─ 2. Validate all props via Zod schemas
        │
        ├─ 3. Copy draft_props_json → published_props_json in D1
        │
        ├─ 4. Save page revision snapshot to page_revisions
        │
        ├─ 5. Render full page JSON → store in KV:
        │       key: page:{storeId}:{slug}
        │       value: { sections, metadata, publishedAt }
        │       TTL: 300s (5 minutes)
        │
        ├─ 6. Update builder_pages.status = 'published'
        │      Update builder_pages.published_at = NOW()
        │
        └─ 7. Return { success: true, publicUrl }
```

### `/api/builder/publish` Endpoint

```typescript
// apps/web/app/routes/api.builder.publish.ts
import { builderSections, builderPages, pageRevisions } from '@db/schema-builder';
import { publishPageToKV } from '~/lib/page-builder/publisher.server';

export async function action({ request, context }: ActionFunctionArgs) {
  const { store } = await requireAuth(request, context);
  const { DB, KV } = context.cloudflare.env;
  const db = drizzle(DB);

  const formData = await request.formData();
  const pageId = z.string().parse(formData.get('pageId'));

  // 1. Fetch page — enforce store_id
  const page = await db.select().from(builderPages)
    .where(and(eq(builderPages.id, pageId), eq(builderPages.storeId, store.id)))
    .get();

  if (!page) return json({ error: 'Page not found' }, { status: 404 });

  // 2. Fetch all sections
  const sections = await db.select().from(builderSections)
    .where(and(
      eq(builderSections.pageId, pageId),
      eq(builderSections.storeId, store.id),
      eq(builderSections.isHidden, false),
    ))
    .orderBy(builderSections.position);

  // 3. Validate all section props via registry schemas
  const validatedSections = sections.map(s => {
    const entry = SECTION_REGISTRY[s.sectionType as SectionType];
    const rawProps = JSON.parse(s.draftPropsJson);
    const validated = entry?.schema.safeParse(rawProps);
    return {
      ...s,
      props: validated?.success ? validated.data : rawProps,
    };
  });

  // 4. D1 batch: copy draft → published, update page status
  const now = new Date().toISOString();
  await db.batch([
    ...validatedSections.map(s =>
      db.update(builderSections)
        .set({ publishedPropsJson: JSON.stringify(s.props), updatedAt: now })
        .where(eq(builderSections.id, s.id))
    ),
    db.update(builderPages)
      .set({ status: 'published', publishedAt: now, updatedAt: now })
      .where(eq(builderPages.id, pageId)),
    db.insert(pageRevisions).values({
      id: crypto.randomUUID().slice(0, 16),
      pageId,
      storeId: store.id,
      snapshot: JSON.stringify({ sections: validatedSections, page }),
      label: `Published ${now}`,
      createdAt: now,
    }),
  ]);

  // 5. Store in KV (TTL: 5 minutes)
  await publishPageToKV(KV, store.id, page.slug, {
    page: { id: page.id, title: page.title, metaTitle: page.metaTitle, metaDescription: page.metaDescription },
    sections: validatedSections,
    publishedAt: now,
  });

  const publicUrl = `https://${store.subdomain}.ozzyl.com/${page.slug}`;
  return json({ success: true, publicUrl });
}
```

### ✅ FIX #13 — Immediate KV Cache Invalidation on Publish

KV TTL of 5 minutes means stale content for up to 5 minutes after publish. The publish endpoint **must also delete the old KV key** immediately:

```typescript
// In publisher.server.ts — publish function
export async function publishPage(db: D1Database, kv: KVNamespace, pageId: string, storeId: number) {
  const kvKey = `page:${storeId}:${slug}`;

  // ✅ FIX #13: Delete old cache FIRST — forces immediate fresh read
  await kv.delete(kvKey);

  // Then write fresh published data
  const sections = await getPublishedSections(db, pageId, storeId);
  await kv.put(kvKey, JSON.stringify(sections), { expirationTtl: 300 }); // 5 min TTL as safety net

  return { publishedAt: new Date().toISOString() };
}
```

> **Why delete first?** Even with a new `put()`, the old value may still be served for seconds due to eventual consistency across Cloudflare's edge nodes. Deleting first forces an immediate cache miss and fresh D1 read on the next visitor request.

---

### `publisher.server.ts` — KV Logic

```typescript
// apps/web/app/lib/page-builder/publisher.server.ts

const KV_PAGE_TTL = 300; // 5 minutes

export async function publishPageToKV(
  kv: KVNamespace,
  storeId: number,
  slug: string,
  payload: PublishedPagePayload
): Promise<void> {
  const key = `page:${storeId}:${slug}`;
  await kv.put(key, JSON.stringify(payload), { expirationTtl: KV_PAGE_TTL });
}

export async function getPublishedPageFromKV(
  kv: KVNamespace,
  storeId: number,
  slug: string
): Promise<PublishedPagePayload | null> {
  const key = `page:${storeId}:${slug}`;
  return kv.get<PublishedPagePayload>(key, 'json');
}

export async function invalidatePublishedPage(
  kv: KVNamespace,
  storeId: number,
  slug: string
): Promise<void> {
  const key = `page:${storeId}:${slug}`;
  await kv.delete(key);
}
```

### Public Page Route (KV-first, D1 fallback)

```typescript
// In the storefront route that handles custom slugs
export async function loader({ params, context }: LoaderFunctionArgs) {
  const { storeId } = await resolveStore(context, request);
  const { KV, DB } = context.cloudflare.env;
  const slug = params.slug;

  // 1. Try KV first (sub-100ms)
  const cached = await getPublishedPageFromKV(KV, storeId, slug);
  if (cached) return json(cached);

  // 2. Fallback: read from D1 published_props_json
  const db = drizzle(DB);
  const page = await db.select().from(builderPages)
    .where(and(
      eq(builderPages.storeId, storeId),
      eq(builderPages.slug, slug),
      eq(builderPages.status, 'published')
    )).get();

  if (!page) throw new Response('Not Found', { status: 404 });

  const sections = await db.select().from(builderSections)
    .where(and(
      eq(builderSections.pageId, page.id),
      eq(builderSections.storeId, storeId)
    ))
    .orderBy(builderSections.position);

  const payload = { page, sections: sections.map(s => ({
    ...s, props: JSON.parse(s.publishedPropsJson ?? s.draftPropsJson)
  })), publishedAt: page.publishedAt };

  // Re-cache in KV for next request
  await publishPageToKV(KV, storeId, slug, payload);

  return json(payload);
}
```

### Acceptance Criteria Phase 7
- [ ] Published pages return data from KV in < 100ms (measured via `wrangler tail`)
- [ ] KV key format: `page:{storeId}:{slug}` — verified in Cloudflare Dashboard
- [ ] Republishing invalidates old KV entry and writes fresh one
- [ ] Page revision saved to `page_revisions` on every publish
- [ ] D1 fallback works if KV entry expired
- [ ] All D1 queries scoped by `store_id` — no data leakage


---

## 14. Competitor Inspiration Map

| Competitor | Feature We Steal | Where We Implement | Notes |
|------------|-----------------|-------------------|-------|
| **Carrd** | 5-min setup wizard, opinionated defaults | Genie Mode (Phase 4) | Our version generates real Bengali copy via AI |
| **Shopify** | Clean 3-panel editor UX | Phase 2 editor layout | Section list left, preview center, settings right |
| **Framer** | Visual variant thumbnail picker | Phase 3 VariantPicker | Click thumbnail to swap visual style instantly |
| **Unbounce** | Conversion-scored templates by industry | Phase 5 Template Gallery | % score badge on each template card |
| **Wix ADI** | AI generates real content from merchant data | Phase 4 Genie + Workers AI | Uses store's actual products, name, industry |
| **Leadpages** | AI coach suggesting missing sections | Future (Phase 8) | "Add a testimonials section to boost trust +12%" |

---

## 15. API Reference

### Endpoint Summary

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| `POST` | `/api/builder/save` | ✅ Required | Auto-save section props to D1 |
| `POST` | `/api/builder/publish` | ✅ Required | Publish page to KV, copy draft→published |
| `POST` | `/api/builder/ai-copy` | ✅ Required | Generate Bengali copy via Workers AI |
| `POST` | `/api/builder/analytics` | ❌ Public | Ingest analytics events from published pages |
| `GET`  | `/app/new-builder` | ✅ Required | Builder dashboard (page list) |
| `GET`  | `/app/new-builder/:pageId` | ✅ Required | 3-panel editor |
| `GET`  | `/app/new-builder/:pageId/preview` | ✅ Required | Preview iframe content |
| `GET`  | `/app/new-builder/genie` | ✅ Required | Genie wizard UI |
| `POST` | `/app/new-builder/genie` | ✅ Required | Submit wizard, create AI page |
| `GET`  | `/app/new-builder/templates` | ✅ Required | Template gallery UI |
| `POST` | `/app/new-builder/templates` | ✅ Required | Clone template to new page |

### Zod Request Schemas

```typescript
// POST /api/builder/save
const SaveRequestSchema = z.object({
  sections: z.string().transform(s => JSON.parse(s)),  // JSON array
  intent:   z.enum(['auto-save', 'manual-save']),
});

// POST /api/builder/publish
const PublishRequestSchema = z.object({
  pageId: z.string().min(1).max(64),
});

// POST /api/builder/ai-copy
const AiCopyRequestSchema = z.object({
  intent: z.string().transform(s => JSON.parse(s) as GenieIntent),
});

// POST /api/builder/analytics (public — no auth)
const AnalyticsEventSchema = z.object({
  pageId:     z.string(),
  storeId:    z.number(),
  eventType:  z.enum(['view','click','cta_click','scroll_50','scroll_75','scroll_100','section_view']),
  sessionId:  z.string().max(32),
  sectionId:  z.string().optional(),
  deviceType: z.enum(['mobile','tablet','desktop']).optional(),
  referrer:   z.string().url().optional().nullable(),
  metadata:   z.string().max(1000).optional(),
});
```

### Error Response Format (All Endpoints)

```typescript
// Success
{ success: true, data?: any, message?: string }

// Validation error
{ success: false, errors: ZodFlattenedErrors, status: 400 }

// Auth error
{ success: false, error: 'Unauthorized', status: 401 }

// Not found
{ success: false, error: 'Not found', status: 404 }

// Server error
{ success: false, error: 'Internal error', status: 500 }
```

### KV Key Patterns

| Key Pattern | Value | TTL | Purpose |
|------------|-------|-----|---------|
| `page:{storeId}:{slug}` | `PublishedPagePayload` JSON | 300s | Published page cache |
| `ratelimit:ai:{storeId}:{hour}` | count (string) | 3600s | AI rate limiting |
| `store:{storeId}:config` | Store config JSON | 3600s | Store config cache |

---

## 16. Acceptance Criteria

### Definition of Done — Full Feature Set

```
ENTRY POINT
  [ ] /app/new-builder is the default entry (nav link updated)
  [ ] /app/page-builder redirects to /app/new-builder
  [ ] "Pro Mode (GrapesJS)" accessible via ?pro=1 param + UI button

EDITOR (Phase 2)
  [ ] 3-panel layout renders correctly at all viewport sizes
  [ ] Sections drag-reorder via dnd-kit, positions persist
  [ ] Auto-save fires exactly 2s after last change (useFetcher)
  [ ] Save status indicator: "Saving..." → "Saved" → "Draft"
  [ ] postMessage BUILDER_UPDATE updates iframe preview instantly
  [ ] Mobile / Tablet / Desktop viewport switcher functional
  [ ] Ctrl+Z undo, Ctrl+Shift+Z redo, Ctrl+S save — all working
  [ ] Settings Panel renders correct fields per section type
  [ ] Error boundary catches and displays editor errors gracefully

VARIANT PICKER (Phase 3)
  [ ] VariantPicker visible in Settings Panel for every section
  [ ] Thumbnail grid shows ≥3 variants for hero, features, cta, testimonials
  [ ] Clicking variant updates preview instantly
  [ ] Selected variant saved with auto-save

GENIE MODE (Phase 4)
  [ ] Genie Mode is the default "Create Page" flow (not template picker)
  [ ] All 5 wizard steps complete without errors
  [ ] Workers AI returns Bengali copy in < 15s
  [ ] Rate limit: max 10 AI calls per store per hour (KV-enforced)
  [ ] Full page with Bengali copy created and editor opens automatically
  [ ] English fallback if AI call fails (no broken page, no 500 error)

TEMPLATES (Phase 5)
  [ ] All 6 templates render in gallery with thumbnails
  [ ] Industry filter tabs (all / fashion / food / tech / etc.) work
  [ ] Conversion score badge visible on each template card
  [ ] "Use This Template" creates page and opens editor in < 3s
  [ ] Correct section variants applied per template (dark for tech, etc.)

ANALYTICS (Phase 6)
  [ ] Analytics JS snippet present in published page HTML <head>
  [ ] `view` event recorded in page_analytics on page load
  [ ] Scroll depth events fire at 50 / 75 / 100% thresholds
  [ ] CTA clicks tracked via data-track-cta attribute
  [ ] Analytics dashboard shows: views, unique visitors, scroll depth, device split
  [ ] Multi-tenancy guard: events with wrong store_id silently dropped (204)

PUBLISHING (Phase 7)
  [ ] Publish writes page JSON to KV key page:{storeId}:{slug}
  [ ] KV TTL is 300 seconds (verified in Cloudflare Dashboard)
  [ ] Public page load reads from KV, TTFB < 100ms
  [ ] Republish invalidates old KV entry before writing new one
  [ ] Revision saved to page_revisions on every publish
  [ ] D1 fallback works when KV entry expired

SECURITY & QUALITY
  [ ] Every DB query scoped by store_id — no cross-tenant access
  [ ] Zod validation on all API inputs (400 returned on invalid)
  [ ] No TypeScript errors (npm run typecheck passes)
  [ ] No ESLint errors (npm run lint passes)
  [ ] advanced_builder_pages + advanced_builder_sections tables dropped
  [ ] No console.error in production (structured logging only)
```

---

## 17. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Workers AI latency > 30s** | Medium | High | Set `max_tokens: 1500`, stream response, add timeout + English fallback |
| **D1 batch limit exceeded** | Low | Medium | D1 allows up to 100 statements per batch; split large batches |
| **KV TTL causes stale pages** | Low | Medium | Invalidate KV on every publish; set TTL to 300s maximum |
| **dnd-kit conflicts with iframe** | Low | Medium | Drag events should not cross iframe boundary; tested in Phase 2 |
| **postMessage origin mismatch** | Low | High | Always validate `event.origin` in preview iframe message handler |
| **store_id missing from query** | High | Critical | Code review checklist + linting rule for all builder queries |
| **AI generates inappropriate copy** | Low | Medium | Moderation prompt + manual review option in editor |
| **Template thumbnail 404** | Medium | Low | Add `onError` fallback to colored div with template name |
| **Slug collision on page create** | Low | Medium | Append `Date.now()` to slug; unique index catches duplicates |
| **Analytics beacon dropped** | Medium | Low | `navigator.sendBeacon` is best-effort; acceptable for analytics |

---

## Appendix A — Bengali Font Stack

The builder must support these Bengali fonts (all available via Google Fonts):

```typescript
// Already defined in apps/web/app/lib/page-builder/schemas.ts
export const BENGALI_FONTS = [
  'hind-siliguri',   // Most readable, UI-friendly
  'noto-sans-bengali', // Universal support
  'galada',          // Display / decorative
  'tiro-bangla',     // Serif, formal
  'mina',            // Clean, modern
  'atma',            // Display, bold
];
```

Load via Google Fonts in the preview iframe `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Noto+Sans+Bengali&family=Galada&display=swap" rel="stylesheet">
```

---

## Appendix B — Migration Checklist

Run these in order before Phase 1 goes live:

```bash
# 1. Generate migration for new analytics table
npx drizzle-kit generate:sqlite --config=packages/database/drizzle.config.ts

# 2. Apply locally
npm run db:migrate:local

# 3. Verify tables
wrangler d1 execute ozzyl-local \
  --command "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"

# 4. Confirm dead tables are gone
wrangler d1 execute ozzyl-local \
  --command "SELECT COUNT(*) FROM advanced_builder_pages;"
# Should return: "no such table" error

# 5. Confirm builder_pages and builder_sections survive
wrangler d1 execute ozzyl-local \
  --command "SELECT COUNT(*) FROM builder_pages;"
# Should return: 5 rows (prod data preserved)

# 6. Apply to production (AFTER local verification)
npm run db:migrate:prod
```

---

## Appendix C — Phase Dependency Map

```
Phase 1 (Cleanup)
    │
    ▼
Phase 2 (Editor Polish) ←── Required for Phases 3, 4, 5
    │
    ├──► Phase 3 (Variant Picker)
    │
    ├──► Phase 4 (Genie Mode 2.0) ←── Depends on Phase 5 templates for section list
    │
    ├──► Phase 5 (Template Gallery)
    │
    └──► Phase 7 (KV Publishing) ──► Phase 6 (Analytics) [analytics requires published pages]
```

**Recommended execution order**: 1 → 2 → 5 → 3 → 4 → 7 → 6

- Ship Phase 1+2 first: merchants can use the editor immediately
- Phase 5 before Phase 4: Genie needs section defaults from templates
- Phase 7 before Phase 6: analytics requires published pages to exist

---

_Document Version: 1.0_  
_Last Updated: 2026-02-24_  
_Context7 Verified: ✅ Cloudflare D1, Remix v2, Hono, Drizzle ORM, Workers AI_  
_Owner: Ozzyl Engineering_
