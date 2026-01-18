/**
 * Order Form Section Types
 * Shared types for all order form variants
 */

import type { SectionTheme } from '~/lib/page-builder/types';

export type OrderFormVariant = 
  | 'default'
  | 'glassmorphism'
  | 'neubrutalism'
  | 'trust-first'
  | 'story-driven'
  | 'urgency'
  | 'social-proof';

export interface ProductVariant {
  id: string;
  name: string;
  price?: number;
}

export interface ProductInfo {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  description?: string | null;
  variants?: Array<{
    id: number;
    name: string;
    price: number;
  }>;
}

export interface OrderFormProps {
  // Content
  headline?: string;
  subheadline?: string;
  buttonText?: string;
  
  // Visual variant
  variant?: OrderFormVariant;
  
  // Template layout (legacy support)
  template?: 'minimal' | 'premium' | 'urgent' | 'singleColumn' | 'withImage';
  
  // Placeholders
  phonePlaceholder?: string;
  addressPlaceholder?: string;
  
  // Pricing
  productPrice?: number;
  discountedPrice?: number;
  insideDhakaCharge?: number;
  outsideDhakaCharge?: number;
  
  // Product info from section props
  productImage?: string | null;
  productTitle?: string | null;
  
  // Variants
  variants?: ProductVariant[];
  variantLabel?: string;
  
  // Labels
  quantityLabel?: string;
  insideDhakaLabel?: string;
  outsideDhakaLabel?: string;
  subtotalLabel?: string;
  deliveryLabel?: string;
  totalLabel?: string;
  
  // BD Address System
  showDistrictField?: boolean;
  showUpazilaField?: boolean;
  districtLabel?: string;
  upazilaLabel?: string;
  addressLabel?: string;
  districtPlaceholder?: string;
  upazilaPlaceholder?: string;
  shippingZoneMode?: 'auto' | 'manual';
  
  // Field Builder
  showEmailField?: boolean;
  showAltPhoneField?: boolean;
  showNoteField?: boolean;
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  altPhoneLabel?: string;
  altPhonePlaceholder?: string;
  noteLabel?: string;
  notePlaceholder?: string;
  
  // Thank You Page
  thankYouHeadline?: string;
  thankYouMessage?: string;
  thankYouRedirectUrl?: string;
  showOrderDetails?: boolean;
  showWhatsAppButton?: boolean;
  whatsAppNumber?: string;
  
  // Trust badges
  showTrustBadges?: boolean;
  codLabel?: string;
  secureLabel?: string;
}

export interface OrderFormComponentProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
  storeId?: number;
  productId?: number;
  product?: ProductInfo | null;
}
