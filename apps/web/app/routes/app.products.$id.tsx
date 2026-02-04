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
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  useFetcher,
  Link,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { products, productVariants } from '@db/schema';
import { getStoreId, getUserId } from '~/services/auth.server';
import { logActivity } from '~/lib/activity.server';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  X,
  Loader2,
  ArrowLeft,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Package,
} from 'lucide-react';
import { VariantManager, type Variant } from '~/components/VariantManager';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { useTranslation } from '~/contexts/LanguageContext';
import { useUnsavedChanges, deleteOrphanedImage } from '~/hooks/useUnsavedChanges';
import { LazyRichTextEditor } from '~/components/RichTextEditor.lazy';
import { formatPrice } from '~/lib/theme-engine';
import { toCents, fromCents } from '~/utils/money';
import {
  getProductDetailsMetafields,
  saveProductDetailsMetafields,
} from '~/lib/product-details.server';

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: data?.product?.title ? `Edit ${data.product.title}` : 'Edit Product' }];
};

// ============================================================================
// LOADER - Fetch product by ID
// ============================================================================
export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
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

  // Fetch variants
  const variantsResult = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, productId));

  const productDetails = await getProductDetailsMetafields(db, storeId, productId);

  return json({ product: productResult[0], variants: variantsResult, productDetails });
}

