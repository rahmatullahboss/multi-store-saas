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
import { useLoaderData, Form, useNavigation, Link, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, and } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  AlertTriangle, 
  Package, 
  Download, 
  Upload, 
  Minus,
  Plus,
  Loader2,
  CheckCircle,
  ImageOff
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Inventory - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const lowStockThreshold = 10;

  // Fetch all products
  const storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));

  // Calculate stats
  const stats = {
    total: storeProducts.length,
    lowStock: storeProducts.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold).length,
    outOfStock: storeProducts.filter(p => (p.inventory || 0) <= 0).length,
    healthy: storeProducts.filter(p => (p.inventory || 0) > lowStockThreshold).length,
    totalUnits: storeProducts.reduce((sum, p) => sum + (p.inventory || 0), 0),
  };

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
    stats,
    lowStockThreshold,
  });
}

// ============================================================================
// ACTION - Update stock levels
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  if (intent === 'adjustStock') {
    const productId = parseInt(formData.get('productId') as string);
    const adjustment = parseInt(formData.get('adjustment') as string);

    if (isNaN(productId) || isNaN(adjustment)) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    // Get current stock
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product[0]) {
      return json({ error: 'Product not found' }, { status: 404 });
    }

    const newStock = Math.max(0, (product[0].inventory || 0) + adjustment);

    await db.update(products)
      .set({ inventory: newStock, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    return json({ success: true, message: 'Stock updated', newStock });
  }

  if (intent === 'setStock') {
    const productId = parseInt(formData.get('productId') as string);
    const newStock = parseInt(formData.get('stock') as string);

    if (isNaN(productId) || isNaN(newStock) || newStock < 0) {
      return json({ error: 'Invalid data' }, { status: 400 });
    }

    await db.update(products)
      .set({ inventory: newStock, updatedAt: new Date() })
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    return json({ success: true, message: 'Stock updated' });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function InventoryPage() {
  const { products: storeProducts, currency, stats, lowStockThreshold } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  // Filter state
  const statusFilter = searchParams.get('filter') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: t('allOrders'), count: stats.total },
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
        filtered = filtered.filter(p => (p.inventory || 0) > lowStockThreshold);
        break;
      case 'low':
        filtered = filtered.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold);
        break;
      case 'out':
        filtered = filtered.filter(p => (p.inventory || 0) <= 0);
        break;
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(query) ||
        (p.sku && p.sku.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [storeProducts, statusFilter, searchQuery, lowStockThreshold]);

  const handleStatusChange = useCallback((tabId: string) => {
    setSearchParams(prev => {
      if (tabId === 'all') {
        prev.delete('filter');
      } else {
        prev.set('filter', tabId);
      }
      return prev;
    });
  }, [setSearchParams]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t('inventory')}
        description={lang === 'bn' ? 'স্টক লেভেল ম্যানেজ করুন এবং ইনভেন্টরি ট্র্যাক করুন' : 'Manage stock levels and track inventory'}
        secondaryAction={{
          label: lang === 'bn' ? 'CSV ইম্পোর্ট' : 'Import CSV',
          href: '/app/inventory/import',
          icon: <Upload className="w-4 h-4" />,
        }}
        primaryAction={{
          label: lang === 'bn' ? 'CSV এক্সপোর্ট' : 'Export CSV',
          href: '/api/products/export',
          icon: <Download className="w-4 h-4" />,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Products"
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Total Units"
          value={stats.totalUnits.toLocaleString()}
          icon={<Package className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="In Stock"
          value={stats.healthy}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats.lowStock > 0 ? 'yellow' : 'gray'}
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color={stats.outOfStock > 0 ? 'red' : 'gray'}
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && statusFilter === 'all' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-yellow-800">
                {stats.lowStock} product{stats.lowStock > 1 ? 's' : ''} running low on stock
              </p>
              <p className="text-sm text-yellow-600">
                Stock level is at or below {lowStockThreshold} units
              </p>
            </div>
          </div>
          <button
            onClick={() => handleStatusChange('low')}
            className="px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg hover:bg-yellow-200 transition"
          >
            View Low Stock
          </button>
        </div>
      )}

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <SearchInput
          placeholder="Search by name or SKU..."
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

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title="No products yet"
            description="Add products to start tracking inventory."
            action={{
              label: 'Add Product',
              href: '/app/products/new',
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No products match your filters.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              handleStatusChange('all');
            }}
            className="mt-3 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                    Stock Level
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Adjust
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
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
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
                      <td className="px-4 py-4 text-gray-600 font-mono text-sm">
                        {product.sku || '—'}
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
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
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="px-3 py-1.5 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition"
                            >
                              Cancel
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
                                className="font-bold text-lg hover:text-emerald-600 transition"
                              >
                                {stock} <span className="text-xs text-gray-500 font-normal">units</span>
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
                              className="w-8 h-8 flex items-center justify-center bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                              className="w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 disabled:opacity-50 transition"
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
        </div>
      )}

      {/* Loading overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            <span>Updating...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STOCK STATUS BADGE COMPONENT
// ============================================================================
function StockStatusBadge({ stock, threshold }: { stock: number; threshold: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        Out of stock
      </span>
    );
  }
  
  if (stock <= threshold) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        Low stock
      </span>
    );
  }
  
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
      In stock
    </span>
  );
}
