import * as React from 'react';
import type { StoreTemplateTheme, StoreTemplateDefinition } from './types';

export * from './types';

// ============================================================================
// Theme Imports
// ============================================================================
import { LUXE_BOUTIQUE_THEME } from '../components/store-templates/luxe-boutique/theme';
import { NOVALUX_THEME } from '../components/store-templates/nova-lux/theme';
import { STARTER_STORE_THEME } from '../components/store-templates/starter-store/theme';
import { OZZYL_PREMIUM_THEME } from '../components/store-templates/ozzyl-premium/theme';
import { DC_STORE_THEME } from '../components/store-templates/dc-store/theme';
import { DARAZ_THEME } from '../components/store-templates/daraz/theme';

// ============================================================================
// Shared Pages (Lazy Loaded)
// ============================================================================
const SharedCartPage = React.lazy(() => import('../components/store-templates/shared/CartPage'));
const SharedCheckoutPage = React.lazy(() => import('../components/store-templates/shared/CheckoutPage'));
const SharedCollectionPage = React.lazy(() => import('../components/store-templates/shared/CollectionPage'));

// ============================================================================
// Per-Theme Components & Pages (Explicit String Literals for Vite)
// ============================================================================

// Template Components
const StarterStoreTemplate = React.lazy(() => import('../components/store-templates/starter-store').then(m => ({ default: m.StarterStoreTemplate })));
const LuxeBoutiqueTemplate = React.lazy(() => import('../components/store-templates/luxe-boutique').then(m => ({ default: m.LuxeBoutiqueTemplate })));
const NovaLuxTemplate = React.lazy(() => import('../components/store-templates/nova-lux').then(m => ({ default: m.NovaLuxTemplate })));
const OzzylPremiumTemplate = React.lazy(() => import('../components/store-templates/ozzyl-premium').then(m => ({ default: m.OzzylPremiumTemplate })));
const DCStoreTemplate = React.lazy(() => import('../components/store-templates/dc-store').then(m => ({ default: m.DCStoreTemplate })));
const DarazTemplate = React.lazy(() => import('../components/store-templates/daraz').then(m => ({ default: m.DarazTemplate })));
const GhorerBazarTemplate = React.lazy(() => import('../components/store-templates/ghorer-bazar').then(m => ({ default: m.GhorerBazarTemplate })));
const TechModernTemplate = React.lazy(() => import('../components/store-templates/tech-modern').then(m => ({ default: m.TechModernTemplate })));
const AuroraMinimalTemplate = React.lazy(() => import('../components/store-templates/aurora-minimal').then(m => ({ default: m.AuroraMinimalTemplate })));
const EclipseTemplate = React.lazy(() => import('../components/store-templates/eclipse').then(m => ({ default: m.EclipseTemplate })));
const ArtisanMarketTemplate = React.lazy(() => import('../components/store-templates/artisan-market').then(m => ({ default: m.ArtisanMarketTemplate })));
const FreshnessTemplate = React.lazy(() => import('../components/store-templates/freshness').then(m => ({ default: m.FreshnessTemplate })));
const RovoTemplate = React.lazy(() => import('../components/store-templates/rovo').then(m => ({ default: m.RovoTemplate })));
const SokolTemplate = React.lazy(() => import('../components/store-templates/sokol').then(m => ({ default: m.SokolTemplate })));
const TurboSaleTemplate = React.lazy(() => import('../components/store-templates/turbo-sale').then(m => ({ default: m.TurboSaleTemplate })));
const ZenithRiseTemplate = React.lazy(() => import('../components/store-templates/zenith-rise').then(m => ({ default: m.ZenithRiseTemplate })));
const NovaLuxUltraTemplate = React.lazy(() => import('../components/store-templates/nova-lux-ultra').then(m => ({ default: m.NovaLuxUltraTemplate })));
const BdShopTemplate = React.lazy(() => import('../components/store-templates/bdshop').then(m => ({ default: m.BDShopTemplate })));

// Headers
const StarterHeader = React.lazy(() => import('../components/store-templates/starter-store/sections/Header').then(m => ({ default: m.StarterStoreHeader })));
const DarazHeader = React.lazy(() => import('../components/store-templates/daraz/sections/Header').then(m => ({ default: m.DarazHeader })));
const NovaLuxHeader = React.lazy(() => import('../components/store-templates/nova-lux/sections/Header').then(m => ({ default: m.NovaLuxHeader })));
const DCStoreHeader = React.lazy(() => import('../components/store-templates/dc-store/sections/Header').then(m => ({ default: m.DCStoreHeader })));

// Footers
const StarterFooter = React.lazy(() => import('../components/store-templates/starter-store/sections/Footer').then(m => ({ default: m.StarterStoreFooter })));
const DarazFooter = React.lazy(() => import('../components/store-templates/daraz/sections/Footer').then(m => ({ default: m.DarazFooter })));
const NovaLuxFooter = React.lazy(() => import('../components/store-templates/nova-lux/sections/Footer').then(m => ({ default: m.NovaLuxFooter })));
const DCStoreFooter = React.lazy(() => import('../components/store-templates/dc-store/sections/Footer').then(m => ({ default: m.DCStoreFooter })));

