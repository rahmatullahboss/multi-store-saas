/**
 * Theme Presets Configuration
 * 
 * Defines pre-built theme configurations that can be installed by merchants.
 * Each preset maps to an existing store template from store-registry.ts
 * but converts it to the new section-based architecture.
 */

import type { TemplateKey } from '@db/schema';

// ============================================================================
// TYPES
// ============================================================================

interface SectionPreset {
  type: string;
  enabled: boolean;
  props: Record<string, unknown>;
  blocks?: Array<{
    type: string;
    props: Record<string, unknown>;
  }>;
}

interface TemplatePreset {
  key: TemplateKey;
  title: string;
  sections: SectionPreset[];
}

export interface ThemePresetDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: 'luxury' | 'modern' | 'tech' | 'artisan' | 'marketplace';
  settings: {
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    headingFont: string;
    bodyFont: string;
    headerStyle: 'transparent' | 'solid' | 'sticky';
    footerStyle: 'minimal' | 'detailed' | 'mega';
    showAnnouncement: boolean;
    announcementText?: string;
    showNewsletter: boolean;
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
    buttonStyle: 'solid' | 'outline' | 'ghost';
    customCss?: string;
  };
  templates: TemplatePreset[];
}

// ============================================================================
// ROVO THEME PRESET
// ============================================================================

export const ROVO_PRESET: ThemePresetDefinition = {
  id: 'rovo',
  name: 'Rovo',
  description: 'Clean, modern, and conversion-focused. Perfect for general e-commerce.',
  thumbnail: '/templates/rovo.png',
  category: 'modern',
  settings: {
    primaryColor: '#1A1A1A',
    accentColor: '#F97316',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    headingFont: 'Oswald',
    bodyFont: 'Inter',
    headerStyle: 'sticky',
    footerStyle: 'detailed',
    showAnnouncement: true,
    announcementText: '🔥 Free shipping on orders above ৳1000!',
    showNewsletter: true,
    borderRadius: 'md',
    buttonStyle: 'solid',
  },
  templates: [
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'hero',
          enabled: true,
          props: {
            heading: 'Premium Quality Products',
            subheadline: 'Discover our amazing collection',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            backgroundImage: '',
            alignment: 'center',
            overlayOpacity: 0.4,
          },
        },
        {
          type: 'category-list',
          enabled: true,
          props: {
            heading: 'Shop by Category',
            layout: 'scroll',
            limit: 8,
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            heading: 'Featured Products',
            subheading: 'Our best sellers',
            productCount: 8,
            columns: 4,
            showAddToCart: true,
          },
        },
        {
          type: 'features',
          enabled: true,
          props: {
            heading: 'Why Choose Us',
            features: [
              { icon: '🚚', title: 'Free Delivery', description: 'On orders above ৳1000' },
              { icon: '🔒', title: 'Secure Payment', description: 'COD & Online' },
              { icon: '↩️', title: 'Easy Returns', description: '7 days return policy' },
              { icon: '📞', title: '24/7 Support', description: 'Call us anytime' },
            ],
          },
        },
        {
          type: 'newsletter',
          enabled: true,
          props: {
            heading: 'Join Our Newsletter',
            subheading: 'Get exclusive offers and updates',
            buttonText: 'Subscribe',
          },
        },
      ],
    },
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'product-gallery',
          enabled: true,
          props: {
            layout: 'side-by-side',
            showThumbnails: true,
            zoomEnabled: true,
          },
        },
        {
          type: 'product-info',
          enabled: true,
          props: {
            showRating: true,
            showStock: true,
            showSku: false,
            addToCartText: 'Add to Cart',
            buyNowText: 'Buy Now',
          },
        },
        {
          type: 'product-description',
          enabled: true,
          props: {
            showTabs: true,
            tabs: ['description', 'shipping'],
          },
        },
        {
          type: 'related-products',
          enabled: true,
          props: {
            heading: 'You May Also Like',
            productCount: 4,
          },
        },
      ],
    },
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {
            showImage: true,
            showDescription: true,
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 4,
            productsPerPage: 12,
            showFilters: false,
            showSort: true,
          },
        },
      ],
    },
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {
            showImage: true,
            showQuantity: true,
            showRemove: true,
          },
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {
            checkoutText: 'Proceed to Checkout',
          },
        },
      ],
    },
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {
            showPhoneField: true,
            phoneRequired: true,
            showDistrictSelector: true,
            defaultPaymentMethod: 'cod',
          },
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {
            showItems: true,
            showShipping: true,
          },
        },
      ],
    },
  ],
};

