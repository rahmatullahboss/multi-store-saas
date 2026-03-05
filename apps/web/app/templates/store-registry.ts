import * as React from 'react';
import type { StoreTemplateTheme, StoreTemplateDefinition } from './types';

export * from './types';

// ============================================================================
// Theme Imports (Named Exports from each theme file)
// ============================================================================
import { LUXE_BOUTIQUE_THEME } from '../components/store-templates/luxe-boutique/theme';
import { NOVALUX_THEME } from '../components/store-templates/nova-lux/theme';
import { STARTER_STORE_THEME } from '../components/store-templates/starter-store/theme';
import { OZZYL_PREMIUM_THEME } from '../components/store-templates/ozzyl-premium/theme';
import { DC_STORE_THEME } from '../components/store-templates/dc-store/theme';

// ============================================================================
// Shared Pages (Lazy Loaded)
// ============================================================================
const SharedCartPage = React.lazy(() => import('../components/store-templates/shared/CartPage'));
const SharedCheckoutPage = React.lazy(
  () => import('../components/store-templates/shared/CheckoutPage')
);
const SharedCollectionPage = React.lazy(
  () => import('../components/store-templates/shared/CollectionPage')
);

// ============================================================================
// Per-Theme Product Pages (Named Lazy Exports)
// ============================================================================
const StarterProductPage = React.lazy(() =>
  import('../components/store-templates/starter-store/pages/ProductPage').then((m) => ({
    default: m.StarterProductPage,
  }))
);
const LuxeProductPage = React.lazy(() =>
  import('../components/store-templates/luxe-boutique/pages/ProductPage').then((m) => ({
    default: m.LuxeBoutiqueProductPage,
  }))
);
const NovaLuxProductPage = React.lazy(() =>
  import('../components/store-templates/nova-lux/pages/ProductPage').then((m) => ({
    default: m.NovaLuxProductPage,
  }))
);
const DCProductPage = React.lazy(() =>
  import('../components/store-templates/dc-store/pages/ProductPage').then((m) => ({
    default: m.DCProductPage,
  }))
);
const DCCartPage = React.lazy(() =>
  import('../components/store-templates/dc-store/pages/CartPage').then((m) => ({
    default: m.DCCartPage,
  }))
);
const DCCheckoutPage = React.lazy(() =>
  import('../components/store-templates/dc-store/pages/CheckoutPage').then((m) => ({
    default: m.DCCheckoutPage,
  }))
);
const DCCollectionPage = React.lazy(() =>
  import('../components/store-templates/dc-store/pages/CollectionPage').then((m) => ({
    default: m.DCCollectionPage,
  }))
);

// ============================================================================
// Lazy Template Components
// ============================================================================

// --- Luxe Boutique ---
const LuxeBoutiqueTemplate = React.lazy(() =>
  import('../components/store-templates/luxe-boutique').then((m) => ({
    default: m.LuxeBoutiqueTemplate,
  }))
);
const LuxeBoutiqueHeader = React.lazy(() =>
  import('../components/store-templates/luxe-boutique/sections/Header').then((m) => ({
    default: m.LuxeBoutiqueHeader,
  }))
);
const LuxeBoutiqueFooter = React.lazy(() =>
  import('../components/store-templates/luxe-boutique/sections/Footer').then((m) => ({
    default: m.LuxeBoutiqueFooter,
  }))
);

// --- Nova Lux ---
const NovaLuxTemplate = React.lazy(() =>
  import('../components/store-templates/nova-lux').then((m) => ({ default: m.NovaLuxTemplate }))
);
const NovaLuxHeader = React.lazy(() =>
  import('../components/store-templates/nova-lux/sections/Header').then((m) => ({
    default: m.NovaLuxHeader,
  }))
);
const NovaLuxFooter = React.lazy(() =>
  import('../components/store-templates/nova-lux/sections/Footer').then((m) => ({
    default: m.NovaLuxFooter,
  }))
);

// --- Starter Store ---
const StarterStoreTemplate = React.lazy(() =>
  import('../components/store-templates/starter-store').then((m) => ({
    default: m.StarterStoreTemplate,
  }))
);
const StarterStoreHeader = React.lazy(() =>
  import('../components/store-templates/starter-store/sections/Header').then((m) => ({
    default: m.StarterStoreHeader,
  }))
);
const StarterStoreFooter = React.lazy(() =>
  import('../components/store-templates/starter-store/sections/Footer').then((m) => ({
    default: m.StarterStoreFooter,
  }))
);

