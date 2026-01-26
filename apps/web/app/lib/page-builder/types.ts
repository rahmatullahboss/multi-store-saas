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
  // Core sections
  | 'hero'
  | 'features'
  | 'testimonials'
  | 'faq'
  | 'gallery'
  | 'video'
  | 'cta'
  | 'trust-badges'
  | 'trust'
  | 'benefits'
  | 'comparison'
  | 'delivery'
  | 'guarantee'
  | 'problem-solution'
  | 'pricing'
  | 'how-to-order'
  | 'showcase'
  | 'product-grid'
  | 'custom-html'
  | 'order-button'
  | 'header'
  | 'countdown'
  | 'stats'
  | 'contact'
  | 'footer'
  // Social proof
  | 'social-proof'
  | 'social'
  // Newsletter
  | 'newsletter'
  // Product page sections
  | 'product-header'
  | 'product-gallery'
  | 'product-info'
  | 'product-description'
  | 'related-products'
  // Collection page sections
  | 'collection-header'
  // Cart page sections
  | 'cart-items'
  | 'cart-summary'
  // Order form variants
  | 'order-form'
  | 'rich-text';

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
 * Section variant types for each section.
 * Each section can have multiple visual variants.
 */
export type SectionVariant =
  // Hero variants
  | 'product-focused'
  | 'offer-focused'
  | 'video-focused'
  | 'text-focused'
  // Testimonials variants
  | 'cards'
  | 'carousel'
  | 'avatars'
  | 'screenshots'
  | 'star-rating'
  // CTA variants
  | 'button-only'
  | 'with-trust'
  | 'urgency'
  // Features variants
  | 'grid-3'
  | 'grid-4'
  | 'list'
  // Social proof variants
  | 'counter'
  | 'live-feed'
  | 'badges'
  // Default
  | 'default';

/**
 * Parsed section ready for UI consumption.
 */
export interface BuilderSection {
  id: string;
  pageId: string;
  type: SectionType;
  variant?: SectionVariant | null; // Section visual variant
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
 * Genie Builder Intent - User's selling intent from wizard
 */
export interface PageIntent {
  productType: 'single' | 'multiple';
  goal: 'direct_sales' | 'lead_whatsapp';
  trafficSource: 'facebook' | 'tiktok' | 'organic';
  productIds?: number[]; // Multiple product IDs for multi-product landing pages
  createdAt?: string;
}

/**
 * Style Tokens - Global style preferences for the page
 */
export interface StyleTokens {
  primaryColor: string; // Brand color (hex)
  buttonStyle: 'rounded' | 'sharp' | 'pill';
  fontFamily: 'default' | 'bengali' | 'modern' | 'classic';
  darkMode?: boolean;
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
  templateId?: string | null; // Template ID for custom layouts
  publishedAt?: Date | null;
  // Genie Builder (Quick Builder v2) data
  intent?: PageIntent | null;
  styleTokens?: StyleTokens | null;
  // Floating button settings - WhatsApp
  whatsappEnabled?: number | null;
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
  // Floating button settings - Call
  callEnabled?: number | null;
  callNumber?: string | null;
  // Floating button settings - Order
  orderEnabled?: number | null;
  orderText?: string | null;
  orderBgColor?: string | null;
  orderTextColor?: string | null;
  buttonPosition?: string | null;
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
  name: string; // Bengali name
  nameEn: string; // English name
  description: string;
  descriptionEn: string;
  icon: string; // Lucide icon name
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
  allowedPages?: string[]; // Optional: which page types this section can be used on
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

// ============================================================================
// SECTION THEME TYPES
// ============================================================================

/**
 * Theme configuration for section components.
 * Enables visually distinct templates using the same component architecture.
 */
export interface SectionTheme {
  id: string;
  name: string;

  // Colors
  primaryColor: string; // Main brand color (e.g., button backgrounds)
  accentColor: string; // Secondary accent color
  bgColor: string; // Background color for sections
  bgGradient?: string; // Optional gradient (Tailwind format)
  textColor: string; // Primary text color
  mutedTextColor: string; // Secondary/muted text

  // Component styling
  cardBg: string; // Card/item background
  cardBorder: string; // Card border color
  badgeBg: string; // Badge background
  badgeText: string; // Badge text color

  // Button styling
  buttonBg: string; // CTA button background (can be gradient)
  buttonText: string; // CTA button text
  buttonHoverBg: string; // Button hover state

