/**
 * Lead Gen Renderer Component
 *
 * Renders lead generation pages based on theme settings.
 * Uses the registry pattern (same as store-registry.ts for e-commerce).
 *
 * Each theme has its own unique renderer in themes/ directory.
 */

import type { LeadGenSettingsWithTheme } from '~/services/lead-gen-settings.server';
import { getLeadGenTemplate } from './lead-gen-registry';

// ============================================================================
// TYPES
// ============================================================================

interface LeadGenRendererProps {
  themeId: string;
  settings: LeadGenSettingsWithTheme;
  storeId: number;
  storeName: string;
  storeLogo?: string | null;
  customer?: {
    id: number;
    name: string;
    email: string;
    imageUrl?: string | null;
  } | null;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LeadGenRenderer({
  themeId,
  settings,
  storeId,
  customer,
}: LeadGenRendererProps) {
  // Look up the template from the registry
  const template = getLeadGenTemplate(themeId);
  const ThemeComponent = template.component;

  return <ThemeComponent settings={settings} storeId={storeId} customer={customer} />;
}
