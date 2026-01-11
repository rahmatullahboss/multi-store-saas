/**
 * Landing Sections - Shared Types
 * 
 * Common types and interfaces for all section components
 */

import type { LandingConfig } from '@db/types';
import type { SerializedProduct } from '~/templates/registry';

// Base props that all sections receive
export interface BaseSectionProps {
  config: LandingConfig;
  product: SerializedProduct;
  storeName: string;
  currency: string;
  isPreview?: boolean;
  isEditMode?: boolean;
  theme?: string;
}

// Individual section props (for sections that need extra data)
export interface HeroSectionProps extends BaseSectionProps {
  discount?: number;
}

export interface OrderFormSectionProps extends BaseSectionProps {
  formData: {
    customer_name: string;
    phone: string;
    address: string;
    division: string;
    quantity: number;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    customer_name: string;
    phone: string;
    address: string;
    division: string;
    quantity: number;
  }>>;
  validationErrors: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  orderBumps?: any[];
  selectedBumpIds: number[];
  setSelectedBumpIds: React.Dispatch<React.SetStateAction<number[]>>;
  subtotal: number;
  shippingCost: number;
  totalPrice: number;
  formatPrice: (price: number) => string;
}

// Section IDs
export type SectionId = 
  | 'hero'
  | 'trust'
  | 'features'
  | 'gallery'
  | 'video'
  | 'benefits'
  | 'comparison'
  | 'testimonials'
  | 'social'
  | 'delivery'
  | 'faq'
  | 'guarantee'
  | 'cta';

// Section component type
export type SectionComponent = React.ComponentType<BaseSectionProps>;