// ============================================================================
// DARAZ-STYLE PRESET
// ============================================================================

export const DARAZ_PRESET: ThemePresetDefinition = {
  id: 'daraz',
  name: 'Daraz Style',
  description: 'Marketplace-inspired design with orange theme. Great for multi-category stores.',
  thumbnail: '/templates/daraz.png',
  category: 'marketplace',
  settings: {
    primaryColor: '#F85606',
    accentColor: '#F85606',
    backgroundColor: '#F5F5F5',
    textColor: '#424242',
    headingFont: 'Roboto',
    bodyFont: 'Roboto',
    headerStyle: 'solid',
    footerStyle: 'mega',
    showAnnouncement: true,
    announcementText: '🎉 Flash Sale! Up to 50% OFF on selected items',
    showNewsletter: false,
    borderRadius: 'sm',
    buttonStyle: 'solid',
  },
  templates: [
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'hero',
          enabled: true,
          props: {
            heading: 'Mega Sale!',
            subheadline: 'Up to 70% OFF on everything',
            buttonText: 'Shop Now',
            buttonLink: '/products',
            layout: 'marketplace',
          },
        },
        {
          type: 'category-list',
          enabled: true,
          props: {
            heading: 'Categories',
            layout: 'grid',
            limit: 12,
          },
        },
        {
          type: 'product-scroll',
          enabled: true,
          props: {
            heading: '⚡ Flash Sale',
            mode: 'flash-sale',
            limit: 10,
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            heading: 'Just For You',
            productCount: 12,
            columns: 6,
          },
        },
      ],
    },
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'product-gallery',
          enabled: true,
          props: {
            layout: 'vertical-thumbs',
          },
        },
        {
          type: 'product-info',
          enabled: true,
          props: {
            showRating: true,
            showStock: true,
            addToCartText: 'Add to Cart',
            buyNowText: 'Buy Now',
          },
        },
        {
          type: 'product-description',
          enabled: true,
          props: {},
        },
        {
          type: 'related-products',
          enabled: true,
          props: {
            heading: 'Similar Products',
            productCount: 6,
          },
        },
      ],
    },
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {},
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 5,
            productsPerPage: 20,
            showFilters: true,
            showSort: true,
          },
        },
      ],
    },
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {},
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {
            checkoutText: 'Proceed to Checkout',
          },
        },
      ],
    },
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {
            showPhoneField: true,
            showDistrictSelector: true,
            defaultPaymentMethod: 'cod',
          },
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {},
        },
      ],
    },
  ],
};

// ============================================================================
// NOVA LUX PRESET (Luxury)
// ============================================================================

