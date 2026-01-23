/**
 * Related Products Section
 * 
 * Displays related/similar products on the product page.
 */

import { Link } from '@remix-run/react';
import { ShoppingBag } from 'lucide-react';
import type { ProductContext } from '~/lib/template-resolver.server';

interface RelatedProductsSectionProps {
  sectionId: string;
  props: {
    title?: string;
    productCount?: number;
    columns?: number;
  };
  context: ProductContext;
}

interface Product {
  id: number;
  name: string;
  slug?: string;
  price: number;
  compareAtPrice?: number | null;
  images?: string[];
}

export default function RelatedProductsSection({ sectionId, props, context }: RelatedProductsSectionProps) {
  const {
    title = 'You May Also Like',
    productCount = 4,
    columns = 4,
  } = props;

  const products = ((context.relatedProducts as Product[]) || []).slice(0, productCount);
  const themeColors = context.theme;
  const currency = context.currency || 'BDT';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (products.length === 0) {
    return null;
  }

  const columnClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-7xl mx-auto">
        <h2 
          className="text-2xl font-bold mb-6"
          style={{ 
            color: themeColors.textColor,
            fontFamily: themeColors.headingFont,
          }}
        >
          {title}
        </h2>

        <div className={`grid ${columnClasses[columns as keyof typeof columnClasses] || columnClasses[4]} gap-4`}>
          {products.map((product) => (
            <Link
              key={product.id}
              to={`/products/${product.slug || product.id}`}
              className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 
                  className="font-medium text-sm line-clamp-2 group-hover:underline"
                  style={{ color: themeColors.textColor }}
                >
                  {product.name}
                </h3>
                <div className="mt-1 flex items-center gap-2">
                  <span 
                    className="font-bold"
                    style={{ color: themeColors.accentColor }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