// ============================================================================
// ACTION - Update or Delete product
// ============================================================================
export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
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
    await db.delete(products).where(and(eq(products.id, productId), eq(products.storeId, storeId)));

    // AI SYNC: Delete vector
    try {
      const { createAIService } = await import('~/services/ai.server');
      const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
        context: context.cloudflare.env,
      });
      context.cloudflare.ctx.waitUntil(ai.deleteVector(`product-${productId}`));
    } catch (e) {
      console.error('Vector deletion failed', e);
    }

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
  const variantsJson = formData.get('variants') as string;
  // SEO fields
  const seoTitle = formData.get('seoTitle') as string;
  const seoDescription = formData.get('seoDescription') as string;
  const seoKeywords = formData.get('seoKeywords') as string;
  const material = formData.get('material') as string;
  const weight = formData.get('weight') as string;
  const dimensions = formData.get('dimensions') as string;
  const origin = formData.get('origin') as string;
  const warranty = formData.get('warranty') as string;
  const shippingInfo = formData.get('shippingInfo') as string;
  const returnPolicy = formData.get('returnPolicy') as string;
  // Bundle pricing
  const bundlePricing = formData.get('bundlePricing') as string;

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

  // Fetch current product to compare inventory change and isPublished status
  const currentProduct = await db
    .select({
      inventory: products.inventory,
      title: products.title,
      isPublished: products.isPublished,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)))
    .limit(1);

  const previousInventory = currentProduct[0]?.inventory ?? 0;
  const previouslyPublished = currentProduct[0]?.isPublished ?? false;
  const newInventory = parseInt(stock);
  const productTitle = currentProduct[0]?.title || title.trim();

  // ========================================================================
  // LIMIT CHECK: Prevent republishing if product limit reached
  // Only check when going from unpublished -> published
  // ========================================================================
  if (!previouslyPublished && isPublished) {
    const { checkUsageLimit } = await import('~/utils/plans.server');
    const limitCheck = await checkUsageLimit(context.cloudflare.env.DB, storeId, 'product');

    if (!limitCheck.allowed) {
      console.warn(`[SECURITY] Store ${storeId} attempted to republish product exceeding limit`);
      return json(
        {
          errors: {
            form:
              limitCheck.error?.message ||
              'Product limit reached. Please upgrade your plan to publish more products.',
          },
        },
        { status: 403 }
      );
    }
  }

  await db
    .update(products)
    .set({
      title: title.trim(),
      price: toCents(parseFloat(price)),
      inventory: newInventory,
      category: category?.trim() || null,
      description: description?.trim() || null,
      imageUrl: imageUrl || null,
      isPublished,
      seoTitle: seoTitle?.trim() || null,
      seoDescription: seoDescription?.trim() || null,
      seoKeywords: seoKeywords?.trim() || null,
      bundlePricing: bundlePricing || null,
      updatedAt: new Date(),
    })
    .where(and(eq(products.id, productId), eq(products.storeId, storeId)));

  // Log stock change if inventory changed
  if (previousInventory !== newInventory) {
    const userId = await getUserId(request, context.cloudflare.env);
    await logActivity(db, {
      storeId,
      userId,
      action: 'stock_change',
      entityType: 'product',
      entityId: productId,
      details: {
        productTitle,
        before: previousInventory,
        after: newInventory,
        change: newInventory - previousInventory,
      },
    });
  }

  // Handle variants
  if (variantsJson) {
    try {
      const variants: Variant[] = JSON.parse(variantsJson);

      // Delete existing variants
      await db.delete(productVariants).where(eq(productVariants.productId, productId));

      // Insert new variants
      for (const v of variants) {
        if (v.option1Value) {
          await db.insert(productVariants).values({
            productId,
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
      console.error('Failed to update variants', e);
    }
  }

  await saveProductDetailsMetafields(db, storeId, productId, {
    material,
    weight,
    dimensions,
    origin,
    warranty,
    shippingInfo,
    returnPolicy,
  });

  // ========================================================================
  // AI AUTO-SYNC: Update Vector Database
  // ========================================================================
  try {
    const { createAIService } = await import('~/services/ai.server');
    const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
      context: context.cloudflare.env,
    });

    const productText = `Product: ${title}\nCategory: ${category || 'Uncategorized'}\nPrice: ${price}\nDescription: ${description || ''}`;

    context.cloudflare.ctx.waitUntil(
      ai.insertVector(productText, {
        storeId,
        type: 'product',
        productId,
        title,
        category: category || 'Uncategorized',
        customId: `product-${productId}`, // Deterministic ID for upsert
      })
    );
  } catch (err) {
    console.error('[AI SYNC] Failed to update vector:', err);
  }

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
  const { product, variants: loadedVariants, productDetails } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>(product.imageUrl || '');
  const [imagePreview, setImagePreview] = useState<string>(product.imageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Variants state
  const [variants, setVariants] = useState<Variant[]>(
    loadedVariants.map((v) => ({
      id: v.id,
      option1Name: v.option1Name || 'Size',
      option1Value: v.option1Value || '',
      option2Name: v.option2Name || undefined,
      option2Value: v.option2Value || undefined,
      price: v.price || undefined,
      sku: v.sku || undefined,
      inventory: v.inventory || 0,
    }))
  );

  // Category state (for dynamic variant suggestions)
  const [selectedCategory, setSelectedCategory] = useState<string>(product.category || '');

  // Bundle Pricing state
  type BundleTier = { qty: number; price: number; label: string; savings?: number };
  const initialBundlePricing: BundleTier[] = (() => {
    try {
      return JSON.parse(product.bundlePricing || '[]');
    } catch {
      return [];
    }
  })();
  const [bundlePricing, setBundlePricing] = useState<BundleTier[]>(initialBundlePricing);
  const [bundleEnabled, setBundleEnabled] = useState(initialBundlePricing.length > 0);

  // Track form values for change detection
  const [formTitle, setFormTitle] = useState<string>(product.title || '');
  const [formPrice, setFormPrice] = useState<string>(String(fromCents(product.price || 0)));
  const [formDescription, setFormDescription] = useState<string>(product.description || '');
  const [formStock, setFormStock] = useState<string>(String(product.inventory ?? 0));

  // SEO state
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState<string>(product.seoTitle || '');
  const [formSeoDescription, setFormSeoDescription] = useState<string>(
    product.seoDescription || ''
  );
  const [formSeoKeywords, setFormSeoKeywords] = useState<string>(
    product.seoKeywords || ''
  );
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Auto-generate SEO values
  const autoSeoTitle = formTitle || product.title;
  const autoSeoDescription = (formDescription || product.description || '').slice(0, 155);

  // Track newly uploaded images (not the original)
  const [newlyUploadedImage, setNewlyUploadedImage] = useState<string>('');

  // Check if form has unsaved changes
  const hasUnsavedChanges =
    formTitle !== (product.title || '') ||
    formPrice !== String(product.price || '') ||
    formDescription !== (product.description || '') ||
    formStock !== String(product.inventory ?? 0) ||
    selectedCategory !== (product.category || '') ||
    imageUrl !== (product.imageUrl || '') ||
    JSON.stringify(variants) !==
      JSON.stringify(
        loadedVariants.map((v) => ({
          id: v.id,
          option1Name: v.option1Name || 'Size',
          option1Value: v.option1Value || '',
          option2Name: v.option2Name || undefined,
          option2Value: v.option2Value || undefined,
          price: v.price || undefined,
          sku: v.sku || undefined,
          inventory: v.inventory || 0,
        }))
      );

  // Cleanup callback for orphaned images (only delete newly uploaded images)
  const handleAbandon = useCallback(() => {
    if (newlyUploadedImage) {
      deleteOrphanedImage(newlyUploadedImage);
    }
  }, [newlyUploadedImage]);

  // Unsaved changes warning hook
  const { ConfirmationModal } = useUnsavedChanges({
    hasUnsavedChanges: hasUnsavedChanges && !isSubmitting,
    onAbandon: handleAbandon,
  });

  // useFetcher for async image upload
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = imageFetcher.state !== 'idle';

  // Handle fetcher response
  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url) {
      setImageUrl(imageFetcher.data.url);
      setImagePreview(imageFetcher.data.url);
      // Track newly uploaded images for potential cleanup
      if (imageFetcher.data.url !== product.imageUrl) {
        setNewlyUploadedImage(imageFetcher.data.url);
      }
    }
  }, [imageFetcher.data, product.imageUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress image before upload (saves bandwidth & storage)
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        format,
      });
      fileToUpload = new File([compressedBlob], `image.${format}`, { type: `image/${format}` });
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    // Upload to R2
    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'products');

    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeImage = () => {
    // Delete from R2 bucket if image exists
    if (imageUrl) {
      const deleteFormData = new FormData();
      deleteFormData.append('imageUrl', imageUrl);
      fetch('/api/delete-image', {
        method: 'POST',
        body: deleteFormData,
      }).catch((err) => console.warn('Failed to delete image from R2:', err));
    }

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
            {t('productImage')}
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
                {isUploading
                  ? 'Uploading...'
                  : lang === 'bn'
                    ? 'আপলোড করতে ক্লিক করুন অথবা ড্র্যাগ অ্যান্ড ড্রপ করুন'
                    : 'Click to upload or drag and drop'}
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
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            />
            {actionData &&
              'errors' in actionData &&
              (actionData.errors as Record<string, string>)?.title && (
                <p className="text-red-500 text-sm mt-1">
                  {(actionData.errors as Record<string, string>).title}
                </p>
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
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {actionData &&
                'errors' in actionData &&
                (actionData.errors as Record<string, string>)?.price && (
                  <p className="text-red-500 text-sm mt-1">
                    {(actionData.errors as Record<string, string>).price}
                  </p>
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
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              {actionData &&
                'errors' in actionData &&
                (actionData.errors as Record<string, string>)?.stock && (
                  <p className="text-red-500 text-sm mt-1">
                    {(actionData.errors as Record<string, string>).stock}
                  </p>
                )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              {t('category')}
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
            >
              <option value="">{t('selectCategory')}</option>
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
            <input type="hidden" name="description" value={formDescription} />
            <LazyRichTextEditor
              content={formDescription}
              onChange={setFormDescription}
              placeholder={t('describeProduct') || 'Describe your product...'}
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

        {/* Product Details Tabs Content (MVP) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setDetailsExpanded(!detailsExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="text-left">
              <h3 className="font-semibold text-gray-900">Product Details (MVP)</h3>
              <p className="text-xs text-gray-500">
                Specifications + Shipping & Returns tabs এর জন্য optional field
              </p>
            </div>
            {detailsExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {detailsExpanded && (
            <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="material"
                  defaultValue={productDetails.fields.material}
                  placeholder="Material (e.g. Cotton)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <input
                  type="text"
                  name="weight"
                  defaultValue={productDetails.fields.weight}
                  placeholder="Weight (e.g. 500g)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <input
                  type="text"
                  name="dimensions"
                  defaultValue={productDetails.fields.dimensions}
                  placeholder="Dimensions (e.g. 30 x 20 x 10 cm)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <input
                  type="text"
                  name="origin"
                  defaultValue={productDetails.fields.origin}
                  placeholder="Origin (e.g. Bangladesh)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
              </div>
              <input
                type="text"
                name="warranty"
                defaultValue={productDetails.fields.warranty}
                placeholder="Warranty (e.g. 1 Year)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <textarea
                name="shippingInfo"
                rows={3}
                defaultValue={productDetails.fields.shippingInfo}
                placeholder="Shipping information (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
              <textarea
                name="returnPolicy"
                rows={3}
                defaultValue={productDetails.fields.returnPolicy}
                placeholder="Return policy (optional)"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>
          )}
        </div>

        {/* SEO Settings (Collapsible) */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setSeoExpanded(!seoExpanded)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900">SEO Settings</h3>
                <p className="text-xs text-gray-500">সার্চ ইঞ্জিন অপ্টিমাইজেশন (অটো-জেনারেটেড)</p>
              </div>
            </div>
            {seoExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {seoExpanded && (
            <div className="p-4 pt-0 border-t border-gray-100 space-y-4">
              {/* Google Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500 mb-2">Google Preview:</p>
                <p className="text-sm text-emerald-700 truncate">
                  yourstore.ozzyl.com/products/...
                </p>
                <h4 className="text-lg text-blue-800 hover:underline cursor-pointer truncate">
                  {formSeoTitle || autoSeoTitle}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {formSeoDescription ||
                    autoSeoDescription ||
                    'এই প্রোডাক্টের বিবরণ এখানে দেখা যাবে...'}
                </p>
              </div>

              {/* Meta Title */}
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                  <span className="text-xs text-gray-400 ml-2">(খালি থাকলে অটো-জেনারেট হবে)</span>
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  placeholder={autoSeoTitle}
                  maxLength={60}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formSeoTitle || autoSeoTitle).length}/60 characters
                </p>
              </div>

              {/* Meta Description */}
              <div>
                <label
                  htmlFor="seoDescription"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meta Description
                  <span className="text-xs text-gray-400 ml-2">(খালি থাকলে অটো-জেনারেট হবে)</span>
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formSeoDescription}
                  onChange={(e) => setFormSeoDescription(e.target.value)}
                  placeholder={autoSeoDescription || 'প্রোডাক্ট ডেসক্রিপশন থেকে নেওয়া হবে...'}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formSeoDescription || autoSeoDescription).length}/160 characters
                </p>
              </div>

              {/* Keywords */}
              <div>
                <label
                  htmlFor="seoKeywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Keywords
                  <span className="text-xs text-gray-400 ml-2">(কমা দিয়ে আলাদা করুন)</span>
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formSeoKeywords}
                  onChange={(e) => setFormSeoKeywords(e.target.value)}
                  placeholder="যেমন: t-shirt, cotton, casual wear"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Bundle/Combo Pricing */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Combo Pricing</h3>
                <p className="text-xs text-gray-500">কম্বো/বান্ডেল অফার সেটআপ করুন</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={bundleEnabled}
                onChange={(e) => {
                  setBundleEnabled(e.target.checked);
                  if (e.target.checked && bundlePricing.length === 0) {
                    // Add default tiers
                    const basePrice = parseFloat(formPrice) || product.price;
                    setBundlePricing([
                      { qty: 1, price: basePrice, label: '১ পিস' },
                      {
                        qty: 2,
                        price: Math.round(basePrice * 2 * 0.93),
                        label: '২ পিস',
                        savings: Math.round(basePrice * 2 * 0.07),
                      },
                      {
                        qty: 3,
                        price: Math.round(basePrice * 3 * 0.88),
                        label: '৩ পিস',
                        savings: Math.round(basePrice * 3 * 0.12),
                      },
                    ]);
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {bundleEnabled && (
            <div className="p-4 space-y-4">
              <input type="hidden" name="bundlePricing" value={JSON.stringify(bundlePricing)} />

              {/* Tier List */}
              {bundlePricing.map((tier, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 grid grid-cols-4 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">সংখ্যা</label>
                      <input
                        type="number"
                        min="1"
                        value={tier.qty}
                        onChange={(e) => {
                          const newTiers = [...bundlePricing];
                          newTiers[idx].qty = parseInt(e.target.value) || 1;
                          setBundlePricing(newTiers);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">মূল্য (৳)</label>
                      <input
                        type="number"
                        min="0"
                        value={tier.price}
                        onChange={(e) => {
                          const newTiers = [...bundlePricing];
                          newTiers[idx].price = parseFloat(e.target.value) || 0;
                          // Auto-calculate savings
                          const basePerUnit = parseFloat(formPrice) || product.price;
                          const expectedTotal = basePerUnit * newTiers[idx].qty;
                          newTiers[idx].savings = Math.max(
                            0,
                            Math.round(expectedTotal - newTiers[idx].price)
                          );
                          setBundlePricing(newTiers);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">লেবেল</label>
                      <input
                        type="text"
                        value={tier.label}
                        onChange={(e) => {
                          const newTiers = [...bundlePricing];
                          newTiers[idx].label = e.target.value;
                          setBundlePricing(newTiers);
                        }}
                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">সেভ</label>
                      <div className="px-2 py-1.5 text-sm bg-green-50 text-green-700 rounded">
                        {formatPrice(tier.savings || 0)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBundlePricing(bundlePricing.filter((_, i) => i !== idx))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add Tier Button */}
              <button
                type="button"
                onClick={() => {
                  const basePrice = parseFloat(formPrice) || product.price;
                  const newQty =
                    bundlePricing.length > 0 ? bundlePricing[bundlePricing.length - 1].qty + 1 : 1;
                  setBundlePricing([
                    ...bundlePricing,
                    {
                      qty: newQty,
                      price: Math.round(basePrice * newQty * 0.9),
                      label: `${newQty} পিস`,
                      savings: Math.round(basePrice * newQty * 0.1),
                    },
                  ]);
                }}
                className="w-full py-2 border-2 border-dashed border-amber-300 text-amber-600 rounded-lg hover:bg-amber-50 transition flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                আরেকটি টায়ার যোগ করুন
              </button>
            </div>
          )}
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <VariantManager
            variants={variants}
            onChange={setVariants}
            basePrice={product.price}
            category={selectedCategory}
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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </Form>

      {/* Unsaved Changes Warning Modal */}
      <ConfirmationModal />
    </div>
  );
}
