/**
 * Store Template Registry - Full E-commerce Store Templates
 * 
 * Central registry for all available store templates.
 * Similar to landing page templates but for full store mode.
 * Each template provides a complete storefront design.
 */

import type { ComponentType } from 'react';
import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';

// ============================================================================
// SERIALIZED PRODUCT TYPE - Matches what loader provides
// ============================================================================
export interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  category: string | null;
}

// ============================================================================
// STORE TEMPLATE PROPS - All store templates must accept these props
// ============================================================================
export interface StoreTemplateProps {
  storeName: string;
  storeId: number;
  logo?: string | null;
  theme?: string | null;
  fontFamily?: string | null;
  products: SerializedProduct[];
  categories: (string | null)[];
  currentCategory?: string | null;
  config: ThemeConfig | null;
  currency: string;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  isPreview?: boolean; // When true, disables API calls and shows preview mode UI
}

// ============================================================================
// STORE TEMPLATE THEME COLORS
// ============================================================================
export interface StoreTemplateTheme {
  primary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  cardBg: string;
  headerBg: string;
  footerBg: string;
  footerText: string;
}

// ============================================================================
// STORE TEMPLATE DEFINITION - Metadata for each template
// ============================================================================
export interface StoreTemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'luxury' | 'tech' | 'artisan' | 'modern';
  theme: StoreTemplateTheme;
  fonts: {
    heading: string;
    body: string;
  };
  component: ComponentType<StoreTemplateProps>;
}

// ============================================================================
// TEMPLATE THEME CONFIGURATIONS
// ============================================================================
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  'luxe-boutique': {
    primary: '#1a1a1a',
    accent: '#c9a961',
    background: '#faf9f7',
    text: '#1a1a1a',
    muted: '#6b6b6b',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#faf9f7',
  },
  'tech-modern': {
    primary: '#0f172a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#0f172a',
    muted: '#64748b',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#0f172a',
    footerText: '#f8fafc',
  },
  'artisan-market': {
    primary: '#3d2f2f',
    accent: '#b45309',
    background: '#fefbf6',
    text: '#3d2f2f',
    muted: '#78716c',
    cardBg: '#ffffff',
    headerBg: '#fefbf6',
    footerBg: '#3d2f2f',
    footerText: '#fefbf6',
  },
  'modern-premium': {
    primary: '#f59e0b',
    accent: '#f59e0b',
    background: '#f9fafb',
    text: '#111827',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#111827',
    footerText: '#ffffff',
  },
};

// ============================================================================
// IMPORT TEMPLATE COMPONENTS
// ============================================================================
import { LuxeBoutiqueTemplate } from '~/components/store-templates/LuxeBoutique';
import { TechModernTemplate } from '~/components/store-templates/TechModern';
import { ArtisanMarketTemplate } from '~/components/store-templates/ArtisanMarket';
import { ModernPremiumTemplate } from '~/components/templates/ModernPremiumTemplate';

// ============================================================================
// STORE TEMPLATES REGISTRY
// ============================================================================
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Elegant design for fashion, jewelry & luxury goods with gold accents and serif typography.',
    thumbnail: '/templates/luxe-boutique.png',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    component: LuxeBoutiqueTemplate,
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Clean, bold design for electronics & tech products with blue accents and modern feel.',
    thumbnail: '/templates/tech-modern.png',
    category: 'tech',
    theme: STORE_TEMPLATE_THEMES['tech-modern'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: TechModernTemplate,
  },
  {
    id: 'artisan-market',
    name: 'Artisan Market',
    description: 'Warm, organic design for handmade & artisanal products with amber accents and rustic feel.',
    thumbnail: '/templates/artisan-market.png',
    category: 'artisan',
    theme: STORE_TEMPLATE_THEMES['artisan-market'],
    fonts: {
      heading: 'Newsreader',
      body: 'Work Sans',
    },
    component: ArtisanMarketTemplate,
  },
  {
    id: 'modern-premium',
    name: 'Modern Premium',
    description: 'Sleek modern design with dark mode support, animations, and premium feel. Perfect for any product.',
    thumbnail: '/templates/modern-premium.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['modern-premium'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: ModernPremiumTemplate,
  },
];

// ============================================================================
// DEFAULT STORE TEMPLATE - Fallback when no template is specified
// ============================================================================
export const DEFAULT_STORE_TEMPLATE_ID = 'luxe-boutique';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a store template by ID
 * Returns the default template if ID is not found
 */
export function getStoreTemplate(id: string | undefined): StoreTemplateDefinition {
  const template = STORE_TEMPLATES.find((t) => t.id === id);
  if (!template) {
    return STORE_TEMPLATES.find((t) => t.id === DEFAULT_STORE_TEMPLATE_ID) ?? STORE_TEMPLATES[0];
  }
  return template;
}

/**
 * Get all available store templates
 * Useful for the template selector UI
 */
export function getAllStoreTemplates(): StoreTemplateDefinition[] {
  return STORE_TEMPLATES;
}

/**
 * Check if a store template ID is valid
 */
export function isValidStoreTemplateId(id: string): boolean {
  return STORE_TEMPLATES.some((t) => t.id === id);
}

/**
 * Get theme colors for a specific template
 */
export function getStoreTemplateTheme(id: string | undefined): StoreTemplateTheme {
  return STORE_TEMPLATE_THEMES[id || DEFAULT_STORE_TEMPLATE_ID] || STORE_TEMPLATE_THEMES[DEFAULT_STORE_TEMPLATE_ID];
}
