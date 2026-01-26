/**
 * PreviewSafeLink Component
 *
 * A link component that respects preview mode.
 * When isPreview is true, links are rewritten to stay within preview context.
 * This allows template previews to navigate while staying in preview mode.
 */

import { Link, type LinkProps, useNavigate, useParams } from '@remix-run/react';
import type { ReactNode, MouseEvent } from 'react';

interface PreviewSafeLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  isPreview?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Hook to transform URLs for preview mode
 * Returns the transformed URL that stays within preview context
 */
export function usePreviewUrl(isPreview?: boolean) {
  const params = useParams();

  return (to: string): string => {
    if (!isPreview) return to;

    const templateId = params.templateId;
    if (!templateId) return to;

    // Handle root link
    if (to === '/') {
      return `/store-template-preview/${templateId}`;
    }

    // Handle product links: /product/123 or /products/123 -> /store-template-preview/:id/products/123
    if (to.startsWith('/product/')) {
      const productId = to.replace('/product/', '');
      return `/store-template-preview/${templateId}/products/${productId}`;
    }
    if (to.startsWith('/products/') && to !== '/products/') {
      const productId = to.replace('/products/', '');
      return `/store-template-preview/${templateId}/products/${productId}`;
    }

    // Handle cart link
    if (to === '/cart' || to.startsWith('/cart')) {
      return `/store-template-preview/${templateId}/cart`;
    }

    // Handle collection/category links
    if (to.startsWith('/collection/') || to.startsWith('/collections/')) {
      const collectionId = to.replace(/^\/(collection|collections)\//, '');
      return `/store-template-preview/${templateId}/collections/${collectionId}`;
    }

    // Handle category query params (/?category=...) - redirect to collection page
    if (to.startsWith('/?category=') || to.includes('category=')) {
      const urlParams = new URLSearchParams(to.split('?')[1] || '');
      const category = urlParams.get('category');
      if (category) {
        return `/store-template-preview/${templateId}/collections/${encodeURIComponent(category)}`;
      }
      return `/store-template-preview/${templateId}`;
    }

    // Handle /products route
    if (to === '/products' || to.startsWith('/products?')) {
      return `/store-template-preview/${templateId}/collections/all-products`;
    }

    // Default: append path to preview route
    const cleanPath = to.startsWith('/') ? to.substring(1) : to;
    return `/store-template-preview/${templateId}/${cleanPath}`;
  };
}

export function usePreviewClick(isPreview?: boolean) {
  const navigate = useNavigate();
  const getPreviewUrl = usePreviewUrl(isPreview);

  return (e: MouseEvent, to: string) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
      navigate(getPreviewUrl(to));
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
  const getPreviewUrl = usePreviewUrl(isPreview);
  const handlePreviewClick = usePreviewClick(isPreview);

  // In preview mode, use transformed URL directly with Link
  if (isPreview) {
    const previewUrl = getPreviewUrl(to);
    return (
      <Link to={previewUrl} className={className} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  // In normal mode, render actual Link
  return (
    <Link to={to} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  );
}
