/**
 * Inventory Management Dashboard - Shopify-Inspired Design
 *
 * Route: /app/inventory
 *
 * Features:
 * - Visual stock bars with progress indicators
 * - Quick +/- stock adjustment buttons
 * - Low stock alerts with configurable threshold
 * - Search and filtering
 * - CSV import/export
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import {
  useLoaderData,
  Form,
  useNavigation,
  Link,
  useSearchParams,
  useActionData,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { activityLogs, products, stores, users } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import {
  AlertTriangle,
  Package,
  Download,
  Upload,
  Minus,
  Plus,
  Loader2,
  CheckCircle,
  ImageOff,
} from 'lucide-react';
import { useEffect, useMemo, useCallback, useState } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { GlassCard } from '~/components/ui/GlassCard';
import { useTranslation } from '~/contexts/LanguageContext';
import { formatPrice } from '~/utils/formatPrice';
import { LowStockAlertBanner } from '~/components/LowStockAlertBanner';
import { logActivity } from '~/lib/activity.server';

export const meta: MetaFunction = () => {
  return [{ title: 'Inventory' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];
  const lowStockThreshold = store?.lowStockThreshold ?? 10;

  // Fetch all products
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));

  // Calculate stats
  const stats = {
    total: storeProducts.length,
    lowStock: storeProducts.filter(
      (p) => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold
    ).length,
    outOfStock: storeProducts.filter((p) => (p.inventory || 0) <= 0).length,
    healthy: storeProducts.filter((p) => (p.inventory || 0) > lowStockThreshold).length,
    totalUnits: storeProducts.reduce((sum, p) => sum + (p.inventory || 0), 0),
  };

  const recentStockChanges = await db
    .select({
      id: activityLogs.id,
      userId: activityLogs.userId,
      entityId: activityLogs.entityId,
      details: activityLogs.details,
      createdAt: activityLogs.createdAt,
      userName: users.name,
      userEmail: users.email,
    })
    .from(activityLogs)
    .leftJoin(users, eq(users.id, activityLogs.userId))
    .where(and(eq(activityLogs.storeId, storeId), eq(activityLogs.action, 'stock_change')))
    .orderBy(desc(activityLogs.createdAt))
    .limit(10);

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
    stats,
    lowStockThreshold,
    recentStockChanges,
  });
}

// ============================================================================
// ACTION - Update stock levels
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);
  const userId = await getUserId(request, context.cloudflare.env);
  const ipAddress = request.headers.get('CF-Connecting-IP') || undefined;

  if (intent === 'adjustStock') {
    const productId = parseInt(formData.get('productId') as string);
    const adjustment = parseInt(formData.get('adjustment') as string);

    if (isNaN(productId) || isNaN(adjustment)) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get current stock
    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
      .limit(1);
    if (!product[0]) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    const newStock = Math.max(0, (product[0].inventory || 0) + adjustment);

    await db
      .update(products)
      .set({ inventory: newStock, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    await logActivity(db, {
      storeId,
      userId,
      action: 'stock_change',
      entityType: 'product',
      entityId: productId,
      details: {
        source: 'inventory_adjust',
        productTitle: product[0].title,
        before: product[0].inventory || 0,
        after: newStock,
        delta: newStock - (product[0].inventory || 0),
      },
      ipAddress,
    });

    return json({
      success: true,
      message: 'Stock updated',
      newStock,
      undoItems: [
        { productId, previousStock: product[0].inventory || 0, productTitle: product[0].title },
      ],
    });
  }

  if (intent === 'setStock') {
    const productId = parseInt(formData.get('productId') as string);
    const newStock = parseInt(formData.get('stock') as string);

    if (isNaN(productId) || isNaN(newStock) || newStock < 0) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    const product = await db
      .select()
      .from(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
      .limit(1);
    if (!product[0]) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    await db
      .update(products)
      .set({ inventory: newStock, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    await logActivity(db, {
      storeId,
      userId,
      action: 'stock_change',
      entityType: 'product',
      entityId: productId,
      details: {
        source: 'inventory_set',
        productTitle: product[0].title,
        before: product[0].inventory || 0,
        after: newStock,
        delta: newStock - (product[0].inventory || 0),
      },
      ipAddress,
    });

    return json({
      success: true,
      message: 'Stock updated',
      undoItems: [
        { productId, previousStock: product[0].inventory || 0, productTitle: product[0].title },
      ],
    });
  }

  if (intent === 'bulkAdjustStock') {
    const rawIds = formData.get('productIds') as string;
    const adjustment = parseInt(formData.get('adjustment') as string);
    if (!rawIds || isNaN(adjustment) || adjustment === 0) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    let productIds: number[] = [];
    try {
      productIds = JSON.parse(rawIds) as number[];
    } catch {
      return json({ error: 'Invalid product list' }, { status: 400 });
    }

    productIds = productIds.map((id) => Number(id)).filter((id) => Number.isFinite(id));

    if (!productIds.length) {
      return json({ error: 'No products selected' }, { status: 400 });
    }

    const productsToUpdate = await db
      .select({ id: products.id, inventory: products.inventory, title: products.title })
      .from(products)
      .where(and(eq(products.storeId, storeId), inArray(products.id, productIds)));

    if (!productsToUpdate.length) {
      return json({ error: 'No valid products found' }, { status: 404 });
    }

    const now = new Date();
    const updateQueries = productsToUpdate.map((product) => {
        const currentStock = product.inventory || 0;
        const newStock = Math.max(0, currentStock + adjustment);
        return db
          .update(products)
          .set({ inventory: newStock, updatedAt: now })
          .where(and(eq(products.id, product.id), eq(products.storeId, storeId)));
      });
    // Drizzle's D1 batch typing expects a non-empty tuple; we already guard length at runtime.
    await db.batch(updateQueries as any);

    await Promise.all(
      productsToUpdate.map((product) => {
        const currentStock = product.inventory || 0;
        const newStock = Math.max(0, currentStock + adjustment);
        return logActivity(db, {
          storeId,
          userId,
          action: 'stock_change',
          entityType: 'product',
          entityId: product.id,
          details: {
            source: 'inventory_bulk_adjust',
            productTitle: product.title,
            before: currentStock,
            after: newStock,
            delta: newStock - currentStock,
          },
          ipAddress,
        });
      })
    );

    return json({
      success: true,
      message: 'Stock updated',
      undoItems: productsToUpdate.map((product) => ({
        productId: product.id,
        previousStock: product.inventory || 0,
        productTitle: product.title,
      })),
    });
  }

  if (intent === 'undoStock') {
    const rawItems = formData.get('items') as string;
    if (!rawItems) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    let items: Array<{ productId: number; previousStock: number; productTitle?: string }> = [];
    try {
      items = JSON.parse(rawItems) as Array<{
        productId: number;
        previousStock: number;
        productTitle?: string;
      }>;
    } catch {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    const normalizedItems = items
      .map((item) => ({
        productId: Number(item.productId),
        previousStock: Number(item.previousStock),
        productTitle: item.productTitle,
      }))
      .filter(
        (item) =>
          Number.isFinite(item.productId) &&
          Number.isFinite(item.previousStock) &&
          item.productId > 0
      );

    if (!normalizedItems.length) {
      return json({ error: 'No items to undo' }, { status: 400 });
    }

    const now = new Date();
    const undoQueries = normalizedItems.map((item) =>
      db
        .update(products)
        .set({ inventory: Math.max(0, item.previousStock), updatedAt: now })
        .where(and(eq(products.id, item.productId), eq(products.storeId, storeId)))
    );
    // Drizzle's D1 batch typing expects a non-empty tuple; we already guard length at runtime.
    await db.batch(undoQueries as any);

    await Promise.all(
      normalizedItems.map((item) =>
        logActivity(db, {
          storeId,
          userId,
          action: 'stock_change',
          entityType: 'product',
          entityId: item.productId,
          details: {
            source: 'inventory_undo',
            productTitle: item.productTitle,
            after: Math.max(0, item.previousStock),
          },
          ipAddress,
        })
      )
    );

    return json({ success: true, message: 'Stock restored' });
  }

  if (intent === 'setLowStockThreshold') {
    const threshold = parseInt(formData.get('threshold') as string);
    if (isNaN(threshold) || threshold < 0) {
      return json({ error: 'Invalid threshold' }, { status: 400 });
    }

    await db
      .update(stores)
      .set({ lowStockThreshold: threshold, updatedAt: new Date() })
      .where(eq(stores.id, storeId));

    await logActivity(db, {
      storeId,
      userId,
      action: 'settings_updated',
      entityType: 'settings',
      details: { source: 'inventory_threshold', threshold },
      ipAddress,
    });

    return json({ success: true, message: 'Threshold updated' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function InventoryPage() {
  const {
    products: storeProducts,
    currency,
    stats,
    lowStockThreshold,
    recentStockChanges,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  // Filter state
  const statusFilter = searchParams.get('filter') || 'all';
  const initialSearch = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [thresholdValue, setThresholdValue] = useState(String(lowStockThreshold));
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkAdjustment, setBulkAdjustment] = useState('1');
  const [undoItems, setUndoItems] = useState<
    Array<{ productId: number; previousStock: number; productTitle?: string }>
  >([]);

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('allProducts'), count: stats.total },
    { id: 'healthy', label: t('inStock'), count: stats.healthy },
    { id: 'low', label: t('lowStock'), count: stats.lowStock },
    { id: 'out', label: t('outOfStockLabel'), count: stats.outOfStock },
  ];

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...storeProducts];

    // Apply status filter
    switch (statusFilter) {
      case 'healthy':
        filtered = filtered.filter((p) => (p.inventory || 0) > lowStockThreshold);
        break;
      case 'low':
        filtered = filtered.filter(
          (p) => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold
        );
        break;
      case 'out':
        filtered = filtered.filter((p) => (p.inventory || 0) <= 0);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) || (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [storeProducts, statusFilter, searchQuery, lowStockThreshold]);

  useEffect(() => {
    setThresholdValue(String(lowStockThreshold));
  }, [lowStockThreshold]);

  useEffect(() => {
    // Action payload varies by intent; safely narrow before reading optional fields.
    const data = actionData as unknown;
    if (!data || typeof data !== 'object') return;
    const maybe = data as { undoItems?: unknown; success?: unknown };
    if (Array.isArray(maybe.undoItems) && maybe.undoItems.length) {
      setUndoItems(maybe.undoItems as any);
      return;
    }
    if (maybe.success === true) {
      setUndoItems([]);
    }
  }, [actionData]);

  useEffect(() => {
    const currentQuery = searchParams.get('q') || '';
    if (currentQuery !== searchQuery) {
      setSearchQuery(currentQuery);
    }
  }, [searchParams, searchQuery]);

  useEffect(() => {
    setSelectedIds((prev) => {
      if (!prev.size) return prev;
      const visibleIds = new Set(filteredProducts.map((p) => p.id));
      const next = new Set<number>();
      prev.forEach((id) => {
        if (visibleIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredProducts]);

  const handleStatusChange = useCallback(
    (tabId: string) => {
      setSearchParams((prev) => {
        if (tabId === 'all') {
          prev.delete('filter');
        } else {
          prev.set('filter', tabId);
        }
        return prev;
      });
    },
    [setSearchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setSearchParams((prev) => {
        if (value) {
          prev.set('q', value);
        } else {
          prev.delete('q');
        }
        return prev;
      });
    },
    [setSearchParams]
  );

  const getStockLevel = (stock: number) => {
    if (stock <= 0) return 0;
    if (stock <= lowStockThreshold) return 25;
    if (stock <= 50) return 50;
    return Math.min(100, stock);
  };

  const getStockColor = (stock: number) => {
    if (stock <= 0) return 'bg-red-500';
    if (stock <= lowStockThreshold) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const allVisibleSelected =
    filteredProducts.length > 0 && filteredProducts.every((p) => selectedIds.has(p.id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      if (allVisibleSelected) {
        return new Set();
      }
      return new Set(filteredProducts.map((p) => p.id));
    });
  };

  const toggleSelectOne = (productId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const productTitleMap = useMemo(() => {
    return new Map(storeProducts.map((p) => [p.id, p.title]));
  }, [storeProducts]);

  const parsedStockChanges = useMemo(() => {
    type StockChangeDetails = {
      productTitle?: string;
      delta?: number;
      before?: number;
      after?: number;
      source?: string;
    };

    return recentStockChanges.map((log) => {
      let details: StockChangeDetails | null = null;
      if (log.details) {
        try {
          details = JSON.parse(log.details) as StockChangeDetails;
        } catch {
          details = null;
        }
      }

      const productTitleFromDetails =
        typeof details?.productTitle === 'string' ? details.productTitle : null;

      return {
        ...log,
        details,
        title:
          productTitleFromDetails ||
          (log.entityId ? productTitleMap.get(log.entityId) : null) ||
          t('inventoryUnknownProduct'),
      };
    });
  }, [recentStockChanges, productTitleMap, t]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return '—';
    return new Date(date).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('inventory')}
        description={t('inventoryManageDesc')}
        secondaryAction={{
          label: t('importCsv'),
          href: '/app/inventory/import',
          icon: <Upload className="w-4 h-4" />,
        }}
        primaryAction={{
          label: t('exportCsv'),
          href: '/api/products/export',
          icon: <Download className="w-4 h-4" />,
        }}
      />

      {undoItems.length > 0 && (
        <GlassCard intensity="low" className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="font-medium text-gray-900">{t('stockUpdated')}</p>
            <p className="text-sm text-gray-600">
              {t('undoHint', { count: undoItems.length })}
            </p>
          </div>
          <Form method="post">
            <input type="hidden" name="intent" value="undoStock" />
            <input type="hidden" name="items" value={JSON.stringify(undoItems)} />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-800 font-medium hover:bg-gray-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {t('inventoryUndo')}
            </button>
          </Form>
        </GlassCard>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label={t('totalProducts')}
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label={t('totalUnits')}
          value={stats.totalUnits.toLocaleString()}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label={t('inStock')}
          value={stats.healthy}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label={t('lowStock')}
          value={stats.lowStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats.lowStock > 0 ? 'yellow' : 'gray'}
        />
        <StatCard
          label={t('outOfStockLabel')}
          value={stats.outOfStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats.outOfStock > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Low Stock Alert */}
      <LowStockAlertBanner
        count={stats.lowStock}
        threshold={lowStockThreshold}
        onAction={statusFilter === 'all' ? () => handleStatusChange('low') : undefined}
      />

      {/* Low Stock Threshold */}
      <GlassCard intensity="low" className="p-4">
        <Form method="post" className="flex flex-col md:flex-row md:items-center gap-4">
          <input type="hidden" name="intent" value="setLowStockThreshold" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">{t('lowStockThresholdLabel')}</p>
            <p className="text-sm text-gray-500">{t('lowStockThresholdHelp')}</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              name="threshold"
              min="0"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value)}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              autoComplete="off"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              {t('updateThreshold')}
            </button>
          </div>
        </Form>
      </GlassCard>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          placeholder={t('searchInventoryPlaceholder')}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full md:w-80"
        />

        {/* Status Tabs */}
        <div className="flex-1">
          <StatusTabs tabs={statusTabs} activeTab={statusFilter} onChange={handleStatusChange} />
        </div>
      </div>

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <GlassCard intensity="low" className="overflow-hidden">
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title={t('noProductsTitle')}
            description={t('noProductsDesc')}
            action={{
              label: t('addProduct'),
              href: '/app/products/new',
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        </GlassCard>
      ) : filteredProducts.length === 0 ? (
        <GlassCard intensity="low" className="p-12 text-center">
          <p className="text-gray-500">{t('noProductsMatchFilters')}</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {t('clearFilters')}
          </button>
        </GlassCard>
      ) : (
        <GlassCard intensity="low" className="p-0 overflow-hidden">
          {selectedIds.size > 0 && (
            <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium text-gray-900">{t('bulkActions')}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                  {t('selectedCount', { count: selectedIds.size })}
                </span>
              </div>
              <Form method="post" className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="intent" value="bulkAdjustStock" />
                <input
                  type="hidden"
                  name="productIds"
                  value={JSON.stringify(Array.from(selectedIds))}
                />
                <input
                  type="number"
                  name="adjustment"
                  value={bulkAdjustment}
                  onChange={(e) => setBulkAdjustment(e.target.value)}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  autoComplete="off"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || parseInt(bulkAdjustment || '0', 10) === 0}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                >
                  {t('inventoryApply')}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="px-3 py-2 text-gray-600 hover:text-gray-900 transition"
                >
                  {t('clearSelection')}
                </button>
              </Form>
            </div>
          )}
          {/* ===== MOBILE CARD VIEW ===== */}
          <div className="md:hidden divide-y divide-gray-100">
            {filteredProducts.map((product) => {
              const stock = product.inventory || 0;
              const stockLevel = getStockLevel(stock);
              const stockColor = getStockColor(stock);
              return (
                <div key={product.id} className="px-4 py-3.5 flex items-center gap-3">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.title} className="w-12 h-12 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ImageOff className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link to={`/app/products/${product.id}`} className="font-medium text-gray-900 text-sm truncate block hover:text-emerald-600">
                      {product.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${stockColor} transition-all duration-300`} style={{ width: `${stockLevel}%` }} />
                      </div>
                      <StockStatusBadge stock={stock} threshold={lowStockThreshold} />
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="font-bold text-gray-900 text-sm tabular-nums">{stock}</span>
                    <div className="flex gap-1">
                      <Form method="post">
                        <input type="hidden" name="intent" value="adjustStock" />
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="adjustment" value="-1" />
                        <button type="submit" disabled={isSubmitting || stock <= 0} aria-label={t('decreaseStock')} className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 active:bg-gray-200">
                          <Minus className="w-4 h-4" />
                        </button>
                      </Form>
                      <Form method="post">
                        <input type="hidden" name="intent" value="adjustStock" />
                        <input type="hidden" name="productId" value={product.id} />
                        <input type="hidden" name="adjustment" value="1" />
                        <button type="submit" disabled={isSubmitting} aria-label={t('increaseStock')} className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg disabled:opacity-50 active:bg-emerald-200">
                          <Plus className="w-4 h-4" />
                        </button>
                      </Form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ===== DESKTOP TABLE VIEW ===== */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-10">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      aria-label={t('selectAll')}
                      className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('productTableHeader')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('skuTableHeader')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('priceTableHeader')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                    {t('stockLevelTableHeader')}
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {t('adjustTableHeader')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const stock = product.inventory || 0;
                  const stockLevel = getStockLevel(stock);
                  const stockColor = getStockColor(stock);
                  const isEditing = editingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                          aria-label={t('inventorySelectProduct', { name: product.title })}
                          className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              width={48}
                              height={48}
                              loading="lazy"
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageOff className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              to={`/app/products/${product.id}`}
                              className="font-medium text-gray-900 hover:text-emerald-600 transition truncate block"
                            >
                              {product.title}
                            </Link>
                            {product.category && (
                              <p className="text-xs text-gray-500">{product.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-mono text-sm tabular-nums">
                        {product.sku || '—'}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900 tabular-nums">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-4">
                        {isEditing ? (
                          <Form method="post" className="flex items-center gap-2">
                            <input type="hidden" name="intent" value="setStock" />
                            <input type="hidden" name="productId" value={product.id} />
                            <input
                              type="number"
                              name="stock"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              min="0"
                              className="w-20 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-center"
                              autoComplete="off"
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              {t('saveBtn')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              {t('cancel')}
                            </button>
                          </Form>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <button
                                onClick={() => {
                                  setEditingId(product.id);
                                  setEditValue(stock.toString());
                                }}
                                className="font-bold text-lg hover:text-emerald-600 transition tabular-nums"
                              >
                                {stock}{' '}
                                <span className="text-xs text-gray-500 font-normal">
                                  {t('unitsLabel')}
                                </span>
                              </button>
                              <StockStatusBadge stock={stock} threshold={lowStockThreshold} />
                            </div>
                            {/* Visual stock bar */}
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${stockColor} transition-all duration-300`}
                                style={{ width: `${stockLevel}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <Form method="post">
                            <input type="hidden" name="intent" value="adjustStock" />
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="adjustment" value="-1" />
                            <button
                              type="submit"
                              disabled={isSubmitting || stock <= 0}
                              aria-label={t('decreaseStock')}
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </Form>
                          <Form method="post">
                            <input type="hidden" name="intent" value="adjustStock" />
                            <input type="hidden" name="productId" value={product.id} />
                            <input type="hidden" name="adjustment" value="1" />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              aria-label={t('increaseStock')}
                              className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </Form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Recent Stock Changes */}
      <GlassCard intensity="low" className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{t('stockHistoryTitle')}</h3>
            <p className="text-sm text-gray-500">{t('stockHistoryDesc')}</p>
          </div>
          <Link to="/app/settings/activity" className="text-sm text-emerald-600 hover:text-emerald-700">
            {t('inventoryViewAll')}
          </Link>
        </div>
        <div className="mt-4 space-y-3">
          {parsedStockChanges.length === 0 ? (
            <p className="text-sm text-gray-500">{t('noStockChanges')}</p>
          ) : (
            parsedStockChanges.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{log.title}</p>
                  <p className="text-xs text-gray-500">
                    {log.userName || log.userEmail || t('inventorySystemUser')} • {formatDate(log.createdAt)}
                  </p>
                </div>
                <div className="text-sm font-semibold tabular-nums text-gray-700">
                  {typeof log.details?.delta === 'number' && (
                    <span className={log.details.delta >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                      {log.details.delta >= 0 ? '+' : ''}
                      {log.details.delta}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </GlassCard>

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <GlassCard intensity="high" className="p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>{t('updating')}</span>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STOCK STATUS BADGE COMPONENT
// ============================================================================
function StockStatusBadge({ stock, threshold }: { stock: number; threshold: number }) {
  const { t } = useTranslation();
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        {t('outOfStockLabel')}
      </span>
    );
  }

  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        {t('lowStock')}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
      {t('inStock')}
    </span>
  );
}
