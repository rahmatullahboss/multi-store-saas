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
import { Form, useLoaderData, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseSocialLinks, parseFooterConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { fontOptions } from '~/lib/theme';
import { canUseStoreMode, type PlanType } from '~/utils/plans.server';
import { Store, Globe, Palette, Loader2, CheckCircle, Upload, X, Image, Phone, Mail, MapPin, Type, Facebook, Instagram, MessageCircle, Layout, ShoppingBag, FileText, Crown, Lock, Eye } from 'lucide-react';
import { ThemePreview } from '~/components/ThemePreview';
import { useState, useEffect, useRef } from 'react';
import { compressImage, getOptimalFormat } from '~/lib/imageCompression';

export const meta: MetaFunction = () => {
  return [{ title: 'Settings - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER - Fetch store data
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  const socialLinks = parseSocialLinks(store.socialLinks as string | null);
  const footerConfig = parseFooterConfig(store.footerConfig as string | null);

  const planType = (store.planType as PlanType) || 'free';
  const allowStoreMode = canUseStoreMode(planType);

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      currency: store.currency,
      mode: store.mode || 'landing',
      planType,
      theme: store.theme,
      logo: store.logo,
      favicon: store.favicon,
      fontFamily: store.fontFamily || 'inter',
      socialLinks: socialLinks || { facebook: '', instagram: '', whatsapp: '', twitter: '' },
      footerConfig: footerConfig || { description: '', showPoweredBy: true },
      businessInfo: store.businessInfo ? JSON.parse(store.businessInfo) : { phone: '', email: '', address: '' },
    },
    allowStoreMode,
  });
}