  // Style variant
  style: 'urgent' | 'premium' | 'nature' | 'minimal' | 'dark' | 'professional' | 'default';
}

/**
 * Pre-defined theme presets for templates.
 */
export const THEME_PRESETS: Record<string, SectionTheme> = {
  // ⚡ Quick Start - Professional Blue/Red
  'quick-start': {
    id: 'quick-start',
    name: 'Quick Start',
    primaryColor: '#E63946',
    accentColor: '#1D3557',
    bgColor: '#FFFFFF',
    bgGradient: 'from-gray-50 to-white',
    textColor: '#1D3557',
    mutedTextColor: '#6C757D',
    cardBg: '#F8F9FA',
    cardBorder: '#E9ECEF',
    badgeBg: '#F4A261',
    badgeText: '#FFFFFF',
    buttonBg: 'linear-gradient(to right, #E63946, #C1121F)',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#C1121F',
    style: 'professional',
  },

  // 🔥 Flash Sale - Urgent Red/Yellow
  'flash-sale': {
    id: 'flash-sale',
    name: 'Flash Sale',
    primaryColor: '#DC2626',
    accentColor: '#FBBF24',
    bgColor: '#7F1D1D',
    bgGradient: 'from-red-900 to-red-800',
    textColor: '#FFFFFF',
    mutedTextColor: '#FCA5A5',
    cardBg: 'rgba(255,255,255,0.1)',
    cardBorder: 'rgba(255,255,255,0.2)',
    badgeBg: '#FBBF24',
    badgeText: '#7F1D1D',
    buttonBg: 'linear-gradient(to right, #FBBF24, #F59E0B)',
    buttonText: '#7F1D1D',
    buttonHoverBg: '#F59E0B',
    style: 'urgent',
  },

  // 🇧🇩 Premium BD - Dark with Emerald
  'premium-bd': {
    id: 'premium-bd',
    name: 'Premium BD',
    primaryColor: '#10B981',
    accentColor: '#059669',
    bgColor: '#18181B',
    bgGradient: 'from-zinc-900 to-zinc-800',
    textColor: '#FFFFFF',
    mutedTextColor: '#A1A1AA',
    cardBg: '#27272A',
    cardBorder: '#3F3F46',
    badgeBg: '#10B981',
    badgeText: '#FFFFFF',
    buttonBg: 'linear-gradient(to right, #10B981, #059669)',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#059669',
    style: 'premium',
  },

  // 🖤 Modern Dark - Dark with Pink accent
  'modern-dark': {
    id: 'modern-dark',
    name: 'Modern Dark',
    primaryColor: '#E94560',
    accentColor: '#533483',
    bgColor: '#1A1A2E',
    bgGradient: 'from-[#1A1A2E] to-[#16213E]',
    textColor: '#FFFFFF',
    mutedTextColor: '#9CA3AF',
    cardBg: '#16213E',
    cardBorder: '#2C3E50',
    badgeBg: '#E94560',
    badgeText: '#FFFFFF',
    buttonBg: 'linear-gradient(to right, #E94560, #C23B51)',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#C23B51',
    style: 'dark',
  },

  // 🌿 Organic - Nature Green
  organic: {
    id: 'organic',
    name: 'Organic Green',
    primaryColor: '#16A34A',
    accentColor: '#15803D',
    bgColor: '#F0FDF4',
    bgGradient: 'from-green-50 to-emerald-50',
    textColor: '#14532D',
    mutedTextColor: '#4D7C0F',
    cardBg: '#FFFFFF',
    cardBorder: '#BBF7D0',
    badgeBg: '#16A34A',
    badgeText: '#FFFFFF',
    buttonBg: 'linear-gradient(to right, #16A34A, #15803D)',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#15803D',
    style: 'nature',
  },

  // ✨ Minimal - Clean white
  'minimal-clean': {
    id: 'minimal-clean',
    name: 'Minimal Clean',
    primaryColor: '#6366F1',
    accentColor: '#4F46E5',
    bgColor: '#FFFFFF',
    bgGradient: 'from-slate-50 to-white',
    textColor: '#1E293B',
    mutedTextColor: '#64748B',
    cardBg: '#F8FAFC',
    cardBorder: '#E2E8F0',
    badgeBg: '#6366F1',
    badgeText: '#FFFFFF',
    buttonBg: '#6366F1',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#4F46E5',
    style: 'minimal',
  },

  // Default fallback
  default: {
    id: 'default',
    name: 'Default',
    primaryColor: '#6366F1',
    accentColor: '#8B5CF6',
    bgColor: '#FFFFFF',
    bgGradient: 'from-gray-50 to-white',
    textColor: '#111827',
    mutedTextColor: '#6B7280',
    cardBg: '#F9FAFB',
    cardBorder: '#E5E7EB',
    badgeBg: '#6366F1',
    badgeText: '#FFFFFF',
    buttonBg: 'linear-gradient(to right, #6366F1, #8B5CF6)',
    buttonText: '#FFFFFF',
    buttonHoverBg: '#4F46E5',
    style: 'default',
  },
};

/**
 * Get theme by template ID or fallback to default.
 */
export function getThemeForTemplate(templateId: string): SectionTheme {
  return THEME_PRESETS[templateId] || THEME_PRESETS['default'];
}
