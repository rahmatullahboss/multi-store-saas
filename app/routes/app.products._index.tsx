/**
 * Products List Page - Shopify-Inspired Design
 * 
 * Route: /app/products
 * 
 * Features:
 * - Stats header (Total, Published, Low Stock)
 * - Search and status filter tabs
 * - Image thumbnail, Name, Price, Stock, Category, Status
 * - Bulk actions (delete, publish, unpublish)
 * - Responsive table/card design
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useNavigation, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, inArray, sql, and, like, count } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Plus, Package, ImageOff, Trash2, Eye, EyeOff, Loader2, Pencil, 
  AlertTriangle, CheckCircle, Archive, Rocket, Check, Copy, Star
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Products - Ozzyl' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info for currency
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // Fetch products for this store
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt))
    .limit(200);

  // Calculate stats
  const totalProducts = storeProducts.length;
  const publishedCount = storeProducts.filter(p => p.isPublished).length;
  const draftCount = storeProducts.filter(p => !p.isPublished).length;
  const lowStockCount = storeProducts.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= 5).length;
  const outOfStockCount = storeProducts.filter(p => (p.inventory || 0) <= 0).length;

  // Check product limit for the plan
  const { checkUsageLimit } = await import('~/utils/plans.server');
  const limitCheck = await checkUsageLimit(context.cloudflare.env.DB, storeId, 'product');

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
    // Store info for campaign links
    storeSubdomain: store.subdomain,
    storeCustomDomain: store.customDomain || null,
    // Featured product for Primary Product badge
    featuredProductId: store.featuredProductId || null,
    storeMode: store.mode || 'landing',
    stats: {
      total: totalProducts,
      published: publishedCount,
      draft: draftCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    },
    // Product limit info
    canAddProduct: limitCheck.allowed,
    productLimitMessage: limitCheck.error?.message || null,
  });
}

// ============================================================================
// ACTION - Bulk operations
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const productIds = formData.getAll('productIds').map(id => parseInt(id as string));

  if (productIds.length === 0) {
    return json({ error: 'No products selected' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  switch (intent) {
    case 'delete':
      await db.delete(products).where(inArray(products.id, productIds));
      return json({ success: true, message: `${productIds.length} product(s) deleted` });

    case 'publish':
      await db.update(products).set({ isPublished: true }).where(inArray(products.id, productIds));
      return json({ success: true, message: `${productIds.length} product(s) published` });

    case 'unpublish':
      await db.update(products).set({ isPublished: false }).where(inArray(products.id, productIds));
      return json({ success: true, message: `${productIds.length} product(s) unpublished` });

    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

export default function ProductsIndexPage() {
  const { products: storeProducts, currency, stats, storeSubdomain, storeCustomDomain, featuredProductId, storeMode, canAddProduct, productLimitMessage } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  // Filter state from URL
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Ad Link copy state - shows checkmark briefly after copy
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null);
  
  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('allOrders'), count: stats.total },
    { id: 'published', label: t('publishedStatus'), count: stats.published },
    { id: 'draft', label: t('draftStatus'), count: stats.draft },
    { id: 'low-stock', label: t('lowStock'), count: stats.lowStock },
    { id: 'out-of-stock', label: t('outOfStockLabel'), count: stats.outOfStock },
  ];

  // Filter products based on status and search
  const filteredProducts = useMemo(() => {
    let filtered = [...storeProducts];

    // Apply status filter
    switch (statusFilter) {
      case 'published':
        filtered = filtered.filter(p => p.isPublished);
        break;
      case 'draft':
        filtered = filtered.filter(p => !p.isPublished);
        break;
      case 'low-stock':
        filtered = filtered.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter(p => (p.inventory || 0) <= 0);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [storeProducts, statusFilter, searchQuery]);

  const handleStatusChange = useCallback((tabId: string) => {
    setSearchParams(prev => {
      if (tabId === 'all') {
        prev.delete('status');
      } else {
        prev.set('status', tabId);
      }
      return prev;
    });
    setSelectedIds(new Set());
  }, [setSearchParams]);
  
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };
  
  const clearSelection = () => setSelectedIds(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Generate offer URL for a product
  const getOfferUrl = (productId: number) => {
    const domain = storeCustomDomain || `${storeSubdomain}.ozzyl.com`;
    return `https://${domain}/offers/${productId}`;
  };

  // Copy Ad Link to clipboard
  const copyAdLink = async (productId: number) => {
    const url = getOfferUrl(productId);
    await navigator.clipboard.writeText(url);
    setCopiedProductId(productId);
    setTimeout(() => setCopiedProductId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Product Limit Warning */}
      {!canAddProduct && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-800 font-medium">
              {t('productLimitReached')}
            </p>
            <p className="text-amber-700 text-sm mt-1">
              {productLimitMessage || t('productLimitDesc')}
            </p>
            <Link 
              to="/app/billing" 
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2"
            >
              {t('upgradePlan')} →
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={t('products')}
        description={t('manageProductCatalog')}
        primaryAction={canAddProduct ? {
          label: t('addProduct'),
          href: '/app/products/new',
          icon: <Plus className="w-4 h-4" />,
        } : undefined}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('totalProducts')}
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label={t('publishedStatus')}
          value={stats.published}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label={t('draftStatus')}
          value={stats.draft}
          icon={<Archive className="w-5 h-5" />}
          color="gray"
        />
        <StatCard
          label={t('lowStock')}
          value={stats.lowStock + stats.outOfStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats.lowStock + stats.outOfStock > 0 ? 'red' : 'gray'}
          href="/app/inventory?filter=low"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          placeholder={t('searchByProductHint') || t('searchByOrderNumber')}
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full md:w-80"
        />
        
        {/* Status Tabs */}
        <div className="flex-1">
          <StatusTabs
            tabs={statusTabs}
            activeTab={statusFilter}
            onChange={handleStatusChange}
          />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-emerald-800 font-medium">
            {selectedIds.size} {t('productsSelected')}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Form method="post" className="inline">
              {Array.from(selectedIds).map(id => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Eye className="w-4 h-4" /> {t('publish')}
              </button>
            </Form>
            <Form method="post" className="inline">
              {Array.from(selectedIds).map(id => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="unpublish"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <EyeOff className="w-4 h-4" /> {t('unpublish')}
              </button>
            </Form>
            <Form method="post" className="inline" onSubmit={(e) => {
              if (!confirm(`Delete ${selectedIds.size} product(s)? This cannot be undone.`)) {
                e.preventDefault();
              }
            }}>
              {Array.from(selectedIds).map(id => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="delete"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 className="w-4 h-4" /> {t('delete')}
              </button>
            </Form>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title={t('noProductsFound')}
            description={t('clearSearch')}
            action={canAddProduct ? {
              label: t('addNewProduct'),
              href: '/app/products/new',
              icon: <Plus className="w-4 h-4" />,
            } : undefined}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{lang === 'bn' ? 'কোনো প্রোডাক্ট আপনার ফিল্টারের সাথে মিলছে না।' : 'No products match your filters.'}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {lang === 'bn' ? 'ফিল্টার সাফ করুন' : 'Clear filters'}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('sales7d')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className={`hover:bg-gray-50 transition ${selectedIds.has(product.id) ? 'bg-emerald-50' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.title}
                            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageOff className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/app/products/${product.id}`}
                              className="font-medium text-gray-900 hover:text-emerald-600 transition truncate block"
                            >
                              {product.title}
                            </Link>
                            {featuredProductId === product.id && (
                              <span 
                                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full"
                                title="This is your featured product in Landing Mode"
                              >
                                <Star className="w-3 h-3 fill-amber-400" />
                                Primary
                              </span>
                            )}
                          </div>
                          {product.sku && (
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{formatPrice(product.price)}</p>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <p className="text-xs text-gray-500 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StockBadge stock={product.inventory || 0} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{product.category || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge published={product.isPublished ?? true} />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Ad Link Button */}
                        <button
                          type="button"
                          onClick={() => copyAdLink(product.id)}
                          disabled={!product.isPublished}
                          title={product.isPublished ? 'Copy Ad Link for Facebook Ads' : 'Publish product to get Ad Link'}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                            copiedProductId === product.id
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : product.isPublished
                                ? 'text-violet-600 hover:text-white hover:bg-violet-600 border border-violet-200 hover:border-violet-600'
                                : 'text-gray-400 border border-gray-200 cursor-not-allowed'
                          }`}
                        >
                          {copiedProductId === product.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              {t('adLinkCopied')}
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4" />
                              Ad Link
                            </>
                          )}
                        </button>
                        {/* Edit Button */}
                        <Link
                          to={`/app/products/${product.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredProducts.map((product) => (
              <div key={product.id} className={`p-4 ${selectedIds.has(product.id) ? 'bg-emerald-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(product.id)}
                    onChange={() => toggleSelect(product.id)}
                    className="mt-1 w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageOff className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Link to={`/app/products/${product.id}`} className="font-medium text-gray-900 truncate hover:text-emerald-600">
                          {product.title}
                        </Link>
                        {featuredProductId === product.id && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full flex-shrink-0">
                            <Star className="w-3 h-3 fill-amber-400" />
                          </span>
                        )}
                      </div>
                      <StatusBadge published={product.isPublished ?? true} />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      <StockBadge stock={product.inventory || 0} />
                    </div>
                    {product.category && (
                      <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {/* Ad Link Button - Mobile */}
                      <button
                        type="button"
                        onClick={() => copyAdLink(product.id)}
                        disabled={!product.isPublished}
                        title={product.isPublished ? 'Copy Ad Link for Facebook Ads' : 'Publish product first'}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition ${
                          copiedProductId === product.id
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : product.isPublished
                              ? 'text-violet-600 hover:bg-violet-50 border border-violet-200'
                              : 'text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {copiedProductId === product.id ? (
                          <>
                            <Check className="w-4 h-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4" />
                            Ad Link
                          </>
                        )}
                      </button>
                      {/* Edit Button - Mobile */}
                      <Link
                        to={`/app/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ published, lang }: { published: boolean; lang: string }) {
  const label = published 
    ? (lang === 'bn' ? 'প্রকাশিত' : 'Published') 
    : (lang === 'bn' ? 'ড্রাফট' : 'Draft');
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full
        ${published 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'bg-gray-100 text-gray-600'
        }
      `}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}

// ============================================================================
// STOCK BADGE COMPONENT
// ============================================================================
function StockBadge({ stock, lang }: { stock: number; lang: string }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full" suppressHydrationWarning>
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        {lang === 'bn' ? 'স্টক নেই' : 'Out of stock'}
      </span>
    );
  }
  
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full" suppressHydrationWarning>
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        {lang === 'bn' ? `${stock}টি বাকি` : `${stock} left`}
      </span>
    );
  }
  
  return (
    <span className="font-medium text-gray-900">{stock}</span>
  );
}
