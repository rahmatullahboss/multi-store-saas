/**
 * Products Listing Page (Storefront)
 * 
 * Public-facing products catalog page for customers.
 * Uses StorePageWrapper for consistent template styling.
 * Supports category filtering via URL params.
 */

import { json, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/cloudflare';
import { useLoaderData, Link, useSearchParams } from '@remix-run/react';
import { eq, and, desc, asc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { resolveStore } from '~/lib/store.server';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { getStoreConfig } from '~/services/store-config.server';
import { products, stores } from '@db/schema';
import { parseThemeConfig, parseSocialLinks, parseFooterConfig, type ThemeConfig, type SocialLinks, type FooterConfig } from '@db/types';
import { StorePageWrapper } from '~/components/store-layouts/StorePageWrapper';
import { getStoreTemplateTheme, DEFAULT_STORE_TEMPLATE_ID } from '~/templates/store-registry';
import { ShoppingBag, Filter, ChevronRight, Grid, List } from 'lucide-react';
import { useState } from 'react';
import { getCustomer } from '~/services/customer-auth.server';

// Serialized product type for client components
interface SerializedProduct {
  id: number;
  storeId: number;
  title: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  images: string | null;
  category: string | null;
  inventory: number | null;
  sku: string | null;
  isPublished: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.storeName) {
    return [{ title: 'Products' }];
  }
  
  const title = data.currentCategory 
    ? `${data.currentCategory} - ${data.storeName}`
    : `All Products - ${data.storeName}`;
  
  return [
    { title },
    { name: 'description', content: `Shop all products at ${data.storeName}` },
  ];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  // Resolve store (handles both production and development mode)
  const storeContext = await resolveStore(context, request);
  
  if (!storeContext) {
    throw new Response('Store not found. Please check your store configuration.', { status: 404 });
  }
  
  const { storeId, store } = storeContext;
  const db = createDb(context.cloudflare.env.DB);
  const cache = new D1Cache(db);
  
  // Use cached store configuration
  const storeConfig = await getStoreConfig(db, cache, storeId);
  
  if (!storeConfig) {
    throw new Response('Store configuration not found', { status: 404 });
  }

  const { themeConfig, businessInfo, footerConfig } = storeConfig;
  const storeTemplateId = themeConfig?.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const theme = getStoreTemplateTheme(storeTemplateId);
  const socialLinks = storeConfig.socialLinks ? storeConfig.socialLinks : parseSocialLinks(store.socialLinks as string | null);
  
  // Get category filter from URL
  const url = new URL(request.url);
  const category = url.searchParams.get('category');
  const sortBy = url.searchParams.get('sort') || 'newest';
  
  // Load customer session for Google Sign-In header
  const customer = await getCustomer(request, context.cloudflare.env, db);
  
  // Determine sort order
  const orderByClause = sortBy === 'price-low' 
    ? asc(products.price)
    : sortBy === 'price-high'
      ? desc(products.price)
      : desc(products.createdAt);
  
  // Fetch products with optional category filter and sorting
  const allProducts = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true),
        category ? eq(products.category, category) : undefined
      )
    )
    .orderBy(orderByClause)
    .limit(100);
  
  // Get all unique categories
  const categoriesResult = await db
    .select({ category: products.category })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)));
  
  const categories = [...new Set(categoriesResult.map(p => p.category).filter((c): c is string => Boolean(c)))];
  
  return json({
    products: allProducts,
    storeName: store?.name || 'Store',
    logo: store.logo || null,
    currency: store?.currency || 'BDT',
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    footerConfig,
    categories,
    currentCategory: category,
    sortBy,
    planType: store?.planType || 'free',
    customer: customer ? { id: customer.id, name: customer.name, email: customer.email } : null,
  });
}

