/**
 * Store Settings Page
 *
 * Route: /app/settings
 *
 * Features:
 * - Edit store name, currency
 * - Upload store logo & favicon
 * - Select store theme & custom accent color
 * - Select font family
 * - Social media links
 * - Business info
 * - Custom domain
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, count, sum } from 'drizzle-orm';
import {
  stores,
  products,
  customers,
  orders,
  emailSubscribers,
  savedLandingConfigs,
  emailCampaigns,
} from '@db/schema';
import { parseSocialLinks, parseFooterConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';

import {
  Store,
  Globe,
  Loader2,
  CheckCircle,
  Upload,
  X,
  Image,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  FileText,
  AlertTriangle,
  Palette,
  List,
} from 'lucide-react';
import { StoreDeleteWarningModal } from '~/components/StoreDeleteWarningModal';
import { ThemePreview } from '~/components/ThemePreview';
import { useState, useEffect, useRef } from 'react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { useTranslation } from '~/contexts/LanguageContext';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Settings' }];
};

// ============================================================================
// LOADER - Fetch store data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const footerConfig = parseFooterConfig(store.footerConfig as string | null);

  const planType = store.planType || 'free';
  // Note: allowStoreMode removed - mode control now in Homepage Settings

  // Fetch data counts for retention modal
  const [
    productsCount,
    customersCount,
    ordersData,
    subscribersCount,
    landingPagesCount,
    campaignsCount,
  ] = await Promise.all([
    db.select({ count: count() }).from(products).where(eq(products.storeId, storeId)),
    db.select({ count: count() }).from(customers).where(eq(customers.storeId, storeId)),
    db
      .select({ count: count(), totalRevenue: sum(orders.total) })
      .from(orders)
      .where(eq(orders.storeId, storeId)),
    db
      .select({ count: count() })
      .from(emailSubscribers)
      .where(eq(emailSubscribers.storeId, storeId)),
    db
      .select({ count: count() })
      .from(savedLandingConfigs)
      .where(eq(savedLandingConfigs.storeId, storeId)),
    db.select({ count: count() }).from(emailCampaigns).where(eq(emailCampaigns.storeId, storeId)),
  ]);

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      currency: store.currency,
      defaultLanguage: store.defaultLanguage || 'en',
      // Note: mode field removed - use storeEnabled from Homepage Settings instead
      planType,
      theme: store.theme,
      logo: store.logo,
      favicon: store.favicon,
      fontFamily: store.fontFamily || 'inter',
      socialLinks: socialLinks || { facebook: '', instagram: '', whatsapp: '', twitter: '' },
      footerConfig: footerConfig || { description: '', showPoweredBy: true },
      businessInfo: store.businessInfo
        ? JSON.parse(store.businessInfo)
        : { phone: '', email: '', address: '' },
    },
    // Note: allowStoreMode removed - handled in Homepage Settings
    dataCounts: {
      products: productsCount[0]?.count || 0,
      customers: customersCount[0]?.count || 0,
      orders: ordersData[0]?.count || 0,
      totalRevenue: Number(ordersData[0]?.totalRevenue) || 0,
      subscribers: subscribersCount[0]?.count || 0,
      landingPages: landingPagesCount[0]?.count || 0,
      campaigns: campaignsCount[0]?.count || 0,
      currency: store.currency || 'BDT',
    },
  });
}

// ============================================================================
// ACTION - Update store settings (with server-side validation)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Handle Store Deletion (Soft Delete)
  if (intent === 'deleteStore') {
    const exitReason = formData.get('exitReason') as string;
    const feedback = formData.get('feedback') as string;

    // Log exit survey if provided
    if (exitReason) {
      console.log(`[EXIT_SURVEY] Store ${storeId}: reason=${exitReason}, feedback=${feedback}`);
      // TODO: Store in exitSurveys table for Super Admin analysis
    }

    // Get store subdomain and custom domain for cache invalidation
    const storeData = await db
      .select({ subdomain: stores.subdomain, customDomain: stores.customDomain })
      .from(stores)
      .where(eq(stores.id, storeId))
      .limit(1);

    // Soft delete the store
    await db
      .update(stores)
      .set({
        deletedAt: new Date(),
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    // Invalidate cache so deleted store is immediately inaccessible
    const kvNamespace = context.cloudflare.env.STORE_CACHE;
    if (kvNamespace && storeData.length > 0) {
      const kvCache = new KVCache(kvNamespace);
      const { subdomain, customDomain } = storeData[0];

      // Invalidate all cache keys for this store
      await Promise.all([
        kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`),
        customDomain
          ? kvCache.delete(`${CACHE_KEYS.TENANT_DOMAIN}${customDomain}`)
          : Promise.resolve(),
        kvCache.delete(`${CACHE_KEYS.STORE_CONFIG}${storeId}`),
      ]);

      console.log(`[STORE_DELETE] Cache invalidated for store ${storeId} (${subdomain})`);
    }

    // Redirect to logout (they can no longer access this store)
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/auth/logout',
      },
    });
  }
  const name = formData.get('name') as string;
  const currency = formData.get('currency') as string;
  const theme = formData.get('theme') as string;
  const logo = formData.get('logo') as string;
  const favicon = formData.get('favicon') as string;
  const fontFamily = formData.get('fontFamily') as string;
  const businessPhone = formData.get('businessPhone') as string;
  const businessEmail = formData.get('businessEmail') as string;
  const businessAddress = formData.get('businessAddress') as string;
  const customDomain = formData.get('customDomain') as string;
  // Note: storeMode handling removed - use Homepage Settings (storeEnabled) instead
  const defaultLanguage = formData.get('defaultLanguage') as 'en' | 'bn' | null;

  // Social links
  const facebook = formData.get('facebook') as string;
  const instagram = formData.get('instagram') as string;
  const whatsapp = formData.get('whatsapp') as string;

  // Validation
  if (!name || name.trim().length < 2) {
    return json({ error: 'storeNameMinLength' }, { status: 400 });
  }

  // Note: Store mode validation removed - handled in Homepage Settings (storeEnabled)

  // Build update object
  const themeValue = theme || 'starter-store';
  const existingStore = await db
    .select({ themeConfig: stores.themeConfig })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  let existingThemeConfig: Record<string, unknown> = {};
  const rawThemeConfig = existingStore[0]?.themeConfig;
  if (rawThemeConfig) {
    try {
      existingThemeConfig =
        typeof rawThemeConfig === 'string'
          ? (JSON.parse(rawThemeConfig) as Record<string, unknown>)
          : (rawThemeConfig as Record<string, unknown>);
    } catch {
      existingThemeConfig = {};
    }
  }

  const updateData: Record<string, unknown> = {
    name: name.trim(),
    currency: currency || 'BDT',
    theme: themeValue, // Legacy field for backward compatibility
    logo: logo || null,
    favicon: favicon || null,
    fontFamily: fontFamily || 'inter',
    customDomain: customDomain?.trim() || null,
    socialLinks: JSON.stringify({
      facebook: facebook || '',
      instagram: instagram || '',
      whatsapp: whatsapp || '',
    }),
    businessInfo: JSON.stringify({
      phone: businessPhone || '',
      email: businessEmail || '',
      address: businessAddress || '',
    }),
    defaultLanguage: defaultLanguage || 'en',
    updatedAt: new Date(),
    // Preserve existing themeConfig fields (e.g. floating buttons, hero slides) and only update
    // general settings values controlled by this page.
    themeConfig: JSON.stringify({
      ...existingThemeConfig,
      storeTemplateId: themeValue,
      primaryColor: existingThemeConfig.primaryColor ?? null,
      accentColor: existingThemeConfig.accentColor ?? null,
    }),
  };

  // Note: mode field update removed - use Homepage Settings (storeEnabled) instead

  await db.update(stores).set(updateData).where(eq(stores.id, storeId));

  // ========================================================================
  // AI AUTO-SYNC: Update Vector Database
  // ========================================================================
  try {
    const { createAIService } = await import('~/services/ai.server');
    const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
      context: context.cloudflare.env,
    });

    const settingsText = `Store Settings:
Name: ${updateData.name}
Currency: ${updateData.currency}
Domain: ${updateData.customDomain || 'Not set'}
Business Phone: ${businessPhone}
Business Email: ${businessEmail}
Business Address: ${businessAddress}
Social Media: Facebook: ${facebook}, Instagram: ${instagram}, WhatsApp: ${whatsapp}`;

    context.cloudflare.ctx.waitUntil(
      ai.insertVector(settingsText, {
        storeId,
        type: 'settings',
        title: 'General Settings',
        customId: `settings-${storeId}`, // Deterministic ID for upsert
      })
    );
    console.log(`[AI SYNC] Queued vector update for settings-${storeId}`);
  } catch (err) {
    console.error('[AI SYNC] Failed to update settings vector:', err);
  }

  return json({ success: true });
}

// ============================================================================
// CURRENCIES
// ============================================================================
const currencies = [
  { value: 'BDT', labelKey: 'currencyBDT' },
  { value: 'USD', labelKey: 'currencyUSD' },
  { value: 'EUR', labelKey: 'currencyEUR' },
  { value: 'GBP', labelKey: 'currencyGBP' },
  { value: 'INR', labelKey: 'currencyINR' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SettingsPage() {
  const { store, dataCounts } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>() as
    | { success?: boolean; error?: string }
    | undefined;
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();
  const [showSuccess, setShowSuccess] = useState(false);
  // Theme and font selection - used by ThemePreview component
  const selectedTheme = store.theme || 'default';
  const selectedFont = store.fontFamily || 'inter';
  // Note: Store mode selection removed from this page. Use Homepage Settings (storeEnabled toggle) instead.
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>(store.logo || '');
  const [logoPreview, setLogoPreview] = useState<string>(store.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploadingLogo = logoFetcher.state !== 'idle';

  // Favicon upload state
  const [faviconUrl, setFaviconUrl] = useState<string>(store.favicon || '');
  const [faviconPreview, setFaviconPreview] = useState<string>(store.favicon || '');
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const faviconFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploadingFavicon = faviconFetcher.state !== 'idle';

  // Handle logo upload response
  useEffect(() => {
    if (logoFetcher.data?.success && logoFetcher.data?.url) {
      setLogoUrl(logoFetcher.data.url);
      setLogoPreview(logoFetcher.data.url);
    }
  }, [logoFetcher.data]);

  // Handle favicon upload response
  useEffect(() => {
    if (faviconFetcher.data?.success && faviconFetcher.data?.url) {
      setFaviconUrl(faviconFetcher.data.url);
      setFaviconPreview(faviconFetcher.data.url);
    }
  }, [faviconFetcher.data]);

  // Show success message
  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress image before upload (saves bandwidth & storage)
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressedBlob = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        format,
      });
      fileToUpload = new File([compressedBlob], `logo.${format}`, { type: `image/${format}` });
      console.log(`Logo compressed: ${file.size} -> ${compressedBlob.size} bytes`);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'logos');

    logoFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFaviconPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Compress favicon (small size, but still optimize)
    let fileToUpload: File | Blob = file;
    try {
      const compressedBlob = await compressImage(file, {
        maxWidth: 64,
        maxHeight: 64,
        quality: 0.9,
        format: 'png', // Keep PNG for favicon
      });
      fileToUpload = new File([compressedBlob], 'favicon.png', { type: 'image/png' });
      console.log(`Favicon compressed: ${file.size} -> ${compressedBlob.size} bytes`);
    } catch (error) {
      console.warn('Image compression failed, uploading original:', error);
    }

    const formData = new FormData();
    formData.append('file', fileToUpload);
    formData.append('folder', 'favicons');

    faviconFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeLogo = () => {
    // Delete from R2 bucket if logo exists
    if (logoUrl) {
      const deleteFormData = new FormData();
      deleteFormData.append('imageUrl', logoUrl);
      fetch('/api/delete-image', {
        method: 'POST',
        body: deleteFormData,
      }).catch((err) => console.warn('Failed to delete logo from R2:', err));
    }

    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFavicon = () => {
    // Delete from R2 bucket if favicon exists
    if (faviconUrl) {
      const deleteFormData = new FormData();
      deleteFormData.append('imageUrl', faviconUrl);
      fetch('/api/delete-image', {
        method: 'POST',
        body: deleteFormData,
      }).catch((err) => console.warn('Failed to delete favicon from R2:', err));
    }

    setFaviconUrl('');
    setFaviconPreview('');
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
        <p className="text-gray-600">{t('settingsSubtitle')}</p>
      </div>

      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {t('settingsSaved')}
        </div>
      )}

      {/* Error Message */}
      {actionData?.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {t(actionData.error as any)}
        </div>
      )}

      <Form method="post" className="space-y-6">
        {/* Hidden inputs */}
        <input type="hidden" name="logo" value={logoUrl} />
        <input type="hidden" name="favicon" value={faviconUrl} />

        {/* Logo & Favicon Upload Card */}
        <GlassCard intensity="low" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('branding')}</h2>
              <p className="text-sm text-gray-500">{t('brandingDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storeLogo')}
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Store logo"
                        className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                      {isUploadingLogo && (
                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                          <Loader2 className="w-5 h-5 text-white animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Store className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingLogo ? t('uploading') : t('uploadBtn')}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{t('logoHint')}</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('favicon')}</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {faviconPreview ? (
                    <div className="relative">
                      <img
                        src={faviconPreview}
                        alt="Favicon"
                        className="w-10 h-10 object-contain rounded border border-gray-200 bg-gray-50"
                      />
                      {isUploadingFavicon && (
                        <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                          <Loader2 className="w-4 h-4 text-white animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={removeFavicon}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => faviconInputRef.current?.click()}
                    disabled={isUploadingFavicon}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {isUploadingFavicon ? t('uploading') : t('uploadBtn')}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">{t('faviconHint')}</p>
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/x-icon,image/ico"
                  onChange={handleFaviconChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Store Info Card */}
        <GlassCard intensity="low" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('storeInformation')}</h2>
              <p className="text-sm text-gray-500">{t('storeInformationDesc')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Store Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t('storeNameLabel')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                defaultValue={store.name}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                {t('storeCurrency')}
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={store.currency || 'BDT'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.value} value={c.value}>
                    {t(c.labelKey as any)}
                  </option>
                ))}
              </select>
            </div>

            {/* Store Language */}
            <div>
              <label
                htmlFor="defaultLanguage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('storeLanguage')}
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                defaultValue={store.defaultLanguage || 'en'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
              >
                <option value="en">🇬🇧 {t('english')}</option>
                <option value="bn">🇧🇩 {t('bengali')}</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">{t('storeLanguageDesc')}</p>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <InfoItem label={t('subdomainLabel')} value={`${store.subdomain}.ozzyl.com`} />
              <InfoItem label={t('currentPlanLabel')} value={t(store.planType)} />
              {store.customDomain && (
                <InfoItem label={t('customDomainLabel')} value={store.customDomain} />
              )}
            </div>
          </div>
        </GlassCard>

        {/* Note: Store Mode Selection Card removed - use Homepage Settings (/app/settings/homepage) instead */}

        {/* Theme Preview Modal */}
        <ThemePreview
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          theme={selectedTheme}
          fontFamily={selectedFont}
          storeName={store.name}
          logo={logoUrl || store.logo}
        />

        {/* Social Media Links */}
        <GlassCard intensity="low" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('socialMedia')}</h2>
              <p className="text-sm text-gray-500">{t('connectSocialProfiles')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4 inline mr-1 text-blue-600" /> {t('facebookUrl')}
              </label>
              <input
                type="url"
                id="facebook"
                name="facebook"
                defaultValue={store.socialLinks?.facebook || ''}
                placeholder="https://facebook.com/yourpage"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Instagram */}
            <div>
              <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                <Instagram className="w-4 h-4 inline mr-1 text-pink-600" /> {t('instagramUrl')}
              </label>
              <input
                type="url"
                id="instagram"
                name="instagram"
                defaultValue={store.socialLinks?.instagram || ''}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
                <MessageCircle className="w-4 h-4 inline mr-1 text-green-600" />{' '}
                {t('whatsappNumber')}
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                defaultValue={store.socialLinks?.whatsapp || ''}
                placeholder="+8801XXXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">{t('whatsappCountryCodeHint')}</p>
            </div>
          </div>
        </GlassCard>

        {/* Business Info Card */}
        <GlassCard intensity="low" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('businessInformation')}</h2>
              <p className="text-sm text-gray-500">{t('contactDetailsInvoices')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Phone */}
            <div>
              <label
                htmlFor="businessPhone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <Phone className="w-4 h-4 inline mr-1" /> {t('businessPhoneLabel')}
              </label>
              <input
                type="tel"
                id="businessPhone"
                name="businessPhone"
                defaultValue={store.businessInfo?.phone || ''}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="businessEmail"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <Mail className="w-4 h-4 inline mr-1" /> {t('businessEmailLabel')}
              </label>
              <input
                type="email"
                id="businessEmail"
                name="businessEmail"
                defaultValue={store.businessInfo?.email || ''}
                placeholder="contact@yourstore.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="businessAddress"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <MapPin className="w-4 h-4 inline mr-1" /> {t('businessAddressLabel')}
              </label>
              <textarea
                id="businessAddress"
                name="businessAddress"
                rows={2}
                defaultValue={store.businessInfo?.address || ''}
                placeholder="123 Main Street, Dhaka, Bangladesh"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>
          </div>
        </GlassCard>

        {/* Custom Domain Settings */}
        <GlassCard intensity="low" className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('customDomain')}</h2>
              <p className="text-sm text-gray-500">{t('connectOwnDomain')}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Domain Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">{t('storeCurrentlyAt')}</p>
              <p className="font-medium text-gray-900 mt-1">https://{store.subdomain}.ozzyl.com</p>
            </div>

            {/* Custom Domain Input */}
            <div>
              <label
                htmlFor="customDomain"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                {t('customDomainOptional')}
              </label>
              <input
                type="text"
                id="customDomain"
                name="customDomain"
                defaultValue={store.customDomain || ''}
                placeholder="mystore.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">{t('enterDomainWithoutHttps')}</p>
            </div>

            {/* DNS Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900">{t('setupInstructions')}</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. {t('dnsStep1')}</li>
                <li>2. {t('dnsStep2')}</li>
                <li className="ml-4 font-mono text-xs bg-blue-100 p-2 rounded">
                  Name: @ or www
                  <br />
                  Value: multi-store-saas.ozzyl.workers.dev
                </li>
                <li>3. {t('dnsStep3')}</li>
                <li>4. {t('dnsStep4')}</li>
              </ol>
            </div>

            {/* Current Status */}
            {store.customDomain && (
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-gray-600">
                  Custom domain configured: <strong>{store.customDomain}</strong>
                </span>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Quick Links to Other Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('moreSettings')}</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/app/settings/shipping"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700">{t('shippingZonesLink')}</span>
            </a>
            <a
              href="/app/settings/seo"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">{t('seoSettingsLink')}</span>
            </a>
            <a
              href="/app/settings/team"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">{t('teamMembersLink')}</span>
            </a>
            <a
              href="/app/settings/activity"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium text-gray-700">{t('activityLogLink')}</span>
            </a>
            <a
              href="/app/settings/landing"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-rose-600" />
              </div>
              <span className="font-medium text-gray-700">{t('landingModeLink')}</span>
            </a>
            <a
              href="/app/settings/navigation"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <List className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700">
                {t('navigationSettings') || 'Navigation'}
              </span>
            </a>
            <a
              href="/app/settings/courier"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">{t('courierApiLink')}</span>
            </a>
            <a
              href="/app/settings/developer"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-slate-600" />
              </div>
              <span className="font-medium text-gray-700">{t('developerApiLink')}</span>
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploadingLogo || isUploadingFavicon}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('savingSettings')}
              </>
            ) : (
              t('saveSettings')
            )}
          </button>
        </div>
      </Form>

      {/* Danger Zone - Delete Store */}
      <div className="bg-red-50 rounded-xl border border-red-200 p-6 mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{t('dangerZone')}</h2>
            <p className="text-sm text-gray-500">{t('irreversibleActions')}</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-lg border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{t('deleteStore')}</h3>
              <p className="text-sm text-gray-500">{t('permanentlyDeleteStore')}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {t('delete')}
            </button>
          </div>
        </div>
      </div>

      {/* Store Delete Warning Modal */}
      <StoreDeleteWarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        storeName={store.name}
        dataCounts={dataCounts}
      />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
