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
import { DARAZ_THEME } from '../components/store-templates/daraz/theme';
import { ECLIPSE_THEME } from '../components/store-templates/eclipse/theme';
import { ROVO_THEME } from '../components/store-templates/rovo/theme';
import { SOKOL_THEME } from '../components/store-templates/sokol/theme';
import { GHORER_BAZAR_THEME } from '../components/store-templates/ghorer-bazar/theme';
import { TECH_MODERN_THEME } from '../components/store-templates/tech-modern/theme';
import { AURORA_THEME } from '../components/store-templates/aurora-minimal/theme';
import { ARTISAN_MARKET_THEME } from '../components/store-templates/artisan-market/theme';
import { FRESHNESS_THEME } from '../components/store-templates/freshness/theme';
import { TURBO_SALE_THEME } from '../components/store-templates/turbo-sale/theme';
import { ZENITH_RISE_THEME } from '../components/store-templates/zenith-rise/theme';
import { BDSHOP_THEME } from '../components/store-templates/bdshop/theme';
import { NOVALUX_ULTRA_THEME } from '../components/store-templates/nova-lux-ultra/theme';

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
// STARTER STORE
// ============================================================================
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
const StarterProductPage = React.lazy(() =>
  import('../components/store-templates/starter-store/pages/ProductPage').then((m) => ({
    default: m.StarterProductPage,
  }))
);

// ============================================================================
// LUXE BOUTIQUE
// ============================================================================
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
const LuxeProductPage = React.lazy(() =>
  import('../components/store-templates/luxe-boutique/pages/ProductPage').then((m) => ({
    default: m.LuxeBoutiqueProductPage,
  }))
);

// ============================================================================
// NOVA LUX
// ============================================================================
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
const NovaLuxProductPage = React.lazy(() =>
  import('../components/store-templates/nova-lux/pages/ProductPage').then((m) => ({
    default: m.NovaLuxProductPage,
  }))
);

// ============================================================================
// OZZYL PREMIUM
// ============================================================================
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

// ============================================================================
// DC STORE
// ============================================================================
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
// DARAZ
// ============================================================================
const DarazTemplate = React.lazy(() =>
  import('../components/store-templates/daraz').then((m) => ({
    default: m.DarazTemplate,
  }))
);
const DarazHeader = React.lazy(() =>
  import('../components/store-templates/daraz/sections/Header').then((m) => ({
    default: m.DarazHeader,
  }))
);
const DarazFooter = React.lazy(() =>
  import('../components/store-templates/daraz/sections/Footer').then((m) => ({
    default: m.DarazFooter,
  }))
);
const DarazProductPage = React.lazy(() =>
  import('../components/store-templates/daraz/pages/ProductPage').then((m) => ({
    default: m.DarazProductPage,
  }))
);
const DarazCartPage = React.lazy(() =>
  import('../components/store-templates/daraz/pages/CartPage').then((m) => ({
    default: m.DarazCartPage,
  }))
);

// ============================================================================
// ECLIPSE
// ============================================================================
const EclipseTemplate = React.lazy(() =>
  import('../components/store-templates/eclipse').then((m) => ({
    default: m.LiveEclipseTemplate,
  }))
);
const EclipseHeader = React.lazy(() =>
  import('../components/store-templates/eclipse/sections/Header').then((m) => ({
    default: m.EclipseHeader,
  }))
);
const EclipseFooter = React.lazy(() =>
  import('../components/store-templates/eclipse/sections/Footer').then((m) => ({
    default: m.EclipseFooter,
  }))
);
const EclipseProductPage = React.lazy(() =>
  import('../components/store-templates/eclipse/pages/ProductPage').then((m) => ({
    default: m.default,
  }))
);

// ============================================================================
// ROVO
// ============================================================================
const RovoTemplate = React.lazy(() =>
  import('../components/store-templates/rovo').then((m) => ({
    default: m.RovoTemplate,
  }))
);
const RovoHeader = React.lazy(() =>
  import('../components/store-templates/rovo/sections/Header').then((m) => ({
    default: m.RovoHeader,
  }))
);
const RovoFooter = React.lazy(() =>
  import('../components/store-templates/rovo/sections/Footer').then((m) => ({
    default: m.RovoFooter,
  }))
);

