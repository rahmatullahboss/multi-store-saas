/**
 * Lead Gen Template Registry
 * 
 * Mirrors the store-registry.ts pattern for lead gen themes.
 * Each theme has a unique renderer component.
 * 
 * Themes are split into:
 *   - core/   → Free themes available to all users
 *   - custom/ → Paid themes designed for specific clients
 */

import type { ComponentType } from 'react';
import type { LeadGenThemeProps } from './themes/shared';

// Core theme imports
import ProfessionalServicesRenderer from './themes/core/professional-services';
import ConsultingFirmRenderer from './themes/core/consulting-firm';
import LawFirmRenderer from './themes/core/law-firm';
import HealthcareRenderer from './themes/core/healthcare';
import AgencyRenderer from './themes/core/agency';
import StudyAbroadRenderer from './themes/core/study-abroad';

// Custom (paid) theme imports — add new client themes here
// import FashionHouseRenderer from './themes/custom/fashion-house';

// ============================================================================
// TYPES
// ============================================================================

export interface LeadGenTemplateDefinition {
  id: string;
  name: string;
  description: string;
  component: ComponentType<LeadGenThemeProps>;
  /** true = paid/custom theme, false = free core theme */
  isPaid: boolean;
  /** 'core' for free themes, 'custom' for paid client themes */
  category: 'core' | 'custom';
  /** Client name (only for custom themes) */
  clientName?: string;
}

// ============================================================================
// CORE THEMES (Free)
// ============================================================================

const CORE_TEMPLATES: LeadGenTemplateDefinition[] = [
  {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Clean corporate design with blue tones, perfect for consulting and professional services.',
    component: ProfessionalServicesRenderer,
    isPaid: false,
    category: 'core',
  },
  {
    id: 'consulting-firm',
    name: 'Consulting Firm',
    description: 'Modern SaaS-style layout with clean cards and gradient accents for consultancies.',
    component: ConsultingFirmRenderer,
    isPaid: false,
    category: 'core',
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    description: 'Dark, authoritative design with serif typography and gold accents for legal practices.',
    component: LawFirmRenderer,
    isPaid: false,
    category: 'core',
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Clean, trustworthy medical design with rounded elements for clinics and hospitals.',
    component: HealthcareRenderer,
    isPaid: false,
    category: 'core',
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    description: 'Bold, creative design with dynamic gradients and portfolio sections for agencies.',
    component: AgencyRenderer,
    isPaid: false,
    category: 'core',
  },
  {
    id: 'study-abroad',
    name: 'Study Abroad',
    description: 'Education consultancy theme with destination cards and accreditation sections.',
    component: StudyAbroadRenderer,
    isPaid: false,
    category: 'core',
  },
];

// ============================================================================
// CUSTOM THEMES (Paid)
// ============================================================================

const CUSTOM_TEMPLATES: LeadGenTemplateDefinition[] = [
  // ─── Add new paid client themes here ───
  // Example:
  // {
  //   id: 'client-fashion-house',
  //   name: 'Fashion House',
  //   description: 'Custom luxury fashion theme for Fashion House client.',
  //   component: FashionHouseRenderer,
  //   isPaid: true,
  //   category: 'custom',
  //   clientName: 'Fashion House',
  // },
];

// ============================================================================
// COMBINED REGISTRY
// ============================================================================

export const LEAD_GEN_TEMPLATES: LeadGenTemplateDefinition[] = [
  ...CORE_TEMPLATES,
  ...CUSTOM_TEMPLATES,
];

// ============================================================================
// HELPERS
// ============================================================================

const DEFAULT_TEMPLATE_ID = 'professional-services';

/** Get a template by ID (falls back to default) */
export function getLeadGenTemplate(id: string): LeadGenTemplateDefinition {
  const template = LEAD_GEN_TEMPLATES.find((t) => t.id === id);
  return template ?? LEAD_GEN_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;
}

/** Check if a theme ID is valid */
export function isValidLeadGenTheme(id: string): boolean {
  return LEAD_GEN_TEMPLATES.some((t) => t.id === id);
}

/** Get only core (free) themes */
export function getCoreLeadGenTemplates(): LeadGenTemplateDefinition[] {
  return CORE_TEMPLATES;
}

/** Get only custom (paid) themes */
export function getCustomLeadGenTemplates(): LeadGenTemplateDefinition[] {
  return CUSTOM_TEMPLATES;
}
