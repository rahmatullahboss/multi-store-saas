/**
 * Store Template Registry - Full E-commerce Store Templates
 *
 * Central registry for all available store templates.
 * Similar to landing page templates but for full store mode.
 * Each template provides a complete storefront design.
 */

import type { ComponentType } from 'react';
import type { ThemeConfig, SocialLinks, FooterConfig } from '@db/types';
import type { MVPSettingsWithTheme } from '~/services/mvp-settings.server';

// ============================================================================
// SERIALIZED PRODUCT TYPE - Matches what loader provides
// ============================================================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProps = any;

export interface SerializedVariant {
  id: number;
  productId: number;
  option1Name: string | null;
  option1Value: string | null;
  option2Name: string | null;
  option2Value: string | null;
  option3Name: string | null;
  option3Value: string | null;
  price: number | null;
  compareAtPrice: number | null;
  sku: string | null;
  inventory: number | null;
  available: number | null;
  imageUrl: string | null;
  isAvailable: boolean | null;
}

export interface StoreCategory {
  id?: number | string;
  title: string;
  slug?: string;
  imageUrl?: string | null;
}

export interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images?: string | string[] | null;
  inventory?: number | null;
  category: string | null;
  variants?: SerializedVariant[];
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
  // AI Chat Widget Props
  aiCredits?: number;
  isCustomerAiEnabled?: boolean;
  // Extended demo data for preview mode
  collections?: Record<string, unknown>[];
  reviews?: Record<string, unknown>[];
  banners?: Record<string, unknown>[];
  flashSale?: Record<string, unknown>;
  flashSaleProducts?: SerializedProduct[];
  promotions?: Record<string, unknown>[];
  announcement?: Record<string, unknown>;
  testimonials?: Record<string, unknown>[];
  // Customer session info
  customer?: { id: number; name: string | null; email: string | null } | null;
  // MVP theme settings
  mvpSettings?: MVPSettingsWithTheme;
}

// ============================================================================
// HEADER & FOOTER PROPS
// ============================================================================
export interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: ThemeConfig | null;
  themeColors?: StoreTemplateTheme;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  // Common state props for template headers
  count?: number;
  mvpSettings?: MVPSettingsWithTheme;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isScrolled?: boolean;
  announcement?: Record<string, unknown>;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  // Customer session info
  customer?: { id: number; name: string | null; email: string | null } | null;
}

export interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: FooterConfig | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
  themeColors?: StoreTemplateTheme;
  isPreview?: boolean;
  mvpSettings?: MVPSettingsWithTheme;
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
  /** Optional border color used by some shared UI (fallbacks applied when missing). */
  cardBorder?: string;
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
  /** Template-specific product detail page component */
  ProductPage?: ComponentType<AnyProps>;
  /** Template-specific cart page component */
  CartPage?: ComponentType<AnyProps>;
  /** Template-specific collection/category page component */
  CollectionPage?: ComponentType<AnyProps>;
  /** Template-specific checkout page component */
  CheckoutPage?: ComponentType<AnyProps>;
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
  'nova-lux': {
    primary: '#1C1C1E',
    accent: '#C4A35A',
    background: '#FAFAFA',
    text: '#2C2C2C',
    muted: '#8E8E93',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    footerBg: '#1C1C1E',
    footerText: '#FAFAFA',
  },
  'starter-store': {
    primary: '#000000', // Default Black
    accent: '#000000',
    background: '#ffffff',
    text: '#000000',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#000000',
    footerText: '#ffffff',
  },
};

// ============================================================================
// IMPORT TEMPLATE COMPONENTS (Dynamically Loaded)
// ============================================================================
import React from 'react';



// Shared Cart Page
const SharedCartPage = React.lazy(() => import('~/components/store-templates/shared/CartPage'));

// Shared Checkout Page
const SharedCheckoutPage = React.lazy(
  () => import('~/components/store-templates/shared/CheckoutPage')
);

// Shared Collection Page
const SharedCollectionPage = React.lazy(
  () => import('~/components/store-templates/shared/CollectionPage')
);

const LuxeBoutiqueTemplate = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/index').then((m) => ({
    default: m.LuxeBoutiqueTemplate,
  }))
);
const LuxeBoutiqueHeader = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/sections/Header').then((m) => ({
    default: m.LuxeBoutiqueHeader,
  }))
);
const LuxeBoutiqueFooter = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/sections/Footer').then((m) => ({
    default: m.LuxeBoutiqueFooter,
  }))
);
const LuxeBoutiqueProductPage = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/pages/ProductPage').then((m) => ({
    default: m.LuxeBoutiqueProductPage,
  }))
);
const LuxeCartPage = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/pages/CartPage').then((m) => ({
    default: m.LuxeCartPage,
  }))
);
const LuxeCollectionPage = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/pages/CollectionPage').then((m) => ({
    default: m.LuxeCollectionPage,
  }))
);

const NovaLuxTemplate = React.lazy(() =>
  import('~/components/store-templates/nova-lux/index').then((m) => ({
    default: m.NovaLuxTemplate,
  }))
);
const NovaLuxHeader = React.lazy(() =>
  import('~/components/store-templates/nova-lux/sections/Header').then((m) => ({
    default: m.NovaLuxHeader,
  }))
);
const NovaLuxFooter = React.lazy(() =>
  import('~/components/store-templates/nova-lux/sections/Footer').then((m) => ({
    default: m.NovaLuxFooter,
  }))
);
const NovaLuxProductPage = React.lazy(() =>
  import('~/components/store-templates/nova-lux/pages/ProductPage').then((m) => ({
    default: m.NovaLuxProductPage,
  }))
);

