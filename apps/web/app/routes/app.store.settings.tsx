/**
 * Store Appearance Settings Page (MVP Simple Theme System)
 *
 * Allows merchants to customize basic store settings:
 * - Store name, logo, favicon
 * - Primary and accent colors
 * - Announcement banner
 *
 * @see AGENTS.md - MVP Simple Theme System section
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useActionData, Form } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { getMVPSettings, saveMVPSettings } from '~/services/mvp-settings.server';
import type { MVPSettingsWithTheme } from '~/config/mvp-theme-settings';
import { isValidMVPTheme, validateMVPSettings } from '~/config/mvp-theme-settings';
import { MVP_STORE_TEMPLATES } from '~/templates/store-registry';
import { requireUserId } from '~/services/auth.server';
import { stores } from '@db/schema';
import { createDb } from '~/lib/db.server';
import { D1Cache } from '~/services/cache-layer.server';
import { invalidateStoreConfig as invalidateStoreConfigD1 } from '~/services/store-config.server';
import { KVCache, CACHE_KEYS } from '~/services/kv-cache.server';
import { saveUnifiedStorefrontSettingsWithCacheInvalidation } from '~/services/unified-storefront-settings.server';

const MAX_STORE_NAME_LENGTH = 100;
const MAX_ANNOUNCEMENT_LENGTH = 160;

function normalizeOptionalHttpUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const userId = await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  // Get user's store - find first store where user is the owner
  // Note: stores table uses userId field to link to the owner
  const storeResult = await db
    .select()
    .from(stores)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((stores as Record<string, any>).userId, userId))
    .limit(1);

  const store = storeResult[0];

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Parse current theme config
  let themeConfig: { storeTemplateId?: string } = {};
  try {
    if (store.themeConfig) {
      themeConfig = JSON.parse(store.themeConfig as string);
    }
  } catch {
    // Ignore parse errors
  }

  const currentThemeId = themeConfig.storeTemplateId || 'luxe-boutique';

  // Get MVP settings
  const mvpSettings = await getMVPSettings(db, store.id, currentThemeId);

  return json({
    store,
    currentSettings: mvpSettings,
    availableThemes: MVP_STORE_TEMPLATES.map((t) => ({
      id: t.id,
      name: t.name,
      thumbnail: t.thumbnail,
      description: t.description,
    })),
  });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const userId = await requireUserId(request, context.cloudflare.env);
  const db = drizzle(context.cloudflare.env.DB);

  // Get user's store - find first store where user is the owner
  const storeResult = await db
    .select()
    .from(stores)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((stores as Record<string, any>).userId, userId))
    .limit(1);

  const store = storeResult[0];

  if (!store) {
    return json({ error: 'Store not found' }, { status: 404 });
  }

  const formData = await request.formData();

  // Get current theme
  let themeConfig: { storeTemplateId?: string } = {};
  try {
    if (store.themeConfig) {
      themeConfig = JSON.parse(store.themeConfig as string);
    }
  } catch {
    // Ignore parse errors
  }

  const currentThemeId = themeConfig.storeTemplateId || 'luxe-boutique';

  // Get current settings
  const currentSettings = await getMVPSettings(db, store.id, currentThemeId);

  // Parse form data
  const themeId = formData.get('themeId') as string;
  const storeNameInput = ((formData.get('storeName') as string) || '').trim();
  const logoInput = (formData.get('logo') as string) || '';
  const faviconInput = (formData.get('favicon') as string) || '';
  const primaryColor = (
    (formData.get('primaryColorText') as string) ||
    (formData.get('primaryColor') as string) ||
    ''
  ).trim();
  const accentColor = (
    (formData.get('accentColorText') as string) ||
    (formData.get('accentColor') as string) ||
    ''
  ).trim();
  const showAnnouncement = formData.get('showAnnouncement') === 'on';
  const announcementText = ((formData.get('announcementText') as string) || '')
    .trim()
    .slice(0, MAX_ANNOUNCEMENT_LENGTH);

  // Validate theme ID
  const newThemeId = isValidMVPTheme(themeId) ? themeId : currentThemeId;

  const normalizedStoreName =
    storeNameInput.slice(0, MAX_STORE_NAME_LENGTH) || currentSettings.storeName;
  const validatedVisualSettings = validateMVPSettings(
    {
      storeName: normalizedStoreName,
      logo: normalizeOptionalHttpUrl(logoInput),
      favicon: normalizeOptionalHttpUrl(faviconInput),
      primaryColor: primaryColor || currentSettings.primaryColor,
      accentColor: accentColor || currentSettings.accentColor,
      showAnnouncement,
      announcementText: announcementText || null,
    },
    newThemeId
  );

  // Build updated settings
  const updatedSettings: MVPSettingsWithTheme = {
    ...currentSettings,
    ...validatedVisualSettings,
    themeId: newThemeId,
    showAnnouncement,
    announcementText: announcementText || null,
  };

  // Save settings
  await saveMVPSettings(db, store.id, updatedSettings);

  const nextThemeConfig = {
    ...themeConfig,
    storeTemplateId: newThemeId,
    primaryColor: updatedSettings.primaryColor,
    accentColor: updatedSettings.accentColor,
  } as Record<string, unknown>;

  if (showAnnouncement && announcementText) {
    nextThemeConfig.announcement = { text: announcementText };
  } else {
    delete nextThemeConfig.announcement;
  }

  // Keep legacy store fields in sync so all storefront routes reflect settings.
  await db
    .update(stores)
    .set({
      name: updatedSettings.storeName,
      logo: updatedSettings.logo,
      favicon: updatedSettings.favicon,
      themeConfig: JSON.stringify(nextThemeConfig),
    })
    .where(eq(stores.id, store.id));

  // Also save to unified canonical column (new system)
  try {
    await saveUnifiedStorefrontSettingsWithCacheInvalidation(
      db as any,
      {
        KV: context.cloudflare.env.STORE_CACHE,
      },
      store.id,
      {
        branding: {
          storeName: updatedSettings.storeName,
          logo: updatedSettings.logo,
          favicon: updatedSettings.favicon,
        },
        theme: {
          templateId: newThemeId,
          primary: updatedSettings.primaryColor,
          accent: updatedSettings.accentColor,
        },
        announcement: {
          enabled: showAnnouncement,
          text: announcementText || null,
        },
      }
    );
  } catch (error) {
    console.error('Failed to save unified settings:', error);
    // Don't fail the whole request if unified save fails - legacy save succeeded
  }

  // Invalidate all caches so storefront routes pick up new colors immediately
  const kvNamespace = context.cloudflare.env.STORE_CACHE;
  if (kvNamespace) {
    const kvCache = new KVCache(kvNamespace);
    const subdomain = (store.subdomain as string) || '';
    const customDomain = (store.customDomain as string | null) || null;
    await Promise.all([
      kvCache.delete(`${CACHE_KEYS.STORE_CONFIG}${store.id}`),
      subdomain ? kvCache.delete(`${CACHE_KEYS.TENANT_SUBDOMAIN}${subdomain}`) : Promise.resolve(),
      customDomain
        ? kvCache.delete(`${CACHE_KEYS.TENANT_DOMAIN}${customDomain}`)
        : Promise.resolve(),
    ]);
  }
  await invalidateStoreConfigD1(new D1Cache(createDb(context.cloudflare.env.DB)), store.id);

  return json({ success: true, settings: updatedSettings });
}

export default function StoreSettingsPage() {
  const { currentSettings, availableThemes } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Store Appearance</h1>

          {actionData && 'success' in actionData && actionData.success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">Settings saved successfully!</p>
            </div>
          )}

          {actionData && 'error' in actionData && actionData.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-800">{actionData.error}</p>
            </div>
          )}

          <Form method="post" className="space-y-8">
            {/* Theme Selector */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Theme</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <label
                    key={theme.id}
                    className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all hover:border-blue-400 ${
                      currentSettings.themeId === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="themeId"
                      value={theme.id}
                      defaultChecked={currentSettings.themeId === theme.id}
                      className="sr-only"
                    />
                    <div className="flex flex-col h-full">
                      <img
                        src={theme.thumbnail}
                        alt={theme.name}
                        className="w-full h-32 object-cover rounded-md mb-3"
                      />
                      <h3 className="font-medium text-gray-900">{theme.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{theme.description}</p>
                    </div>
                    {currentSettings.themeId === theme.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </section>

            {/* Basic Information */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                    Store Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    id="storeName"
                    defaultValue={currentSettings.storeName}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Enter your store name"
                  />
                </div>

                <div>
                  <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    id="logo"
                    defaultValue={currentSettings.logo || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Recommended: 200x60px, transparent PNG
                  </p>
                </div>

                <div>
                  <label htmlFor="favicon" className="block text-sm font-medium text-gray-700">
                    Favicon URL
                  </label>
                  <input
                    type="url"
                    name="favicon"
                    id="favicon"
                    defaultValue={currentSettings.favicon || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="https://example.com/favicon.ico"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended: 32x32px, ICO or PNG</p>
                </div>
              </div>
            </section>

            {/* Brand Colors */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Brand Colors</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                    Primary Color
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="color"
                      name="primaryColor"
                      id="primaryColor"
                      defaultValue={currentSettings.primaryColor}
                      className="h-10 w-20 rounded border-gray-300"
                    />
                    <input
                      type="text"
                      name="primaryColorText"
                      defaultValue={currentSettings.primaryColor}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="#4F46E5"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Used for buttons, links, and headings
                  </p>
                </div>

                <div>
                  <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700">
                    Accent Color
                  </label>
                  <div className="mt-1 flex items-center gap-3">
                    <input
                      type="color"
                      name="accentColor"
                      id="accentColor"
                      defaultValue={currentSettings.accentColor}
                      className="h-10 w-20 rounded border-gray-300"
                    />
                    <input
                      type="text"
                      name="accentColorText"
                      defaultValue={currentSettings.accentColor}
                      className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="#F59E0B"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Used for badges, highlights, and CTAs
                  </p>
                </div>
              </div>
            </section>

            {/* Announcement Banner */}
            <section>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Announcement Banner</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="showAnnouncement"
                    id="showAnnouncement"
                    defaultChecked={currentSettings.showAnnouncement}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showAnnouncement" className="ml-2 block text-sm text-gray-900">
                    Show announcement banner on storefront
                  </label>
                </div>

                <div>
                  <label
                    htmlFor="announcementText"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Announcement Text
                  </label>
                  <input
                    type="text"
                    name="announcementText"
                    id="announcementText"
                    defaultValue={currentSettings.announcementText || ''}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., Free delivery over ৳1000"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Example: &ldquo;১০০০ টাকার উপরে অর্ডারে ফ্রি ডেলিভারি!&rdquo;
                  </p>
                </div>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Changes
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
