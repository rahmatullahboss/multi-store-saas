/**
 * Facebook Pixel Settings Page
 * 
 * Route: /app/settings/pixel
 * 
 * Allows merchants to configure their Facebook Pixel ID for tracking.
 */

import { ActionFunctionArgs, LoaderFunctionArgs, json } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { useState } from 'react';
import { Save, AlertCircle, CheckCircle, Facebook, ExternalLink, Copy, Eye, EyeOff } from 'lucide-react';
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
  }).from(stores).where(eq(stores.id, storeId)).get();

  if (!store) throw new Response('Store not found', { status: 404 });

  return json({ store });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) throw new Response('Unauthorized', { status: 401 });

  const formData = await request.formData();
  const pixelId = (formData.get('pixelId') as string || '').trim();

  // Validate Pixel ID format (should be numeric, 15-16 digits)
  if (pixelId && !/^\d{15,16}$/.test(pixelId)) {
    return json({ 
      success: false, 
      error: 'Invalid Pixel ID format. It should be a 15-16 digit number.' 
    }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  await db
    .update(stores)
    .set({ 
      facebookPixelId: pixelId || null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true, message: 'Facebook Pixel settings saved!' });
}

export default function FacebookPixelSettings() {
  const { store } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();
  const { t, lang } = useTranslation();
  const [showPixelId, setShowPixelId] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSaving = fetcher.state === 'submitting';
  const isConfigured = !!store.facebookPixelId;

  const handleCopy = () => {
    if (store.facebookPixelId) {
      navigator.clipboard.writeText(store.facebookPixelId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Facebook className="w-8 h-8 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === 'bn' ? 'ফেসবুক পিক্সেল সেটআপ' : 'Facebook Pixel Setup'}
          </h1>
          <p className="text-gray-500 mt-1">
            {lang === 'bn' 
              ? 'আপনার ফেসবুক পিক্সেল ID যোগ করে কাস্টমার ট্র্যাকিং এবং রিটার্গেটিং সক্রিয় করুন।'
              : 'Add your Facebook Pixel ID to enable customer tracking and retargeting ads.'}
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

      {/* Status Card */}
      <div className={`rounded-xl border p-4 ${isConfigured ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span className={`font-medium ${isConfigured ? 'text-green-700' : 'text-yellow-700'}`}>
            {isConfigured 
              ? (lang === 'bn' ? 'পিক্সেল সক্রিয় আছে ✓' : 'Pixel is Active ✓')
              : (lang === 'bn' ? 'পিক্সেল সেটআপ করা হয়নি' : 'Pixel Not Configured')}
          </span>
        </div>
      </div>

      {/* Settings Form */}
      <fetcher.Form method="post" className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              {lang === 'bn' ? 'পিক্সেল আইডি কনফিগারেশন' : 'Pixel ID Configuration'}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook Pixel ID
              </label>
              <div className="relative">
                <input
                  type={showPixelId ? 'text' : 'password'}
                  name="pixelId"
                  defaultValue={store.facebookPixelId || ''}
                  placeholder="123456789012345"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-24"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPixelId(!showPixelId)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPixelId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {store.facebookPixelId && (
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {lang === 'bn'
                  ? 'আপনার ১৫-১৬ সংখ্যার ফেসবুক পিক্সেল আইডি দিন। এটি ফেসবুক ইভেন্ট ম্যানেজার থেকে পাবেন।'
                  : 'Enter your 15-16 digit Facebook Pixel ID. Find it in Facebook Events Manager.'}
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {lang === 'bn' ? 'পিক্সেল আইডি কিভাবে পাবেন?' : 'How to find your Pixel ID?'}
          </h4>
          <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
            <li>{lang === 'bn' ? 'Facebook Business Suite এ লগইন করুন' : 'Log in to Facebook Business Suite'}</li>
            <li>{lang === 'bn' ? 'Events Manager এ যান' : 'Go to Events Manager'}</li>
            <li>{lang === 'bn' ? 'আপনার Pixel সিলেক্ট করুন' : 'Select your Pixel'}</li>
            <li>{lang === 'bn' ? 'Settings থেকে Pixel ID কপি করুন' : 'Copy Pixel ID from Settings'}</li>
          </ol>
          <a
            href="https://business.facebook.com/events_manager"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {lang === 'bn' ? 'Events Manager এ যান' : 'Open Events Manager'}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* What gets tracked */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">
            {lang === 'bn' ? 'পিক্সেল কি ট্র্যাক করবে?' : 'What will Pixel track?'}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { event: 'PageView', bn: 'পেইজ ভিউ' },
              { event: 'ViewContent', bn: 'প্রোডাক্ট ভিউ' },
              { event: 'AddToCart', bn: 'কার্টে যোগ' },
              { event: 'InitiateCheckout', bn: 'চেকআউট শুরু' },
              { event: 'Purchase', bn: 'অর্ডার সম্পন্ন' },
              { event: 'Lead', bn: 'লিড জেনারেশন' },
            ].map(({ event, bn }) => (
              <div key={event} className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{lang === 'bn' ? bn : event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving 
              ? (lang === 'bn' ? 'সেভ হচ্ছে...' : 'Saving...') 
              : (lang === 'bn' ? 'সেভ করুন' : 'Save Settings')}
          </button>
        </div>
      </fetcher.Form>
    </div>
  );
}
