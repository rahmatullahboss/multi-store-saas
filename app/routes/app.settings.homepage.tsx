/**
 * Homepage Strategy Settings Page
 * 
 * Route: /app/settings/homepage
 * 
 * Allows paid users to choose their homepage strategy:
 * - Funnel Mode: Landing page as homepage (single product focus)
 * - Storefront Mode: Full catalog as homepage
 * 
 * CRITICAL: When switching from Funnel to Storefront, auto-saves
 * the current landing config as a campaign for zero data loss.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, products, savedLandingConfigs } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { canUseStoreMode, type PlanType } from '~/utils/plans.server';
import { 
  Home, ShoppingBag, FileText, CheckCircle, Loader2, 
  Rocket, Crown, ExternalLink, ArrowRight, Sparkles
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Homepage Strategy - Settings' }];
};

// ============================================================================
// LOADER - Fetch current store mode and plan
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  const storeResult = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      mode: stores.mode,
      planType: stores.planType,
      featuredProductId: stores.featuredProductId,
      landingConfig: stores.landingConfig,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  const planType = (store.planType as PlanType) || 'free';
  const allowStoreMode = canUseStoreMode(planType);

  // Get featured product name if exists
  let featuredProduct = null;
  if (store.featuredProductId) {
    const productResult = await db
      .select({ id: products.id, title: products.title })
      .from(products)
      .where(eq(products.id, store.featuredProductId))
      .limit(1);
    featuredProduct = productResult[0] || null;
  }

  // Get saved landing configs count
  const savedConfigs = await db
    .select({ id: savedLandingConfigs.id })
    .from(savedLandingConfigs)
    .where(eq(savedLandingConfigs.storeId, storeId));

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      mode: store.mode || 'landing',
      planType,
      featuredProductId: store.featuredProductId,
      hasLandingConfig: !!store.landingConfig,
    },
    featuredProduct,
    savedConfigsCount: savedConfigs.length,
    allowStoreMode,
  });
}

// ============================================================================
// ACTION - Handle mode switch with auto-save
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const newMode = formData.get('mode') as 'landing' | 'store';

  if (!newMode || !['landing', 'store'].includes(newMode)) {
    return json({ error: 'Invalid mode' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get current store data
  const storeResult = await db
    .select({
      mode: stores.mode,
      planType: stores.planType,
      landingConfig: stores.landingConfig,
      featuredProductId: stores.featuredProductId,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  // Validate plan for store mode
  if (newMode === 'store') {
    const planType = (store.planType as PlanType) || 'free';
    if (!canUseStoreMode(planType)) {
      return json({ 
        error: 'Full Store mode requires a paid plan. Please upgrade.' 
      }, { status: 403 });
    }
  }

  // If switching from landing to store, auto-save the landing config
  let savedConfigId: number | null = null;
  if (store.mode === 'landing' && newMode === 'store' && store.landingConfig) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });

    // Insert saved landing config
    const insertResult = await db
      .insert(savedLandingConfigs)
      .values({
        storeId,
        productId: store.featuredProductId,
        name: `Homepage Backup - ${dateStr}`,
        landingConfig: store.landingConfig,
        isHomepageBackup: true,
        createdAt: now,
      })
      .returning({ id: savedLandingConfigs.id });

    savedConfigId = insertResult[0]?.id || null;
    console.log(`[MODE_SWITCH] Saved landing config ${savedConfigId} for store ${storeId}`);
  }

  // Update store mode
  await db.update(stores).set({
    mode: newMode,
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  console.log(`[MODE_SWITCH] Store ${storeId} switched from ${store.mode} to ${newMode}`);

  return json({ 
    success: true, 
    newMode,
    savedConfigId,
    featuredProductId: store.featuredProductId,
    message: newMode === 'store' && savedConfigId 
      ? 'Your landing page has been saved as a campaign!' 
      : 'Homepage strategy updated successfully.'
  });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function HomepageStrategyPage() {
  const { store, featuredProduct, savedConfigsCount, allowStoreMode } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t, lang } = useTranslation();
  
  const [selectedMode, setSelectedMode] = useState<'landing' | 'store'>(store.mode as 'landing' | 'store');

  // Build offer URL for showing after mode switch
  const getOfferUrl = () => {
    const domain = store.customDomain || `${store.subdomain}.digitalcare.site`;
    return `https://${domain}/offers/${store.featuredProductId}`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Home className="w-6 h-6 text-violet-600" />
          {t('homepageSettings')}
        </h1>
        <p className="text-gray-600 mt-1">
          {lang === 'bn' ? 'আপনার স্টোরের হোমপেজ কেমন হবে তা নির্ধারণ করুন' : "Choose how your store's homepage appears to customers"}
        </p>
      </div>

      {/* Success Message with Offer Link */}
      {actionData && 'success' in actionData && actionData.success && actionData.savedConfigId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-800 text-lg">
                Your landing page has been saved!
              </h3>
              <p className="text-emerald-700 mt-1">
                Your previous homepage is now available as a campaign link. Perfect for Facebook Ads!
              </p>
              <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200">
                <p className="text-sm text-gray-600 mb-2">Campaign Link:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-50 px-3 py-2 rounded border text-violet-600 font-mono">
                    {getOfferUrl()}
                  </code>
                  <a
                    href={getOfferUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Success Message */}
      {actionData && 'success' in actionData && actionData.success && !actionData.savedConfigId && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionData.message}
        </div>
      )}

      {/* Error Message */}
      {actionData && 'error' in actionData && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      {/* Current Status */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Current Homepage</h2>
            <p className="text-sm text-gray-500">
              {store.mode === 'landing' 
                ? 'Landing Page (Single Product Focus)' 
                : 'Full Store (Product Catalog)'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            store.mode === 'landing' 
              ? 'bg-violet-100 text-violet-700' 
              : 'bg-emerald-100 text-emerald-700'
          }`}>
            {store.mode === 'landing' ? 'Funnel Mode' : 'Storefront Mode'}
          </span>
        </div>

        {/* Featured Product Info */}
        {store.mode === 'landing' && featuredProduct && (
          <div className="mt-4 p-3 bg-violet-50 rounded-lg border border-violet-100">
            <p className="text-sm text-violet-700">
              <Sparkles className="w-4 h-4 inline mr-1" />
              <strong>Featured Product:</strong> {featuredProduct.title}
            </p>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      {allowStoreMode ? (
        <Form method="post" className="space-y-4">
          <input type="hidden" name="mode" value={selectedMode} />

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Choose Your Strategy</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Funnel Mode */}
              <button
                type="button"
                onClick={() => setSelectedMode('landing')}
                className={`relative flex flex-col items-start p-5 border-2 rounded-xl transition text-left ${
                  selectedMode === 'landing'
                    ? 'border-violet-500 bg-violet-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mb-3">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Funnel Mode</h3>
                <p className="text-sm text-gray-500">
                  High-converting landing page with single product focus. Best for Facebook Ads.
                </p>
                {selectedMode === 'landing' && (
                  <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-violet-600" />
                )}
              </button>

              {/* Storefront Mode */}
              <button
                type="button"
                onClick={() => setSelectedMode('store')}
                className={`relative flex flex-col items-start p-5 border-2 rounded-xl transition text-left ${
                  selectedMode === 'store'
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mb-3">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Storefront Mode</h3>
                <p className="text-sm text-gray-500">
                  Full product catalog with categories, cart, and checkout. Classic e-commerce.
                </p>
                {selectedMode === 'store' && (
                  <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-emerald-600" />
                )}
              </button>
            </div>

            {/* Auto-save Notice */}
            {store.mode === 'landing' && selectedMode === 'store' && store.hasLandingConfig && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Rocket className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Your landing page will be saved automatically
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                      We'll create a campaign link at <code className="bg-blue-100 px-1 rounded">/offers/{store.featuredProductId}</code> so you can still use it for ads.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || selectedMode === store.mode}
              className="mt-6 w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Switching...
                </>
              ) : selectedMode === store.mode ? (
                'No Changes'
              ) : (
                <>
                  Apply Strategy
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </Form>
      ) : (
        /* Free User - Upgrade Prompt */
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Unlock Storefront Mode
            </h2>
            <p className="text-gray-600 mb-6">
              Upgrade to a paid plan to switch between Funnel and Storefront modes.
            </p>
            <Link
              to="/app/upgrade"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
            >
              <Crown className="w-5 h-5" />
              Upgrade Now
            </Link>
          </div>
        </div>
      )}

      {/* Saved Configs Info */}
      {savedConfigsCount > 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            <Rocket className="w-4 h-4 inline mr-1 text-violet-600" />
            You have <strong>{savedConfigsCount}</strong> saved campaign{savedConfigsCount > 1 ? 's' : ''} from previous mode switches.
          </p>
        </div>
      )}
    </div>
  );
}
