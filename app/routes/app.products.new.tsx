/**
 * New Product Page
 * 
 * Route: /app/products/new
 * 
 * Features:
 * - Product form with all fields
 * - Async image upload using useFetcher
 * - Loading spinner and image preview
 * - Creates product in database on submit
 */

import type { ActionFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { products, productVariants } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState, useRef, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { Link } from '@remix-run/react';
import { VariantManager, type Variant } from '~/components/VariantManager';

export const meta: MetaFunction = () => {
  return [{ title: 'Add Product - Multi-Store SaaS' }];
};

// ============================================================================
// ACTION - Create new product (with plan limit validation)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ errors: { form: 'Store not found' } }, { status: 404 });
  }

  const formData = await request.formData();
  const title = formData.get('title') as string;
  const price = formData.get('price') as string;
  const stock = formData.get('stock') as string;
  const category = formData.get('category') as string;
  const description = formData.get('description') as string;
  const imageUrl = formData.get('imageUrl') as string;
  const variantsJson = formData.get('variants') as string;

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

  // ========================================================================
  // SERVER-SIDE VALIDATION: Check product limit before creating
  // ========================================================================
  const { checkUsageLimit } = await import('~/utils/plans.server');
  const limitCheck = await checkUsageLimit(context.cloudflare.env.DB, storeId, 'product');
  
  if (!limitCheck.allowed) {
    console.warn(`[SECURITY] Store ${storeId} attempted to exceed product limit`);
    return json({ 
      errors: { 
        form: limitCheck.error?.message || 'Product limit reached. Please upgrade your plan to add more products.' 
      } 
    }, { status: 403 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Create product
  const [inserted] = await db.insert(products).values({
    storeId,
    title: title.trim(),
    price: parseFloat(price),
    inventory: parseInt(stock),
    category: category?.trim() || null,
    description: description?.trim() || null,
    imageUrl: imageUrl || null,
    isPublished: true,
  }).returning({ id: products.id });

  // Create variants if any
  if (variantsJson) {
    try {
      const variants: Variant[] = JSON.parse(variantsJson);
      for (const v of variants) {
        if (v.option1Value) {
          await db.insert(productVariants).values({
            productId: inserted.id,
            option1Name: v.option1Name,
            option1Value: v.option1Value,
            option2Name: v.option2Name || null,
            option2Value: v.option2Value || null,
            price: v.price || null,
            sku: v.sku || null,
            inventory: v.inventory || 0,
          });
        }
      }
    } catch (e) {
      console.error('Failed to parse variants', e);
    }
  }

  return redirect('/app/products');
}

// ============================================================================
// CATEGORIES - Predefined list
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
export default function NewProductPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Variants state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);

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
        <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600">Fill in the details to create a new product</p>
      </div>

      {/* Form */}
      <Form method="post" className="space-y-6">
        {/* Hidden image URL field */}
        <input type="hidden" name="imageUrl" value={imageUrl} />

        {/* Form Error */}
        {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.form && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
            {(actionData.errors as Record<string, string>).form}
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder="Enter product title"
            />
            {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.title && (
              <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).title}</p>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="0.00"
              />
              {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.price && (
                <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).price}</p>
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="0"
              />
              {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.stock && (
                <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).stock}</p>
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
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <VariantManager
            variants={variants}
            onChange={setVariants}
            basePrice={basePrice}
          />
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
                Creating...
              </>
            ) : (
              'Create Product'
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
