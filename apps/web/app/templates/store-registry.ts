import * as React from 'react';
import type {
  StoreTemplateTheme,
  StoreTemplateDefinition,
} from './types';

export * from './types';





// ============================================================================
// Theme Imports (Named Exports from each theme file)
// ============================================================================
import { LUXE_BOUTIQUE_THEME } from '../components/store-templates/luxe-boutique/theme';
import { NOVALUX_THEME } from '../components/store-templates/nova-lux/theme';
import { STARTER_STORE_THEME } from '../components/store-templates/starter-store/theme';

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

// ============================================================================
// Theme Map
// ============================================================================
export const STORE_TEMPLATE_THEMES: Record<string, StoreTemplateTheme> = {
  'luxe-boutique': LUXE_BOUTIQUE_THEME as StoreTemplateTheme,
  'nova-lux': NOVALUX_THEME as StoreTemplateTheme,
  'starter-store': STARTER_STORE_THEME as StoreTemplateTheme,
};





// ============================================================================
// STORE_TEMPLATES Array
// ============================================================================
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'starter-store',
    name: 'Starter Store',
    description: 'A clean, modern starting point for your store.',
    thumbnail:
      'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/starter-store.webp',
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
    thumbnail:
      'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/luxe-boutique.webp',
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
    thumbnail:
      'https://pub-bec31ee88a08441a8824ab94bb973c04.r2.dev/banners/nova-lux.webp',
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