// ============================================================================
// SOKOL
// ============================================================================
const SokolTemplate = React.lazy(() =>
  import('../components/store-templates/sokol').then((m) => ({
    default: m.SokolTemplate,
  }))
);
const SokolHeader = React.lazy(() =>
  import('../components/store-templates/sokol/sections/Header').then((m) => ({
    default: m.SokolHeader,
  }))
);
const SokolFooter = React.lazy(() =>
  import('../components/store-templates/sokol/sections/Footer').then((m) => ({
    default: m.SokolFooter,
  }))
);

// ============================================================================
// GHORER BAZAR
// ============================================================================
const GhorerBazarTemplate = React.lazy(() =>
  import('../components/store-templates/ghorer-bazar').then((m) => ({
    default: m.GhorerBazarTemplate,
  }))
);
const GhorerBazarHeader = React.lazy(() =>
  import('../components/store-templates/ghorer-bazar/sections/Header').then((m) => ({
    default: m.GhorerBazarHeader,
  }))
);
const GhorerBazarFooter = React.lazy(() =>
  import('../components/store-templates/ghorer-bazar/sections/Footer').then((m) => ({
    default: m.GhorerBazarFooter,
  }))
);
const GhorerBazarProductPage = React.lazy(() =>
  import('../components/store-templates/ghorer-bazar/pages/ProductPage').then((m) => ({
    default: m.GhorerBazarProductPage,
  }))
);

// ============================================================================
// TECH MODERN
// ============================================================================
const TechModernTemplate = React.lazy(() =>
  import('../components/store-templates/tech-modern').then((m) => ({
    default: m.TechModernTemplate,
  }))
);
const TechModernHeader = React.lazy(() =>
  import('../components/store-templates/tech-modern/sections/Header').then((m) => ({
    default: m.TechModernHeader,
  }))
);
const TechModernFooter = React.lazy(() =>
  import('../components/store-templates/tech-modern/sections/Footer').then((m) => ({
    default: m.TechModernFooter,
  }))
);
const TechModernProductPage = React.lazy(() =>
  import('../components/store-templates/tech-modern/pages/ProductPage').then((m) => ({
    default: m.TechModernProductPage,
  }))
);
const TechModernCartPage = React.lazy(() =>
  import('../components/store-templates/tech-modern/pages/CartPage').then((m) => ({
    default: m.TechCartPage,
  }))
);
const TechModernCollectionPage = React.lazy(() =>
  import('../components/store-templates/tech-modern/pages/CollectionPage').then((m) => ({
    default: m.TechCollectionPage,
  }))
);

// ============================================================================
// AURORA MINIMAL
// ============================================================================
const AuroraMinimalTemplate = React.lazy(() =>
  import('../components/store-templates/aurora-minimal').then((m) => ({
    default: m.AuroraMinimalTemplate,
  }))
);
const AuroraMinimalHeader = React.lazy(() =>
  import('../components/store-templates/aurora-minimal/sections/Header').then((m) => ({
    default: m.AuroraMinimalHeader,
  }))
);
const AuroraMinimalFooter = React.lazy(() =>
  import('../components/store-templates/aurora-minimal/sections/Footer').then((m) => ({
    default: m.AuroraMinimalFooter,
  }))
);

// ============================================================================
// ARTISAN MARKET
// ============================================================================
const ArtisanMarketTemplate = React.lazy(() =>
  import('../components/store-templates/artisan-market').then((m) => ({
    default: m.ArtisanMarketTemplate,
  }))
);
const ArtisanMarketHeader = React.lazy(() =>
  import('../components/store-templates/artisan-market/sections/Header').then((m) => ({
    default: m.ArtisanMarketHeader,
  }))
);
const ArtisanMarketFooter = React.lazy(() =>
  import('../components/store-templates/artisan-market/sections/Footer').then((m) => ({
    default: m.ArtisanMarketFooter,
  }))
);

