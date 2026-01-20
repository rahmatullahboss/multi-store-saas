
import type { ComponentType } from 'react';

// ============================================================================
// SECTION TYPES & SETTINGS SCHEMA
// ============================================================================

export type SectionType = 
  | 'hero' 
  | 'modern-hero'
  | 'product-grid' 
  | 'newsletter' 
  | 'rich-text' 
  | 'features' 
  | 'modern-features'
  | 'video' 
  | 'testimonials'
  | 'category-list'
  | 'product-scroll'
  | 'banner'
  | 'faq'
  | 'product-header'
  | 'product-gallery'
  | 'product-info'
  | 'product-reviews'
  | 'product-description'
  | 'related-products'
  | 'collection-header'
  | 'cart-items'
  | 'cart-summary'
  | 'zenith-hero'
  | 'zenith-features'
  | 'turbo-hero'
  | 'urgency-bar';


export interface SectionAction {
  label: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline' | 'link';
}

export interface SectionSettings {
  [key: string]: any;
  // Common
  paddingTop?: 'none' | 'small' | 'medium' | 'large';
  paddingBottom?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
  
  // Content
  heading?: string;
  subheading?: string;
  text?: string;
  image?: string;
  
  // Actions
  primaryAction?: SectionAction;
  secondaryAction?: SectionAction;
  
  // Layout
  alignment?: 'left' | 'center' | 'right';
  layout?: 'image_left' | 'image_right' | 'image_top' | 'image_bottom' | 'standard' | 'marketplace' | 'grid' | 'tabs' | 'pills' | 'scroll';
  
  // Special
  collectionId?: string; // For compatibility
  collection?: string; // Category ID or Name
  productCount?: number;
  products?: any[]; // For manual product selection or overrides
  primaryColor?: string;
  secondaryColor?: string;
  autoplay?: boolean;

  // Data Binding (Metafields)
  bindings?: Record<string, { 
    source: 'product' | 'store'; 
    field: string; 
  }>;
  
  // New props
  mode?: string; // e.g. 'flash-sale'
  limit?: number;
  features?: any[];
  faqs?: any[];
  
  // Text Overrides (AI Control)
  addToCartText?: string;
  buyNowText?: string;
  checkoutText?: string;
  continueShoppingText?: string;
  emptyText?: string;
  buttonText?: string;
  placeholderText?: string;
  successMessage?: string;
  trustText1?: string;
  trustText2?: string;
  trustText3?: string;
  showWishlist?: boolean;
  blockName?: string;
}

export interface StoreSection {
  id: string; // Unique instance ID
  type: SectionType;
  settings: SectionSettings;
  blocks?: any[]; // For nested content like slides
}

export interface SectionDefinition {
  type: SectionType;
  name: string;
  icon: string; // Lucide icon name
  description: string;
  defaultSettings: SectionSettings;
  component: ComponentType<any>;
  allowedPages?: ('home' | 'product' | 'collection' | 'page' | 'cart')[];
  aiSchema?: any; // Added for AI Action Layer
}


// ============================================================================
// REGISTRY
// ============================================================================
import HeroSection, { HERO_AI_SCHEMA } from './HeroSection';
import { ProductGridSection, PRODUCT_GRID_AI_SCHEMA } from './ProductGridSection';
import NewsletterSection, { NEWSLETTER_AI_SCHEMA } from './NewsletterSection';
import CategorySection, { CATEGORY_AI_SCHEMA } from './CategorySection';
import ProductScrollSection from './ProductScrollSection';
import FeaturesSection, { FEATURES_AI_SCHEMA } from './FeaturesSection';
import BannerSection from './BannerSection';
import FAQSection, { FAQ_AI_SCHEMA } from './FAQSection';
import ModernHeroSection from './ModernHeroSection';
import ModernFeaturesSection from './ModernFeaturesSection';
import ZenithHeroSection, { ZENITH_HERO_AI_SCHEMA } from '../store-templates/zenith-rise/sections/HeroSection';
import ZenithFeaturesSection, { ZENITH_FEATURES_AI_SCHEMA } from '../store-templates/zenith-rise/sections/FeaturesSection';
import TurboHeroSection, { TURBO_HERO_AI_SCHEMA } from '../store-templates/turbo-sale/sections/HeroSection';
import UrgencyBarSection, { URGENCY_BAR_AI_SCHEMA } from '../store-templates/turbo-sale/sections/UrgencyBarSection';