export default function ProductsIndex() {
  const { 
    products,
    storeName,
    logo,
    currency,
    storeId,
    storeTemplateId,
    theme,
    socialLinks,
    businessInfo,
    themeConfig,
    footerConfig,
    categories,
    currentCategory,
    sortBy,
    planType,
    customer
  } = useLoaderData<typeof loader>();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const isDarkTheme = storeTemplateId === 'modern-premium' || storeTemplateId === 'tech-modern';
  
  // Theme-aware styles
  const bgColor = isDarkTheme ? 'bg-gray-900' : 'bg-gray-50';
  const textPrimary = isDarkTheme ? 'text-white' : 'text-gray-900';
  const textMuted = isDarkTheme ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDarkTheme ? 'bg-gray-800' : 'bg-white';
  const borderColor = isDarkTheme ? 'border-gray-700' : 'border-gray-200';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };
  
  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    setSearchParams(params);
  };
  
  const handleCategoryChange = (cat: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (cat) {
      params.set('category', cat);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  return (
    <StorePageWrapper
      storeName={storeName}
      storeId={storeId}
      logo={logo}
      templateId={storeTemplateId}
      theme={theme}
      currency={currency}
      socialLinks={socialLinks}
      businessInfo={businessInfo}
      cartCount={0}
      categories={categories}
      config={themeConfig}
      footerConfig={footerConfig}
      planType={planType}
      customer={customer}
    >
      <div className={`min-h-screen ${bgColor}`}>
        {/* Breadcrumb */}
        <nav className={`border-b ${borderColor} ${cardBg}`}>
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link to="/" className={`${textMuted} hover:${theme.primary ? `text-[${theme.primary}]` : 'text-emerald-500'} transition`}>Home</Link>
              <ChevronRight className={`w-4 h-4 ${textMuted}`} />
              <span className={textPrimary}>Products</span>
              {currentCategory && (
                <>
                  <ChevronRight className={`w-4 h-4 ${textMuted}`} />
                  <span className={textPrimary}>{currentCategory}</span>
                </>
              )}
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-2xl md:text-3xl font-bold ${textPrimary}`}>
                {currentCategory || 'All Products'}
              </h1>
              <p className={`mt-1 ${textMuted}`}>
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className={`flex rounded-lg border ${borderColor} overflow-hidden`}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? `${cardBg} ${textPrimary}` : textMuted}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? `${cardBg} ${textPrimary}` : textMuted}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className={`px-3 py-2 rounded-lg border ${borderColor} ${cardBg} ${textPrimary} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Sidebar - Categories */}
            {categories.length > 0 && (
              <aside className="hidden md:block w-64 shrink-0">
                <div className={`${cardBg} rounded-xl p-4 border ${borderColor} sticky top-4`}>
                  <h2 className={`font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Filter className="w-4 h-4" />
                    Categories
                  </h2>
                  <ul className="space-y-1">
                    <li>
                      <button
                        onClick={() => handleCategoryChange(null)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition ${
                          !currentCategory 
                            ? 'bg-emerald-500 text-white' 
                            : `${textMuted} hover:${cardBg}`
                        }`}
                      >
                        All Products
                      </button>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => handleCategoryChange(cat)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition ${
                            currentCategory === cat 
                              ? 'bg-emerald-500 text-white' 
                              : `${textMuted} hover:${cardBg}`
                          }`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}

            {/* Products Grid/List */}
            <div className="flex-1">
              {/* Mobile Category Filter */}
              {categories.length > 0 && (
                <div className="md:hidden mb-4 overflow-x-auto">
                  <div className="flex gap-2 pb-2">
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                        !currentCategory 
                          ? 'bg-emerald-500 text-white' 
                          : `${cardBg} ${textMuted} border ${borderColor}`
                      }`}
                    >
                      All
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                          currentCategory === cat 
                            ? 'bg-emerald-500 text-white' 
                            : `${cardBg} ${textMuted} border ${borderColor}`
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {products.length === 0 ? (
                <div className={`text-center py-16 ${cardBg} rounded-xl border ${borderColor}`}>
                  <ShoppingBag className={`w-16 h-16 mx-auto ${textMuted} mb-4`} />
                  <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>No products found</h3>
                  <p className={textMuted}>
                    {currentCategory 
                      ? `No products in "${currentCategory}" category.`
                      : 'This store has no products yet.'
                    }
                  </p>
                  {currentCategory && (
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className="mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                    >
                      View All Products
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      currency={currency}
                      theme={theme}
                      isDark={isDarkTheme}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product) => (
                    <ProductListItem 
                      key={product.id} 
                      product={product} 
                      currency={currency}
                      theme={theme}
                      isDark={isDarkTheme}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StorePageWrapper>
  );
}

// Product Card Component (Grid View)
function ProductCard({ 
  product, 
  currency,
  theme,
  isDark 
}: { 
  product: SerializedProduct; 
  currency: string;
  theme: any;
  isDark: boolean;
}) {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };
  
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group ${cardBg} rounded-xl overflow-hidden border ${borderColor} hover:shadow-lg transition-all duration-300`}
    >
      {/* Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className={`w-12 h-12 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}
        
        {/* Discount Badge */}
        {discount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        
        {/* Out of Stock */}
        {(!product.inventory || product.inventory <= 0) && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-3 md:p-4">
        {product.category && (
          <span className={`text-xs ${textMuted} uppercase tracking-wide`}>
            {product.category}
          </span>
        )}
        <h3 className={`font-medium ${textPrimary} mt-1 line-clamp-2 group-hover:text-emerald-500 transition`}>
          {product.title}
        </h3>
        <div className="mt-2 flex items-center gap-2">
          <span className={`font-bold ${textPrimary}`} style={{ color: theme.primary }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={`text-sm ${textMuted} line-through`}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Product List Item Component (List View)
function ProductListItem({ 
  product, 
  currency,
  theme,
  isDark 
}: { 
  product: SerializedProduct; 
  currency: string;
  theme: any;
  isDark: boolean;
}) {
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white';
  const textPrimary = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200';
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };
  
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group flex gap-4 ${cardBg} rounded-xl overflow-hidden border ${borderColor} hover:shadow-lg transition-all duration-300 p-4`}
    >
      {/* Image */}
      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className={`w-8 h-8 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
          </div>
        )}
        
        {discount && (
          <div className="absolute top-1 left-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            -{discount}%
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        {product.category && (
          <span className={`text-xs ${textMuted} uppercase tracking-wide`}>
            {product.category}
          </span>
        )}
        <h3 className={`font-medium ${textPrimary} mt-1 group-hover:text-emerald-500 transition line-clamp-1`}>
          {product.title}
        </h3>
        {product.description && (
          <p className={`text-sm ${textMuted} mt-1 line-clamp-2`}>
            {product.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2">
          <span className={`font-bold ${textPrimary}`} style={{ color: theme.primary }}>
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className={`text-sm ${textMuted} line-through`}>
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
        
        {/* Stock Status */}
        <div className="mt-2">
          {product.inventory && product.inventory > 0 ? (
            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
