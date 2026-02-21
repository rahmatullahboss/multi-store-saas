/**
 * Ghorer Bazar Theme - Theme Registration & Metadata
 *
 * A Ghorer Bazar Bangladesh-inspired e-commerce theme with:
 * - Vibrant Orange theme header
 * - Grocery/Fresh products focused design
 * - Clean, fresh look
 *
 * Shopify OS 2.0 Compatible Architecture
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import from Daraz theme and re-export with Ghorer Bazar styling
import DarazHeader, { schema as headerSchema } from '../daraz/sections/header';
import DarazHeroCarousel, { schema as heroCarouselSchema } from '../daraz/sections/hero-carousel';
import DarazFlashSale, { schema as flashSaleSchema } from '../daraz/sections/flash-sale';
import DarazCategoryGrid, { schema as categoryGridSchema } from '../daraz/sections/category-grid';
import DarazProductGrid, { schema as productGridSchema } from '../daraz/sections/product-grid';
import DarazFooter, { schema as footerSchema } from '../daraz/sections/footer';

// Import additional sections for product, cart, collection pages
import DarazProductMain, { schema as productMainSchema } from '../daraz/sections/product-main';
import DarazCartItems, { schema as cartItemsSchema } from '../daraz/sections/cart-items';
import DarazCartSummary, { schema as cartSummarySchema } from '../daraz/sections/cart-summary';
import DarazCollectionHeader, {
  schema as collectionHeaderSchema,
} from '../daraz/sections/collection-header';
import DarazCollectionGrid, {
  schema as collectionGridSchema,
} from '../daraz/sections/collection-grid';
import DarazRichText, { schema as richTextSchema } from '../daraz/sections/rich-text';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'ghorer-bazar',
  name: 'Ghorer Bazar',
  nameBn: 'ঘরের বাজার',
  version: '1.0.0',
  author: 'Ozzyl',
  description: 'A Ghorer Bazar-inspired e-commerce theme for grocery and fresh products',
  descriptionBn: 'মুদি এবং তাজা পণ্যের জন্য ঘরের বাজার-অনুপ্রাণিত ই-কমার্স থিম',
  previewImage: '/themes/ghorer-bazar/preview.png',
  features: ['responsive', 'mobile-first', 'bangla-support', 'grocery', 'fresh'],
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],
  categories: ['grocery', 'fresh', 'orange', 'general'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'Ghorer Bazar',
  version: '1.0.0',

  colors: {
    primary: '#FC8934', // Vibrant Orange
    secondary: '#E67825', // Darker Orange
    accent: '#059669', // Green for fresh
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    success: '#059669',
    warning: '#F59E0B',
    error: '#EF4444',
  },

  typography: {
    fontFamily: "'Inter', 'Hind Siliguri', sans-serif",
    fontFamilyHeading: "'Inter', 'Hind Siliguri', sans-serif",
    baseFontSize: 14,
    lineHeight: 1.5,
    headingLineHeight: 1.2,
  },

  spacing: {
    unit: 4,
    containerMaxWidth: '1200px',
    containerPadding: '1rem',
  },

  borders: {
    radius: '0.75rem',
    radiusLarge: '1rem',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },

  buttons: {
    borderRadius: '0.5rem',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '0.75rem',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '1rem',
  },

  animation: {
    duration: '200ms',
    easing: 'ease-in-out',
  },
};

// ============================================================================
// SECTION REGISTRY (Reuses Daraz components with different defaults)
// ============================================================================

export const SECTIONS: SectionRegistry = {
  header: {
    type: 'header',
    schema: {
      ...headerSchema,
      name: 'Header (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Header',
          category: 'Header',
          settings: {
            header_bg: '#FC8934',
            top_bar_bg: '#1F2937',
            search_btn_bg: '#E67825',
            badge_bg: '#059669',
            show_top_bar: true,
          },
        },
      ],
    },
    component: DarazHeader,
  },
  'hero-carousel': {
    type: 'hero-carousel',
    schema: {
      ...heroCarouselSchema,
      name: 'Hero Carousel (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Hero',
          category: 'Banners',
          settings: {
            primary_color: '#FC8934',
            show_app_widget: true,
          },
        },
      ],
    },
    component: DarazHeroCarousel,
  },
  'flash-sale': {
    type: 'flash-sale',
    schema: {
      ...flashSaleSchema,
      name: 'Daily Deals (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Daily Deals',
          category: 'Products',
          settings: {
            title: 'Daily Deals',
            subtitle: 'Fresh Offers',
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazFlashSale,
  },
  'category-grid': {
    type: 'category-grid',
    schema: {
      ...categoryGridSchema,
      name: 'Category Grid (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Categories',
          category: 'Navigation',
          settings: {
            icon_color: '#FC8934',
          },
        },
      ],
    },
    component: DarazCategoryGrid,
  },
  'product-grid': {
    type: 'product-grid',
    schema: {
      ...productGridSchema,
      name: 'Product Grid (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Products',
          category: 'Products',
          settings: {
            title: 'Fresh Products',
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazProductGrid,
  },
  footer: {
    type: 'footer',
    schema: {
      ...footerSchema,
      name: 'Footer (Ghorer Bazar)',
    },
    component: DarazFooter,
  },
  // Product page sections (reuse Daraz with Ghorer Bazar colors)
  'product-main': {
    type: 'product-main',
    schema: {
      ...productMainSchema,
      name: 'Product Main (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Product Main',
          category: 'Product',
          settings: {
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazProductMain,
  },
  // Cart page sections
  'cart-items': {
    type: 'cart-items',
    schema: {
      ...cartItemsSchema,
      name: 'Cart Items (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Cart Items',
          category: 'Cart',
          settings: {
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazCartItems,
  },
  'cart-summary': {
    type: 'cart-summary',
    schema: {
      ...cartSummarySchema,
      name: 'Cart Summary (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Cart Summary',
          category: 'Cart',
          settings: {
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazCartSummary,
  },
  // Collection page sections
  'collection-header': {
    type: 'collection-header',
    schema: {
      ...collectionHeaderSchema,
      name: 'Collection Header (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Collection Header',
          category: 'Collection',
          settings: {
            primary_color: '#FC8934',
          },
        },
      ],
    },
    component: DarazCollectionHeader,
  },
  'collection-grid': {
    type: 'collection-grid',
    schema: {
      ...collectionGridSchema,
      name: 'Collection Grid (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Collection Grid',
          category: 'Collection',
          settings: {
            primary_color: '#FC8934',
            price_color: '#059669',
          },
        },
      ],
    },
    component: DarazCollectionGrid,
  },
  // General sections
  'rich-text': {
    type: 'rich-text',
    schema: {
      ...richTextSchema,
      name: 'Rich Text (Ghorer Bazar)',
      presets: [
        {
          name: 'Ghorer Bazar Rich Text',
          category: 'Content',
          settings: {
            heading_color: '#FC8934',
          },
        },
      ],
    },
    component: DarazRichText,
  },
};

// Default export
export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