// --- Ozzyl Premium ---
const OzzylPremiumTemplate = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium').then((m) => ({
    default: m.OzzylPremiumTemplate,
  }))
);
const OzzylPremiumHeader = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/sections/Header').then((m) => ({
    default: m.OzzylPremiumHeader,
  }))
);
const OzzylPremiumFooter = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/sections/Footer').then((m) => ({
    default: m.OzzylPremiumFooter,
  }))
);
const OzzylPremiumProductPage = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/pages/ProductPage').then((m) => ({
    default: m.OzzylPremiumProductPage,
  }))
);
const OzzylPremiumCartPage = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/pages/CartPage').then((m) => ({
    default: m.OzzylPremiumCartPage,
  }))
);
const OzzylPremiumCheckoutPage = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/pages/CheckoutPage').then((m) => ({
    default: m.OzzylPremiumCheckoutPage,
  }))
);
const OzzylPremiumCollectionPage = React.lazy(() =>
  import('../components/store-templates/ozzyl-premium/pages/CollectionPage').then((m) => ({
    default: m.OzzylPremiumCollectionPage,
  }))
);

// --- DC Store ---
const DCStoreTemplate = React.lazy(() =>
  import('../components/store-templates/dc-store').then((m) => ({
    default: m.DCStoreTemplate,
  }))
);
const DCStoreHeader = React.lazy(() =>
  import('../components/store-templates/dc-store/sections/Header').then((m) => ({
    default: m.DCStoreHeader,
  }))
);
const DCStoreFooter = React.lazy(() =>
  import('../components/store-templates/dc-store/sections/Footer').then((m) => ({
    default: m.DCStoreFooter,
  }))
);

// ============================================================================
// Theme Map
// ============================================================================
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  'luxe-boutique': LUXE_BOUTIQUE_THEME as StoreTemplateTheme,
  'nova-lux': NOVALUX_THEME as StoreTemplateTheme,
  'starter-store': STARTER_STORE_THEME as StoreTemplateTheme,
  'ozzyl-premium': OZZYL_PREMIUM_THEME as StoreTemplateTheme,
  'dc-store': DC_STORE_THEME as StoreTemplateTheme,
};