export const NOVA_LUX_PRESET: ThemePresetDefinition = {
  id: 'nova-lux',
  name: 'Nova Lux',
  description: 'World-class luxury design with rose gold accents. Perfect for premium brands.',
  thumbnail: '/templates/nova-lux.png',
  category: 'luxury',
  settings: {
    primaryColor: '#1C1C1E',
    accentColor: '#C4A35A',
    backgroundColor: '#FAFAFA',
    textColor: '#2C2C2C',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'DM Sans',
    headerStyle: 'transparent',
    footerStyle: 'detailed',
    showAnnouncement: false,
    showNewsletter: true,
    borderRadius: 'none',
    buttonStyle: 'solid',
  },
  templates: [
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'hero',
          enabled: true,
          props: {
            heading: 'Timeless Elegance',
            subheadline: 'Discover our curated collection',
            buttonText: 'Explore Collection',
            buttonLink: '/products',
            alignment: 'center',
            fullHeight: true,
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            heading: 'New Arrivals',
            productCount: 4,
            columns: 4,
            showPrice: true,
            layout: 'luxury',
          },
        },
        {
          type: 'rich-text',
          enabled: true,
          props: {
            heading: 'Our Story',
            text: 'Crafted with passion, designed for distinction.',
            alignment: 'center',
          },
        },
        {
          type: 'newsletter',
          enabled: true,
          props: {
            heading: 'Join Our World',
            subheading: 'Be the first to know about new collections',
            buttonText: 'Subscribe',
          },
        },
      ],
    },
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'product-gallery',
          enabled: true,
          props: {
            layout: 'side-by-side',
            showThumbnails: true,
          },
        },
        {
          type: 'product-info',
          enabled: true,
          props: {
            addToCartText: 'Add to Bag',
            buyNowText: 'Purchase Now',
          },
        },
        {
          type: 'product-description',
          enabled: true,
          props: {},
        },
        {
          type: 'related-products',
          enabled: true,
          props: {
            heading: 'You May Also Love',
            productCount: 4,
          },
        },
      ],
    },
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {},
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 3,
            productsPerPage: 9,
          },
        },
      ],
    },
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {},
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {
            checkoutText: 'Proceed to Checkout',
          },
        },
      ],
    },
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {},
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {},
        },
      ],
    },
  ],
};

// ============================================================================
// ZENITH RISE PRESET (Dark Mode)
// ============================================================================

export const ZENITH_RISE_PRESET: ThemePresetDefinition = {
  id: 'zenith-rise',
  name: 'Zenith Rise',
  description: 'Futuristic dark mode with glassmorphism. High-impact 2025 design.',
  thumbnail: '/templates/zenith-rise.png',
  category: 'modern',
  settings: {
    primaryColor: '#6366F1',
    accentColor: '#22D3EE',
    backgroundColor: '#020617',
    textColor: '#F8FAFC',
    headingFont: 'Outfit',
    bodyFont: 'Inter',
    headerStyle: 'transparent',
    footerStyle: 'minimal',
    showAnnouncement: true,
    announcementText: '✨ New Collection Launched',
    showNewsletter: true,
    borderRadius: 'lg',
    buttonStyle: 'solid',
  },
  templates: [
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'zenith-hero',
          enabled: true,
          props: {
            heading: 'The Future is Here',
            titleHighlight: 'Future',
            subheading: 'Experience next-generation products',
            primaryAction: { label: 'Explore Now', url: '/products' },
          },
        },
        {
          type: 'zenith-features',
          enabled: true,
          props: {
            heading: 'Why Choose Us',
            subheading: 'Built for the modern world',
          },
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            heading: 'Featured Products',
            productCount: 6,
            columns: 3,
          },
        },
        {
          type: 'newsletter',
          enabled: true,
          props: {
            heading: 'Stay Updated',
            subheading: 'Get notified about new drops',
            buttonText: 'Subscribe',
          },
        },
      ],
    },
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'product-gallery',
          enabled: true,
          props: {},
        },
        {
          type: 'product-info',
          enabled: true,
          props: {
            addToCartText: 'Add to Cart',
            buyNowText: 'Buy Now',
          },
        },
        {
          type: 'product-description',
          enabled: true,
          props: {},
        },
        {
          type: 'related-products',
          enabled: true,
          props: {
            heading: 'More Products',
            productCount: 4,
          },
        },
      ],
    },
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {},
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 4,
            productsPerPage: 12,
          },
        },
      ],
    },
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {},
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {},
        },
      ],
    },
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {},
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {},
        },
      ],
    },
  ],
};

// ============================================================================
// TURBO SALE PRESET (Bangladesh Conversion Focused)
// ============================================================================

