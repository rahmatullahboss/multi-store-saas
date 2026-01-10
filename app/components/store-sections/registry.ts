
import type { ComponentType } from 'react';

// ============================================================================
// SECTION TYPES & SETTINGS SCHEMA
// ============================================================================

export type SectionType = 
  | 'hero' 
  | 'product-grid' 
  | 'newsletter' 
  | 'rich-text' 
  | 'features' 
  | 'video' 
  | 'testimonials'
  | 'category-list'
  | 'product-scroll'
  | 'banner'
  | 'faq';

export interface SectionAction {
  label: string;
  url: string;
  style?: 'primary' | 'secondary' | 'outline' | 'link';
}

export interface SectionSettings {
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
  autoplay?: boolean;
  
  // New props
  mode?: string; // e.g. 'flash-sale'
  limit?: number;
  features?: any[];
  faqs?: any[];
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
}


// ============================================================================
// REGISTRY
// ============================================================================
import HeroSection from './HeroSection';
import ProductGridSection from './ProductGridSection';
import NewsletterSection from './NewsletterSection';
import CategorySection from './CategorySection';
import ProductScrollSection from './ProductScrollSection';
import FeaturesSection from './FeaturesSection';
import BannerSection from './BannerSection';
import FAQSection from './FAQSection';

import RichTextSection from './RichTextSection';

import { Layout, ShoppingBag, Mail, Grid3X3, Zap, Shield, Image, HelpCircle, FileText } from 'lucide-react';

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
    component: HeroSection
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
    component: RichTextSection
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
    component: CategorySection
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
    component: ProductScrollSection
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
    component: FeaturesSection
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
    component: BannerSection
  },
  'faq': {
    type: 'faq',
    name: 'FAQ',
    icon: 'HelpCircle',
    description: 'Frequently Asked Questions.',
    defaultSettings: {
      heading: 'Frequently Asked Questions',
    },
    component: FAQSection
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
      paddingBottom: 'large'
    },
    component: ProductGridSection
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
      paddingBottom: 'medium'
    },
    component: NewsletterSection
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
      subheading: 'Discover our premium collection',
      primaryAction: { label: 'Shop Now', url: '/#products' },
      alignment: 'center',
      paddingTop: 'none',
      paddingBottom: 'none'
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
