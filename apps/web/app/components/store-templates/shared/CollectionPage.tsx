/**
 * Shared Collection Page Component (Theme-Aware) - Shopify Standard
 *
 * A world-class collection/category page that dynamically adapts to any template's theme.
 * Built to Shopify standards with all premium e-commerce features.
 *
 * Features:
 * - Product grid with 3:4 aspect ratio
 * - Faceted filtering (Price, Availability, Sort)
 * - Active filters display with remove
 * - Pagination with load more
 * - Grid/List view toggle
 * - Quick add to cart
 * - Collection banner
 * - Mobile-friendly filter drawer
 * - Fully theme-aware
 * - Preview/Live mode support
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams, useSearchParams } from '@remix-run/react';
import { formatPrice } from '~/lib/theme-engine';
import {
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  ShoppingCart,
  X,
  Grid3X3,
  List,
  Check,
  Heart,
  Eye,
  SlidersHorizontal,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { StoreTemplateTheme, SerializedProduct } from '~/templates/store-registry';

interface SharedCollectionPageProps {
  products: SerializedProduct[];
  category: string;
  categories: (string | null)[];
  currency: string;
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
  totalProducts?: number;
  currentPage?: number;
  hasNextPage?: boolean;
}

// Price range options
const PRICE_RANGES = [
  { id: 'all', label: 'All Prices', min: 0, max: Infinity },
  { id: 'under-500', label: 'Under ৳500', min: 0, max: 500 },
  { id: '500-1000', label: '৳500 - ৳1,000', min: 500, max: 1000 },
  { id: '1000-2500', label: '৳1,000 - ৳2,500', min: 1000, max: 2500 },
  { id: '2500-5000', label: '৳2,500 - ৳5,000', min: 2500, max: 5000 },
  { id: 'over-5000', label: 'Over ৳5,000', min: 5000, max: Infinity },
];

// Sort options
const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'name-asc', label: 'Name: A to Z' },
  { id: 'name-desc', label: 'Name: Z to A' },
];

// Products per page options
const PER_PAGE_OPTIONS = [12, 24, 48];

export default function SharedCollectionPage({
  products,
  category,
  categories,
  currency,
  theme,
  isPreview = false,
  totalProducts,
  currentPage = 1,
  hasNextPage = false,
}: SharedCollectionPageProps) {
  const params = useParams();
  const templateId = params.templateId;
  const [searchParams, setSearchParams] = useSearchParams();

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

  // UI State
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedFilters, setExpandedFilters] = useState<Record<string, boolean>>({
    categories: true,
    price: true,
    availability: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Filter State (client-side for preview, URL params for live)
  const [priceRange, setPriceRange] = useState('all');
  const [availability, setAvailability] = useState<'all' | 'in-stock'>('all');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [perPage, setPerPage] = useState(Number(searchParams.get('per_page')) || 24);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      if (stored) setWishlist(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Helper for preview-safe links
  const getLink = (path: string) => {
    if (isPreview && templateId) {
      if (path === '/') return `/store-template-preview/${templateId}`;
      if (path.startsWith('/products/')) {
        const id = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${id}`;
      }
      if (path.startsWith('/products/')) {
        const cat = path.replace('/products/', '');
        return `/store-template-preview/${templateId}/products/${cat}`;
      }
      return `/store-template-preview/${templateId}${path}`;
    }
    return path;
  };

  const displayCategory = category === 'all-products' ? 'All Products' : category;
  const validCategories = categories.filter(Boolean) as string[];

  // Active filters for display
  const activeFilters = useMemo(() => {
    const filters: { id: string; label: string; onRemove: () => void }[] = [];
    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === priceRange);
      filters.push({
        id: 'price',
        label: range?.label || priceRange,
        onRemove: () => setPriceRange('all'),
      });
    }
    if (availability === 'in-stock') {
      filters.push({
        id: 'availability',
        label: 'In Stock Only',
        onRemove: () => setAvailability('all'),
      });
    }
    return filters;
  }, [priceRange, availability]);

  // Filter and sort products (client-side for preview)
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Price filter
    if (priceRange !== 'all') {
      const range = PRICE_RANGES.find((r) => r.id === priceRange);
      if (range) {
        result = result.filter((p) => p.price >= range.min && p.price < range.max);
      }
    }

    // Availability filter (if stock info available)
    if (availability === 'in-stock') {
      result = result.filter((p) => (p as any).stock !== 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        // Assuming higher ID = newer
        result.sort((a, b) => b.id - a.id);
        break;
      default:
        // Featured - keep original order
        break;
    }

    return result;
  }, [products, priceRange, availability, sortBy]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(0, perPage);
  }, [filteredProducts, perPage]);

  // Update URL params
  const updateFilters = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'featured') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value);
    if (!isPreview) {
      updateFilters('sort', value);
    }
  };

  // Handle add to cart
  const handleQuickAdd = (e: React.MouseEvent, product: SerializedProduct) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingIndex = cart.findIndex((item: any) => item.productId === product.id);

      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          productId: product.id,
          quantity: 1,
          title: product.title,
          price: product.price,
          imageUrl: product.imageUrl,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch (err) {
      console.error('Failed to add to cart', err);
    }
  };

  // Handle wishlist toggle
  const toggleWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlist((prev) => {
      const newList = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      localStorage.setItem('wishlist', JSON.stringify(newList));
      return newList;
    });
  };

  // Toggle filter section
  const toggleFilter = (key: string) => {
    setExpandedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange('all');
    setAvailability('all');
    setSortBy('featured');
    if (!isPreview) {
      setSearchParams(new URLSearchParams());
    }
  };

  // Filter sidebar component
  const FilterSidebar = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <button
          onClick={() => toggleFilter('categories')}
          className="flex items-center justify-between w-full py-2 font-semibold"
          style={{ color: colors.text }}
        >
          Categories
          {expandedFilters.categories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedFilters.categories && (
          <ul className="space-y-2 mt-3">
            <li>
              <Link
                to={getLink('/products/all-products')}
                className={`block py-1 transition-colors ${
                  category === 'all-products' ? 'font-medium' : ''
                }`}
                style={{
                  color: category === 'all-products' ? colors.accent : colors.muted,
                }}
              >
                All Products
              </Link>
            </li>
            {validCategories.map((cat) => {
              const catSlug = cat.toLowerCase().replace(/\s+/g, '-');
              const isActive = category.toLowerCase() === catSlug;
              return (
                <li key={cat}>
                  <Link
                    to={getLink(`/products/${catSlug}`)}
                    className={`block py-1 transition-colors ${isActive ? 'font-medium' : ''}`}
                    style={{ color: isActive ? colors.accent : colors.muted }}
                  >
                    {cat}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Price Range */}
      <div className="border-t pt-6" style={{ borderColor: colors.muted + '20' }}>
        <button
          onClick={() => toggleFilter('price')}
          className="flex items-center justify-between w-full py-2 font-semibold"
          style={{ color: colors.text }}
        >
          Price
          {expandedFilters.price ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedFilters.price && (
          <div className="space-y-2 mt-3">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.id}
                className="flex items-center gap-2 py-1 cursor-pointer"
                style={{ color: colors.muted }}
              >
                <input
                  type="radio"
                  name="price"
                  checked={priceRange === range.id}
                  onChange={() => setPriceRange(range.id)}
                  className="w-4 h-4"
                  style={{ accentColor: colors.accent }}
                />
                <span className={priceRange === range.id ? 'font-medium' : ''}>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="border-t pt-6" style={{ borderColor: colors.muted + '20' }}>
        <button
          onClick={() => toggleFilter('availability')}
          className="flex items-center justify-between w-full py-2 font-semibold"
          style={{ color: colors.text }}
        >
          Availability
          {expandedFilters.availability ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        {expandedFilters.availability && (
          <div className="space-y-2 mt-3">
            <label
              className="flex items-center gap-2 py-1 cursor-pointer"
              style={{ color: colors.muted }}
            >
              <input
                type="checkbox"
                checked={availability === 'in-stock'}
                onChange={(e) => setAvailability(e.target.checked ? 'in-stock' : 'all')}
                className="w-4 h-4 rounded"
                style={{ accentColor: colors.accent }}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      {/* Clear Filters Button */}
      {activeFilters.length > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 mt-4 text-sm font-medium rounded-lg border transition-colors hover:opacity-80"
          style={{ borderColor: colors.muted + '40', color: colors.text }}
        >
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Collection Banner */}
      <div
        className="py-8 md:py-12 border-b"
        style={{
          backgroundColor: colors.cardBg,
          borderColor: colors.muted + '20',
        }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: colors.text }}>
            {displayCategory}
          </h1>
          <p style={{ color: colors.muted }}>{totalProducts || filteredProducts.length} products</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          {/* Left: Filter button (mobile) + Active filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border rounded-lg font-medium"
              style={{
                backgroundColor: colors.cardBg,
                color: colors.text,
                borderColor: colors.muted + '40',
              }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFilters.length > 0 && (
                <span
                  className="w-5 h-5 rounded-full text-xs flex items-center justify-center text-white"
                  style={{ backgroundColor: colors.accent }}
                >
                  {activeFilters.length}
                </span>
              )}
            </button>

            {/* Active Filters */}
            {activeFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={filter.onRemove}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors hover:opacity-80"
                style={{ backgroundColor: colors.accent + '15', color: colors.accent }}
              >
                {filter.label}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>

          {/* Right: Sort, View, Per Page */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Sort */}
            <div className="relative flex-1 md:flex-none">
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 border rounded-lg bg-transparent cursor-pointer focus:outline-none focus:ring-2 text-sm"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  borderColor: colors.muted + '40',
                }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ArrowUpDown
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: colors.muted }}
              />
            </div>

            {/* View Toggle */}
            <div
              className="hidden md:flex items-center border rounded-lg overflow-hidden"
              style={{ borderColor: colors.muted + '40' }}
            >
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? '' : 'opacity-50'}`}
                style={{
                  backgroundColor: viewMode === 'grid' ? colors.accent + '15' : 'transparent',
                  color: viewMode === 'grid' ? colors.accent : colors.muted,
                }}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? '' : 'opacity-50'}`}
                style={{
                  backgroundColor: viewMode === 'list' ? colors.accent + '15' : 'transparent',
                  color: viewMode === 'list' ? colors.accent : colors.muted,
                }}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Per Page */}
            <div className="hidden md:block relative">
              <select
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-2 border rounded-lg bg-transparent cursor-pointer focus:outline-none text-sm"
                style={{
                  backgroundColor: colors.cardBg,
                  color: colors.text,
                  borderColor: colors.muted + '40',
                }}
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                style={{ color: colors.muted }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1">
            {paginatedProducts.length > 0 ? (
              <>
                {/* Grid View */}
                {viewMode === 'grid' && (
                  <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {paginatedProducts.map((product) => {
                      const hasDiscount =
                        product.compareAtPrice && product.compareAtPrice > product.price;
                      const discountPercent = hasDiscount
                        ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
                        : 0;
                      const isWishlisted = wishlist.includes(product.id);

                      return (
                        <Link
                          key={product.id}
                          to={getLink(`/products/${product.id}`)}
                          className="group rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                          style={{ backgroundColor: colors.cardBg }}
                        >
                          <div className="relative aspect-[3/4] overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: colors.background, color: colors.muted }}
                              >
                                <Package className="w-12 h-12 opacity-30" />
                              </div>
                            )}

                            {/* Discount Badge */}
                            {hasDiscount && (
                              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                -{discountPercent}%
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => toggleWishlist(e, product.id)}
                                className="w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-colors"
                                style={{
                                  backgroundColor: isWishlisted ? '#fef2f2' : colors.cardBg,
                                  color: isWishlisted ? '#ef4444' : colors.muted,
                                }}
                              >
                                <Heart
                                  className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                                />
                              </button>
                            </div>

                            {/* Quick Add Overlay */}
                            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => handleQuickAdd(e, product)}
                                className="w-full py-2.5 rounded-lg font-medium shadow-lg flex items-center justify-center gap-2 text-white transition-transform hover:scale-[1.02]"
                                style={{ backgroundColor: colors.primary }}
                              >
                                <ShoppingCart className="w-4 h-4" />
                                Add to Cart
                              </button>
                            </div>
                          </div>

                          <div className="p-4">
                            <h3
                              className="font-medium text-sm line-clamp-2 mb-2 group-hover:opacity-70 transition-opacity"
                              style={{ color: colors.text }}
                            >
                              {product.title}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="font-bold" style={{ color: colors.accent }}>
                                {formatPrice(product.price, currency)}
                              </span>
                              {hasDiscount && (
                                <span
                                  className="text-sm line-through"
                                  style={{ color: colors.muted }}
                                >
                                  {formatPrice(product.compareAtPrice!, currency)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                  <div className="space-y-4">
                    {paginatedProducts.map((product) => {
                      const hasDiscount =
                        product.compareAtPrice && product.compareAtPrice > product.price;
                      const discountPercent = hasDiscount
                        ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
                        : 0;
                      const isWishlisted = wishlist.includes(product.id);

                      return (
                        <Link
                          key={product.id}
                          to={getLink(`/products/${product.id}`)}
                          className="flex gap-4 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                          style={{ backgroundColor: colors.cardBg }}
                        >
                          <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div
                                className="w-full h-full flex items-center justify-center"
                                style={{ backgroundColor: colors.background }}
                              >
                                <Package className="w-8 h-8 opacity-30" />
                              </div>
                            )}
                            {hasDiscount && (
                              <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                -{discountPercent}%
                              </div>
                            )}
                          </div>

                          <div className="flex-1 flex flex-col justify-between">
                            <div>
                              <h3
                                className="font-medium mb-2 line-clamp-2"
                                style={{ color: colors.text }}
                              >
                                {product.title}
                              </h3>
                              {product.category && (
                                <p className="text-sm mb-2" style={{ color: colors.muted }}>
                                  {product.category}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="text-lg font-bold"
                                  style={{ color: colors.accent }}
                                >
                                  {formatPrice(product.price, currency)}
                                </span>
                                {hasDiscount && (
                                  <span
                                    className="text-sm line-through"
                                    style={{ color: colors.muted }}
                                  >
                                    {formatPrice(product.compareAtPrice!, currency)}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => toggleWishlist(e, product.id)}
                                  className="p-2 rounded-lg border transition-colors"
                                  style={{
                                    borderColor: isWishlisted ? '#ef4444' : colors.muted + '40',
                                    color: isWishlisted ? '#ef4444' : colors.muted,
                                    backgroundColor: isWishlisted ? '#fef2f2' : 'transparent',
                                  }}
                                >
                                  <Heart
                                    className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`}
                                  />
                                </button>
                                <button
                                  onClick={(e) => handleQuickAdd(e, product)}
                                  className="px-4 py-2 rounded-lg font-medium text-white flex items-center gap-2"
                                  style={{ backgroundColor: colors.primary }}
                                >
                                  <ShoppingCart className="w-4 h-4" />
                                  Add
                                </button>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {/* Load More / Pagination */}
                {filteredProducts.length > perPage && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={() => setPerPage((prev) => prev + 24)}
                      disabled={isLoading}
                      className="px-8 py-3 rounded-xl font-medium border transition-colors hover:opacity-80 flex items-center gap-2"
                      style={{ borderColor: colors.muted + '40', color: colors.text }}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More Products
                          <span className="text-sm" style={{ color: colors.muted }}>
                            ({filteredProducts.length - perPage} remaining)
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div
                className="text-center py-20 rounded-xl"
                style={{ backgroundColor: colors.cardBg }}
              >
                <Package
                  className="w-16 h-16 mx-auto mb-4 opacity-20"
                  style={{ color: colors.text }}
                />
                <h2 className="text-xl font-medium mb-2" style={{ color: colors.text }}>
                  No products found
                </h2>
                <p className="mb-6" style={{ color: colors.muted }}>
                  Try adjusting your filters or browse another category.
                </p>
                <div className="flex justify-center gap-3">
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="px-6 py-2 rounded-lg font-medium border transition-opacity hover:opacity-80"
                      style={{ borderColor: colors.muted + '40', color: colors.text }}
                    >
                      Clear Filters
                    </button>
                  )}
                  <Link
                    to={getLink('/collections/all-products')}
                    className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: colors.primary }}
                  >
                    View All Products
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowFilters(false)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-80 max-w-full overflow-y-auto"
            style={{ backgroundColor: colors.cardBg }}
          >
            <div
              className="p-4 border-b flex items-center justify-between"
              style={{ borderColor: colors.muted + '20' }}
            >
              <h2 className="font-bold text-lg" style={{ color: colors.text }}>
                Filters
              </h2>
              <button onClick={() => setShowFilters(false)} style={{ color: colors.muted }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar />
            </div>
            <div className="p-4 border-t" style={{ borderColor: colors.muted + '20' }}>
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-3 rounded-xl font-medium text-white"
                style={{ backgroundColor: colors.primary }}
              >
                Apply Filters ({filteredProducts.length} products)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
