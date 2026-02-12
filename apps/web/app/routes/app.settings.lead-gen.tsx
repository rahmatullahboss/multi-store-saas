/**
 * Lead Gen Settings Page
 *
 * Allows merchants to customize their lead generation website.
 * Follows EXACT same pattern as app.store.settings.tsx for e-commerce.
 *
 * Features:
 * - Theme selector
 * - Color picker
 * - Text editors (heading, description, CTA)
 * - Logo upload
 * - Toggle sections on/off
 * - Contact information
 *
 * @see apps/web/app/routes/app.store.settings.tsx - E-commerce equivalent
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { getStoreId } from '~/services/auth.server';
import { 
  getLeadGenSettings,
  saveLeadGenSettings,
  updateLeadGenTheme,
  type LeadGenSettingsWithTheme,
} from '~/services/lead-gen-settings.server';
import { getAvailableLeadGenThemes } from '~/config/lead-gen-theme-settings';
import { Palette, Type, Image as ImageIcon, Settings, CheckCircle, Loader2, Eye, Save, ArrowLeft, Megaphone, Globe } from 'lucide-react';

// ============================================================================
// LOADER - Fetch current settings
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = drizzle(context.cloudflare.env.DB);

  // Get store
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Get current theme ID (from store config or default)
  let currentThemeId = 'professional-services';
  if (store.leadGenConfig) {
    try {
      const config = JSON.parse(store.leadGenConfig as string);
      currentThemeId = config.themeId || 'professional-services';
    } catch (error) {
      console.error('Failed to parse lead_gen_config:', error);
    }
  }

  // Get lead gen settings
  const settings = await getLeadGenSettings(db, storeId, currentThemeId);

  // Get available themes
  const availableThemes = getAvailableLeadGenThemes();

  return json({
    store,
    currentSettings: settings,
    availableThemes,
    previewUrl: store.customDomain || `${store.subdomain}.ozzyl.com`,
  });
}

// ============================================================================
// ACTION - Save settings
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const action = formData.get('_action');

  try {
    if (action === 'change_theme') {
      // Change theme
      const newThemeId = formData.get('themeId') as string;
      const updated = await updateLeadGenTheme(db, storeId, newThemeId);
      
      return json({ 
        success: true, 
        message: 'Theme updated successfully',
        settings: updated,
      });
    }

    if (action === 'save_settings') {
      // Get current settings
      const current = await getLeadGenSettings(db, storeId);

      // Build updated settings
      const updated: LeadGenSettingsWithTheme = {
        ...current,
        storeName: (formData.get('storeName') as string) || current.storeName,
        logo: (formData.get('logo') as string) || current.logo,
        favicon: (formData.get('favicon') as string) || current.favicon,
        primaryColor: (formData.get('primaryColor') as string) || current.primaryColor,
        accentColor: (formData.get('accentColor') as string) || current.accentColor,
        heroHeading: (formData.get('heroHeading') as string) || current.heroHeading,
        heroDescription: (formData.get('heroDescription') as string) || current.heroDescription,
        ctaButtonText: (formData.get('ctaButtonText') as string) || current.ctaButtonText,
        showAnnouncement: formData.get('showAnnouncement') === 'on',
        announcementText: (formData.get('announcementText') as string) || null,
        showTestimonials: formData.get('showTestimonials') === 'on',
        showServices: formData.get('showServices') === 'on',
        phone: (formData.get('phone') as string) || null,
        email: (formData.get('email') as string) || null,
        address: (formData.get('address') as string) || null,
      };

      // Save to database
      const saved = await saveLeadGenSettings(db, storeId, updated);

      return json({ 
        success: true, 
        message: 'Settings saved successfully',
        settings: saved,
      });
    }

    return json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Lead gen settings error:', error);
    return json({ 
      success: false, 
      error: 'Failed to save settings. Please try again.' 
    }, { status: 500 });
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LeadGenSettingsPage() {
  const { currentSettings, availableThemes, previewUrl } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link 
          to="/app/settings" 
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-violet-600" />
            Lead Generation Settings
          </h1>
          <p className="text-gray-500 mt-1">Customize your lead capture website</p>
        </div>
      </div>

      {/* Success Message */}
      {actionData?.success && 'message' in actionData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionData.message}
        </div>
      )}

      {/* Error Message */}
      {actionData?.success === false && 'error' in actionData && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {actionData.error}
        </div>
      )}

      {/* Preview Link */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-violet-900">Your Lead Gen Website</h3>
              <p className="text-sm text-violet-700">https://{previewUrl}</p>
            </div>
          </div>
          <Link
            to={`https://${previewUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
          >
            <Eye className="w-4 h-4" />
            Preview Live
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sidebar - Theme Selector */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5 text-violet-600" />
              Select Theme
            </h2>
            <Form method="post">
              <input type="hidden" name="_action" value="change_theme" />
              <div className="space-y-3">
                {availableThemes.map((theme) => (
                  <label
                    key={theme.id}
                    className="block cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="themeId"
                      value={theme.id}
                      defaultChecked={currentSettings.themeId === theme.id}
                      onChange={(e) => {
                        if (e.target.checked) {
                          e.target.form?.requestSubmit();
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="p-4 border-2 rounded-xl transition peer-checked:border-violet-500 peer-checked:bg-violet-50 hover:border-gray-300">
                      <div className="font-medium text-gray-900">{theme.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{theme.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </Form>
          </div>
        </div>

        {/* Main Settings Form */}
        <div className="lg:col-span-2">
          <Form method="post" className="space-y-6">
            <input type="hidden" name="_action" value="save_settings" />

            {/* Identity Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Business Identity</h3>
                  <p className="text-sm text-gray-500">Your business name and branding</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name
                  </label>
                  <input
                    type="text"
                    name="storeName"
                    defaultValue={currentSettings.storeName}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    name="logo"
                    defaultValue={currentSettings.logo || ''}
                    placeholder="https://example.com/logo.png"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Upload to R2 and paste URL here</p>
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-purple-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Brand Colors</h3>
                  <p className="text-sm text-gray-500">Customize your color scheme</p>
                </div>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="primaryColor"
                      defaultValue={currentSettings.primaryColor}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue={currentSettings.primaryColor}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="accentColor"
                      defaultValue={currentSettings.accentColor}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      defaultValue={currentSettings.accentColor}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      readOnly
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Hero Content</h3>
                  <p className="text-sm text-gray-500">Main headline and description</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Heading
                  </label>
                  <input
                    type="text"
                    name="heroHeading"
                    defaultValue={currentSettings.heroHeading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="heroDescription"
                    rows={3}
                    defaultValue={currentSettings.heroDescription}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CTA Button Text
                  </label>
                  <input
                    type="text"
                    name="ctaButtonText"
                    defaultValue={currentSettings.ctaButtonText}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Announcement Banner */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  name="showAnnouncement"
                  defaultChecked={currentSettings.showAnnouncement}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">Show Announcement Banner</span>
              </label>
              <input
                type="text"
                name="announcementText"
                defaultValue={currentSettings.announcementText || ''}
                placeholder="e.g., Free consultation for new clients - Limited time offer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
              />
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Contact Information</h3>
                <p className="text-sm text-gray-500">How customers can reach you</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    defaultValue={currentSettings.phone || ''}
                    placeholder="+880 1234-567890"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentSettings.email || ''}
                    placeholder="hello@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={currentSettings.address || ''}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Section Toggles */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-900">Page Sections</h2>
              
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showServices"
                    defaultChecked={currentSettings.showServices}
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <span className="text-gray-700">Show Services Section</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="showTestimonials"
                    defaultChecked={currentSettings.showTestimonials}
                    className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                  />
                  <span className="text-gray-700">Show Testimonials Section</span>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Settings
                </>
              )}
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
}
