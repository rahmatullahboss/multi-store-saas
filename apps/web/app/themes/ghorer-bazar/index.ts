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
};

// Default export
export default {
  metadata: THEME_METADATA,
  config: DEFAULT_THEME_CONFIG,
  sections: SECTIONS,
};
