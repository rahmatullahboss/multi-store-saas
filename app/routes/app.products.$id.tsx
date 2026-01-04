/**
 * Product Edit Page
 * 
 * Route: /app/products/:id
 * 
 * Features:
 * - Edit existing product
 * - Delete product
 * - Async image upload using useFetcher
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useLoaderData, useNavigation, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { products } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, ArrowLeft, Trash2 } from 'lucide-react';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.product?.title ? `Edit ${data.product.title}` : 'Edit Product' }];
};

// ============================================================================
// LOADER - Fetch product by ID
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const productId = parseInt(params.id || '0');
  if (!productId) {
    throw new Response('Product not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const productResult = await db
    .select()
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
    .limit(1);

  if (productResult.length === 0) {
    throw new Response('Product not found', { status: 404 });
  }

  return json({ product: productResult[0] });
}

// ============================================================================
// ACTION - Update or Delete product
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ errors: { form: 'Unauthorized' } }, { status: 401 });
  }

  const productId = parseInt(params.id || '0');
  if (!productId) {
    return json({ errors: { form: 'Product not found' } }, { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Handle DELETE
  if (intent === 'delete') {
    await db
      .delete(products)
      .where(and(eq(products.id, productId), eq(products.storeId, storeId)));
    return redirect('/app/products');
  }

  // Handle UPDATE
  const title = formData.get('title') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const isPublished = formData.get('isPublished') === 'true';

  // Validation
  const errors: Record<string, string> = {};
  if (!title || title.trim().length < 2) {
    errors.title = 'Title must be at least 2 characters';
  }
  if (!price || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    errors.price = 'Valid price is required';
  }
  if (!stock || isNaN(parseInt(stock)) || parseInt(stock) < 0) {
    errors.stock = 'Valid stock quantity is required';
  }

  if (Object.keys(errors).length > 0) {
    return json({ errors }, { status: 400 });
  }

  await db
    .update(products)
    .set({
      title: title.trim(),
      price: parseFloat(price),
      inventory: parseInt(stock),
      category: category?.trim() || null,
      description: description?.trim() || null,
      imageUrl: imageUrl || null,
      isPublished,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

  return redirect('/app/products');
}

// ============================================================================
// CATEGORIES
// ============================================================================
const categories = [
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Sports',
  'Books',
  'Toys',
  'Health & Beauty',
  'Food & Beverages',
  'Automotive',
  'Other',
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function EditProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>(product.imageUrl || '');
  const [imagePreview, setImagePreview] = useState<string>(product.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // useFetcher for async image upload
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = imageFetcher.state !== 'idle';

  // Handle fetcher response
  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url) {
      setImageUrl(imageFetcher.data.url);
      setImagePreview(imageFetcher.data.url);
    }
  }, [imageFetcher.data]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'products');

    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/app/products"
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product details</p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{product.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <Form method="post">
                <input type="hidden" name="intent" value="delete" />
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </Form>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <Form method="post" className="space-y-6">
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <input type="hidden" name="intent" value="update" />

        {/* Form Error */}
        {actionData?.errors?.form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {actionData.errors.form}
          </div>
        )}

        {/* Image Upload */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Product Image
          </label>
          
          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Product preview"
                className="w-40 h-40 object-cover rounded-lg border border-gray-200"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition"
            >
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-emerald-500 mx-auto mb-3 animate-spin" />
              ) : (
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</p>
            </div>
          )}

          {imageFetcher.data?.error && (
            <p className="text-red-500 text-sm mt-2">{imageFetcher.data.error}</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Product Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              defaultValue={product.title}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {actionData?.errors?.title && (
              <p className="text-red-500 text-sm mt-1">{actionData.errors.title}</p>
            )}
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                defaultValue={product.price}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {actionData?.errors?.price && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.price}</p>
              )}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                defaultValue={product.inventory ?? 0}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {actionData?.errors?.stock && (
                <p className="text-red-500 text-sm mt-1">{actionData.errors.stock}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              defaultValue={product.category || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={product.description || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Published Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isPublished"
              name="isPublished"
              value="true"
              defaultChecked={product.isPublished ?? true}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
            />
            <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
              Published (visible to customers)
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/app/products"
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