import RichTextSection, { RICH_TEXT_AI_SCHEMA } from './RichTextSection';
import { ProductHeaderSection } from './ProductHeaderSection';
import { ProductGallerySection } from './ProductGallerySection';
import { ProductInfoSection } from './ProductInfoSection';
import { ProductReviewsSection } from './ProductReviewsSection';
import { ProductDescriptionSection } from './ProductDescriptionSection';
import { RelatedProductsSection } from './RelatedProductsSection';
import { CollectionHeaderSection } from './CollectionHeaderSection';
import { CartItemsSection } from './CartItemsSection';
import { CartSummarySection } from './CartSummarySection';
import { Layout, ShoppingBag, Mail, Grid3X3, Zap, Shield, Image, HelpCircle, FileText, Type, ImageIcon, Info, MessageSquare, Calculator, Star } from 'lucide-react';

// We will populate this as we implement components
export const SECTION_REGISTRY: Record<string, SectionDefinition> = {
  'hero': {
    type: 'hero',
    name: 'Hero Banner',
    icon: 'Layout',
    description: 'A large banner with a background image, heading, and call to action.',
    defaultSettings: {
      heading: 'Welcome to Our Store',
      subheading: 'Discover our premium collection',
      primaryAction: { label: 'Shop Now', url: '/#products' },
      alignment: 'center',
      layout: 'standard',
    },
    component: HeroSection as any,
    aiSchema: HERO_AI_SCHEMA,
    allowedPages: ['home']
  },
  'modern-hero': {
    type: 'modern-hero',
    name: 'Premium Hero',
    icon: 'Layout',
    description: 'Modern Premium Hero with floating product card.',
    defaultSettings: {
      heading: 'Premium Quality Products',
      subheading: 'Discover our amazing collection...',
      primaryAction: { label: 'Shop Now', url: '/products' },
      secondaryAction: { label: 'Browse Categories', url: '/about' },
      image: '',
    },
    component: ModernHeroSection,
    allowedPages: ['home']
  },
  'modern-features': {
    type: 'modern-features',
    name: 'Premium Features',
    icon: 'Star',
    description: 'Premium "Why Choose Us" section.',
    defaultSettings: {
      heading: 'Why Choose Us?',
      subheading: "We're committed to providing the best shopping experience",
      features: [
        { icon: '✨', title: 'Premium Quality', description: 'Highest quality standards.' },
        { icon: '⚡', title: 'Fast Delivery', description: '24-48 hours delivery.' },
        { icon: '💬', title: '24/7 Support', description: 'Always ready to help.' },
      ]
    },
    component: ModernFeaturesSection,
    allowedPages: ['home']
  },
  'zenith-hero': {
    type: 'zenith-hero',
    name: 'Zenith Hero',
    icon: 'Zap',
    description: 'High-impact gradient hero for SaaS/Digital products.',
    defaultSettings: {
      heading: 'Supercharge Your Workflow',
      titleHighlight: 'Workflow',
      subheading: 'The ultimate platform for modern creators.',
      primaryAction: { label: 'Get Started', url: '/signup' }
    },
    component: ZenithHeroSection as any,
    aiSchema: ZENITH_HERO_AI_SCHEMA,
    allowedPages: ['home']
  },
  'zenith-features': {
    type: 'zenith-features',
    name: 'Zenith Bento Grid',
    icon: 'Grid',
    description: 'Modern bento-grid style features display.',
    defaultSettings: {
      heading: 'Everything you need',
      subheading: 'No compromise on features.',
    },
    component: ZenithFeaturesSection as any,
    aiSchema: ZENITH_FEATURES_AI_SCHEMA,
    allowedPages: ['home']
  },
  'turbo-hero': {
    type: 'turbo-hero',
    name: 'Turbo Hero (Video)',
    icon: 'Play',
    description: 'Video-first hero section with direct order comparison. BD-Conversion focused.',
    defaultSettings: {
      heading: 'সমস্যার স্থায়ী সমাধান',
      offerText: '৫০% ছাড়',
      videoUrl: 'https://youtube.com/...'
    },
    component: TurboHeroSection as any,
    aiSchema: TURBO_HERO_AI_SCHEMA,
    allowedPages: ['home']
  },
  'urgency-bar': {
    type: 'urgency-bar',
    name: 'Urgency / Stock Bar',
    icon: 'Activity',
    description: 'Countdown timer and stock scarcity indicator.',
    defaultSettings: {
      message: 'অফার শেষ হতে বাকি:',
      stockLeft: 10
    },
    component: UrgencyBarSection as any,
    aiSchema: URGENCY_BAR_AI_SCHEMA,
    allowedPages: ['home', 'product']
  },
  'rich-text': {
    type: 'rich-text',
    name: 'Rich Text',
    icon: 'FileText',
    description: 'A section for text content like your story.',
    defaultSettings: {
      heading: 'Our Story',
      text: 'Share your brand story here.',
      alignment: 'center'
    },
    component: RichTextSection,
    aiSchema: RICH_TEXT_AI_SCHEMA,
    allowedPages: ['home', 'product', 'collection']
  },
  'category-list': {
    type: 'category-list',
    name: 'Category List',
    icon: 'Grid3X3', // String name of Lucide icon
    description: 'Display your product categories.',
    defaultSettings: {
      heading: 'Shop by Category',
      layout: 'grid', // grid, tabs, pills, scroll
      limit: 8
    },
    component: CategorySection,
    aiSchema: CATEGORY_AI_SCHEMA,
    allowedPages: ['home']
  },
  'product-scroll': {
    type: 'product-scroll',
    name: 'Product Scroll',
    icon: 'Zap',
    description: 'A horizontal scrollable list of products.',
    defaultSettings: {
      heading: 'Featured Products',
      limit: 10,
      mode: 'default' // default, flash-sale
    },
    component: ProductScrollSection,
    allowedPages: ['home', 'product', 'collection']
  },
  'features': {
    type: 'features',
    name: 'Features / Trust',
    icon: 'Shield',
    description: 'Display features or trust signals like "Free Shipping".',
    defaultSettings: {
      heading: 'Why Choose Us',
      backgroundColor: 'white'
    },
    component: FeaturesSection,
    aiSchema: FEATURES_AI_SCHEMA,
    allowedPages: ['home', 'product']
  },
  'banner': {
    type: 'banner',
    name: 'Promo Banner',
    icon: 'Image',
    description: 'A promotional banner with image and text.',
    defaultSettings: {
      heading: 'Special Offer',
      subheading: 'Limited time only',
      primaryAction: { label: 'Learn More', url: '#' }
    },
    component: BannerSection,
    allowedPages: ['home', 'collection']
  },
  'faq': {
    type: 'faq',
    name: 'FAQ',
    icon: 'HelpCircle',
    description: 'Frequently Asked Questions.',
    defaultSettings: {
      heading: 'Frequently Asked Questions',
    },
    component: FAQSection,
    aiSchema: FAQ_AI_SCHEMA,
    allowedPages: ['home', 'product']
  },
  'product-grid': {
    type: 'product-grid',
    name: 'Product Grid',
    icon: 'ShoppingBag',
    description: 'A grid of products from your catalog.',
    defaultSettings: {
      heading: 'Featured Products',
      productCount: 8,
      paddingTop: 'large',
      paddingBottom: 'large',
      addToCartText: 'Add to Bag',
      showWishlist: true
    },
    component: ProductGridSection,
    aiSchema: PRODUCT_GRID_AI_SCHEMA,
    allowedPages: ['home', 'collection']
  },
  'newsletter': {
    type: 'newsletter',
    name: 'Newsletter',
    icon: 'Mail',
    description: 'A subscription form for your newsletter.',
    defaultSettings: {
      heading: 'Join Our Newsletter',
      subheading: 'Subscribe to receive updates, access to exclusive deals, and more.',
      alignment: 'center',
      paddingTop: 'medium',
      paddingBottom: 'medium',
      buttonText: 'Subscribe',
      placeholderText: 'Enter your email',
      successMessage: 'Thanks for subscribing!'
    },
    component: NewsletterSection,
    aiSchema: NEWSLETTER_AI_SCHEMA,
    allowedPages: ['home']
  },
  'product-header': {
    type: 'product-header',
    name: 'Product Header',
    icon: 'Type',
    description: 'Breadcrumbs and navigation (Product Page Only).',
    defaultSettings: { paddingBottom: 'small' },
    component: ProductHeaderSection,
    allowedPages: ['product']
  },
  'product-gallery': {
    type: 'product-gallery',
    name: 'Product Gallery',
    icon: 'ImageIcon',
    description: 'Product images and thumbnails (Product Page Only).',
    defaultSettings: {},
    component: ProductGallerySection,
    allowedPages: ['product']
  },
  'product-info': {
    type: 'product-info',
    name: 'Product Info',
    icon: 'Info',
    description: 'Title, Price, and Buy Button (Product Page Only).',
    defaultSettings: { 
      paddingTop: 'large', 
      paddingBottom: 'large',
      addToCartText: 'Add to Cart',
      buyNowText: 'Buy Now'
    },
    component: ProductInfoSection,
    allowedPages: ['product']
  },
  'product-reviews': {
    type: 'product-reviews',
    name: 'Product Reviews',
    icon: 'MessageSquare',
    description: 'Review list and form (Product Page Only).',
    defaultSettings: { paddingTop: 'large' },
    component: ProductReviewsSection,
    allowedPages: ['product']
  },
  'product-description': {
    type: 'product-description',
    name: 'Product Description',
    icon: 'FileText',
    description: 'Detailed product description text.',
    defaultSettings: { paddingTop: 'medium', paddingBottom: 'medium' },
    component: ProductDescriptionSection,
    allowedPages: ['product']
  },
  'related-products': {
    type: 'related-products',
    name: 'Related Products',
    icon: 'Grid3X3',
    description: 'Recommendations for similar products.',
    defaultSettings: { heading: 'You Might Also Like', productCount: 4, paddingTop: 'large' },
    component: RelatedProductsSection,
    allowedPages: ['product']
  },
  'collection-header': {
    type: 'collection-header',
    name: 'Collection Header',
    icon: 'Type',
    description: 'Title and description for the collection.',
    defaultSettings: { alignment: 'center', paddingTop: 'medium', paddingBottom: 'medium' },
    component: CollectionHeaderSection,
    allowedPages: ['collection']
  },
  'cart-items': {
    type: 'cart-items',
    name: 'Cart Items',
    icon: 'ShoppingBag',
    description: 'List of items in the cart.',
    defaultSettings: { 
      heading: 'Your Cart',
      continueShoppingText: 'Continue Shopping',
      emptyText: 'Your cart is empty'
    },
    component: CartItemsSection,
    allowedPages: ['cart']
  },
  'cart-summary': {
    type: 'cart-summary',
    name: 'Order Summary',
    icon: 'Calculator',
    description: 'Cart totals and checkout button.',
    defaultSettings: {
      checkoutText: 'Proceed to Checkout',
      trustText1: 'Secure checkout',
      trustText2: 'Fast delivery',
      trustText3: 'Easy returns'
    },
    component: CartSummarySection,
    allowedPages: ['cart']
  },
  'video': {
    type: 'video',
    name: 'Video',
    icon: 'ImageIcon',
    description: 'Display a video.',
    defaultSettings: {
      heading: 'Featured Video'
    },
    component: HeroSection as any, // Placeholder
    allowedPages: ['home', 'product']
  },
  'testimonials': {
    type: 'testimonials',
    name: 'Testimonials',
    icon: 'MessageSquare',
    description: 'Customer reviews.',
    defaultSettings: {
        heading: 'What our customers say',
        autoplay: true
    },
    component: FeaturesSection, // Placeholder
    allowedPages: ['home']
 }
};


