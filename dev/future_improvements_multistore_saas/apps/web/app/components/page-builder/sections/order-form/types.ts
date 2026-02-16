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
  | 'social-proof'
  | 'organic';

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

  // Urgency/Scarcity Settings (Editable - No fake data!)
  showUrgencyBanner?: boolean;
  urgencyText?: string; // e.g., "সীমিত স্টক! মাত্র ২৩টি বাকি আছে" - seller sets real number

  // Social Proof Settings (Editable - Must be real data!)
  showSocialProof?: boolean;
  socialProofText?: string; // e.g., "গত ২৪ ঘণ্টায় ৪৭ জন অর্ডার করেছেন" - seller sets real number

  // Free Shipping Settings
  showFreeShippingProgress?: boolean;
  freeShippingThreshold?: number; // e.g., 2000

  // Delivery Estimate Settings
  showDeliveryEstimate?: boolean;
  deliveryEstimateDhaka?: string; // e.g., "১-২ দিন"
  deliveryEstimateOutside?: string; // e.g., "৩-৫ দিন"

  // Combo/Bundle Discount Settings (Editable from editor, syncs to backend)
  enableComboDiscount?: boolean;
  comboDiscount2Products?: number; // Percentage discount for 2 products (e.g., 10 = 10%)
  comboDiscount3Products?: number; // Percentage discount for 3+ products (e.g., 15 = 15%)

  // Real data flags - use actual stock/order data from DB
  useRealStockCount?: boolean;
  useRealOrderCount?: boolean;
}

// Selected product for multi-product landing pages
export interface SelectedProductInfo {
  id: number;
  title: string;
  price: number;
  compareAtPrice?: number | null;
  imageUrl?: string | null;
}

export interface OrderFormComponentProps {
  props: Record<string, unknown>;
  theme?: SectionTheme;
  storeId?: number;
  productId?: number;
  product?: ProductInfo | null;
  // Multiple products for dropdown selection in multi-product pages
  selectedProducts?: SelectedProductInfo[];
  // Real data from DB for urgency/social proof (no fake numbers!)
  realData?: {
    stockCount: number | null;
    recentOrderCount: number;
  };
}
