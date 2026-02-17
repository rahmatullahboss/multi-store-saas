/**
 * Store Design Settings Page — Tabbed UI with Unified Backend
 *
 * Tabs: টেমপ্লেট | থিম | ব্যানার | Content | তথ্য
 * Backend: stores.storefront_settings (unified JSON)
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form, useSearchParams, useNavigation, useFetcher } from '@remix-run/react';
import { useState, useEffect, useRef } from 'react';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getUnifiedStorefrontSettings, saveUnifiedStorefrontSettingsWithCacheInvalidation } from '~/services/unified-storefront-settings.server';
import { MVP_STORE_TEMPLATES } from '~/templates/store-registry';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import { D1Cache } from '~/services/cache-layer.server';
import { invalidateStoreConfig as invalidateStoreConfigD1 } from '~/services/store-config.server';
import { createDb } from '~/lib/db.server';
import { useTranslation } from '~/contexts/LanguageContext';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import {
  Eye, Edit3, Palette, Image as ImageIcon, Type, Info,
  Layout, CheckCircle, Truck, Shield, RefreshCw, X,
  Upload, Loader2, Store, Globe, Phone, Mail, MapPin,
  Facebook, Instagram, MessageCircle, Plus, Trash2, ChevronUp, ChevronDown,
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

const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', desc: 'মডার্ন এবং ক্লিন' },
  { id: 'poppins', name: 'Poppins', desc: 'জ্যামিতিক এবং ফ্রেন্ডলি' },
  { id: 'roboto', name: 'Roboto', desc: 'ইন্ডাস্ট্রিয়াল এবং নির্ভরযোগ্য' },
  { id: 'hind-siliguri', name: 'Hind Siliguri (Bengali)', desc: 'বাংলার জন্য অপ্টিমাইজড' },
  { id: 'playfair', name: 'Playfair Display', desc: 'এলিগ্যান্ট এবং ক্লাসিক' },
  { id: 'montserrat', name: 'Montserrat', desc: 'স্টাইলিশ এবং ভার্সাটাইল' },
];

const TABS = [
  { id: 'template', label: 'টেমপ্লেট', icon: Layout },
  { id: 'theme', label: 'থিম', icon: Palette },
  { id: 'banner', label: 'ব্যানার', icon: ImageIcon },
  { id: 'content', label: 'Content', icon: Type },
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

  const settings = await getUnifiedStorefrontSettings(db, storeId, { enableFallback: true });

  return json({
    store,
    settings,
    availableThemes: MVP_STORE_TEMPLATES.map((t) => ({
      id: t.id, name: t.name, thumbnail: t.thumbnail, description: t.description,
      colors: t.theme ? { primary: t.theme.primary, accent: t.theme.accent } : null,
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

  try {
    const patch: Record<string, unknown> = {};

    if (intent === 'template') {
      const templateId = formData.get('templateId') as string;
      if (templateId) {
        patch.theme = { templateId };
        // Also update legacy store field
        let themeConfig: Record<string, unknown> = {};
        try { if (store.themeConfig) themeConfig = JSON.parse(store.themeConfig as string); } catch {}
        await db.update(stores).set({
          themeConfig: JSON.stringify({ ...themeConfig, storeTemplateId: templateId }),
        }).where(eq(stores.id, storeId));
      }
    } else if (intent === 'theme') {
      const primary = (formData.get('primaryColor') as string) || undefined;
      const accent = (formData.get('accentColor') as string) || undefined;
      const fontFamily = (formData.get('fontFamily') as string) || undefined;
      if (primary || accent) patch.theme = { ...(primary && { primary }), ...(accent && { accent }) };
      if (fontFamily) patch.typography = { fontFamily };
    } else if (intent === 'banner') {
      const mode = (formData.get('bannerMode') as 'single' | 'carousel') || 'single';
      const overlayOpacity = parseInt(formData.get('overlayOpacity') as string) || 40;
      const fallbackHeadline = (formData.get('fallbackHeadline') as string) || null;
      // Parse slides
      const slides: Array<Record<string, string | null>> = [];
      for (let i = 0; i < 6; i++) {
        const img = formData.get(`slide_${i}_imageUrl`) as string;
        if (img !== null && img !== undefined) {
          slides.push({
            imageUrl: img || null,
            heading: (formData.get(`slide_${i}_heading`) as string) || null,
            subheading: (formData.get(`slide_${i}_subheading`) as string) || null,
            ctaText: (formData.get(`slide_${i}_ctaText`) as string) || null,
            ctaLink: (formData.get(`slide_${i}_ctaLink`) as string) || null,
          });
        }
      }
      patch.heroBanner = { mode, overlayOpacity, slides, fallbackHeadline };
      // Announcement
      const annEnabled = formData.get('announcementEnabled') === 'on';
      const annText = (formData.get('announcementText') as string) || null;
      const annLink = (formData.get('announcementLink') as string) || null;
      patch.announcement = { enabled: annEnabled, text: annText, link: annLink };
    } else if (intent === 'content') {
      const badges: Array<Record<string, string>> = [];
      for (let i = 0; i < 3; i++) {
        badges.push({
          icon: (formData.get(`badge_${i}_icon`) as string) || 'truck',
          title: (formData.get(`badge_${i}_title`) as string) || '',
          description: (formData.get(`badge_${i}_description`) as string) || '',
        });
      }
      patch.trustBadges = { badges };
    } else if (intent === 'info') {
      const logo = (formData.get('logo') as string) || null;
      const tagline = (formData.get('tagline') as string) || null;
      const description = (formData.get('description') as string) || null;
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
      // Sync legacy store columns
      await db.update(stores).set({
        logo: logo || null,
        socialLinks: JSON.stringify({
          facebook: (formData.get('facebook') as string) || '',
          instagram: (formData.get('instagram') as string) || '',
          whatsapp: (formData.get('whatsapp') as string) || '',
        }),
        businessInfo: JSON.stringify({
          phone: (formData.get('businessPhone') as string) || '',
          email: (formData.get('businessEmail') as string) || '',
          address: (formData.get('businessAddress') as string) || '',
        }),
      }).where(eq(stores.id, storeId));
    }

    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db as any,
      { KV: context.cloudflare.env.STORE_CACHE },
      storeId,
      patch as any,
    );

    // Invalidate caches
    const kvNamespace = context.cloudflare.env.STORE_CACHE;
    if (kvNamespace) {
      const kvCache = new KVCache(kvNamespace);
      const subdomain = (store.subdomain as string) || '';
      const customDomain = (store.customDomain as string | null) || null;
      await Promise.all([
        kvCache.delete(`${CACHE_KEYS.STORE_CONFIG}${storeId}`),
        subdomain ? kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`) : Promise.resolve(),
        customDomain ? kvCache.delete(`${CACHE_KEYS.TENANT_DOMAIN}${customDomain}`) : Promise.resolve(),
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
  const isSaving = navigation.state === 'submitting';
  const { t } = useTranslation();

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">স্টোর ডিজাইন</h1>
          <p className="text-gray-500 text-sm">আপনার স্টোরের চেহারা এবং সেটিংস কাস্টমাইজ করুন</p>
        </div>
        <div className="flex gap-2">
          <a href={storeUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            <Eye className="w-4 h-4" /> লাইভ স্টোর দেখুন
          </a>
          <a href="/app/store-live-editor" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            <Edit3 className="w-4 h-4" /> লাইভ এডিটর খুলুন
          </a>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" /> সেটিংস সেভ হয়েছে!
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-1 -mb-px overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                  isActive ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}>
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'template' && <TemplateTab settings={settings} themes={availableThemes} isSaving={isSaving} />}
        {activeTab === 'theme' && <ThemeTab settings={settings} isSaving={isSaving} />}
        {activeTab === 'banner' && <BannerTab settings={settings} isSaving={isSaving} />}
        {activeTab === 'content' && <ContentTab settings={settings} isSaving={isSaving} />}
        {activeTab === 'info' && <InfoTab settings={settings} store={store} isSaving={isSaving} />}
      </div>
    </div>
  );
}

// ============================================================================
// TEMPLATE TAB
// ============================================================================
function TemplateTab({ settings, themes, isSaving }: {
  settings: UnifiedStorefrontSettingsV1;
  themes: Array<{ id: string; name: string; thumbnail: string; description: string; colors: { primary: string; accent: string } | null }>;
  isSaving: boolean;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {themes.map((theme) => {
        const isActive = settings.theme.templateId === theme.id;
        return (
          <div key={theme.id} className={`relative rounded-xl border-2 overflow-hidden transition-all ${isActive ? 'border-purple-500 shadow-lg' : 'border-gray-200 hover:border-gray-300'}`}>
            {isActive && (
              <div className="absolute top-3 right-3 z-10 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> বর্তমানে সক্রিয়
              </div>
            )}
            <div className="aspect-[4/3] bg-gray-900 relative overflow-hidden">
              <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover opacity-80" />
              {theme.colors && (
                <div className="absolute top-3 left-3 flex gap-1">
                  <div className="w-5 h-5 rounded-full border-2 border-white/50" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-5 h-5 rounded-full border-2 border-white/50" style={{ backgroundColor: theme.colors.accent }} />
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">{theme.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{theme.description}</p>
              {theme.colors && (
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-xs text-gray-400">কালার:</span>
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.colors.primary }} />
                  <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: theme.colors.accent }} />
                </div>
              )}
              <Form method="post" className="mt-3">
                <input type="hidden" name="intent" value="template" />
                <input type="hidden" name="templateId" value={theme.id} />
                <button type="submit" disabled={isActive || isSaving}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-gray-100 text-emerald-600 cursor-default' : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}>
                  {isActive ? 'বর্তমানে সক্রিয়' : 'টেমপ্লেট এপ্লাই করুন'}
                </button>
              </Form>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// THEME TAB
// ============================================================================
function ThemeTab({ settings, isSaving }: { settings: UnifiedStorefrontSettingsV1; isSaving: boolean }) {
  const [primary, setPrimary] = useState(settings.theme.primary);
  const [accent, setAccent] = useState(settings.theme.accent);
  const [font, setFont] = useState(settings.typography?.fontFamily || 'inter');

  return (
    <Form method="post" className="space-y-8">
      <input type="hidden" name="intent" value="theme" />

      {/* Color Theme */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">কালার থিম</h2>
            <p className="text-sm text-gray-500">আপনার ব্র্যান্ডের সাথে মেলে এমন রং বেছে নিন।</p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">কুইক প্রিসেটস</h3>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button key={preset.name} type="button"
                onClick={() => { setPrimary(preset.primary); setAccent(preset.accent); }}
                className={`flex items-center gap-2 px-3 py-2 rounded-full border-2 text-sm transition ${
                  primary === preset.primary && accent === preset.accent ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primary }} />
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.accent }} />
                <span>{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-1">প্রাথমিক রং (Primary Color)</h4>
            <p className="text-xs text-gray-500 mb-3">বাটন, হেডার এবং অ্যাকসেন্টের জন্য ব্যবহৃত হয়</p>
            <div className="flex items-center gap-3">
              <input type="color" name="primaryColor" value={primary} onChange={(e) => setPrimary(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer" />
              <input type="text" value={primary} onChange={(e) => setPrimary(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-xl">
            <h4 className="font-medium text-gray-900 mb-1">অ্যাকসেন্ট কালার</h4>
            <p className="text-xs text-gray-500 mb-3">হাইলাইট এবং সেকেন্ডারি এলিমেন্টের জন্য ব্যবহৃত হয়</p>
            <div className="flex items-center gap-3">
              <input type="color" name="accentColor" value={accent} onChange={(e) => setAccent(e.target.value)}
                className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer" />
              <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono" />
            </div>
          </div>
        </div>
      </section>

      {/* Font Family */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">ফন্ট ফ্যামিলি</h2>
            <p className="text-sm text-gray-500">আপনার স্টোরের জন্য সেরা ফন্টটি বেছে নিন</p>
          </div>
        </div>
        <input type="hidden" name="fontFamily" value={font} />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {FONT_OPTIONS.map((f) => (
            <button key={f.id} type="button" onClick={() => setFont(f.id)}
              className={`p-4 rounded-xl border-2 text-left transition ${
                font === f.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}>
              <div className="font-semibold text-gray-900">{f.name}</div>
              <div className="text-xs text-gray-500 mt-1">{f.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Preview */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">প্রিভিউ</h3>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: primary }}>
            প্রাইমারি বাটন
          </button>
          <button type="button" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: accent }}>
            অ্যাকসেন্ট বাটন
          </button>
          <div className="w-10 h-10 rounded-full" style={{ backgroundColor: primary }} />
        </div>
      </section>

      <div className="flex justify-center">
        <button type="submit" disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />}
          থিম সেভ করুন
        </button>
      </div>
    </Form>
  );
}

