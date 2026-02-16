import type { ReactElement, ReactNode } from 'react';

interface TemplateLayoutRendererProps {
  children?: ReactNode;
}

// MVP fallback layout wrapper for archived builder templates.
export function TemplateLayoutRenderer({ children }: TemplateLayoutRendererProps): ReactElement {
  return <>{children}</>;
}

export default TemplateLayoutRenderer;
