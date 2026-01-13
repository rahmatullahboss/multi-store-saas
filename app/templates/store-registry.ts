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
  planType?: string;
  isPreview?: boolean; // When true, disables API calls and shows preview mode UI
}

// ============================================================================
// HEADER & FOOTER PROPS
// ============================================================================
export interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
}

export interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
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
  Header?: ComponentType<StoreHeaderProps>;
  Footer?: ComponentType<StoreFooterProps>;
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
  'daraz': {
    primary: '#F85606',
    accent: '#F85606',
    background: '#F5F5F5',
    text: '#424242',
    muted: '#999999',
    cardBg: '#FFFFFF',
    headerBg: '#F85606',
    footerBg: '#FAFAFA',
    footerText: '#424242',
  },
  'bdshop': {
    primary: '#1E3A8A',
    accent: '#F97316',
    background: '#F9FAFB',
    text: '#424242',
    muted: '#6B7280',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    footerBg: '#0F172A',
    footerText: '#FFFFFF',
  },
  'ghorer-bazar': {
    primary: '#F28C38',
    accent: '#F28C38',
    background: '#F5F5F5',
    text: '#212121',
    muted: '#757575',
    cardBg: '#FFFFFF',
    headerBg: '#F28C38',
    footerBg: '#F5F5F5',
    footerText: '#424242',
  },
  'nova-lux': {
    primary: '#1C1C1E', // DEEP CHARCOAL
    accent: '#C4A35A',  // ROSE GOLD
    background: '#FAFAFA',
    text: '#2C2C2C',
    muted: '#8E8E93',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    footerBg: '#1C1C1E',
    footerText: '#FAFAFA',
  },
  'eclipse': {
    primary: '#030712',
    accent: '#8B5CF6',
    background: '#030712',
    text: '#F9FAFB',
    muted: '#9CA3AF',
    cardBg: '#111827',
    headerBg: 'rgba(3, 7, 18, 0.7)',
    footerBg: '#000000',
    footerText: '#F9FAFB',
  },
  'aurora-minimal': {
    primary: '#2C2C2C',
    accent: '#E8C4C4',
    background: '#FDFBF9',
    text: '#2C2C2C',
    muted: '#8E8E8E',
    cardBg: '#FFFFFF',
    headerBg: 'rgba(253, 251, 249, 0.85)',
    footerBg: '#2C2C2C',
    footerText: '#FDFBF9',
  },
  'freshness': {
    primary: FRESHNESS_THEME.primary,
    accent: FRESHNESS_THEME.accent,
    background: FRESHNESS_THEME.background,
    text: FRESHNESS_THEME.text,
    muted: FRESHNESS_THEME.textMuted,
    cardBg: FRESHNESS_THEME.background, // Using background as cardBg fallback or specific token
    headerBg: FRESHNESS_THEME.headerBg,
    footerBg: FRESHNESS_THEME.footerBg,
    footerText: FRESHNESS_THEME.footerText,
  },
};

// ============================================================================
// IMPORT TEMPLATE COMPONENTS (Dynamically Loaded)
// ============================================================================
import React from 'react';
import { FRESHNESS_THEME } from '~/components/store-templates/FreshnessTheme';

const LuxeBoutiqueTemplate = React.lazy(() => import('~/components/store-templates/LuxeBoutique').then(m => ({ default: m.LuxeBoutiqueTemplate })));
const TechModernTemplate = React.lazy(() => import('~/components/store-templates/TechModern').then(m => ({ default: m.TechModernTemplate })));
const ArtisanMarketTemplate = React.lazy(() => import('~/components/store-templates/ArtisanMarket').then(m => ({ default: m.ArtisanMarketTemplate })));
const ModernPremiumTemplate = React.lazy(() => import('~/components/templates/ModernPremiumTemplate').then(m => ({ default: m.ModernPremiumTemplate })));
const DarazTemplate = React.lazy(() => import('~/components/store-templates/DarazTemplate').then(m => ({ default: m.DarazTemplate })));
const BDShopTemplate = React.lazy(() => import('~/components/store-templates/BDShopTemplate').then(m => ({ default: m.BDShopTemplate })));
const GhorerBazarTemplate = React.lazy(() => import('~/components/store-templates/GhorerBazarTemplate').then(m => ({ default: m.GhorerBazarTemplate })));
const NovaLuxTemplate = React.lazy(() => import('~/components/store-templates/NovaLuxTemplate').then(m => ({ default: m.NovaLuxTemplate })));
const EclipseTemplate = React.lazy(() => import('~/components/store-templates/EclipseTemplate').then(m => ({ default: m.EclipseTemplate })));
const AuroraMinimalTemplate = React.lazy(() => import('~/components/store-templates/AuroraMinimalTemplate').then(m => ({ default: m.AuroraMinimalTemplate })));
const FreshnessTemplate = React.lazy(() => import('~/components/store-templates/FreshnessTemplate').then(m => ({ default: m.FreshnessTemplate })));

