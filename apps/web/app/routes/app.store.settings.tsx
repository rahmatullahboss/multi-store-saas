/**
 * Store Design Settings Page — Tabbed UI with Unified Backend
 *
 * Tabs: টেমপ্লেট | থিম | ব্যানার | Content | তথ্য
 * Backend: stores.storefront_settings (unified JSON)
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import {
  useLoaderData,
  useActionData,
  Form,
  useSearchParams,
  useNavigation,
  useFetcher,
} from '@remix-run/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';
import {
  STORE_TEMPLATES as MVP_STORE_TEMPLATES,
  STORE_TEMPLATE_THEMES,
  MVP_THEME_IDS,
  type StoreTemplateDefinition,
} from '~/templates/store-registry';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import { D1Cache } from '~/services/cache-layer.server';
import { invalidateStoreConfig as invalidateStoreConfigD1 } from '~/services/store-config.server';
import { createDb } from '~/lib/db.server';

import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import {
  Eye,
  Palette,
  Image as ImageIcon,
  Type,
  Info,
  Layout,
  CheckCircle,
  Truck,
  Shield,
  RefreshCw,
  X,
  Upload,
  Loader2,
  Store,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import type { UnifiedStorefrontSettingsV1 } from '~/services/storefront-settings.schema';

// ============================================================================
// COLOR PRESETS
// ============================================================================
const COLOR_PRESETS = [
  { name: 'ইন্ডিগো', primary: '#4F46E5', accent: '#F59E0B' },
  { name: 'এমারেন্ড', primary: '#059669', accent: '#ec4899' },
  { name: 'রোজ', primary: '#e11d48', accent: '#8b5cf6' },
  { name: 'অ্যাম্বার', primary: '#d97706', accent: '#3b82f6' },
  { name: 'স্কাই', primary: '#0284c7', accent: '#f97316' },
  { name: 'স্লেট', primary: '#1e293b', accent: '#c9a961' },
];

const TABS = [
  { id: 'template', label: 'টেমপ্লেট', icon: Layout },
  { id: 'theme', label: 'থিম', icon: Palette },
  { id: 'banner', label: 'ব্যানার', icon: ImageIcon },
  { id: 'content', label: 'কন্টেন্ট', icon: Type },
  { id: 'info', label: 'তথ্য', icon: Info },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const store = storeResult[0];
  if (!store) throw new Response('Store not found', { status: 404 });

  const settings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  return json({
    store,
    settings,
    availableThemes: MVP_STORE_TEMPLATES.map((t: StoreTemplateDefinition) => ({
      id: t.id,
      name: t.name,
      thumbnail: t.thumbnail,
      description: t.description,
      colors: t.theme ? { primary: t.theme.primary, accent: t.theme.accent } : null,
      isActive: MVP_THEME_IDS.includes(t.id as any),
    })),
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) return json({ error: 'Store not found' }, { status: 404 });

  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const store = storeResult[0];
  if (!store) return json({ error: 'Store not found' }, { status: 404 });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  // Utility: validate hex color to prevent CSS injection
  const isValidHexColor = (color: string | null): boolean => {
    if (!color) return false;
    return /^#[0-9A-Fa-f]{3}([0-9A-Fa-f]{3})?$/.test(color);
  };
  // Utility: sanitize text input (strip HTML tags)
  const sanitizeText = (value: string | null, maxLen = 500): string | null => {
    if (!value) return null;
    return value.replace(/<[^>]*>/g, '').slice(0, maxLen) || null;
  };

  try {
    const patch: Record<string, unknown> = {};

    if (intent === 'template') {
      const templateId = formData.get('templateId') as string;
      if (templateId) {
        // Auto-set theme colors based on selected template
        const templateTheme = STORE_TEMPLATE_THEMES[templateId];

        // Update unified settings with template and auto-set colors
        patch.theme = {
          templateId,
          ...(templateTheme && {
            primary: templateTheme.primary,
            accent: templateTheme.accent,
          }),
        };
      }
    } else if (intent === 'theme') {
      const rawPrimary = formData.get('primaryColor') as string;
      const rawAccent = formData.get('accentColor') as string;
      const primary = isValidHexColor(rawPrimary) ? rawPrimary : undefined;
      const accent = isValidHexColor(rawAccent) ? rawAccent : undefined;
      const fontFamily = (formData.get('fontFamily') as string) || undefined;
      // Preserve existing templateId when only updating colors
      const existingSettings = await getUnifiedStorefrontSettings(db, storeId, {
        env: context.cloudflare.env,
      });
      const existingTemplateId = existingSettings.theme?.templateId;
      if (primary || accent)
        patch.theme = {
          ...(existingTemplateId && { templateId: existingTemplateId }),
          ...(primary && { primary }),
          ...(accent && { accent }),
        };
      if (fontFamily) patch.typography = { fontFamily };
    } else if (intent === 'banner') {
      const mode = (formData.get('bannerMode') as 'single' | 'carousel') || 'single';
      const rawOpacity = parseInt(formData.get('overlayOpacity') as string);
      const overlayOpacity = Number.isNaN(rawOpacity) ? 40 : rawOpacity;
      const fallbackHeadline = sanitizeText(formData.get('fallbackHeadline') as string, 200);
      // Parse slides
      const slides: Array<Record<string, string | null>> = [];
      for (let i = 0; i < 6; i++) {
        const img = formData.get(`slide_${i}_imageUrl`) as string;
        if (img !== null && img !== undefined) {
          slides.push({
            imageUrl: img || null,
            heading: sanitizeText(formData.get(`slide_${i}_heading`) as string, 200),
            subheading: sanitizeText(formData.get(`slide_${i}_subheading`) as string, 300),
            ctaText: sanitizeText(formData.get(`slide_${i}_ctaText`) as string, 100),
            ctaLink: (formData.get(`slide_${i}_ctaLink`) as string) || null,
          });
        }
      }
      patch.heroBanner = { mode, overlayOpacity, slides, fallbackHeadline };
      // Announcement
      const annEnabled = formData.get('announcementEnabled') === 'on';
      const annText = sanitizeText(formData.get('announcementText') as string, 300);
      const annLink = (formData.get('announcementLink') as string) || null;
      patch.announcement = { enabled: annEnabled, text: annText, link: annLink };
    } else if (intent === 'content') {
      const badges: Array<Record<string, string>> = [];
      for (let i = 0; i < 3; i++) {
        badges.push({
          icon: (formData.get(`badge_${i}_icon`) as string) || 'truck',
          title: sanitizeText(formData.get(`badge_${i}_title`) as string, 100) || '',
          description: sanitizeText(formData.get(`badge_${i}_description`) as string, 200) || '',
        });
      }
      patch.trustBadges = { badges };

      // Why Choose Us
      const whyChooseUs: Array<Record<string, string>> = [];
      const whyChooseIcons = ['✨', '⚡', '💬'];
      for (let i = 0; i < 3; i++) {
        whyChooseUs.push({
          icon: whyChooseIcons[i] || '✨',
          title: sanitizeText(formData.get(`whyChoose_${i}_title`) as string, 100) || '',
          description: sanitizeText(formData.get(`whyChoose_${i}_description`) as string, 200) || '',
        });
      }
      patch.whyChooseUs = whyChooseUs;
    } else if (intent === 'info') {
      const logo = (formData.get('logo') as string) || null;
      const tagline = sanitizeText(formData.get('tagline') as string, 200);
      const description = sanitizeText(formData.get('description') as string, 1000);
      patch.branding = { logo, tagline, description };
      patch.business = {
        phone: (formData.get('businessPhone') as string) || null,
        email: (formData.get('businessEmail') as string) || null,
        address: (formData.get('businessAddress') as string) || null,
      };
      patch.social = {
        facebook: (formData.get('facebook') as string) || null,
        instagram: (formData.get('instagram') as string) || null,
        whatsapp: (formData.get('whatsapp') as string) || null,
      };
      // Note: Legacy store columns are no longer updated (unified settings is single source of truth)
    }

    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db as any, // Drizzle DB type mismatch with service signature
      {
        KV: context.cloudflare.env.STORE_CACHE,
        STORE_CONFIG_SERVICE: (context.cloudflare.env as any).STORE_CONFIG_SERVICE,
      },
      storeId,
      patch as any
    );

    if (intent === 'banner') {
      const bannerPatch = patch.heroBanner as { mode?: string; slides?: unknown[] } | undefined;
      console.log(JSON.stringify({
        level: 'info',
        event: 'banner_saved',
        storeId,
        slideCount: bannerPatch?.slides?.length ?? 0,
        bannerMode: bannerPatch?.mode ?? 'unknown',
        hasFallbackHeadline: Boolean((patch.heroBanner as { fallbackHeadline?: unknown } | undefined)?.fallbackHeadline),
        ts: Date.now(),
      }));
    }

    // Invalidate caches
    const kvNamespace = context.cloudflare.env.STORE_CACHE;
    if (kvNamespace) {
      const kvCache = new KVCache(kvNamespace);
      const subdomain = (store.subdomain as string) || '';
      const customDomain = (store.customDomain as string | null) || null;
      await Promise.all([
        kvCache.delete(`${CACHE_KEYS.STORE_CONFIG}${storeId}`),
        subdomain
          ? kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`)
          : Promise.resolve(),
        customDomain
          ? kvCache.delete(`${CACHE_KEYS.TENANT_DOMAIN}${customDomain}`)
          : Promise.resolve(),
      ]);
    }
    await invalidateStoreConfigD1(new D1Cache(createDb(context.cloudflare.env.DB)), storeId);

    return json({ success: true, intent });
  } catch (error) {
    console.error('Store settings save error:', error);
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StoreDesignPage() {
  const { store, settings, availableThemes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  // Per-intent saving state to avoid disabling wrong tab buttons
  const submittingIntent = navigation.state === 'submitting'
    ? (navigation.formData?.get('intent') as string | null)
    : null;
  const isSaving = (intent: string) => submittingIntent === intent;

  const activeTab = (searchParams.get('tab') as TabId) || 'template';
  const setTab = (tab: TabId) => setSearchParams({ tab }, { preventScrollReset: true });

  const [showSuccess, setShowSuccess] = useState(false);
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const storeUrl = store.subdomain ? `https://${store.subdomain}.ozzyl.com` : '#';

  return (
    <div className="flex flex-col min-h-full">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">স্টোর ডিজাইন</h1>
          <p className="text-gray-500 text-sm">আপনার স্টোরের চেহারা এবং সেটিংস কাস্টমাইজ করুন</p>
        </div>
        <div className="flex gap-2">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Eye className="w-4 h-4" /> লাইভ স্টোর দেখুন
          </a>
        </div>
      </div>

      {/* ── Success toast (fixed bottom-right) ── */}
      {showSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-300">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm font-medium">সেটিংস সেভ হয়েছে!</span>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20">
        <nav className="flex overflow-x-auto scrollbar-none px-4 md:px-6 xl:px-8">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 px-4 md:px-6 xl:px-8 py-6">
        {activeTab === 'template' && (
          <TemplateTab settings={settings} themes={availableThemes} isSaving={isSaving('template')} />
        )}
        {activeTab === 'theme' && <ThemeTab settings={settings} isSaving={isSaving('theme')} />}
        {activeTab === 'banner' && <BannerTab settings={settings} isSaving={isSaving('banner')} />}
        {activeTab === 'content' && <ContentTab settings={settings} isSaving={isSaving('content')} />}
        {activeTab === 'info' && <InfoTab settings={settings} store={store} isSaving={isSaving('info')} />}
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE TAB
// ============================================================================
function TemplateTab({
  settings,
  themes,
  isSaving,
}: {
  settings: UnifiedStorefrontSettingsV1;
  themes: Array<{
    id: string;
    name: string;
    thumbnail: string;
    description: string;
    colors: { primary: string; accent: string } | null;
    isActive: boolean;
  }>;
  isSaving: boolean;
}) {
  return (
    <div>
      {/* Section header */}
      <div className="mb-6">
        <h2 className="text-base font-semibold text-gray-900">থিম সিলেক্ট করুন</h2>
        <p className="text-sm text-gray-500 mt-0.5">আপনার স্টোরের জন্য সেরা থিম বেছে নিন</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {themes.map((theme) => {
          const isActive = settings.theme.templateId === theme.id;
          const isPremium = !theme.isActive;
          return (
            <div
              key={theme.id}
              className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 bg-white ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200'
                  : isPremium
                  ? 'border-gray-200 opacity-80'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                  <CheckCircle className="w-3 h-3" /> সক্রিয়
                </div>
              )}
              {/* Premium badge */}
              {isPremium && (
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1 shadow">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  প্রিমিয়াম
                </div>
              )}

              {/* Preview image / gradient */}
              <div
                className="aspect-[16/10] relative overflow-hidden"
                style={{
                  background: theme.colors
                    ? `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.accent} 100%)`
                    : 'linear-gradient(135deg, #4F46E5 0%, #F59E0B 100%)',
                }}
              >
                {theme.thumbnail && (
                  <img
                    src={theme.thumbnail}
                    alt={theme.name}
                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                )}
                {/* Gradient overlay with name */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white font-semibold text-sm drop-shadow">{theme.name}</span>
                </div>
                {/* Color swatches */}
                {theme.colors && (
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.primary }}
                      title={`Primary: ${theme.colors.primary}`}
                    />
                    <div
                      className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: theme.colors.accent }}
                      title={`Accent: ${theme.colors.accent}`}
                    />
                  </div>
                )}
              </div>

              {/* Card footer */}
              <div className="p-4">
                <p className="text-xs text-gray-500 line-clamp-1 mb-3">{theme.description}</p>
                <Form method="post">
                  <input type="hidden" name="intent" value="template" />
                  <input type="hidden" name="templateId" value={theme.id} />
                  {isPremium ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <a
                          href={`/store-template-preview/${theme.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 transition"
                        >
                          <ExternalLink className="w-3 h-3" /> প্রিভিউ
                        </a>
                        <a
                          href="/app/billing"
                          className="flex-1 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-center gap-1 hover:opacity-90 transition"
                        >
                          আপগ্রেড
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <a
                        href={`/store-template-preview/${theme.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> প্রিভিউ
                      </a>
                      <button
                        type="submit"
                        disabled={isActive || isSaving}
                        className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                        }`}
                      >
                        {isSaving && !isActive ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                        ) : isActive ? (
                          '✓ সক্রিয়'
                        ) : (
                          'এপ্লাই করুন'
                        )}
                      </button>
                    </div>
                  )}
                </Form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// THEME TAB
// ============================================================================
function ThemeTab({
  settings,
  isSaving,
}: {
  settings: UnifiedStorefrontSettingsV1;
  isSaving: boolean;
}) {
  const [primary, setPrimary] = useState(settings.theme.primary);
  const [accent, setAccent] = useState(settings.theme.accent);

  return (
    <Form method="post" className="space-y-6 max-w-2xl">
      <input type="hidden" name="intent" value="theme" />

      {/* Section header */}
      <div>
        <h2 className="text-base font-semibold text-gray-900">কালার থিম</h2>
        <p className="text-sm text-gray-500 mt-0.5">আপনার ব্র্যান্ডের রং বেছে নিন</p>
      </div>

      {/* Quick Presets */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">দ্রুত প্রিসেট</p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = primary === preset.primary && accent === preset.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => { setPrimary(preset.primary); setAccent(preset.accent); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.accent} 50%)` }}
                />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">লাইভ প্রিভিউ</p>
        <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition"
            style={{ backgroundColor: primary }}
          >
            অর্ডার করুন
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition"
            style={{ backgroundColor: accent }}
          >
            কার্টে যোগ করুন
          </button>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: primary }}
          >
            নতুন
          </span>
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: accent }}
          >
            ৳৫০০ ছাড়
          </span>
          <a
            href="#"
            className="text-sm font-medium underline"
            style={{ color: primary }}
            onClick={(e) => e.preventDefault()}
          >
            আরও দেখুন →
          </a>
        </div>
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Primary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl shadow-inner border border-white/20 flex-shrink-0"
              style={{ backgroundColor: primary }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Primary Color</p>
              <p className="text-xs text-gray-400">বাটন, হেডার, লিঙ্ক</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="primaryColor"
              value={primary}
              onChange={(e) => setPrimary(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
            />
            <input
              type="text"
              value={primary}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setPrimary(v);
              }}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={7}
              placeholder="#4F46E5"
            />
          </div>
        </div>

        {/* Accent */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl shadow-inner border border-white/20 flex-shrink-0"
              style={{ backgroundColor: accent }}
            />
            <div>
              <p className="text-sm font-semibold text-gray-900">Accent Color</p>
              <p className="text-xs text-gray-400">হাইলাইট, ব্যাজ, CTA</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              name="accentColor"
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer flex-shrink-0 p-0.5"
            />
            <input
              type="text"
              value={accent}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setAccent(v);
              }}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={7}
              placeholder="#F59E0B"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm text-sm"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          রং সেভ করুন
        </button>
        <span className="text-xs text-gray-400">পরিবর্তন স্টোরে সাথে সাথে দেখাবে</span>
      </div>
    </Form>
  );
}

