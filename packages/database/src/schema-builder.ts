/**
 * Builder Schema — Drizzle ORM type definitions
 *
 * Covers the five tables that power the new page builder system:
 *   1. builderPages       — page/campaign metadata          (builder_pages)
 *   2. builderSections    — ordered section instances       (builder_sections)
 *   3. pageAnalytics      — per-page conversion events      (page_analytics)  [Phase 6]
 *   4. savedBlocks        — reusable merchant block library (saved_blocks)
 *   5. pageRevisions      — full revision history per page  (page_revisions)
 *
 * Multi-tenancy: every table with user-generated content carries store_id so
 * all application queries can and must filter by store_id.
 *
 * NOTE: builderPages and builderSections are also defined (with relations) in
 * schema_page_builder.ts. This file is the canonical single-import source for
 * all five builder tables together, with no duplication of relations.
 */

import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { stores, products } from './schema';

// ============================================================================
// BUILDER PAGES — page/campaign metadata
// ============================================================================
export const builderPages = sqliteTable(
  'builder_pages',
  {
    /** UUID primary key */
    id: text('id').primaryKey(),

    /** Owning store — mandatory for multi-tenant isolation */
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    /** URL slug, unique per store */
    slug: text('slug').notNull(),

    /** Human-readable display title */
    title: text('title'),

    /** Optional featured product (for direct-checkout landing pages) */
    productId: integer('product_id').references(() => products.id, {
      onDelete: 'set null',
    }),

    /** Lifecycle status */
    status: text('status').$type<'draft' | 'published'>().default('draft'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),
    lastPublishedAt: integer('last_published_at', { mode: 'timestamp' }),

    /** Optional pre-defined layout template */
    templateId: text('template_id'),

    // ── Genie Builder (Quick Builder v2) ──────────────────────────────────
    /** Wizard intent: { productType, goal, trafficSource } */
    intentJson: text('intent_json'),
    /** Style tokens: { primaryColor, buttonStyle, fontFamily } */
    styleTokensJson: text('style_tokens_json'),

    // ── SEO ───────────────────────────────────────────────────────────────
    seoTitle: text('seo_title'),
    seoDescription: text('seo_description'),
    ogImage: text('og_image'),
    canonicalUrl: text('canonical_url'),
    noIndex: integer('no_index').default(0),

    // ── Floating contact buttons ──────────────────────────────────────────
    whatsappEnabled: integer('whatsapp_enabled').default(1),
    whatsappNumber: text('whatsapp_number'),
    whatsappMessage: text('whatsapp_message'),
    callEnabled: integer('call_enabled').default(1),
    callNumber: text('call_number'),

    // ── Floating order button ─────────────────────────────────────────────
    orderEnabled: integer('order_enabled').default(1),
    orderText: text('order_text').default('অর্ডার করুন'),
    orderBgColor: text('order_bg_color').default('#6366F1'),
    orderTextColor: text('order_text_color').default('#FFFFFF'),
    buttonPosition: text('button_position')
      .$type<'bottom-right' | 'bottom-left' | 'bottom-center'>()
      .default('bottom-right'),

    // ── Custom HTML injection ─────────────────────────────────────────────
    customHeaderHtml: text('custom_header_html'),
    customFooterHtml: text('custom_footer_html'),

    // ── Lightweight aggregate counters ────────────────────────────────────
    viewCount: integer('view_count').default(0),
    orderCount: integer('order_count').default(0),

    // ── Timestamps ────────────────────────────────────────────────────────
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => [
    index('idx_builder_pages_store').on(table.storeId),
    index('idx_builder_pages_last_published').on(
      table.storeId,
      table.lastPublishedAt
    ),
    uniqueIndex('uniq_builder_pages_slug').on(table.storeId, table.slug),
  ]
);

// ============================================================================
// BUILDER SECTIONS — ordered section instances per page
// ============================================================================
export const builderSections = sqliteTable(
  'builder_sections',
  {
    /** UUID primary key */
    id: text('id').primaryKey(),

    /** Parent page */
    pageId: text('page_id')
      .notNull()
      .references(() => builderPages.id, { onDelete: 'cascade' }),

    /** Section type maps to the section registry (e.g. 'hero', 'faq') */
    type: text('type').notNull(),

    /** Visual variant within a section type (null = default) */
    variant: text('variant'),

    /** Visibility toggle (0 = hidden, 1 = visible) */
    enabled: integer('enabled').notNull().default(1),

    /** Position within the page — must be unique per page for deterministic render */
    sortOrder: integer('sort_order').notNull(),

    // ── Draft / Publish split ─────────────────────────────────────────────
    /** Draft content — what the editor writes to */
    propsJson: text('props_json').notNull().default('{}'),
    /** Published content — what the storefront serves */
    publishedPropsJson: text('published_props_json'),
    publishedAt: integer('published_at', { mode: 'timestamp' }),

    /** Optimistic concurrency token — increment on every write */
    version: integer('version').notNull().default(1),

    // ── Timestamps ────────────────────────────────────────────────────────
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => [
    index('idx_builder_sections_order').on(table.pageId, table.sortOrder),
    index('idx_builder_sections_variant').on(table.pageId, table.variant),
  ]
);

// ============================================================================
// PAGE ANALYTICS — per-page conversion event log  [Phase 6]
// ============================================================================

export type PageAnalyticsEventType =
  | 'view'
  | 'click'
  | 'cta_click'
  | 'scroll_50'
  | 'scroll_75'
  | 'scroll_100'
  | 'section_view';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const pageAnalytics = sqliteTable(
  'page_analytics',
  {
    /** 16-char random hex id generated by SQLite: lower(hex(randomblob(8))) */
    id: text('id').primaryKey(),

    /** Page that emitted the event — scoped to store via FK chain */
    pageId: text('page_id')
      .notNull()
      .references(() => builderPages.id, { onDelete: 'cascade' }),

    /** Explicit store_id for direct multi-tenant query filtering */
    storeId: integer('store_id').notNull(),

    /** Type of interaction recorded */
    eventType: text('event_type')
      .notNull()
      .$type<PageAnalyticsEventType>(),

    /** Optional section that triggered the event */
    sectionId: text('section_id'),

    /** Anonymous browser session token */
    sessionId: text('session_id').notNull(),

    /** Detected device class */
    deviceType: text('device_type').$type<DeviceType>(),

    /** ISO 3166-1 alpha-2 country code from CF-IPCountry header */
    country: text('country'),

    /** Full referrer URL (truncated to 2048 chars by application layer) */
    referrer: text('referrer'),

    /** Event-specific payload — JSON object */
    metadata: text('metadata'),

    createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  },
  (table) => [
    // Per-page event queries used by dashboard charts
    index('idx_page_analytics_page_event').on(
      table.pageId,
      table.eventType,
      table.createdAt
    ),
    // Per-store analytics overview
    index('idx_page_analytics_store').on(table.storeId, table.createdAt),
  ]
);

// ============================================================================
// SAVED BLOCKS — reusable merchant block library
// ============================================================================
export const savedBlocks = sqliteTable(
  'saved_blocks',
  {
    /** UUID primary key */
    id: text('id').primaryKey(),

    /** Owning store */
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    /** Merchant-facing display name */
    name: text('name').notNull(),

    /** Logical category for grouping in the block picker */
    category: text('category').notNull().default('custom'),

    /** Optional description shown in the block picker */
    description: text('description'),

    /** Full block content (section type + propsJson snapshot) */
    content: text('content').notNull(),

    /** Optional preview thumbnail URL (R2) */
    thumbnail: text('thumbnail'),

    /** How many pages this block has been inserted into */
    usageCount: integer('usage_count').notNull().default(0),

    // ── Timestamps (Unix milliseconds — matches existing migration) ────────
    createdAt: integer('created_at').notNull().$defaultFn(
      () => Date.now()
    ),
    updatedAt: integer('updated_at').notNull().$defaultFn(
      () => Date.now()
    ),
  },
  (table) => [
    index('idx_saved_blocks_store').on(table.storeId),
    index('idx_saved_blocks_category').on(table.storeId, table.category),
    index('idx_saved_blocks_created').on(table.storeId, table.createdAt),
  ]
);

// ============================================================================
// PAGE REVISIONS — full revision history per page
// ============================================================================
export const pageRevisions = sqliteTable(
  'page_revisions',
  {
    /** UUID primary key */
    id: text('id').primaryKey(),

    /**
     * Parent page. References landing_pages(id) per migration 0085 which
     * corrected the original FK to match the GrapesJS builder's integer IDs.
     * Stored as TEXT here to accommodate both integer and UUID page systems
     * during the transition period; application code casts as needed.
     */
    pageId: text('page_id').notNull(),

    /** Explicit store_id for multi-tenant filtering without JOIN */
    storeId: integer('store_id')
      .notNull()
      .references(() => stores.id, { onDelete: 'cascade' }),

    /** Full serialised page content snapshot */
    content: text('content').notNull(),

    /** How the revision was triggered */
    revisionType: text('revision_type')
      .$type<'auto' | 'manual' | 'publish'>()
      .notNull()
      .default('auto'),

    /** User-supplied label for manual saves */
    description: text('description'),

    /** User (store staff) who triggered the revision — nullable on cascade delete */
    createdBy: integer('created_by'),

    // ── Timestamps (Unix milliseconds — matches existing migration) ────────
    createdAt: integer('created_at').notNull().$defaultFn(
      () => Date.now()
    ),
  },
  (table) => [
    index('idx_page_revisions_page').on(table.pageId),
    index('idx_page_revisions_store').on(table.storeId),
    index('idx_page_revisions_created').on(table.pageId, table.createdAt),
  ]
);

// ============================================================================
// RELATIONS
// ============================================================================

export const builderPagesRelations = relations(builderPages, ({ one, many }) => ({
  store: one(stores, {
    fields: [builderPages.storeId],
    references: [stores.id],
  }),
  product: one(products, {
    fields: [builderPages.productId],
    references: [products.id],
  }),
  sections: many(builderSections),
  analytics: many(pageAnalytics),
}));

export const builderSectionsRelations = relations(builderSections, ({ one }) => ({
  page: one(builderPages, {
    fields: [builderSections.pageId],
    references: [builderPages.id],
  }),
}));

export const pageAnalyticsRelations = relations(pageAnalytics, ({ one }) => ({
  page: one(builderPages, {
    fields: [pageAnalytics.pageId],
    references: [builderPages.id],
  }),
}));

export const savedBlocksRelations = relations(savedBlocks, ({ one }) => ({
  store: one(stores, {
    fields: [savedBlocks.storeId],
    references: [stores.id],
  }),
}));

export const pageRevisionsRelations = relations(pageRevisions, ({ one }) => ({
  store: one(stores, {
    fields: [pageRevisions.storeId],
    references: [stores.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type BuilderPage = typeof builderPages.$inferSelect;
export type NewBuilderPage = typeof builderPages.$inferInsert;

export type BuilderSection = typeof builderSections.$inferSelect;
export type NewBuilderSection = typeof builderSections.$inferInsert;

export type PageAnalytic = typeof pageAnalytics.$inferSelect;
export type NewPageAnalytic = typeof pageAnalytics.$inferInsert;

export type SavedBlock = typeof savedBlocks.$inferSelect;
export type NewSavedBlock = typeof savedBlocks.$inferInsert;

export type PageRevision = typeof pageRevisions.$inferSelect;
export type NewPageRevision = typeof pageRevisions.$inferInsert;
