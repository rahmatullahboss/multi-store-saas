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

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  Search, 
  Loader2, 
  CheckCircle, 
  ArrowLeft,
  Globe,
  Image,
  Upload,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'SEO Settings - Ozzyl' }];
};

// Type for SEO config
interface SeoConfig {
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  keywords?: string[];
}

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      themeConfig: stores.themeConfig,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  
  // Parse SEO config from themeConfig
  let seoConfig: SeoConfig = {};
  if (store.themeConfig) {
    try {
      const config = JSON.parse(store.themeConfig);
      seoConfig = config.seo || {};
    } catch {
      // Ignore parse errors
    }
  }

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
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const metaTitle = formData.get('metaTitle') as string;
  const metaDescription = formData.get('metaDescription') as string;
  const ogImage = formData.get('ogImage') as string;
  const keywords = formData.get('keywords') as string;

  const db = drizzle(context.cloudflare.env.DB);

  // Get current themeConfig
  const storeResult = await db
    .select({ themeConfig: stores.themeConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  let themeConfig: Record<string, unknown> = {};
  if (storeResult[0]?.themeConfig) {
    try {
      themeConfig = JSON.parse(storeResult[0].themeConfig);
    } catch {
      // Ignore parse errors
    }
  }

  // Update SEO config
  themeConfig.seo = {
    metaTitle: metaTitle?.trim() || null,
    metaDescription: metaDescription?.trim() || null,
    ogImage: ogImage?.trim() || null,
    keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(Boolean) : [],
  };

  await db
    .update(stores)
    .set({
      themeConfig: JSON.stringify(themeConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

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
  const { t, lang } = useTranslation();

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
      console.log(`OG Image compressed: ${file.size} -> ${compressedBlob.size} bytes`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
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
        {/* Hidden OG image input */}
        <input type="hidden" name="ogImage" value={ogImageUrl} />

        {/* Meta Title & Description */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
            {/* Meta Title */}
            <div>
              <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700 mb-1">
                {t('metaTitle')}
              </label>
              <input
                type="text"
                id="metaTitle"
                name="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={60}
                placeholder={store.name}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{metaTitle.length}/60 {t('characters')}</p>
            </div>

            {/* Meta Description */}
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">
                {t('metaDescription')}
              </label>
              <textarea
                id="metaDescription"
                name="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                maxLength={160}
                placeholder={String(t('seoDescPlaceholder'))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">{metaDescription.length}/160 {t('characters')}</p>
            </div>

            {/* Keywords */}
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                {t('keywordsLabel')}
              </label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                defaultValue={seoConfig.keywords?.join(', ') || ''}
                placeholder={String(t('keywordsPlaceholder'))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Open Graph Image */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('socialMediaImage')}</h2>
              <p className="text-sm text-gray-500">{t('socialMediaImageDesc')}</p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="flex-shrink-0">
              {ogImagePreview ? (
                <div className="relative">
                  <img
                    src={ogImagePreview}
                    alt="OG Preview"
                    className="w-48 h-28 object-cover rounded-lg border border-gray-200"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
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
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}
