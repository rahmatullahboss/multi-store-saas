/**
 * Unified Section System
 * 
 * Single source of truth for ALL sections across:
 * - Store templates (home, product, collection, cart, checkout)
 * - Landing page builder
 * - Theme editor
 * 
 * Each section has:
 * - type: unique identifier
 * - name/description: display info
 * - component: React component for rendering
 * - schema: Zod schema for validation
 * - defaultProps: initial configuration
 * - allowedPages: which template types can use this section
 * - category: for grouping in the editor UI
 */

import type { ComponentType } from 'react';
import type { z } from 'zod';

// ============================================================================
// TEMPLATE KEYS - Page types in the theme system
// ============================================================================

export type TemplateKey = 
  | 'home' 
  | 'product' 
  | 'collection' 
  | 'cart' 
  | 'checkout' 
  | 'page' 
  | 'landing';

// ============================================================================
// SECTION CATEGORIES - For grouping in the editor
// ============================================================================

export type SectionCategory = 
  | 'hero'           // Hero sections, banners
  | 'content'        // Text, rich text, features
  | 'products'       // Product grids, scrollers, related products
  | 'social-proof'   // Testimonials, reviews, trust badges
  | 'conversion'     // CTA, order forms, pricing
  | 'navigation'     // Headers, footers
  | 'utility'        // FAQ, contact, countdown
  | 'media'          // Gallery, video
  | 'custom';        // Custom HTML

// ============================================================================
// UNIFIED SECTION TYPE - All available sections
// ============================================================================

export type UnifiedSectionType =
  // Hero & Banner sections
  | 'hero'
  | 'modern-hero'
  | 'zenith-hero'
  | 'turbo-hero'
  | 'banner'
  // Content sections
  | 'rich-text'
  | 'features'
  | 'modern-features'
  | 'zenith-features'
  | 'benefits'
  | 'problem-solution'
  | 'showcase'
  // Product sections
  | 'product-grid'
  | 'product-scroll'
  | 'category-list'
  | 'related-products'
  | 'product-header'
  | 'product-gallery'
  | 'product-info'
  | 'product-description'
  | 'product-reviews'
  // Social proof
  | 'testimonials'
  | 'trust-badges'
  // Conversion
  | 'cta'
  | 'order-button'
  | 'pricing'
  | 'urgency-bar'
  | 'countdown'
  // Navigation
  | 'header'
  | 'footer'
  // Cart/Checkout
  | 'cart-items'
  | 'cart-summary'
  | 'collection-header'
  // Utility
  | 'faq'
  | 'contact'
  | 'stats'
  | 'delivery'
  | 'guarantee'
  | 'how-to-order'
  | 'comparison'
  // Media
  | 'gallery'
  | 'video'
  // Custom
  | 'custom-html'
  | 'newsletter';

// ============================================================================
// SECTION DEFINITION
// ============================================================================

export interface UnifiedSectionDefinition {
  type: UnifiedSectionType;
  name: string;
  nameBn?: string;           // Bengali name
  description: string;
  descriptionBn?: string;    // Bengali description
  icon: string;              // Lucide icon name
  category: SectionCategory;
  allowedPages: TemplateKey[];
  
  // Schema for validation (lazy loaded)
  getSchema?: () => z.ZodTypeAny;
  
  // Default props
  defaultProps: Record<string, unknown>;
  
  // Component is loaded dynamically based on context
  // Store sections use store-sections components
  // Landing pages use page-builder components
  storeComponent?: string;   // Path to store section component
  builderComponent?: string; // Path to builder preview component
}

// ============================================================================
// UNIFIED SECTION REGISTRY
// ============================================================================

