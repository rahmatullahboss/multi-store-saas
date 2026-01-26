/**
 * Shared Collection Page Component (Theme-Aware)
 *
 * A universal collection/category page that dynamically adapts to any template's theme.
 * Used as fallback for templates that don't have their own CollectionPage.
 *
 * Features:
 * - Product grid
 * - Sorting and filtering
 * - Category description
 * - Fully theme-aware
 */

import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from '@remix-run/react';
import { Filter, ChevronDown, Package, ShoppingCart } from 'lucide-react';
import type { StoreTemplateTheme, SerializedProduct } from '~/templates/store-registry';

interface SharedCollectionPageProps {
  products: SerializedProduct[];
  category: string;
  categories: (string | null)[];
  currency: string;
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

export default function SharedCollectionPage({
  products,
  category,
  categories,
  currency,
  theme,
  isPreview = false,
}: SharedCollectionPageProps) {
  const params = useParams();
  const templateId = params.templateId;
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Default theme if not provided
  const colors = theme || {
    primary: '#1a1a1a',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1a1a1a',
    muted: '#6b7280',
    cardBg: '#ffffff',
    headerBg: '#ffffff',
    footerBg: '#1a1a1a',
    footerText: '#ffffff',
  };

  const currencySymbol = currency === 'BDT' ? '৳' : '$';

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/')) {
        const id = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${id}`;
      }
      if (path.startsWith('/collections/')) {
        const cat = path.replace('/collections/', '');
        return `/store-template-preview/${templateId}/collections/${cat}`;
      }
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const displayCategory = category === 'all-products' ? 'All Products' : category;

  // Filter products based on category if needed (though usually done by loader)
  // For 'all-products', we show everything.
  const filteredProducts = products;

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', e.target.value);
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
              {displayCategory}
            </h1>
            <p style={{ color: colors.muted }}>{filteredProducts.length} products found</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg"
              style={{ backgroundColor: colors.cardBg, color: colors.text }}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="relative">
              <select
                onChange={handleSortChange}
                className="appearance-none pl-4 pr-10 py-2 border rounded-lg bg-transparent cursor-pointer focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  borderColor: colors.muted + '40',
                  ['--tw-ring-color' as any]: colors.accent,
                }}
                defaultValue={searchParams.get('sort') || 'featured'}
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: colors.muted }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className={`md:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden md:block'}`}>
            <div className="sticky top-24 space-y-8">
              {/* Categories */}
              <div>
                <h3 className="font-semibold mb-4" style={{ color: colors.text }}>
                  Categories
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to={getLink('/collections/all-products')}
                      className={`block transition-colors ${category === 'all-products' ? 'font-medium' : ''}`}
                      style={{
                        color: category === 'all-products' ? colors.accent : colors.muted,
                      }}
                    >
                      All Products
                    </Link>
                  </li>
                  {categories.filter(Boolean).map((cat) => (
                    <li key={cat}>
                      <Link
                        to={getLink(`/collections/${cat!.toLowerCase().replace(/\s+/g, '-')}`)}
                        className={`block transition-colors ${
                          // Simple matching logic
                          category.toLowerCase() === cat!.toLowerCase().replace(/\s+/g, '-')
                            ? 'font-medium'
                            : ''
                        }`}
                        style={{
                          color:
                            category.toLowerCase() === cat!.toLowerCase().replace(/\s+/g, '-')
                              ? colors.accent
                              : colors.muted,
                        }}
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={getLink(`/products/${product.id}`)}
                    className="group rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
                    style={{ backgroundColor: colors.cardBg }}
                  >
                    <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}

                      {/* Quick Add Overlay (Optional) */}
                      <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:block">
                        <button
                          className="w-full py-2 rounded font-medium shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                          style={{ backgroundColor: colors.primary, color: '#fff' }}
                          onClick={(e) => {
                            e.preventDefault();
                            // Quick add logic would go here
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-grow">
                      <h3
                        className="font-medium text-sm md:text-base mb-1 line-clamp-2 group-hover:text-opacity-80 transition-colors"
                        style={{ color: colors.text }}
                      >
                        {product.title}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex flex-col">
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-xs line-through" style={{ color: colors.muted }}>
                              {currencySymbol}
                              {product.compareAtPrice.toLocaleString()}
                            </span>
                          )}
                          <span className="font-bold" style={{ color: colors.accent }}>
                            {currencySymbol}
                            {product.price.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center lg:hidden"
                          style={{ backgroundColor: colors.background }}
                        >
                          <ShoppingCart className="w-4 h-4" style={{ color: colors.primary }} />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="text-center py-20 rounded-lg"
                style={{ backgroundColor: colors.cardBg }}
              >
                <Package
                  className="w-16 h-16 mx-auto mb-4 opacity-20"
                  style={{ color: colors.text }}
                />
                <h2 className="text-xl font-medium mb-2" style={{ color: colors.text }}>
                  No products found
                </h2>
                <p style={{ color: colors.muted }}>
                  Try checking another category or clearing filters.
                </p>
                <Link
                  to={getLink('/collections/all-products')}
                  className="inline-block mt-6 px-6 py-2 rounded-lg font-medium transition-opacity hover:opacity-90"
                  style={{ backgroundColor: colors.primary, color: '#fff' }}
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
