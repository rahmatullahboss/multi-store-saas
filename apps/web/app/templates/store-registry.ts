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
  // Extended demo data for preview mode
  collections?: any[];
  reviews?: any[];
  banners?: any[];
  flashSale?: any;
  flashSaleProducts?: SerializedProduct[];
  promotions?: any[];
  announcement?: any;
  testimonials?: any[];
}

// ============================================================================
// HEADER & FOOTER PROPS
// ============================================================================
export interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: any | null;
  categories: (string | null)[];
  currentCategory?: string | null;
  socialLinks?: SocialLinks | null;
  // Common state props for template headers
  count?: number;
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
  searchOpen?: boolean;
  setSearchOpen?: (open: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  isScrolled?: boolean;
  announcement?: any;
  businessInfo?: any;
}

export interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  socialLinks?: SocialLinks | null;
  footerConfig?: any | null;
  businessInfo?: { phone?: string; email?: string; address?: string } | null;
  categories: (string | null)[];
  planType?: string;
  themeColors?: any;
  isPreview?: boolean;
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
  /** Template-specific product detail page component */
  ProductPage?: ComponentType<any>;
  /** Template-specific cart page component */
  CartPage?: ComponentType<any>;
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
    footerBg: '#fef3c7',
    footerText: '#3d2f2f',
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
  daraz: {
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
  bdshop: {
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
    primary: '#fc8934', // Vibrant Orange (exact from ghorerbazar.com)
    accent: '#e53935', // Red for sale badges
    background: '#f5f5f5', // Light gray page background
    text: '#212121', // Primary text
    muted: '#757575', // Muted text
    cardBg: '#ffffff', // White card background
    headerBg: '#ffffff', // White header
    footerBg: '#1a1a1a', // Dark footer
    footerText: '#ffffff', // White footer text
  },
  'nova-lux': {
    primary: '#1C1C1E', // DEEP CHARCOAL
    accent: '#C4A35A', // ROSE GOLD
    background: '#FAFAFA',
    text: '#2C2C2C',
    muted: '#8E8E93',
    cardBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    footerBg: '#1C1C1E',
    footerText: '#FAFAFA',
  },
  eclipse: {
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
    primary: AURORA_THEME.primary,
    accent: AURORA_THEME.accent,
    background: AURORA_THEME.background,
    text: AURORA_THEME.text,
    muted: AURORA_THEME.textMuted,
    cardBg: AURORA_THEME.cardBg,
    headerBg: AURORA_THEME.headerBgSolid,
    footerBg: AURORA_THEME.footerBg,
    footerText: AURORA_THEME.footerText,
  },
  freshness: {
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
  'zenith-rise': {
    primary: ZENITH_RISE_THEME.primary,
    accent: ZENITH_RISE_THEME.accent,
    background: ZENITH_RISE_THEME.background,
    text: ZENITH_RISE_THEME.text,
    muted: ZENITH_RISE_THEME.textMuted,
    cardBg: ZENITH_RISE_THEME.surface,
    headerBg: 'rgba(2, 6, 23, 0.7)',
    footerBg: ZENITH_RISE_THEME.secondary,
    footerText: ZENITH_RISE_THEME.text,
  },
  'turbo-sale': {
    primary: TURBO_SALE_THEME.primary,
    accent: TURBO_SALE_THEME.accent,
    background: TURBO_SALE_THEME.background,
    text: TURBO_SALE_THEME.text,
    muted: TURBO_SALE_THEME.textMuted,
    cardBg: TURBO_SALE_THEME.surface,
    headerBg: TURBO_SALE_THEME.headerBg,
    footerBg: TURBO_SALE_THEME.footerBg,
    footerText: '#FFFFFF',
  },
  rovo: {
    primary: ROVO_THEME.primary,
    accent: ROVO_THEME.accent,
    background: ROVO_THEME.background,
    text: ROVO_THEME.text,
    muted: ROVO_THEME.muted,
    cardBg: ROVO_THEME.cardBg,
    headerBg: ROVO_THEME.headerBg,
    footerBg: ROVO_THEME.footerBg,
    footerText: ROVO_THEME.footerText,
  },
  sokol: {
    primary: SOKOL_THEME.primary,
    accent: SOKOL_THEME.accent,
    background: SOKOL_THEME.background,
    text: SOKOL_THEME.text,
    muted: SOKOL_THEME.muted,
    cardBg: SOKOL_THEME.cardBg,
    headerBg: SOKOL_THEME.headerBg,
    footerBg: SOKOL_THEME.footerBg,
    footerText: SOKOL_THEME.footerText,
  },
  'starter-store': {
    primary: STARTER_STORE_THEME.primary,
    accent: STARTER_STORE_THEME.accent,
    background: STARTER_STORE_THEME.background,
    text: STARTER_STORE_THEME.text,
    muted: STARTER_STORE_THEME.muted,
    cardBg: STARTER_STORE_THEME.cardBg,
    headerBg: STARTER_STORE_THEME.headerBg,
    footerBg: STARTER_STORE_THEME.footerBg,
    footerText: STARTER_STORE_THEME.footerText,
  },
};

// ============================================================================
// IMPORT TEMPLATE COMPONENTS (Dynamically Loaded)
// ============================================================================
import React from 'react';
import { FRESHNESS_THEME } from '~/components/store-templates/freshness/theme';
import { AURORA_THEME } from '~/components/store-templates/aurora-minimal/theme';
import { ZENITH_RISE_THEME } from '~/components/store-templates/zenith-rise/styles/tokens';
import { TURBO_SALE_THEME } from '~/components/store-templates/turbo-sale/styles/tokens';
import { ROVO_THEME } from '~/components/store-templates/rovo/theme';
import { SOKOL_THEME } from '~/components/store-templates/sokol/theme';
import { STARTER_STORE_THEME } from '~/components/store-templates/starter-store/theme';

// Shared Product Page for templates without their own ProductPage
const SharedProductPage = React.lazy(
  () => import('~/components/store-templates/shared/ProductPage')
);

const LuxeBoutiqueTemplate = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/index').then((m) => ({
    default: m.LuxeBoutiqueTemplate,
  }))
);
const TechModernTemplate = React.lazy(() =>
  import('~/components/store-templates/tech-modern/index').then((m) => ({
    default: m.TechModernTemplate,
  }))
);
const ArtisanMarketTemplate = React.lazy(() =>
  import('~/components/store-templates/artisan-market/index').then((m) => ({
    default: m.ArtisanMarketTemplate,
  }))
);
const DarazTemplate = React.lazy(() =>
  import('~/components/store-templates/daraz/index').then((m) => ({ default: m.DarazTemplate }))
);
const DarazProductPage = React.lazy(() =>
  import('~/components/store-templates/daraz/pages/ProductPage').then((m) => ({
    default: m.DarazProductPage,
  }))
);
const DarazCartPage = React.lazy(() =>
  import('~/components/store-templates/daraz/pages/CartPage').then((m) => ({
    default: m.DarazCartPage,
  }))
);
const BDShopTemplate = React.lazy(() =>
  import('~/components/store-templates/bdshop/index').then((m) => ({ default: m.BDShopTemplate }))
);
const BDShopProductPage = React.lazy(() =>
  import('~/components/store-templates/bdshop/pages/ProductPage').then((m) => ({
    default: m.BDShopProductPage,
  }))
);
const BDShopCartPage = React.lazy(() =>
  import('~/components/store-templates/bdshop/pages/CartPage').then((m) => ({
    default: m.BDShopCartPage,
  }))
);
const GhorerBazarTemplate = React.lazy(() =>
  import('~/components/store-templates/ghorer-bazar/index').then((m) => ({
    default: m.GhorerBazarTemplate,
  }))
);
const NovaLuxTemplate = React.lazy(() =>
  import('~/components/store-templates/nova-lux/index').then((m) => ({
    default: m.NovaLuxTemplate,
  }))
);
const EclipseTemplate = React.lazy(() =>
  import('~/components/store-templates/eclipse/index').then((m) => ({ default: m.EclipseTemplate }))
);
const AuroraMinimalTemplate = React.lazy(() =>
  import('~/components/store-templates/aurora-minimal/index').then((m) => ({
    default: m.AuroraMinimalTemplate,
  }))
);
const FreshnessTemplate = React.lazy(() =>
  import('~/components/store-templates/freshness/index').then((m) => ({
    default: m.FreshnessTemplate,
  }))
);
const ZenithRiseTemplate = React.lazy(() =>
  import('~/components/store-templates/zenith-rise/index').then((m) => ({
    default: m.ZenithRiseTemplate,
  }))
);
const TurboSaleTemplate = React.lazy(() =>
  import('~/components/store-templates/turbo-sale/index').then((m) => ({
    default: m.TurboSaleTemplate,
  }))
);
const RovoTemplate = React.lazy(() =>
  import('~/components/store-templates/rovo/index').then((m) => ({ default: m.RovoTemplate }))
);
const SokolTemplate = React.lazy(() =>
  import('~/components/store-templates/sokol/index').then((m) => ({ default: m.SokolTemplate }))
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

// Header Components
const DarazHeader = React.lazy(() =>
  import('~/components/store-templates/daraz/sections/Header').then((m) => ({
    default: m.DarazHeader,
  }))
);
const NovaLuxHeader = React.lazy(() =>
  import('~/components/store-templates/nova-lux/sections/Header').then((m) => ({
    default: m.NovaLuxHeader,
  }))
);
const EclipseHeader = React.lazy(() =>
  import('~/components/store-templates/eclipse/sections/Header').then((m) => ({
    default: m.EclipseHeader,
  }))
);
const BDShopHeader = React.lazy(() =>
  import('~/components/store-templates/bdshop/sections/Header').then((m) => ({
    default: m.BDShopHeader,
  }))
);
const GhorerBazarHeader = React.lazy(() =>
  import('~/components/store-templates/ghorer-bazar/sections/Header').then((m) => ({
    default: m.GhorerBazarHeader,
  }))
);
const LuxeBoutiqueHeader = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/sections/Header').then((m) => ({
    default: m.LuxeBoutiqueHeader,
  }))
);
const TechModernHeader = React.lazy(() =>
  import('~/components/store-templates/tech-modern/sections/Header').then((m) => ({
    default: m.TechModernHeader,
  }))
);
const ArtisanMarketHeader = React.lazy(() =>
  import('~/components/store-templates/artisan-market/sections/Header').then((m) => ({
    default: m.ArtisanMarketHeader,
  }))
);
const AuroraMinimalHeader = React.lazy(() =>
  import('~/components/store-templates/aurora-minimal/sections/Header').then((m) => ({
    default: m.AuroraMinimalHeader,
  }))
);
const FreshnessHeader = React.lazy(() =>
  import('~/components/store-templates/freshness/sections/Header').then((m) => ({
    default: m.FreshnessHeader,
  }))
);

