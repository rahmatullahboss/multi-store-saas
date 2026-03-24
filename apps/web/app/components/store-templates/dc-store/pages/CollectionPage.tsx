/**
 * DC Store Collection/Category Page
 * 
 * Based on the original DC Store design with golden gradient theme.
 * Features product grid with filters and sorting.
 */

import { useState } from 'react';
import { Filter, SlidersHorizontal, Grid3X3, List } from 'lucide-react';
import type { SerializedProduct } from '~/templates/store-registry';
import { PreviewSafeLink } from '~/components/PreviewSafeLink';
import { resolveDCStoreTheme } from '../theme';
import type { ThemeConfig } from '@db/types';
import { useTranslation } from 'react-i18next';
import { DCProductCard } from '../sections/ProductCard';

interface DCCollectionPageProps {
  products: SerializedProduct[];
  category?: string | null;
  storeId: number;
  isPreview?: boolean;
  config?: ThemeConfig | null;
}

export function DCCollectionPage({ 
  products, 
  category, 
  storeId, 
  isPreview = false,
  config 
}: DCCollectionPageProps) {
  const theme = resolveDCStoreTheme(config);
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'newest'>('featured');
  const [showFilters, setShowFilters] = useState(false);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Header Banner */}
      <div className="relative h-48 md:h-64 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1555529771-83ae7c2a8b2e?w=1600&h=400&fit=crop"
          alt={category || 'সকল পণ্য'}
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {category || 'সকল পণ্য'}
            </h1>
            <p className="text-lg opacity-90">
              {products.length} টি পণ্য
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors"
            style={{ 
              backgroundColor: theme.cardBg,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
          >
            <Filter className="w-5 h-5" />
            ফিল্টার
          </button>

          {/* Sort & View Options */}
          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 rounded-xl font-medium focus:outline-none focus:ring-2"
              style={{ 
                backgroundColor: theme.cardBg,
                borderColor: theme.border,
                color: theme.text,
                '--tw-ring-color': theme.primaryLight,
              } as React.CSSProperties}
            >
              <option value="featured">ফিচার্ড</option>
              <option value="price-low">দাম: কম থেকে বেশি</option>
              <option value="price-high">দাম: বেশি থেকে কম</option>
              <option value="newest">নতুন</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 p-1 rounded-xl" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.border}` }}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? '' : 'hover:bg-gray-100'}`}
                style={{ 
                  backgroundColor: viewMode === 'grid' ? theme.primary : 'transparent',
                  color: viewMode === 'grid' ? '#ffffff' : theme.text,
                }}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? '' : 'hover:bg-gray-100'}`}
                style={{ 
                  backgroundColor: viewMode === 'list' ? theme.primary : 'transparent',
                  color: viewMode === 'list' ? '#ffffff' : theme.text,
                }}
                aria-label="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div 
            className="mb-8 p-6 rounded-2xl animate-in slide-in-from-top-2"
            style={{ 
              backgroundColor: theme.cardBg,
              boxShadow: theme.shadowLg,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.text }}>
                <SlidersHorizontal className="w-5 h-5" style={{ color: theme.primary }} />
                ফিল্টার
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="text-sm font-medium hover:underline"
                style={{ color: theme.muted }}
              >
                বন্ধ করুন
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  দামের সীমা
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="সর্বনিম্ন"
                    className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.border,
                      '--tw-ring-color': theme.primaryLight,
                    } as React.CSSProperties}
                  />
                  <input
                    type="number"
                    placeholder="সর্বোচ্চ"
                    className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ 
                      borderColor: theme.border,
                      '--tw-ring-color': theme.primaryLight,
                    } as React.CSSProperties}
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  ক্যাটাগরি
                </label>
                <select className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2" style={{ 
                  borderColor: theme.border,
                  '--tw-ring-color': theme.primaryLight,
                } as React.CSSProperties}>
                  <option value="">সকল ক্যাটাগরি</option>
                  <option value="electronics">ইলেক্ট্রনিক্স</option>
                  <option value="fashion">ফ্যাশন</option>
                  <option value="home">হোম ও লিভিং</option>
                  <option value="beauty">বিউটি</option>
                </select>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                  প্রাপ্যতা
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" style={{ accentColor: theme.primary }} />
                  <span style={{ color: theme.text }}>শুধুমাত্র স্টকে আছে</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: theme.border }}>
              <button
                className="px-6 py-2 rounded-xl font-medium transition-colors"
                style={{ 
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  color: theme.text,
                }}
              >
                সব মুছুন
              </button>
              <button
                className="px-6 py-2 rounded-xl font-bold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: theme.primary }}
              >
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {sortedProducts.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
            : "space-y-4"
          }>
            {sortedProducts.map((product) => (
              <DCProductCard
                key={product.id}
                product={product}
                storeId={storeId}
                isPreview={isPreview}
                theme={theme}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.primaryLight }}>
              <Filter className="w-10 h-10" style={{ color: theme.primary }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.text }}>
              কোনো পণ্য পাওয়া যায়নি
            </h3>
            <p className="text-lg" style={{ color: theme.muted }}>
              ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন
            </p>
          </div>
        )}

        {/* Pagination */}
        {sortedProducts.length > 0 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              className="px-4 py-2 rounded-xl font-medium transition-colors"
              disabled
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.muted,
              }}
            >
              পূর্ববর্তী
            </button>
            <button
              className="px-4 py-2 rounded-xl font-bold text-white"
              style={{ backgroundColor: theme.primary }}
            >
              1
            </button>
            <button
              className="px-4 py-2 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              2
            </button>
            <button
              className="px-4 py-2 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              3
            </button>
            <button
              className="px-4 py-2 rounded-xl font-medium transition-colors"
              style={{ 
                backgroundColor: theme.cardBg,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
            >
              পরবর্তী
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
