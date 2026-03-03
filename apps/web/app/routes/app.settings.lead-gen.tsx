/**
 * Lead Gen Settings Page
 *
 * Allows merchants to customize their lead generation website.
 * Now includes full study-abroad theme customization options.
 */

import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { drizzle } from 'drizzle-orm/d1';
import { stores } from '@db/schema';
import { eq } from 'drizzle-orm';
import { requireTenant } from '~/lib/tenant-guard.server';
import {
  getLeadGenSettings,
  saveLeadGenSettings,
  updateLeadGenTheme,
  type LeadGenSettingsWithTheme,
  type DestinationConfig,
  type ServiceConfig,
  type WhyChoosePoint,
  type ProcessStepConfig,
  type SuccessStoryConfig,
  type TeamMemberConfig,
  type WhyStudyPoint,
  type QuickLinkConfig,
} from '~/services/lead-gen-settings.server';
import { getAvailableLeadGenThemes } from '~/config/lead-gen-theme-settings';
import { LeadGenFileUpload } from '~/components/lead-gen/LeadGenFileUpload';
import {
  Palette,
  Type,
  Image as ImageIcon,
  Settings,
  CheckCircle,
  Loader2,
  Eye,
  Save,
  ArrowLeft,
  Megaphone,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  User,
  Award,
  MapPin,
  Building,
} from 'lucide-react';

