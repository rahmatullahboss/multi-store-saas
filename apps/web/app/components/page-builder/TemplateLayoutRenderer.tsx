import type { ReactElement, ReactNode } from 'react';

export interface TemplateLayoutRendererProps {
  children?: ReactNode;
  /** Template ID (accepted for compatibility, currently unused in MVP stub) */
  templateId?: string;
}

// MVP fallback layout wrapper for archived builder templates.
export function TemplateLayoutRenderer({ children }: TemplateLayoutRendererProps): ReactElement {
  return <>{children}</>;
}

export default TemplateLayoutRenderer;
