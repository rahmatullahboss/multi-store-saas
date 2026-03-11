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
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  getUnifiedStorefrontSettings,
  saveUnifiedStorefrontSettingsWithCacheInvalidation,
} from '~/services/unified-storefront-settings.server';
import {
  MVP_STORE_TEMPLATES,
  STORE_TEMPLATE_THEMES,
  MVP_THEME_IDS,
  type StoreTemplateDefinition,
} from '~/templates/store-registry';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
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
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const store = storeResult[0];
  if (!store) throw new Response('Store not found', { status: 404 });

  const settings = await getUnifiedStorefrontSettings(db, storeId, {
    env: context.cloudflare.env,
  });

  // Active production themes only
  const isPremiumPlan = false;

  return json({
    store,
    settings,
    isPremiumPlan,
    availableThemes: MVP_STORE_TEMPLATES.map((t: StoreTemplateDefinition) => ({
      id: t.id,
      name: t.name,
      thumbnail: t.thumbnail,
      description: t.description,
      colors: t.theme ? { primary: t.theme.primary, accent: t.theme.accent } : null,
      // Only MVP active themes are selectable in production
      isActive: isPremiumPlan || MVP_THEME_IDS.includes(t.id as any),
    })),
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });
  const db = drizzle(context.cloudflare.env.DB);

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
        const safeTemplateId = MVP_THEME_IDS.includes(templateId as any)
          ? templateId
          : 'starter-store';

        // Auto-set theme colors based on selected template
        const templateTheme = STORE_TEMPLATE_THEMES[safeTemplateId];

        // Update unified settings with template and auto-set colors
        patch.theme = {
          templateId: safeTemplateId,
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
      const trustBadgesEnabled = formData.get('trustBadgesEnabled') === 'on';
      patch.trustBadges = { enabled: trustBadgesEnabled, badges };
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
      console.log(
        JSON.stringify({
          level: 'info',
          event: 'banner_saved',
          storeId,
          slideCount: bannerPatch?.slides?.length ?? 0,
          bannerMode: bannerPatch?.mode ?? 'unknown',
          hasFallbackHeadline: Boolean(
            (patch.heroBanner as { fallbackHeadline?: unknown } | undefined)?.fallbackHeadline
          ),
          ts: Date.now(),
        })
      );
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

    // Note: KV cache already invalidated above
    // Settings are saved via saveUnifiedStorefrontSettings in individual intent handlers

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
  const submittingIntent =
    navigation.state === 'submitting'
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
    <div className="flex flex-col min-h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 pb-0">
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
      <div className="bg-white border-b border-gray-200 sticky top-[57px] z-20 rounded-t-xl">
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
      <div className="flex-1 px-4 md:px-6 xl:px-8 py-6 bg-white rounded-b-xl">
        {activeTab === 'template' && (
          <TemplateTab
            settings={settings}
            themes={availableThemes}
            isSaving={isSaving('template')}
          />
        )}
        {activeTab === 'theme' && <ThemeTab settings={settings} isSaving={isSaving('theme')} />}
        {activeTab === 'banner' && <BannerTab settings={settings} isSaving={isSaving('banner')} />}
        {activeTab === 'content' && (
          <ContentTab settings={settings} isSaving={isSaving('content')} />
        )}
        {activeTab === 'info' && (
          <InfoTab settings={settings} store={store} isSaving={isSaving('info')} />
        )}
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
          return (
            <div
              key={theme.id}
              className={`group relative rounded-2xl border-2 overflow-hidden transition-all duration-200 bg-white ${
                isActive
                  ? 'border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5'
              }`}
            >
              {/* Active badge */}
              {isActive && (
                <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-medium shadow-sm">
                  <CheckCircle className="w-3 h-3" /> সক্রিয়
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
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
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
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          দ্রুত প্রিসেট
        </p>
        <div className="flex flex-wrap gap-2">
          {COLOR_PRESETS.map((preset) => {
            const isSelected = primary === preset.primary && accent === preset.accent;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  setPrimary(preset.primary);
                  setAccent(preset.accent);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${preset.primary} 50%, ${preset.accent} 50%)`,
                  }}
                />
                {preset.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Preview Strip */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          লাইভ প্রিভিউ
        </p>
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
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Palette className="w-4 h-4" />
          )}
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
function BannerTab({ settings }: { settings: UnifiedStorefrontSettingsV1; isSaving: boolean }) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [annEnabled, annLink, annText, headline, mode, opacity]
    // bannerFetcher intentionally excluded — it's a new ref on every render and causes infinite loops
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
    <bannerFetcher.Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="banner" />

      {/* Alerts */}
      {bannerFetcher.data?.success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="w-4 h-4 flex-shrink-0" /> ব্যানার সেভ হয়েছে! স্টোর রিফ্রেশ করুন।
        </div>
      )}
      {bannerFetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
          ⚠️ {bannerFetcher.data.error}
        </div>
      )}

      {/* ── Hero Banner Section ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-rose-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">হিরো ব্যানার</h2>
              <p className="text-xs text-gray-400">স্টোরের মেইন ব্যানার ইমেজ ও স্লাইডার</p>
            </div>
          </div>
          {/* Mode toggle pills */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['single', 'carousel'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  mode === m
                    ? 'bg-white text-indigo-600 shadow-sm font-semibold'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {m === 'single' ? 'Single' : `Carousel (${slides.length}/6)`}
              </button>
            ))}
          </div>
        </div>
        <input type="hidden" name="bannerMode" value={mode} />

        <div className="p-6 space-y-5">
          {/* Opacity slider */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">ওভারলে অপ্যাসিটি</span>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg">
                {opacity}%
              </span>
            </div>
            <div className="relative">
              <div className="w-full h-2 rounded-full bg-gradient-to-r from-gray-200 to-gray-800 mb-1" />
              <input
                type="range"
                name="overlayOpacity"
                min="0"
                max="100"
                value={opacity}
                onChange={(e) => setOpacity(parseInt(e.target.value))}
                className="w-full accent-indigo-600 -mt-1"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              ০% = স্বচ্ছ, ১০০% = সম্পূর্ণ কালো — ব্যানারের উপর টেক্সট পড়তে সুবিধার জন্য সেট করুন।
            </p>
          </div>

          {/* Slides */}
          <div className="space-y-4">
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
          </div>

          {slides.length < 6 && (
            <button
              type="button"
              onClick={addSlide}
              className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 border-2 border-dashed border-indigo-200 rounded-xl w-full justify-center hover:bg-indigo-50 transition"
            >
              <Plus className="w-4 h-4" /> স্লাইড যোগ করুন
            </button>
          )}

          {/* Fallback Headline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ফলব্যাক হেডলাইন
              <span className="ml-2 text-xs text-gray-400 font-normal">(ইমেজ না থাকলে দেখাবে)</span>
            </label>
            <input
              type="text"
              name="fallbackHeadline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="আমাদের সেরা কালেকশন দেখুন"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </section>

      {/* ── Announcement Bar Section ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-base">
              📢
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">আনাউন্সমেন্ট বার</h2>
              <p className="text-xs text-gray-400">স্টোরের একদম উপরে দেখাবে</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-medium text-gray-500">
              {annEnabled ? 'চালু' : 'বন্ধ'}
            </span>
            <button
              type="button"
              onClick={() => setAnnEnabled((v) => !v)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${annEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              style={{ height: '22px', width: '40px' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform"
                style={{ transform: annEnabled ? 'translateX(18px)' : 'translateX(0)' }}
              />
            </button>
          </label>
        </div>
        <input type="hidden" name="announcementEnabled" value={annEnabled ? 'on' : 'off'} />

        {/* Live preview */}
        {annEnabled && annText && (
          <div className="mx-6 mt-4 rounded-xl overflow-hidden border border-amber-200">
            <div className="bg-amber-400 text-amber-900 text-xs font-medium text-center py-2 px-4">
              {annText}
              {annLink && <span className="ml-2 underline opacity-70">আরও দেখুন →</span>}
            </div>
            <div className="bg-amber-50 text-center text-xs text-amber-600 py-1 px-2">
              ↑ স্টোরে এভাবে দেখাবে
            </div>
          </div>
        )}

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              আনাউন্সমেন্ট টেক্সট
            </label>
            <input
              type="text"
              name="announcementText"
              value={annText}
              onChange={(e) => setAnnText(e.target.value)}
              placeholder="🎉 ১০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং!"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              লিংক <span className="text-gray-400 font-normal">(ঐচ্ছিক)</span>
            </label>
            <input
              type="text"
              name="announcementLink"
              value={annLink}
              onChange={(e) => setAnnLink(e.target.value)}
              placeholder="https://yourstore.com/sale"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {(isSaving || isAnySlideUploading) && (
          <span className="text-xs text-gray-400">সেভ হচ্ছে...</span>
        )}
        <button
          type="submit"
          disabled={isSaving || isAnySlideUploading}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm text-sm"
        >
          {isSaving || isAnySlideUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          {isAnySlideUploading ? 'আপলোড হচ্ছে...' : 'ব্যানার সেভ করুন'}
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
        maxWidth: 2560, // Hero banners are full-width, allow higher res
        maxHeight: 1440,
        quality: 0.92, // High quality WebP — banners need to look sharp
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
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50">
      {/* Slide header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          স্লাইড {idx + 1}
        </span>
        <div className="flex gap-1">
          {idx > 0 && (
            <button
              type="button"
              onClick={() => onMove(idx, 'up')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              title="উপরে যান"
            >
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          {idx < totalSlides - 1 && (
            <button
              type="button"
              onClick={() => onMove(idx, 'down')}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition"
              title="নিচে যান"
            >
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
          {totalSlides > 1 && (
            <button
              type="button"
              onClick={() => onRemove(idx)}
              className="p-1.5 hover:bg-red-50 rounded-lg transition"
              title="মুছুন"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
            </button>
          )}
        </div>
      </div>

      <input type="hidden" name={`slide_${idx}_imageUrl`} value={slide.imageUrl || ''} />

      {/* Two-column body */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-0">
        {/* Image upload — left 2 cols */}
        <div className="md:col-span-2 p-4 border-b md:border-b-0 md:border-r border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">ব্যানার ইমেজ</p>
          {preview || slide.imageUrl ? (
            <div className="relative group rounded-xl overflow-hidden aspect-video">
              <img
                src={preview || slide.imageUrl || ''}
                alt={`Slide ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={isUploading || isDeleting}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video bg-white rounded-xl border-2 border-dashed border-gray-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-gray-300 mb-2" />
                  <span className="text-xs font-medium text-gray-400">ইমেজ আপলোড করুন</span>
                  <span className="text-xs text-gray-300 mt-0.5">1920×1080px</span>
                </>
              )}
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

        {/* Text fields — right 3 cols */}
        <div className="md:col-span-3 p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">হেডিং</label>
            <input
              type="text"
              name={`slide_${idx}_heading`}
              value={slide.heading || ''}
              onChange={(e) => onUpdate(idx, { heading: e.target.value })}
              placeholder="আমাদের নতুন কালেকশন"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">সাবহেডিং</label>
            <input
              type="text"
              name={`slide_${idx}_subheading`}
              value={slide.subheading || ''}
              onChange={(e) => onUpdate(idx, { subheading: e.target.value })}
              placeholder="সেরা দামে সেরা পণ্য"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                CTA বাটন টেক্সট
              </label>
              <input
                type="text"
                name={`slide_${idx}_ctaText`}
                value={slide.ctaText || ''}
                onChange={(e) => onUpdate(idx, { ctaText: e.target.value })}
                placeholder="এখনই কিনুন"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">CTA লিংক</label>
              <input
                type="text"
                name={`slide_${idx}_ctaLink`}
                value={slide.ctaLink || ''}
                onChange={(e) => onUpdate(idx, { ctaLink: e.target.value })}
                placeholder="/products"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white"
              />
            </div>
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
  // iconLabels removed — no longer displayed
  const IconMap = { truck: Truck, shield: Shield, refresh: RefreshCw };
  const trustBadgesEnabled = !!(settings.trustBadges as unknown as { enabled?: boolean })?.enabled;

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="content" />

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
              <Type className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">ট্রাস্ট ব্যাজ</h2>
              <p className="text-xs text-gray-400">
                দ্রুত ডেলিভারি, নিরাপদ পেমেন্ট ইত্যাদি ব্যাজ হোমপেজে দেখাবে
              </p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs font-medium text-gray-500">
              {trustBadgesEnabled ? 'চালু' : 'বন্ধ'}
            </span>
            <input
              type="hidden"
              name="trustBadgesEnabled"
              value={trustBadgesEnabled ? 'on' : 'off'}
            />
            <button
              type="button"
              onClick={(e) => {
                const hidden = e.currentTarget.previousElementSibling as HTMLInputElement;
                const isOn = hidden.value === 'on';
                hidden.value = isOn ? 'off' : 'on';
                e.currentTarget.classList.toggle('bg-indigo-600', !isOn);
                e.currentTarget.classList.toggle('bg-gray-200', isOn);
                (e.currentTarget.querySelector('span') as HTMLElement).style.transform = isOn
                  ? 'translateX(0)'
                  : 'translateX(18px)';
              }}
              className={`relative rounded-full transition-colors ${trustBadgesEnabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
              style={{ width: '40px', height: '22px' }}
            >
              <span
                className="absolute top-0.5 left-0.5 w-[18px] h-[18px] bg-white rounded-full shadow transition-transform"
                style={{ transform: trustBadgesEnabled ? 'translateX(18px)' : 'translateX(0)' }}
              />
            </button>
          </label>
        </div>

        {/* Live preview strip */}
        <div className="mx-6 mt-5 rounded-xl bg-gray-50 border border-gray-100 px-6 py-4">
          <p className="text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
            স্টোরে এভাবে দেখাবে
          </p>
          <div className="flex items-center justify-around">
            {badges.map((badge, idx) => {
              const Icon = IconMap[badge.icon as keyof typeof IconMap] || Truck;
              return (
                <div key={idx} className="flex flex-col items-center gap-1.5 text-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">
                    {badge.title || `Badge ${idx + 1}`}
                  </span>
                  <span className="text-xs text-gray-400">{badge.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badge editors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          {badges.map((badge, idx) => {
            const Icon = IconMap[badge.icon as keyof typeof IconMap] || Truck;
            return (
              <div key={idx} className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">Badge {idx + 1}</span>
                </div>
                <input type="hidden" name={`badge_${idx}_icon`} value={badge.icon} />
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">শিরোনাম</label>
                    <input
                      type="text"
                      name={`badge_${idx}_title`}
                      defaultValue={badge.title}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">বিবরণ</label>
                    <input
                      type="text"
                      name={`badge_${idx}_description`}
                      defaultValue={badge.description}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm text-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          পরিবর্তনগুলো সেভ করুন
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

      {/* ── Store Logo ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Store className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">স্টোর লোগো</h2>
            <p className="text-xs text-gray-400">হেডার ও ফেভিকনে ব্যবহৃত হবে</p>
          </div>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-5">
            {/* Logo preview */}
            <div className="relative flex-shrink-0">
              {logoPreview ? (
                <div className="relative group">
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-24 h-24 object-contain rounded-2xl border border-gray-200 bg-gray-50"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-lg flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <Store className="w-7 h-7 text-gray-300" />
                </div>
              )}
            </div>
            {/* Upload CTA */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                {isUploading ? 'আপলোড হচ্ছে...' : 'লোগো আপলোড করুন'}
              </button>
              <p className="text-xs text-gray-400">PNG, JPG বা WebP · সর্বোচ্চ 2MB</p>
              <p className="text-xs text-gray-400">প্রস্তাবিত: 200×200px বা তার বেশি</p>
            </div>
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

      {/* ── Store Branding ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Type className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">স্টোর ব্র্যান্ডিং</h2>
            <p className="text-xs text-gray-400">হেডার, ফুটার এবং SEO তে দেখাবে</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              ট্যাগলাইন / স্লোগান
            </label>
            <input
              type="text"
              name="tagline"
              defaultValue={branding.tagline || ''}
              maxLength={200}
              placeholder="সেরা দামে সেরা পণ্য!"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">সর্বোচ্চ ২০০ অক্ষর</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">স্টোরের বিবরণ</label>
            <textarea
              name="description"
              defaultValue={branding.description || ''}
              rows={3}
              maxLength={500}
              placeholder="আপনার স্টোর সম্পর্কে সংক্ষিপ্ত বিবরণ লিখুন..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 mt-1">SEO-র জন্য ১৫০–৫০০ অক্ষর আদর্শ</p>
          </div>
        </div>
      </section>

      {/* ── Business Info ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
            <Phone className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">ব্যবসায়ের তথ্য</h2>
            <p className="text-xs text-gray-400">যোগাযোগ তথ্য ফুটারে দেখাবে</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[
            {
              name: 'businessPhone',
              type: 'tel',
              label: 'ফোন নম্বর',
              placeholder: '01739416661',
              icon: Phone,
              color: 'text-orange-500 bg-orange-50',
            },
            {
              name: 'businessEmail',
              type: 'email',
              label: 'ইমেইল ঠিকানা',
              placeholder: 'contact@example.com',
              icon: Mail,
              color: 'text-blue-500 bg-blue-50',
            },
            {
              name: 'businessAddress',
              type: 'text',
              label: 'ঠিকানা',
              placeholder: 'ঢাকা, বাংলাদেশ',
              icon: MapPin,
              color: 'text-red-500 bg-red-50',
            },
          ].map(({ name, type, label, placeholder, icon: Icon, color }) => (
            <div key={name}>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">{label}</label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center ${color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <input
                  type={type}
                  name={name}
                  defaultValue={
                    name === 'businessPhone'
                      ? business.phone || ''
                      : name === 'businessEmail'
                        ? business.email || ''
                        : business.address || ''
                  }
                  placeholder={placeholder}
                  className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social Media ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
            <Instagram className="w-4 h-4 text-pink-500" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">সোশ্যাল মিডিয়া</h2>
            <p className="text-xs text-gray-400">স্টোরের ফুটারে লিংক দেখাবে</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {/* Facebook */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">ফেসবুক পেজ URL</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center bg-blue-600">
                <Facebook className="w-3.5 h-3.5 text-white" />
              </div>
              <input
                type="url"
                name="facebook"
                defaultValue={social.facebook || ''}
                placeholder="https://facebook.com/yourpage"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
          {/* Instagram */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              ইনস্টাগ্রাম প্রোফাইল URL
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                <Instagram className="w-3.5 h-3.5 text-white" />
              </div>
              <input
                type="url"
                name="instagram"
                defaultValue={social.instagram || ''}
                placeholder="https://instagram.com/yourprofile"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
          </div>
          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">
              হোয়াটসঅ্যাপ নম্বর
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center bg-green-500">
                <MessageCircle className="w-3.5 h-3.5 text-white" />
              </div>
              <input
                type="tel"
                name="whatsapp"
                defaultValue={social.whatsapp || ''}
                placeholder="01739416661"
                className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">দেশের কোড ছাড়া শুধু নম্বর দিন</p>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm text-sm"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          স্টোর তথ্য সেভ করুন
        </button>
      </div>
    </Form>
  );
}