// ============================================================================
// BANNER TAB
// ============================================================================
function BannerTab({
  settings,
}: {
  settings: UnifiedStorefrontSettingsV1;
  isSaving: boolean;
}) {
  const bannerFetcher = useFetcher<{ success?: boolean; intent?: string; error?: string }>();
  const isSaving = bannerFetcher.state !== 'idle';
  const [uploadingSlides, setUploadingSlides] = useState<Record<number, boolean>>({});

  const heroBanner = settings.heroBanner || {
    mode: 'single',
    overlayOpacity: 40,
    slides: [],
    fallbackHeadline: null,
  };
  const announcement = settings.announcement;
  const [annText, setAnnText] = useState(announcement?.text || '');
  const [annLink, setAnnLink] = useState(announcement?.link || '');
  const [annEnabled, setAnnEnabled] = useState(announcement?.enabled || false);
  const [mode, setMode] = useState<'single' | 'carousel'>(heroBanner.mode as 'single' | 'carousel');
  const [opacity, setOpacity] = useState(heroBanner.overlayOpacity);
  // Ensure we have at least one slide structure
  const [slides, setSlides] = useState(
    heroBanner.slides.length > 0
      ? heroBanner.slides
      : [{ imageUrl: null, heading: null, subheading: null, ctaText: null, ctaLink: null }]
  );
  const [headline, setHeadline] = useState(heroBanner.fallbackHeadline || '');

  const submitBannerPatch = useCallback(
    (nextSlides: Slide[]) => {
      const fd = new FormData();
      fd.append('intent', 'banner');
      fd.append('bannerMode', mode);
      fd.append('overlayOpacity', String(opacity));
      fd.append('fallbackHeadline', headline);
      fd.append('announcementText', annText);
      fd.append('announcementLink', annLink);
      if (annEnabled) fd.append('announcementEnabled', 'on');

      nextSlides.forEach((slide, idx) => {
        fd.append(`slide_${idx}_imageUrl`, slide.imageUrl || '');
        fd.append(`slide_${idx}_heading`, slide.heading || '');
        fd.append(`slide_${idx}_subheading`, slide.subheading || '');
        fd.append(`slide_${idx}_ctaText`, slide.ctaText || '');
        fd.append(`slide_${idx}_ctaLink`, slide.ctaLink || '');
      });

      bannerFetcher.submit(fd, { method: 'post' });
    },
    [annEnabled, annLink, annText, bannerFetcher, headline, mode, opacity]
  );

  const addSlide = () => {
    if (slides.length < 6) {
      const nextSlides = [
        ...slides,
        { imageUrl: null, heading: null, subheading: null, ctaText: null, ctaLink: null },
      ];
      setSlides(nextSlides);
      // If there are multiple slides, default to carousel mode.
      if (mode === 'single' && nextSlides.length > 1) {
        setMode('carousel');
      }
    }
  };

  const removeSlide = (idx: number) => {
    if (slides.length > 1) {
      const nextSlides = slides.filter((_, i) => i !== idx);
      setSlides(nextSlides);
      submitBannerPatch(nextSlides);
    }
  };

  const updateSlide = (idx: number, updates: Partial<(typeof slides)[0]>) => {
    const newSlides = [...slides];
    newSlides[idx] = { ...newSlides[idx], ...updates };
    setSlides(newSlides);
  };

  const moveSlide = (idx: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    if (direction === 'up' && idx > 0) {
      [newSlides[idx - 1], newSlides[idx]] = [newSlides[idx], newSlides[idx - 1]];
    } else if (direction === 'down' && idx < newSlides.length - 1) {
      [newSlides[idx], newSlides[idx + 1]] = [newSlides[idx + 1], newSlides[idx]];
    }
    setSlides(newSlides);
  };

  const onSlideUploadStateChange = (idx: number, uploading: boolean) => {
    setUploadingSlides((prev) => {
      if (prev[idx] === uploading) return prev;
      return { ...prev, [idx]: uploading };
    });
  };

  const isAnySlideUploading = Object.values(uploadingSlides).some(Boolean);

  const handlePersistSlideImage = useCallback(
    (idx: number, imageUrl: string | null) => {
      setSlides((prevSlides) => {
        if (!prevSlides[idx]) return prevSlides;
        const nextSlides = [...prevSlides];
        nextSlides[idx] = { ...nextSlides[idx], imageUrl };
        submitBannerPatch(nextSlides);
        return nextSlides;
      });
    },
    [submitBannerPatch]
  );

  return (
    <bannerFetcher.Form method="post" className="space-y-8">
      <input type="hidden" name="intent" value="banner" />

      {/* Success message */}
      {bannerFetcher.data?.success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> ব্যানার সেভ হয়েছে! স্টোর রিফ্রেশ করুন।
        </div>
      )}
      {bannerFetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          ⚠️ {bannerFetcher.data.error}
        </div>
      )}

      {/* Hero Banner */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-pink-600" />
          </div>
          <h2 className="text-lg font-semibold">হিরো ব্যানার</h2>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-4">
          {(['single', 'carousel'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {m === 'single' ? 'Single Image' : `Carousel (${slides.length}/6)`}
            </button>
          ))}
        </div>
        <input type="hidden" name="bannerMode" value={mode} />

        {/* Overlay Opacity */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-1">
            <span>Hero Overlay Opacity</span>
            <span className="text-purple-600 font-medium">{opacity}%</span>
          </div>
          <input
            type="range"
            name="overlayOpacity"
            min="0"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full accent-purple-600"
          />
          <p className="text-xs text-gray-500 mt-1">
            Adjust the darkness of the overlay on your banner images. 0% is fully transparent, 100%
            is fully black.
          </p>
        </div>

        {/* Slides */}
        {slides.map((slide, idx) => (
          <BannerSlide
            key={idx}
            idx={idx}
            slide={slide}
            totalSlides={slides.length}
            onUpdate={updateSlide}
            onRemove={removeSlide}
            onMove={moveSlide}
            onUploadStateChange={onSlideUploadStateChange}
            onPersistSlideImage={handlePersistSlideImage}
          />
        ))}

        {slides.length < 6 && (
          <button
            type="button"
            onClick={addSlide}
            className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Use up to 6 slides. First slide is used as fallback banner.
        </p>

        {/* Fallback Headline */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ব্যানার হেডলাইন (fallback)
          </label>
          <input
            type="text"
            name="fallbackHeadline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </section>

      {/* Announcement Bar */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            📢
          </div>
          <div>
            <h2 className="text-lg font-semibold">আনাউন্সমেন্ট বার</h2>
            <p className="text-sm text-gray-500">আপনার স্টোরের একদম উপরে দেখাবে।</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              আনাউন্সমেন্ট টেক্সট
            </label>
            <input
              type="text"
              name="announcementText"
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              placeholder="🎉 ১০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং!"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">লিংক (ঐচ্ছিক)</label>
            <input
              type="text"
              name="announcementLink"
              value={annLink}
              onChange={(e) => setAnnLink(e.target.value)}
              placeholder="https://yourstore.com/sale"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="announcementEnabled"
              id="announcementEnabled"
              checked={annEnabled}
              onChange={(e) => setAnnEnabled(e.target.checked)}
              className="h-4 w-4 text-purple-600 rounded"
            />
            <label htmlFor="announcementEnabled" className="text-sm text-gray-700">
              আনাউন্সমেন্ট বার দেখান
            </label>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSaving || isAnySlideUploading}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving || isAnySlideUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          {isAnySlideUploading ? 'ইমেজ আপলোড হচ্ছে...' : '🖼 ব্যানার সেভ করুন'}
        </button>
      </div>
    </bannerFetcher.Form>
  );
}

interface Slide {
  imageUrl: string | null;
  heading: string | null;
  subheading: string | null;
  ctaText: string | null;
  ctaLink: string | null;
}

function BannerSlide({
  idx,
  slide,
  totalSlides,
  onUpdate,
  onRemove,
  onMove,
  onUploadStateChange,
  onPersistSlideImage,
}: {
  idx: number;
  slide: Slide;
  totalSlides: number;
  onUpdate: (idx: number, updates: Partial<Slide>) => void;
  onRemove: (idx: number) => void;
  onMove: (idx: number, direction: 'up' | 'down') => void;
  onUploadStateChange?: (idx: number, uploading: boolean) => void;
  onPersistSlideImage?: (idx: number, imageUrl: string | null) => void;
}) {
  const fetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (fetcher.state === 'submitting') {
      setIsUploading(true);
    } else if (fetcher.state === 'idle') {
      setIsUploading(false);
      if (fetcher.data?.success && fetcher.data.url) {
        onPersistSlideImage?.(idx, fetcher.data.url);
        setPreview(null);
      }
    }
  }, [fetcher.state, fetcher.data, idx, onPersistSlideImage]);

  useEffect(() => {
    onUploadStateChange?.(idx, isUploading);
  }, [idx, isUploading, onUploadStateChange]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressed = await compressImage(file, {
        maxWidth: 2560,  // Hero banners are full-width, allow higher res
        maxHeight: 1440,
        quality: 0.92,   // High quality WebP — banners need to look sharp
        format,
      });
      fileToUpload = new File([compressed], `banner_${idx}.${format}`, { type: `image/${format}` });
    } catch {
      /* ignore */
    }

    const fd = new FormData();
    fd.append('file', fileToUpload);
    fd.append('folder', 'banners');

    fetcher.submit(fd, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const handleRemoveImage = async () => {
    const existingUrl = slide.imageUrl;
    onPersistSlideImage?.(idx, null);
    setPreview(null);

    if (!existingUrl) return;

    try {
      setIsDeleting(true);
      const fd = new FormData();
      fd.append('imageUrl', existingUrl);
      await fetch('/api/delete-image', {
        method: 'POST',
        body: fd,
      });
    } catch {
      // Ignore delete failures here; settings save will still remove the reference.
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium">Slide {idx + 1}</span>
        <div className="flex gap-1">
          {idx > 0 && (
            <button
              type="button"
              onClick={() => onMove(idx, 'up')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
          {idx < totalSlides - 1 && (
            <button
              type="button"
              onClick={() => onMove(idx, 'down')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="text-red-500 p-1 hover:bg-red-50 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <input type="hidden" name={`slide_${idx}_imageUrl`} value={slide.imageUrl || ''} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name={`slide_${idx}_heading`}
          value={slide.heading || ''}
          onChange={(e) => onUpdate(idx, { heading: e.target.value })}
          placeholder="Heading (optional)"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          name={`slide_${idx}_subheading`}
          value={slide.subheading || ''}
          onChange={(e) => onUpdate(idx, { subheading: e.target.value })}
          placeholder="Subheading (optional)"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          name={`slide_${idx}_ctaText`}
          value={slide.ctaText || ''}
          onChange={(e) => onUpdate(idx, { ctaText: e.target.value })}
          placeholder="CTA text (optional)"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
        <input
          type="text"
          name={`slide_${idx}_ctaLink`}
          value={slide.ctaLink || ''}
          onChange={(e) => onUpdate(idx, { ctaLink: e.target.value })}
          placeholder="https://example.com/products (optional)"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        />
      </div>

      <div className="mt-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">ব্যানার ইমেজ</label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {preview || slide.imageUrl ? (
              <div className="relative">
                <img
                  src={preview || slide.imageUrl || ''}
                  alt={`Slide ${idx + 1}`}
                  className="w-32 h-20 object-cover rounded-lg border border-gray-200"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  disabled={isUploading || isDeleting}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-32 h-20 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition">
                <ImageIcon className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">আপলোড</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
          <div className="text-xs text-gray-500">
            <p>সাইজ: 1920x1080 পিক্সেল</p>
            <p>ফরম্যাট: JPG, PNG, WebP</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CONTENT TAB
// ============================================================================
function ContentTab({
  settings,
  isSaving,
}: {
  settings: UnifiedStorefrontSettingsV1;
  isSaving: boolean;
}) {
  const defaultBadges = [
    { icon: 'truck' as const, title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
    { icon: 'shield' as const, title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
    { icon: 'refresh' as const, title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
  ];

  const badges = settings.trustBadges?.badges || defaultBadges;
  const iconLabels = { truck: 'Truck Icon', shield: 'Shield Icon', refresh: 'Return Icon' };
  const IconMap = { truck: Truck, shield: Shield, refresh: RefreshCw };
  const whyChoose = settings.whyChooseUs;

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="content" />

      {/* Why Choose Us Section */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">কেন আমাদের নির্বাচন করবেন</h2>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          হোমপেজে "Why Choose Us" সেকশনের জন্য তিনটি ফিচার।
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {whyChoose.map(
            (item: { icon: string; title: string; description: string }, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">শিরোনাম</label>
                    <input
                      type="text"
                      name={`whyChoose_${idx}_title`}
                      defaultValue={item.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">বিবরণ</label>
                    <input
                      type="text"
                      name={`whyChoose_${idx}_description`}
                      defaultValue={item.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">ট্রাস্ট ব্যাজ</h2>
        </div>

        <h3 className="font-medium text-gray-900 mb-4">
          Trust Badges (দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট, ইত্যাদি)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map((badge, idx) => {
            const Icon = IconMap[badge.icon as keyof typeof IconMap] || Truck;
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  Badge {idx + 1} (
                  {iconLabels[badge.icon as keyof typeof iconLabels] || 'Truck Icon'})
                </div>
                <input type="hidden" name={`badge_${idx}_icon`} value={badge.icon} />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input
                      type="text"
                      name={`badge_${idx}_title`}
                      defaultValue={badge.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input
                      type="text"
                      name={`badge_${idx}_description`}
                      defaultValue={badge.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          🖊 পরিবর্তনগুলো সেভ করুন
        </button>
      </div>
    </Form>
  );
}

// ============================================================================
// INFO TAB
// ============================================================================
function InfoTab({
  settings,
  store,
  isSaving,
}: {
  settings: UnifiedStorefrontSettingsV1;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  store: any;
  isSaving: boolean;
}) {
  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>(settings.branding?.logo || store.logo || '');
  const [logoPreview, setLogoPreview] = useState<string>(
    settings.branding?.logo || store.logo || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = logoFetcher.state !== 'idle';

  useEffect(() => {
    if (logoFetcher.data?.success && logoFetcher.data?.url) {
      setLogoUrl(logoFetcher.data.url);
      setLogoPreview(logoFetcher.data.url);
    }
  }, [logoFetcher.data]);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    let fileToUpload: File | Blob = file;
    try {
      const format = getOptimalFormat();
      const compressed = await compressImage(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        format,
      });
      fileToUpload = new File([compressed], `logo.${format}`, { type: `image/${format}` });
    } catch {
      /* ignore compression error, use original file */
    }
    const fd = new FormData();
    fd.append('file', fileToUpload);
    fd.append('folder', 'logos');
    logoFetcher.submit(fd, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeLogo = () => {
    if (logoUrl) {
      const fd = new FormData();
      fd.append('imageUrl', logoUrl);
      fetch('/api/delete-image', { method: 'POST', body: fd }).catch(() => {});
    }
    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const branding = settings.branding || {};
  const business = settings.business || {};
  const social = settings.social || {};

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="info" />
      <input type="hidden" name="logo" value={logoUrl} />

      {/* Store Logo */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-lg font-semibold">স্টোর লোগো</h2>
        </div>
        <label className="block text-sm font-medium text-gray-700 mb-2">স্টোর লোগো</label>
        <div className="flex items-center gap-4">
          <div className="relative">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
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
              disabled={isUploading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              <Upload className="w-4 h-4" /> {isUploading ? 'আপলোড হচ্ছে...' : 'আপলোড'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              সর্বোচ্চ: 2MB টাইপ: 200x200 পিক্সেল বা তার বেশি
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleLogoChange}
            className="hidden"
          />
        </div>
      </section>

      {/* Store Branding */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">স্টোর ব্র্যান্ডিং</h2>
            <p className="text-sm text-gray-500">
              আপনার স্টোরের জন্য ট্যাগলাইন এবং বিবরণ দেওয়া করুন। এগুলো হেডার, ফুটার এবং SEO তে
              দেখাবে।
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ট্যাগলাইন / স্লোগান
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={branding.tagline || ''}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ২০০ অক্ষর</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্টোরের বিবরণ</label>
            <textarea
              name="description"
              defaultValue={branding.description || ''}
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">SEO এর জন্য ১৫০-৫০০ অক্ষর ভালো কাজ করে</p>
          </div>
        </div>
      </section>

      {/* Business Info */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-orange-600" />
          </div>
          <h2 className="text-lg font-semibold">ব্যবসায়ের তথ্য</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              ফোন নম্বর
            </label>
            <input
              type="tel"
              name="businessPhone"
              defaultValue={business.phone || ''}
              placeholder="01739416661"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              ইমেইল ঠিকানা
            </label>
            <input
              type="email"
              name="businessEmail"
              defaultValue={business.email || ''}
              placeholder="contact@ozzyl.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              ঠিকানা
            </label>
            <input
              type="text"
              name="businessAddress"
              defaultValue={business.address || ''}
              placeholder="dkp road, barguna"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </section>

      {/* Social Media */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Instagram className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">সোশ্যাল মিডিয়া লিংক</h2>
            <p className="text-sm text-gray-500">আপনার সোশ্যাল মিডিয়া লিংকগুলো দেওয়া করুন</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 inline mr-1 text-blue-600" />
              ফেসবুক ইউআরএল
            </label>
            <input
              type="url"
              name="facebook"
              defaultValue={social.facebook || ''}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Instagram className="w-4 h-4 inline mr-1 text-pink-600" />
              ইন্সটাগ্রাম ইউআরএল
            </label>
            <input
              type="url"
              name="instagram"
              defaultValue={social.instagram || ''}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="w-4 h-4 inline mr-1 text-green-600" />
              হোয়াটসঅ্যাপ নম্বর
            </label>
            <input
              type="tel"
              name="whatsapp"
              defaultValue={social.whatsapp || ''}
              placeholder="01739416661"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">দেশের কোডসহ দিন</p>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          🏪 স্টোর তথ্য সেভ করুন
        </button>
      </div>
    </Form>
  );
}
