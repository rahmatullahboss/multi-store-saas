/**
 * AnnouncementBar — Compatibility Shim
 * 
 * @deprecated The section-based announcement bar has been removed.
 * This provides a no-op component for templates that import it.
 */

import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AnnouncementBar(_props: any): React.ReactElement | null {
  return null;
}

export default AnnouncementBar;
