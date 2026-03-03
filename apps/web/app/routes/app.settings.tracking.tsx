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
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { useState } from 'react';
import { 
  Save, AlertCircle, CheckCircle, Facebook, ExternalLink, Copy, Eye, EyeOff,
  BarChart3, AlertTriangle, Info, ArrowLeft
} from 'lucide-react';
import { useTranslation } from '~/contexts/LanguageContext';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select({
    id: stores.id,
    name: stores.name,
    subdomain: stores.subdomain,
    facebookPixelId: stores.facebookPixelId,
    facebookAccessToken: stores.facebookAccessToken,
    googleAnalyticsId: stores.googleAnalyticsId,
  }).from(stores).where(eq(stores.id, storeId)).get();

  if (!store) throw new Response('Store not found', { status: 404 });

  return json({ store });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const formData = await request.formData();
  const pixelId = (formData.get('facebookPixelId') as string || '').trim();
  const accessToken = (formData.get('facebookAccessToken') as string || '').trim();
  const gaId = (formData.get('googleAnalyticsId') as string || '').trim();

  // Validate Facebook Pixel ID format (15-16 digits)
  if (pixelId && !/^\d{15,16}$/.test(pixelId)) {
    return json({ 
      success: false, 
      error: 'invalidPixelId'
    }, { status: 400 });
  }

  // Validate GA4 Measurement ID format (G-XXXXXXXXXX)
  if (gaId && !/^G-[A-Z0-9]{8,12}$/i.test(gaId)) {
    return json({ 
      success: false, 
      error: 'invalidGaId'
    }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  await db
    .update(stores)
    .set({ 
      facebookPixelId: pixelId || null,
      facebookAccessToken: accessToken || null,
      googleAnalyticsId: gaId || null,
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true, message: 'trackingSaved' });
}

export default function TrackingSettings() {
  const { store } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();
  const { t } = useTranslation();
  
  const [showPixelId, setShowPixelId] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showGaId, setShowGaId] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isSaving = fetcher.state === 'submitting';
  const isFbConfigured = !!store.facebookPixelId;
  const isCapiConfigured = !!store.facebookPixelId && !!store.facebookAccessToken;
  const isGaConfigured = !!store.googleAnalyticsId;
  const isAnyConfigured = isFbConfigured || isGaConfigured;

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value)
      .then(() => {
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
      })
      .catch(() => {
        // Clipboard API not available — show manual copy hint
      });
  };

  // Shared status messages component
  const StatusMessages = () => (
    <>
      {fetcher.data?.success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {fetcher.data.message ? t(fetcher.data.message) : ''}
        </div>
      )}
      {fetcher.data?.error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {fetcher.data.error ? t(fetcher.data.error) : ''}
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden -mx-4 -mt-4">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between h-[60px] px-4">
            <Link to="/app/settings" className="p-2 -ml-2">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">{t('trackingAnalyticsHeader')}</h1>
            <div className="w-10" />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex flex-col gap-5 p-4 pb-32">
          <StatusMessages />

          {/* Status Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className={`rounded-xl border p-3 ${isFbConfigured ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <Facebook className={`w-4 h-4 ${isFbConfigured ? 'text-blue-600' : 'text-gray-400'}`} />
                <div className={`w-2 h-2 rounded-full ${isFbConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className={`text-sm font-medium mt-1 ${isFbConfigured ? 'text-blue-700' : 'text-gray-500'}`}>FB Pixel</p>
            </div>
            <div className={`rounded-xl border p-3 ${isGaConfigured ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-2">
                <BarChart3 className={`w-4 h-4 ${isGaConfigured ? 'text-orange-600' : 'text-gray-400'}`} />
                <div className={`w-2 h-2 rounded-full ${isGaConfigured ? 'bg-green-500' : 'bg-gray-300'}`} />
              </div>
              <p className={`text-sm font-medium mt-1 ${isGaConfigured ? 'text-orange-700' : 'text-gray-500'}`}>GA4</p>
            </div>
          </div>

          {/* Facebook Pixel Section */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Facebook Pixel</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <fetcher.Form method="post" id="tracking-form-mobile" className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pixel ID</label>
                  <div className="relative">
                    <input
                      type={showPixelId ? 'text' : 'password'}
                      name="facebookPixelId"
                      defaultValue={store.facebookPixelId || ''}
                      placeholder="123456789012345"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPixelId(!showPixelId)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
                    >
                      {showPixelId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Token</label>
                  <div className="relative">
                    <input
                      type={showAccessToken ? 'text' : 'password'}
                      name="facebookAccessToken"
                      defaultValue={store.facebookAccessToken || ''}
                      placeholder="EAAG..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-12 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
                    >
                      {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </fetcher.Form>
            </div>
          </div>

          {/* Google Analytics Section */}
          <div>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Google Analytics</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <fetcher.Form method="post" id="tracking-form-mobile-ga" className="p-4">
                {/* Mirror the FB fields so both pixel + GA submit together via the save button */}
                <input type="hidden" name="facebookPixelId" value={store.facebookPixelId || ''} />
                <input type="hidden" name="facebookAccessToken" value={store.facebookAccessToken || ''} />
                <label className="block text-sm font-medium text-gray-700 mb-2">Measurement ID</label>
                <div className="relative">
                  <input
                    type={showGaId ? 'text' : 'password'}
                    name="googleAnalyticsId"
                    defaultValue={store.googleAnalyticsId || ''}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 font-mono pr-12 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowGaId(!showGaId)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400"
                  >
                    {showGaId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </fetcher.Form>
            </div>
          </div>
        </div>

        {/* Fixed Save Button */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          <button
            type="submit"
            form="tracking-form-mobile"
            disabled={isSaving}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-2xl transition disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={() => {
              // Also submit the GA form so all fields are saved
              document.getElementById('tracking-form-mobile-ga')?.dispatchEvent(
                new Event('submit', { bubbles: true, cancelable: true })
              );
            }}
          >
            <Save className="w-4 h-4" />
            {isSaving ? t('savingSettings') : t('saveSettings')}
          </button>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-3 rounded-xl">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('trackingAnalyticsHeader')}
              </h1>
              <p className="text-gray-500 mt-1">
                {t('trackingSetupDesc')}
              </p>
            </div>
          </div>

      {/* Success/Error Messages */}
      <StatusMessages />

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
                  ? t('active')
                  : t('notConfigured')}
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
                  ? t('active')
                  : t('notConfigured')}
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
                    title={showPixelId ? t('hide') : t('show')}
                  >
                    {showPixelId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {store.facebookPixelId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(store.facebookPixelId!, 'fb')}
                      className={`p-2 ${copiedField === 'fb' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                      title={t('copy')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t('fbPixelIdDesc')}
              </p>
            </div>
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {t('openEventsManager')}
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Conversion API Access Token */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Conversion API Access Token
                {isCapiConfigured && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {t('capiActive')}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  type={showAccessToken ? 'text' : 'password'}
                  name="facebookAccessToken"
                  defaultValue={store.facebookAccessToken || ''}
                  placeholder="EAAG..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-12 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAccessToken(!showAccessToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
                  title={showAccessToken ? t('hide') : t('show')}
                >
                  {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Simple Setup Instructions */}
              <div className="mt-3 bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-2">
                <p className="font-medium text-gray-900">
                  {t('howToGet')}
                </p>
                <div className="space-y-1.5">
                  <p>
                    {t('capiStep1')}
                  </p>
                  <p>
                    {t('capiStep2')}
                  </p>
                  <p>
                    {t('capiStep3')}
                  </p>
                  <p>
                    {t('capiStep4')}
                  </p>
                  <p>
                    {t('capiStep5')}
                  </p>
                  <p>
                    {t('capiStep6')}
                  </p>
                </div>
                <p className="text-amber-600 text-xs mt-2">
                  {t('capiSecretWarning')}
                </p>
              </div>

              {isFbConfigured && !isCapiConfigured && (
                <div className="mt-3 flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg text-sm">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    {t('capiBenefit')}
                  </p>
                </div>
              )}
            </div>
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
                    title={showGaId ? t('hide') : t('show')}
                  >
                    {showGaId ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {store.googleAnalyticsId && (
                    <button
                      type="button"
                      onClick={() => handleCopy(store.googleAnalyticsId!, 'ga')}
                      className={`p-2 ${copiedField === 'ga' ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'}`}
                      title={t('copyBtn')}
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t('gaIdDesc')}
              </p>
            </div>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-800 text-sm font-medium"
            >
              {t('openGA')}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Events Tracked Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {t('eventsTracked')}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {[
              { event: 'PageView', bn: 'pageView', desc: 'everyPageLoad' },
              { event: 'ViewContent', bn: 'viewContent', desc: 'productPage' },
              { event: 'AddToCart', bn: 'addToCart', desc: 'addToCart' },
              { event: 'InitiateCheckout', bn: 'initiateCheckout', desc: 'checkoutPage' },
              { event: 'Purchase', bn: 'purchase', desc: 'thankYouPage' },
              { event: 'Lead', bn: 'lead', desc: 'contactForm' },
            ].map(({ event, bn, desc }) => (
              <div key={event} className="flex items-center gap-2 text-gray-600">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div>
                  <span className="font-medium">{t(bn)}</span>
                  <span className="text-gray-400 text-xs ml-1">({t(desc)})</span>
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
                  {t('importantInfo')}
                </h4>
                <p className="text-sm text-amber-700 mt-1">
                  {t('pixelWarning')}
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Save className="w-4 h-4" />
            {isSaving 
              ? t('savingSettings') 
              : t('saveSettings')}
          </button>
        </div>
      </fetcher.Form>
        </div>
      </div>
    </>
  );
}