export function registerSection(def: SectionDefinition) {
  SECTION_REGISTRY[def.type] = def;
}

export function getSectionDefinition(type: SectionType): SectionDefinition | undefined {
  return SECTION_REGISTRY[type];
}

export const DEFAULT_SECTIONS: StoreSection[] = [
  {
    id: 'hero-1',
    type: 'hero',
    settings: {
      heading: 'Welcome to Our Store',
      subheading: 'Discover premium products curated for you.',
      primaryAction: { label: 'Shop Now', url: '/#products' },
      secondaryAction: { label: 'Browse Categories', url: '/#categories' },
      alignment: 'center',
      layout: 'standard',
      paddingTop: 'none',
      paddingBottom: 'none'
    }
  },
  {
    id: 'features-1',
    type: 'features',
    settings: {
      heading: 'Why Shop With Us',
      subheading: 'Trusted service, quality products, fast delivery.',
      backgroundColor: 'white'
    }
  },
  {
    id: 'categories-1',
    type: 'category-list',
    settings: {
      heading: 'Shop by Category',
      layout: 'grid',
      limit: 8
    }
  },
  {
    id: 'products-1',
    type: 'product-grid',
    settings: {
      heading: 'Featured Products',
      productCount: 8,
      paddingTop: 'large',
      paddingBottom: 'large'
    }
  },
  {
    id: 'banner-1',
    type: 'banner',
    settings: {
      heading: 'Limited Time Offer',
      subheading: 'Save up to 30% on selected items',
      primaryAction: { label: 'Shop Sale', url: '/products?sort=popular' },
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80'
    }
  },
  {
    id: 'scroll-1',
    type: 'product-scroll',
    settings: {
      heading: 'New Arrivals',
      limit: 10,
      mode: 'default'
    }
  },
  {
    id: 'story-1',
    type: 'rich-text',
    settings: {
      heading: 'Our Story',
      text: 'We partner with trusted suppliers to bring you quality products backed by responsive support.',
      alignment: 'center',
      backgroundColor: 'transparent'
    }
  },
  {
    id: 'faq-1',
    type: 'faq',
    settings: {
      heading: 'Frequently Asked Questions',
      faqs: [
        { question: 'What payment methods do you accept?', answer: 'We accept cards, mobile payments, and cash on delivery where available.' },
        { question: 'How long does shipping take?', answer: 'Standard delivery takes 2-5 business days depending on location.' },
        { question: 'What is the return policy?', answer: 'We offer a 7-day return window for eligible items.' }
      ]
    }
  },
  {
    id: 'newsletter-1',
    type: 'newsletter',
    settings: {
      heading: 'Join Our Newsletter',
      subheading: 'Subscribe for updates and exclusive offers.',
      alignment: 'center',
      paddingTop: 'large',
      paddingBottom: 'large'
    }
  }
];

