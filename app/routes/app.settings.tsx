/**
 * Store Settings Page
 * 
 * Route: /app/settings
 * 
 * Features:
 * - Edit store name, currency
 * - Upload store logo
 * - Select store theme
 * - View store info
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { Store, Globe, Palette, Loader2, CheckCircle, Upload, X, Image, Phone, Mail, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      currency: store.currency,
      mode: store.mode,
      theme: store.theme,
      logo: store.logo,
      businessInfo: store.businessInfo ? JSON.parse(store.businessInfo) : { phone: '', email: '', address: '' },
    },
  });
}

// ============================================================================
// ACTION - Update store settings
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
  const businessPhone = formData.get('businessPhone') as string;
  const businessEmail = formData.get('businessEmail') as string;
  const businessAddress = formData.get('businessAddress') as string;
  const customDomain = formData.get('customDomain') as string;

  // Validation
  if (!name || name.trim().length < 2) {
    return json({ error: 'Store name must be at least 2 characters' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  await db
    .update(stores)
    .set({
      name: name.trim(),
      currency: currency || 'BDT',
      theme: theme || 'default',
      logo: logo || null,
      customDomain: customDomain?.trim() || null,
      businessInfo: JSON.stringify({
        phone: businessPhone || '',
        email: businessEmail || '',
        address: businessAddress || '',
      }),
      updatedAt: new Date(),
    })
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
  const { store } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Logo upload state
  const [logoUrl, setLogoUrl] = useState<string>(store.logo || '');
  const [logoPreview, setLogoPreview] = useState<string>(store.logo || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoFetcher = useFetcher<{ success?: boolean; url?: string; error?: string }>();
  const isUploading = logoFetcher.state !== 'idle';

  // Handle logo upload response
  useEffect(() => {
    if (logoFetcher.data?.success && logoFetcher.data?.url) {
      setLogoUrl(logoFetcher.data.url);
      setLogoPreview(logoFetcher.data.url);
    }
  }, [logoFetcher.data]);

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'logos');

    logoFetcher.submit(formData, {
      method: 'post',
      action: '/api/upload-image',
      encType: 'multipart/form-data',
    });
  };

  const removeLogo = () => {
    setLogoUrl('');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
        {/* Hidden logo input */}
        <input type="hidden" name="logo" value={logoUrl} />

        {/* Logo Upload Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Image className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Store Logo</h2>
              <p className="text-sm text-gray-500">Displayed in header and footer</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Logo Preview */}
            <div className="relative">
              {logoPreview ? (
                <div className="relative">
                  <img
                    src={logoPreview}
                    alt="Store logo"
                    className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-gray-50"
                  />
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>

            {/* Upload Button */}
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
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB. Square works best.</p>
              {logoFetcher.data?.error && (
                <p className="text-red-500 text-sm mt-1">{logoFetcher.data.error}</p>
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
              <InfoItem label="Subdomain" value={`${store.subdomain}.stores.digitalcare.site`} />
              <InfoItem label="Store Mode" value={store.mode === 'landing' ? 'Landing Page' : 'Full Store'} />
              {store.customDomain && (
                <InfoItem label="Custom Domain" value={store.customDomain} />
              )}
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Store Theme</h2>
              <p className="text-sm text-gray-500">Choose a preset theme for your store</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map((t) => (
              <label
                key={t.value}
                className={`
                  relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition
                  ${store.theme === t.value ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <input
                  type="radio"
                  name="theme"
                  value={t.value}
                  defaultChecked={store.theme === t.value}
                  className="sr-only"
                />
                <div
                  className="w-10 h-10 rounded-full mb-2 border-2 border-white shadow-md"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-medium text-gray-900 text-sm">{t.label}</span>
                <span className="text-xs text-gray-500 text-center">{t.description}</span>
                {store.theme === t.value && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-600" />
                )}
              </label>
            ))}
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
                https://{store.subdomain}.stores.digitalcare.site
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
          </div>
        </div>

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
