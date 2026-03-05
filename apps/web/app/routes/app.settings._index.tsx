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
  users,
  emailSubscribers,
  savedLandingConfigs,
  emailCampaigns,
} from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { logAuditAction } from '~/services/audit.server';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';
import { MVP_THEME_IDS } from '~/templates/store-registry';

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
  Youtube,
  Linkedin,
  Twitter,
  CreditCard,
  Truck,
  Package,
  Search,
  Megaphone,
  Users,
  ShieldCheck,
  Clock,
  Code2,
  Webhook,
  Receipt,
  LogOut,
  ChevronRight,
  Settings,
  Tag,
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

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
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Handle Store Deletion (Soft Delete)
  if (intent === 'deleteStore') {
    const exitReason = formData.get('exitReason') as string;
    const feedback = formData.get('feedback') as string;

    // Get the authenticated user ID (owner performing the deletion)
    // Owner verification (defense-in-depth even after requireTenant)
    const ownerCheck = await db
      .select({ storeId: users.storeId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (ownerCheck[0]?.storeId !== storeId) {
      console.error(`[STORE_DELETE] Ownership check failed: user ${userId} does not own store ${storeId}`);
      return json({ error: 'Forbidden' }, { status: 403 });
    }

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

    // Audit log BEFORE deletion so resolveAuditStoreId can find the store record
    try {
      await logAuditAction(context.cloudflare.env, {
        storeId,
        actorId: userId,
        action: 'delete',
        resource: 'store',
        resourceId: storeId,
        diff: { exitReason, feedback },
        ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
        userAgent: request.headers.get('User-Agent') || undefined,
      });
    } catch (e) {
      console.error('[STORE_DELETE] Failed to log audit:', e);
    }

    // Soft-delete the store and null the owner's storeId in a single D1 batch round-trip
    // Note: D1 batch provides best-effort consistency (single HTTP round-trip) but is NOT
    // full ACID. In rare partial failure scenarios, onboarding.tsx handles recovery.
    // This prevents partial failure leaving data in inconsistent state
    await db.batch([
      db
        .update(stores)
        .set({
          deletedAt: new Date(),
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId)),
      db
        .update(users)
        .set({ storeId: null })
        .where(eq(users.storeId, storeId)),
    ]);

    // Confirm deletion succeeded
    console.warn(`[STORE_DELETE] Store ${storeId} successfully deleted by user ${userId}`);

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
  const themeValue = MVP_THEME_IDS.includes(theme as any) ? theme : 'starter-store';

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
  const selectedTheme = MVP_THEME_IDS.includes(store.theme as any) ? store.theme : 'starter-store';
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

  // ============================================================================
  // SIDEBAR NAV DATA
  // ============================================================================
  const sidebarGroups = [
    {
      label: t('store') || 'STORE',
      items: [
        { href: '/app/settings', label: t('generalSettings') || 'General', icon: Settings, active: true },
        { href: '/app/settings/domain', label: t('domain') || 'Domain', icon: Globe, active: false },
        { href: '/app/settings/navigation', label: t('navigationSettings') || 'Navigation', icon: List, active: false },
      ],
    },
    {
      label: t('appearance') || 'APPEARANCE',
      items: [
        { href: '/app/settings/homepage', label: t('storefrontAppearance') || 'Store Design', icon: Palette, active: false },
      ],
    },
    {
      label: t('sales') || 'SALES',
      items: [
        { href: '/app/settings/payment', label: t('paymentMethods') || 'Payment', icon: CreditCard, active: false },
        { href: '/app/settings/shipping', label: t('shipping') || 'Shipping', icon: Truck, active: false },
        { href: '/app/settings/courier', label: t('courierApiLink') || 'Courier', icon: Package, active: false },
        { href: '/app/settings/discounts', label: t('discounts') || 'Discounts', icon: Tag, active: false },
      ],
    },
    {
      label: t('marketing') || 'MARKETING',
      items: [
        { href: '/app/settings/seo', label: 'SEO', icon: Search, active: false },
        { href: '/app/settings/tracking', label: t('tracking') || 'Tracking', icon: Megaphone, active: false },
        { href: '/app/settings/lead-gen', label: t('navLeadGenSettings') || 'Messaging', icon: MessageCircle, active: false },
      ],
    },
    {
      label: t('security') || 'SECURITY',
      items: [
        { href: '/app/settings/team', label: t('teamMembers') || 'Team', icon: Users, active: false },
        { href: '/app/settings/fraud', label: t('fraudDetection') || 'Fraud Detection', icon: ShieldCheck, active: false },
        { href: '/app/settings/legal', label: t('legal') || 'Legal', icon: FileText, active: false },
      ],
    },
    {
      label: t('account') || 'ACCOUNT',
      items: [
        { href: '/app/settings/activity', label: t('activityLog') || 'Activity Log', icon: Clock, active: false },
        { href: '/app/settings/developer', label: t('developerApiLink') || 'Developer', icon: Code2, active: false },
        { href: '/app/settings/webhooks', label: t('webhooks') || 'Webhooks', icon: Webhook, active: false },
        { href: '/app/billing', label: t('billingAndPlan') || 'Billing', icon: Receipt, active: false },
      ],
    },
  ];

  // Input class helper
  const inputCls = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition';

  return (
    <div className="space-y-6">
      {/* ===== TOAST: success / error (fixed bottom-right, auto-dismiss 3s) ===== */}
      {(showSuccess || actionData?.error) && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium transition-all animate-in slide-in-from-bottom-4 ${showSuccess ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {showSuccess ? (
            <><CheckCircle className="w-5 h-5 flex-shrink-0" /><span>{t('settingsSaved') || 'সেটিংস সংরক্ষিত হয়েছে'}</span></>
          ) : (
            <><AlertTriangle className="w-5 h-5 flex-shrink-0" /><span>{t((actionData?.error ?? '') as Parameters<typeof t>[0]) || actionData?.error}</span></>
          )}
        </div>
      )}

      {/* ===== MOBILE HUB VIEW (visible only on mobile, hidden when ?edit=1) ===== */}
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

        {/* Store Profile Section — gradient hero */}
        <section className="bg-gradient-to-br from-indigo-600 to-purple-700 px-6 pt-10 pb-8 flex flex-col items-center">
          <div className="relative w-20 h-20 mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30">
            {logoPreview ? (
              <img src={logoPreview} alt="Store logo" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-white/20 flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold text-white mb-0.5">{store.name || 'My Store'}</h2>
          <p className="text-indigo-200 text-sm mb-6">{store.subdomain}.ozzyl.com</p>
          <a
            href="?edit=1"
            className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-indigo-50 active:scale-95 text-indigo-700 font-semibold text-sm rounded-full shadow-md transition-all"
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

      {/* ===== DESKTOP TWO-COLUMN LAYOUT (md+) / MOBILE EDIT FORM ===== */}
      <div className={`${mobileShowForm ? 'block' : 'hidden md:flex'} md:flex md:-m-6 md:min-h-screen`}>

        {/* ── LEFT SIDEBAR (desktop only) ── */}
        <aside className="hidden md:flex flex-col w-60 flex-shrink-0 bg-[#0f172a] min-h-screen sticky top-0 h-screen overflow-y-auto">

          {/* Sidebar content restored below */}
        </aside>

        {/* ── MAIN CONTENT AREA ── */}
        <div className="flex-1 min-w-0 flex flex-col bg-gray-50 md:bg-gray-50">

          {/* Mobile edit-form back bar */}
          {mobileShowForm && (
            <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
              <a href="/app/settings" className="flex items-center gap-1.5 text-indigo-600 font-medium text-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t('back') || 'Back'}
              </a>
              <span className="text-sm font-semibold text-gray-800">{t('generalSettings') || 'সাধারণ সেটিংস'}</span>
              <div className="w-12" />
            </div>
          )}

          {/* Desktop sticky top bar */}
          <div className="hidden md:flex sticky top-0 z-30 bg-white border-b border-gray-200 px-8 py-4 items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">
                <a href="/app/settings" className="hover:text-indigo-600">{t('settings') || 'সেটিংস'}</a>
                <span className="mx-1.5">›</span>
                <span className="text-gray-600">{t('generalSettings') || 'সাধারণ'}</span>
              </p>
              <h1 className="text-xl font-bold text-gray-900">{t('generalSettings') || 'সাধারণ সেটিংস'}</h1>
            </div>
            <button
              type="submit"
              form="store-form-desktop"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {isSubmitting ? (t('saving') || 'সংরক্ষণ হচ্ছে…') : (t('saveChanges') || 'সংরক্ষণ করুন')}
            </button>
          </div>

          {/* Scrollable form content */}
          <Form method="post" id="store-form-desktop" className="flex-1 px-4 md:px-8 py-6 space-y-6">
            {/* Hidden inputs */}
            <input type="hidden" name="logo" value={logoUrl} />
            <input type="hidden" name="favicon" value={faviconUrl} />
            <input type="hidden" name="customDomain" value={store.customDomain || ''} />
            <input type="hidden" name="fontFamily" value={store.fontFamily || 'inter'} />
            <input type="hidden" name="theme" value={selectedTheme} />

            {/* ── CARD 1: Branding ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Image className="w-4.5 h-4.5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{t('branding') || 'ব্র্যান্ডিং'}</h2>
                  <p className="text-xs text-gray-500">{t('brandingDesc') || 'লোগো ও ফেভিকন আপলোড করুন'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('storeLogo') || 'স্টোর লোগো'}</label>
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {logoPreview ? (
                        <div className="relative">
                          <img src={logoPreview} alt="Store logo" className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                          {isUploadingLogo && (
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                          <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                          {isUploadingLogo ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Image className="w-6 h-6 text-gray-400" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors mb-1.5">
                        <Upload className="w-3.5 h-3.5" />{t('uploadLogo') || 'আপলোড করুন'}
                      </button>
                      <p className="text-xs text-gray-400">PNG, JPG · সর্বোচ্চ 2MB</p>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </div>
                {/* Favicon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">{t('favicon') || 'ফেভিকন'}</label>
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {faviconPreview ? (
                        <div className="relative">
                          <img src={faviconPreview} alt="Favicon" className="w-20 h-20 object-contain rounded-xl border border-gray-200 bg-gray-50" />
                          {isUploadingFavicon && (
                            <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                              <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                          <button type="button" onClick={removeFavicon} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-sm">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                          {isUploadingFavicon ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Image className="w-6 h-6 text-gray-400" />}
                        </div>
                      )}
                    </div>
                    <div>
                      <button type="button" onClick={() => faviconInputRef.current?.click()} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors mb-1.5">
                        <Upload className="w-3.5 h-3.5" />{t('uploadFavicon') || 'আপলোড করুন'}
                      </button>
                      <p className="text-xs text-gray-400">PNG · 32×32px বা 64×64px</p>
                    </div>
                  </div>
                  <input ref={faviconInputRef} type="file" accept="image/*" className="hidden" onChange={handleFaviconChange} />
                </div>
              </div>
            </div>

            {/* ── CARD 2: Store Information ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Store className="w-4.5 h-4.5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{t('storeInformation') || 'স্টোর তথ্য'}</h2>
                  <p className="text-xs text-gray-500">{t('storeDetailsSubtitle') || 'নাম, মুদ্রা, ভাষা, সাবডোমেইন'}</p>
                </div>
              </div>
              <div className="space-y-4">
                {/* Store Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('storeName') || 'স্টোরের নাম'} <span className="text-red-500">*</span></label>
                  <input type="text" name="name" defaultValue={store.name} required minLength={2} className={inputCls} placeholder="e.g. Asha Fashion" />
                </div>
                {/* Currency + Language */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('currency') || 'মুদ্রা'}</label>
                    <select name="currency" defaultValue={store.currency || 'BDT'} className={inputCls}>
                      {currencies.map((c) => (
                        <option key={c.value} value={c.value}>{t(c.labelKey as Parameters<typeof t>[0]) || c.value}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('language') || 'ভাষা'}</label>
                    <select name="defaultLanguage" defaultValue={store.defaultLanguage || 'en'} className={inputCls}>
                      <option value="en">English</option>
                      <option value="bn">বাংলা</option>
                    </select>
                  </div>
                </div>
                {/* Subdomain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('subdomain') || 'সাবডোমেইন'}</label>
                  <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white">
                    <input
                      type="text"
                      name="subdomain"
                      defaultValue={store.subdomain}
                      className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none min-w-0"
                      placeholder="my-store"
                    />
                    <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm border-l border-gray-200 flex-shrink-0 font-medium">.ozzyl.com</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{t('subdomainHelp') || 'শুধুমাত্র ছোট হরফ, সংখ্যা এবং হাইফেন ব্যবহার করুন'}</p>
                </div>
                {/* Plan (read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('plan') || 'প্ল্যান'}</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-600 font-medium capitalize">{store.planType || 'free'}</div>
                    <a href="/app/billing" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap">{t('upgradePlan') || 'আপগ্রেড →'}</a>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CARD 3: Social Media ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-4.5 h-4.5 text-pink-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{t('socialMedia') || 'সোশ্যাল মিডিয়া'}</h2>
                  <p className="text-xs text-gray-500">{t('socialDesc') || 'আপনার সোশ্যাল মিডিয়া লিংক যোগ করুন'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourpage', defaultValue: store.social?.facebook },
                  { name: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourhandle', defaultValue: store.social?.instagram },
                  { name: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, placeholder: '8801XXXXXXXXX', defaultValue: store.social?.whatsapp },
                  { name: 'twitter', label: 'Twitter / X', icon: Twitter, placeholder: 'https://twitter.com/yourhandle', defaultValue: store.social?.twitter },
                  { name: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourchannel', defaultValue: store.social?.youtube },
                  { name: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/...', defaultValue: store.social?.linkedin },
                ].map(({ name, label, icon: Icon, placeholder, defaultValue }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white">
                      <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-400 flex-shrink-0">
                        <Icon className="w-4 h-4" />
                      </span>
                      <input type="text" name={name} defaultValue={defaultValue || ''} className="flex-1 px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none min-w-0" placeholder={placeholder} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── CARD 4: Business Info ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4.5 h-4.5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{t('businessInfo') || 'ব্যবসার তথ্য'}</h2>
                  <p className="text-xs text-gray-500">{t('businessInfoDesc') || 'ফোন, ইমেইল ও ঠিকানা'}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('phone') || 'ফোন'}</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white">
                      <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-400 flex-shrink-0"><Phone className="w-4 h-4" /></span>
                      <input type="tel" name="businessPhone" defaultValue={store.business?.phone || ''} className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none min-w-0" placeholder="+880 1X-XXXX-XXXX" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('email') || 'ইমেইল'}</label>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent bg-white">
                      <span className="flex items-center px-3 bg-gray-50 border-r border-gray-200 text-gray-400 flex-shrink-0"><Mail className="w-4 h-4" /></span>
                      <input type="email" name="businessEmail" defaultValue={store.business?.email || ''} className="flex-1 px-3 py-2.5 text-sm bg-white focus:outline-none min-w-0" placeholder="hello@yourstore.com" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('address') || 'ঠিকানা'}</label>
                  <textarea name="businessAddress" defaultValue={store.business?.address || ''} rows={3} className={inputCls + ' resize-none'} placeholder={t('enterAddress') || 'ঠিকানা লিখুন…'} />
                </div>
              </div>
            </div>

            {/* ── Mobile sticky save bar ── */}
            {mobileShowForm && (
              <div className="md:hidden sticky bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-lg -mx-4">
                <a href="/app/settings" className="flex-1 flex items-center justify-center py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  {t('cancel') || 'বাতিল'}
                </a>
                <button type="submit" disabled={isSubmitting} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isSubmitting ? (t('saving') || 'সংরক্ষণ…') : (t('saveChanges') || 'সংরক্ষণ করুন')}
                </button>
              </div>
            )}

            {/* ── Desktop sticky footer save bar ── */}
            <div className="hidden md:block sticky bottom-0 -mx-8 -mb-6 bg-white border-t border-gray-200 px-8 py-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">{t('saveHint') || 'পরিবর্তনগুলি সংরক্ষণ করতে ভুলবেন না'}</p>
                <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors">
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  {isSubmitting ? (t('saving') || 'সংরক্ষণ হচ্ছে…') : (t('saveChanges') || 'পরিবর্তন সংরক্ষণ করুন')}
                </button>
              </div>
            </div>

            {/* ── CARD 5: Danger Zone ── */}
            <div className="bg-white rounded-2xl shadow-sm border-2 border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-red-700">{t('dangerZone') || 'বিপদ অঞ্চল'}</h2>
                  <p className="text-xs text-red-500">{t('dangerZoneDesc') || 'এই কাজগুলি অপরিবর্তনীয়'}</p>
                </div>
              </div>
              <div className="flex items-center justify-between py-3 border-t border-red-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t('deleteStore') || 'স্টোর মুছুন'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t('deleteStoreDesc') || 'স্টোর এবং সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলুন'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors flex-shrink-0 ml-4"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {t('deleteStore') || 'মুছুন'}
                </button>
              </div>
            </div>

          </Form>
        </div>{/* end main content */}
      </div>{/* end two-column wrapper */}

      {/* ── MODALS ── */}
      <StoreDeleteWarningModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        storeName={store.name}
        dataCounts={dataCounts}
      />

      {showPreview && (
        <ThemePreview
          isOpen={showPreview}
          theme={selectedTheme}
          fontFamily={selectedFont}
          storeName={store.name}
          logo={store.logo}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
