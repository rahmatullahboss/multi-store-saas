/**
 * Template Registry - Dynamic Landing Page Templates
 * 
 * Central registry for all available landing page templates.
 * All templates use the same LandingPageTemplate component with different theme configs.
 * This ensures PREVIEW and LIVE store show exactly the same design.
 */

import type { ComponentType } from 'react';
import type { LandingConfig, ManualPaymentConfig } from '@db/types';

// ============================================================================
// SERIALIZED PRODUCT TYPE - Matches what loader provides
// ============================================================================
export interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
}

// ============================================================================
// TEMPLATE PROPS - All templates must accept these props
// ============================================================================
export interface TemplateProps {
  storeName: string;
  storeId: number;
  product: SerializedProduct;
  config: LandingConfig;
  currency: string;
  isPreview?: boolean;
  isEditMode?: boolean;  // For Magic Editor integration
  isCustomerAiEnabled?: boolean; // For AI Sales Agent
  planType?: string; // For Growth Branding Loop
  manualPaymentConfig?: ManualPaymentConfig | null; // For checkout
  onConfigChange?: (newConfig: LandingConfig) => void;
  // Product variants for variant selection in order forms
  productVariants?: Array<{
    id: number;
    option1Name: string | null;
    option1Value: string | null;
    option2Name: string | null;
    option2Value: string | null;
    price: number | null;
    inventory: number | null;
    isAvailable: boolean | null;
  }>;
  // Order bumps - add-on offers during checkout
  orderBumps?: Array<{
    id: number;
    title: string;
    description?: string | null;
    discount: number;
    bumpProduct: {
      id: number;
      title: string;
      price: number;
      imageUrl?: string | null;
    };
  }>;
}

// ============================================================================
// TEMPLATE DEFINITION - Metadata for each template
// ============================================================================
export interface TemplateDefinition {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // Path to preview image or placeholder
  component: ComponentType<TemplateProps>;
}

// ============================================================================
// SINGLE UNIFIED TEMPLATE - Same component for Preview & Live
// ============================================================================
import { LandingPageTemplate } from '~/components/templates/LandingPageTemplate';
import { PremiumBDTemplate } from '~/components/templates/PremiumBDTemplate';
import { MobileFirstTemplate } from '~/components/templates/MobileFirstTemplate';
import { FlashSaleTemplate } from '~/components/templates/FlashSaleTemplate';
import { LuxeTemplate } from '~/components/templates/LuxeTemplate';
import { OrganicTemplate } from '~/components/templates/OrganicTemplate';
import { ShowcaseTemplate } from '~/components/templates/ShowcaseTemplate';

// ============================================================================
// TEMPLATES REGISTRY - All templates use same component, different themes
// ============================================================================
export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'premium-bd',
    name: 'Premium BD (Mobile First)',
    description: 'World-class, high-converting design optimized for Bangladeshi market.',
    thumbnail: '/templates/premium-bd.png',
    component: PremiumBDTemplate,
  },
  {
    id: 'flash-sale',
    name: '🔥 Flash Sale (Urgency)',
    description: 'High urgency design with sticky countdown, shake animations, and stock warnings. Perfect for limited-time offers.',
    thumbnail: '/templates/flash-sale.png',
    component: FlashSaleTemplate,
  },
  {
    id: 'mobile-first',
    name: 'Simple Mobile (Single Column)',
    description: 'Clean, single-column layout optimized for easy checkout on mobile devices.',
    thumbnail: '/templates/mobile-first.png',
    component: MobileFirstTemplate,
  },
  {
    id: 'luxury',
    name: 'Luxury Black (Gold Edition)',
    description: 'Premium black and gold aesthetic with serif typography, perfect for high-ticket items.',
    thumbnail: '/templates/luxury.png',
    component: LuxeTemplate,
  },
  {
    id: 'organic',
    name: 'Organic Green (Nature)',
    description: 'Earthy tones, organic shapes, and a natural feel. Perfect for health and eco-friendly products.',
    thumbnail: '/templates/organic.png',
    component: OrganicTemplate,
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Bold gradients, urgency colors, and high-converting dark theme design.',
    thumbnail: '/templates/modern-dark.png',
    component: LandingPageTemplate,
  },
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    description: 'Clean white background with centered typography and elegant simplicity.',
    thumbnail: '/templates/minimal-light.png',
    component: LandingPageTemplate,
  },
  {
    id: 'video-focus',
    name: 'Video Focus',
    description: 'Video-first design with full-width hero video and overlay CTA.',
    thumbnail: '/templates/video-focus.png',
    component: LandingPageTemplate,
  },
  {
    id: 'showcase',
    name: '✨ Showcase Gallery (Multi-Image)',
    description: 'Premium dark aesthetic designed to showcase product details with a gallery grid. Perfect for luxury items.',
    thumbnail: '/templates/showcase.png', // We will need to generate this later
    component: ShowcaseTemplate,
  },
];

// ============================================================================
// DEFAULT TEMPLATE - Fallback when no template is specified
// ============================================================================
export const DEFAULT_TEMPLATE_ID = 'premium-bd';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a template by ID
 * Returns the default template if ID is not found
 */
export function getTemplate(id: string | undefined): TemplateDefinition {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) {
    // Fallback to default template
    return TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID) ?? TEMPLATES[0];
  }
  return template;
}

/**
 * Helper to get the component for a template ID
 */
export function getTemplateComponent(id: string | undefined): ComponentType<TemplateProps> {
  const template = getTemplate(id);
  return template.component;
}

/**
 * Get all available templates
 * Useful for the template selector UI
 */
export function getAllTemplates(): TemplateDefinition[] {
  return TEMPLATES;
}

/**
 * Check if a template ID is valid
 */
export function isValidTemplateId(id: string): boolean {
  return TEMPLATES.some((t) => t.id === id);
}
