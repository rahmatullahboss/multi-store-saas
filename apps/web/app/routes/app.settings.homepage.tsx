/**
 * Homepage Settings Page - Hybrid Mode
 * 
 * Route: /app/settings/homepage
 * 
 * All users (including free) have access to both store + landing pages.
 * This page allows merchants to:
 * 1. Toggle Store routes on/off
 * 2. Select what to show on homepage (store catalog or a landing page)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, landingPages } from '@db/schema';
import { builderPages } from '@db/schema_page_builder';
import { getStoreId } from '~/services/auth.server';
import { 
  Home, FileText, CheckCircle, Loader2, 
  Settings, ExternalLink, ArrowRight, ArrowLeft, Globe, Layers
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => {
  return [{ title: 'Homepage Settings' }];
};

// ============================================================================
// LOADER - Fetch current store settings and available pages
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store with new hybrid mode fields
  const storeResult = await db
    .select({
      id: stores.id,
      name: stores.name,
      subdomain: stores.subdomain,
      customDomain: stores.customDomain,
      storeEnabled: stores.storeEnabled,
      homeEntry: stores.homeEntry,
      planType: stores.planType,
    })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Get published builder pages (Page Builder v2) for homepage selection
  const publishedBuilderPages = await db
    .select({
      id: builderPages.id,
      title: builderPages.title,
      slug: builderPages.slug,
    })
    .from(builderPages)
    .where(and(
      eq(builderPages.storeId, storeId),
      eq(builderPages.status, 'published')
    ));

  // Get published GrapesJS pages (landing_pages) for homepage selection
  const publishedGrapesPages = await db
    .select({
      id: landingPages.id,
      name: landingPages.name,
      slug: landingPages.slug,
    })
    .from(landingPages)
    .where(and(
      eq(landingPages.storeId, storeId),
      eq(landingPages.isPublished, true)
    ));

  // Combine both page types with type badges
  const allPublishedPages = [
    ...publishedBuilderPages.map(p => ({
      id: p.id,
      name: p.title || p.slug,
      slug: p.slug,
      type: 'builder' as const, // Page Builder v2
    })),
    ...publishedGrapesPages.map(p => ({
      id: `grapes:${p.id}`, // Prefix to distinguish from builder pages
      name: p.name || p.slug,
      slug: p.slug,
      type: 'grapes' as const, // GrapesJS
    })),
  ];

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
      customDomain: store.customDomain,
      storeEnabled: store.storeEnabled ?? true,
      homeEntry: store.homeEntry || 'store_home',
      planType: store.planType || 'free',
    },
    publishedPages: allPublishedPages,
  });
}

// ============================================================================
// ACTION - Handle settings update
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const storeEnabled = formData.get('storeEnabled') === 'true';
  const homeEntry = formData.get('homeEntry') as string;

  if (!homeEntry) {
    return json({ error: 'Homepage selection is required' }, { status: 400 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Ownership validation: if homeEntry references a page, verify it belongs to this store
  if (homeEntry !== 'store_home') {
    // homeEntry format: "page:{pageId}" where pageId may be a number (builderPages) or "grapes:{id}"
    const pageRef = homeEntry.startsWith('page:') ? homeEntry.slice('page:'.length) : null;

    if (!pageRef) {
      return json({ error: 'Invalid homepage selection' }, { status: 400 });
    }

    if (pageRef.startsWith('grapes:')) {
      // GrapesJS landing page — verify storeId ownership
      const grapesId = parseInt(pageRef.slice('grapes:'.length), 10);
      if (isNaN(grapesId)) {
        return json({ error: 'Invalid page reference' }, { status: 400 });
      }
      const landingPageRow = await db
        .select({ id: landingPages.id })
        .from(landingPages)
        .where(and(eq(landingPages.id, grapesId), eq(landingPages.storeId, storeId)))
        .limit(1);
      if (landingPageRow.length === 0) {
        return json({ error: 'Page not found or does not belong to your store' }, { status: 403 });
      }
    } else {
      // Builder page (UUID string) — verify storeId ownership
      const builderPageRow = await db
        .select({ id: builderPages.id })
        .from(builderPages)
        .where(and(eq(builderPages.id, pageRef), eq(builderPages.storeId, storeId)))
        .limit(1);
      if (builderPageRow.length === 0) {
        return json({ error: 'Page not found or does not belong to your store' }, { status: 403 });
      }
    }
  }

  // Update store settings
  await db.update(stores).set({
    storeEnabled,
    homeEntry,
    updatedAt: new Date(),
  }).where(eq(stores.id, storeId));

  return json({ 
    success: true, 
    messageKey: 'homepageSettingsUpdated'
  });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function HomepageSettingsPage() {
  const { store, publishedPages } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';
  const { t } = useTranslation();
  
  // Store routes are always enabled now (simplified UI)
  const [homeEntry, setHomeEntry] = useState(store.homeEntry);

  // Get store URL
  const getStoreUrl = () => {
    const domain = store.customDomain || `${store.subdomain}.ozzyl.com`;
    return `https://${domain}`;
  };

  // Shared Tips Banner Component
  const TipsBanner = () => (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-5">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">
            💡 {t('adCampaignTip') || 'অ্যাড ক্যাম্পেইনের জন্য টিপস'}
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            {t('adCampaignTipDesc') || 'স্টোর ক্যাটালগ থাকলেও, নির্দিষ্ট প্রোডাক্টের জন্য আলাদা ল্যান্ডিং পেজ তৈরি করতে পারেন। প্রতিটি পেজের নিজস্ব URL আছে যা ফেসবুক অ্যাডে ব্যবহার করতে পারবেন।'}
          </p>
          <Link
            to="/app/pages"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            <FileText className="w-4 h-4" />
            {t('managePages') || 'পেজ ম্যানেজমেন্ট'}
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );

  // Shared Homepage Selection Content
  const HomepageSelectionContent = () => (
    <div className="space-y-3">
      {/* Store Home Option */}
      <button
        type="button"
        onClick={() => setHomeEntry('store_home')}
        className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl transition text-left ${
          homeEntry === 'store_home'
            ? 'border-violet-500 bg-violet-50'
            : 'border-gray-200 hover:border-gray-300'
        }`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">
              {t('storeHome') || 'Store Catalog'}
            </h3>
            {homeEntry === 'store_home' && (
              <CheckCircle className="w-5 h-5 text-violet-600" />
            )}
          </div>
          <p className="text-sm text-gray-500">
            {t('storeHomeDesc') || 'Show your product catalog with categories and featured items.'}
          </p>
        </div>
      </button>

      {/* Landing Page Options */}
      {publishedPages.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-1">
            {t('orSelectLandingPage') || 'Or select a landing page'}
          </p>
          {publishedPages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={() => setHomeEntry(`page:${page.id}`)}
              className={`w-full flex items-start gap-4 p-4 border-2 rounded-xl transition text-left ${
                homeEntry === `page:${page.id}`
                  ? 'border-violet-500 bg-violet-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                page.type === 'grapes' 
                  ? 'bg-gradient-to-br from-orange-500 to-red-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{page.name}</h3>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      page.type === 'grapes'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {page.type === 'grapes' ? 'GrapesJS' : 'Page Builder'}
                    </span>
                  </div>
                  {homeEntry === `page:${page.id}` && (
                    <CheckCircle className="w-5 h-5 text-violet-600" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  /p/{page.slug}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No pages message */}
      {publishedPages.length === 0 && (
        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">
            {t('noPublishedPages') || 'No published landing pages. Create one in the Page Builder!'}
          </p>
          <Link
            to="/app/new-builder"
            className="inline-flex items-center gap-1 mt-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
          >
            {t('createLandingPage') || 'Create Landing Page'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );

  // Shared Store URL Preview
  const StoreUrlPreview = () => (
    <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">
            {t('yourStoreUrl') || 'Your Store URL'}
          </p>
          <p className="text-sm text-gray-500">{getStoreUrl()}</p>
        </div>
        <a
          href={getStoreUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-violet-600 transition"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );

  return (
    <>
      {/* ===== MOBILE LAYOUT ===== */}
      <div className="md:hidden -mx-4 -mt-4 pb-32">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <Link to="/app/settings" className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">{t('homepageSettings') || 'Homepage Settings'}</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>

        <div className="px-4 pt-4 space-y-4">
          {/* Success Message */}
          {actionData && 'success' in actionData && actionData.success && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {t('settingsSaved') || 'Settings saved successfully!'}
            </div>
          )}

          {/* Error Message */}
          {actionData && 'error' in actionData && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl">
              {actionData.error}
            </div>
          )}

          <Form method="post" id="homepage-settings-form-mobile" className="space-y-4">
            <input type="hidden" name="storeEnabled" value="true" />
            <input type="hidden" name="homeEntry" value={homeEntry} />

            {/* Tips Banner */}
            <TipsBanner />

            {/* Homepage Selection */}
            <div className="rounded-2xl border border-gray-100 shadow-sm bg-white p-5">
              <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-600" />
                {t('homepageSelection') || 'Homepage Selection'}
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {t('homepageSelectionDesc') || 'Choose what visitors see when they visit your main URL.'}
              </p>
              <HomepageSelectionContent />
            </div>

            {/* Store URL Preview */}
            <StoreUrlPreview />
          </Form>
        </div>

        {/* Fixed Save Button - Mobile */}
        <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
          <button
            type="submit"
            form="homepage-settings-form-mobile"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('saving') || 'Saving...'}
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                {t('saveSettings') || 'Save Settings'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* ===== DESKTOP LAYOUT ===== */}
      <div className="hidden md:block space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Home className="w-6 h-6 text-violet-600" />
              {t('homepageSettings') || 'Homepage Settings'}
            </h1>
            <p className="text-gray-600 mt-1">
              {t('homepageSettingsDesc') || 'Configure what visitors see when they visit your store.'}
            </p>
          </div>
        </div>

        {/* Success Message */}
        {actionData && 'success' in actionData && actionData.success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {t('settingsSaved') || 'Settings saved successfully!'}
          </div>
        )}

        {/* Error Message */}
        {actionData && 'error' in actionData && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {actionData.error}
          </div>
        )}

        <Form method="post" className="space-y-6">
          {/* Store routes are always enabled */}
          <input type="hidden" name="storeEnabled" value="true" />
          <input type="hidden" name="homeEntry" value={homeEntry} />

          {/* Tips for Ad Campaigns */}
          <TipsBanner />

        {/* Homepage Selection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-600" />
              {t('homepageSelection') || 'Homepage Selection'}
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              {t('homepageSelectionDesc') || 'Choose what visitors see when they visit your main URL.'}
            </p>
            <HomepageSelectionContent />
          </div>

          {/* Current Preview */}
          <StoreUrlPreview />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('saving') || 'Saving...'}
              </>
            ) : (
              <>
                <Settings className="w-5 h-5" />
                {t('saveSettings') || 'Save Settings'}
              </>
            )}
          </button>
        </Form>
      </div>
    </>
  );
}
