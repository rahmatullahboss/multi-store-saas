/**
 * Products List Page
 * 
 * Route: /app/products
 * 
 * Features:
 * - Image thumbnail, Name, Price, Stock, Category, Status
 * - Add Product button
 * - Bulk actions (delete, publish, unpublish)
 * - Responsive table/card design
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData, Link, Form, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, desc, inArray } from 'drizzle-orm';
import { products, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Plus, Package, ImageOff, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
    .limit(100);

  return json({
    products: storeProducts,
    currency: store.currency || 'BDT',
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

export default function ProductsPage() {
  const { products: storeProducts, currency } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
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
    if (selectedIds.size === storeProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(storeProducts.map(p => p.id)));
    }
  };
  
  const clearSelection = () => setSelectedIds(new Set());

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Link
          to="/app/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
          <span className="text-emerald-800 font-medium">
            {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-2">
            <Form method="post" className="inline">
              {Array.from(selectedIds).map(id => (
                <input key={id} type="hidden" name="productIds" value={id} />
              ))}
              <button
                type="submit"
                name="intent"
                value="publish"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
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
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </Form>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Products Table/Grid */}
      {storeProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">
            Get started by adding your first product to your store.
          </p>
          <Link
            to="/app/products/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedIds.size === storeProducts.length && storeProducts.length > 0}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {storeProducts.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition ${selectedIds.has(product.id) ? 'bg-emerald-50' : ''}`}>
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
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <ImageOff className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <Link
                            to={`/app/products/${product.id}`}
                            className="font-medium text-gray-900 hover:text-emerald-600 transition"
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
                      <span className={`font-medium ${(product.inventory || 0) <= 0 ? 'text-red-600' : (product.inventory || 0) < 10 ? 'text-yellow-600' : 'text-gray-900'}`}>
                        {product.inventory ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-gray-600">{product.category || '—'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge published={product.isPublished ?? true} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-100">
            {storeProducts.map((product) => (
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
                      <span className={`${(product.inventory || 0) <= 0 ? 'text-red-600' : 'text-gray-500'}`}>
                        Stock: {product.inventory ?? 0}
                      </span>
                    </div>
                    {product.category && (
                      <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                    )}
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
          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
          : 'bg-gray-100 text-gray-600 border border-gray-200'
        }
      `}
    >
      {published ? 'Published' : 'Draft'}
    </span>
  );
}
