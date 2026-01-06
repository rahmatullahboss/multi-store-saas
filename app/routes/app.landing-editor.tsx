/**
 * Landing Page Visual Editor Route
 * 
 * Route: /app/landing-editor
 * 
 * The "Editor Wrapper" page that provides:
 * - Visual editing of landing page via LandingPageTemplate in edit mode
 * - State management for dirty config detection
 * - Floating SaveBar for Reset/Save actions
 * - Database persistence for landingConfig changes
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { stores, products } from '@db/schema';
import { parseLandingConfig, defaultLandingConfig, type LandingConfig } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ExternalLink, Sparkles } from 'lucide-react';
import { LandingPageTemplate } from '~/components/templates/LandingPageTemplate';
import { EditorSaveBar } from '~/components/editor';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [
  { title: 'Visual Editor - Landing Page Builder' },
];

// ============================================================================
// LOADER - Fetch store, config, and featured product
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Fetch store
  const storeResult = await db
    .select()
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const store = storeResult[0];
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Parse landing config
  const landingConfig = parseLandingConfig(store.landingConfig as string | null) || defaultLandingConfig;

  // Fetch featured product
  let product = null;
  if (store.featuredProductId) {
    const productResult = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        title: products.title,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(and(
        eq(products.id, store.featuredProductId),
        eq(products.storeId, storeId)
      ))
      .limit(1);
    
    product = productResult[0] || null;
  }

  // If no featured product, get the first published product
  if (!product) {
    const firstProduct = await db
      .select({
        id: products.id,
        storeId: products.storeId,
        title: products.title,
        description: products.description,
        price: products.price,
        compareAtPrice: products.compareAtPrice,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(and(
        eq(products.storeId, storeId),
        eq(products.isPublished, true)
      ))
      .limit(1);
    
    product = firstProduct[0] || null;
  }

  // Return placeholder product if none exists
  if (!product) {
    product = {
      id: 0,
      storeId,
      title: 'Sample Product',
      description: 'This is a sample product. Add products to your store to see them here.',
      price: 1500,
      compareAtPrice: 2000,
      imageUrl: null,
    };
  }

  return json({
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
    },
    landingConfig,
    product,
    currency: 'BDT',
  });
}

// ============================================================================
// ACTION - Save landing config to database
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request);
  if (!storeId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const configJson = formData.get('config') as string;

    if (!configJson) {
      return json({ success: false, error: 'Config is required' }, { status: 400 });
    }

    // Parse and validate the config
    let newConfig: LandingConfig;
    try {
      newConfig = JSON.parse(configJson);
    } catch {
      return json({ success: false, error: 'Invalid config format' }, { status: 400 });
    }

    const db = drizzle(context.cloudflare.env.DB);

    // Update store with new landing config
    await db
      .update(stores)
      .set({
        landingConfig: JSON.stringify(newConfig),
        updatedAt: new Date(),
      })
      .where(eq(stores.id, storeId));

    return json({ success: true, message: 'Landing page saved!' });
  } catch (error) {
    console.error('[Landing Editor] Save failed:', error);
    return json(
      { success: false, error: 'Failed to save. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function LandingEditorPage() {
  const { store, landingConfig, product, currency } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{ success: boolean; error?: string; message?: string }>();
  const { lang } = useTranslation();

  // State: Initial (DB) config vs Current (potentially modified) config
  const initialConfigRef = useRef(landingConfig);
  const [currentConfig, setCurrentConfig] = useState<LandingConfig>(landingConfig);
  const [showSuccess, setShowSuccess] = useState(false);

  // Dirty detection
  const hasUnsavedChanges = JSON.stringify(currentConfig) !== JSON.stringify(initialConfigRef.current);

  // Fetcher state
  const isSaving = fetcher.state === 'submitting';
  const saveSuccess = fetcher.data?.success;

  // Handle config changes from LandingPageTemplate
  const handleConfigChange = useCallback((newConfig: LandingConfig) => {
    setCurrentConfig(newConfig);
  }, []);

  // Reset to initial config
  const handleReset = useCallback(() => {
    setCurrentConfig(initialConfigRef.current);
  }, []);

  // Save changes
  const handleSave = useCallback(() => {
    fetcher.submit(
      { config: JSON.stringify(currentConfig) },
      { method: 'POST' }
    );
  }, [currentConfig, fetcher]);

  // Handle save success
  useEffect(() => {
    if (fetcher.data?.success && fetcher.state === 'idle') {
      // Update initial ref to new saved state
      initialConfigRef.current = currentConfig;
      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [fetcher.data, fetcher.state, currentConfig]);

  // Preview URL
  const previewUrl = `https://${store.subdomain}.digitalcare.site`;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Editor Header */}
      <header className="fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back + Title */}
            <div className="flex items-center gap-3">
              <Link
                to="/app/landing-builder"
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  {lang === 'bn' ? 'ভিজ্যুয়াল এডিটর' : 'Visual Editor'}
                </h1>
                <p className="text-xs text-gray-500">{store.name}</p>
              </div>
            </div>

            {/* Right: Preview link */}
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              <ExternalLink className="w-4 h-4" />
              {lang === 'bn' ? 'প্রিভিউ' : 'Preview'}
            </a>
          </div>
        </div>
      </header>

      {/* Editor Content - LandingPageTemplate in Edit Mode */}
      <main className="pt-14 pb-20">
        <LandingPageTemplate
          storeName={store.name}
          storeId={store.id}
          product={product}
          config={currentConfig}
          currency={currency}
          isPreview={true} // Disable form submission in editor
          isEditMode={true}
          onConfigChange={handleConfigChange}
        />
      </main>

      {/* Save Bar - Show when there are unsaved changes */}
      {(hasUnsavedChanges || showSuccess) && (
        <EditorSaveBar
          onReset={handleReset}
          onSave={handleSave}
          isSaving={isSaving}
          isSuccess={showSuccess}
        />
      )}

      {/* Error Toast */}
      {fetcher.data?.error && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">
          ❌ {fetcher.data.error}
        </div>
      )}
    </div>
  );
}