// ============================================================================
// BANNER TAB
// ============================================================================
function BannerTab({ settings, isSaving }: { settings: UnifiedStorefrontSettingsV1; isSaving: boolean }) {
  const heroBanner = settings.heroBanner || { mode: 'single', overlayOpacity: 40, slides: [], fallbackHeadline: null };
  const announcement = settings.announcement;
  const [mode, setMode] = useState<'single' | 'carousel'>(heroBanner.mode as 'single' | 'carousel');
  const [opacity, setOpacity] = useState(heroBanner.overlayOpacity);
  const [slides, setSlides] = useState(heroBanner.slides.length > 0 ? heroBanner.slides : [{ imageUrl: null, heading: null, subheading: null, ctaText: null, ctaLink: null }]);
  const [headline, setHeadline] = useState(heroBanner.fallbackHeadline || '');

  const addSlide = () => {
    if (slides.length < 6) setSlides([...slides, { imageUrl: null, heading: null, subheading: null, ctaText: null, ctaLink: null }]);
  };
  const removeSlide = (idx: number) => {
    if (slides.length > 1) setSlides(slides.filter((_, i) => i !== idx));
  };

  return (
    <Form method="post" className="space-y-8">
      <input type="hidden" name="intent" value="banner" />

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
            <button key={m} type="button" onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${mode === m ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
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
          <input type="range" name="overlayOpacity" min="0" max="100" value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full accent-purple-600" />
          <p className="text-xs text-gray-500 mt-1">Adjust the darkness of the overlay on your banner images. 0% is fully transparent, 100% is fully black.</p>
        </div>

        {/* Slides */}
        {slides.map((slide, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">Slide {idx + 1}</span>
              <div className="flex gap-1">
                {idx > 0 && <button type="button" onClick={() => { const s = [...slides]; [s[idx-1], s[idx]] = [s[idx], s[idx-1]]; setSlides(s); }}><ChevronUp className="w-4 h-4" /></button>}
                {idx < slides.length - 1 && <button type="button" onClick={() => { const s = [...slides]; [s[idx], s[idx+1]] = [s[idx+1], s[idx]]; setSlides(s); }}><ChevronDown className="w-4 h-4" /></button>}
                {slides.length > 1 && <button type="button" onClick={() => removeSlide(idx)} className="text-red-500"><Trash2 className="w-4 h-4" /></button>}
              </div>
            </div>
            <input type="hidden" name={`slide_${idx}_imageUrl`} value={slide.imageUrl || ''} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" name={`slide_${idx}_heading`} defaultValue={slide.heading || ''} placeholder="Heading (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="text" name={`slide_${idx}_subheading`} defaultValue={slide.subheading || ''} placeholder="Subheading (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="text" name={`slide_${idx}_ctaText`} defaultValue={slide.ctaText || ''} placeholder="CTA text (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <input type="url" name={`slide_${idx}_ctaLink`} defaultValue={slide.ctaLink || ''} placeholder="https://example.com/products" className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
        ))}

        {slides.length < 6 && (
          <button type="button" onClick={addSlide} className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Slide
          </button>
        )}
        <p className="text-xs text-gray-500 mt-2">Use up to 6 slides. First slide is used as fallback banner.</p>

        {/* Fallback Headline */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">ব্যানার হেডলাইন (fallback)</label>
          <input type="text" name="fallbackHeadline" value={headline} onChange={(e) => setHeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
      </section>

      {/* Announcement Bar */}
      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">📢</div>
          <div>
            <h2 className="text-lg font-semibold">আনাউন্সমেন্ট বার</h2>
            <p className="text-sm text-gray-500">আপনার স্টোরের একদম উপরে দেখাবে।</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">আনাউন্সমেন্ট টেক্সট</label>
            <input type="text" name="announcementText" defaultValue={announcement?.text || ''}
              placeholder="🎉 ১০০০ টাকার বেশি অর্ডারে ফ্রি শিপিং!" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">লিংক (ঐচ্ছিক)</label>
            <input type="url" name="announcementLink" defaultValue={announcement?.link || ''}
              placeholder="https://yourstore.com/sale" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" name="announcementEnabled" id="announcementEnabled" defaultChecked={announcement?.enabled}
              className="h-4 w-4 text-purple-600 rounded" />
            <label htmlFor="announcementEnabled" className="text-sm text-gray-700">আনাউন্সমেন্ট বার দেখান</label>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button type="submit" disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
          🖼 ব্যানার সেভ করুন
        </button>
      </div>
    </Form>
  );
}

// ============================================================================
// CONTENT TAB
// ============================================================================
function ContentTab({ settings, isSaving }: { settings: UnifiedStorefrontSettingsV1; isSaving: boolean }) {
  const defaultBadges = [
    { icon: 'truck' as const, title: 'দ্রুত ডেলিভারি', description: 'ঢাকায় ১-২ দিনে' },
    { icon: 'shield' as const, title: 'নিরাপদ পেমেন্ট', description: '১০০% সিকিউর' },
    { icon: 'refresh' as const, title: 'ইজি রিটার্ন', description: '৭ দিনের মধ্যে' },
  ];
  const badges = settings.trustBadges?.badges || defaultBadges;
  const iconLabels = { truck: 'Truck Icon', shield: 'Shield Icon', refresh: 'Return Icon' };
  const IconMap = { truck: Truck, shield: Shield, refresh: RefreshCw };

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="content" />

      <section className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold">Store Content</h2>
        </div>

        <h3 className="font-medium text-gray-900 mb-4">Trust Badges (Fast Delivery, Secure Payment, etc.)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {badges.map((badge, idx) => {
            const Icon = IconMap[badge.icon as keyof typeof IconMap] || Truck;
            return (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  Badge {idx + 1} ({iconLabels[badge.icon as keyof typeof iconLabels] || 'Truck Icon'})
                </div>
                <input type="hidden" name={`badge_${idx}_icon`} value={badge.icon} />
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Title</label>
                    <input type="text" name={`badge_${idx}_title`} defaultValue={badge.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Description</label>
                    <input type="text" name={`badge_${idx}_description`} defaultValue={badge.description}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center">
        <button type="submit" disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          🖊 পরিবর্তনগুলো সেভ করুন
        </button>
      </div>
    </Form>
  );
}

// ============================================================================
// INFO TAB
// ============================================================================
function InfoTab({ settings, store, isSaving }: {
  settings: UnifiedStorefrontSettingsV1; store: any; isSaving: boolean;
}) {
  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>(settings.branding?.logo || store.logo || '');
  const [logoPreview, setLogoPreview] = useState<string>(settings.branding?.logo || store.logo || '');
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
      const compressed = await compressImage(file, { maxWidth: 500, maxHeight: 500, quality: 0.85, format });
      fileToUpload = new File([compressed], `logo.${format}`, { type: `image/${format}` });
    } catch {}
    const fd = new FormData();
    fd.append('file', fileToUpload);
    fd.append('folder', 'logos');
    logoFetcher.submit(fd, { method: 'post', action: '/api/upload-image', encType: 'multipart/form-data' });
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
                <img src={logoPreview} alt="Logo" className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50" />
                {isUploading && <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>}
                <button type="button" onClick={removeLogo} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
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
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              <Upload className="w-4 h-4" /> {isUploading ? 'আপলোড হচ্ছে...' : 'আপলোড'}
            </button>
            <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ: 2MB টাইপ: 200x200 পিক্সেল বা তার বেশি</p>
          </div>
          <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleLogoChange} className="hidden" />
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
            <p className="text-sm text-gray-500">আপনার স্টোরের জন্য ট্যাগলাইন এবং বিবরণ দেওয়া করুন। এগুলো হেডার, ফুটার এবং SEO তে দেখাবে।</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ট্যাগলাইন / স্লোগান</label>
            <input type="text" name="tagline" defaultValue={branding.tagline || ''} maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <p className="text-xs text-gray-500 mt-1">সর্বোচ্চ ২০০ অক্ষর</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">স্টোরের বিবরণ</label>
            <textarea name="description" defaultValue={branding.description || ''} rows={3} maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1"><Phone className="w-4 h-4 inline mr-1" />ফোন নম্বর</label>
            <input type="tel" name="businessPhone" defaultValue={business.phone || ''}
              placeholder="01739416661" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Mail className="w-4 h-4 inline mr-1" />ইমেইল ঠিকানা</label>
            <input type="email" name="businessEmail" defaultValue={business.email || ''}
              placeholder="contact@ozzyl.com" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><MapPin className="w-4 h-4 inline mr-1" />ঠিকানা</label>
            <input type="text" name="businessAddress" defaultValue={business.address || ''}
              placeholder="dkp road, barguna" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
            <label className="block text-sm font-medium text-gray-700 mb-1"><Facebook className="w-4 h-4 inline mr-1 text-blue-600" />ফেসবুক ইউআরএল</label>
            <input type="url" name="facebook" defaultValue={social.facebook || ''}
              placeholder="https://facebook.com/yourpage" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Instagram className="w-4 h-4 inline mr-1 text-pink-600" />ইন্সটাগ্রাম ইউআরএল</label>
            <input type="url" name="instagram" defaultValue={social.instagram || ''}
              placeholder="https://instagram.com/yourprofile" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><MessageCircle className="w-4 h-4 inline mr-1 text-green-600" />হোয়াটসঅ্যাপ নম্বর</label>
            <input type="tel" name="whatsapp" defaultValue={social.whatsapp || ''}
              placeholder="01739416661" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <p className="text-xs text-gray-500 mt-1">দেশের কোডসহ দিন</p>
          </div>
        </div>
      </section>

      <div className="flex justify-center">
        <button type="submit" disabled={isSaving}
          className="px-8 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50 flex items-center gap-2">
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          🏪 স্টোর তথ্য সেভ করুন
        </button>
      </div>
    </Form>
  );
}
