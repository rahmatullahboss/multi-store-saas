/**
 * SectionRenderer — Compatibility Shim
 * 
 * The full section renderer has been removed. This provides a no-op
 * component so templates that import it can still compile.
 * 
 * @deprecated Will be removed in a future cleanup pass
 */

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionRenderer(_props: any): React.ReactElement | null {
  // No-op: dynamic sections are no longer supported
  return null;
}