export const TURBO_SALE_PRESET: ThemePresetDefinition = {
  id: 'turbo-sale',
  name: 'Turbo Sale',
  description: 'High urgency, video-first template optimized for Bangladesh. Maximum conversions.',
  thumbnail: '/templates/turbo-sale.png',
  category: 'modern',
  settings: {
    primaryColor: '#DC2626',
    accentColor: '#FBBF24',
    backgroundColor: '#0F172A',
    textColor: '#F8FAFC',
    headingFont: 'Hind Siliguri',
    bodyFont: 'Hind Siliguri',
    headerStyle: 'sticky',
    footerStyle: 'minimal',
    showAnnouncement: true,
    announcementText: '🔥 অফার শেষ হতে বাকি সময় সীমিত!',
    showNewsletter: false,
    borderRadius: 'md',
    buttonStyle: 'solid',
  },
  templates: [
    {
      key: 'home',
      title: 'Home Page',
      sections: [
        {
          type: 'urgency-bar',
          enabled: true,
          props: {
            message: 'অফার শেষ হতে বাকি:',
            stockLeft: 15,
            endTime: null, // Will be set dynamically
          },
        },
        {
          type: 'turbo-hero',
          enabled: true,
          props: {
            heading: 'সমস্যার স্থায়ী সমাধান',
            offerText: '৫০% ছাড়',
            videoUrl: '',
            comparison: {
              before: { title: 'আগে', price: 2990 },
              after: { title: 'এখন', price: 1490 },
            },
          },
        },
        {
          type: 'features',
          enabled: true,
          props: {
            heading: 'কেন আমাদের বেছে নেবেন?',
            features: [
              { icon: '✅', title: '১০০% অরিজিনাল', description: 'গ্যারান্টি সহ' },
              { icon: '🚚', title: 'ফ্রি ডেলিভারি', description: 'সারা বাংলাদেশে' },
              { icon: '💰', title: 'ক্যাশ অন ডেলিভারি', description: 'পণ্য হাতে পেয়ে পেমেন্ট' },
              { icon: '↩️', title: '৭ দিনের রিটার্ন', description: 'সহজ রিটার্ন পলিসি' },
            ],
          },
        },
        {
          type: 'faq',
          enabled: true,
          props: {
            heading: 'সাধারণ প্রশ্নাবলী',
          },
        },
      ],
    },
    {
      key: 'product',
      title: 'Product Page',
      sections: [
        {
          type: 'urgency-bar',
          enabled: true,
          props: {
            message: 'স্টক সীমিত:',
            stockLeft: 10,
          },
        },
        {
          type: 'product-gallery',
          enabled: true,
          props: {},
        },
        {
          type: 'product-info',
          enabled: true,
          props: {
            addToCartText: 'কার্টে যোগ করুন',
            buyNowText: 'এখনই কিনুন',
          },
        },
        {
          type: 'features',
          enabled: true,
          props: {
            heading: 'পণ্যের বৈশিষ্ট্য',
          },
        },
      ],
    },
    {
      key: 'collection',
      title: 'Collection Page',
      sections: [
        {
          type: 'collection-header',
          enabled: true,
          props: {},
        },
        {
          type: 'product-grid',
          enabled: true,
          props: {
            columns: 2,
            productsPerPage: 12,
          },
        },
      ],
    },
    {
      key: 'cart',
      title: 'Cart Page',
      sections: [
        {
          type: 'cart-items',
          enabled: true,
          props: {},
        },
        {
          type: 'cart-summary',
          enabled: true,
          props: {
            checkoutText: 'অর্ডার করুন',
          },
        },
      ],
    },
    {
      key: 'checkout',
      title: 'Checkout Page',
      sections: [
        {
          type: 'checkout-form',
          enabled: true,
          props: {
            showPhoneField: true,
            phoneRequired: true,
            showDistrictSelector: true,
            defaultPaymentMethod: 'cod',
          },
        },
        {
          type: 'checkout-summary',
          enabled: true,
          props: {},
        },
      ],
    },
  ],
};

// ============================================================================
// ALL PRESETS
// ============================================================================

export const ALL_THEME_PRESETS: ThemePresetDefinition[] = [
  ROVO_PRESET,
  DARAZ_PRESET,
  NOVA_LUX_PRESET,
  ZENITH_RISE_PRESET,
  TURBO_SALE_PRESET,
];

/**
 * Get a theme preset by ID
 */
export function getThemePreset(id: string): ThemePresetDefinition | undefined {
  return ALL_THEME_PRESETS.find(preset => preset.id === id);
}

/**
 * Get all available theme presets
 */
export function getAllThemePresets(): ThemePresetDefinition[] {
  return ALL_THEME_PRESETS;
}