// ============================================================================
// STORE_TEMPLATES Array
// ============================================================================
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'starter-store',
    name: 'Starter Store',
    description: 'A clean, modern starting point for your store.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/starter-store.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Elegant and sophisticated design for luxury brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/luxe-boutique.webp',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    component: LuxeBoutiqueTemplate,
    Header: LuxeBoutiqueHeader,
    Footer: LuxeBoutiqueFooter,
    ProductPage: LuxeProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Playfair Display', body: 'Lato' },
  },
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    description: 'Dark, modern, and sleek design for tech and fashion.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/nova-lux.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'ozzyl-premium',
    name: 'Ozzyl Premium',
    description:
      'Award-winning luxury dark theme with gold accents. World-class design for premium brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/ozzyl-premium.webp',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['ozzyl-premium'],
    component: OzzylPremiumTemplate,
    Header: OzzylPremiumHeader,
    Footer: OzzylPremiumFooter,
    ProductPage: OzzylPremiumProductPage,
    CartPage: OzzylPremiumCartPage,
    CheckoutPage: OzzylPremiumCheckoutPage,
    CollectionPage: OzzylPremiumCollectionPage,
    fonts: { heading: 'Manrope', body: 'Manrope' },
  },
  {
    id: 'dc-store',
    name: 'DC Store',
    description:
      'Golden gradient theme with warm colors. Modern design inspired by leading e-commerce brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/dc-store.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['dc-store'],
    component: DCStoreTemplate,
    Header: DCStoreHeader,
    Footer: DCStoreFooter,
    ProductPage: DCProductPage,
    CartPage: DCCartPage,
    CheckoutPage: DCCheckoutPage,
    CollectionPage: DCCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  // Locked Premium Themes
  {
    id: 'daraz',
    name: 'Daraz Style',
    description: 'Marketplace style design inspired by popular e-commerce platforms.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/daraz.webp',
    category: 'marketplace',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description: 'Perfect for grocery and daily needs stores with fresh colors.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/ghorer-bazar.webp',
    category: 'grocery',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Sleek design for electronics and tech gadgets stores.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/tech-modern.webp',
    category: 'tech',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'aurora-minimal',
    name: 'Aurora Minimal',
    description: 'Clean and minimal aesthetic for modern brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/aurora-minimal.webp',
    category: 'minimal',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'eclipse',
    name: 'Eclipse',
    description: 'Dark mode theme with bold contrast for premium brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/eclipse.webp',
    category: 'dark',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'artisan-market',
    name: 'Artisan Market',
    description: 'Handmade and crafts marketplace design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/artisan-market.webp',
    category: 'handmade',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'freshness',
    name: 'Freshness',
    description: 'Organic and fresh produce store design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/freshness.webp',
    category: 'organic',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'rovo',
    name: 'Rovo',
    description: 'High-fashion luxury store design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/rovo.webp',
    category: 'fashion',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    component: LuxeBoutiqueTemplate,
    Header: LuxeBoutiqueHeader,
    Footer: LuxeBoutiqueFooter,
    ProductPage: LuxeProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Playfair Display', body: 'Lato' },
  },
  {
    id: 'sokol',
    name: 'Sokol',
    description: 'Modern dark theme with elegant accents.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/sokol.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'turbo-sale',
    name: 'Turbo Sale',
    description: 'High-conversion flash sale and dropshipping theme.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/turbo-sale.webp',
    category: 'sales',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'zenith-rise',
    name: 'Zenith Rise',
    description: 'SaaS and digital products store design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/zenith-rise.webp',
    category: 'saas',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'nova-lux-ultra',
    name: 'Nova Lux Ultra',
    description: 'Enhanced version of Nova Lux with more features.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/nova-lux-ultra.webp',
    category: 'premium',
    theme: STORE_TEMPLATE_THEMES['nova-lux'],
    component: NovaLuxTemplate,
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'bdshop',
    name: 'BDShop',
    description: 'Localized design for Bangladeshi e-commerce.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/bdshop.webp',
    category: 'local',
    theme: STORE_TEMPLATE_THEMES['starter-store'],
    component: StarterStoreTemplate,
    Header: StarterStoreHeader,
    Footer: StarterStoreFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

export const getStoreTemplate = (templateId: string): StoreTemplateDefinition => {
  return STORE_TEMPLATES.find((t) => t.id === templateId) || STORE_TEMPLATES[0];
};

export const getStoreTemplateTheme = (templateId: string): StoreTemplateTheme => {
  return getStoreTemplate(templateId).theme;
};

// ============================================================================
// MVP Store Templates - Only active themes for production
// ============================================================================
const ACTIVE_MVP_THEME_IDS = [
  'starter-store',
  'luxe-boutique',
  'nova-lux',
  'dc-store',
] as const;

export const MVP_STORE_TEMPLATES = STORE_TEMPLATES.filter((t) =>
  ACTIVE_MVP_THEME_IDS.includes(t.id as (typeof ACTIVE_MVP_THEME_IDS)[number])
);

export const DEFAULT_STORE_TEMPLATE_ID = 'starter-store';

export const MVP_THEME_IDS = ACTIVE_MVP_THEME_IDS;
export type MvpThemeId = (typeof MVP_THEME_IDS)[number];

// Alias for libs that use getAllStoreTemplates
export const getAllStoreTemplates = () => STORE_TEMPLATES;

// ============================================================================
// resolveStoreTemplateId — extracts templateId from themeConfig JSON or store.theme
// ============================================================================
export function resolveStoreTemplateId(
  themeConfig: Record<string, unknown> | null | undefined,
  _storeTheme?: string | null
): string {
  // If we have themeConfig, check for its storeTemplateId
  if (themeConfig) {
    if (
      themeConfig.storeTemplateId &&
      typeof themeConfig.storeTemplateId === 'string' &&
      (MVP_THEME_IDS as unknown as string[]).includes(themeConfig.storeTemplateId)
    ) {
      return themeConfig.storeTemplateId;
    }
  }

  return DEFAULT_STORE_TEMPLATE_ID;
}

// ============================================================================
// resolveStoreTheme — resolves templateId + merged theme from mvp settings
// ============================================================================
export function resolveStoreTheme(
  mvpSettings: Record<string, unknown>,
  _themeConfigJson?: string | null
): { storeTemplateId: string; theme: StoreTemplateTheme } {
  // Resolve templateId from canonical settings only.
  let storeTemplateId = DEFAULT_STORE_TEMPLATE_ID;

  // Check both possible keys in unified settings
  const rawId = mvpSettings.storeTemplateId || mvpSettings.templateId;

  if (
    rawId &&
    typeof rawId === 'string' &&
    (MVP_THEME_IDS as unknown as string[]).includes(rawId)
  ) {
    storeTemplateId = rawId;
  }

  // Get base theme for the template
  const baseTheme =
    STORE_TEMPLATE_THEMES[storeTemplateId] || STORE_TEMPLATE_THEMES[DEFAULT_STORE_TEMPLATE_ID];

  // Merge user overrides from mvp settings
  const merged: StoreTemplateTheme = {
    ...baseTheme,
    ...(mvpSettings.primaryColor ? { primary: mvpSettings.primaryColor as string } : {}),
    ...(mvpSettings.accentColor ? { accent: mvpSettings.accentColor as string } : {}),
    ...(mvpSettings.backgroundColor ? { background: mvpSettings.backgroundColor as string } : {}),
    ...(mvpSettings.textColor ? { text: mvpSettings.textColor as string } : {}),
    ...(mvpSettings.borderColor ? { cardBorder: mvpSettings.borderColor as string } : {}),
  };

  return { storeTemplateId, theme: merged };
}
