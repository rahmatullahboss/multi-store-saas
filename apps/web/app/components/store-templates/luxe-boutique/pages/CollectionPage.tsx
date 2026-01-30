import { Link, useParams, useSearchParams } from '@remix-run/react';
import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { formatPrice } from '~/lib/theme-engine';

interface LuxeCollectionProps {
  products: SerializedProduct[];
  category: string;
  categories: (string | null)[];
  currency: string;
  theme?: any;
  isPreview?: boolean;
}

export function LuxeCollectionPage({
  products,
  category,
  categories,
  currency,
  theme,
  isPreview = false,
}: LuxeCollectionProps) {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const templateId = params.templateId || 'luxe-boutique';
  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Helper for preview links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/')) return `/store-template-preview/${templateId}${path}`;
      if (path.startsWith('/collections/')) return `/store-template-preview/${templateId}${path}`;
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const currentCategory = category === 'all-products' ? 'All Collection' : category;

  return (
    <div className="min-h-screen bg-[#faf9f7] font-sans text-[#1a1a1a]">
      {/* Elegant Header */}
      <div className="pt-24 pb-12 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 capitalize tracking-wide">
          {currentCategory.replace(/-/g, ' ')}
        </h1>
        <div className="w-16 h-0.5 bg-[#c9a961] mx-auto mb-6"></div>
        <p className="text-[#6b6b6b] max-w-lg mx-auto font-light">
          Explore our curated selection of premium products, designed for elegance and style.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Filters & Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-[#e5e5e5] pb-4 gap-4">
          <div className="flex items-center gap-6 overflow-x-auto w-full md:w-auto no-scrollbar">
            <Link
              to={getLink('/collections/all-products')}
              className={`text-sm uppercase tracking-widest hover:text-[#c9a961] transition-colors whitespace-nowrap ${
                category === 'all-products' ? 'font-bold border-b-2 border-[#c9a961] pb-1' : ''
              }`}
            >
              All
            </Link>
            {categories.filter(Boolean).map((cat) => (
              <Link
                key={cat}
                to={getLink(`/collections/${cat!.toLowerCase().replace(/\s+/g, '-')}`)}
                className={`text-sm uppercase tracking-widest hover:text-[#c9a961] transition-colors whitespace-nowrap ${
                  category.toLowerCase() === cat!.toLowerCase().replace(/\s+/g, '-')
                    ? 'font-bold border-b-2 border-[#c9a961] pb-1'
                    : ''
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest text-[#6b6b6b]">Sort By:</span>
            <div className="relative group">
              <select
                className="appearance-none bg-transparent border-none text-sm uppercase tracking-widest font-medium focus:ring-0 cursor-pointer pr-6"
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set('sort', e.target.value);
                  setSearchParams(newParams);
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">New Arrivals</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-[#1a1a1a]" />
            </div>
          </div>
        </div>

        {/* Product Grid - Minimalist Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {products.map((product) => (
            <Link key={product.id} to={getLink(`/products/${product.id}`)} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-white">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    Image
                  </div>
                )}
                {/* Overlay Button */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6">
                  <button className="bg-white text-[#1a1a1a] px-8 py-3 uppercase text-xs tracking-widest font-bold hover:bg-[#1a1a1a] hover:text-white transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                    View Details
                  </button>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-serif text-lg text-[#1a1a1a] mb-1 group-hover:text-[#c9a961] transition-colors">
                  {product.title}
                </h3>
                <div className="flex items-center justify-center gap-3 text-sm">
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-[#999] line-through">
                      {currencySymbol}
                      {product.compareAtPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="font-medium">{formatPrice(product.price)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
