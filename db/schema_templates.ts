/**
 * Store Template System Schema
 * 
 * Shopify-like theme/template architecture with draft/publish workflow.
 * Templates are page-type based (home, product, collection, cart, checkout).
 * Each template has sections that can be customized via the Theme Editor.
 */

import { sqliteTable, text, integer, index, unique } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { stores } from './schema';

// ============================================================================
// TEMPLATE KEYS - Valid page types for templates
// ============================================================================
export type TemplateKey = 'home' | 'product' | 'collection' | 'cart' | 'checkout' | 'page' | 'search' | 'account';

// ============================================================================
// THEMES TABLE - Theme container (one active per store)
// ============================================================================
export const themes = sqliteTable('themes', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  name: text('name').notNull().default('Default Theme'),
  presetId: text('preset_id'), // Reference to theme preset
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_themes_shop').on(table.shopId),
  index('idx_themes_active').on(table.shopId, table.isActive),
]);

// ============================================================================
// THEME TEMPLATES TABLE - Page-type templates
// ============================================================================
export const themeTemplates = sqliteTable('theme_templates', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  themeId: text('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  templateKey: text('template_key').$type<TemplateKey>().notNull(),
  title: text('title'),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_theme_templates_theme').on(table.themeId),
  index('idx_theme_templates_shop').on(table.shopId),
  unique('uniq_theme_template_key').on(table.themeId, table.templateKey),
]);

// ============================================================================
// TEMPLATE SECTIONS (DRAFT) - Editable section instances
// ============================================================================
export const templateSectionsDraft = sqliteTable('template_sections_draft', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull().references(() => themeTemplates.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // Section type
  enabled: integer('enabled').default(1),
  sortOrder: integer('sort_order').notNull(),
  propsJson: text('props_json').default('{}'),
  blocksJson: text('blocks_json').default('[]'),
  version: integer('version').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_template_sections_draft_template').on(table.templateId),
  index('idx_template_sections_draft_order').on(table.templateId, table.sortOrder),
]);

// ============================================================================
// TEMPLATE SECTIONS (PUBLISHED) - Immutable published snapshot
// ============================================================================
export const templateSectionsPublished = sqliteTable('template_sections_published', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  templateId: text('template_id').notNull().references(() => themeTemplates.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  enabled: integer('enabled').default(1),
  sortOrder: integer('sort_order').notNull(),
  propsJson: text('props_json').default('{}'),
  blocksJson: text('blocks_json').default('[]'),
  publishedAt: integer('published_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_template_sections_published_template').on(table.templateId),
  index('idx_template_sections_published_order').on(table.templateId, table.sortOrder),
]);

// ============================================================================
// THEME SETTINGS (DRAFT) - Global theme settings
// ============================================================================
export const themeSettingsDraft = sqliteTable('theme_settings_draft', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  themeId: text('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  settingsJson: text('settings_json').default('{}'),
  version: integer('version').default(1),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_theme_settings_draft_theme').on(table.themeId),
  unique('uniq_theme_settings_draft').on(table.themeId),
]);

// ============================================================================
// THEME SETTINGS (PUBLISHED) - Immutable published snapshot
// ============================================================================
export const themeSettingsPublished = sqliteTable('theme_settings_published', {
  id: text('id').primaryKey(),
  shopId: integer('shop_id').notNull().references(() => stores.id, { onDelete: 'cascade' }),
  themeId: text('theme_id').notNull().references(() => themes.id, { onDelete: 'cascade' }),
  settingsJson: text('settings_json').default('{}'),
  publishedAt: integer('published_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_theme_settings_published_theme').on(table.themeId),
  unique('uniq_theme_settings_published').on(table.themeId),
]);

// ============================================================================
// THEME PRESETS TABLE - Pre-built theme configurations
// ============================================================================
export const themePresets = sqliteTable('theme_presets', {
  id: text('id').primaryKey(), // e.g., 'rovo', 'daraz', 'nova-lux'
  name: text('name').notNull(),
  description: text('description'),
  thumbnailUrl: text('thumbnail_url'),
  category: text('category').$type<'luxury' | 'modern' | 'tech' | 'artisan'>(),
  defaultSettingsJson: text('default_settings_json').default('{}'),
  defaultTemplatesJson: text('default_templates_json').default('{}'),
  isActive: integer('is_active').default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
}, (table) => [
  index('idx_theme_presets_category').on(table.category),
  index('idx_theme_presets_active').on(table.isActive),
]);

// ============================================================================
// RELATIONS
// ============================================================================
export const themesRelations = relations(themes, ({ one, many }) => ({
  store: one(stores, {
    fields: [themes.shopId],
    references: [stores.id],
  }),
  templates: many(themeTemplates),
  settingsDraft: one(themeSettingsDraft, {
    fields: [themes.id],
    references: [themeSettingsDraft.themeId],
  }),
  settingsPublished: one(themeSettingsPublished, {
    fields: [themes.id],
    references: [themeSettingsPublished.themeId],
  }),
}));

export const themeTemplatesRelations = relations(themeTemplates, ({ one, many }) => ({
  theme: one(themes, {
    fields: [themeTemplates.themeId],
    references: [themes.id],
  }),
  store: one(stores, {
    fields: [themeTemplates.shopId],
    references: [stores.id],
  }),
  sectionsDraft: many(templateSectionsDraft),
  sectionsPublished: many(templateSectionsPublished),
}));

export const templateSectionsDraftRelations = relations(templateSectionsDraft, ({ one }) => ({
  template: one(themeTemplates, {
    fields: [templateSectionsDraft.templateId],
    references: [themeTemplates.id],
  }),
}));

export const templateSectionsPublishedRelations = relations(templateSectionsPublished, ({ one }) => ({
  template: one(themeTemplates, {
    fields: [templateSectionsPublished.templateId],
    references: [themeTemplates.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Theme = typeof themes.$inferSelect;
export type NewTheme = typeof themes.$inferInsert;
export type ThemeTemplate = typeof themeTemplates.$inferSelect;
export type NewThemeTemplate = typeof themeTemplates.$inferInsert;
export type TemplateSectionDraft = typeof templateSectionsDraft.$inferSelect;
export type NewTemplateSectionDraft = typeof templateSectionsDraft.$inferInsert;
export type TemplateSectionPublished = typeof templateSectionsPublished.$inferSelect;
export type ThemeSettingDraft = typeof themeSettingsDraft.$inferSelect;
export type ThemeSettingPublished = typeof themeSettingsPublished.$inferSelect;
export type ThemePreset = typeof themePresets.$inferSelect;