// ============================================================================
// DEFAULT SECTIONS FOR PRODUCT PAGE
// ============================================================================
export const DEFAULT_PRODUCT_SECTIONS: StoreSection[] = [
  {
    id: 'product-header-1',
    type: 'product-header',
    settings: {
      paddingBottom: 'small'
    }
  },
  {
    id: 'product-gallery-1',
    type: 'product-gallery',
    settings: {}
  },
  {
    id: 'product-info-1',
    type: 'product-info',
    settings: {
      paddingTop: 'large',
      paddingBottom: 'large',
      addToCartText: 'Add to Cart',
      buyNowText: 'Buy Now'
    }
  },
  {
    id: 'product-description-1',
    type: 'product-description',
    settings: {
      paddingTop: 'medium',
      paddingBottom: 'medium'
    }
  },
  {
    id: 'product-reviews-1',
    type: 'product-reviews',
    settings: {
      paddingTop: 'large'
    }
  },
  {
    id: 'related-products-1',
    type: 'related-products',
    settings: {
      heading: 'You Might Also Like',
      productCount: 4,
      paddingTop: 'large'
    }
  }
];

// ============================================================================
// DEFAULT SECTIONS FOR CART PAGE
// ============================================================================
export const DEFAULT_CART_SECTIONS: StoreSection[] = [
  {
    id: 'cart-items-1',
    type: 'cart-items',
    settings: {
      heading: 'Your Cart',
      continueShoppingText: 'Continue Shopping',
      emptyText: 'Your cart is empty'
    }
  },
  {
    id: 'cart-summary-1',
    type: 'cart-summary',
    settings: {
      checkoutText: 'Proceed to Checkout',
      trustText1: 'Secure checkout',
      trustText2: 'Fast delivery',
      trustText3: 'Easy returns'
    }
  }
];

// ============================================================================
// DEFAULT SECTIONS FOR COLLECTION PAGE
// ============================================================================
export const DEFAULT_COLLECTION_SECTIONS: StoreSection[] = [
  {
    id: 'collection-header-1',
    type: 'collection-header',
    settings: {
      alignment: 'center',
      paddingTop: 'medium',
      paddingBottom: 'medium'
    }
  },
  {
    id: 'collection-products-1',
    type: 'product-grid',
    settings: {
      heading: '',
      productCount: 12,
      paddingTop: 'small',
      paddingBottom: 'large'
    }
  }
];
