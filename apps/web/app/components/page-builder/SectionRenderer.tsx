import type { ReactElement } from 'react';

// MVP fallback renderer: returns an empty node for archived page-builder sections.
export function SectionRenderer(): ReactElement | null {
  return null;
}

export default SectionRenderer;
