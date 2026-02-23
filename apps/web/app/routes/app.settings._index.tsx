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
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, useFetcher, useSearchParams } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
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
import { getStoreId } from '~/services/auth.server';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';

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

const SUBDOMAIN_REGEX = /^[a-z0-9-]+$/;
const SUBDOMAIN_MIN_LENGTH = 2;
const SUBDOMAIN_MAX_LENGTH = 30;
const RESERVED_SUBDOMAINS = new Set(['app', 'www']);

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

  // Get unified settings (single source of truth)
  const unifiedSettings = await getUnifiedStorefrontSettings(db, storeId, { env: context.cloudflare.env });

  // Social links from unified settings
  const socialLinks = {
    facebook: unifiedSettings.social.facebook ?? '',
    instagram: unifiedSettings.social.instagram ?? '',
    whatsapp: unifiedSettings.social.whatsapp ?? '',
    twitter: unifiedSettings.social.twitter ?? '',
    youtube: unifiedSettings.social.youtube ?? '',
    linkedin: unifiedSettings.social.linkedin ?? '',
  };

  // Footer config from unified settings (use default if not set)
  const footerConfig = {
    description: unifiedSettings.branding.description ?? '',
    showPoweredBy: true,
  };

  // Business info from unified settings
  const businessInfo = {
    phone: unifiedSettings.business.phone ?? '',
    email: unifiedSettings.business.email ?? '',
    address: unifiedSettings.business.address ?? '',
  };

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
      name: unifiedSettings.branding.storeName || store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      currency: store.currency,
      defaultLanguage: store.defaultLanguage || 'en',
      // Note: mode field removed - use storeEnabled from Homepage Settings instead
      planType,
      theme: unifiedSettings.theme.templateId,
      logo: unifiedSettings.branding.logo || store.logo,
      favicon: unifiedSettings.branding.favicon || store.favicon,
      fontFamily: unifiedSettings.typography.fontFamily || store.fontFamily || 'inter',
      social: socialLinks,
      footerConfig: footerConfig,
      business: businessInfo,
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
      console.warn(`[EXIT_SURVEY] Store ${storeId}: reason=${exitReason}, feedback=${feedback}`);
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

      console.warn(`[STORE_DELETE] Cache invalidated for store ${storeId} (${subdomain})`);
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
  const currentStore = await db
    .select({
      customDomain: stores.customDomain,
      planType: stores.planType,
      subdomain: stores.subdomain,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);
  if (!currentStore[0]) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const existingCustomDomain = (currentStore[0].customDomain || '').trim().toLowerCase();
  const requestedCustomDomain = (customDomain || '').trim().toLowerCase();
  const existingSubdomain = (currentStore[0].subdomain || '').trim().toLowerCase();
  const requestedSubdomain = ((formData.get('subdomain') as string) || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');

  // Security hardening:
  // Prevent direct custom-domain mutation from generic settings endpoint.
  // Custom domains must go through /app/settings/domain flow for plan checks + hostname validation.
  if (requestedCustomDomain !== existingCustomDomain) {
    return json(
      {
        error: 'Please use Domain Settings to update your custom domain',
      },
      { status: 403 }
    );
  }

  if (!requestedSubdomain) {
    return json({ error: 'subdomainRequired' }, { status: 400 });
  }

  if (
    requestedSubdomain.length < SUBDOMAIN_MIN_LENGTH ||
    requestedSubdomain.length > SUBDOMAIN_MAX_LENGTH
  ) {
    return json({ error: 'subdomainLengthInvalid' }, { status: 400 });
  }

  if (!SUBDOMAIN_REGEX.test(requestedSubdomain)) {
    return json({ error: 'subdomainFormatInvalid' }, { status: 400 });
  }

  if (requestedSubdomain.startsWith('-') || requestedSubdomain.endsWith('-')) {
    return json({ error: 'subdomainFormatInvalid' }, { status: 400 });
  }

  if (RESERVED_SUBDOMAINS.has(requestedSubdomain)) {
    return json({ error: 'subdomainReserved' }, { status: 400 });
  }

  if (requestedSubdomain !== existingSubdomain) {
    const existingSubdomainOwner = await db
      .select({ id: stores.id })
      .from(stores)
      .where(eq(stores.subdomain, requestedSubdomain))
      .limit(1);

    if (existingSubdomainOwner[0]) {
      return json({ error: 'subdomainAlreadyTaken' }, { status: 409 });
    }
  }

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

  // Build unified settings update (single source of truth)
  const themeValue = theme || 'luxe-boutique';

  try {
    // Unified-only save (no legacy writes)
    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db as unknown as DrizzleD1Database<Record<string, unknown>>,
      {
        KV: context.cloudflare.env.STORE_CACHE,
        STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
      },
      storeId,
      {
        branding: {
          storeName: name.trim(),
          logo: logo || null,
          favicon: favicon || null,
        },
        business: {
          phone: businessPhone || null,
          email: businessEmail || null,
          address: businessAddress || null,
        },
        social: {
          facebook: facebook || null,
          instagram: instagram || null,
          whatsapp: whatsapp || null,
        },
        theme: {
          templateId: themeValue,
        },
      }
    );
  } catch (error) {
    console.error('Failed to update unified settings:', error);
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }

  // Legacy write for fields not yet in unified schema (subdomain, customDomain, currency, fontFamily)
  // These are still needed for other parts of the system
  const legacyUpdateData: Record<string, unknown> = {
    currency: currency || 'BDT',
    fontFamily: fontFamily || 'inter',
    defaultLanguage: defaultLanguage || 'en',
    updatedAt: new Date(),
  };

  // Handle subdomain change if requested
  if (requestedSubdomain && requestedSubdomain !== currentStore[0].subdomain) {
    legacyUpdateData.subdomain = requestedSubdomain;
  }

  // Only update legacy columns if there's something to update
  if (Object.keys(legacyUpdateData).length > 1) {
    // more than just updatedAt
    try {
      await db.update(stores).set(legacyUpdateData).where(eq(stores.id, storeId));
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        return json({ error: 'subdomainAlreadyTaken' }, { status: 409 });
      }
      console.warn('Legacy column update failed:', error);
      // Don't fail - unified save already succeeded
    }
  }

  // ========================================================================
  // AI AUTO-SYNC: Update Vector Database
  // ========================================================================
  try {
    const { createAIService } = await import('~/services/ai.server');
    const ai = createAIService(context.cloudflare.env.OPENROUTER_API_KEY, {
      context: context.cloudflare.env,
    });

    const settingsText = `Store Settings:
Name: ${name.trim()}
Currency: ${currency || 'BDT'}
Domain: ${currentStore[0].customDomain || 'Not set'}
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
    console.warn(`[AI SYNC] Queued vector update for settings-${storeId}`);
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
  const [searchParams] = useSearchParams();
  const mobileShowForm = searchParams.get('edit') === '1';
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
      console.warn(`Logo compressed: ${file.size} -> ${compressedBlob.size} bytes`);
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
      console.warn(`Favicon compressed: ${file.size} -> ${compressedBlob.size} bytes`);
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
      {/* ===== MOBILE HUB VIEW (visible only on mobile) ===== */}
      <div className={`md:hidden -m-4 min-h-screen bg-gray-50 flex flex-col pb-10 ${mobileShowForm ? 'hidden' : ''}`}>

        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
          <a
            href="/app"
            className="p-2 -ml-1 rounded-full hover:bg-gray-100 transition-colors text-gray-700 flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </a>
          <h1 className="text-lg font-bold text-gray-900 flex-1">{t('settings')}</h1>
        </header>

        {/* Store Profile Section */}
        <section className="bg-white border-b border-gray-100 px-6 py-8 flex flex-col items-center">
          <div className="relative w-24 h-24 mb-4 rounded-full overflow-hidden shadow-sm border-2 border-gray-100">
            {logoPreview ? (
              <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Store className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-0.5">{(store as any)?.name || 'My Store'}</h2>
          <p className="text-emerald-600 font-medium text-sm mb-5">{(store as any)?.subdomain}.ozzyl.com</p>
          <a
            href="?edit=1"
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-sm rounded-full shadow-sm shadow-emerald-500/20 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            {t('editStore') || 'Edit Store'}
          </a>
        </section>

        {/* Settings Groups */}
        <div className="flex-1 px-4 pt-6 space-y-6">

          {/* Group: Store */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('store') || 'Store'}</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <a href="/app/settings?edit=1"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('generalSettings') || 'General'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('storeDetailsSubtitle') || 'View and update store details'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/homepage"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 mr-4 flex-shrink-0">
                  <Palette className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('storefrontAppearance') || 'Storefront Appearance'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('customizeThemesLayout') || 'Customize themes and layout'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/domain"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('domain') || 'Domain'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('manageCustomDomains') || 'Manage custom domains'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/navigation"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mr-4 flex-shrink-0">
                  <List className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('navigationSettings') || 'Navigation'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('configureMenusLinks') || 'Configure menus and links'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Group: Sales */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('sales') || 'Sales'}</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <a href="/app/settings/payment"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('paymentMethods') || 'Payment Methods'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('gatewaysCodBank') || 'Gateways, COD, and bank transfer'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/shipping"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('shipping') || 'Shipping'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('deliveryZonesRates') || 'Delivery zones and rates'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/courier"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('courierApiLink') || 'Courier'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('thirdPartyIntegrations') || 'Third-party integrations'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Group: Marketing */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('marketing') || 'Marketing'}</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <a href="/app/settings/seo"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">SEO</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('metaTagsSitemaps') || 'Meta tags and sitemaps'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/lead-gen"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-violet-50 flex items-center justify-center text-violet-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('navLeadGenSettings') || 'Lead Generation'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('popupsAndForms') || 'Popups and forms'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/business-mode"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mr-4 flex-shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('businessMode') || 'Business Mode'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('switchB2bB2c') || 'Switch between B2B/B2C'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Group: Security */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('security') || 'Security'}</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <a href="/app/settings/team"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('teamMembers') || 'Team Members'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('manageAccessRoles') || 'Manage access and roles'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/fraud"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('fraudDetection') || 'Fraud Detection'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('rulesAndAlerts') || 'Rules and alerts'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Group: Account */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{t('account') || 'Account'}</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <a href="/app/billing"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('billingAndPlan') || 'Billing and Plan'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('subscriptionDetails') || 'Subscription details'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/activity"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mr-4 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('activityLog') || 'Activity Log'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('recentActionsChanges') || 'Recent actions and changes'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
              <a href="/app/settings/developer"
                className="flex items-center p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 mr-4 flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t('developerApiLink') || 'Developer Tools'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t('apiKeysWebhooks') || 'API keys and webhooks'}</p>
                </div>
                <svg className="w-5 h-5 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </a>
            </div>
          </div>

          {/* Logout Button */}
          <div>
            <form action="/logout" method="post">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 p-4 bg-red-50 hover:bg-red-100 active:bg-red-200 rounded-2xl transition-colors text-red-600 font-bold text-sm border border-red-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t('logout') || 'Log Out'}
              </button>
            </form>
            <p className="text-center text-xs text-gray-400 mt-4">Ozzyl v1.0 • Powered by Cloudflare</p>
          </div>
        </div>

      </div>

      {/* ===== DESKTOP HEADER (hidden on mobile unless ?edit=1) ===== */}
      <div className={`${mobileShowForm ? 'flex' : 'hidden md:flex'} items-center justify-between`}>
        {mobileShowForm && (
          <a href="/app/settings" className="md:hidden flex items-center gap-1 text-emerald-600 font-medium text-sm mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('back') || 'Back'}
          </a>
        )}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings')}</h1>
          <p className="text-sm text-gray-600">{t('settingsSubtitle')}</p>
        </div>
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
          {t(actionData.error as Parameters<typeof t>[0])}
        </div>
      )}

      <Form method="post" id="store-form-desktop" className={`space-y-6 ${mobileShowForm ? '' : 'hidden md:block'}`}>
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
                  {logoFetcher.data?.error && (
                    <p className="text-xs text-red-600 mt-1">{logoFetcher.data.error}</p>
                  )}
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
                  {faviconFetcher.data?.error && (
                    <p className="text-xs text-red-600 mt-1">{faviconFetcher.data.error}</p>
                  )}
                </div>
                <input
                  ref={faviconInputRef}
                  type="file"
                  accept="image/png,image/x-icon,image/ico,image/jpeg,image/webp,image/gif"
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
                    {t(c.labelKey as Parameters<typeof t>[0])}
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

            {/* Subdomain + Plan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('subdomainLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    id="subdomain"
                    name="subdomain"
                    defaultValue={store.subdomain}
                    minLength={SUBDOMAIN_MIN_LENGTH}
                    maxLength={SUBDOMAIN_MAX_LENGTH}
                    pattern="[-a-z0-9]+"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <span className="text-sm text-gray-600 font-mono">.ozzyl.com</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{t('subdomainHint')}</p>
              </div>

              <div>
                <label htmlFor="planType" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('currentPlanLabel')}
                </label>
                <input
                  id="planType"
                  type="text"
                  value={store.planType || 'free'}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Plan changes are available only from Plan &amp; Billing.
                </p>
                <a
                  href="/app/billing"
                  className="inline-flex mt-2 text-sm font-medium text-emerald-700 hover:text-emerald-800"
                >
                  Go to Plan &amp; Billing
                </a>
              </div>
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
                defaultValue={store.social?.facebook || ''}
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
                defaultValue={store.social?.instagram || ''}
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
                defaultValue={store.social?.whatsapp || ''}
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
                defaultValue={store.business?.phone || ''}
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
                defaultValue={store.business?.email || ''}
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
                defaultValue={store.business?.address || ''}
                placeholder="123 Main Street, Dhaka, Bangladesh"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
              />
            </div>
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
              href="/app/settings/business-mode"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="font-medium text-gray-700">
                {t('navBusinessMode') || 'Business Mode'}
              </span>
            </a>
            <a
              href="/app/settings/lead-gen"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-violet-600" />
              </div>
              <span className="font-medium text-gray-700">
                {t('navLeadGenSettings') || 'Lead Gen Settings'}
              </span>
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
