/**
 * Unified Store Settings Page - MVP System
 *
 * Route: /app/store/settings
 *
 * Features:
 * - Tab-based navigation (URL-based, bookmarkable)
 * - General, Branding, Contact, Social, Delivery tabs
 * - Store status toggle and preview button
 * - Reuses existing UI components from app.store.settings.tsx and app.settings._index.tsx
 *
 * Tab Navigation:
 * - ?tab=general (default)
 * - ?tab=branding
 * - ?tab=contact
 * - ?tab=social
 * - ?tab=delivery
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import {
  Form,
  useLoaderData,
  useActionData,
  useNavigation,
  Link,
  useSearchParams,
} from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getMVPSettings, saveMVPSettings } from '~/services/mvp-settings.server';
import type { MVPSettingsWithTheme } from '~/config/mvp-theme-settings';
import { MVP_THEME_IDS, isValidMVPTheme, validateMVPSettings } from '~/config/mvp-theme-settings';
import { MVP_STORE_TEMPLATES } from '~/templates/store-registry';
import { getStoreId } from '~/services/auth.server';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';
import { parseSocialLinks, parseBusinessInfo, parseShippingConfig } from '@db/types';

// UI Components
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
  Youtube,
  ExternalLink,
  Eye,
  Copy,
  Check,
  ToggleRight,
  ToggleLeft,
  Palette,
  Settings,
  Users,
  Share2,
  AlertTriangle,
  Truck,
  Package,
} from 'lucide-react';
import { GlassCard } from '~/components/ui/GlassCard';

export const meta: MetaFunction = () => {
  return [{ title: 'Store Settings' }];
};

// ============================================================================
// TYPES
// ============================================================================

interface SocialLinks {
  facebook?: string;
  instagram?: string;
  whatsapp?: string;
  youtube?: string;
  tiktok?: string;
}

interface BusinessInfo {
  phone?: string;
  email?: string;
  address?: string;
}

interface ShippingConfig {
  deliveryCharge?: number;
  freeDeliveryAbove?: number | null;
}

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store data
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Parse theme config
  let themeConfig: { storeTemplateId?: string } = {};
  try {
    if (store.themeConfig) {
      themeConfig = JSON.parse(store.themeConfig as string);
    }
  } catch {
    // Ignore parse errors
  }

  const currentThemeId = themeConfig.storeTemplateId || 'starter-store';

  // Get MVP settings
  const mvpSettings = await getMVPSettings(db, store.id, currentThemeId);

  // Parse other configs
  const socialLinks = parseSocialLinks(store.socialLinks as string | null) || {
    facebook: '',
    instagram: '',
    whatsapp: '',
    youtube: '',
    tiktok: '',
  };

  const businessInfo = parseBusinessInfo(store.businessInfo as string | null) || {
    phone: '',
    email: '',
    address: '',
  };

  const shippingConfig = parseShippingConfig(store.shippingConfig as string | null) || {
    deliveryCharge: 60,
    freeDeliveryAbove: null,
  };

  // Get current tab from URL
  const url = new URL(request.url);
  const currentTab = url.searchParams.get('tab') || 'general';

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      isActive: store.storeEnabled ?? true,
      currency: store.currency || 'BDT',
      defaultLanguage: store.defaultLanguage || 'en',
      planType: store.planType || 'free',
    },
    mvpSettings,
    socialLinks,
    businessInfo,
    shippingConfig,
    availableThemes: MVP_STORE_TEMPLATES.filter((t) => MVP_THEME_IDS.includes(t.id as any)).map(
      (t) => ({
        id: t.id,
        name: t.name,
        thumbnail: t.thumbnail,
        description: t.description,
      })
    ),
    currentTab,
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const db = drizzle(context.cloudflare.env.DB);

  // Get store
  const storeResult = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Get current theme
  let themeConfig: { storeTemplateId?: string } = {};
  try {
    if (store.themeConfig) {
      themeConfig = JSON.parse(store.themeConfig as string);
    }
  } catch {
    // Ignore
  }
  const currentThemeId = themeConfig.storeTemplateId || 'starter-store';

  switch (intent) {
    case 'general': {
      const name = formData.get('name') as string;
      const currency = formData.get('currency') as string;
      const defaultLanguage = formData.get('defaultLanguage') as 'en' | 'bn';
      const isActive = formData.get('isActive') === 'true';

      if (!name || name.trim().length < 2) {
        return json({ error: 'Store name must be at least 2 characters' }, { status: 400 });
      }

      await db
        .update(stores)
        .set({
          name: name.trim(),
          currency: currency || 'BDT',
          defaultLanguage: defaultLanguage || 'en',
          storeEnabled: isActive,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      return json({ success: true, message: 'General settings saved' });
    }

    case 'branding': {
      const themeId = formData.get('themeId') as string;
      const storeName = formData.get('storeName') as string;
      const logo = formData.get('logo') as string;
      const favicon = formData.get('favicon') as string;
      const primaryColor = formData.get('primaryColor') as string;
      const accentColor = formData.get('accentColor') as string;
      const showAnnouncement = formData.get('showAnnouncement') === 'on';
      const announcementText = formData.get('announcementText') as string;

      // Validate theme
      const newThemeId = isValidMVPTheme(themeId) ? themeId : currentThemeId;

      // Get current MVP settings
      const currentSettings = await getMVPSettings(db, storeId, currentThemeId);

      // Build updated settings
      const updatedSettings: MVPSettingsWithTheme = {
        ...currentSettings,
        themeId: newThemeId,
        storeName: storeName?.trim() || currentSettings.storeName,
        logo: logo || null,
        favicon: favicon || null,
        primaryColor: primaryColor || currentSettings.primaryColor,
        accentColor: accentColor || currentSettings.accentColor,
        showAnnouncement,
        announcementText: announcementText?.trim() || null,
      };

      // Save MVP settings
      await saveMVPSettings(db, storeId, updatedSettings);

      // Update theme config if theme changed
      if (newThemeId !== currentThemeId) {
        const newThemeConfig = {
          ...themeConfig,
          storeTemplateId: newThemeId,
        };
        await db
          .update(stores)
          .set({ themeConfig: JSON.stringify(newThemeConfig) })
          .where(eq(stores.id, storeId));
      }

      return json({ success: true, message: 'Branding settings saved' });
    }

    case 'contact': {
      const phone = formData.get('businessPhone') as string;
      const email = formData.get('businessEmail') as string;
      const address = formData.get('businessAddress') as string;
      const whatsapp = formData.get('whatsapp') as string;

      // Update business info
      const businessInfo = JSON.stringify({
        phone: phone || '',
        email: email || '',
        address: address || '',
      });

      // Update social links (WhatsApp)
      const currentSocial = parseSocialLinks(store.socialLinks as string | null) || {};
      const socialLinks = JSON.stringify({
        ...currentSocial,
        whatsapp: whatsapp || '',
      });

      await db
        .update(stores)
        .set({
          businessInfo,
          socialLinks,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      return json({ success: true, message: 'Contact information saved' });
    }

    case 'social': {
      const facebook = formData.get('facebook') as string;
      const instagram = formData.get('instagram') as string;
      const youtube = formData.get('youtube') as string;
      const tiktok = formData.get('tiktok') as string;

      const socialLinks = JSON.stringify({
        facebook: facebook || '',
        instagram: instagram || '',
        youtube: youtube || '',
        tiktok: tiktok || '',
        whatsapp: parseSocialLinks(store.socialLinks as string | null)?.whatsapp || '',
      });

      await db
        .update(stores)
        .set({
          socialLinks,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      return json({ success: true, message: 'Social links saved' });
    }

    case 'delivery': {
      const deliveryCharge = parseFloat(formData.get('deliveryCharge') as string) || 60;
      const freeDeliveryAbove = formData.get('freeDeliveryAbove') as string;
      const enableFreeDelivery = formData.get('enableFreeDelivery') === 'on';

      const currentShipping = parseShippingConfig(store.shippingConfig as string | null) || {};

      const shippingConfig = JSON.stringify({
        ...currentShipping,
        deliveryCharge,
        freeDeliveryAbove:
          enableFreeDelivery && freeDeliveryAbove ? parseFloat(freeDeliveryAbove) : null,
      });

      await db
        .update(stores)
        .set({
          shippingConfig,
          updatedAt: new Date(),
        })
        .where(eq(stores.id, storeId));

      return json({ success: true, message: 'Delivery settings saved' });
    }

    default:
      return json({ error: 'Unknown intent' }, { status: 400 });
  }
}

// ============================================================================
// CURRENCIES
// ============================================================================

const currencies = [
  { value: 'BDT', label: 'Bangladeshi Taka (৳)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
  { value: 'INR', label: 'Indian Rupee (₹)' },
];

// ============================================================================
// TAB DEFINITIONS
// ============================================================================

const tabs = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'contact', label: 'Contact', icon: Phone },
  { id: 'social', label: 'Social', icon: Share2 },
  { id: 'delivery', label: 'Delivery', icon: Truck },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UnifiedStoreSettingsPage() {
  const {
    store,
    mvpSettings,
    socialLinks,
    businessInfo,
    shippingConfig,
    availableThemes,
    currentTab,
  } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const isSubmitting = navigation.state === 'submitting';
  const activeTab = searchParams.get('tab') || 'general';

  // Check if action data is success or error
  const isSuccess = actionData && 'success' in actionData && actionData.success;
  const isError = actionData && 'error' in actionData && actionData.error;
  const message = isSuccess ? actionData.message : isError ? actionData.error : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>
              <p className="text-gray-600 mt-1">Manage your store appearance and configuration</p>
            </div>

            {/* Store Status Bar */}
            <StoreStatusBar store={store} />
          </div>
        </div>

        {/* Success/Error Messages */}
        {isSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-800">{message}</span>
          </div>
        )}

        {isError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{message}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  to={`?tab=${tab.id}`}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'general' && <GeneralTab store={store} isSubmitting={isSubmitting} />}

          {activeTab === 'branding' && (
            <BrandingTab
              mvpSettings={mvpSettings}
              availableThemes={availableThemes}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'contact' && (
            <ContactTab
              businessInfo={businessInfo}
              socialLinks={socialLinks}
              isSubmitting={isSubmitting}
            />
          )}

          {activeTab === 'social' && (
            <SocialTab socialLinks={socialLinks} isSubmitting={isSubmitting} />
          )}

          {activeTab === 'delivery' && (
            <DeliveryTab shippingConfig={shippingConfig} isSubmitting={isSubmitting} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// STORE STATUS BAR COMPONENT
// ============================================================================

function StoreStatusBar({
  store,
}: {
  store: { subdomain: string; customDomain: string | null; isActive: boolean };
}) {
  const [copied, setCopied] = useState(false);
  const publicUrl = store.customDomain
    ? `https://${store.customDomain}`
    : `https://${store.subdomain}.ozzyl.com`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-lg shadow-sm border">
      {/* Status Indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-3 h-3 rounded-full ${store.isActive ? 'bg-emerald-500' : 'bg-red-500'}`}
        />
        <span
          className={`text-sm font-medium ${store.isActive ? 'text-emerald-700' : 'text-red-700'}`}
        >
          {store.isActive ? 'Store is LIVE' : 'Store is OFFLINE'}
        </span>
      </div>

      <div className="hidden sm:block w-px h-6 bg-gray-300" />

      {/* Public URL */}
      <div className="flex items-center gap-2 text-sm">
        <Globe className="w-4 h-4 text-gray-400" />
        <span className="text-gray-600 font-mono">{publicUrl}</span>
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy URL"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      <div className="hidden sm:block w-px h-6 bg-gray-300" />

      {/* View Store Button */}
      <a
        href={publicUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <Eye className="w-4 h-4" />
        View Store
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}

// ============================================================================
// GENERAL TAB
// ============================================================================

function GeneralTab({
  store,
  isSubmitting,
}: {
  store: {
    name: string;
    subdomain: string;
    isActive: boolean;
    currency: string;
    defaultLanguage: string;
    planType: string;
  };
  isSubmitting: boolean;
}) {
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="general" />

      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
            <p className="text-sm text-gray-500">Basic store details and configuration</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Store Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={store.name}
              required
              minLength={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your store name"
            />
          </div>

          {/* Subdomain (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Store URL</label>
            <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
              <span className="text-gray-500">https://</span>
              <span className="font-mono text-gray-900">{store.subdomain}</span>
              <span className="text-gray-500">.ozzyl.com</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Contact support to change your store URL</p>
          </div>

          {/* Store Status Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Store Status</h3>
              <p className="text-sm text-gray-500">
                {store.isActive
                  ? 'Your store is visible to customers'
                  : 'Your store is hidden from customers'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <input type="hidden" name="isActive" value={store.isActive ? 'false' : 'true'} />
              <button
                type="button"
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  input.value = input.value === 'true' ? 'false' : 'true';
                  e.currentTarget.closest('form')?.requestSubmit();
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  store.isActive ? 'bg-emerald-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    store.isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Grid: Currency & Language */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={store.currency}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="defaultLanguage"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Default Language
              </label>
              <select
                id="defaultLanguage"
                name="defaultLanguage"
                defaultValue={store.defaultLanguage}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="en">🇬🇧 English</option>
                <option value="bn">🇧🇩 বাংলা</option>
              </select>
            </div>
          </div>

          {/* Plan Info (Read-only) */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">Current Plan</h3>
                <p className="text-sm text-blue-700 capitalize">{store.planType}</p>
              </div>
              <Link
                to="/app/settings/billing"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Upgrade
              </Link>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}

// ============================================================================
// BRANDING TAB
// ============================================================================

function BrandingTab({
  mvpSettings,
  availableThemes,
  isSubmitting,
}: {
  mvpSettings: MVPSettingsWithTheme;
  availableThemes: Array<{ id: string; name: string; thumbnail: string; description: string }>;
  isSubmitting: boolean;
}) {
  const { t } = useTranslation();
  const [logoUrl, setLogoUrl] = useState<string>(mvpSettings.logo || '');
  const [logoPreview, setLogoPreview] = useState<string>(mvpSettings.logo || '');
  const [faviconUrl, setFaviconUrl] = useState<string>(mvpSettings.favicon || '');
  const [faviconPreview, setFaviconPreview] = useState<string>(mvpSettings.favicon || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'logos');

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; url?: string };
      if (data.success && data.url) {
        setLogoUrl(data.url);
        setLogoPreview(data.url);
      }
    } catch (error) {
      console.error('Logo upload failed:', error);
    }
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

    // Upload to API
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'favicons');

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as { success?: boolean; url?: string };
      if (data.success && data.url) {
        setFaviconUrl(data.url);
        setFaviconPreview(data.url);
      }
    } catch (error) {
      console.error('Favicon upload failed:', error);
    }
  };

  const removeLogo = () => {
    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFavicon = () => {
    setFaviconUrl('');
    setFaviconPreview('');
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="branding" />
      <input type="hidden" name="logo" value={logoUrl} />
      <input type="hidden" name="favicon" value={faviconUrl} />

      {/* Theme Selector */}
      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store Theme</h2>
            <p className="text-sm text-gray-500">Choose a template for your storefront</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableThemes.map((theme) => (
            <label
              key={theme.id}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-blue-400 ${
                mvpSettings.themeId === theme.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="themeId"
                value={theme.id}
                defaultChecked={mvpSettings.themeId === theme.id}
                className="sr-only"
              />
              <div className="flex flex-col h-full">
                <img
                  src={theme.thumbnail}
                  alt={theme.name}
                  className="w-full h-32 object-cover rounded-md mb-3"
                />
                <h3 className="font-medium text-gray-900">{theme.name}</h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{theme.description}</p>
              </div>
              {mvpSettings.themeId === theme.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
      </GlassCard>

      {/* Logo & Favicon */}
      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Image className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Store Images</h2>
            <p className="text-sm text-gray-500">Upload your logo and favicon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Store Logo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Store logo"
                      className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-gray-50"
                    />
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </button>
                <p className="text-xs text-gray-500 mt-1">Recommended: 200x60px, transparent PNG</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Browser Favicon</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                {faviconPreview ? (
                  <div className="relative">
                    <img
                      src={faviconPreview}
                      alt="Favicon"
                      className="w-10 h-10 object-contain rounded border border-gray-200 bg-gray-50"
                    />
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
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  <Upload className="w-4 h-4" />
                  Upload Favicon
                </button>
                <p className="text-xs text-gray-500 mt-1">Recommended: 32x32px</p>
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

      {/* Brand Colors */}
      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Brand Colors</h2>
            <p className="text-sm text-gray-500">Customize your store colors</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="primaryColor"
                id="primaryColor"
                defaultValue={mvpSettings.primaryColor}
                className="h-10 w-20 rounded border-gray-300"
              />
              <input
                type="text"
                name="primaryColorText"
                defaultValue={mvpSettings.primaryColor}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="#4F46E5"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for buttons, links, and headings</p>
          </div>

          {/* Accent Color */}
          <div>
            <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="accentColor"
                id="accentColor"
                defaultValue={mvpSettings.accentColor}
                className="h-10 w-20 rounded border-gray-300"
              />
              <input
                type="text"
                name="accentColorText"
                defaultValue={mvpSettings.accentColor}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="#F59E0B"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Used for badges, highlights, and CTAs</p>
          </div>
        </div>
      </GlassCard>

      {/* Announcement Banner */}
      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Announcement Banner</h2>
            <p className="text-sm text-gray-500">Show a banner at the top of your store</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="showAnnouncement"
              id="showAnnouncement"
              defaultChecked={mvpSettings.showAnnouncement}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="showAnnouncement" className="ml-2 block text-sm text-gray-900">
              Show announcement banner on storefront
            </label>
          </div>

          <div>
            <label
              htmlFor="announcementText"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Announcement Text
            </label>
            <input
              type="text"
              name="announcementText"
              id="announcementText"
              defaultValue={mvpSettings.announcementText || ''}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="e.g., Free delivery over ৳1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Example: "১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি!"
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}

// ============================================================================
// CONTACT TAB
// ============================================================================

function ContactTab({
  businessInfo,
  socialLinks,
  isSubmitting,
}: {
  businessInfo: BusinessInfo;
  socialLinks: SocialLinks;
  isSubmitting: boolean;
}) {
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="contact" />

      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Phone className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Business Contact</h2>
            <p className="text-sm text-gray-500">Contact information for customers</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label htmlFor="businessPhone" className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" /> Business Phone
            </label>
            <input
              type="tel"
              id="businessPhone"
              name="businessPhone"
              defaultValue={businessInfo.phone}
              placeholder="01712345678"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="businessEmail" className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" /> Business Email
            </label>
            <input
              type="email"
              id="businessEmail"
              name="businessEmail"
              defaultValue={businessInfo.email}
              placeholder="contact@yourstore.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              <MessageCircle className="w-4 h-4 inline mr-1 text-green-600" /> WhatsApp Number
            </label>
            <input
              type="tel"
              id="whatsapp"
              name="whatsapp"
              defaultValue={socialLinks.whatsapp}
              placeholder="01712345678"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-500 mt-1">
              Customers will be able to message you on WhatsApp
            </p>
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="businessAddress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <MapPin className="w-4 h-4 inline mr-1" /> Business Address
            </label>
            <textarea
              id="businessAddress"
              name="businessAddress"
              rows={3}
              defaultValue={businessInfo.address}
              placeholder="Your store address"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}

// ============================================================================
// SOCIAL TAB
// ============================================================================

function SocialTab({
  socialLinks,
  isSubmitting,
}: {
  socialLinks: SocialLinks;
  isSubmitting: boolean;
}) {
  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="social" />

      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
            <Share2 className="w-5 h-5 text-pink-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Social Media Links</h2>
            <p className="text-sm text-gray-500">Connect your social media profiles</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Facebook */}
          <div>
            <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
              <Facebook className="w-4 h-4 inline mr-1 text-blue-600" /> Facebook Page URL
            </label>
            <input
              type="url"
              id="facebook"
              name="facebook"
              defaultValue={socialLinks.facebook}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Instagram */}
          <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
              <Instagram className="w-4 h-4 inline mr-1 text-pink-600" /> Instagram URL
            </label>
            <input
              type="url"
              id="instagram"
              name="instagram"
              defaultValue={socialLinks.instagram}
              placeholder="https://instagram.com/yourprofile"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* YouTube */}
          <div>
            <label htmlFor="youtube" className="block text-sm font-medium text-gray-700 mb-1">
              <Youtube className="w-4 h-4 inline mr-1 text-red-600" /> YouTube Channel URL
            </label>
            <input
              type="url"
              id="youtube"
              name="youtube"
              defaultValue={socialLinks.youtube}
              placeholder="https://youtube.com/channel/yourchannel"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* TikTok */}
          <div>
            <label htmlFor="tiktok" className="block text-sm font-medium text-gray-700 mb-1">
              TikTok URL
            </label>
            <input
              type="url"
              id="tiktok"
              name="tiktok"
              defaultValue={socialLinks.tiktok}
              placeholder="https://tiktok.com/@yourprofile"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}

// ============================================================================
// DELIVERY TAB
// ============================================================================

function DeliveryTab({
  shippingConfig,
  isSubmitting,
}: {
  shippingConfig: ShippingConfig;
  isSubmitting: boolean;
}) {
  const [enableFreeDelivery, setEnableFreeDelivery] = useState(
    shippingConfig.freeDeliveryAbove !== null
  );

  return (
    <Form method="post" className="space-y-6">
      <input type="hidden" name="intent" value="delivery" />

      <GlassCard intensity="low" className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delivery Settings</h2>
            <p className="text-sm text-gray-500">Configure delivery charges for your store</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Delivery Charge */}
          <div>
            <label
              htmlFor="deliveryCharge"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              <Package className="w-4 h-4 inline mr-1" /> Delivery Charge (৳)
            </label>
            <input
              type="number"
              id="deliveryCharge"
              name="deliveryCharge"
              defaultValue={shippingConfig.deliveryCharge ?? 60}
              min="0"
              step="1"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="60"
            />
            <p className="text-xs text-gray-500 mt-1">Standard delivery charge for orders</p>
          </div>

          {/* Free Delivery Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="enableFreeDelivery"
              id="enableFreeDelivery"
              checked={enableFreeDelivery}
              onChange={(e) => setEnableFreeDelivery(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableFreeDelivery" className="ml-2 block text-sm text-gray-900">
              Enable free delivery for orders above a certain amount
            </label>
          </div>

          {/* Free Delivery Amount */}
          {enableFreeDelivery && (
            <div>
              <label
                htmlFor="freeDeliveryAbove"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Free Delivery for Orders Above (৳)
              </label>
              <input
                type="number"
                id="freeDeliveryAbove"
                name="freeDeliveryAbove"
                defaultValue={shippingConfig.freeDeliveryAbove || 1000}
                min="100"
                step="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="1000"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: 1000 = Free delivery for orders over ৳1000
              </p>
            </div>
          )}

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="font-medium text-gray-900 mb-2">How it shows on checkout:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">৳ 850</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery:</span>
                <span className="font-medium">৳ {shippingConfig.deliveryCharge ?? 60}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">৳ {850 + (shippingConfig.deliveryCharge ?? 60)}</span>
              </div>
              {enableFreeDelivery && (
                <p className="text-xs text-emerald-600 mt-2">
                  📦 ৳{(shippingConfig.freeDeliveryAbove || 1000) - 850} more for free delivery!
                </p>
              )}
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}