// Footer Components
const DarazFooter = React.lazy(() =>
  import('~/components/store-templates/daraz/sections/Footer').then((m) => ({
    default: m.DarazFooter,
  }))
);
const NovaLuxFooter = React.lazy(() =>
  import('~/components/store-templates/nova-lux/sections/Footer').then((m) => ({
    default: m.NovaLuxFooter,
  }))
);
const EclipseFooter = React.lazy(() =>
  import('~/components/store-templates/eclipse/sections/Footer').then((m) => ({
    default: m.EclipseFooter,
  }))
);
const BDShopFooter = React.lazy(() =>
  import('~/components/store-templates/bdshop/sections/Footer').then((m) => ({
    default: m.BDShopFooter,
  }))
);
const GhorerBazarFooter = React.lazy(() =>
  import('~/components/store-templates/ghorer-bazar/sections/Footer').then((m) => ({
    default: m.GhorerBazarFooter,
  }))
);
const LuxeBoutiqueFooter = React.lazy(() =>
  import('~/components/store-templates/luxe-boutique/sections/Footer').then((m) => ({
    default: m.LuxeBoutiqueFooter,
  }))
);
const TechModernFooter = React.lazy(() =>
  import('~/components/store-templates/tech-modern/sections/Footer').then((m) => ({
    default: m.TechModernFooter,
  }))
);
const ArtisanMarketFooter = React.lazy(() =>
  import('~/components/store-templates/artisan-market/sections/Footer').then((m) => ({
    default: m.ArtisanMarketFooter,
  }))
);
const AuroraMinimalFooter = React.lazy(() =>
  import('~/components/store-templates/aurora-minimal/sections/Footer').then((m) => ({
    default: m.AuroraMinimalFooter,
  }))
);
const FreshnessFooter = React.lazy(() =>
  import('~/components/store-templates/freshness/sections/Footer').then((m) => ({
    default: m.FreshnessFooter,
  }))
);
const ZenithRiseHeader = React.lazy(() =>
  import('~/components/store-templates/zenith-rise/sections/Header').then((m) => ({
    default: m.ZenithRiseHeader,
  }))
);
const ZenithRiseFooter = React.lazy(() =>
  import('~/components/store-templates/zenith-rise/sections/Footer').then((m) => ({
    default: m.ZenithRiseFooter,
  }))
);
const TurboSaleHeader = React.lazy(() =>
  import('~/components/store-templates/turbo-sale/sections/Header').then((m) => ({
    default: m.TurboSaleHeader,
  }))
);
const TurboSaleFooter = React.lazy(() =>
  import('~/components/store-templates/turbo-sale/sections/Footer').then((m) => ({
    default: m.TurboSaleFooter,
  }))
);

