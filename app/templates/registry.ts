/**
 * Template Registry - Dynamic Landing Page Templates
 * 
 * Central registry for all available landing page templates.
 * All templates use the same LandingPageTemplate component with different theme configs.
 * This ensures PREVIEW and LIVE store show exactly the same design.
 */

import type { ComponentType } from 'react';
import type { LandingConfig } from '@db/types';

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

// ============================================================================
// TEMPLATES REGISTRY - All templates use same component, different themes
// ============================================================================
export const TEMPLATES: TemplateDefinition[] = [
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
];

// ============================================================================
// DEFAULT TEMPLATE - Fallback when no template is specified
// ============================================================================
export const DEFAULT_TEMPLATE_ID = 'modern-dark';

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
