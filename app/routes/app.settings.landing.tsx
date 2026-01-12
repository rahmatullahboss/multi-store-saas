/**
 * Landing Mode Settings Page
 * 
 * Route: /app/settings/landing
 * 
 * Features:
 * - Toggle store mode (store vs landing)
 * - Featured product selector
 * - Landing config editor (headline, video, testimonials, CTA)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { 
  Loader2, CheckCircle, Play, MessageSquare, Zap, ArrowLeft, 
  Plus, Trash2, Target, Video, Users 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from '@remix-run/react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Landing Mode Settings - Multi-Store SaaS' }];
};

// ============================================================================
// LOADER - Fetch store data and products
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
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
  
  // Get all products for featured product selector
  const storeProducts = await db
    .select({ id: products.id, title: products.title, imageUrl: products.imageUrl, price: products.price })
    .from(products)
    .where(eq(products.storeId, storeId))
    .limit(50);

  const landingConfig = parseLandingConfig(store.landingConfig as string | null) || defaultLandingConfig;

  return json({
    store: {
      id: store.id,
      name: store.name,
      mode: store.mode || 'store',
      featuredProductId: store.featuredProductId,
      landingConfig,
    },
    products: storeProducts,
  });
}

// ============================================================================
// ACTION - Update landing settings
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const mode = formData.get('mode') as 'store' | 'landing';
  const featuredProductId = formData.get('featuredProductId') as string;
  const headline = formData.get('headline') as string;
  const subheadline = formData.get('subheadline') as string;
  const videoUrl = formData.get('videoUrl') as string;
  const ctaText = formData.get('ctaText') as string;
  const ctaSubtext = formData.get('ctaSubtext') as string;
  const urgencyText = formData.get('urgencyText') as string;
  const guaranteeText = formData.get('guaranteeText') as string;
  const testimonialsJson = formData.get('testimonials') as string;

  let testimonials: LandingConfig['testimonials'] = [];
  try {
    if (testimonialsJson) {
      testimonials = JSON.parse(testimonialsJson);
    }
  } catch {
    // Invalid JSON, ignore
  }

  const landingConfig: LandingConfig = {
    headline: headline || 'Transform Your Life Today',
    subheadline: subheadline || '',
    videoUrl: videoUrl || '',
    ctaText: ctaText || 'Buy Now',
    ctaSubtext: ctaSubtext || '',
    urgencyText: urgencyText || '',
    guaranteeText: guaranteeText || '',
    testimonials,
  };

  const db = drizzle(context.cloudflare.env.DB);

  await db
    .update(stores)
    .set({
      mode: mode || 'store',
      featuredProductId: featuredProductId ? parseInt(featuredProductId) : null,
      landingConfig: JSON.stringify(landingConfig),
      updatedAt: new Date(),
    })
    .where(eq(stores.id, storeId));

  return json({ success: true });
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function LandingSettingsPage() {
  const { store, products: storeProducts } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [mode, setMode] = useState(store.mode);
  const [testimonials, setTestimonials] = useState<LandingConfig['testimonials']>(
    store.landingConfig.testimonials || []
  );
  const { t, lang } = useTranslation();

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  const addTestimonial = () => {
    setTestimonials([...(testimonials || []), { name: '', text: '' }]);
  };

  const removeTestimonial = (index: number) => {
    setTestimonials(testimonials?.filter((_, i) => i !== index) || []);
  };

  const updateTestimonial = (index: number, field: 'name' | 'text', value: string) => {
    const updated = [...(testimonials || [])];
    updated[index] = { ...updated[index], [field]: value };
    setTestimonials(updated);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/app/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('landingSettings')}</h1>
          <p className="text-gray-600">{t('landingSettingsDesc')}</p>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {t('settingsSaved')}
        </div>
      )}

      {/* Error Message */}
      {actionData && 'error' in actionData && actionData.error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      <Form method="post" className="space-y-6">
        <input type="hidden" name="testimonials" value={JSON.stringify(testimonials)} />

        {/* Store Mode Toggle */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{t('storeMode')}</h2>
              <p className="text-sm text-gray-500">{t('storeModeDesc')}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label
              className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition ${
                mode === 'store' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="store"
                checked={mode === 'store'}
                onChange={() => setMode('store')}
                className="sr-only"
              />
              <span className="text-2xl mb-2">🏪</span>
              <span className="font-semibold text-gray-900">{t('fullStore')}</span>
              <span className="text-sm text-gray-500">{t('fullStoreDesc')}</span>
              {mode === 'store' && (
                <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-600" />
              )}
            </label>

            <label
              className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition ${
                mode === 'landing' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="landing"
                checked={mode === 'landing'}
                onChange={() => setMode('landing')}
                className="sr-only"
              />
              <span className="text-2xl mb-2">🎯</span>
              <span className="font-semibold text-gray-900">{t('landingPage')}</span>
              <span className="text-sm text-gray-500">{t('landingPageDesc')}</span>
              {mode === 'landing' && (
                <CheckCircle className="absolute top-2 right-2 w-5 h-5 text-emerald-600" />
              )}
            </label>
          </div>
        </div>

        {/* Landing Page Settings (only shown in landing mode) */}
        {mode === 'landing' && (
          <>
            {/* Featured Product */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('featuredProduct')}</h2>
                  <p className="text-sm text-gray-500">{t('featuredProductDesc')}</p>
                </div>
              </div>

              {storeProducts.length > 0 ? (
                <select
                  name="featuredProductId"
                  defaultValue={store.featuredProductId || ''}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">{t('selectAProduct')}</option>
                  {storeProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.title} - ৳{product.price}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>{t('noProductsFoundAddFirst')}</p>
                  <Link
                    to="/app/products/new"
                    className="inline-flex items-center gap-2 mt-4 text-emerald-600 hover:text-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    {t('addProduct')}
                  </Link>
                </div>
              )}
            </div>

            {/* Headline & Copy */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('headlinesCopy')}</h2>
                  <p className="text-sm text-gray-500">{t('headlinesCopyDesc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="headline" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('mainHeadline')} *
                  </label>
                  <input
                    type="text"
                    id="headline"
                    name="headline"
                    defaultValue={store.landingConfig.headline}
                    placeholder="Transform Your Life Today"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="subheadline" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subheadline')}
                  </label>
                  <input
                    type="text"
                    id="subheadline"
                    name="subheadline"
                    defaultValue={store.landingConfig.subheadline || ''}
                    placeholder="The only solution you'll ever need"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="urgencyText" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('urgencyText')}
                  </label>
                  <input
                    type="text"
                    id="urgencyText"
                    name="urgencyText"
                    defaultValue={store.landingConfig?.urgencyText || ''}
                    placeholder={String(t('urgencyTextPlaceholder'))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="guaranteeText" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('guaranteeText')}
                  </label>
                  <input
                    type="text"
                    id="guaranteeText"
                    name="guaranteeText"
                    defaultValue={store.landingConfig.guaranteeText || ''}
                    placeholder={String(t('guaranteeTextPlaceholder'))}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            </div>

            {/* Video Embed */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('videoEmbed')}</h2>
                  <p className="text-sm text-gray-500">{t('videoEmbedDesc')}</p>
                </div>
              </div>

              <div>
                <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('videoUrl')}
                </label>
                <input
                  type="url"
                  id="videoUrl"
                  name="videoUrl"
                  defaultValue={store.landingConfig.videoUrl || ''}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('videoUrlDesc')}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Play className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{t('callToAction')}</h2>
                  <p className="text-sm text-gray-500">{t('callToActionDesc')}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buttonText')}
                  </label>
                  <input
                    type="text"
                    id="ctaText"
                    name="ctaText"
                    defaultValue={store.landingConfig.ctaText}
                    placeholder="Buy Now"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label htmlFor="ctaSubtext" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('buttonSubtext')}
                  </label>
                  <input
                    type="text"
                    id="ctaSubtext"
                    name="ctaSubtext"
                    defaultValue={store.landingConfig.ctaSubtext || ''}
                    placeholder="30-day money back guarantee"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>

                {/* Preview */}
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-2">{t('preview')}:</p>
                  <button
                    type="button"
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg"
                  >
                    🛒 {store.landingConfig.ctaText || 'Buy Now'}
                  </button>
                  {store.landingConfig.ctaSubtext && (
                    <p className="text-sm text-gray-500 mt-2">✓ {store.landingConfig.ctaSubtext}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{t('testimonials')}</h2>
                    <p className="text-sm text-gray-500">{t('testimonialsDesc')}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addTestimonial}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition"
                >
                  <Plus className="w-4 h-4" />
                  {t('add')}
                </button>
              </div>

              <div className="space-y-4">
                {testimonials && testimonials.length > 0 ? (
                  testimonials.map((testimonial, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={testimonial.name}
                            onChange={(e) => updateTestimonial(index, 'name', e.target.value)}
                            placeholder={String(t('customerName'))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                          />
                          <textarea
                            value={testimonial.text}
                            onChange={(e) => updateTestimonial(index, 'text', e.target.value)}
                            placeholder={String(t('theirReview'))}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition resize-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTestimonial(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p>{t('noTestimonialsYet')}</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:ring-4 focus:ring-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('savingSettings')}
              </>
            ) : (
              t('saveSettings')
            )}
          </button>
        </div>
      </Form>
    </div>
  );
}