// ============================================================================
// FRESHNESS
// ============================================================================
const FreshnessTemplate = React.lazy(() =>
  import('../components/store-templates/freshness').then((m) => ({
    default: m.FreshnessTemplate,
  }))
);
const FreshnessHeader = React.lazy(() =>
  import('../components/store-templates/freshness/sections/Header').then((m) => ({
    default: m.FreshnessHeader,
  }))
);
const FreshnessFooter = React.lazy(() =>
  import('../components/store-templates/freshness/sections/Footer').then((m) => ({
    default: m.FreshnessFooter,
  }))
);
const FreshnessProductPage = React.lazy(() =>
  import('../components/store-templates/freshness/pages/ProductPage').then((m) => ({
    default: m.FreshnessProductPage,
  }))
);
const FreshnessCartPage = React.lazy(() =>
  import('../components/store-templates/freshness/pages/CartPage').then((m) => ({
    default: m.FreshnessCartPage,
  }))
);

// ============================================================================
// TURBO SALE
// ============================================================================
const TurboSaleTemplate = React.lazy(() =>
  import('../components/store-templates/turbo-sale').then((m) => ({
    default: m.TurboSaleTemplate,
  }))
);
const TurboSaleHeader = React.lazy(() =>
  import('../components/store-templates/turbo-sale/sections/Header').then((m) => ({
    default: m.TurboSaleHeader,
  }))
);
const TurboSaleFooter = React.lazy(() =>
  import('../components/store-templates/turbo-sale/sections/Footer').then((m) => ({
    default: m.TurboSaleFooter,
  }))
);

// ============================================================================
// ZENITH RISE
// ============================================================================
const ZenithRiseTemplate = React.lazy(() =>
  import('../components/store-templates/zenith-rise').then((m) => ({
    default: m.ZenithRiseTemplate,
  }))
);
const ZenithRiseHeader = React.lazy(() =>
  import('../components/store-templates/zenith-rise/sections/Header').then((m) => ({
    default: m.ZenithRiseHeader,
  }))
);
const ZenithRiseFooter = React.lazy(() =>
  import('../components/store-templates/zenith-rise/sections/Footer').then((m) => ({
    default: m.ZenithRiseFooter,
  }))
);

// ============================================================================
// NOVA LUX ULTRA
// ============================================================================
const NovaLuxUltraTemplate = React.lazy(() =>
  import('../components/store-templates/nova-lux-ultra').then((m) => ({
    default: m.NovaLuxUltraTemplate,
  }))
);
const NovaLuxUltraHeader = React.lazy(() =>
  import('../components/store-templates/nova-lux-ultra/sections/Header').then((m) => ({
    default: m.NovaLuxUltraHeader,
  }))
);
const NovaLuxUltraFooter = React.lazy(() =>
  import('../components/store-templates/nova-lux-ultra/sections/Footer').then((m) => ({
    default: m.NovaLuxUltraFooter,
  }))
);
const NovaLuxUltraProductPage = React.lazy(() =>
  import('../components/store-templates/nova-lux-ultra/pages/ProductPage').then((m) => ({
    default: m.default,
  }))
);
const NovaLuxUltraCartPage = React.lazy(() =>
  import('../components/store-templates/nova-lux-ultra/pages/CartPage').then((m) => ({
    default: m.default,
  }))
);

