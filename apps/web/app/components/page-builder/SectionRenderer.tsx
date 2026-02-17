import type { ReactElement } from 'react';

/** Props accepted by SectionRenderer for type compatibility with routes.
 *  MVP stub — renders nothing; full implementation is archived. */
export interface SectionRendererProps {
  sections?: unknown[];
  activeSectionId?: string | null;
  storeId?: number;
  productId?: number;
  product?: unknown;
  selectedProducts?: unknown[];
  realData?: Record<string, unknown>;
}

// MVP fallback renderer: returns an empty node for archived page-builder sections.
export function SectionRenderer(_props: SectionRendererProps): ReactElement | null {
  return null;
}

export default SectionRenderer;