// ============================================================================
// ACTION - Update store settings (with server-side validation)
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
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
  const storeMode = formData.get('storeMode') as 'landing' | 'store' | null;
  
  // Social links
  const facebook = formData.get('facebook') as string;
  const instagram = formData.get('instagram') as string;
  const whatsapp = formData.get('whatsapp') as string;

  // Validation
  if (!name || name.trim().length < 2) {
    return json({ error: 'Store name must be at least 2 characters' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // ========================================================================
  // SERVER-SIDE VALIDATION: Prevent free users from switching to store mode
  // ========================================================================
  if (storeMode === 'store') {
    // Get current plan from database (not from client!)
    const storeData = await db.select({ planType: stores.planType }).from(stores).where(eq(stores.id, storeId)).limit(1);
    const planType = (storeData[0]?.planType as PlanType) || 'free';
    
    if (!canUseStoreMode(planType)) {
      console.warn(`[SECURITY] Free user (store ${storeId}) attempted to switch to store mode`);
      return json({ 
        error: 'Full Store mode requires a paid plan. Please upgrade to unlock.' 
      }, { status: 403 });
    }
  }

  // Build update object
  const updateData: Record<string, unknown> = {
    name: name.trim(),
    currency: currency || 'BDT',
    theme: theme || 'default',
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
    updatedAt: new Date(),
  };

  // Only update mode if provided and validated above
  if (storeMode && (storeMode === 'landing' || storeMode === 'store')) {
    updateData.mode = storeMode;
  }

  await db
    .update(stores)
    .set(updateData)
    .where(eq(stores.id, storeId));

  return json({ success: true });
}

// ============================================================================
// CURRENCIES
// ============================================================================
const currencies = [
  { value: 'BDT', label: '৳ BDT - Bangladeshi Taka' },
  { value: 'USD', label: '$ USD - US Dollar' },
  { value: 'EUR', label: '€ EUR - Euro' },
  { value: 'GBP', label: '£ GBP - British Pound' },
  { value: 'INR', label: '₹ INR - Indian Rupee' },
];

// ============================================================================
// THEMES (Preset themes - no drag & drop builder)
// ============================================================================
const themes = [
  { value: 'default', label: 'Default', color: '#10b981', description: 'Clean emerald theme' },
  { value: 'ocean', label: 'Ocean Blue', color: '#3b82f6', description: 'Professional blue theme' },
  { value: 'sunset', label: 'Sunset', color: '#f59e0b', description: 'Warm orange theme' },
  { value: 'rose', label: 'Rose', color: '#f43f5e', description: 'Bold pink theme' },
  { value: 'purple', label: 'Purple', color: '#8b5cf6', description: 'Modern violet theme' },
  { value: 'dark', label: 'Dark Mode', color: '#1f2937', description: 'Sleek dark theme' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SettingsPage() {
  const { store, allowStoreMode } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(store.theme || 'default');
  const [selectedFont, setSelectedFont] = useState(store.fontFamily || 'inter');
  const [storeMode, setStoreMode] = useState<'landing' | 'store'>(store.mode as 'landing' | 'store' || 'landing');
  const [showPreview, setShowPreview] = useState(false);
  
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
    if (actionData && 'success' in actionData && actionData.success) {
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
      }).catch(err => console.warn('Failed to delete logo from R2:', err));
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
      }).catch(err => console.warn('Failed to delete favicon from R2:', err));
    }
    
    setFaviconUrl('');
    setFaviconPreview('');
    if (faviconInputRef.current) {
      faviconInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your store configuration</p>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* Error Message */}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        {/* Hidden inputs */}
        <input type="hidden" name="logo" value={logoUrl} />
        <input type="hidden" name="favicon" value={faviconUrl} />

        {/* Logo & Favicon Upload Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Branding</h2>
              <p className="text-sm text-gray-500">Logo and favicon for your store</p>
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
                    {isUploadingLogo ? 'Uploading...' : 'Upload'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG. Square works best.</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
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
                    {isUploadingFavicon ? 'Uploading...' : 'Upload'}
                  </button>
                  <p className="text-xs text-gray-500 mt-1">32x32 or 16x16 PNG</p>
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
        </div>

        {/* Store Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Store Information</h2>
              <p className="text-sm text-gray-500">Basic details about your store</p>
            </div>
          </div>

          <div className="space-y-4">
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
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                defaultValue={store.currency || 'BDT'}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
              >
                {currencies.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Read-only info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              <InfoItem label="Subdomain" value={`${store.subdomain}.digitalcare.site`} />
              <InfoItem label="Current Plan" value={store.planType === 'free' ? 'Free' : store.planType.charAt(0).toUpperCase() + store.planType.slice(1)} />
              {store.customDomain && (
                <InfoItem label="Custom Domain" value={store.customDomain} />
              )}
            </div>
          </div>
        </div>

        {/* Store Mode Selection Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Layout className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Store Mode</h2>
              <p className="text-sm text-gray-500">Choose how your store appears to customers</p>
            </div>
          </div>

          {/* Hidden input for form submission */}
          <input type="hidden" name="storeMode" value={storeMode} />

          {allowStoreMode ? (
            /* Paid Users - Can toggle between modes */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Landing Page Option */}
              <button
                type="button"
                onClick={() => setStoreMode('landing')}
                className={`relative flex flex-col items-start p-4 border-2 rounded-xl transition text-left ${
                  storeMode === 'landing'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Landing Page</h3>
                <p className="text-sm text-gray-500">Single product focus with high-converting sales page design. Perfect for featured products.</p>
                {storeMode === 'landing' && (
                  <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-violet-600" />
                )}
              </button>

              {/* Full Store Option */}
              <button
                type="button"
                onClick={() => setStoreMode('store')}
                className={`relative flex flex-col items-start p-4 border-2 rounded-xl transition text-left ${
                  storeMode === 'store'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Full Store</h3>
                <p className="text-sm text-gray-500">Complete e-commerce experience with product catalog, cart, categories, and checkout.</p>
                {storeMode === 'store' && (
                  <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-violet-600" />
                )}
              </button>
            </div>
          ) : (
            /* Free Users - Locked to Landing Page with upgrade prompt */
            <div className="space-y-4">
              {/* Current Mode - Landing Page */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Landing Page Mode</h3>
                  <p className="text-sm text-gray-500">Your store displays a single product sales page</p>
                </div>
                <span className="px-3 py-1 bg-violet-100 text-violet-700 text-sm font-medium rounded-full">Active</span>
              </div>

              {/* Upgrade Prompt for Full Store */}
              <div className="relative p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 opacity-75">
                <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                  <Lock className="w-3 h-3" />
                  Pro
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center opacity-50">
                    <ShoppingBag className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-700">Full Store Mode</h3>
                    <p className="text-sm text-gray-500">Unlock product catalog, cart & categories</p>
                  </div>
                </div>
              </div>

              {/* Upgrade CTA */}
              <a
                href="/app/upgrade"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 transition shadow-lg shadow-amber-500/20"
              >
                <Crown className="w-5 h-5" />
                Upgrade to Unlock Full Store Mode
              </a>
            </div>
          )}
        </div>
        {/* Theme & Font Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Theme & Typography</h2>
                <p className="text-sm text-gray-500">Customize the look of your store</p>
              </div>
            </div>
            {/* Preview Button */}
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-600 transition shadow-md"
            >
              <Eye className="w-4 h-4" />
              Preview Theme
            </button>
          </div>

          {/* Theme Grid */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {themes.map((t) => (
                <label
                  key={t.value}
                  className={`
                    relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition
                    ${selectedTheme === t.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => setSelectedTheme(t.value)}
                >
                  <input
                    type="radio"
                    name="theme"
                    value={t.value}
                    checked={selectedTheme === t.value}
                    onChange={() => setSelectedTheme(t.value)}
                    className="sr-only"
                  />
                  <div
                    className="w-10 h-10 rounded-full mb-2 border-2 border-white shadow-md"
                    style={{ backgroundColor: t.color }}
                  />
                  <span className="font-medium text-gray-900 text-sm">{t.label}</span>
                  <span className="text-xs text-gray-500 text-center">{t.description}</span>
                  {selectedTheme === t.value && (
                    <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-600" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Font Selection */}
          <div>
            <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700 mb-1">
              <Type className="w-4 h-4 inline mr-1" /> Font Family
            </label>
            <select
              id="fontFamily"
              name="fontFamily"
              value={selectedFont}
              onChange={(e) => setSelectedFont(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
            >
              {fontOptions.map((font) => (
                <option key={font.value} value={font.value} style={{ fontFamily: font.family }}>
                  {font.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">The font will be applied to your storefront.</p>
          </div>

          {/* Preview Tip */}
          <div className="mt-4 p-3 bg-purple-50 border border-purple-100 rounded-lg">
            <p className="text-sm text-purple-700">
              💡 <strong>Tip:</strong> Click "Preview Theme" above to see how your store will look before saving!
            </p>
          </div>
        </div>

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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <Instagram className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Social Media</h2>
              <p className="text-sm text-gray-500">Connect your social profiles</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                <Facebook className="w-4 h-4 inline mr-1 text-blue-600" /> Facebook
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
                <Instagram className="w-4 h-4 inline mr-1 text-pink-600" /> Instagram
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
                <MessageCircle className="w-4 h-4 inline mr-1 text-green-600" /> WhatsApp
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                defaultValue={store.socialLinks?.whatsapp || ''}
                placeholder="+8801XXXXXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">Include country code for WhatsApp link</p>
            </div>
          </div>
        </div>

        {/* Business Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Phone className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>
              <p className="text-sm text-gray-500">Contact details for invoices and customers</p>
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
                defaultValue={store.businessInfo?.phone || ''}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
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
                defaultValue={store.businessInfo?.email || ''}
                placeholder="contact@yourstore.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" /> Business Address
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
        </div>

        {/* Custom Domain Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Custom Domain</h2>
              <p className="text-sm text-gray-500">Connect your own domain</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Domain Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Your store is currently accessible at:</p>
              <p className="font-medium text-gray-900 mt-1">
                https://{store.subdomain}.digitalcare.site
              </p>
            </div>

            {/* Custom Domain Input */}
            <div>
              <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 mb-1">
                Custom Domain (optional)
              </label>
              <input
                type="text"
                id="customDomain"
                name="customDomain"
                defaultValue={store.customDomain || ''}
                placeholder="mystore.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
              <p className="text-xs text-gray-500 mt-1">Enter your domain without https://</p>
            </div>

            {/* DNS Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-2">
                <li>1. Go to your domain registrar's DNS settings</li>
                <li>2. Add a <strong>CNAME</strong> record:</li>
                <li className="ml-4 font-mono text-xs bg-blue-100 p-2 rounded">
                  Name: @ or www<br />
                  Value: multi-store-saas.pages.dev
                </li>
                <li>3. Contact admin to add your domain in Cloudflare Dashboard</li>
                <li>4. Wait for DNS propagation (up to 48 hours)</li>
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
        </div>

        {/* Quick Links to Other Settings */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">More Settings</h2>
          <div className="grid grid-cols-2 gap-3">
            <a
              href="/app/settings/shipping"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="font-medium text-gray-700">Shipping Zones</span>
            </a>
            <a
              href="/app/settings/seo"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <span className="font-medium text-gray-700">SEO Settings</span>
            </a>
            <a
              href="/app/settings/team"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Team Members</span>
            </a>
            <a
              href="/app/settings/activity"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-amber-600" />
              </div>
              <span className="font-medium text-gray-700">Activity Log</span>
            </a>
            <a
              href="/app/settings/landing"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-rose-100 rounded-lg flex items-center justify-center">
                <Palette className="w-4 h-4 text-rose-600" />
              </div>
              <span className="font-medium text-gray-700">Landing Mode</span>
            </a>
            <a
              href="/app/settings/courier"
              className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Store className="w-4 h-4 text-purple-600" />
              </div>
              <span className="font-medium text-gray-700">Courier API</span>
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
                Saving...
              </>
            ) : (
              'Save Settings'
            )}
          </button>
        </div>
      </Form>
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
