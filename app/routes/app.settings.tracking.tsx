/**
 * Tracking & Analytics Settings Page
 * 
 * Route: /app/settings/tracking
 * 
 * Allows merchants to configure:
 * - Facebook Pixel ID for retargeting ads
 * - Google Analytics 4 (GA4) Measurement ID for analytics
 * 
 * Data Isolation: Each store's tracking IDs are stored separately.
 * Data Lock-in: Warning shown about pixel data being owned by FB/Google.
 */

import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState } from 'react';
import { 
  Save, AlertCircle, CheckCircle, Facebook, ExternalLink, Copy, Eye, EyeOff,
  BarChart3, AlertTriangle, Info
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select({
    id: stores.id,
    name: stores.name,
    subdomain: stores.subdomain,
    facebookPixelId: stores.facebookPixelId,
    googleAnalyticsId: stores.googleAnalyticsId,
  }).from(stores).where(eq(stores.id, storeId)).get();

  if (!store) throw new Response('Store not found', { status: 404 });

  return json({ store });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const pixelId = (formData.get('facebookPixelId') as string || '').trim();
  const gaId = (formData.get('googleAnalyticsId') as string || '').trim();

  // Validate Facebook Pixel ID format (15-16 digits)
  if (pixelId && !/^\d{15,16}$/.test(pixelId)) {
    return json({ 
      success: false, 
      error: 'Invalid Facebook Pixel ID format. It should be a 15-16 digit number.' 
    }, { status: 400 });
  }

  // Validate GA4 Measurement ID format (G-XXXXXXXXXX)
  if (gaId && !/^G-[A-Z0-9]{8,12}$/i.test(gaId)) {
    return json({ 
      success: false, 
      error: 'Invalid GA4 Measurement ID format. It should be like G-XXXXXXXXXX.' 
    }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  await db
    .update(stores)
    .set({ 
      facebookPixelId: pixelId || null,
      googleAnalyticsId: gaId || null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true, message: 'Tracking settings saved successfully!' });
}

export default function TrackingSettings() {
  const { store } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();
  const { t, lang } = useTranslation();
  
  const [showPixelId, setShowPixelId] = useState(false);
  const [showGaId, setShowGaId] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isSaving = fetcher.state === 'submitting';
  const isFbConfigured = !!store.facebookPixelId;
  const isGaConfigured = !!store.googleAnalyticsId;
  const isAnyConfigured = isFbConfigured || isGaConfigured;

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
          <BarChart3 className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'bn' ? 'ট্র্যাকিং ও অ্যানালিটিক্স' : 'Tracking & Analytics'}
          </h1>
          <p className="text-gray-500 mt-1">
            {lang === 'bn' 
              ? 'ফেসবুক পিক্সেল ও গুগল অ্যানালিটিক্স সেটআপ করে কাস্টমার ট্র্যাকিং সক্রিয় করুন।'
              : 'Set up Facebook Pixel and Google Analytics to track customer behavior and conversions.'}
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {fetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {fetcher.data.message}
        </div>
      )}
      {fetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {fetcher.data.error}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* FB Pixel Status */}
        <div className={`rounded-xl border p-4 ${isFbConfigured ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Facebook className={`w-5 h-5 ${isFbConfigured ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isFbConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`font-medium ${isFbConfigured ? 'text-blue-700' : 'text-gray-500'}`}>
                  Facebook Pixel
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {isFbConfigured 
                  ? (lang === 'bn' ? 'সক্রিয় আছে' : 'Active')
                  : (lang === 'bn' ? 'সেটআপ করা হয়নি' : 'Not configured')}
              </p>
            </div>
          </div>
        </div>

        {/* GA4 Status */}
        <div className={`rounded-xl border p-4 ${isGaConfigured ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <BarChart3 className={`w-5 h-5 ${isGaConfigured ? 'text-orange-600' : 'text-gray-400'}`} />
            <div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${isGaConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className={`font-medium ${isGaConfigured ? 'text-orange-700' : 'text-gray-500'}`}>
                  Google Analytics 4
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                {isGaConfigured 
                  ? (lang === 'bn' ? 'সক্রিয় আছে' : 'Active')
                  : (lang === 'bn' ? 'সেটআপ করা হয়নি' : 'Not configured')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <fetcher.Form method="post" className="space-y-6">
        {/* Facebook Pixel Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/50 flex items-center gap-3">
            <Facebook className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Facebook Pixel</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pixel ID
              </label>
              <div className="relative">
                <input
                  type={showPixelId ? 'text' : 'password'}
                  name="facebookPixelId"
                  defaultValue={store.facebookPixelId || ''}
                  placeholder="123456789012345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPixelId(!showPixelId)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title={showPixelId ? 'Hide' : 'Show'}
                  >
                    {showPixelId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {store.facebookPixelId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(store.facebookPixelId!, 'fb')}
                      className={`p-2 ${copiedField === 'fb' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {lang === 'bn'
                  ? '১৫-১৬ সংখ্যার Pixel ID। Facebook Events Manager থেকে পাবেন।'
                  : '15-16 digit Pixel ID from Facebook Events Manager.'}
              </p>
            </div>
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {lang === 'bn' ? 'Events Manager খুলুন' : 'Open Events Manager'}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Google Analytics Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-yellow-100/50 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">Google Analytics 4</h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Measurement ID
              </label>
              <div className="relative">
                <input
                  type={showGaId ? 'text' : 'password'}
                  name="googleAnalyticsId"
                  defaultValue={store.googleAnalyticsId || ''}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowGaId(!showGaId)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title={showGaId ? 'Hide' : 'Show'}
                  >
                    {showGaId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {store.googleAnalyticsId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(store.googleAnalyticsId!, 'ga')}
                      className={`p-2 ${copiedField === 'ga' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {lang === 'bn'
                  ? 'GA4 Measurement ID (G-XXXXXXXXXX)। Google Analytics থেকে পাবেন।'
                  : 'GA4 Measurement ID (G-XXXXXXXXXX) from Google Analytics.'}
              </p>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              {lang === 'bn' ? 'Google Analytics খুলুন' : 'Open Google Analytics'}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Events Tracked Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {lang === 'bn' ? 'যেসব ইভেন্ট ট্র্যাক হবে' : 'Events That Will Be Tracked'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { event: 'PageView', bn: 'পেইজ ভিউ', desc: 'Every page load' },
              { event: 'ViewContent', bn: 'প্রোডাক্ট ভিউ', desc: 'Product page' },
              { event: 'AddToCart', bn: 'কার্টে যোগ', desc: 'Add to cart' },
              { event: 'InitiateCheckout', bn: 'চেকআউট শুরু', desc: 'Checkout page' },
              { event: 'Purchase', bn: 'অর্ডার সম্পন্ন', desc: 'Thank you page' },
              { event: 'Lead', bn: 'লিড জেনারেশন', desc: 'Contact form' },
            ].map(({ event, bn, desc }) => (
              <div key={event} className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">{lang === 'bn' ? bn : event}</span>
                  <span className="text-gray-400 text-xs ml-1">({desc})</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Data Lock-in Warning */}
        {isAnyConfigured && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">
                  {lang === 'bn' ? 'গুরুত্বপূর্ণ তথ্য' : 'Important Information'}
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  {lang === 'bn'
                    ? 'আপনার পিক্সেল ডেটা (অডিয়েন্স, কনভার্সন হিস্টরি) Facebook/Google এ সংরক্ষিত থাকে। আপনি যদি পিক্সেল সরিয়ে দেন বা প্ল্যাটফর্ম ছেড়ে যান, এই ডেটা হারাবেন। এই ডেটা এক্সপোর্ট বা ট্রান্সফার করা যায় না।'
                    : 'Your pixel data (audiences, conversion history) is stored by Facebook/Google. If you disconnect your pixels or leave the platform, you will lose access to this valuable retargeting data. This data cannot be exported or transferred.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving 
              ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') 
              : (lang === 'bn' ? 'সেটিংস সেভ করুন' : 'Save Settings')}
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}
