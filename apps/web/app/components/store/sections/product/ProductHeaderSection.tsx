/**
 * Product Header Section
 * 
 * Displays product breadcrumbs and optional banner.
 * This is a lightweight section for navigation context.
 */

import { Link } from '@remix-run/react';
import { ChevronRight, Home } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface ProductHeaderSectionProps {
  sectionId: string;
  props: {
    showBreadcrumbs?: boolean;
    paddingTop?: 'none' | 'small' | 'medium' | 'large';
    paddingBottom?: 'none' | 'small' | 'medium' | 'large';
  };
  context: ProductContext;
}

const PADDING_MAP = {
  none: '',
  small: 'py-2',
  medium: 'py-4',
  large: 'py-6',
};

export default function ProductHeaderSection({ sectionId, props, context }: ProductHeaderSectionProps) {
  const {
    showBreadcrumbs = true,
    paddingTop = 'small',
    paddingBottom = 'small',
  } = props;

  const product = context.product as any;
  const shopName = context.shop?.name || 'Store';

  if (!showBreadcrumbs) {
    return null;
  }

  return (
    <section 
      id={sectionId}
      className={`bg-gray-50 ${PADDING_MAP[paddingTop]} ${PADDING_MAP[paddingBottom]}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center text-sm text-gray-500" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-gray-700 flex items-center">
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <Link to="/products" className="hover:text-gray-700">
            Products
          </Link>
          {product?.category && (
            <>
              <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              <Link 
                to={`/category/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
                className="hover:text-gray-700"
              >
                {product.category}
              </Link>
            </>
          )}
          <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">
            {product?.title || 'Product'}
          </span>
        </nav>
      </div>
    </section>
  );
}
