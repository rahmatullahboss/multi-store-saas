/**
 * BDShop Theme - Theme Registration & Metadata
 *
 * A BDShop Bangladesh-inspired e-commerce theme with:
 * - Navy blue theme header with orange accents
 * - Mobile-first responsive design
 * - Professional corporate look
 *
 * Shopify OS 2.0 Compatible Architecture
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import from Daraz theme and re-export with BDShop styling
// BDShop uses the same section components but with different default settings
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
  id: 'bdshop',
  name: 'BDShop',
  nameBn: 'বিডিশপ',
  version: '1.0.0',
  author: 'Ozzyl',
  description: 'A BDShop Bangladesh-inspired e-commerce theme with navy blue branding',
  descriptionBn: 'নেভি নীল ব্র্যান্ডিং সহ বিডিশপ বাংলাদেশ-অনুপ্রাণিত ই-কমার্স থিম',
  previewImage: '/themes/bdshop/preview.png',
  features: ['responsive', 'mobile-first', 'bangla-support', 'professional'],
  templates: ['index', 'product', 'collection', 'cart', 'page', 'search'],
  categories: ['professional', 'corporate', 'blue', 'general'],
};

// ============================================================================
// THEME CONFIGURATION (Default Values)
// ============================================================================

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  name: 'BDShop',
  version: '1.0.0',

  colors: {
    primary: '#1E3A8A', // Navy Blue
    secondary: '#1E3A5F', // Darker Navy
    accent: '#F97316', // Orange
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#424242',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
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
    radius: '0.5rem',
    radiusLarge: '0.75rem',
    width: '1px',
  },

  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.05)',
    md: '0 4px 6px -1px rgba(0,0,0,0.1)',
    lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
  },

  buttons: {
    borderRadius: '0.375rem',
    fontWeight: '600',
    textTransform: 'none',
  },

  cards: {
    borderRadius: '0.5rem',
    shadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: '0.75rem',
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
      name: 'Header (BDShop)',
      presets: [
        {
          name: 'BDShop Header',
          category: 'Header',
          settings: {
            header_bg: '#1E3A8A',
            top_bar_bg: '#0F172A',
            search_btn_bg: '#F97316',
            badge_bg: '#F97316',
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
      name: 'Hero Carousel (BDShop)',
      presets: [
        {
          name: 'BDShop Hero',
          category: 'Banners',
          settings: {
            primary_color: '#1E3A8A',
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
      name: 'Top Deals (BDShop)',
      presets: [
        {
          name: 'BDShop Top Deals',
          category: 'Products',
          settings: {
            title: 'Top Deals',
            subtitle: 'Best Offers',
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Category Grid (BDShop)',
      presets: [
        {
          name: 'BDShop Categories',
          category: 'Navigation',
          settings: {
            icon_color: '#1E3A8A',
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
      name: 'Product Grid (BDShop)',
      presets: [
        {
          name: 'BDShop Products',
          category: 'Products',
          settings: {
            title: 'Specially For You',
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Footer (BDShop)',
    },
    component: DarazFooter,
  },
  // Product page sections (reuse Daraz with BDShop colors)
  'product-main': {
    type: 'product-main',
    schema: {
      ...productMainSchema,
      name: 'Product Main (BDShop)',
      presets: [
        {
          name: 'BDShop Product Main',
          category: 'Product',
          settings: {
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Cart Items (BDShop)',
      presets: [
        {
          name: 'BDShop Cart Items',
          category: 'Cart',
          settings: {
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Cart Summary (BDShop)',
      presets: [
        {
          name: 'BDShop Cart Summary',
          category: 'Cart',
          settings: {
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Collection Header (BDShop)',
      presets: [
        {
          name: 'BDShop Collection Header',
          category: 'Collection',
          settings: {
            primary_color: '#1E3A8A',
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
      name: 'Collection Grid (BDShop)',
      presets: [
        {
          name: 'BDShop Collection Grid',
          category: 'Collection',
          settings: {
            primary_color: '#1E3A8A',
            price_color: '#1E40AF',
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
      name: 'Rich Text (BDShop)',
      presets: [
        {
          name: 'BDShop Rich Text',
          category: 'Content',
          settings: {
            heading_color: '#1E3A8A',
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
