/**
 * Page Builder v2 Database Schema
 * 
 * New architecture following the "Total System Guideline":
 * - builder_pages: Page/Campaign metadata
 * - builder_sections: Section instances with sort_order for deterministic ordering
 * 
 * This is a separate implementation from the JSON-based landingConfig system.
 */

import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { stores, products } from './schema';

// ============================================================================
// BUILDER PAGES TABLE - Page/Campaign metadata
// ============================================================================
export const builderPages = sqliteTable('builder_pages', {
  id: text('id').primaryKey(), // UUID
  storeId: integer('store_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  
  // Page identification
  slug: text('slug').notNull(), // URL slug (e.g., "summer-sale")
  title: text('title'), // Display title
  
  // Featured product (for landing pages)
  productId: integer('product_id').references(() => products.id),
  
  // Status
  status: text('status').$type<'draft' | 'published'>().default('draft'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  lastPublishedAt: integer('last_published_at', { mode: 'timestamp' }), // When sections were last published
  
  // Template (optional - for pre-defined layouts)
  templateId: text('template_id'),
  
  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  ogImage: text('og_image'),
  
  // Analytics
  viewCount: integer('view_count').default(0),
  orderCount: integer('order_count').default(0),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_builder_pages_store').on(table.storeId),
  unique('uniq_builder_pages_slug').on(table.storeId, table.slug),
]);

// ============================================================================
// BUILDER SECTIONS TABLE - Section instances with position and content
// ============================================================================
export const builderSections = sqliteTable('builder_sections', {
  id: text('id').primaryKey(), // UUID
  pageId: text('page_id').notNull().references(() => builderPages.id, { onDelete: 'cascade' }),
  
  // Section type (maps to registry)
  type: text('type').notNull(), // 'hero' | 'features' | 'testimonials' | 'faq' | etc.
  
  // Visibility toggle
  enabled: integer('enabled').notNull().default(1), // 0 = hidden, 1 = visible
  
  // Ordering (critical for deterministic rendering)
  sortOrder: integer('sort_order').notNull(),
  
  // Section content (JSON) - Draft/Publish split
  propsJson: text('props_json').notNull().default('{}'), // Draft content (editable)
  publishedPropsJson: text('published_props_json'), // Published content (served to public)
  publishedAt: integer('published_at', { mode: 'timestamp' }), // When this section was published
  
  // Optimistic concurrency control
  version: integer('version').notNull().default(1),
  
  // Timestamps
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_builder_sections_order').on(table.pageId, table.sortOrder),
]);

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
}));

export const builderSectionsRelations = relations(builderSections, ({ one }) => ({
  page: one(builderPages, {
    fields: [builderSections.pageId],
    references: [builderPages.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type BuilderPage = typeof builderPages.$inferSelect;
export type NewBuilderPage = typeof builderPages.$inferInsert;
export type BuilderSection = typeof builderSections.$inferSelect;
export type NewBuilderSection = typeof builderSections.$inferInsert;