const RovoHeader = React.lazy(() =>
  import('~/components/store-templates/rovo/sections/Header').then((m) => ({
    default: m.RovoHeader,
  }))
);
const RovoFooter = React.lazy(() =>
  import('~/components/store-templates/rovo/sections/Footer').then((m) => ({
    default: m.RovoFooter,
  }))
);

const SokolHeader = React.lazy(() =>
  import('~/components/store-templates/sokol/sections/Header').then((m) => ({
    default: m.SokolHeader,
  }))
);
const SokolFooter = React.lazy(() =>
  import('~/components/store-templates/sokol/sections/Footer').then((m) => ({
    default: m.SokolFooter,
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
    thumbnail: '/templates/luxe-boutique.png',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    component: LuxeBoutiqueTemplate,
    Header: LuxeBoutiqueHeader,
    Footer: LuxeBoutiqueFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description:
      'Clean, bold design for electronics & tech products with blue accents and modern feel.',
    thumbnail: '/templates/tech-modern.png',
    category: 'tech',
    theme: STORE_TEMPLATE_THEMES['tech-modern'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: TechModernTemplate,
    Header: TechModernHeader,
    Footer: TechModernFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'artisan-market',
    name: 'Artisan Market',
    description:
      'Warm, organic design for handmade & artisanal products with amber accents and rustic feel.',
    thumbnail: '/templates/artisan-market.png',
    category: 'artisan',
    theme: STORE_TEMPLATE_THEMES['artisan-market'],
    fonts: {
      heading: 'Newsreader',
      body: 'Work Sans',
    },
    component: ArtisanMarketTemplate,
    Header: ArtisanMarketHeader,
    Footer: ArtisanMarketFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'daraz',
    name: 'Daraz Style',
    description:
      'Daraz Bangladesh-inspired marketplace design with orange theme, category sidebar, flash sales, and modern grid layout.',
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
    ProductPage: DarazProductPage,
    CartPage: DarazCartPage,
  },
  {
    id: 'bdshop',
    name: 'BDShop Style',
    description:
      'BDShop-inspired modern electronics store template with navy blue theme, mobile-first design, top deals carousel, FAQ section, and dark footer.',
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
    ProductPage: BDShopProductPage,
    CartPage: BDShopCartPage,
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description:
      'Ghorer Bazar-inspired design with orange theme, clean product cards, Quick Add buttons, and COD-focused checkout flow.',
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
    ProductPage: SharedProductPage,
  },
  {
    id: 'nova-lux',
    name: 'NovaLux Premium',
    description:
      'World-class luxury design with rose gold accents, transparent header, and elegant animations. Perfect for premium fashion and lifestyle brands.',
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
    ProductPage: SharedProductPage,
  },
  {
    id: 'eclipse',
    name: 'Eclipse Future',
    description:
      'A futuristic dark-mode template with neon accents, bento layouts, and spotlight interactions. The cutting edge of 2025.',
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
    ProductPage: SharedProductPage,
  },
  {
    id: 'aurora-minimal',
    name: 'Aurora Minimal',
    description:
      'Ultra-minimalist design with soft gradients, floating elements, and a focus on visual whitespace and elegant typography.',
    thumbnail: '/templates/aurora-minimal.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['aurora-minimal'],
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
    },
    component: AuroraMinimalTemplate,
    Header: AuroraMinimalHeader,
    Footer: AuroraMinimalFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'freshness',
    name: 'Freshness',
    description:
      'Vibrant, organic-focused design perfect for grocery, health, and natural product stores with a clean, lively feel.',
    thumbnail: '/templates/freshness.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['freshness'],
    fonts: {
      heading: 'Pacifico',
      body: 'Inter',
    },
    component: FreshnessTemplate,
    Header: FreshnessHeader,
    Footer: FreshnessFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'zenith-rise',
    name: 'Zenith Rise (2025)',
    description:
      'World-Class Conversion Focused Template. Dark mode, glassmorphism, and high-impact aesthetics defining 2025 design trends.',
    thumbnail: '/templates/zenith-rise.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['zenith-rise'],
    fonts: {
      heading: 'Outfit',
      body: 'Inter',
    },
    component: ZenithRiseTemplate,
    Header: ZenithRiseHeader,
    Footer: ZenithRiseFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'turbo-sale',
    name: 'Turbo Sale (BD)',
    description:
      'High urgency, video-first template optimized for the Bangladeshi market. Features comparison tables and sticky mobile CTAs.',
    thumbnail: '/templates/turbo-sale.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['turbo-sale'],
    fonts: {
      heading: 'Hind Siliguri',
      body: 'Hind Siliguri',
    },
    component: TurboSaleTemplate,
    Header: TurboSaleHeader,
    Footer: TurboSaleFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'rovo',
    name: 'Rovo (Full Store)',
    description: 'Complete store theme matching RovoLife. Clean, modern, and conversion-focused.',
    thumbnail: '/templates/rovo.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['rovo'],
    fonts: {
      heading: 'Oswald',
      body: 'Inter',
    },
    component: RovoTemplate,
    Header: RovoHeader,
    Footer: RovoFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'sokol',
    name: 'Sokol Modern',
    description:
      'Clean modern template with rose accent, default sections, and dummy products pre-configured. Perfect for quick setup.',
    thumbnail: '/templates/sokol.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['sokol'],
    fonts: {
      heading: 'Poppins',
      body: 'Inter',
    },
    component: SokolTemplate,
    Header: SokolHeader,
    Footer: SokolFooter,
    ProductPage: SharedProductPage,
  },
  {
    id: 'starter-store',
    name: 'Starter Store',
    description:
      'Complete immersive store template with working cart, checkout, search, and all pages. Perfect for demos and quick starts. Fully backend-connected in live mode.',
    thumbnail: '/templates/starter-store.png',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    fonts: {
      heading: 'Inter',
      body: 'Inter',
    },
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: SharedProductPage,
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
  return (
    STORE_TEMPLATE_THEMES[id || DEFAULT_STORE_TEMPLATE_ID] ||
    STORE_TEMPLATE_THEMES[DEFAULT_STORE_TEMPLATE_ID]
  );
}