// Header Components
const DarazHeader = React.lazy(() => import('~/components/store-layouts/templates/DarazHeader').then(m => ({ default: m.DarazHeader })));
const NovaLuxHeader = React.lazy(() => import('~/components/store-layouts/templates/NovaLuxHeader').then(m => ({ default: m.NovaLuxHeader })));
const EclipseHeader = React.lazy(() => import('~/components/store-layouts/templates/EclipseHeader').then(m => ({ default: m.EclipseHeader })));
const BDShopHeader = React.lazy(() => import('~/components/store-layouts/templates/BDShopHeader').then(m => ({ default: m.BDShopHeader })));
const GhorerBazarHeader = React.lazy(() => import('~/components/store-layouts/templates/GhorerBazarHeader').then(m => ({ default: m.GhorerBazarHeader })));

// Footer Components
const DarazFooter = React.lazy(() => import('~/components/store-layouts/templates/DarazFooter').then(m => ({ default: m.DarazFooter })));
const NovaLuxFooter = React.lazy(() => import('~/components/store-layouts/templates/NovaLuxFooter').then(m => ({ default: m.NovaLuxFooter })));
const EclipseFooter = React.lazy(() => import('~/components/store-layouts/templates/EclipseFooter').then(m => ({ default: m.EclipseFooter })));
const BDShopFooter = React.lazy(() => import('~/components/store-layouts/templates/BDShopFooter').then(m => ({ default: m.BDShopFooter })));
const GhorerBazarFooter = React.lazy(() => import('~/components/store-layouts/templates/GhorerBazarFooter').then(m => ({ default: m.GhorerBazarFooter })));

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
  {
    id: 'daraz',
    name: 'Daraz Style',
    description: 'Daraz Bangladesh-inspired marketplace design with orange theme, category sidebar, flash sales, and modern grid layout.',
    thumbnail: '/templates/daraz.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['daraz'],
    fonts: {
      heading: 'Roboto',
      body: 'Roboto',
    },
    component: DarazTemplate,
    Header: DarazHeader,
    Footer: DarazFooter,
  },
  {
    id: 'bdshop',
    name: 'BDShop Style',
    description: 'BDShop-inspired modern electronics store template with navy blue theme, mobile-first design, top deals carousel, FAQ section, and dark footer.',
    thumbnail: '/templates/bdshop.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['bdshop'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: BDShopTemplate,
    Header: BDShopHeader,
    Footer: BDShopFooter,
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description: 'Ghorer Bazar-inspired design with orange theme, clean product cards, Quick Add buttons, and COD-focused checkout flow.',
    thumbnail: '/templates/ghorer-bazar.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['ghorer-bazar'],
    fonts: {
      heading: 'Noto Sans Bengali',
      body: 'Noto Sans Bengali',
    },
    component: GhorerBazarTemplate,
    Header: GhorerBazarHeader,
    Footer: GhorerBazarFooter,
  },
  {
    id: 'nova-lux',
    name: 'NovaLux Premium',
    description: 'World-class luxury design with rose gold accents, transparent header, and elegant animations. Perfect for premium fashion and lifestyle brands.',
    thumbnail: '/templates/nova-lux.png',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'DM Sans',
    },
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
  },
  {
    id: 'eclipse',
    name: 'Eclipse Future',
    description: 'A futuristic dark-mode template with neon accents, bento layouts, and spotlight interactions. The cutting edge of 2025.',
    thumbnail: '/templates/eclipse.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['eclipse'],
    fonts: {
      heading: 'Space Grotesk',
      body: 'Inter',
    },
    component: EclipseTemplate,
    Header: EclipseHeader,
    Footer: EclipseFooter,
  },
  {
    id: 'aurora-minimal',
    name: 'Aurora Minimal',
    description: 'Ultra-premium minimalist design with warm rose and cool sage gradients, glassmorphism effects, and elegant animations. Perfect for luxury and lifestyle brands.',
    thumbnail: '/templates/aurora-minimal.png',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['aurora-minimal'],
    fonts: {
      heading: 'Outfit',
      body: 'Plus Jakarta Sans',
    },
    component: AuroraMinimalTemplate,
  },
  {
    id: 'freshness',
    name: 'Freshness Organic',
    description: 'Vibrant organic-focused design with fresh color palette, dynamic product cards, and floating contact buttons. Perfect for grocery and organic stores.',
    thumbnail: '/templates/freshness.png', // Placeholder until screenshot is generated
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['freshness'],
    fonts: {
      heading: 'Cursive', // As per theme definition
      body: 'system-ui',
    },
    component: FreshnessTemplate,
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
