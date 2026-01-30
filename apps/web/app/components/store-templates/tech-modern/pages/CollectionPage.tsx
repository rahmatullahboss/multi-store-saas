import { Link, useParams } from '@remix-run/react';
import { Filter, Grid, List } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { formatPrice } from '~/lib/theme-engine';

interface TechCollectionProps {
  products: SerializedProduct[];
  category: string;
  categories: (string | null)[];
  currency: string;
  theme?: any;
  isPreview?: boolean;
}

export function TechCollectionPage({
  products,
  category,
  categories,
  currency,
  isPreview = false,
}: TechCollectionProps) {
  const params = useParams();
  const templateId = params.templateId || 'tech-modern';
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm sticky top-24">
              <h3 className="font-bold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
                <Filter size={16} /> Filters
              </h3>

              <div className="space-y-2">
                <h4 className="font-semibold text-xs text-gray-500 uppercase mt-4 mb-2">
                  Categories
                </h4>
                <PreviewSafeLink
                  to="/collections/all-products"
                  isPreview={isPreview}
                  className={`block text-sm py-1 ${category === 'all-products' ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}
                >
                  All Products
                </PreviewSafeLink>
                {categories.filter(Boolean).map((cat) => (
                  <PreviewSafeLink
                    key={cat}
                    to={`/collections/${cat!.toLowerCase().replace(/\s+/g, '-')}`}
                    isPreview={isPreview}
                    className={`block text-sm py-1 ${category.toLowerCase() === cat!.toLowerCase().replace(/\s+/g, '-') ? 'text-blue-600 font-bold' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    {cat}
                  </PreviewSafeLink>
                ))}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
              <h1 className="font-bold text-lg capitalize">{category.replace(/-/g, ' ')}</h1>
              <div className="flex gap-2">
                <button className="p-2 bg-gray-100 rounded hover:bg-gray-200">
                  <Grid size={16} />
                </button>
                <button className="p-2 bg-white rounded hover:bg-gray-50 text-gray-400">
                  <List size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map((product) => (
                <PreviewSafeLink
                  key={product.id}
                  to={`/products/${product.id}`}
                  isPreview={isPreview}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col block"
                >
                  <div className="aspect-square bg-white p-4 flex items-center justify-center relative border-b border-gray-100">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="max-w-full max-h-full object-contain transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                        No Image
                      </div>
                    )}
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        SALE
                      </span>
                    )}
                  </div>

                  <div className="p-3 flex-1 flex flex-col">
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors h-10">
                      {product.title}
                    </h3>

                    <div className="mt-auto">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-lg font-bold text-blue-600">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                      <button className="w-full bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 text-xs font-bold py-2 rounded transition-colors uppercase tracking-wide">
                        View Specs
                      </button>
                    </div>
                  </div>
                </PreviewSafeLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
