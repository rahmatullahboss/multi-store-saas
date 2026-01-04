/**
 * Inventory Management Dashboard
 * 
 * Route: /app/inventory
 * 
 * Features:
 * - Low stock alerts with configurable threshold
 * - Quick inline stock editing
 * - Bulk stock updates
 * - CSV export functionality
 * - Stock level filtering
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Form, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, lte, and } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  AlertTriangle, 
  Package, 
  Download, 
  Upload, 
  Edit2, 
  Save,
  X,
  Filter,
  Search,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { useState } from 'react';

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
  const url = new URL(request.url);
  const filter = url.searchParams.get('filter') || 'all';
  const search = url.searchParams.get('search') || '';

  // Fetch store info
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const lowStockThreshold = 10; // Default threshold

  // Fetch all products
  let storeProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId))
    .orderBy(desc(products.createdAt));

  // Apply search filter
  if (search) {
    storeProducts = storeProducts.filter(p => 
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }

  // Apply stock filter
  if (filter === 'low') {
    storeProducts = storeProducts.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold);
  } else if (filter === 'out') {
    storeProducts = storeProducts.filter(p => (p.inventory || 0) <= 0);
  }

  // Calculate stats
  const allProducts = await db
    .select()
    .from(products)
    .where(eq(products.storeId, storeId));

  const stats = {
    total: allProducts.length,
    lowStock: allProducts.filter(p => (p.inventory || 0) > 0 && (p.inventory || 0) <= lowStockThreshold).length,
    outOfStock: allProducts.filter(p => (p.inventory || 0) <= 0).length,
    healthy: allProducts.filter(p => (p.inventory || 0) > lowStockThreshold).length,
  };

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
    stats,
    lowStockThreshold,
    filter,
    search,
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

  if (intent === 'updateStock') {
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

  if (intent === 'bulkUpdateStock') {
    const updates = formData.getAll('updates');
    for (const update of updates) {
      const [productId, stock] = (update as string).split(':');
      await db.update(products)
        .set({ inventory: parseInt(stock), updatedAt: new Date() })
        .where(and(eq(products.id, parseInt(productId)), eq(products.storeId, storeId)));
    }
    return json({ success: true, message: `${updates.length} products updated` });
  }

  return json({ error: 'Invalid action' }, { status: 400 });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function InventoryPage() {
  const { products: storeProducts, currency, stats, lowStockThreshold, filter, search } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (id: number, currentStock: number) => {
    setEditingId(id);
    setEditValue(currentStock.toString());
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock <= 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-700 border-red-200' };
    if (stock <= lowStockThreshold) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    return { label: 'In Stock', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-600">Manage stock levels and track inventory</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/app/inventory/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </Link>
          <a
            href="/api/products/export"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </a>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Products"
          value={stats.total}
          icon={<Package className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Healthy Stock"
          value={stats.healthy}
          icon={<CheckCircle className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard
          label="Low Stock"
          value={stats.lowStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="yellow"
          href="?filter=low"
        />
        <StatCard
          label="Out of Stock"
          value={stats.outOfStock}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="red"
          href="?filter=out"
        />
      </div>

      {/* Low Stock Alert */}
      {stats.lowStock > 0 && filter === 'all' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-800">
              <strong>{stats.lowStock}</strong> product{stats.lowStock > 1 ? 's' : ''} running low on stock (≤{lowStockThreshold} units)
            </span>
          </div>
          <Link
            to="?filter=low"
            className="text-yellow-700 font-medium hover:text-yellow-800 underline"
          >
            View All
          </Link>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Form method="get" className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by name or SKU..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              name="filter"
              defaultValue={filter}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="all">All Products</option>
              <option value="low">Low Stock Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
            >
              Apply
            </button>
          </div>
        </Form>
      </div>

      {/* Products Table */}
      {storeProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500 mb-6">
            {filter !== 'all' ? 'No products match the current filter.' : 'Add products to start tracking inventory.'}
          </p>
          {filter !== 'all' && (
            <Link
              to="/app/inventory"
              className="text-emerald-600 font-medium hover:underline"
            >
              Clear Filters
            </Link>
          )}
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storeProducts.map((product) => {
                  const stockStatus = getStockStatus(product.inventory || 0);
                  const isEditing = editingId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.title}
                              className="w-10 h-10 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                          <Link
                            to={`/app/products/${product.id}`}
                            className="font-medium text-gray-900 hover:text-emerald-600"
                          >
                            {product.title}
                          </Link>
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
                            <input type="hidden" name="intent" value="updateStock" />
                            <input type="hidden" name="productId" value={product.id} />
                            <input
                              type="number"
                              name="stock"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              min="0"
                              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-emerald-500"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={isSubmitting}
                              className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </Form>
                        ) : (
                          <span className={`font-semibold ${
                            (product.inventory || 0) <= 0 ? 'text-red-600' : 
                            (product.inventory || 0) <= lowStockThreshold ? 'text-yellow-600' : 
                            'text-gray-900'
                          }`}>
                            {product.inventory ?? 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {!isEditing && (
                          <button
                            onClick={() => startEdit(product.id, product.inventory || 0)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit Stock
                          </button>
                        )}
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
// STAT CARD COMPONENT
// ============================================================================
function StatCard({ 
  label, 
  value, 
  icon, 
  color, 
  href 
}: { 
  label: string; 
  value: number; 
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'yellow' | 'red';
  href?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  const content = (
    <div className={`p-4 rounded-xl border ${colorClasses[color]} ${href ? 'hover:opacity-80 transition cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium opacity-80">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  
  return content;
}