// ============================================================================
// BDSHOP
// ============================================================================
const BDShopTemplate = React.lazy(() =>
  import('../components/store-templates/bdshop').then((m) => ({
    default: m.BDShopTemplate,
  }))
);
const BDShopHeader = React.lazy(() =>
  import('../components/store-templates/bdshop/sections/Header').then((m) => ({
    default: m.BDShopHeader,
  }))
);
const BDShopFooter = React.lazy(() =>
  import('../components/store-templates/bdshop/sections/Footer').then((m) => ({
    default: m.BDShopFooter,
  }))
);
const BDShopProductPage = React.lazy(() =>
  import('../components/store-templates/bdshop/pages/ProductPage').then((m) => ({
    default: m.BDShopProductPage,
  }))
);
const BDShopCartPage = React.lazy(() =>
  import('../components/store-templates/bdshop/pages/CartPage').then((m) => ({
    default: m.BDShopCartPage,
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
  'daraz': DARAZ_THEME as StoreTemplateTheme,
  'eclipse': ECLIPSE_THEME as unknown as StoreTemplateTheme,
  'rovo': ROVO_THEME as StoreTemplateTheme,
  'sokol': SOKOL_THEME as StoreTemplateTheme,
  'ghorer-bazar': GHORER_BAZAR_THEME as unknown as StoreTemplateTheme,
  'tech-modern': TECH_MODERN_THEME as unknown as StoreTemplateTheme,
  'aurora-minimal': AURORA_THEME as unknown as StoreTemplateTheme,
  'artisan-market': ARTISAN_MARKET_THEME as StoreTemplateTheme,
  'freshness': FRESHNESS_THEME as unknown as StoreTemplateTheme,
  'turbo-sale': TURBO_SALE_THEME as unknown as StoreTemplateTheme,
  'zenith-rise': ZENITH_RISE_THEME as unknown as StoreTemplateTheme,
  'bdshop': BDSHOP_THEME as unknown as StoreTemplateTheme,
  'nova-lux-ultra': NOVALUX_ULTRA_THEME as unknown as StoreTemplateTheme,
};

// ============================================================================
// STORE_TEMPLATES Array
// ============================================================================
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  // ── Core Themes (with full dedicated components) ──────────────────────────
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
    CartPage: DarazCartPage,
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
    theme: STORE_TEMPLATE_THEMES['eclipse'],
    component: EclipseTemplate,
    Header: EclipseHeader,
    Footer: EclipseFooter,
    ProductPage: EclipseProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'rovo',
    name: 'Rovo',
    description: 'High-fashion luxury store design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/rovo.webp',
    category: 'fashion',
    theme: STORE_TEMPLATE_THEMES['rovo'],
    component: RovoTemplate,
    Header: RovoHeader,
    Footer: RovoFooter,
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
    theme: STORE_TEMPLATE_THEMES['sokol'],
    component: SokolTemplate,
    Header: SokolHeader,
    Footer: SokolFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'nova-lux-ultra',
    name: 'Nova Lux Ultra',
    description: 'Enhanced version of Nova Lux with more features.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/nova-lux-ultra.webp',
    category: 'premium',
    theme: STORE_TEMPLATE_THEMES['nova-lux-ultra'],
    component: NovaLuxUltraTemplate,
    Header: NovaLuxUltraHeader,
    Footer: NovaLuxUltraFooter,
    ProductPage: NovaLuxUltraProductPage,
    CartPage: NovaLuxUltraCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Outfit', body: 'Inter' },
  },
  {
    id: 'ghorer-bazar',
    name: 'Ghorer Bazar',
    description: 'Perfect for grocery and daily needs stores with fresh colors.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/ghorer-bazar.webp',
    category: 'grocery',
    theme: STORE_TEMPLATE_THEMES['ghorer-bazar'],
    component: GhorerBazarTemplate,
    Header: GhorerBazarHeader,
    Footer: GhorerBazarFooter,
    ProductPage: GhorerBazarProductPage,
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
    theme: STORE_TEMPLATE_THEMES['tech-modern'],
    component: TechModernTemplate,
    Header: TechModernHeader,
    Footer: TechModernFooter,
    ProductPage: TechModernProductPage,
    CartPage: TechModernCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: TechModernCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'aurora-minimal',
    name: 'Aurora Minimal',
    description: 'Clean and minimal aesthetic for modern brands.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/aurora-minimal.webp',
    category: 'minimal',
    theme: STORE_TEMPLATE_THEMES['aurora-minimal'],
    component: AuroraMinimalTemplate,
    Header: AuroraMinimalHeader,
    Footer: AuroraMinimalFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'artisan-market',
    name: 'Artisan Market',
    description: 'Handmade and crafts marketplace design.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/artisan-market.webp',
    category: 'handmade',
    theme: STORE_TEMPLATE_THEMES['artisan-market'],
    component: ArtisanMarketTemplate,
    Header: ArtisanMarketHeader,
    Footer: ArtisanMarketFooter,
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
    theme: STORE_TEMPLATE_THEMES['freshness'],
    component: FreshnessTemplate,
    Header: FreshnessHeader,
    Footer: FreshnessFooter,
    ProductPage: FreshnessProductPage,
    CartPage: FreshnessCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'turbo-sale',
    name: 'Turbo Sale',
    description: 'High-conversion flash sale and dropshipping theme.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/turbo-sale.webp',
    category: 'sales',
    theme: STORE_TEMPLATE_THEMES['turbo-sale'],
    component: TurboSaleTemplate,
    Header: TurboSaleHeader,
    Footer: TurboSaleFooter,
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
    theme: STORE_TEMPLATE_THEMES['zenith-rise'],
    component: ZenithRiseTemplate,
    Header: ZenithRiseHeader,
    Footer: ZenithRiseFooter,
    ProductPage: StarterProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    CollectionPage: SharedCollectionPage,
    fonts: { heading: 'Inter', body: 'Inter' },
  },
  {
    id: 'bdshop',
    name: 'BDShop',
    description: 'Localized design for Bangladeshi e-commerce.',
    thumbnail: 'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/bdshop.webp',
    category: 'local',
    theme: STORE_TEMPLATE_THEMES['bdshop'],
    component: BDShopTemplate,
    Header: BDShopHeader,
    Footer: BDShopFooter,
    ProductPage: BDShopProductPage,
    CartPage: BDShopCartPage,
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
// Aliases & Constants (for backwards-compatibility with existing imports)
// ============================================================================
export const MVP_STORE_TEMPLATES = STORE_TEMPLATES;
export const DEFAULT_STORE_TEMPLATE_ID = 'starter-store';

export const MVP_THEME_IDS = ['luxe-boutique', 'nova-lux', 'starter-store'] as const;
export type MvpThemeId = (typeof MVP_THEME_IDS)[number];

// Alias for libs that use getAllStoreTemplates
export const getAllStoreTemplates = () => STORE_TEMPLATES;

// ============================================================================
// resolveStoreTemplateId — extracts templateId from themeConfig JSON or store.theme
// ============================================================================
export function resolveStoreTemplateId(
  themeConfig: Record<string, unknown> | null | undefined,
  storeTheme?: string | null
): string {
  // If we have themeConfig, check for its storeTemplateId
  if (themeConfig) {
    if (themeConfig.storeTemplateId && typeof themeConfig.storeTemplateId === 'string') {
      return themeConfig.storeTemplateId;
    }
    // If themeConfig exists but lacks a template ID, we should NOT fall down to storeTheme
    // because themeConfig is the newer source of truth. We default to starter-store.
    // Wait, the previous logic just bypassed and checked storeTheme. Let's keep checking storeTheme
    // as a fallback if themeConfig doesn't have it.
  }

  // Try parsing storeTheme JSON string
  if (storeTheme) {
    try {
      const parsed = JSON.parse(storeTheme) as Record<string, unknown>;
      if (parsed.storeTemplateId && typeof parsed.storeTemplateId === 'string') {
        return parsed.storeTemplateId;
      }
    } catch {
      // fallback
    }
  }

  return 'starter-store';
}

// ============================================================================
// resolveStoreTheme — resolves templateId + merged theme from mvp settings
// ============================================================================
export function resolveStoreTheme(
  mvpSettings: Record<string, unknown>,
  themeConfigJson?: string | null
): { storeTemplateId: string; theme: StoreTemplateTheme } {
  // Parse themeConfig JSON to get templateId
  let storeTemplateId = 'starter-store';

  // 1. Check mvpSettings directly for storeTemplateId
  if (mvpSettings.storeTemplateId && typeof mvpSettings.storeTemplateId === 'string') {
    storeTemplateId = mvpSettings.storeTemplateId;
  }

  // 2. Try parsing themeConfigJson as JSON fallback
  if (storeTemplateId === 'starter-store' && themeConfigJson) {
    try {
      const parsed = JSON.parse(themeConfigJson) as Record<string, unknown>;
      if (parsed.storeTemplateId && typeof parsed.storeTemplateId === 'string') {
        storeTemplateId = parsed.storeTemplateId;
      }
    } catch {
      // 3. If not valid JSON, treat the raw string as a legacy theme id
      if (themeConfigJson && STORE_TEMPLATE_THEMES[themeConfigJson]) {
        storeTemplateId = themeConfigJson;
      }
    }
  }

  // Get base theme for the template
  const baseTheme =
    STORE_TEMPLATE_THEMES[storeTemplateId] || STORE_TEMPLATE_THEMES['starter-store'];

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
