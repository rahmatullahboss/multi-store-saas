/**
 * Store Design & Customization Page - Merchant Dashboard
 * Route: /app/store-design
 * 
 * Allows merchants to:
 * 1. Select store templates
 * 2. Customize colors (primary, accent)
 * 3. Edit banner (image, text)
 * 4. Update store info (announcement, contact)
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { Form, Link, useLoaderData, useNavigation, useActionData } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, parseSocialLinks, type SocialLinks } from '@db/types';
import { requireUserId, getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates, DEFAULT_STORE_TEMPLATE_ID, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { 
  Check, ExternalLink, Store, Eye, Sparkles, Crown, Palette, 
  Layout, Image, Settings, Save, Loader2, Megaphone, User, Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Type, Code
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { StoreImageUpload } from '~/components/StoreImageUpload';
import { StoreTemplatePreviewModal } from '~/components/StoreTemplatePreview';

// Font Options
const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", previewKey: 'fontInterDesc' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", previewKey: 'fontPoppinsDesc' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", previewKey: 'fontRobotoDesc' },
  { id: 'hind-siliguri', name: 'Hind Siliguri (Bengali)', family: "'Hind Siliguri', sans-serif", previewKey: 'fontHindDesc' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", previewKey: 'fontPlayfairDesc' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", previewKey: 'fontMontserratDesc' },
];

export const meta: MetaFunction = () => [{ title: 'Store Design - Multi-Store SaaS' }];

// ============================================================================
// LOADER - Fetch current store config
// ============================================================================
export const loader = async ({ request, context }: any) => {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const themeConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;
  const currentTemplateId = themeConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID;
  const templates = getAllStoreTemplates();
  
  return json({
    currentTemplateId,
    themeConfig,
    templates: templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      description: t.description, 
      thumbnail: t.thumbnail,
      category: t.category,
      theme: t.theme,
      fonts: t.fonts,
    })),
    storeSubdomain: store[0].subdomain,
    storeName: store[0].name,
    storeMode: store[0].mode || 'store',
    storeLogo: store[0].logo || '',
    businessInfo: store[0].businessInfo ? JSON.parse(store[0].businessInfo) : { phone: '', email: '', address: '' },
    socialLinks: parseSocialLinks(store[0].socialLinks as string | null) || { facebook: '', instagram: '', whatsapp: '' },
    fontFamily: store[0].fontFamily || 'inter',
  });
}

// ============================================================================
// ACTION - Save store customization
// ============================================================================
export const action = async ({ request, context }: any) => {
  await requireUserId(request, context.cloudflare.env);
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) throw new Response('Store not found', { status: 404 });

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  const db = drizzle(context.cloudflare.env.DB);
  
  // Get current config
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const currentConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  if (intent === 'select-template') {
    const templateId = formData.get('templateId') as string;
    if (!templateId) return json({ success: false, error: 'Template required' }, { status: 400 });
    
    const updatedConfig: ThemeConfig = { ...currentConfig, storeTemplateId: templateId };
    await db.update(stores).set({ 
      themeConfig: JSON.stringify(updatedConfig), 
      updatedAt: new Date() 
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'templateApplied' });
  }

  if (intent === 'save-theme') {
    const primaryColor = formData.get('primaryColor') as string || currentConfig.primaryColor;
    const accentColor = formData.get('accentColor') as string || currentConfig.accentColor;
    const fontFamily = formData.get('fontFamily') as string || 'inter';
    
    const updatedConfig: ThemeConfig = { ...currentConfig, primaryColor, accentColor };
    await db.update(stores).set({ 
      themeConfig: JSON.stringify(updatedConfig),
      fontFamily,
      updatedAt: new Date() 
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'themeSaved' });
  }

  if (intent === 'save-banner') {
    const bannerUrl = formData.get('bannerUrl') as string || '';
    const bannerText = formData.get('bannerText') as string || '';
    const announcementText = formData.get('announcementText') as string || '';
    const announcementLink = formData.get('announcementLink') as string || '';
    
    const updatedConfig: ThemeConfig = { 
      ...currentConfig, 
      bannerUrl: bannerUrl || undefined,
      bannerText: bannerText || undefined,
      announcement: announcementText ? { text: announcementText, link: announcementLink || undefined } : undefined,
    };
    await db.update(stores).set({ 
      themeConfig: JSON.stringify(updatedConfig), 
      updatedAt: new Date() 
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'bannerSaved' });
  }

  if (intent === 'save-info') {
    const logo = formData.get('logo') as string || '';
    const phone = formData.get('phone') as string || '';
    const email = formData.get('email') as string || '';
    const address = formData.get('address') as string || '';
    const facebook = formData.get('facebook') as string || '';
    const instagram = formData.get('instagram') as string || '';
    const whatsapp = formData.get('whatsapp') as string || '';
    
    const businessInfo = JSON.stringify({ phone, email, address });
    const socialLinks = JSON.stringify({ facebook, instagram, whatsapp });
    
    await db.update(stores).set({ 
      logo: logo || null,
      businessInfo,
      socialLinks,
      updatedAt: new Date() 
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'infoSaved' });
  }

  if (intent === 'save-advanced') {
    const customCSS = formData.get('customCSS') as string || '';
    
    const updatedConfig: ThemeConfig = { ...currentConfig, customCSS };
    await db.update(stores).set({ 
      themeConfig: JSON.stringify(updatedConfig),
      updatedAt: new Date() 
    }).where(eq(stores.id, storeId));
    
    return json({ success: true, message: 'advancedSaved' });
  }

  return json({ error: 'Unknown action' }, { status: 400 });
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function StoreDesignPage() {
  const { currentTemplateId, themeConfig, templates, storeSubdomain, storeName, storeMode, storeLogo, businessInfo, socialLinks, fontFamily: storedFontFamily } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { t, lang } = useTranslation();
  
  const storeUrl = `https://${storeSubdomain}.digitalcare.site`;
  
  const [activeTab, setActiveTab] = useState<'templates' | 'theme' | 'banner' | 'info' | 'advanced'>('templates');
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  
  // Theme state
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#6366f1');
  const [accentColor, setAccentColor] = useState(themeConfig.accentColor || '#f59e0b');
  const [fontFamily, setFontFamily] = useState(storedFontFamily || 'inter');
  const [customCSS, setCustomCSS] = useState(themeConfig.customCSS || '');
  
  // Banner state
  const [bannerUrl, setBannerUrl] = useState(themeConfig.bannerUrl || '');
  const [bannerText, setBannerText] = useState(themeConfig.bannerText || '');
  const [announcementText, setAnnouncementText] = useState(themeConfig.announcement?.text || '');
  const [announcementLink, setAnnouncementLink] = useState(themeConfig.announcement?.link || '');
  
  // Info state
  const [logo, setLogo] = useState(storeLogo);
  const [phone, setPhone] = useState(businessInfo.phone || '');
  const [email, setEmail] = useState(businessInfo.email || '');
  const [address, setAddress] = useState(businessInfo.address || '');
  const [facebook, setFacebook] = useState(socialLinks.facebook || '');
  const [instagram, setInstagram] = useState(socialLinks.instagram || '');
  const [whatsapp, setWhatsapp] = useState(socialLinks.whatsapp || '');
  
  const isSubmitting = navigation.state === 'submitting';

  // Show success toast
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [actionData]);

  // Update selected when current changes
  useEffect(() => { setSelectedTemplateId(currentTemplateId); }, [currentTemplateId]);

  // Category icons & labels
  const categoryIcons: Record<string, JSX.Element> = {
    luxury: <Crown className="w-4 h-4" />,
    tech: <Sparkles className="w-4 h-4" />,
    artisan: <Palette className="w-4 h-4" />,
    modern: <Layout className="w-4 h-4" />,
  };
  const categoryLabels: Record<string, string> = {
    luxury: t('catLuxury'),
    tech: t('catTech'),
    artisan: t('catArtisan'),
    modern: t('catModern'),
  };

  // Preset colors
  const colorPresets = [
    { name: t('colorIndigo'), primary: '#6366f1', accent: '#f59e0b' },
    { name: t('colorEmerald'), primary: '#10b981', accent: '#f472b6' },
    { name: t('colorRose'), primary: '#f43f5e', accent: '#8b5cf6' },
    { name: t('colorAmber'), primary: '#f59e0b', accent: '#3b82f6' },
    { name: t('colorSky'), primary: '#0ea5e9', accent: '#f97316' },
    { name: t('colorSlate'), primary: '#1e293b', accent: '#c9a961' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('storeDesignTitle')}</h1>
                <p className="text-gray-500 mt-1">{t('storeDesignDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/app/theme-store"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm uppercase tracking-wider"
                >
                  <Sparkles size={16} />
                  {lang === 'bn' ? 'থিম স্টোর দেখুন' : 'Browse Theme Store'}
                </Link>
                <Link
                  to={storeUrl}
                  target="_blank"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 font-semibold shadow-sm hover:bg-gray-50 transition-all text-sm"
                >
                  <Eye size={16} />
                  {t('viewLiveStore')}
                </Link>
                <Link
                  to="/store-live-editor"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all text-sm"
                >
                  <Layout size={16} />
                  {t('openLiveEditor')}
                </Link>
              </div>
            </div>

      {/* Mode Warning */}
      {storeMode !== 'store' && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Store className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h4 className="font-medium text-amber-900">{t('storeModeRequired')}</h4>
            <p className="text-sm text-amber-700 mt-1">
              {lang === 'bn' ? (
                <>আপনার স্টোর এখন <strong>ল্যান্ডিং পেজ মোডে</strong> আছে। সেটিংস থেকে <strong>স্টোর মোড</strong> চালু করুন।</>
              ) : (
                <>Your store is in <strong>Landing Page Mode</strong>. Switch to <strong>Store Mode</strong> in settings.</>
              )}
            </p>
            <Link to="/app/settings" className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 mt-2">
              {t('goToSettings')} →
            </Link>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          {actionData && 'message' in actionData ? t(actionData.message) : t('saved')}
        </div>
      )}

      {/* Tabs */}
            <div className="flex border-b border-gray-100 mb-8 overflow-x-auto no-scrollbar bg-white p-1 rounded-xl shadow-sm border border-gray-200">
              {[
                { id: 'templates', label: t('templates'), icon: Layout },
                { id: 'theme', label: t('theme'), icon: Palette },
                { id: 'banner', label: t('banner'), icon: Image },
                { id: 'info', label: t('info'), icon: User },
                { id: 'advanced', label: t('advanced'), icon: Settings },
              ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const isActive = template.id === currentTemplateId;
              const theme = STORE_TEMPLATE_THEMES[template.id];
              
              return (
                <div 
                  key={template.id}
                  className={`rounded-2xl overflow-hidden border-2 transition-all ${
                    isActive ? 'border-purple-500 ring-4 ring-purple-500/20' : 
                    'border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
                >
                  {/* Template Preview */}
                  <div 
                    className="aspect-[4/3] relative overflow-hidden"
                    style={{ backgroundColor: theme?.background || '#f8f8f8' }}
                  >
                    {/* Mini Preview */}
                    <div className="absolute inset-0 p-4">
                      {/* Mini Header */}
                      <div 
                        className="h-8 rounded-lg mb-3 flex items-center px-3 gap-2"
                        style={{ backgroundColor: theme?.headerBg || '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                      >
                        <div className="w-12 h-3 rounded" style={{ backgroundColor: theme?.primary || '#333' }} />
                        <div className="flex-1" />
                        <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme?.accent || '#666' }} />
                      </div>
                      
                      {/* Mini Hero */}
                      <div 
                        className="h-20 rounded-lg mb-3 flex items-center justify-center"
                        style={{ backgroundColor: theme?.primary || '#333' }}
                      >
                        <div className="text-center">
                          <div className="w-20 h-2 rounded mx-auto mb-1" style={{ backgroundColor: theme?.accent || '#fff' }} />
                          <div className="w-16 h-1.5 rounded mx-auto opacity-50" style={{ backgroundColor: '#fff' }} />
                        </div>
                      </div>
                      
                      {/* Mini Product Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className="aspect-square rounded-lg"
                            style={{ backgroundColor: theme?.cardBg || '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    {/* Category Badge */}
                    <div 
                      className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"
                      style={{ backgroundColor: theme?.accent || '#666', color: '#fff' }}
                    >
                      {categoryIcons[template.category]}
                      {categoryLabels[template.category]}
                    </div>
                    
                    {/* Active Badge */}
                    {isActive && (
                      <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg animate-in fade-in zoom-in duration-300">
                        <Check size={12} strokeWidth={3} />
                        {t('currentlyActive')}
                      </div>
                    )}

                    {/* Preview Button Overlay */}
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/store-template-preview/${template.id}`}
                          className="bg-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:bg-gray-50 transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {t('fullPreview')}
                        </Link>
                        <button
                          onClick={() => setPreviewTemplate(template.id)}
                          className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-lg hover:bg-gray-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                          {t('quickPreview')}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Info */}
                  <div className="p-5 bg-white">
                    <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{template.description}</p>
                    
                    {/* Color Swatches */}
                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400">{t('colors')}:</span>
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: theme?.primary || '#333' }} title="Primary" />
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: theme?.accent || '#666' }} title="Accent" />
                      <div className="w-5 h-5 rounded-full border border-gray-200" style={{ backgroundColor: theme?.background || '#fff' }} title="Background" />
                    </div>
                    
                    {/* Action */}
                    <div className="mt-4">
                      {isActive ? (
                        <div className="w-full py-2.5 text-center font-medium text-purple-600 bg-purple-50 rounded-lg">
                          {t('currentlyActive')}
                        </div>
                      ) : (
                        <Form method="post">
                          <input type="hidden" name="intent" value="select-template" />
                          <input type="hidden" name="templateId" value={template.id} />
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-2.5 font-medium rounded-lg transition-colors bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                            onClick={() => setSelectedTemplateId(template.id)}
                          >
                            {isSubmitting && selectedTemplateId === template.id ? t('applying') : t('applyTemplate')}
                          </button>
                        </Form>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Theme/Colors Tab */}
        {activeTab === 'theme' && (
          <Form method="post" className="max-w-2xl">
            <input type="hidden" name="intent" value="save-theme" />
            
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                      <Palette size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{t('colorTheme')}</h3>
                      <p className="text-sm text-gray-500">{t('colorThemeDesc')}</p>
                    </div>
                  </div>

                  {/* Color Presets */}
                  <div className="mb-8">
                    <label className="text-sm font-bold text-gray-700 mb-3 block uppercase tracking-wider">{t('quickPresets')}</label>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => {
                        setPrimaryColor(preset.primary);
                        setAccentColor(preset.accent);
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition ${
                        primaryColor === preset.primary && accentColor === preset.accent
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.primary }} />
                      <div className="w-5 h-5 rounded-full" style={{ backgroundColor: preset.accent }} />
                      <span className="text-sm font-medium">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <label className="text-sm font-bold text-gray-700 mb-1 block">{t('primaryColor')}</label>
                      <p className="text-xs text-gray-500 mb-3">{t('primaryColorDesc')}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="primaryColor"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-12 h-12 rounded-lg border-0 p-0 cursor-pointer shadow-sm"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                        />
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <label className="text-sm font-bold text-gray-700 mb-1 block">{t('accentColor')}</label>
                      <p className="text-xs text-gray-500 mb-3">{t('accentColorDesc')}</p>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          name="accentColor"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-12 h-12 rounded-lg border-0 p-0 cursor-pointer shadow-sm"
                        />
                        <input
                          type="text"
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Font Setting */}
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Type size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{t('fontFamily')}</h3>
                        <p className="text-sm text-gray-500">{lang === 'bn' ? 'আপনার স্টোরের জন্য সেরা ফন্টটি বেছে নিন' : 'Choose the best font for your store.'}</p>
                      </div>
                    </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => setFontFamily(font.id)}
                      className={`p-3 rounded-lg border-2 text-left transition ${
                        fontFamily === font.id
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="block font-medium text-gray-900" style={{ fontFamily: font.family }}>
                        {font.name}
                      </span>
                      <span className="text-xs text-gray-500">{t(font.previewKey)}</span>
                    </button>
                  ))}
                </div>
                <input type="hidden" name="fontFamily" value={fontFamily} />
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">{t('preview')}</label>
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {t('primaryButton')}
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-lg font-medium text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      {t('accentButton')}
                    </button>
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: primaryColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4 border-t">
                  <button
                    type="submit"
                    name="intent"
                    value="save-theme"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                    {isSubmitting ? t('savingSettings') : t('saveColors')}
                  </button>
              </div>
            </div>
          </Form>
        )}

        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <Form method="post" className="max-w-2xl">
            <input type="hidden" name="intent" value="save-banner" />
            
            <div className="space-y-6">
              {/* Banner Image */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-600" />
                  {t('heroBanner')}
                </h3>

                <div className="space-y-4">
                  <StoreImageUpload
                    value={bannerUrl}
                    onChange={setBannerUrl}
                    folder="banners"
                    label={t('bannerImage')}
                    hint={t('bannerSizeHint')}
                    aspectRatio="banner"
                    maxWidth={1920}
                    maxHeight={600}
                  />
                  <input type="hidden" name="bannerUrl" value={bannerUrl} />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('bannerHeadline')}</label>
                    <input
                      type="text"
                      name="bannerText"
                      value={bannerText}
                      onChange={(e) => setBannerText(e.target.value)}
                      placeholder={t('bannerHeadlinePlaceholder')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Announcement Bar */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-purple-600" />
                  {t('announcementBar')}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t('announcementBarDesc')}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('announcementText')}</label>
                    <input
                      type="text"
                      name="announcementText"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder={t('announcementPlaceholder')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('linkOptional')}</label>
                    <input
                      type="url"
                      name="announcementLink"
                      value={announcementLink}
                      onChange={(e) => setAnnouncementLink(e.target.value)}
                      placeholder="https://yourstore.com/sale"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {announcementText && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{t('preview')}</label>
                      <div 
                        className="py-2.5 px-4 text-center text-sm font-medium text-white rounded-lg"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {announcementText}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('saveBanner')}
                </button>
              </div>
            </div>
          </Form>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <Form method="post" className="max-w-2xl">
            <input type="hidden" name="intent" value="save-info" />
            
            <div className="space-y-6">
              {/* Logo */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Store className="w-5 h-5 text-purple-600" />
                  {t('storeLogoTitle')}
                </h3>

                <div className="space-y-4">
                  <StoreImageUpload
                    value={logo}
                    onChange={setLogo}
                    folder="logos"
                    label={t('storeLogoTitle')}
                    hint={t('logoRecommendedSize')}
                    aspectRatio="logo"
                    maxWidth={400}
                    maxHeight={400}
                  />
                  <input type="hidden" name="logo" value={logo} />
                </div>
              </div>

              {/* Business Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Phone className="w-5 h-5 text-purple-600" />
                  {t('contactInfo')}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {t('phoneNumber')}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> {t('emailAddress')}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="support@yourstore.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> {t('address')}
                    </label>
                    <textarea
                      name="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main Street, Dhaka, Bangladesh"
                      rows={2}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Facebook className="w-5 h-5 text-purple-600" />
                  {t('socialMediaLinks')}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t('socialLinksDesc')}
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" /> {t('facebookUrl')}
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-600" /> {t('instagramUrl')}
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="https://instagram.com/yourprofile"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" /> {t('whatsappNumber')}
                    </label>
                    <input
                      type="text"
                      name="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">{t('whatsappHelp')}</p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('saveStoreInfo')}
                </button>
              </div>
            </div>
          </Form>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <Form method="post" className="max-w-2xl">
            <input type="hidden" name="intent" value="save-advanced" />
            
            <div className="space-y-6">
              {/* Custom CSS */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-600" />
                  {t('customCss')}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  {t('customCssDesc')}
                </p>

                <div>
                  <textarea
                    name="customCSS"
                    value={customCSS}
                    onChange={(e) => setCustomCSS(e.target.value)}
                    placeholder={`/* Example: Change header background */
.header {
  background: linear-gradient(to right, #6366f1, #8b5cf6);
}

/* Example: Custom button styles */
.btn-primary {
  border-radius: 9999px;
}`}
                    rows={12}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('cssWarning')}
                  </p>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {t('saveAdvancedSettings')}
                </button>
              </div>
            </div>
          </Form>
        )}
      </div>

      {/* Preview Modal */}
      <StoreTemplatePreviewModal
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        templateId={previewTemplate || ''}
        templateName={templates.find(t => t.id === previewTemplate)?.name || ''}
        storeName={storeName}
        onApply={() => {
          if (previewTemplate) {
            setSelectedTemplateId(previewTemplate);
          }
        }}
      />
    </div>
  );
}
