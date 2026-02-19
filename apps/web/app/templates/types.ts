import type { ComponentType } from 'react';

// ============================================================================
// StoreTemplateTheme
// This is the internal theme shape used by all store templates.
// Note: This is DIFFERENT from ThemeConfig (@db/types) which uses primaryColor/accentColor.
// ============================================================================
export interface StoreTemplateTheme {
  primary: string;
  accent: string;
  background: string;
  text: string;
  muted: string;
  cardBg: string;
  cardBorder?: string;
  headerBg: string;
  footerBg: string;
  footerText: string;
  secondary?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// SerializedProduct & SerializedVariant — exported for themes that import them
// ============================================================================
// ============================================================================
// SerializedProduct & SerializedVariant — exported for themes that import them
// ============================================================================
export interface SerializedVariant {
  id: number;
  name: string;
  price?: number | null;
  compareAtPrice?: number | null;
  stock?: number | null;
  imageUrl?: string | null;
  sku?: string | null;
  [key: string]: any;
}

export interface SerializedProduct {
  id: number;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
  imageUrl?: string | null;
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  stock?: number | null;
  isActive?: boolean;
  variants?: SerializedVariant[];
  [key: string]: any;
}

// ============================================================================
// StoreCategory type (for components that accept category objects)
// ============================================================================
export interface StoreCategory {
  title?: string;
  slug?: string;
  imageUrl?: string;
  [key: string]: string | undefined;
}

// ============================================================================
// StoreHeaderProps & StoreFooterProps — shared header/footer prop contracts
// ============================================================================
export interface StoreHeaderProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: any;
  categories?: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  socialLinks?: any;
  [key: string]: any;
}

export interface StoreFooterProps {
  storeName: string;
  logo?: string | null;
  isPreview?: boolean;
  config?: any;
  socialLinks?: any;
  businessInfo?: any;
  footerConfig?: any;
  [key: string]: any;
}

// ============================================================================
// StoreTemplateDefinition
// ============================================================================
export interface StoreTemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  category: string;
  theme: StoreTemplateTheme;
  component: React.LazyExoticComponent<ComponentType<any>>;
  Header: React.LazyExoticComponent<ComponentType<any>>;
  Footer: React.LazyExoticComponent<ComponentType<any>>;
  ProductPage: React.LazyExoticComponent<ComponentType<any>>;
  CartPage: React.LazyExoticComponent<ComponentType<any>>;
  CheckoutPage: React.LazyExoticComponent<ComponentType<any>>;
  CollectionPage: React.LazyExoticComponent<ComponentType<any>>;
  fonts: {
    heading: string;
    body: string;
  };
}

// ============================================================================
// StoreTemplateProps
// Common prop set accepted by all template homepage / LiveHomepage components
// ============================================================================
export interface StoreTemplateProps {
  store?: any;
  template?: StoreTemplateDefinition;
  storeName?: string;
  storeId?: string;
  logo?: string | null;
  products?: any[];
  categories?: (string | StoreCategory | null)[];
  currentCategory?: string | null;
  config?: any; // ThemeConfig from @db/types — keeps loose coupling
  currency?: string;
  socialLinks?: {
    facebook?: string | null;
    instagram?: string | null;
    whatsapp?: string | null;
    twitter?: string | null;
    youtube?: string | null;
    linkedin?: string | null;
    [key: string]: string | null | undefined;
  } | null;
  footerConfig?: any;
  businessInfo?: {
    phone?: string | null;
    email?: string | null;
    address?: string | null;
    [key: string]: string | null | undefined;
  } | null;
  planType?: string;
  isPreview?: boolean;
  aiCredits?: number;
  isCustomerAiEnabled?: boolean;
  customer?: any;
  [key: string]: any;
}
