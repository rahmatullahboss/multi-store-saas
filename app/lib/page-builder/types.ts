/**
 * Page Builder v2 - Type Definitions
 * 
 * Core types for the schema-driven page builder architecture.
 */

import type { ComponentType } from 'react';
import type { z } from 'zod';

// ============================================================================
// SECTION TYPES
// ============================================================================

/**
 * All available section types in the builder.
 * Add new section types here and in the registry.
 */
export type SectionType =
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'faq'
  | 'gallery'
  | 'video'
  | 'cta'
  | 'trust-badges'
  | 'benefits'
  | 'comparison'
  | 'delivery'
  | 'guarantee'
  | 'problem-solution'
  | 'pricing'
  | 'how-to-order'
  | 'showcase';

// ============================================================================
// DATABASE TYPES
// ============================================================================

/**
 * Raw database row from builder_sections table.
 */
export interface BuilderSectionRow {
  id: string;
  pageId: string;
  type: string;
  enabled: number; // 0 or 1
  sortOrder: number;
  propsJson: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parsed section ready for UI consumption.
 */
export interface BuilderSection {
  id: string;
  pageId: string;
  type: SectionType;
  enabled: boolean;
  sortOrder: number;
  props: Record<string, unknown>;
  version: number;
}

/**
 * Raw database row from builder_pages table.
 */
export interface BuilderPageRow {
  id: string;
  storeId: number;
  slug: string;
  title: string | null;
  productId: number | null;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  templateId: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  viewCount: number;
  orderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Parsed page with sections.
 */
export interface BuilderPage {
  id: string;
  storeId: number;
  slug: string;
  title: string | null;
  productId: number | null;
  status: 'draft' | 'published';
  seoTitle?: string | null;
  seoDescription?: string | null;
  ogImage?: string | null;
  publishedAt?: Date | null;
  sections: BuilderSection[];
}

// ============================================================================
// REGISTRY TYPES
// ============================================================================

/**
 * Section definition in the registry.
 * Maps a section type to its component, schema, and defaults.
 */
export interface SectionDefinition<TProps = Record<string, unknown>> {
  type: SectionType;
  name: string;       // Bengali name
  nameEn: string;     // English name
  description: string;
  descriptionEn: string;
  icon: string;       // Lucide icon name
  schema: z.ZodType<TProps>;
  defaultProps: TProps;
  // Component is loaded dynamically
  componentPath: string;
}

/**
 * Section metadata for UI display (without component).
 */
export interface SectionMeta {
  type: SectionType;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * Intent types for Remix action handlers.
 */
export type BuilderIntent =
  | 'create-page'
  | 'add-section'
  | 'toggle-section'
  | 'update-props'
  | 'delete-section'
  | 'reorder-sections'
  | 'update-page-settings'
  | 'publish-page';

/**
 * Action result for mutations.
 */
export interface ActionResult {
  success: boolean;
  error?: string;
  message?: string;
  data?: unknown;
}

// ============================================================================
// EDITOR STATE TYPES
// ============================================================================

/**
 * Editor state for the builder UI.
 */
export interface EditorState {
  page: BuilderPage | null;
  sections: BuilderSection[];
  activeSectionId: string | null;
  isDirty: boolean;
  isSaving: boolean;
}

/**
 * Editor action for state updates.
 */
export type EditorAction =
  | { type: 'SET_PAGE'; payload: BuilderPage }
  | { type: 'SET_SECTIONS'; payload: BuilderSection[] }
  | { type: 'SELECT_SECTION'; payload: string | null }
  | { type: 'UPDATE_SECTION'; payload: { id: string; props: Record<string, unknown> } }
  | { type: 'TOGGLE_SECTION'; payload: string }
  | { type: 'REORDER_SECTIONS'; payload: string[] }
  | { type: 'ADD_SECTION'; payload: BuilderSection }
  | { type: 'DELETE_SECTION'; payload: string }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'MARK_CLEAN' };
