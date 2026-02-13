/**
 * Lead Gen Template Registry
 * 
 * Mirrors the store-registry.ts pattern for lead gen themes.
 * Each theme has a unique renderer component.
 */

import type { ComponentType } from 'react';
import type { LeadGenThemeProps } from './themes/shared';

// Lazy imports for code splitting
import ProfessionalServicesRenderer from './themes/professional-services';
import ConsultingFirmRenderer from './themes/consulting-firm';
import LawFirmRenderer from './themes/law-firm';
import HealthcareRenderer from './themes/healthcare';
import AgencyRenderer from './themes/agency';
import StudyAbroadRenderer from './themes/study-abroad';

// ============================================================================
// TYPES
// ============================================================================

export interface LeadGenTemplateDefinition {
  id: string;
  name: string;
  description: string;
  component: ComponentType<LeadGenThemeProps>;
}

// ============================================================================
// REGISTRY
// ============================================================================

export const LEAD_GEN_TEMPLATES: LeadGenTemplateDefinition[] = [
  {
    id: 'professional-services',
    name: 'Professional Services',
    description: 'Clean corporate design with blue tones, perfect for consulting and professional services.',
    component: ProfessionalServicesRenderer,
  },
  {
    id: 'consulting-firm',
    name: 'Consulting Firm',
    description: 'Modern SaaS-style layout with clean cards and gradient accents for consultancies.',
    component: ConsultingFirmRenderer,
  },
  {
    id: 'law-firm',
    name: 'Law Firm',
    description: 'Dark, authoritative design with serif typography and gold accents for legal practices.',
    component: LawFirmRenderer,
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    description: 'Clean, trustworthy medical design with rounded elements for clinics and hospitals.',
    component: HealthcareRenderer,
  },
  {
    id: 'agency',
    name: 'Creative Agency',
    description: 'Bold, creative design with dynamic gradients and portfolio sections for agencies.',
    component: AgencyRenderer,
  },
  {
    id: 'study-abroad',
    name: 'Study Abroad',
    description: 'Education consultancy theme with destination cards and accreditation sections.',
    component: StudyAbroadRenderer,
  },
];

// ============================================================================
// HELPERS
// ============================================================================

const DEFAULT_TEMPLATE_ID = 'professional-services';

export function getLeadGenTemplate(id: string): LeadGenTemplateDefinition {
  const template = LEAD_GEN_TEMPLATES.find((t) => t.id === id);
  return template ?? LEAD_GEN_TEMPLATES.find((t) => t.id === DEFAULT_TEMPLATE_ID)!;
}

export function isValidLeadGenTheme(id: string): boolean {
  return LEAD_GEN_TEMPLATES.some((t) => t.id === id);
}
