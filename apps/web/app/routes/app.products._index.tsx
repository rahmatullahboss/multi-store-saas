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
import { useLoaderData, Link, Form, useNavigation, useSearchParams, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, inArray, sql, and, like, count, or } from 'drizzle-orm';
import { products, stores, orderItems, savedLandingConfigs, publishedPages, productVariants, productCollections, reviews, orderBumps, upsellOffers, productRecommendations } from '@db/schema';
import { builderPages } from '@db/schema_page_builder';
import { getStoreId } from '~/services/auth.server';
import { 
  Plus, Package, ImageOff, Trash2, Eye, EyeOff, Loader2, Pencil, 
  AlertTriangle, CheckCircle, Archive, Rocket, Check, Copy, Star
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
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
      try {
        // First, set null on orderItems productId references (preserve order history)
        await db.update(orderItems)
          .set({ productId: null })
          .where(inArray(orderItems.productId, productIds));
        
        // Set null on savedLandingConfigs productId references
        await db.update(savedLandingConfigs)
          .set({ productId: null })
          .where(inArray(savedLandingConfigs.productId, productIds));
        
        // Set null on publishedPages productId references
        await db.update(publishedPages)
          .set({ productId: null })
          .where(inArray(publishedPages.productId, productIds));
        
        // Set null on builderPages productId references (new page builder)
        await db.update(builderPages)
          .set({ productId: null })
          .where(inArray(builderPages.productId, productIds));
        
        // Delete related records that have onDelete: 'cascade' defined
        // (These should cascade but we delete explicitly to be safe)
        await db.delete(productVariants).where(inArray(productVariants.productId, productIds));
        await db.delete(productCollections).where(inArray(productCollections.productId, productIds));
        await db.delete(reviews).where(inArray(reviews.productId, productIds));
        
        // Delete orderBumps where productId OR bumpProductId matches
        await db.delete(orderBumps).where(
          or(
            inArray(orderBumps.productId, productIds),
            inArray(orderBumps.bumpProductId, productIds)
          )
        );
        
        // Delete upsellOffers where productId OR offerProductId matches
        await db.delete(upsellOffers).where(
          or(
            inArray(upsellOffers.productId, productIds),
            inArray(upsellOffers.offerProductId, productIds)
          )
        );
        
        // Delete productRecommendations where sourceProductId OR recommendedProductId matches
        await db.delete(productRecommendations).where(
          or(
            inArray(productRecommendations.sourceProductId, productIds),
            inArray(productRecommendations.recommendedProductId, productIds)
          )
        );
        
        // Now delete the products
        await db.delete(products).where(inArray(products.id, productIds));
        return json({ success: true, message: `${productIds.length} product(s) deleted` });
      } catch (error) {
        console.error('Delete error:', error);
        return json({ 
          error: `Failed to delete products: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 500 });
      }

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
  const { products: storeProducts, currency, stats, storeSubdomain, storeCustomDomain, featuredProductId, canAddProduct, productLimitMessage } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting' || fetcher.state === 'submitting';
  const { t, lang } = useTranslation();
  
  // Filter state from URL
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Ad Link copy state - shows checkmark briefly after copy
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null);
  
  // Hydration-safe pattern: ensures event handlers work correctly
  // This prevents React Hydration Error #418 from breaking click handlers
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Delete confirmation modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Price Update Modal state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [priceUpdateType, setPriceUpdateType] = useState<'fixed' | 'percent_increase' | 'percent_decrease'>('fixed');
  const [priceUpdateValue, setPriceUpdateValue] = useState<string>('');
  
  // Close modal and clear selection when form is submitting
  useEffect(() => {
    if (isSubmitting) {
      if (showDeleteConfirm) setShowDeleteConfirm(false);
      if (showPriceModal) setShowPriceModal(false);
      clearSelection();
    }
  }, [isSubmitting, showDeleteConfirm, showPriceModal]);

  const handleBulkAction = (action: 'activate' | 'deactivate') => {
    if (selectedIds.size === 0) return;

    fetcher.submit(
      {
        productIds: Array.from(selectedIds),
        action
      },
      { method: 'POST', action: '/api/products/bulk-update', encType: 'application/json' }
    );
  };

  const handleBulkPriceUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0 || !priceUpdateValue) return;

    fetcher.submit(
      {
        productIds: Array.from(selectedIds),
        action: 'update-price',
        priceUpdate: {
          type: priceUpdateType,
          value: parseFloat(priceUpdateValue)
        }
      },
      { method: 'POST', action: '/api/products/bulk-update', encType: 'application/json' }
    );
  };
  
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-2xl bg-white rounded-full px-6 py-3 border border-gray-200 flex flex-wrap items-center justify-center gap-4 transition-all duration-300 ease-in-out">
          <span className="text-emerald-800 font-medium whitespace-nowrap bg-emerald-50 px-3 py-1 rounded-full text-sm">
            {selectedIds.size} {lang === 'bn' ? 'প্রোডাক্ট নির্বাচিত' : 'products selected'}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleBulkAction('activate')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Eye className="w-4 h-4" /> {lang === 'bn' ? 'অ্যাক্টিভ করুন' : 'Set Active'}
            </button>
            <button
              type="button"
              onClick={() => handleBulkAction('deactivate')}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <EyeOff className="w-4 h-4" /> {lang === 'bn' ? 'ইনঅ্যাক্টিভ করুন' : 'Set Inactive'}
            </button>
            <button
              type="button"
              onClick={() => setShowPriceModal(true)}
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              <Pencil className="w-4 h-4" /> {lang === 'bn' ? 'মূল্য আপডেট করুন...' : 'Update Price...'}
            </button>

            {/* Delete button - opens confirmation modal */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || !isHydrated}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
              title="Delete selected"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Cancel button */}
            <button
              onClick={clearSelection}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition"
            >
              ✕ {t('cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <GlassCard intensity="low" className="overflow-hidden">
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
        </GlassCard>
      ) : filteredProducts.length === 0 ? (
        <GlassCard intensity="low" className="p-12 text-center">
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
        </GlassCard>
      ) : (
        <GlassCard intensity="low" className="p-0 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
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
                      <StockBadge stock={product.inventory || 0} lang={lang} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{product.category || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge published={product.isPublished ?? true} lang={lang} />
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
                      <StatusBadge published={product.isPublished ?? true} lang={lang} />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      <StockBadge stock={product.inventory || 0} lang={lang} />
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
        </GlassCard>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard intensity="high" className="p-6 shadow-xl max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {lang === 'bn' ? 'প্রোডাক্ট ডিলিট করুন?' : 'Delete Products?'}
            </h3>
            <p className="text-gray-600 mb-4">
              {lang === 'bn' 
                ? `${selectedIds.size}টি প্রোডাক্ট ডিলিট হবে। এটি পূর্বাবস্থায় ফেরানো যাবে না।`
                : `${selectedIds.size} product(s) will be deleted. This cannot be undone.`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                {t('cancel')}
              </button>
              <Form method="post" className="inline">
                {Array.from(selectedIds).map(id => (
                  <input key={id} type="hidden" name="productIds" value={id} />
                ))}
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {t('delete')}
                </button>
              </Form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Price Update Modal */}
      {showPriceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard intensity="high" className="p-6 shadow-xl max-w-md mx-4 w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {lang === 'bn' ? 'মূল্য আপডেট করুন' : 'Update Price'}
            </h3>
            <form onSubmit={handleBulkPriceUpdate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'bn' ? 'আপডেটের ধরন' : 'Update Type'}
                  </label>
                  <select
                    value={priceUpdateType}
                    onChange={(e) => setPriceUpdateType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  >
                    <option value="fixed">{lang === 'bn' ? 'নির্দিষ্ট মূল্য সেট করুন' : 'Set fixed price'}</option>
                    <option value="percent_increase">{lang === 'bn' ? 'শতাংশ বৃদ্ধি করুন (%)' : 'Increase by percentage (%)'}</option>
                    <option value="percent_decrease">{lang === 'bn' ? 'শতাংশ কমান (%)' : 'Decrease by percentage (%)'}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {lang === 'bn' ? 'মূল্য / শতাংশ' : 'Value'}
                  </label>
                  <div className="relative">
                    {priceUpdateType === 'fixed' && (
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        {currency}
                      </span>
                    )}
                    <input
                      type="number"
                      required
                      min="0"
                      step={priceUpdateType === 'fixed' ? '1' : '0.1'}
                      value={priceUpdateValue}
                      onChange={(e) => setPriceUpdateValue(e.target.value)}
                      placeholder={priceUpdateType === 'fixed' ? '0.00' : '10'}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm ${
                        priceUpdateType === 'fixed' ? 'pl-10' : ''
                      }`}
                    />
                    {priceUpdateType !== 'fixed' && (
                      <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500">
                        %
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !priceUpdateValue}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  {lang === 'bn' ? 'আপডেট করুন' : 'Update'}
                </button>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard intensity="high" className="p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Processing...</span>
          </GlassCard>
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
