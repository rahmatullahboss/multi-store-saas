/**
 * PreviewSafeLink Component
 * 
 * A link component that respects preview mode.
 * When isPreview is true, links are disabled and don't navigate.
 * This prevents template previews from navigating away from the preview context.
 */

import { Link, type LinkProps } from '@remix-run/react';
import type { ReactNode, MouseEvent } from 'react';

interface PreviewSafeLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  isPreview?: boolean;
  children: ReactNode;
  className?: string;
}

export function PreviewSafeLink({ 
  isPreview, 
  children, 
  to, 
  className = '',
  onClick,
  ...props 
}: PreviewSafeLinkProps) {
  // In preview mode, render a span that looks like a link but doesn't navigate
  if (isPreview) {
    return (
      <span 
        className={className}
        onClick={(e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        style={{ cursor: 'pointer' }}
        role="link"
        tabIndex={0}
      >
        {children}
      </span>
    );
  }

  // In normal mode, render actual Link
  return (
    <Link 
      to={to} 
      className={className}
      onClick={onClick}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Hook to get a click handler that prevents navigation in preview mode
 */
export function usePreviewClick(isPreview?: boolean) {
  return (e: MouseEvent) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };
}
