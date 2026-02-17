/**
 * Business Mode Settings
 * 
 * Allows merchants to switch between:
 * - E-commerce Store (products, cart, checkout)
 * - Lead Generation Website (forms, lead capture)
 * - Hybrid (both)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation } from '@remix-run/react';
import { useEffect } from 'react';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { invalidateUnifiedSettingsCache } from '~/services/unified-storefront-settings.server';
import { ShoppingCart, Users, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Unauthorized', { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Determine current mode
  const homeEntry = (store as any).homeEntry || 'store_home';
  const storeEnabled = store.storeEnabled ?? true;
  let leadGenEnabled = false;
  if (store.leadGenConfig) {
    try {
      const parsed = JSON.parse(store.leadGenConfig as string) as { enabled?: boolean };
      leadGenEnabled = parsed.enabled === true;
    } catch {
      leadGenEnabled = false;
    }
  }
  
  let currentMode = 'ecommerce';
  if (homeEntry === 'lead_gen' || homeEntry.startsWith('page:')) {
    currentMode = 'lead-gen';
  }
  if (storeEnabled && leadGenEnabled) {
    currentMode = 'hybrid';
  }

  return json({
    store,
    currentMode,
    storeEnabled,
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const mode = formData.get('mode') as string;

  try {
    let updateData: any = {
      updatedAt: new Date(),
    };

    switch (mode) {
      case 'ecommerce':
        // Enable e-commerce, disable lead gen
        updateData.storeEnabled = 1;
        updateData.homeEntry = 'store_home';
        updateData.leadGenConfig = JSON.stringify({ enabled: false });
        break;

      case 'lead-gen':
        // Disable e-commerce, enable lead gen
        updateData.storeEnabled = 0;
        updateData.homeEntry = 'lead_gen';
        updateData.leadGenConfig = JSON.stringify({ 
          enabled: true, 
          themeId: 'professional-services' 
        });
        break;

      case 'hybrid':
        // Enable both
        updateData.storeEnabled = 1;
        updateData.homeEntry = 'store_home';
        updateData.leadGenConfig = JSON.stringify({ 
          enabled: true, 
          themeId: 'professional-services' 
        });
        break;

      default:
        return json({ success: false, error: 'Invalid mode' }, { status: 400 });
    }

    await db
      .update(stores)
      .set(updateData)
      .where(eq(stores.id, storeId));

    // Invalidate all caches (D1 + KV + DO) in one call
    try {
      await invalidateUnifiedSettingsCache(
        {
          KV: context.cloudflare.env.STORE_CACHE,
          STORE_CONFIG_SERVICE: context.cloudflare.env.STORE_CONFIG_SERVICE as Fetcher,
        },
        storeId
      );
    } catch (cacheError) {
      console.error('Cache invalidation error:', cacheError);
    }

    return json({ 
      success: true, 
      message: 'Business mode updated successfully',
      redirect: mode === 'lead-gen' ? '/app/settings/lead-gen' : '/app/settings/homepage',
    });

  } catch (error) {
    console.error('Business mode update error:', error);
    return json({ 
      success: false, 
      error: 'Failed to update. Please try again.' 
    }, { status: 500 });
  }
}

export default function BusinessModePage() {
  const { currentMode, storeEnabled } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  // Handle redirect after successful update
  useEffect(() => {
    if (!(actionData?.success && 'redirect' in actionData && actionData.redirect)) return;
    const timer = window.setTimeout(() => {
      window.location.href = actionData.redirect as string;
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [actionData]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Business Mode</h1>
        <p className="text-gray-600 mt-1">
          Choose how you want to use your website
        </p>
      </div>

      {/* Success Message */}
      {actionData?.success && 'message' in actionData && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-green-800 font-medium">{actionData.message}</p>
            <p className="text-green-700 text-sm mt-1">Redirecting to settings...</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {actionData?.success === false && 'error' in actionData && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-800">{actionData.error}</span>
        </div>
      )}

      {/* Mode Selection */}
      <Form method="post" className="space-y-6">
        {/* E-commerce Mode */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="ecommerce"
            defaultChecked={currentMode === 'ecommerce'}
            onChange={(e) => {
              if (e.target.checked) {
                e.target.form?.requestSubmit();
              }
            }}
            disabled={isSubmitting}
            className="sr-only peer"
          />
          <div className="bg-white p-6 rounded-lg border-2 peer-checked:border-blue-500 peer-checked:bg-blue-50 hover:border-gray-400 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  E-commerce Store
                </h3>
                <p className="text-gray-600 mb-3">
                  Sell products online with a shopping cart and checkout system
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Product Catalog
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Shopping Cart
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Checkout
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Orders
                  </span>
                </div>
              </div>
              {currentMode === 'ecommerce' && (
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />
              )}
            </div>
          </div>
        </label>

        {/* Lead Generation Mode */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="lead-gen"
            defaultChecked={currentMode === 'lead-gen'}
            onChange={(e) => {
              if (e.target.checked) {
                e.target.form?.requestSubmit();
              }
            }}
            disabled={isSubmitting}
            className="sr-only peer"
          />
          <div className="bg-white p-6 rounded-lg border-2 peer-checked:border-purple-500 peer-checked:bg-purple-50 hover:border-gray-400 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Lead Generation Website
                </h3>
                <p className="text-gray-600 mb-3">
                  Capture leads with professional landing pages and contact forms
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Landing Pages
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Contact Forms
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Lead Dashboard
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Email Alerts
                  </span>
                </div>
              </div>
              {currentMode === 'lead-gen' && (
                <CheckCircle className="w-6 h-6 text-purple-600 flex-shrink-0" />
              )}
            </div>
          </div>
        </label>

        {/* Hybrid Mode */}
        <label className="block cursor-pointer">
          <input
            type="radio"
            name="mode"
            value="hybrid"
            defaultChecked={currentMode === 'hybrid'}
            onChange={(e) => {
              if (e.target.checked) {
                e.target.form?.requestSubmit();
              }
            }}
            disabled={isSubmitting}
            className="sr-only peer"
          />
          <div className="bg-white p-6 rounded-lg border-2 peer-checked:border-green-500 peer-checked:bg-green-50 hover:border-gray-400 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 mb-2">
                  Hybrid (Both)
                </h3>
                <p className="text-gray-600 mb-3">
                  Use both e-commerce and lead generation features together
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    All E-commerce Features
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    All Lead Gen Features
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                    Maximum Flexibility
                  </span>
                </div>
              </div>
              {currentMode === 'hybrid' && (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
              )}
            </div>
          </div>
        </label>
      </Form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">What happens when you switch?</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>E-commerce:</strong> Your store homepage with products will be shown</li>
          <li>• <strong>Lead Gen:</strong> A professional landing page with contact form will be shown</li>
          <li>• <strong>Hybrid:</strong> E-commerce homepage shown, but lead capture also available</li>
          <li>• You can switch modes anytime without losing data</li>
        </ul>
      </div>

      {/* Current Status */}
      <div className="mt-6 bg-gray-50 border rounded-lg p-4">
        <div className="text-sm text-gray-600">
          <strong>Current Status:</strong>
          <div className="mt-2 space-y-1">
            <div>• Store Enabled: {storeEnabled ? '✅ Yes' : '❌ No'}</div>
            <div>• Mode: {currentMode === 'ecommerce' ? '🛒 E-commerce' : currentMode === 'lead-gen' ? '📋 Lead Generation' : '🔄 Hybrid'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
