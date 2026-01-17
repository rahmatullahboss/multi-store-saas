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
import { eq, and } from 'drizzle-orm';
import { products, productVariants, stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, ArrowLeft, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from '@remix-run/react';
import { VariantManager, type Variant } from '~/components/VariantManager';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { useTranslation } from '~/contexts/LanguageContext';
import { useUnsavedChanges, deleteOrphanedImage } from '~/hooks/useUnsavedChanges';
import { RichTextEditor } from '~/components/RichTextEditor';
import { ClientOnly } from 'remix-utils/client-only';

export const meta: MetaFunction = () => {
  return [{ title: 'Add Product - Ozzyl' }];
};

// ============================================================================
// ACTION - Create new product (with plan limit validation)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
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
  // SEO fields
  const seoTitle = formData.get('seoTitle') as string;
  const seoDescription = formData.get('seoDescription') as string;
  const seoKeywords = formData.get('seoKeywords') as string;

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
    seoTitle: seoTitle?.trim() || null,
    seoDescription: seoDescription?.trim() || null,
    seoKeywords: seoKeywords?.trim() || null,
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

  // ========================================================================
  // AUTO-PUBLISH LOGIC: If this is the first product, auto-set as featured & publish store
  // ========================================================================
  const allProducts = await db.select({ id: products.id })
    .from(products)
    .where(and(eq(products.storeId, storeId), eq(products.isPublished, true)))
    .limit(2);

  // If this is the only (first) product, set it as featured and publish the store
  if (allProducts.length === 1) {
    await db.update(stores).set({
      featuredProductId: inserted.id,
      isActive: true,
      updatedAt: new Date(),
    }).where(eq(stores.id, storeId));
    console.log(`[AUTO-PUBLISH] First product created for store ${storeId}. Auto-set as featured and published.`);
  }

  // ========================================================================
  // AI AUTO-SYNC: Index new product in Vector Database
  // ========================================================================
  try {
    const { createAIService } = await import('~/services/ai.server');
    const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
      context: context.cloudflare.env
    });

    const productText = `Product: ${title}\nCategory: ${category || 'Uncategorized'}\nPrice: ${price}\nDescription: ${description || ''}`;

    // Fire and forget (don't await to block UI)
    context.cloudflare.ctx.waitUntil(
      ai.insertVector(productText, {
        storeId,
        type: 'product',
        productId: inserted.id,
        title,
        category: category || 'Uncategorized',
        customId: `product-${inserted.id}` // Deterministic ID for upsert
      })
    );
    console.log(`[AI SYNC] Queued vector insertion for product ${inserted.id}`);
  } catch (err) {
    console.error('[AI SYNC] Failed to init AI service:', err);
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
  const { t, lang } = useTranslation();

  // Image upload state
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Variants state
  const [variants, setVariants] = useState<Variant[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);

  // Category state (for dynamic variant suggestions)
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Form dirty state (track if user has made changes)
  const [formTitle, setFormTitle] = useState<string>('');
  const [formPrice, setFormPrice] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');

  // SEO state
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [formSeoTitle, setFormSeoTitle] = useState<string>('');
  const [formSeoDescription, setFormSeoDescription] = useState<string>('');
  const [formSeoKeywords, setFormSeoKeywords] = useState<string>('');

  // Auto-generate SEO values
  const autoSeoTitle = formTitle;
  const autoSeoDescription = formDescription.slice(0, 155);

  // Check if form has unsaved changes
  const hasUnsavedChanges = !!(formTitle || formPrice || formDescription || imageUrl || variants.length > 0);

  // Cleanup callback for orphaned images
  const handleAbandon = useCallback(() => {
    if (imageUrl) {
      deleteOrphanedImage(imageUrl);
    }
  }, [imageUrl]);

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
    }
  }, [imageFetcher.data]);

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
      // Create a new File from the compressed blob
      fileToUpload = new File([compressedBlob], `image.${format}`, { type: `image/${format}` });
      console.log(`Image compressed: ${file.size} -> ${compressedBlob.size} bytes (${Math.round((1 - compressedBlob.size / file.size) * 100)}% reduction)`);
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
      }).catch(err => console.warn('Failed to delete image from R2:', err));
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
          {t('backToProducts')}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{t('addNewProduct')}</h1>
        <p className="text-gray-600">{t('fillProductDetails')}</p>
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
                {isUploading ? t('uploading') : t('uploadHint')}
              </p>
              <p className="text-xs text-gray-400 mt-1">{t('pngJpgWebp')}</p>
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
              {t('productTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              placeholder={t('enterProductTitle')}
            />
            {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.title && (
              <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).title}</p>
            )}
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                {t('price')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                placeholder="0.00"
              />
              {actionData && 'errors' in actionData && (actionData.errors as Record<string, string>)?.price && (
                <p className="text-red-500 text-sm mt-1">{(actionData.errors as Record<string, string>).price}</p>
              )}
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                {t('stock')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="stock"
                name="stock"
                min="0"
                required
                defaultValue="0"
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
              {t('description')}
            </label>
            <input type="hidden" name="description" value={formDescription} />
            <ClientOnly fallback={<div className="h-32 bg-gray-50 rounded border" />}>
              {() => <RichTextEditor content={formDescription} onChange={setFormDescription} placeholder={t('describeProduct')} />}
            </ClientOnly>
          </div>
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
                <h3 className="font-semibold text-gray-900">{t('seoSettings')}</h3>
                <p className="text-xs text-gray-500">{t('seoDescription')}</p>
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
                <p className="text-xs text-gray-500 mb-2">{t('googlePreview')}</p>
                <p className="text-sm text-emerald-700 truncate">yourstore.ozzyl.com/products/...</p>
                <h4 className="text-lg text-blue-800 hover:underline cursor-pointer truncate">
                  {formSeoTitle || autoSeoTitle || t('productTitle')}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {formSeoDescription || autoSeoDescription || t('seoDescriptionPreview')}
                </p>
              </div>

              {/* Meta Title */}
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('metaTitle')}
                  <span className="text-xs text-gray-400 ml-2">({t('autoGenerateHint')})</span>
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  name="seoTitle"
                  value={formSeoTitle}
                  onChange={(e) => setFormSeoTitle(e.target.value)}
                  placeholder={autoSeoTitle || t('autoTitleHint')}
                  maxLength={60}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">{(formSeoTitle || autoSeoTitle).length}/60 characters</p>
              </div>

              {/* Meta Description */}
              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('metaDescription')}
                  <span className="text-xs text-gray-400 ml-2">({t('autoGenerateHint')})</span>
                </label>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  value={formSeoDescription}
                  onChange={(e) => setFormSeoDescription(e.target.value)}
                  placeholder={autoSeoDescription || t('autoDescHint')}
                  maxLength={160}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{(formSeoDescription || autoSeoDescription).length}/160 characters</p>
              </div>

              {/* Keywords */}
              <div>
                <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('keywords')}
                  <span className="text-xs text-gray-400 ml-2">({t('commaSeparated')})</span>
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  name="seoKeywords"
                  value={formSeoKeywords}
                  onChange={(e) => setFormSeoKeywords(e.target.value)}
                  placeholder={t('keywordPlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <VariantManager
            variants={variants}
            onChange={setVariants}
            basePrice={basePrice}
            category={selectedCategory}
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4">
          <Link
            to="/app/products"
            className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition"
          >
            {t('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('createProduct')}...
              </>
            ) : (
              t('createProduct')
            )}
          </button>
        </div>
      </Form>

      {/* Unsaved Changes Warning Modal */}
      <ConfirmationModal />
    </div>
  );
}
