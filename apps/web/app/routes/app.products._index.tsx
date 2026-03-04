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
import { eq, desc, inArray, and, or } from 'drizzle-orm';
import {
  products,
  stores,
  orderItems,
  savedLandingConfigs,
  publishedPages,
  productVariants,
  productCollections,
  reviews,
  orderBumps,
  upsellOffers,
  productRecommendations,
} from '@db/schema';
import { builderPages } from '@db/schema_page_builder';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  Plus,
  Package,
  ImageOff,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  AlertTriangle,
  CheckCircle,
  Archive,
  Rocket,
  Check,
  Star,
  Search,
  Edit,
} from 'lucide-react';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouteError, isRouteErrorResponse } from '@remix-run/react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';

export const meta: MetaFunction = () => {
  return [{ title: 'Products - Ozzyl' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'products',
  });

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info for currency
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

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
  const publishedCount = storeProducts.filter((p) => p.isPublished).length;
  const draftCount = storeProducts.filter((p) => !p.isPublished).length;
  const lowStockCount = storeProducts.filter(
    (p) => (p.inventory || 0) > 0 && (p.inventory || 0) <= 5
  ).length;
  const outOfStockCount = storeProducts.filter((p) => (p.inventory || 0) <= 0).length;
  const missingCostCount = storeProducts.filter((p) => p.costPrice === null).length;

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
      missingCost: missingCostCount,
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'products',
  });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const productIds = formData.getAll('productIds').map((id) => parseInt(id as string));

  if (productIds.length === 0) {
    return json({ error: 'No products selected' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const ownedProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));
  const ownedProductIds = ownedProducts.map((p) => p.id);

  if (ownedProductIds.length === 0) {
    return json({ error: 'No valid products selected for this store' }, { status: 403 });
  }

  switch (intent) {
    case 'delete':
      try {
        // First, set null on orderItems productId references (preserve order history)
        await db
          .update(orderItems)
          .set({ productId: null })
          .where(inArray(orderItems.productId, ownedProductIds));

        // Set null on savedLandingConfigs productId references
        await db
          .update(savedLandingConfigs)
          .set({ productId: null })
          .where(inArray(savedLandingConfigs.productId, ownedProductIds));

        // Set null on publishedPages productId references
        await db
          .update(publishedPages)
          .set({ productId: null })
          .where(inArray(publishedPages.productId, ownedProductIds));

        // Set null on builderPages productId references (new page builder)
        await db
          .update(builderPages)
          .set({ productId: null })
          .where(inArray(builderPages.productId, ownedProductIds));

        // Delete related records that have onDelete: 'cascade' defined
        // (These should cascade but we delete explicitly to be safe)
        await db.delete(productVariants).where(inArray(productVariants.productId, ownedProductIds));
        await db
          .delete(productCollections)
          .where(inArray(productCollections.productId, ownedProductIds));
        await db.delete(reviews).where(inArray(reviews.productId, ownedProductIds));

        // Delete orderBumps where productId OR bumpProductId matches
        await db
          .delete(orderBumps)
          .where(
            or(
              inArray(orderBumps.productId, ownedProductIds),
              inArray(orderBumps.bumpProductId, ownedProductIds)
            )
          );

        // Delete upsellOffers where productId OR offerProductId matches
        await db
          .delete(upsellOffers)
          .where(
            or(
              inArray(upsellOffers.productId, ownedProductIds),
              inArray(upsellOffers.offerProductId, ownedProductIds)
            )
          );

        // Delete productRecommendations where sourceProductId OR recommendedProductId matches
        await db
          .delete(productRecommendations)
          .where(
            or(
              inArray(productRecommendations.sourceProductId, ownedProductIds),
              inArray(productRecommendations.recommendedProductId, ownedProductIds)
            )
          );

        // Now delete the products
        await db
          .delete(products)
          .where(and(eq(products.storeId, storeId), inArray(products.id, ownedProductIds)));
        return json({ success: true, message: `${ownedProductIds.length} product(s) deleted` });
      } catch (error) {
        console.error('Delete error:', error);
        return json(
          {
            error: `Failed to delete products: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
          { status: 500 }
        );
      }

    case 'publish':
      await db
        .update(products)
        .set({ isPublished: true })
        .where(and(eq(products.storeId, storeId), inArray(products.id, ownedProductIds)));
      return json({ success: true, message: `${ownedProductIds.length} product(s) published` });

    case 'unpublish':
      await db
        .update(products)
        .set({ isPublished: false })
        .where(and(eq(products.storeId, storeId), inArray(products.id, ownedProductIds)));
      return json({ success: true, message: `${ownedProductIds.length} product(s) unpublished` });

    default:
      return json({ error: 'Invalid action' }, { status: 400 });
  }
}

export default function ProductsIndexPage() {
  const {
    products: storeProducts,
    stats,
    storeSubdomain,
    storeCustomDomain,
    featuredProductId,
    canAddProduct,
    productLimitMessage,
  } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();

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

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // Close modal and clear selection when form is submitting
  useEffect(() => {
    if (isSubmitting && showDeleteConfirm) {
      setShowDeleteConfirm(false);
      clearSelection();
    }
    // clearSelection is defined as a stable arrow function referencing setSelectedIds (a state setter),
    // so it is safe to include; eslint-plugin-react-hooks requires it.
  }, [isSubmitting, showDeleteConfirm, clearSelection]);

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('dashboard:allProducts'), count: stats.total },
    { id: 'published', label: t('dashboard:publishedStatus'), count: stats.published },
    { id: 'draft', label: t('dashboard:draftStatus'), count: stats.draft },
    { id: 'low-stock', label: t('dashboard:lowStock'), count: stats.lowStock },
    { id: 'out-of-stock', label: t('dashboard:outOfStockLabel'), count: stats.outOfStock },
    { id: 'missing-cost', label: 'Missing Cost', count: stats.missingCost },
  ];

  // Filter products based on status and search
  const filteredProducts = useMemo(() => {
    let filtered = [...storeProducts];

    // Apply status filter
    switch (statusFilter) {
      case 'published':
        filtered = filtered.filter((p) => p.isPublished);
        break;
      case 'draft':
        filtered = filtered.filter((p) => !p.isPublished);
        break;
      case 'low-stock':
        filtered = filtered.filter((p) => (p.inventory || 0) > 0 && (p.inventory || 0) <= 5);
        break;
      case 'out-of-stock':
        filtered = filtered.filter((p) => (p.inventory || 0) <= 0);
        break;
      case 'missing-cost':
        filtered = filtered.filter((p) => p.costPrice === null);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          (p.category && p.category.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [storeProducts, statusFilter, searchQuery]);

  const handleStatusChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        if (tabId === 'all') {
          prev.delete('status');
        } else {
          prev.set('status', tabId);
        }
        return prev;
      });
      setSelectedIds(new Set());
    },
    [setSearchParams]
  );

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
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
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  // Generate offer URL for a product
  const getOfferUrl = useCallback(
    (productId: number) => {
      const domain = storeCustomDomain || `${storeSubdomain}.ozzyl.com`;
      return `https://${domain}/offers/${productId}`;
    },
    [storeCustomDomain, storeSubdomain]
  );

  // Copy Ad Link to clipboard
  const copyAdLink = useCallback(
    async (productId: number) => {
      const url = getOfferUrl(productId);
      await navigator.clipboard.writeText(url);
      setCopiedProductId(productId);
      setTimeout(() => setCopiedProductId(null), 2000);
    },
    [getOfferUrl]
  );

  return (
    <>
      {/* ===== MOBILE VIEW (md:hidden) ===== */}
      <div className="md:hidden -m-4 bg-gray-50 min-h-screen flex flex-col">
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 bg-gray-50/95 backdrop-blur-md px-4 pt-6 pb-2">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t('dashboard:products')}</h1>
            {canAddProduct && (
              <Link
                to="/app/products/new"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
              </Link>
            )}
          </div>
          {/* Search */}
          <div className="flex gap-3 mb-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('dashboard:searchProductsSkuPlaceholder') || 'Search name, SKU...'}
                className="block w-full pl-10 pr-3 py-3 rounded-xl border-none bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-emerald-500 transition-all text-sm"
              />
            </div>
          </div>
        </header>

        {/* Status Tabs */}
        <div className="sticky top-[130px] z-10 bg-gray-50 py-2">
          <div className="flex gap-2 px-4 overflow-x-auto no-scrollbar pb-1">
            {['all', 'published', 'draft', 'out-of-stock', 'missing-cost'].map((tab) => (
              <button
                key={tab}
                onClick={() => handleStatusChange(tab)}
                className={`flex h-9 shrink-0 items-center px-4 rounded-full text-sm font-medium transition-all active:scale-95 ${
                  statusFilter === tab
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                    : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                }`}
              >
                {tab === 'all' ? (t('dashboard:all') || 'All')
                  : tab === 'published' ? (t('dashboard:publishedStatus') || 'Active')
                  : tab === 'draft' ? (t('dashboard:draftStatus') || 'Draft')
                  : tab === 'out-of-stock' ? (t('dashboard:outOfStockLabel') || 'Out of Stock')
                  : 'Missing Cost'}
              </button>
            ))}
          </div>
        </div>

        {/* Product List */}
        <div className="flex flex-col gap-3 px-4 pt-1 pb-6 flex-1">
          {/* Product Limit Warning */}
          {!canAddProduct && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-amber-800 text-sm font-medium">{t('dashboard:productLimitReached')}</p>
                <Link to="/app/billing" className="text-xs font-medium text-amber-700 hover:text-amber-900 mt-1 inline-block">
                  {t('dashboard:upgradePlan')} →
                </Link>
              </div>
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                {searchQuery ? t('dashboard:noProductsFound') : t('dashboard:noProductsYet')}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchQuery ? t('dashboard:tryDifferentSearch') : t('dashboard:addFirstProduct')}
              </p>
              {canAddProduct && !searchQuery && (
                <Link
                  to="/app/products/new"
                  className="inline-flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('dashboard:addProduct')}
                </Link>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const isOutOfStock = (product.inventory || 0) === 0;
              const isPublished = product.isPublished ?? true;
              const statusLabel = !isPublished ? 'draft' : isOutOfStock ? 'out' : 'active';
              const statusCls = !isPublished
                ? 'bg-gray-100 text-gray-500'
                : isOutOfStock
                ? 'bg-red-100 text-red-600'
                : 'bg-emerald-50 text-emerald-600';

              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-transparent hover:border-emerald-100 transition-all active:scale-[0.99]"
                >
                  {/* Product Image */}
                  <div className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-7 h-7 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <Link
                        to={`/app/products/${product.id}`}
                        className="text-base font-semibold text-gray-900 truncate pr-2 hover:text-emerald-600 transition-colors"
                      >
                        {product.title}
                      </Link>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shrink-0 ${statusCls}`}>
                        {statusLabel === 'draft' ? (t('dashboard:draft') || 'Draft')
                          : statusLabel === 'out' ? 'Out'
                          : (t('dashboard:active') || 'Active')}
                      </span>
                    </div>
                    <p className="text-emerald-600 font-bold text-sm">{formatPrice(product.price)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t('dashboard:stock') || 'Stock'}: <span className={`font-medium ${isOutOfStock ? 'text-red-500' : 'text-gray-800'}`}>{product.inventory || 0}</span>
                    </p>
                  </div>

                  {/* Edit Button */}
                  <Link
                    to={`/app/products/${product.id}`}
                    className="shrink-0 p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>
                </div>
              );
            })
          )}
        </div>

        {/* FAB */}
        {canAddProduct && (
          <Link
            to="/app/products/new"
            className="fixed bottom-20 right-4 z-30 flex items-center justify-center w-14 h-14 bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/40 text-white hover:bg-emerald-700 active:scale-95 transition-all"
          >
            <Plus className="w-7 h-7" />
          </Link>
        )}
      </div>

      {/* ===== DESKTOP VIEW (hidden on mobile) ===== */}
      <div className="hidden md:block space-y-6">
        {/* Product Limit Warning */}
        {!canAddProduct && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-amber-800 font-medium">{t('dashboard:productLimitReached')}</p>
              <p className="text-amber-700 text-sm mt-1">
                {productLimitMessage || t('dashboard:productLimitDesc')}
              </p>
              <Link to="/app/billing" className="inline-flex items-center gap-1 text-sm font-medium text-amber-800 hover:text-amber-900 mt-2">
                {t('dashboard:upgradePlan')} →
              </Link>
            </div>
          </div>
        )}

        <PageHeader
        title={t('dashboard:products')}
        description={t('dashboard:manageProductCatalog')}
        primaryAction={
          canAddProduct
            ? {
                label: t('dashboard:addProduct'),
                href: '/app/products/new',
                icon: <Plus className="w-4 h-4" />,
              }
            : undefined
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label={t('dashboard:totalProducts')}
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label={t('dashboard:publishedStatus')}
          value={stats.published}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label={t('dashboard:draftStatus')}
          value={stats.draft}
          icon={<Archive className="w-5 h-5" />}
          color="gray"
        />
        <StatCard
          label={t('dashboard:lowStock')}
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
          placeholder={t('dashboard:searchByProductHint')}
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full md:w-80"
        />

        {/* Status Tabs */}
        <div className="flex-1">
          <StatusTabs tabs={statusTabs} activeTab={statusFilter} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-emerald-800 font-medium">
            {selectedIds.size} {t('dashboard:productsSelected')}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Form method="post" className="inline">
              {Array.from(selectedIds).map((id) => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Eye className="w-4 h-4" /> {t('dashboard:publish')}
              </button>
            </Form>
            <Form method="post" className="inline">
              {Array.from(selectedIds).map((id) => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="unpublish"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <EyeOff className="w-4 h-4" /> {t('dashboard:unpublish')}
              </button>
            </Form>
            {/* Delete button - opens confirmation modal */}
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isSubmitting || !isHydrated}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> {t('dashboard:delete')}
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              {t('dashboard:cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <GlassCard intensity="low" className="overflow-hidden">
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title={t('dashboard:noProductsFound')}
            description={t('dashboard:clearSearch')}
            action={
              canAddProduct
                ? {
                    label: t('dashboard:addNewProduct'),
                    href: '/app/products/new',
                    icon: <Plus className="w-4 h-4" />,
                  }
                : undefined
            }
          />
        </GlassCard>
      ) : filteredProducts.length === 0 ? (
        <GlassCard intensity="low" className="p-12 text-center">
          <p className="text-gray-500">
            {t('dashboard:noProductsMatchFilters')}
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('dashboard:clearFilters')}
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
                      checked={
                        selectedIds.size === filteredProducts.length && filteredProducts.length > 0
                      }
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:product')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:stock')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:price')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Cost & Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:category')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:sales7d')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('dashboard:actions')}
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
                                {t('dashboard:primary')}
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
                      <StatusBadge published={product.isPublished ?? true} />
                    </td>
                    <td className="px-4 py-4">
                      <StockBadge stock={product.inventory || 0} />
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
                      <CostMarginDisplay price={product.price} costPrice={product.costPrice} />
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{product.category || '—'}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* Ad Link Button - Hidden */}
                        {/* Edit Button */}
                        <Link
                          to={`/app/products/${product.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                        >
                          <Pencil className="w-4 h-4" />
                          {t('dashboard:edit')}
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
              <div
                key={product.id}
                className={`p-4 ${selectedIds.has(product.id) ? 'bg-emerald-50' : ''}`}
              >
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
                        <Link
                          to={`/app/products/${product.id}`}
                          className="font-medium text-gray-900 truncate hover:text-emerald-600"
                        >
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
                      <span className="font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      <StockBadge stock={product.inventory || 0} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs">
                      <span className="text-gray-500">Cost:</span>
                      <MobileCostMarginDisplay price={product.price} costPrice={product.costPrice} />
                    </div>
                    {product.category && (
                      <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {/* Ad Link Button - Mobile - Hidden */}
                      {/* Edit Button - Mobile */}
                      <Link
                        to={`/app/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                        {t('dashboard:edit')}
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
              {t('dashboard:deleteProducts')}
            </h3>
            <p className="text-gray-600 mb-4">
              {t('dashboard:deleteProductsConfirm', { count: selectedIds.size })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                {t('dashboard:cancel')}
              </button>
              <Form method="post" className="inline">
                {Array.from(selectedIds).map((id) => (
                  <input key={id} type="hidden" name="productIds" value={id} />
                ))}
                <button
                  type="submit"
                  name="intent"
                  value="delete"
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  {t('dashboard:delete')}
                </button>
              </Form>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard intensity="high" className="p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('processing')}</span>
          </GlassCard>
        </div>
      )}
      </div>
    </>
  );
}

// ============================================================================
// STOCK BADGE COMPONENT
// ============================================================================
function StockBadge({ stock }: { stock: number }) {
  const cls = stock === 0
    ? 'bg-red-100 text-red-600'
    : stock < 5
    ? 'bg-amber-100 text-amber-600'
    : 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${cls}`}>
      {stock === 0 ? 'Out of stock' : `${stock} in stock`}
    </span>
  );
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================
function StatusBadge({ published }: { published: boolean }) {
  const { t } = useTranslation();
  // Use the same dashboard: namespace as the rest of the file
  const label = published ? t('dashboard:publishedStatus') : t('dashboard:draftStatus');
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full
        ${published ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}
      `}
      suppressHydrationWarning
    >
      {label}
    </span>
  );
}

// ============================================================================
// COST MARGIN DISPLAY COMPONENTS
// ============================================================================
function CostMarginDisplay({ price, costPrice }: { price: number; costPrice: number | null }) {
  if (costPrice === null) return <span className="text-gray-400">—</span>;
  
  const margin = price > 0 ? ((price - costPrice) / price) * 100 : 0;
  const isNegative = costPrice > price;
  
  return (
    <div className="flex flex-col items-start justify-center">
      <span className="font-semibold text-gray-900">{formatPrice(costPrice)}</span>
      {isNegative ? (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 border border-red-200 mt-0.5" title="Cost exceeds selling price">
          Negative Margin
        </span>
      ) : (
        <span className="text-xs text-emerald-600 font-medium mt-0.5">{margin.toFixed(1)}% margin</span>
      )}
    </div>
  );
}

function MobileCostMarginDisplay({ price, costPrice }: { price: number; costPrice: number | null }) {
  if (costPrice === null) return <span className="text-gray-400">—</span>;
  
  const margin = price > 0 ? ((price - costPrice) / price) * 100 : 0;
  const isNegative = costPrice > price;
  
  return (
    <div className="flex items-center gap-1">
      <span className="font-medium text-gray-900">{formatPrice(costPrice)}</span>
      {isNegative ? (
        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700">Loss</span>
      ) : (
        <span className="text-emerald-600 font-medium">({margin.toFixed(1)}%)</span>
      )}
    </div>
  );
}

// ============================================================================
// ERROR BOUNDARY
// ============================================================================
export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.data}`
    : error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-red-500" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load products</h2>
      <p className="text-gray-500 text-sm max-w-md mb-6">{message}</p>
      <a
        href="/app/products"
        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
      >
        Try again
      </a>
    </div>
  );
}
