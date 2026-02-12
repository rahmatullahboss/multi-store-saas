/**
 * Professional Services Theme - Theme Registration & Metadata
 *
 * A modern lead generation theme with:
 * - Clean, professional design
 * - Inline contact forms
 * - Service showcase
 * - Client testimonials
 * - Strong CTAs
 *
 * Perfect for: Consultants, Agencies, B2B Services, Professional Services
 */

import type { ThemeConfig, SectionRegistry } from '~/lib/theme-engine/types';

// Import section components
import ProfessionalHeader, { schema as headerSchema } from './sections/header';
import HeroWithForm, { schema as heroWithFormSchema } from './sections/hero-with-form';
import ServicesGrid, { schema as servicesGridSchema } from './sections/services-grid';
import Testimonials, { schema as testimonialsSchema } from './sections/testimonials';
import ContactCTA, { schema as contactCTASchema } from './sections/contact-cta';
import ProfessionalFooter, { schema as footerSchema } from './sections/footer';

// ============================================================================
// THEME METADATA
// ============================================================================

export const THEME_METADATA = {
  id: 'professional-services',
  name: 'Professional Services',
  nameBn: 'প্রফেশনাল সার্ভিসেস',
  version: '1.0.0',
  author: 'Ozzyl',
  description:
    'Modern lead generation theme for consultants, agencies, and B2B services with inline contact forms',
  descriptionBn:
    'কনসালট্যান্ট, এজেন্সি এবং বিজনেস সার্ভিসের জন্য আধুনিক লিড ক্যাপচার থিম',

  // Preview
  previewImage: '/themes/professional-services/preview.png',
  previewUrl: 'https://professional-services-demo.ozzyl.com',

  // Category
  category: 'lead-gen',
  tags: ['lead-generation', 'b2b', 'services', 'consulting', 'professional'],

  // Features
  features: [
    'Inline contact forms',
    'Service showcase',
    'Client testimonials',
    'Mobile responsive',
    'Fast loading',
    'SEO optimized',
  ],

  // Use cases
  useCases: [
    'Consulting firms',
    'Marketing agencies',
    'Law firms',
    'Accounting services',
    'IT services',
    'Business consulting',
  ],
};

// ============================================================================
// SECTION REGISTRY
// ============================================================================

export const SECTION_REGISTRY: SectionRegistry = {
  header: {
    component: ProfessionalHeader,
    schema: headerSchema,
  },
  'hero-with-form': {
    component: HeroWithForm,
    schema: heroWithFormSchema,
  },
  'services-grid': {
    component: ServicesGrid,
    schema: servicesGridSchema,
  },
  testimonials: {
    component: Testimonials,
    schema: testimonialsSchema,
  },
  'contact-cta': {
    component: ContactCTA,
    schema: contactCTASchema,
  },
  footer: {
    component: ProfessionalFooter,
    schema: footerSchema,
  },
};

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_CONFIG: ThemeConfig = {
  colors: {
    primary: '#2563EB', // Professional blue
    secondary: '#7C3AED', // Purple accent
    accent: '#F59E0B', // Orange for CTAs
    background: '#FFFFFF',
    foreground: '#1F2937',
    muted: '#6B7280',
    border: '#E5E7EB',
    success: '#10B981',
    error: '#EF4444',
  },

  typography: {
    fontFamily: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
  },

  spacing: {
    section: '5rem',
    container: '1280px',
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

export { ProfessionalHeader, HeroWithForm, ServicesGrid, Testimonials, ContactCTA, ProfessionalFooter };

export default {
  metadata: THEME_METADATA,
  sections: SECTION_REGISTRY,
  config: THEME_CONFIG,
};