// ============================================================================
// LOADER - Fetch current settings
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);

  // Get store
  const [store] = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Get current theme ID
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
  const { storeId, userId } = await requireTenant(request, context, {
    requirePermission: 'settings',
  });

  const db = drizzle(context.cloudflare.env.DB);
  const formData = await request.formData();
  const action = formData.get('_action');

  try {
    if (action === 'change_theme') {
      const newThemeId = formData.get('themeId') as string;
      const updated = await updateLeadGenTheme(db, storeId, newThemeId);
      return json({ success: true, message: 'Theme updated successfully', settings: updated });
    }

    if (action === 'save_settings') {
      const current = await getLeadGenSettings(db, storeId);

      // Parse array fields from formData.
      // Uses a generic type parameter so callers keep their specific array types,
      // while the runtime still validates that the parsed value is actually an array.
      const parseJsonField = <T,>(key: string, defaultValue: T[]): T[] => {
        const value = formData.get(key);
        if (!value) return defaultValue;
        try {
          const parsed: unknown = JSON.parse(value as string);
          return Array.isArray(parsed) ? (parsed as T[]) : defaultValue;
        } catch {
          return defaultValue;
        }
      };

      const updated: LeadGenSettingsWithTheme = {
        ...current,
        storeName: (formData.get('storeName') as string) || current.storeName,
        logo: (formData.get('logo') as string) || current.logo || null,
        favicon: (formData.get('favicon') as string) || current.favicon || null,
        primaryColor: (formData.get('primaryColor') as string) || current.primaryColor,
        accentColor: (formData.get('accentColor') as string) || current.accentColor,
        heroHeading: (formData.get('heroHeading') as string) || current.heroHeading,
        heroDescription: (formData.get('heroDescription') as string) || current.heroDescription,
        ctaButtonText: (formData.get('ctaButtonText') as string) || current.ctaButtonText,
        heroBadge:
          formData.get('showHeroBadge') === 'on'
            ? (formData.get('heroBadge') as string) || null
            : null,
        heroSubheading: (formData.get('heroSubheading') as string) || null,
        showAnnouncement: formData.get('showAnnouncement') === 'on',
        announcementText: (formData.get('announcementText') as string) || null,
        showDestinations: formData.get('showDestinations') === 'on',
        showWhyChoose: formData.get('showWhyChoose') === 'on',
        showTestimonials: formData.get('showTestimonials') === 'on',
        showServices: formData.get('showServices') === 'on',
        showProcess: formData.get('showProcess') === 'on',
        showTeam: formData.get('showTeam') === 'on',
        showFAQ: formData.get('showFAQ') === 'on',
        showWhyStudy: formData.get('showWhyStudy') === 'on',
        showStats: formData.get('showStats') === 'on',
        showCompanyProfile: formData.get('showCompanyProfile') === 'on',
        showMDProfile: formData.get('showMDProfile') === 'on',
        showOtherCountries: formData.get('showOtherCountries') === 'on',
        showStudentPortal: formData.get('showStudentPortal') === 'on',
        showUniversityPartners: formData.get('showUniversityPartners') === 'on',
        showWhatsApp: formData.get('showWhatsApp') === 'on',

        // Stats
        statsStudentsCount: (formData.get('statsStudentsCount') as string) || '20,000+',
        statsRecruitmentAwards: (formData.get('statsRecruitmentAwards') as string) || '35+',
        statsUniversityPartners: (formData.get('statsUniversityPartners') as string) || '140+',

        // Contact
        phone: (formData.get('phone') as string) || null,
        email: (formData.get('email') as string) || null,
        address: (formData.get('address') as string) || null,
        whatsappNumber: (formData.get('whatsappNumber') as string) || null,

        // Company Profile
        companyDescription: (formData.get('companyDescription') as string) || null,
        visaSuccessRatio: (formData.get('visaSuccessRatio') as string) || null,
        visaSuccessLabel: (formData.get('visaSuccessLabel') as string) || null,
        yearsExperience: (formData.get('yearsExperience') as string) || null,
        yearsLabel: (formData.get('yearsLabel') as string) || null,

        // MD Profile
        mdName: (formData.get('mdName') as string) || null,
        mdRole: (formData.get('mdRole') as string) || null,
        mdDescription: (formData.get('mdDescription') as string) || null,

        // Footer
        footerDescription: (formData.get('footerDescription') as string) || null,

        // Legal Pages
        privacyPolicy: (formData.get('privacyPolicy') as string) || null,
        termsOfService: (formData.get('termsOfService') as string) || null,
        showPrivacyPolicy: formData.get('showPrivacyPolicy') === 'on',
        showTermsOfService: formData.get('showTermsOfService') === 'on',

        // Array fields
        destinations: parseJsonField('destinations', current.destinations || []),
        services: parseJsonField('services', current.services || []),
        whyChoosePoints: parseJsonField('whyChoosePoints', current.whyChoosePoints || []),
        processSteps: parseJsonField('processSteps', current.processSteps || []),
        successStories: parseJsonField('successStories', current.successStories || []),
        teamMembers: parseJsonField('teamMembers', current.teamMembers || []),
        universityLogos: parseJsonField('universityLogos', current.universityLogos || []),
        whyStudyPoints: parseJsonField('whyStudyPoints', current.whyStudyPoints || []),
        otherCountries: parseJsonField('otherCountries', current.otherCountries || []),
        quickLinks: parseJsonField('quickLinks', current.quickLinks || []),
        faqs: parseJsonField('faqs', current.faqs || []),
      };

      const saved = await saveLeadGenSettings(db, storeId, updated);
      return json({ success: true, message: 'Settings saved successfully', settings: saved });
    }

    return json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Lead gen settings error:', error);
    return json(
      { success: false, error: 'Failed to save settings. Please try again.' },
      { status: 500 }
    );
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
  const { t } = useTranslation();
  const [primaryColor, setPrimaryColor] = useState(currentSettings.primaryColor || '#4F46E5');
  const [accentColor, setAccentColor] = useState(currentSettings.accentColor || '#F59E0B');

  return (
    <div className="space-y-6 md:pb-0 pb-32">
      {/* Mobile Sticky Header */}
      <div className="md:hidden -mx-4 -mt-4 mb-4">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 h-[60px]">
            <Link to="/app/settings" className="flex items-center justify-center p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight">{t('leadGenSettings')}</h1>
            <div className="w-10" />
          </div>
        </header>
      </div>

      {/* Header */}
      <div className="hidden md:flex items-center gap-3">
        <Link to="/app/settings" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-violet-600" />
            {t('leadGenSettings')}
          </h1>
          <p className="text-gray-500 mt-1">{t('leadGenSettingsDesc')}</p>
        </div>
      </div>

      {/* Messages */}
      {actionData?.success && 'message' in actionData && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-2xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {actionData.message}
        </div>
      )}
      {actionData?.success === false && 'error' in actionData && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl">
          {actionData.error}
        </div>
      )}

      {/* Preview Link */}
      <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-200 p-5">
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
                  <label key={theme.id} className="block cursor-pointer">
                    <input
                      type="radio"
                      name="themeId"
                      value={theme.id}
                      defaultChecked={currentSettings.themeId === theme.id}
                      onChange={(e) => {
                        if (e.target.checked) e.target.form?.requestSubmit();
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
          <Form method="post" id="lead-gen-form" className="space-y-6">

            {/* Basic Identity */}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <LeadGenFileUpload
                    name="logo"
                    label="Logo"
                    accept="image"
                    maxSize={2 * 1024 * 1024}
                    primaryColor={currentSettings.primaryColor || '#4F46E5'}
                    value={currentSettings.logo || undefined}
                  />
                </div>
                <div>
                  <LeadGenFileUpload
                    name="favicon"
                    label="Favicon (32x32)"
                    accept="image"
                    maxSize={1 * 1024 * 1024}
                    primaryColor={currentSettings.primaryColor || '#4F46E5'}
                    value={currentSettings.favicon || undefined}
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-purple-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Brand Colors</h3>
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
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
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
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      readOnly
                      className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-indigo-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Hero Section</h3>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hero Badge</label>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      name="showHeroBadge"
                      defaultChecked={currentSettings.heroBadge ? true : false}
                      className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                    />
                    <span className="text-sm text-gray-600">Show badge on hero</span>
                  </div>
                  <input
                    type="text"
                    name="heroBadge"
                    defaultValue={currentSettings.heroBadge || ''}
                    placeholder="e.g., 🎓 100% Free Counselling"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subheading (Below Badge)
                  </label>
                  <input
                    type="text"
                    name="heroSubheading"
                    defaultValue={currentSettings.heroSubheading || ''}
                    placeholder="e.g., Specializing in Malaysian education"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="showStats"
                  defaultChecked={currentSettings.showStats}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">Show Stats Section</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Students Count
                  </label>
                  <input
                    type="text"
                    name="statsStudentsCount"
                    defaultValue={currentSettings.statsStudentsCount || '20,000+'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Awards</label>
                  <input
                    type="text"
                    name="statsRecruitmentAwards"
                    defaultValue={currentSettings.statsRecruitmentAwards || '35+'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Partners</label>
                  <input
                    type="text"
                    name="statsUniversityPartners"
                    defaultValue={currentSettings.statsUniversityPartners || '140+'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
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
                placeholder="Banner text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Destinations (Study Abroad) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Study Destinations</h3>
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <DestinationEditor
                  name="destinations"
                  defaultValue={currentSettings.destinations || []}
                />
              </div>
            </div>

            {/* Services (Study Abroad) */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-orange-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Services</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <ServiceEditor name="services" defaultValue={currentSettings.services || []} />
              </div>
            </div>

            {/* Why Choose Points */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900">Why Choose Us Points</h3>
              </div>
              <WhyChooseEditor
                name="whyChoosePoints"
                defaultValue={currentSettings.whyChoosePoints || []}
              />
            </div>

            {/* Success Stories Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-amber-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Success Stories</h3>
                  <p className="text-sm text-gray-500">Student testimonials and achievements</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <SuccessStoryEditor
                  name="successStories"
                  defaultValue={currentSettings.successStories || []}
                  primaryColor={currentSettings.primaryColor || '#4F46E5'}
                />
              </div>
            </div>

            {/* University Partners Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">University Partners</h3>
                  <p className="text-sm text-gray-500">Partner university logos</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <UniversityLogoEditor
                  name="universityLogos"
                  defaultValue={currentSettings.universityLogos || []}
                  primaryColor={currentSettings.primaryColor || '#4F46E5'}
                />
              </div>
            </div>

            {/* Team Members / Experts Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-teal-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Meet Our Experts</h3>
                  <p className="text-sm text-gray-500">Team members and counselors</p>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <TeamMemberEditor
                  name="teamMembers"
                  defaultValue={currentSettings.teamMembers || []}
                  primaryColor={currentSettings.primaryColor || '#4F46E5'}
                />
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-violet-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Frequently Asked Questions</h3>
                </div>
              </div>
              <div className="p-6 space-y-3">
                <FAQEditor name="faqs" defaultValue={currentSettings.faqs || []} />
              </div>
            </div>

            {/* Company Profile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="showCompanyProfile"
                  defaultChecked={currentSettings.showCompanyProfile}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">Show Company Profile Section</span>
              </label>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Tagline
                  </label>
                  <input
                    type="text"
                    name="companyDescription"
                    defaultValue={currentSettings.companyDescription || ''}
                    placeholder="Your trusted partner for global education..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Visa Success %
                    </label>
                    <input
                      type="text"
                      name="visaSuccessRatio"
                      defaultValue={currentSettings.visaSuccessRatio || '98%'}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      name="visaSuccessLabel"
                      defaultValue={currentSettings.visaSuccessLabel || 'Visa Success Rate'}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Years Experience
                    </label>
                    <input
                      type="text"
                      name="yearsExperience"
                      defaultValue={currentSettings.yearsExperience || '15+'}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      name="yearsLabel"
                      defaultValue={currentSettings.yearsLabel || 'Years Experience'}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MD Profile */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="showMDProfile"
                  defaultChecked={currentSettings.showMDProfile}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">Show MD/CEO Profile</span>
              </label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      name="mdName"
                      defaultValue={currentSettings.mdName || ''}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <input
                      type="text"
                      name="mdRole"
                      defaultValue={currentSettings.mdRole || ''}
                      placeholder="Managing Director"
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="mdDescription"
                    rows={2}
                    defaultValue={currentSettings.mdDescription || ''}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Other Countries */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="showOtherCountries"
                  defaultChecked={currentSettings.showOtherCountries}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">Show Other Countries Section</span>
              </label>
              <DestinationEditor
                name="otherCountries"
                defaultValue={currentSettings.otherCountries || []}
              />
            </div>

            {/* Student Portal */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  name="showStudentPortal"
                  defaultChecked={currentSettings.showStudentPortal}
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="font-semibold text-gray-900">
                  Enable Student Portal (Login Required)
                </span>
              </label>
              <p className="text-sm text-gray-500">
                Students can register and upload their documents after logging in.
              </p>
            </div>

            {/* Section Toggles */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4 text-gray-900">Page Sections</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'showDestinations', label: 'Destinations Section' },
                  { name: 'showWhyChoose', label: 'Why Choose Us' },
                  { name: 'showServices', label: 'Services Section' },
                  { name: 'showProcess', label: 'Process Section' },
                  { name: 'showWhyStudy', label: 'Why Study Abroad' },
                  { name: 'showTestimonials', label: 'Testimonials' },
                  { name: 'showUniversityPartners', label: 'University Partners' },
                  { name: 'showTeam', label: 'Meet Counselors' },
                  { name: 'showWhatsApp', label: 'WhatsApp Floating Button' },
                  { name: 'showFAQ', label: 'FAQ Section' },
                ].map((item) => (
                  <label key={item.name} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={item.name}
                      defaultChecked={!!currentSettings[item.name as keyof typeof currentSettings]}
                      className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                    />
                    <span className="text-gray-700">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-green-50/50 px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Contact Information</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={currentSettings.phone || ''}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      defaultValue={currentSettings.whatsappNumber || ''}
                      placeholder="8801234567890"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={currentSettings.email || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    defaultValue={currentSettings.address || ''}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Legal Pages */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-red-50/50 px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Legal Pages</h3>
                  <p className="text-sm text-gray-500">Privacy Policy and Terms of Service</p>
                </div>
              </div>
              <div className="p-6 space-y-6">
                {/* Privacy Policy */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-gray-900">Privacy Policy</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="showPrivacyPolicy"
                        defaultChecked={currentSettings.showPrivacyPolicy}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-600">Show in footer</span>
                    </label>
                  </div>
                  <textarea
                    name="privacyPolicy"
                    rows={6}
                    defaultValue={currentSettings.privacyPolicy || ''}
                    placeholder="Enter your privacy policy content (HTML supported)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to use default privacy policy. HTML tags are supported.
                  </p>
                </div>

                {/* Terms of Service */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="font-semibold text-gray-900">Terms of Service</label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="showTermsOfService"
                        defaultChecked={currentSettings.showTermsOfService}
                        className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-600">Show in footer</span>
                    </label>
                  </div>
                  <textarea
                    name="termsOfService"
                    rows={6}
                    defaultValue={currentSettings.termsOfService || ''}
                    placeholder="Enter your terms of service content (HTML supported)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Leave empty to use default terms of service. HTML tags are supported.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Footer Settings</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Footer Description
                </label>
                <textarea
                  name="footerDescription"
                  rows={2}
                  defaultValue={currentSettings.footerDescription || ''}
                  placeholder="Your trusted partner for..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              name="_action"
              value="save_settings"
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-lg hover:from-violet-700 hover:to-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t('savingSettings')}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> {t('saveSettings')}
                </>
              )}
            </button>
          </Form>
        </div>
      </div>

      {/* Fixed Save Button - Mobile */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-2 z-[70] md:hidden">
        <button
          type="submit"
          form="lead-gen-form"
          name="_action"
          value="save_settings"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-semibold transition-all shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isSubmitting ? t('saving') : t('saveSettings')}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS FOR ARRAY EDITORS
// ============================================================================

function DestinationEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: DestinationConfig[];
}) {
  const [items, setItems] = useState<DestinationConfig[]>(
    defaultValue.length > 0 ? defaultValue : [{ title: '', description: '', enabled: true }]
  );

  const updateItem = (idx: number, field: keyof DestinationConfig, value: string | boolean) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { title: '', description: '', enabled: true }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
          <div className="flex-1 grid gap-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, 'title', e.target.value)}
              placeholder="Study in Malaysia"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              placeholder="Description..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" /> Add Destination
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

function ServiceEditor({ name, defaultValue }: { name: string; defaultValue: ServiceConfig[] }) {
  const [items, setItems] = useState<ServiceConfig[]>(
    defaultValue.length > 0
      ? defaultValue
      : [{ icon: '💬', title: '', description: '', enabled: true }]
  );

  const updateItem = (idx: number, field: keyof ServiceConfig, value: string | boolean) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { icon: '💬', title: '', description: '', enabled: true }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl">
          <input
            type="text"
            value={item.icon}
            onChange={(e) => updateItem(idx, 'icon', e.target.value)}
            className="w-12 px-2 py-1.5 border border-gray-200 rounded-lg text-center text-sm"
            placeholder="🎓"
          />
          <div className="flex-1 grid gap-2">
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, 'title', e.target.value)}
              placeholder="Service Title"
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.description}
              onChange={(e) => updateItem(idx, 'description', e.target.value)}
              placeholder="Description..."
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" /> Add Service
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

function WhyChooseEditor({ name, defaultValue }: { name: string; defaultValue: WhyChoosePoint[] }) {
  const [items, setItems] = useState<WhyChoosePoint[]>(
    defaultValue.length > 0 ? defaultValue : [{ text: '', enabled: true }]
  );

  const updateItem = (idx: number, field: keyof WhyChoosePoint, value: string | boolean) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { text: '', enabled: true }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
          <input
            type="text"
            value={item.text}
            onChange={(e) => updateItem(idx, 'text', e.target.value)}
            placeholder="Why choose us point..."
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={() => removeItem(idx)}
            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" /> Add Point
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

function FAQEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: { question: string; answer: string; enabled: boolean }[];
}) {
  const [items, setItems] = useState<{ question: string; answer: string; enabled: boolean }[]>(
    defaultValue.length > 0 ? defaultValue : [{ question: '', answer: '', enabled: true }]
  );

  const updateItem = (
    idx: number,
    field: 'question' | 'answer' | 'enabled',
    value: string | boolean
  ) => {
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  };

  const addItem = () =>
    setItems((prev) => [...prev, { question: '', answer: '', enabled: true }]);
  const removeItem = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="p-3 bg-gray-50 rounded-xl space-y-2">
          <div className="flex items-start gap-2">
            <input
              type="text"
              value={item.question}
              onChange={(e) => updateItem(idx, 'question', e.target.value)}
              placeholder="Question..."
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium"
            />
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={item.answer}
            onChange={(e) => updateItem(idx, 'answer', e.target.value)}
            placeholder="Answer..."
            rows={2}
            className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700 font-medium"
      >
        <Plus className="w-4 h-4" /> Add FAQ
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

// Success Stories Editor
function SuccessStoryEditor({
  name,
  defaultValue,
  primaryColor,
}: {
  name: string;
  defaultValue: SuccessStoryConfig[];
  primaryColor: string;
}) {
  const [items, setItems] = useState<SuccessStoryConfig[]>(
    defaultValue.length > 0
      ? defaultValue
      : [{ name: '', program: '', university: '', text: '', image: null }]
  );

  const addItem = () => {
    setItems([...items, { name: '', program: '', university: '', text: '', image: null }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_item: SuccessStoryConfig, i: number) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof SuccessStoryConfig, value: string | null) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Story #{idx + 1}</span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(idx, 'name', e.target.value)}
              placeholder="Student Name"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.program}
              onChange={(e) => updateItem(idx, 'program', e.target.value)}
              placeholder="Program (e.g., MSc in CS)"
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <input
            type="text"
            value={item.university}
            onChange={(e) => updateItem(idx, 'university', e.target.value)}
            placeholder="University Name"
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <textarea
            value={item.text}
            onChange={(e) => updateItem(idx, 'text', e.target.value)}
            placeholder="Testimonial text..."
            rows={3}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <LeadGenFileUpload
            name={`${name}_image_${idx}`}
            label="Student Photo"
            accept="image"
            maxSize={2 * 1024 * 1024}
            primaryColor={primaryColor}
            value={item.image || undefined}
            onChange={(url) => updateItem(idx, 'image', url)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-violet-500 hover:text-violet-600 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Success Story
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

// University Logos Editor
function UniversityLogoEditor({
  name,
  defaultValue,
  primaryColor,
}: {
  name: string;
  defaultValue: string[];
  primaryColor: string;
}) {
  const [items, setItems] = useState<string[]>(defaultValue.length > 0 ? defaultValue : ['']);

  const addItem = () => {
    setItems([...items, '']);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_item: string, i: number) => i !== idx));
  };

  const updateItem = (idx: number, value: string) => {
    const newItems = [...items];
    newItems[idx] = value;
    setItems(newItems);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Upload university partner logos. These will be displayed in a scrolling marquee.
      </p>
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <LeadGenFileUpload
              name={`${name}_${idx}`}
              label={`Logo #${idx + 1}`}
              accept="image"
              maxSize={2 * 1024 * 1024}
              primaryColor={primaryColor}
              value={item || undefined}
              onChange={(url) => updateItem(idx, url || '')}
            />
          </div>
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => removeItem(idx)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-violet-500 hover:text-violet-600 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add University Logo
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items.filter(Boolean))} />
    </div>
  );
}

// Team Members Editor
function TeamMemberEditor({
  name,
  defaultValue,
  primaryColor,
}: {
  name: string;
  defaultValue: TeamMemberConfig[];
  primaryColor: string;
}) {
  const [items, setItems] = useState<TeamMemberConfig[]>(
    defaultValue.length > 0 ? defaultValue : [{ name: '', role: '', description: '', image: null }]
  );

  const addItem = () => {
    setItems([...items, { name: '', role: '', description: '', image: null }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_item: TeamMemberConfig, i: number) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof TeamMemberConfig, value: string | null) => {
    const newItems = [...items];
    newItems[idx] = { ...newItems[idx], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={idx} className="p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">Team Member #{idx + 1}</span>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={item.name}
              onChange={(e) => updateItem(idx, 'name', e.target.value)}
              placeholder="Full Name"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              value={item.role}
              onChange={(e) => updateItem(idx, 'role', e.target.value)}
              placeholder="Role (e.g., Senior Counselor)"
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <textarea
            value={item.description}
            onChange={(e) => updateItem(idx, 'description', e.target.value)}
            placeholder="Brief bio/description..."
            rows={2}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
          <LeadGenFileUpload
            name={`${name}_image_${idx}`}
            label="Profile Photo"
            accept="image"
            maxSize={2 * 1024 * 1024}
            primaryColor={primaryColor}
            value={item.image || undefined}
            onChange={(url) => updateItem(idx, 'image', url)}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-violet-500 hover:text-violet-600 transition flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add Team Member
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}
