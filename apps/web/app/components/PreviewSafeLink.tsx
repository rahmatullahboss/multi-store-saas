/**
 * PreviewSafeLink Component
 * 
 * A link component that respects preview mode.
 * When isPreview is true, links are disabled and don't navigate.
 * This prevents template previews from navigating away from the preview context.
 */

import { Link, type LinkProps, useNavigate, useParams } from '@remix-run/react';
import type { ReactNode, MouseEvent } from 'react';

interface PreviewSafeLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  isPreview?: boolean;
  children: ReactNode;
  className?: string;
}

export function usePreviewClick(isPreview?: boolean) {
  const navigate = useNavigate();
  const params = useParams();
  
  return (e: MouseEvent, to: string) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
      
      // If we are in preview mode, we need to stay in the preview route
      // The current route is /store-template-preview/:templateId
      // We need to append the target path to this
      
      const templateId = params.templateId;
      if (templateId) {
        // Handle root link
        if (to === '/') {
          navigate(`/store-template-preview/${templateId}`);
          return;
        }

        // Clean the path
        const cleanPath = to.startsWith('/') ? to.substring(1) : to;
        
        // Construct new path
        navigate(`/store-template-preview/${templateId}/${cleanPath}`);
      }
    }
  };
}

export function PreviewSafeLink({ 
  isPreview, 
  children, 
  to, 
  className = '',
  onClick,
  ...props 
}: PreviewSafeLinkProps) {
  const handlePreviewClick = usePreviewClick(isPreview);

  if (isPreview) {
    return (
      <a
        href={to}
        className={className}
        onClick={(e) => {
          if (onClick) onClick(e);
          handlePreviewClick(e, to);
        }}
        {...props}
      >
        {children}
      </a>
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