export const UNIFIED_SECTION_REGISTRY: Record<UnifiedSectionType, UnifiedSectionDefinition> = {
  // =========================================================================
  // HERO & BANNER SECTIONS
  // =========================================================================
  'hero': {
    type: 'hero',
    name: 'Hero Banner',
    nameBn: 'হিরো',
    description: 'Large banner with heading, image, and call to action',
    descriptionBn: 'প্রথমে যা দেখা যাবে',
    icon: 'Layout',
    category: 'hero',
    allowedPages: ['home', 'landing', 'page'],
    defaultProps: {
      heading: 'Welcome to Our Store',
      subheading: 'Discover our premium collection',
      image: '',
      primaryAction: { label: 'Shop Now', url: '/#products' },
      alignment: 'center',
      layout: 'standard',
    },
  },
  
  'modern-hero': {
    type: 'modern-hero',
    name: 'Premium Hero',
    description: 'Modern hero with floating product card',
    icon: 'Sparkles',
    category: 'hero',
    allowedPages: ['home'],
    defaultProps: {
      heading: 'Premium Quality Products',
      subheading: 'Discover our amazing collection',
      primaryAction: { label: 'Shop Now', url: '/products' },
      secondaryAction: { label: 'Browse Categories', url: '/about' },
      image: '',
    },
  },
  
  'zenith-hero': {
    type: 'zenith-hero',
    name: 'Zenith Hero',
    description: 'High-impact gradient hero for SaaS/Digital products',
    icon: 'Zap',
    category: 'hero',
    allowedPages: ['home'],
    defaultProps: {
      heading: 'Supercharge Your Workflow',
      titleHighlight: 'Workflow',
      subheading: 'The ultimate platform for modern creators.',
      primaryAction: { label: 'Get Started', url: '/signup' },
    },
  },
  
  'turbo-hero': {
    type: 'turbo-hero',
    name: 'Turbo Hero (Video)',
    nameBn: 'টার্বো হিরো',
    description: 'Video-first hero with direct order comparison',
    descriptionBn: 'ভিডিও হিরো সেকশন',
    icon: 'Play',
    category: 'hero',
    allowedPages: ['home', 'landing'],
    defaultProps: {
      heading: 'সমস্যার স্থায়ী সমাধান',
      offerText: '৫০% ছাড়',
      videoUrl: '',
    },
  },
  
  'banner': {
    type: 'banner',
    name: 'Promo Banner',
    description: 'Promotional banner with image and text',
    icon: 'Image',
    category: 'hero',
    allowedPages: ['home', 'collection'],
    defaultProps: {
      heading: 'Special Offer',
      subheading: 'Limited time only',
      primaryAction: { label: 'Learn More', url: '#' },
    },
  },
  
  // =========================================================================
  // CONTENT SECTIONS
  // =========================================================================
  'rich-text': {
    type: 'rich-text',
    name: 'Rich Text',
    description: 'Text content like your brand story',
    icon: 'FileText',
    category: 'content',
    allowedPages: ['home', 'product', 'collection', 'page'],
    defaultProps: {
      heading: 'Our Story',
      text: 'Share your brand story here.',
      alignment: 'center',
    },
  },
  
  'features': {
    type: 'features',
    name: 'Features / Trust',
    nameBn: 'বৈশিষ্ট্য',
    description: 'Display features or trust signals',
    descriptionBn: 'প্রোডাক্টের সুবিধাসমূহ',
    icon: 'Shield',
    category: 'content',
    allowedPages: ['home', 'product', 'landing'],
    defaultProps: {
      heading: 'Why Choose Us',
      features: [
        { icon: '🚚', title: 'Free Shipping', description: 'On orders over ৳999' },
        { icon: '↩️', title: 'Easy Returns', description: '30-day return policy' },
        { icon: '🔒', title: 'Secure Payment', description: '100% secure checkout' },
      ],
    },
  },
  
  'modern-features': {
    type: 'modern-features',
    name: 'Premium Features',
    description: 'Premium "Why Choose Us" section',
    icon: 'Star',
    category: 'content',
    allowedPages: ['home'],
    defaultProps: {
      heading: 'Why Choose Us?',
      subheading: "We're committed to providing the best shopping experience",
      features: [
        { icon: '✨', title: 'Premium Quality', description: 'Highest quality standards.' },
        { icon: '⚡', title: 'Fast Delivery', description: '24-48 hours delivery.' },
        { icon: '💬', title: '24/7 Support', description: 'Always ready to help.' },
      ],
    },
  },
  
  'zenith-features': {
    type: 'zenith-features',
    name: 'Zenith Bento Grid',
    description: 'Modern bento-grid style features display',
    icon: 'Grid3X3',
    category: 'content',
    allowedPages: ['home'],
    defaultProps: {
      heading: 'Everything you need',
      subheading: 'No compromise on features.',
    },
  },
  
  'benefits': {
    type: 'benefits',
    name: 'Benefits',
    nameBn: 'কেন কিনবেন',
    description: 'Why buy from us section',
    descriptionBn: 'কেন আমাদের থেকে কিনবেন',
    icon: 'CheckCircle',
    category: 'content',
    allowedPages: ['home', 'product', 'landing'],
    defaultProps: {
      heading: 'কেন আমাদের প্রোডাক্ট?',
      benefits: [
        { icon: '✅', title: '১০০% অরিজিনাল', description: 'প্রতিটি প্রোডাক্ট যাচাই করা' },
        { icon: '🚀', title: 'দ্রুত ডেলিভারি', description: '২৪-৪৮ ঘন্টায় ডেলিভারি' },
        { icon: '💰', title: 'সেরা দাম', description: 'বাজারের সেরা মূল্য' },
      ],
    },
  },
  
  'problem-solution': {
    type: 'problem-solution',
    name: 'Problem-Solution',
    nameBn: 'সমস্যা-সমাধান',
    description: 'Show problems and how your product solves them',
    descriptionBn: 'সমস্যা এবং সমাধান দেখান',
    icon: 'AlertCircle',
    category: 'content',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'আপনার সমস্যার সমাধান',
      problems: [
        { problem: 'সমস্যা ১', solution: 'সমাধান ১' },
      ],
    },
  },
  
  'showcase': {
    type: 'showcase',
    name: 'Product Showcase',
    nameBn: 'প্রোডাক্ট ডিটেইলস',
    description: 'Detailed product information display',
    descriptionBn: 'প্রোডাক্টের বিস্তারিত',
    icon: 'Box',
    category: 'content',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'প্রোডাক্ট ফিচার্স',
      items: [],
    },
  },
  
  // =========================================================================
  // PRODUCT SECTIONS
  // =========================================================================
  'product-grid': {
    type: 'product-grid',
    name: 'Product Grid',
    description: 'Grid of products from your catalog',
    icon: 'Grid3X3',
    category: 'products',
    allowedPages: ['home', 'collection'],
    defaultProps: {
      heading: 'Featured Products',
      productCount: 8,
      addToCartText: 'Add to Bag',
      showWishlist: true,
    },
  },
  
  'product-scroll': {
    type: 'product-scroll',
    name: 'Product Scroll',
    description: 'Horizontal scrollable product list',
    icon: 'Zap',
    category: 'products',
    allowedPages: ['home', 'product', 'collection'],
    defaultProps: {
      heading: 'Featured Products',
      limit: 10,
      mode: 'default',
    },
  },
  
  'category-list': {
    type: 'category-list',
    name: 'Category List',
    description: 'Display your product categories',
    icon: 'LayoutGrid',
    category: 'products',
    allowedPages: ['home'],
    defaultProps: {
      heading: 'Shop by Category',
      layout: 'grid',
      limit: 8,
    },
  },
  
  'related-products': {
    type: 'related-products',
    name: 'Related Products',
    description: 'Recommendations for similar products',
    icon: 'Grid3X3',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {
      heading: 'You Might Also Like',
      productCount: 4,
    },
  },
  
  'product-header': {
    type: 'product-header',
    name: 'Product Header',
    description: 'Breadcrumbs and navigation',
    icon: 'Type',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {},
  },
  
  'product-gallery': {
    type: 'product-gallery',
    name: 'Product Gallery',
    description: 'Product images and thumbnails',
    icon: 'Image',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {},
  },
  
  'product-info': {
    type: 'product-info',
    name: 'Product Info',
    description: 'Title, price, and buy button',
    icon: 'Info',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {
      addToCartText: 'Add to Cart',
      buyNowText: 'Buy Now',
    },
  },
  
  'product-description': {
    type: 'product-description',
    name: 'Product Description',
    description: 'Detailed product description text',
    icon: 'FileText',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {},
  },
  
  'product-reviews': {
    type: 'product-reviews',
    name: 'Product Reviews',
    description: 'Review list and form',
    icon: 'MessageSquare',
    category: 'products',
    allowedPages: ['product'],
    defaultProps: {},
  },
  
  // =========================================================================
  // SOCIAL PROOF SECTIONS
  // =========================================================================
  'testimonials': {
    type: 'testimonials',
    name: 'Testimonials',
    nameBn: 'টেস্টিমোনিয়াল',
    description: 'Customer reviews and testimonials',
    descriptionBn: 'কাস্টমার রিভিউ',
    icon: 'MessageSquare',
    category: 'social-proof',
    allowedPages: ['home', 'landing', 'product'],
    defaultProps: {
      heading: 'What Our Customers Say',
      testimonials: [
        { name: 'John Doe', text: 'Great product!', rating: 5 },
      ],
    },
  },
  
  'trust-badges': {
    type: 'trust-badges',
    name: 'Trust Badges',
    nameBn: 'ট্রাস্ট ব্যাজ',
    description: 'Guarantee and safety badges',
    descriptionBn: 'গ্যারান্টি ও নিরাপত্তা',
    icon: 'ShieldCheck',
    category: 'social-proof',
    allowedPages: ['home', 'landing', 'product', 'checkout'],
    defaultProps: {
      badges: [
        { icon: '🔒', text: 'Secure Checkout' },
        { icon: '🚚', text: 'Free Shipping' },
        { icon: '↩️', text: 'Easy Returns' },
      ],
    },
  },
  
  // =========================================================================
  // CONVERSION SECTIONS
  // =========================================================================
  'cta': {
    type: 'cta',
    name: 'Order Form / CTA',
    nameBn: 'অর্ডার ফর্ম',
    description: 'Where customers place orders',
    descriptionBn: 'যেখানে কাস্টমার অর্ডার করবে',
    icon: 'ShoppingCart',
    category: 'conversion',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'অর্ডার করুন',
      buttonText: 'অর্ডার কনফার্ম করুন',
      showQuantity: true,
      showVariants: true,
    },
  },
  
  'order-button': {
    type: 'order-button',
    name: 'Order Button',
    nameBn: 'অর্ডার বাটন',
    description: 'Placeable order button anywhere',
    descriptionBn: 'যেকোনো জায়গায় অর্ডার বাটন',
    icon: 'ShoppingCart',
    category: 'conversion',
    allowedPages: ['landing'],
    defaultProps: {
      text: 'অর্ডার করুন',
      style: 'primary',
    },
  },
  
  'pricing': {
    type: 'pricing',
    name: 'Pricing',
    nameBn: 'প্রাইসিং',
    description: 'Packages and pricing display',
    descriptionBn: 'প্যাকেজ ও মূল্য',
    icon: 'Tag',
    category: 'conversion',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'প্যাকেজ বেছে নিন',
      packages: [],
    },
  },
  
  'urgency-bar': {
    type: 'urgency-bar',
    name: 'Urgency Bar',
    description: 'Countdown timer and stock scarcity',
    icon: 'Clock',
    category: 'conversion',
    allowedPages: ['home', 'product', 'landing'],
    defaultProps: {
      message: 'অফার শেষ হতে বাকি:',
      stockLeft: 10,
    },
  },
  
  'countdown': {
    type: 'countdown',
    name: 'Countdown Timer',
    nameBn: 'কাউন্টডাউন',
    description: 'Offer expiry countdown',
    descriptionBn: 'অফার শেষ হওয়ার সময়',
    icon: 'Timer',
    category: 'conversion',
    allowedPages: ['home', 'landing', 'product'],
    defaultProps: {
      heading: 'অফার শেষ হচ্ছে!',
      endDate: '',
    },
  },
  
  // =========================================================================
  // NAVIGATION SECTIONS
  // =========================================================================
  'header': {
    type: 'header',
    name: 'Header',
    nameBn: 'হেডার',
    description: 'Page header with logo and navigation',
    descriptionBn: 'পেজের শুরুতে লোগো ও নেভিগেশন',
    icon: 'LayoutPanelTop',
    category: 'navigation',
    allowedPages: ['landing'],
    defaultProps: {
      logoUrl: '',
      showCart: false,
      sticky: true,
    },
  },
  
  'footer': {
    type: 'footer',
    name: 'Footer',
    nameBn: 'ফুটার',
    description: 'Contact info and social links',
    descriptionBn: 'পেজের শেষে যোগাযোগ ও সোশ্যাল লিংক',
    icon: 'LayoutGrid',
    category: 'navigation',
    allowedPages: ['landing'],
    defaultProps: {
      showSocialLinks: true,
      showContact: true,
    },
  },
  
  // =========================================================================
  // CART & CHECKOUT SECTIONS
  // =========================================================================
  'cart-items': {
    type: 'cart-items',
    name: 'Cart Items',
    description: 'List of items in the cart',
    icon: 'ShoppingBag',
    category: 'conversion',
    allowedPages: ['cart'],
    defaultProps: {
      heading: 'Your Cart',
      continueShoppingText: 'Continue Shopping',
      emptyText: 'Your cart is empty',
    },
  },
  
  'cart-summary': {
    type: 'cart-summary',
    name: 'Order Summary',
    description: 'Cart totals and checkout button',
    icon: 'Calculator',
    category: 'conversion',
    allowedPages: ['cart'],
    defaultProps: {
      checkoutText: 'Proceed to Checkout',
      trustText1: 'Secure checkout',
      trustText2: 'Fast delivery',
      trustText3: 'Easy returns',
    },
  },
  
  'collection-header': {
    type: 'collection-header',
    name: 'Collection Header',
    description: 'Title and description for the collection',
    icon: 'Type',
    category: 'products',
    allowedPages: ['collection'],
    defaultProps: {
      alignment: 'center',
    },
  },
  
  // =========================================================================
  // UTILITY SECTIONS
  // =========================================================================
  'faq': {
    type: 'faq',
    name: 'FAQ',
    nameBn: 'FAQ',
    description: 'Frequently asked questions',
    descriptionBn: 'সচরাচর জিজ্ঞাসা',
    icon: 'HelpCircle',
    category: 'utility',
    allowedPages: ['home', 'product', 'landing', 'page'],
    defaultProps: {
      heading: 'Frequently Asked Questions',
      faqs: [
        { question: 'Question 1?', answer: 'Answer 1' },
      ],
    },
  },
  
  'contact': {
    type: 'contact',
    name: 'Contact',
    nameBn: 'যোগাযোগ',
    description: 'Phone, address, and message form',
    descriptionBn: 'ফোন, ঠিকানা ও মেসেজ ফর্ম',
    icon: 'MessageCircle',
    category: 'utility',
    allowedPages: ['landing', 'page'],
    defaultProps: {
      heading: 'যোগাযোগ করুন',
      showForm: true,
    },
  },
  
  'stats': {
    type: 'stats',
    name: 'Stats Counter',
    nameBn: 'পরিসংখ্যান',
    description: 'Animated statistics counters',
    descriptionBn: 'সন্তুষ্ট গ্রাহক ও অর্ডার সংখ্যা',
    icon: 'BarChart3',
    category: 'utility',
    allowedPages: ['home', 'landing'],
    defaultProps: {
      stats: [
        { value: 5000, label: 'Happy Customers', suffix: '+' },
        { value: 10000, label: 'Orders Delivered', suffix: '+' },
      ],
    },
  },
  
  'delivery': {
    type: 'delivery',
    name: 'Delivery Info',
    nameBn: 'ডেলিভারি',
    description: 'Shipping and delivery information',
    descriptionBn: 'শিপিং ও ডেলিভারি তথ্য',
    icon: 'Truck',
    category: 'utility',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'ডেলিভারি তথ্য',
      areas: [],
    },
  },
  
  'guarantee': {
    type: 'guarantee',
    name: 'Guarantee',
    nameBn: 'গ্যারান্টি',
    description: 'Return and refund policy',
    descriptionBn: 'রিটার্ন ও রিফান্ড পলিসি',
    icon: 'Shield',
    category: 'utility',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: '১০০% সন্তুষ্টি গ্যারান্টি',
      text: 'পছন্দ না হলে টাকা ফেরত',
    },
  },
  
  'how-to-order': {
    type: 'how-to-order',
    name: 'How to Order',
    nameBn: 'অর্ডার প্রক্রিয়া',
    description: 'Step-by-step ordering instructions',
    descriptionBn: 'অর্ডার করার নিয়মাবলী',
    icon: 'ListOrdered',
    category: 'utility',
    allowedPages: ['landing'],
    defaultProps: {
      heading: 'কিভাবে অর্ডার করবেন?',
      steps: [
        { step: '১', title: 'ফর্ম পূরণ করুন', description: 'নাম ও ফোন নম্বর দিন' },
        { step: '২', title: 'কনফার্ম করুন', description: 'আমরা কল করব' },
        { step: '৩', title: 'ডেলিভারি নিন', description: 'বাসায় বসে পণ্য নিন' },
      ],
    },
  },
  
  'comparison': {
    type: 'comparison',
    name: 'Comparison',
    nameBn: 'তুলনা',
    description: 'Before/After comparison',
    descriptionBn: 'আগে/পরে তুলনা',
    icon: 'Layers',
    category: 'utility',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      heading: 'আগে vs পরে',
      beforeImage: '',
      afterImage: '',
    },
  },
  
  // =========================================================================
  // MEDIA SECTIONS
  // =========================================================================
  'gallery': {
    type: 'gallery',
    name: 'Gallery',
    nameBn: 'গ্যালারি',
    description: 'Product image gallery',
    descriptionBn: 'প্রোডাক্ট ইমেজ গ্যালারি',
    icon: 'Image',
    category: 'media',
    allowedPages: ['landing', 'product'],
    defaultProps: {
      images: [],
      layout: 'grid',
    },
  },
  
  'video': {
    type: 'video',
    name: 'Video',
    nameBn: 'ভিডিও',
    description: 'Embed product video',
    descriptionBn: 'প্রোডাক্ট ভিডিও',
    icon: 'Video',
    category: 'media',
    allowedPages: ['home', 'landing', 'product'],
    defaultProps: {
      heading: 'Watch Our Video',
      videoUrl: '',
      autoplay: false,
    },
  },
  
  // =========================================================================
  // CUSTOM SECTIONS
  // =========================================================================
  'custom-html': {
    type: 'custom-html',
    name: 'Custom HTML',
    nameBn: 'কাস্টম HTML',
    description: 'Import your own HTML design',
    descriptionBn: 'নিজের ডিজাইন ইম্পোর্ট করুন',
    icon: 'Code',
    category: 'custom',
    allowedPages: ['landing', 'page'],
    defaultProps: {
      html: '',
      css: '',
    },
  },
  
  'newsletter': {
    type: 'newsletter',
    name: 'Newsletter',
    description: 'Email subscription form',
    icon: 'Mail',
    category: 'conversion',
    allowedPages: ['home', 'page'],
    defaultProps: {
      heading: 'Join Our Newsletter',
      subheading: 'Subscribe to receive updates and exclusive offers.',
      buttonText: 'Subscribe',
      placeholderText: 'Enter your email',
      successMessage: 'Thanks for subscribing!',
    },
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all section types as an array.
 */
export function getAllUnifiedSectionTypes(): UnifiedSectionType[] {
  return Object.keys(UNIFIED_SECTION_REGISTRY) as UnifiedSectionType[];
}

/**
 * Get section definition by type.
 */
export function getUnifiedSectionDefinition(type: string): UnifiedSectionDefinition | null {
  return UNIFIED_SECTION_REGISTRY[type as UnifiedSectionType] || null;
}

/**
 * Get sections allowed for a specific template key.
 */
export function getSectionsForTemplate(templateKey: TemplateKey): UnifiedSectionDefinition[] {
  return Object.values(UNIFIED_SECTION_REGISTRY).filter(
    section => section.allowedPages.includes(templateKey)
  );
}

/**
 * Get sections by category.
 */
export function getSectionsByCategory(category: SectionCategory): UnifiedSectionDefinition[] {
  return Object.values(UNIFIED_SECTION_REGISTRY).filter(
    section => section.category === category
  );
}

/**
 * Get default props for a section type.
 */
export function getUnifiedDefaultProps(type: string): Record<string, unknown> {
  const definition = UNIFIED_SECTION_REGISTRY[type as UnifiedSectionType];
  return definition?.defaultProps ?? {};
}

/**
 * Check if a section type is valid.
 */
export function isValidUnifiedSectionType(type: string): type is UnifiedSectionType {
  return type in UNIFIED_SECTION_REGISTRY;
}

/**
 * Get all categories with their sections.
 */
export function getCategorizedSections(templateKey?: TemplateKey): Record<SectionCategory, UnifiedSectionDefinition[]> {
  const categories: Record<SectionCategory, UnifiedSectionDefinition[]> = {
    hero: [],
    content: [],
    products: [],
    'social-proof': [],
    conversion: [],
    navigation: [],
    utility: [],
    media: [],
    custom: [],
  };
  
  for (const section of Object.values(UNIFIED_SECTION_REGISTRY)) {
    if (!templateKey || section.allowedPages.includes(templateKey)) {
      categories[section.category].push(section);
    }
  }
  
  return categories;
}

// ============================================================================
// DEFAULT SECTIONS FOR EACH TEMPLATE TYPE
// ============================================================================

export const DEFAULT_TEMPLATE_SECTIONS: Record<TemplateKey, UnifiedSectionType[]> = {
  home: ['hero', 'category-list', 'product-grid', 'features', 'testimonials', 'newsletter'],
  product: ['product-header', 'product-gallery', 'product-info', 'product-description', 'related-products', 'product-reviews'],
  collection: ['collection-header', 'product-grid'],
  cart: ['cart-items', 'cart-summary'],
  checkout: ['trust-badges'], // Checkout mostly uses built-in components
  page: ['hero', 'rich-text', 'faq'],
  landing: ['header', 'hero', 'trust-badges', 'features', 'benefits', 'testimonials', 'faq', 'cta', 'footer'],
};
