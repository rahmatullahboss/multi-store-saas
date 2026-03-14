/**
 * SEO Settings Page
 *
 * Route: /app/settings/seo
 *
 * Features:
 * - Meta title/description for store
 * - Open Graph image upload
 * - SEO preview
 * - Keywords
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json } from '~/lib/rr7-compat';
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  useFetcher,
  Link,
} from 'react-router';
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  Search,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Globe,
  Image,
  Upload,
  AlertCircle,
  BarChart3,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { useTranslation } from '~/contexts/LanguageContext';
import { z } from 'zod';
import { logActivity } from '~/lib/activity.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';

export const meta: MetaFunction = () => {
  return [{ title: 'SEO Settings - Ozzyl' }];
};

// SeoConfig type is now inlined where needed

const SeoSettingsSchema = z.object({
  metaTitle: z.string().trim().max(60).optional(),   // matches UI maxLength 60
  metaDescription: z.string().trim().max(160).optional(), // matches UI maxLength 160
  ogImage: z.string().trim().max(1000).optional(),
  keywords: z.string().trim().max(500).optional(),
});

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Get store basic info for display
  const storeResult = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];

  // SEO config from unified settings
  const seoConfig = {
    metaTitle: unifiedSettings.seo?.title || '',
    metaDescription: unifiedSettings.seo?.description || '',
    ogImage: unifiedSettings.seo?.ogImage || '',
    keywords: unifiedSettings.seo?.keywords || [],
  };

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
    },
    seoConfig,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  if (!storeId) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const parsed = SeoSettingsSchema.safeParse({
    metaTitle: (formData.get('metaTitle') as string) || undefined,
    metaDescription: (formData.get('metaDescription') as string) || undefined,
    ogImage: (formData.get('ogImage') as string) || undefined,
    keywords: (formData.get('keywords') as string) || undefined,
  });
  if (!parsed.success) {
    return json({ error: 'invalid_seo_input' }, { status: 400 });
  }

  const metaTitle = parsed.data.metaTitle || '';
  const metaDescription = parsed.data.metaDescription || '';
  const ogImage = parsed.data.ogImage || '';
  const keywords = parsed.data.keywords || '';

  const db = drizzle(context.cloudflare.env.DB);

  // Parse keywords
  const keywordList = keywords
    ? keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  // Save to unified settings (single source of truth)
  try {
    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db as unknown as DrizzleD1Database<Record<string, unknown>>,
      {
        KV: context.cloudflare.env.STORE_CACHE,
        STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
      },
      storeId,
      {
        seo: {
          title: metaTitle.trim() || null,
          description: metaDescription.trim() || null,
          ogImage: ogImage.trim() || null,
          keywords: keywordList,
        },
      }
    );
  } catch (error) {
    console.error('Failed to save unified SEO settings:', error);
    return json({ error: 'Failed to save SEO settings' }, { status: 500 });
  }

  // Also update landingConfig for backwards compatibility (landing pages read from there)
  const storeResult = await db
    .select({ landingConfig: stores.landingConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  let landingConfig: Record<string, unknown> = {};
  if (storeResult[0]?.landingConfig) {
    try {
      landingConfig = JSON.parse(storeResult[0].landingConfig);
    } catch (parseError) {
      // Malformed JSON — log and reset to empty object to avoid data corruption
      console.warn('[SEO] Failed to parse landingConfig JSON, resetting:', parseError);
      landingConfig = {};
    }
  }

  landingConfig.seoTitle = metaTitle.trim() || null;
  landingConfig.seoDescription = metaDescription.trim() || null;
  landingConfig.ogImage = ogImage.trim() || null;

  await db
    .update(stores)
    .set({
      landingConfig: JSON.stringify(landingConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  await logActivity(db, {
    storeId,
    userId,
    action: 'settings_updated',
    entityType: 'settings',
    details: {
      section: 'seo',
      hasMetaTitle: Boolean(metaTitle?.trim()),
      hasMetaDescription: Boolean(metaDescription?.trim()),
      hasOgImage: Boolean(ogImage?.trim()),
      keywordCount: keywordList.length,
    },
  });

  return json({ success: true });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SeoSettingsPage() {
  const { store, seoConfig } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);
  const { t } = useTranslation();

  // OG Image upload
  const [ogImageUrl, setOgImageUrl] = useState(seoConfig.ogImage || '');
  const [ogImagePreview, setOgImagePreview] = useState(seoConfig.ogImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = imageFetcher.state !== 'idle';

  // Form state for preview
  const [metaTitle, setMetaTitle] = useState(seoConfig.metaTitle || store.name);
  const [metaDescription, setMetaDescription] = useState(seoConfig.metaDescription || '');

  useEffect(() => {
    if (imageFetcher.data?.success && imageFetcher.data?.url) {
      setOgImageUrl(imageFetcher.data.url);
      setOgImagePreview(imageFetcher.data.url);
    }
  }, [imageFetcher.data]);

  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setOgImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress image before upload (saves bandwidth & storage)
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 630,
        quality: 0.85,
        format,
      });
      fileToUpload = new File([compressedBlob], `og-image.${format}`, { type: `image/${format}` });
      console.info(`OG Image compressed: ${file.size} -> ${compressedBlob.size} bytes`);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'og-images');

    imageFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const storeUrl = store.customDomain || `${store.subdomain}.ozzyl.com`;

  // Shared form content (used in both mobile and desktop)
  const formContent = (
    <>
      {/* Hidden OG image input */}
      <input type="hidden" name="ogImage" value={ogImageUrl} />

      {/* Meta Title & Description */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('seoSearchPreview')}</h2>
            <p className="text-sm text-gray-500">{t('seoGoogleAppear')}</p>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-emerald-700 truncate">{storeUrl}</p>
          <h3 className="text-xl text-blue-800 hover:underline cursor-pointer truncate">
            {metaTitle || store.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {metaDescription || t('seoAddDescription')}
          </p>
        </div>

        <div className="space-y-4">
          {/* Meta Title — no id to avoid duplicate IDs when rendered in both mobile+desktop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('metaTitle')}
            </label>
            <input
              type="text"
              name="metaTitle"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              maxLength={60}
              placeholder={store.name}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              {metaTitle.length}/60 {t('characters')}
            </p>
          </div>

          {/* Meta Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('metaDescription')}
            </label>
            <textarea
              name="metaDescription"
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              rows={3}
              maxLength={160}
              placeholder={String(t('seoDescPlaceholder'))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {metaDescription.length}/160 {t('characters')}
            </p>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('keywordsLabel')}
            </label>
            <input
              type="text"
              name="keywords"
              defaultValue={seoConfig.keywords?.join(', ') || ''}
              placeholder={String(t('keywordsPlaceholder'))}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Open Graph Image */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('socialMediaImage')}</h2>
            <p className="text-sm text-gray-500">{t('socialMediaImageDesc')}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">
          {/* Preview */}
          <div className="flex-shrink-0 w-full md:w-auto">
            {ogImagePreview ? (
              <div className="relative">
                <img
                  src={ogImagePreview}
                  alt="OG Preview"
                  className="w-full md:w-48 h-28 object-cover rounded-lg border border-gray-200"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full md:w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload */}
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('uploading')}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  {t('uploadImage')}
                </>
              )}
            </button>
            <p className="text-xs text-gray-500 mt-2">{t('ogImageRecommend')}</p>
            {imageFetcher.data?.error && (
              <p className="text-red-500 text-sm mt-1">{imageFetcher.data.error}</p>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Tracking & Analytics Link */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('trackingAnalytics')}</h2>
            <p className="text-sm text-gray-500">{t('ffPixelDesc')}</p>
          </div>
        </div>
        <Link
          to="/app/settings/tracking"
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          {t('configureTracking')}
          <ArrowLeft className="w-4 h-4 rotate-180" />
        </Link>
      </div>

      {/* SEO Tips */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <h4 className="font-medium text-amber-900 flex items-center gap-2 mb-2">
          <AlertCircle className="w-4 h-4" />
          {t('seoTips')}
        </h4>
        <ul className="text-sm text-amber-800 space-y-1">
          <li>• {t('seoTip1')}</li>
          <li>• {t('seoTip2')}</li>
          <li>• {t('seoTip3')}</li>
          <li>• {t('seoTip4')}</li>
        </ul>
      </div>
    </>
  );

  return (
    <>
      {/* ============ MOBILE LAYOUT ============ */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-[60px] px-4">
            <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('seoSettings')}</h1>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Content */}
        <Form method="post" id="seo-form-mobile">
          <div className="flex flex-col gap-5 p-4 pb-32">
            {/* Success Message */}
            {showSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('seoSettingsSaved')}
              </div>
            )}

            {/* Error Message */}
            {actionData && 'error' in actionData && actionData.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl">
                {actionData.error}
              </div>
            )}

            {formContent}
          </div>
        </Form>

        {/* Fixed Save Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70]">
          <button
            type="submit"
            form="seo-form-mobile"
            disabled={isSubmitting || isUploading}
            className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('savingSettings')}
              </>
            ) : (
              t('saveSeoSettings')
            )}
          </button>
        </div>
      </div>

      {/* ============ DESKTOP LAYOUT ============ */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('seoSettings')}</h1>
            <p className="text-gray-600">{t('seoOptimizeDesc')}</p>
          </div>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t('seoSettingsSaved')}
          </div>
        )}

        {/* Error Message */}
        {actionData && 'error' in actionData && actionData.error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6">
          {formContent}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('savingSettings')}
                </>
              ) : (
                t('saveSeoSettings')
              )}
            </button>
          </div>
        </Form>
      </div>
    </>
  );
}