// Product Pages
const StarterProductPage = React.lazy(() => import('../components/store-templates/starter-store/pages/ProductPage').then(m => ({ default: m.StarterProductPage })));
const DarazProductPage = React.lazy(() => import('../components/store-templates/daraz/pages/ProductPage').then(m => ({ default: m.DarazProductPage })));
const NovaLuxProductPage = React.lazy(() => import('../components/store-templates/nova-lux/pages/ProductPage').then(m => ({ default: m.NovaLuxProductPage })));
const DCProductPage = React.lazy(() => import('../components/store-templates/dc-store/pages/ProductPage').then(m => ({ default: m.DCProductPage })));

// ============================================================================
// Theme Map
// ============================================================================
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  'starter-store': STARTER_STORE_THEME as StoreTemplateTheme,
  'luxe-boutique': LUXE_BOUTIQUE_THEME as StoreTemplateTheme,
  'nova-lux': NOVALUX_THEME as StoreTemplateTheme,
  'ozzyl-premium': OZZYL_PREMIUM_THEME as StoreTemplateTheme,
  'dc-store': DC_STORE_THEME as StoreTemplateTheme,
  'daraz': DARAZ_THEME as StoreTemplateTheme,
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
    Header: StarterHeader,
    Footer: StarterFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'daraz',
    name: 'Daraz Style',
    description: 'Marketplace style design inspired by popular e-commerce platforms.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/daraz.webp',
    category: 'marketplace',
    theme: STORE_TEMPLATE_THEMES['daraz'],
    component: DarazTemplate,
    Header: DarazHeader,
    Footer: DarazFooter,
    ProductPage: DarazProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Roboto', body: 'Inter' },
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
    id: 'dc-store',
    name: 'DC Store',
    description: 'Golden gradient theme with warm colors. Modern design inspired by leading e-commerce brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/dc-store.webp',
    category: 'modern',
    theme: STORE_TEMPLATE_THEMES['dc-store'],
    component: DCStoreTemplate,
    Header: DCStoreHeader,
    Footer: DCStoreFooter,
    ProductPage: DCProductPage,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: GhorerBazarTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: TechModernTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: AuroraMinimalTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    component: EclipseTemplate,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: ArtisanMarketTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: FreshnessTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    component: RovoTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
    ProductPage: StarterProductPage,
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
    component: SokolTemplate,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: TurboSaleTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: ZenithRiseTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
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
    component: NovaLuxUltraTemplate,
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
    theme: STARTER_STORE_THEME as StoreTemplateTheme,
    component: BdShopTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'ozzyl-premium',
    name: 'Ozzyl Premium',
    description: 'Luxury design for high-end stores.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/ozzyl-premium.webp',
    category: 'luxury',
    theme: STORE_TEMPLATE_THEMES['ozzyl-premium'],
    component: OzzylPremiumTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Manrope', body: 'Manrope' },
  },
  {
    id: 'luxe-boutique',
    name: 'Luxe Boutique',
    description: 'Fashion-forward boutique design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/luxe-boutique.webp',
    category: 'fashion',
    theme: STORE_TEMPLATE_THEMES['luxe-boutique'],
    component: LuxeBoutiqueTemplate,
    Header: StarterHeader,
    Footer: StarterFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Playfair Display', body: 'Lato' },
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

const ACTIVE_MVP_THEME_IDS = [
  'starter-store',
  'luxe-boutique',
  'nova-lux',
  'ozzyl-premium',
  'dc-store',
  'daraz',
  'ghorer-bazar',
  'tech-modern',
  'aurora-minimal',
  'eclipse',
  'artisan-market',
  'freshness',
  'rovo',
  'sokol',
  'turbo-sale',
  'zenith-rise',
  'nova-lux-ultra',
  'bdshop',
] as const;

export const MVP_STORE_TEMPLATES = STORE_TEMPLATES.filter((t) =>
  ACTIVE_MVP_THEME_IDS.includes(t.id as any)
);

export const DEFAULT_STORE_TEMPLATE_ID = 'starter-store';
export const MVP_THEME_IDS = ACTIVE_MVP_THEME_IDS;
export type MvpThemeId = (typeof MVP_THEME_IDS)[number];
export const getAllStoreTemplates = () => STORE_TEMPLATES;

export function resolveStoreTemplateId(
  themeConfig: Record<string, unknown> | null | undefined,
  storeTheme?: string | null
): string {
  if (storeTheme && typeof storeTheme === 'string' && (MVP_THEME_IDS as any).includes(storeTheme)) {
    return storeTheme;
  }
  if (themeConfig && themeConfig.storeTemplateId) {
    const cid = themeConfig.storeTemplateId as string;
    if ((MVP_THEME_IDS as any).includes(cid)) return cid;
  }
  return DEFAULT_STORE_TEMPLATE_ID;
}

export function resolveStoreTheme(
  mvpSettings: Record<string, unknown>,
  _themeConfigJson?: string | null
): { storeTemplateId: string; theme: StoreTemplateTheme } {
  let storeTemplateId = DEFAULT_STORE_TEMPLATE_ID;
  const rawId = mvpSettings.storeTemplateId || mvpSettings.templateId;
  if (rawId && typeof rawId === 'string' && (MVP_THEME_IDS as any).includes(rawId)) {
    storeTemplateId = rawId;
  }
  const baseTheme = STORE_TEMPLATE_THEMES[storeTemplateId] || STORE_TEMPLATE_THEMES[DEFAULT_STORE_TEMPLATE_ID];
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
