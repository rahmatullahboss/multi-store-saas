/**
 * Cart Upsell Section
 * 
 * Recommended products to add to cart.
 */

import { Link } from '@remix-run/react';
import { ShoppingBag, Plus } from 'lucide-react';
import type { CartContext } from '~/lib/template-resolver.server';

interface CartUpsellSectionProps {
  sectionId: string;
  props: {
    title?: string;
    productCount?: number;
  };
  context: CartContext;
}

export default function CartUpsellSection({ sectionId, props, context }: CartUpsellSectionProps) {
  const {
    title = 'You might also like',
    productCount = 4,
  } = props;

  // In a real implementation, this would come from context
  const products: any[] = [];
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

  return (
    <section 
      id={sectionId}
      className="py-8 px-4"
      style={{ backgroundColor: themeColors.backgroundColor }}
    >
      <div className="max-w-4xl mx-auto">
        <h3 
          className="text-lg font-bold mb-4"
          style={{ color: themeColors.textColor }}
        >
          {title}
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.slice(0, productCount).map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
              <Link to={`/products/${product.slug || product.id}`} className="block aspect-square bg-gray-100">
                {product.images?.[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </Link>
              <div className="p-3">
                <Link 
                  to={`/products/${product.slug || product.id}`}
                  className="text-sm font-medium line-clamp-1 hover:underline"
                >
                  {product.name}
                </Link>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-bold text-sm" style={{ color: themeColors.accentColor }}>
                    {formatPrice(product.price)}
                  </span>
                  <button 
                    className="p-1.5 rounded-full hover:bg-gray-100"
                    style={{ color: themeColors.accentColor }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
