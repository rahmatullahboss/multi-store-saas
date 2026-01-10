
import type { ComponentType } from 'react';

// ============================================================================
// SECTION TYPES & SETTINGS SCHEMA
// ============================================================================

export type SectionType = 'hero' | 'product-grid' | 'newsletter' | 'rich-text' | 'features' | 'video' | 'testimonials';

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
  layout?: 'image_left' | 'image_right' | 'image_top' | 'image_bottom';
  
  // Special
  collectionId?: string;
  productCount?: number;
  autoplay?: boolean;
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
import { Layout,  ShoppingBag, Mail } from 'lucide-react';

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
    },
    component: HeroSection
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
