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
  AlertTriangle, CheckCircle, Archive
} from 'lucide-react';
import { useState, useMemo, useCallback } from 'react';
import { PageHeader, SearchInput, StatusTabs, EmptyState, StatCard } from '~/components/ui';

export const meta: MetaFunction = () => {
  return [{ title: 'Products - Multi-Store SaaS' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
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

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
    stats: {
      total: totalProducts,
      published: publishedCount,
      draft: draftCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
    },
  });
}

// ============================================================================
// ACTION - Bulk operations
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
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
  const { products: storeProducts, currency, stats } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const isSubmitting = navigation.state === 'submitting';
  
  // Filter state from URL
  const statusFilter = searchParams.get('status') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Status tabs configuration
  const statusTabs = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'published', label: 'Published', count: stats.published },
    { id: 'draft', label: 'Draft', count: stats.draft },
    { id: 'low-stock', label: 'Low Stock', count: stats.lowStock },
    { id: 'out-of-stock', label: 'Out of Stock', count: stats.outOfStock },
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
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        primaryAction={{
          label: 'Add Product',
          href: '/app/products/new',
          icon: <Plus className="w-4 h-4" />,
        }}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Published"
          value={stats.published}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Draft"
          value={stats.draft}
          icon={<Archive className="w-5 h-5" />}
          color="gray"
        />
        <StatCard
          label="Low Stock"
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
          placeholder="Search by name, SKU, or category..."
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
            {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
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
                <Eye className="w-4 h-4" /> Publish
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
                <EyeOff className="w-4 h-4" /> Unpublish
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
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </Form>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products List */}
      {storeProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <EmptyState
            icon={<Package className="w-10 h-10" />}
            title="No products yet"
            description="Get started by adding your first product to your store."
            action={{
              label: 'Add Your First Product',
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
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
                          <Link
                            to={`/app/products/${product.id}`}
                            className="font-medium text-gray-900 hover:text-emerald-600 transition truncate block"
                          >
                            {product.title}
                          </Link>
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
                      <Link
                        to={`/app/products/${product.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                      >
                        <Pencil className="w-4 h-4" />
                        Edit
                      </Link>
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
                      <Link to={`/app/products/${product.id}`} className="font-medium text-gray-900 truncate hover:text-emerald-600">
                        {product.title}
                      </Link>
                      <StatusBadge published={product.isPublished ?? true} />
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-sm">
                      <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      <StockBadge stock={product.inventory || 0} />
                    </div>
                    {product.category && (
                      <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                    )}
                    <Link
                      to={`/app/products/${product.id}`}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 hover:text-white hover:bg-emerald-600 border border-emerald-200 hover:border-emerald-600 rounded-lg transition"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </Link>
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
function StatusBadge({ published }: { published: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full
        ${published 
          ? 'bg-emerald-100 text-emerald-700' 
          : 'bg-gray-100 text-gray-600'
        }
      `}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}

// ============================================================================
// STOCK BADGE COMPONENT
// ============================================================================
function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        Out of stock
      </span>
    );
  }
  
  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
        {stock} left
      </span>
    );
  }
  
  return (
    <span className="font-medium text-gray-900">{stock}</span>
  );
}