const StarterStoreTemplate = React.lazy(() =>
  import('~/components/store-templates/starter-store/index').then((m) => ({
    default: m.StarterStoreTemplate,
  }))
);
const StarterStoreHeader = React.lazy(() =>
  import('~/components/store-templates/starter-store/sections/Header').then((m) => ({
    default: m.StarterStoreHeader,
  }))
);
const StarterStoreFooter = React.lazy(() =>
  import('~/components/store-templates/starter-store/sections/Footer').then((m) => ({
    default: m.StarterStoreFooter,
  }))
);

const StarterProductPage = React.lazy(() =>
  import('~/components/store-templates/starter-store/pages/ProductPage').then((m) => ({
    default: m.StarterProductPage,
  }))
);
const StarterStoreCartPage = React.lazy(() =>
  import('~/components/store-templates/starter-store/pages/CartPage').then((m) => ({
    default: m.StarterStoreCartPage,
  }))
);

// ============================================================================
// STORE TEMPLATES REGISTRY
// ============================================================================
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description:
      'Elegant design for fashion, jewelry & luxury goods with gold accents and serif typography.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/luxe-boutique.webp',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    component: LuxeBoutiqueTemplate,
    Header: LuxeBoutiqueHeader,
    Footer: LuxeBoutiqueFooter,
    ProductPage: LuxeBoutiqueProductPage,
    CartPage: LuxeCartPage,
    CollectionPage: LuxeCollectionPage,
    CheckoutPage: SharedCheckoutPage,
  },
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    description: 'World-class luxury ecommerce template inspired by Shopify Prestige.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/nova-lux.webp',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    fonts: {
      heading: 'Cormorant Garamond',
      body: 'DM Sans',
    },
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CollectionPage: SharedCollectionPage,
    CheckoutPage: SharedCheckoutPage,
  },
  {
    id: 'starter-store',
    name: 'Starter Store',
    description:
      'Complete immersive store template with working cart, checkout, search, and all pages. Perfect for demos and quick starts. Fully backend-connected in live mode.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/starter-store.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: StarterStoreCartPage,
    CollectionPage: SharedCollectionPage,
    CheckoutPage: SharedCheckoutPage,
  },
];

// ============================================================================
// MVP THEME FILTER - Only show these themes in Theme Store for MVP launch
// ============================================================================
/**
 * MVP Theme IDs - These are the only themes shown in the Theme Store UI
 * Other themes remain functional (for already installed stores) but won't
 * appear in the theme selection UI. To add more themes for customers,
 * simply add the theme ID to this array.
 *
 * Current MVP Themes (3 Core Themes):
 * 1. luxe-boutique - লাক্স বুটিক (luxury fashion, 8 sections)
 * 2. nova-lux - নোভা লাক্স (premium lifestyle, 6 sections)
 * 3. starter-store - স্টার্টার স্টোর (default, general purpose, 14 sections)
 */
export const MVP_THEME_IDS = ['luxe-boutique', 'nova-lux', 'starter-store'] as const;

export type MVPThemeId = (typeof MVP_THEME_IDS)[number];

/**
 * Filtered templates for Theme Store display (MVP only)
 * Use this in theme selection UIs instead of STORE_TEMPLATES
 */
export const MVP_STORE_TEMPLATES = STORE_TEMPLATES.filter((t) =>
  (MVP_THEME_IDS as readonly string[]).includes(t.id)
);

// ============================================================================
// DEFAULT STORE TEMPLATE - Fallback when no template is specified
// ============================================================================
export const DEFAULT_STORE_TEMPLATE_ID = 'starter-store';

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
 * Resolve active template ID from mixed legacy/new theme config shapes.
 * Supports both `storeTemplateId` and older `templateId`/`themeId` keys.
 */
export function resolveStoreTemplateId(
  themeConfig: Record<string, unknown> | null | undefined,
  legacyThemeId?: string | null
): string {
  const candidates = [
    themeConfig?.storeTemplateId,
    themeConfig?.templateId,
    themeConfig?.themeId,
    themeConfig?.presetId,
    legacyThemeId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && isValidStoreTemplateId(candidate)) {
      return candidate;
    }
  }

  return DEFAULT_STORE_TEMPLATE_ID;
}

/**
 * Get theme colors for a specific template
 */
export function getStoreTemplateTheme(id: string | undefined): StoreTemplateTheme {
  return (
    STORE_TEMPLATE_THEMES[id || DEFAULT_STORE_TEMPLATE_ID] ||
    STORE_TEMPLATE_THEMES[DEFAULT_STORE_TEMPLATE_ID]
  );
}

/**
 * Resolve template id + effective theme colors from theme config.
 * Ensures all storefront routes apply merchant-selected colors consistently.
 */
export function resolveStoreTheme(
  themeConfig: Partial<ThemeConfig> | Record<string, unknown> | null | undefined,
  legacyThemeId?: string | null
): { storeTemplateId: string; theme: StoreTemplateTheme } {
  const configRecord =
    themeConfig && typeof themeConfig === 'object'
      ? (themeConfig as Record<string, unknown>)
      : {};

  const readColor = (key: string): string | undefined => {
    const value = configRecord[key];
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  };

  const storeTemplateId = resolveStoreTemplateId(configRecord, legacyThemeId);
  const baseTheme = getStoreTemplateTheme(storeTemplateId);

  return {
    storeTemplateId,
    theme: {
      ...baseTheme,
      primary: readColor('primaryColor') || baseTheme.primary,
      accent: readColor('accentColor') || baseTheme.accent,
      background: readColor('backgroundColor') || baseTheme.background,
      text: readColor('textColor') || baseTheme.text,
      cardBorder: readColor('borderColor') || baseTheme.cardBorder,
    },
  };
}
