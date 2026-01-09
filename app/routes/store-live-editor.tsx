/**
 * Store Live Editor Route (Elementor-Style)
 * 
 * Route: /store-live-editor (standalone - no app sidebar)
 * 
 * Split-pane layout with:
 * - Left sidebar: Compact editing controls in accordion style
 * - Right panel: Full-size live preview via iframe
 * 
 * Based on landing-live-editor.tsx pattern
 */

import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json, redirect } from '@remix-run/cloudflare';
import { Form, useLoaderData, useActionData, useNavigation, Link } from '@remix-run/react';
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, type TypographySettings, parseSocialLinks } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates, DEFAULT_STORE_TEMPLATE_ID, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { 
  Loader2, CheckCircle, ArrowLeft, Save, 
  Palette, Settings, ExternalLink, Sparkles,
  Smartphone, Tablet, Monitor, ChevronDown, ChevronRight,
  Layout, Image as ImageIcon, User, Code, Type, Phone, Mail, MapPin, 
  Facebook, Instagram, MessageCircle, Store, Menu, ShoppingCart, Search, Plus, Trash2, Rows,
  Undo2, Redo2
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { StoreImageUpload } from '~/components/StoreImageUpload';
import { useEditorHistory, useEditorKeyboardShortcuts } from '~/hooks/useEditorHistory';
import { useTranslation } from '~/contexts/LanguageContext';

export const meta: MetaFunction = () => [{ title: 'Store Live Editor - Multi-Store SaaS' }];

// Font Options - includes English and Bengali fonts
const FONT_OPTIONS = [
  // English Fonts
  { id: 'inter', name: 'Inter', family: "'Inter', sans-serif", preview: 'Modern & clean' },
  { id: 'poppins', name: 'Poppins', family: "'Poppins', sans-serif", preview: 'Friendly' },
  { id: 'roboto', name: 'Roboto', family: "'Roboto', sans-serif", preview: 'Google classic' },
  { id: 'playfair', name: 'Playfair Display', family: "'Playfair Display', serif", preview: 'Elegant' },
  { id: 'montserrat', name: 'Montserrat', family: "'Montserrat', sans-serif", preview: 'Bold' },
  // Bengali Fonts
  { id: 'hind-siliguri', name: 'Hind Siliguri', family: "'Hind Siliguri', sans-serif", preview: 'বাংলা UI' },
  { id: 'noto-sans-bengali', name: 'Noto Sans Bengali', family: "'Noto Sans Bengali', sans-serif", preview: 'বাংলা Sans' },
  { id: 'noto-serif-bengali', name: 'Noto Serif Bengali', family: "'Noto Serif Bengali', serif", preview: 'বাংলা Serif' },
  { id: 'baloo-da', name: 'Baloo Da 2', family: "'Baloo Da 2', cursive", preview: 'বাংলা Display' },
  { id: 'tiro-bangla', name: 'Tiro Bangla', family: "'Tiro Bangla', serif", preview: 'বাংলা Literary' },
  { id: 'anek-bangla', name: 'Anek Bangla', family: "'Anek Bangla', sans-serif", preview: 'বাংলা Modern' },
];

// Extended color presets with background and text colors
const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#6366f1', accent: '#f59e0b', bg: '#f9fafb', text: '#111827' },
  { name: 'Emerald', primary: '#10b981', accent: '#f472b6', bg: '#ecfdf5', text: '#064e3b' },
  { name: 'Rose', primary: '#f43f5e', accent: '#8b5cf6', bg: '#fff1f2', text: '#4c1d1d' },
  { name: 'Amber', primary: '#f59e0b', accent: '#3b82f6', bg: '#fffbeb', text: '#78350f' },
  { name: 'Sky', primary: '#0ea5e9', accent: '#f97316', bg: '#f0f9ff', text: '#0c4a6e' },
  { name: 'Dark', primary: '#8b5cf6', accent: '#f59e0b', bg: '#1f2937', text: '#f9fafb' },
  // Bengali-friendly presets
  { name: 'ঘরের বাজার', primary: '#F28C38', accent: '#FF6B35', bg: '#FFF8F0', text: '#2D2D2D' },
  { name: 'দারাজ', primary: '#F85606', accent: '#FFB400', bg: '#FAFAFA', text: '#212121' },
];

// ============================================================================
// LOADER
// ============================================================================
export async function loader({ request, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    throw redirect('/auth/login');
  }

  const db = drizzle(context.cloudflare.env.DB);
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });
  
  const themeConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;
  const templates = getAllStoreTemplates();
  const saasDomain = context.cloudflare?.env?.SAAS_DOMAIN || 'digitalcare.site';
  
  return json({
    store: {
      id: store[0].id,
      name: store[0].name,
      subdomain: store[0].subdomain,
      mode: store[0].mode || 'store',
      logo: store[0].logo || '',
      fontFamily: store[0].fontFamily || 'inter',
      businessInfo: store[0].businessInfo ? JSON.parse(store[0].businessInfo) : {},
      socialLinks: parseSocialLinks(store[0].socialLinks as string | null) || {},
    },
    themeConfig,
    templates: templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      category: t.category,
    })),
    saasDomain,
  });
}

// ============================================================================
// ACTION
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const db = drizzle(context.cloudflare.env.DB);
  
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  if (!store[0]) return json({ error: 'Store not found' }, { status: 404 });
  
  const currentConfig = parseThemeConfig(store[0].themeConfig as string | null) || defaultThemeConfig;

  // Extract all form data
  const storeTemplateId = formData.get('storeTemplateId') as string || currentConfig.storeTemplateId;
  const primaryColor = formData.get('primaryColor') as string || currentConfig.primaryColor;
  const accentColor = formData.get('accentColor') as string || currentConfig.accentColor;
  // Extended colors (Phase 1)
  const backgroundColor = formData.get('backgroundColor') as string || '';
  const textColor = formData.get('textColor') as string || '';
  const borderColor = formData.get('borderColor') as string || '';
  // Typography (Phase 1)
  const typographyJson = formData.get('typography') as string || '{}';
  let typography: TypographySettings = {};
  try {
    typography = JSON.parse(typographyJson);
  } catch { /* ignore */ }
  
  const fontFamily = formData.get('fontFamily') as string || 'inter';
  const bannerUrl = formData.get('bannerUrl') as string || '';
  const bannerText = formData.get('bannerText') as string || '';
  const announcementText = formData.get('announcementText') as string || '';
  const announcementLink = formData.get('announcementLink') as string || '';
  const customCSS = formData.get('customCSS') as string || '';
  
  // Info
  const logo = formData.get('logo') as string || '';
  const phone = formData.get('phone') as string || '';
  const email = formData.get('email') as string || '';
  const address = formData.get('address') as string || '';
  const facebook = formData.get('facebook') as string || '';
  const instagram = formData.get('instagram') as string || '';
  const whatsapp = formData.get('whatsapp') as string || '';

  // Header settings
  const headerLayout = formData.get('headerLayout') as 'centered' | 'left-logo' | 'minimal' || 'centered';
  const headerShowSearch = formData.get('headerShowSearch') === 'true';
  const headerShowCart = formData.get('headerShowCart') === 'true';

  // Footer settings
  const footerDescription = formData.get('footerDescription') as string || '';
  const copyrightText = formData.get('copyrightText') as string || '';
  const footerColumnsJson = formData.get('footerColumns') as string || '[]';
  let footerColumns: Array<{title: string; links: Array<{label: string; url: string}>}> = [];
  try {
    footerColumns = JSON.parse(footerColumnsJson);
  } catch { /* ignore parse errors */ }

  const updatedConfig: ThemeConfig = {
    ...currentConfig,
    storeTemplateId,
    primaryColor,
    accentColor,
    // Extended colors (Phase 1)
    backgroundColor: backgroundColor || undefined,
    textColor: textColor || undefined,
    borderColor: borderColor || undefined,
    // Typography (Phase 1)
    typography: Object.keys(typography).length > 0 ? typography : undefined,
    bannerUrl,
    bannerText,
    customCSS,
    announcement: announcementText ? { text: announcementText, link: announcementLink } : undefined,
    headerLayout,
    headerShowSearch,
    headerShowCart,
    footerDescription,
    copyrightText,
    footerColumns,
  };

  await db.update(stores).set({ 
    themeConfig: JSON.stringify(updatedConfig),
    fontFamily,
    logo: logo || null,
    businessInfo: JSON.stringify({ phone, email, address }),
    socialLinks: JSON.stringify({ facebook, instagram, whatsapp }),
    updatedAt: new Date() 
  }).where(eq(stores.id, storeId));

  return json({ success: true, message: 'Changes saved!' });
}

// ============================================================================
// Accordion Section Component
// ============================================================================
function AccordionSection({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  isOpen: boolean; 
  onToggle: () => void; 
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-gray-500" />
          <span className="font-medium text-gray-900 text-sm">{title}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function StoreLiveEditor() {
  const { store, themeConfig, templates, saasDomain } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { lang: language } = useTranslation();
  
  const isSubmitting = navigation.state === 'submitting';
  const [showSuccess, setShowSuccess] = useState(false);

  // State
  const [selectedTemplateId, setSelectedTemplateId] = useState(themeConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID);
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#6366f1');
  const [accentColor, setAccentColor] = useState(themeConfig.accentColor || '#f59e0b');
  // Extended colors (Phase 1)
  const [backgroundColor, setBackgroundColor] = useState(themeConfig.backgroundColor || '#f9fafb');
  const [textColor, setTextColor] = useState(themeConfig.textColor || '#111827');
  const [borderColor, setBorderColor] = useState(themeConfig.borderColor || '#e5e7eb');
  // Typography settings (Phase 1)
  const [typography, setTypography] = useState<TypographySettings>(themeConfig.typography || {
    headingSize: 'medium',
    bodySize: 'medium',
    lineHeight: 'normal',
    letterSpacing: 'normal',
  });
  
  const [fontFamily, setFontFamily] = useState(store.fontFamily);
  const [bannerUrl, setBannerUrl] = useState(themeConfig.bannerUrl || '');
  const [bannerText, setBannerText] = useState(themeConfig.bannerText || '');
  const [announcementText, setAnnouncementText] = useState(themeConfig.announcement?.text || '');
  const [announcementLink, setAnnouncementLink] = useState(themeConfig.announcement?.link || '');
  const [customCSS, setCustomCSS] = useState(themeConfig.customCSS || '');
  
  // Info state
  const [logo, setLogo] = useState(store.logo);
  const [phone, setPhone] = useState(store.businessInfo?.phone || '');
  const [email, setEmail] = useState(store.businessInfo?.email || '');
  const [address, setAddress] = useState(store.businessInfo?.address || '');
  const [facebook, setFacebook] = useState(store.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(store.socialLinks?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(store.socialLinks?.whatsapp || '');

  // Header Layout state
  const [headerLayout, setHeaderLayout] = useState<'centered' | 'left-logo' | 'minimal'>(themeConfig.headerLayout || 'centered');
  const [headerShowSearch, setHeaderShowSearch] = useState(themeConfig.headerShowSearch !== false);
  const [headerShowCart, setHeaderShowCart] = useState(themeConfig.headerShowCart !== false);

  // Footer state
  type FooterColumn = {title: string; links: {label: string; url: string}[]};
  const [footerDescription, setFooterDescription] = useState(themeConfig.footerDescription || '');
  const [copyrightText, setCopyrightText] = useState(themeConfig.copyrightText || '');
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(
    (themeConfig.footerColumns || []) as FooterColumn[]
  );

  // Floating Contact Buttons state
  const [floatingWhatsappEnabled, setFloatingWhatsappEnabled] = useState(themeConfig.floatingWhatsappEnabled ?? true);
  const [floatingWhatsappNumber, setFloatingWhatsappNumber] = useState(themeConfig.floatingWhatsappNumber || whatsapp || '');
  const [floatingWhatsappMessage, setFloatingWhatsappMessage] = useState(themeConfig.floatingWhatsappMessage || '');
  const [floatingCallEnabled, setFloatingCallEnabled] = useState(themeConfig.floatingCallEnabled ?? true);
  const [floatingCallNumber, setFloatingCallNumber] = useState(themeConfig.floatingCallNumber || phone || '');

  // Preview device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  
  // Accordion state
  const [openSection, setOpenSection] = useState<string>('template');

  // Iframe ref for postMessage communication
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);

  // ============================================================================
  // UNDO/REDO FUNCTIONALITY (Phase 1)
  // ============================================================================
  // Create a snapshot of all editable state for history tracking
  const createStateSnapshot = useCallback(() => ({
    selectedTemplateId,
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    borderColor,
    typography,
    fontFamily,
    bannerUrl,
    bannerText,
    announcementText,
    announcementLink,
    customCSS,
    logo,
    phone,
    email,
    address,
    facebook,
    instagram,
    whatsapp,
    headerLayout,
    headerShowSearch,
    headerShowCart,
    footerDescription,
    copyrightText,
    footerColumns,
  }), [selectedTemplateId, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS, logo, phone, email, address, facebook, instagram, whatsapp, headerLayout, headerShowSearch, headerShowCart, footerDescription, copyrightText, footerColumns]);

  const initialSnapshot = useRef(createStateSnapshot());
  
  const {
    state: historyState,
    setState: setHistoryState,
    undo,
    redo,
    canUndo,
    canRedo,
    saveCheckpoint,
  } = useEditorHistory(initialSnapshot.current, { maxHistory: 20, debounceMs: 500 });

  // Apply state from history
  const applyHistoryState = useCallback((snapshot: typeof historyState) => {
    setSelectedTemplateId(snapshot.selectedTemplateId);
    setPrimaryColor(snapshot.primaryColor);
    setAccentColor(snapshot.accentColor);
    setBackgroundColor(snapshot.backgroundColor);
    setTextColor(snapshot.textColor);
    setBorderColor(snapshot.borderColor);
    setTypography(snapshot.typography);
    setFontFamily(snapshot.fontFamily);
    setBannerUrl(snapshot.bannerUrl);
    setBannerText(snapshot.bannerText);
    setAnnouncementText(snapshot.announcementText);
    setAnnouncementLink(snapshot.announcementLink);
    setCustomCSS(snapshot.customCSS);
    setLogo(snapshot.logo);
    setPhone(snapshot.phone);
    setEmail(snapshot.email);
    setAddress(snapshot.address);
    setFacebook(snapshot.facebook);
    setInstagram(snapshot.instagram);
    setWhatsapp(snapshot.whatsapp);
    setHeaderLayout(snapshot.headerLayout);
    setHeaderShowSearch(snapshot.headerShowSearch);
    setHeaderShowCart(snapshot.headerShowCart);
    setFooterDescription(snapshot.footerDescription);
    setCopyrightText(snapshot.copyrightText);
    setFooterColumns(snapshot.footerColumns);
  }, []);

  // Track state changes for history
  const prevSnapshotRef = useRef<string>(JSON.stringify(initialSnapshot.current));
  useEffect(() => {
    const currentSnapshot = createStateSnapshot();
    const currentSnapshotStr = JSON.stringify(currentSnapshot);
    if (currentSnapshotStr !== prevSnapshotRef.current) {
      prevSnapshotRef.current = currentSnapshotStr;
      setHistoryState(currentSnapshot);
    }
  }, [createStateSnapshot, setHistoryState]);

  // Handle undo/redo by applying history state
  const handleUndo = useCallback(() => {
    undo();
    // Apply after state update
    setTimeout(() => {
      applyHistoryState(historyState);
    }, 0);
  }, [undo, applyHistoryState, historyState]);

  const handleRedo = useCallback(() => {
    redo();
    setTimeout(() => {
      applyHistoryState(historyState);
    }, 0);
  }, [redo, applyHistoryState, historyState]);

  // Keyboard shortcuts for undo/redo
  useEditorKeyboardShortcuts(handleUndo, handleRedo, canUndo, canRedo);

  // Track unsaved changes
  const [hasChanges, setHasChanges] = useState(false);
  const initialLoadRef = useRef(true);

  useEffect(() => {
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    setHasChanges(true);
  }, [selectedTemplateId, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS, logo, phone, email, address, facebook, instagram, whatsapp, headerLayout, headerShowSearch, headerShowCart, footerDescription, copyrightText, footerColumns, floatingWhatsappEnabled, floatingWhatsappNumber, floatingWhatsappMessage, floatingCallEnabled, floatingCallNumber]);

  // Show success message
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      setShowSuccess(true);
      setHasChanges(false);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionData]);

  // Listen for iframe ready signal
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STORE_PREVIEW_READY') {
        setIframeReady(true);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send config updates to iframe whenever config changes
  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'STORE_PREVIEW_UPDATE',
        config: {
          storeTemplateId: selectedTemplateId,
          primaryColor,
          accentColor,
          fontFamily,
          bannerUrl,
          bannerText,
          announcement: announcementText ? { text: announcementText, link: announcementLink } : undefined,
          customCSS,
        },
      }, '*');
    }
  }, [iframeReady, selectedTemplateId, primaryColor, accentColor, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS]);

  const storeUrl = `https://${store.subdomain}.${saasDomain}`;

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 flex-shrink-0 z-20">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/app/store-design"
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Store Live Editor
              </h1>
              <p className="text-xs text-gray-500">{store.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Undo/Redo Buttons (Phase 1) */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={handleUndo}
                disabled={!canUndo}
                className={`p-2 rounded-md transition ${canUndo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={!canRedo}
                className={`p-2 rounded-md transition ${canRedo ? 'text-gray-600 hover:bg-white hover:shadow-sm' : 'text-gray-300 cursor-not-allowed'}`}
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            {/* Device Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded-md transition ${previewDevice === 'mobile' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Mobile (430px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded-md transition ${previewDevice === 'tablet' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Tablet (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded-md transition ${previewDevice === 'desktop' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                title="Desktop (1200px)"
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>

            {/* Open in New Tab */}
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Open in new tab"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
            
            {/* Save Button - Form wraps the whole sidebar */}
          </div>
        </div>
      </header>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Editing Controls */}
        <Form method="post" className="hidden md:flex md:flex-col w-80 bg-white border-r border-gray-200 flex-shrink-0">
          <div className="flex-1 overflow-y-auto">
            {/* Hidden inputs for form submission */}
            <input type="hidden" name="storeTemplateId" value={selectedTemplateId} />
            <input type="hidden" name="primaryColor" value={primaryColor} />
            <input type="hidden" name="accentColor" value={accentColor} />
            {/* Extended colors (Phase 1) */}
            <input type="hidden" name="backgroundColor" value={backgroundColor} />
            <input type="hidden" name="textColor" value={textColor} />
            <input type="hidden" name="borderColor" value={borderColor} />
            {/* Typography (Phase 1) */}
            <input type="hidden" name="typography" value={JSON.stringify(typography)} />
            <input type="hidden" name="fontFamily" value={fontFamily} />
            <input type="hidden" name="bannerUrl" value={bannerUrl} />
            <input type="hidden" name="bannerText" value={bannerText} />
            <input type="hidden" name="announcementText" value={announcementText} />
            <input type="hidden" name="announcementLink" value={announcementLink} />
            <input type="hidden" name="customCSS" value={customCSS} />
            <input type="hidden" name="logo" value={logo} />
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="email" value={email} />
            <input type="hidden" name="address" value={address} />
            <input type="hidden" name="facebook" value={facebook} />
            <input type="hidden" name="instagram" value={instagram} />
            <input type="hidden" name="whatsapp" value={whatsapp} />
            <input type="hidden" name="headerLayout" value={headerLayout} />
            <input type="hidden" name="headerShowSearch" value={headerShowSearch.toString()} />
            <input type="hidden" name="headerShowCart" value={headerShowCart.toString()} />
            <input type="hidden" name="footerDescription" value={footerDescription} />
            <input type="hidden" name="copyrightText" value={copyrightText} />
            <input type="hidden" name="footerColumns" value={JSON.stringify(footerColumns)} />
            {/* Floating Contact Buttons */}
            <input type="hidden" name="floatingWhatsappEnabled" value={floatingWhatsappEnabled.toString()} />
            <input type="hidden" name="floatingWhatsappNumber" value={floatingWhatsappNumber} />
            <input type="hidden" name="floatingWhatsappMessage" value={floatingWhatsappMessage} />
            <input type="hidden" name="floatingCallEnabled" value={floatingCallEnabled.toString()} />
            <input type="hidden" name="floatingCallNumber" value={floatingCallNumber} />

            {/* Template Section */}
            <AccordionSection
              title={language === 'bn' ? 'টেমপ্লেট' : 'Template'}
              icon={Layout}
              isOpen={openSection === 'template'}
              onToggle={() => setOpenSection(openSection === 'template' ? '' : 'template')}
            >
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplateId(template.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition text-left ${
                      selectedTemplateId === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">
                        {template.name}
                      </p>
                      <p className="text-xs text-gray-500">{template.category}</p>
                    </div>
                    {selectedTemplateId === template.id && (
                      <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </AccordionSection>

            {/* Theme Section */}
            <AccordionSection
              title={language === 'bn' ? 'রঙ ও স্টাইল' : 'Colors & Style'}
              icon={Palette}
              isOpen={openSection === 'theme'}
              onToggle={() => setOpenSection(openSection === 'theme' ? '' : 'theme')}
            >
              <div className="space-y-4">
                {/* Color Presets */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Quick Presets</p>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setPrimaryColor(preset.primary);
                          setAccentColor(preset.accent);
                          setBackgroundColor(preset.bg);
                          setTextColor(preset.text);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition ${
                          primaryColor === preset.primary && backgroundColor === preset.bg ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <div className="flex gap-0.5">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.primary }} />
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.accent }} />
                        </div>
                        <span className="text-[10px] text-gray-600 truncate max-w-full">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Primary</label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Accent</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full h-8 rounded border cursor-pointer"
                    />
                  </div>
                </div>

                {/* Extended Colors (Phase 1) */}
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Extended Colors</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Background</label>
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-full h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Text</label>
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-full h-7 rounded border cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-gray-500 mb-1">Border</label>
                      <input
                        type="color"
                        value={borderColor}
                        onChange={(e) => setBorderColor(e.target.value)}
                        className="w-full h-7 rounded border cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Settings (Phase 1) */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-medium text-gray-700 mb-3 flex items-center gap-1">
                    <Type className="w-3 h-3" /> Typography
                  </p>
                  
                  {/* Heading Size */}
                  <div className="mb-3">
                    <label className="block text-[10px] text-gray-500 mb-1">Heading Size</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTypography({ ...typography, headingSize: size })}
                          className={`px-2 py-1.5 text-xs rounded border transition ${
                            typography.headingSize === size ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Size */}
                  <div className="mb-3">
                    <label className="block text-[10px] text-gray-500 mb-1">Body Size</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['small', 'medium', 'large'] as const).map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setTypography({ ...typography, bodySize: size })}
                          className={`px-2 py-1.5 text-xs rounded border transition ${
                            typography.bodySize === size ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Line Height */}
                  <div className="mb-3">
                    <label className="block text-[10px] text-gray-500 mb-1">Line Height</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['compact', 'normal', 'relaxed'] as const).map((height) => (
                        <button
                          key={height}
                          type="button"
                          onClick={() => setTypography({ ...typography, lineHeight: height })}
                          className={`px-2 py-1.5 text-[10px] rounded border transition ${
                            typography.lineHeight === height ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {height.charAt(0).toUpperCase() + height.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Letter Spacing */}
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1">Letter Spacing</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['tight', 'normal', 'wide'] as const).map((spacing) => (
                        <button
                          key={spacing}
                          type="button"
                          onClick={() => setTypography({ ...typography, letterSpacing: spacing })}
                          className={`px-2 py-1.5 text-[10px] rounded border transition ${
                            typography.letterSpacing === spacing ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 text-gray-600'
                          }`}
                        >
                          {spacing.charAt(0).toUpperCase() + spacing.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Font Family */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <Type className="w-3 h-3" /> Font Family
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        type="button"
                        onClick={() => setFontFamily(font.id)}
                        className={`p-2 rounded-lg border text-left transition ${
                          fontFamily === font.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="block text-sm font-medium text-gray-900" style={{ fontFamily: font.family }}>
                          {font.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </AccordionSection>

            {/* Banner Section */}
            <AccordionSection
              title="Banner"
              icon={ImageIcon}
              isOpen={openSection === 'banner'}
              onToggle={() => setOpenSection(openSection === 'banner' ? '' : 'banner')}
            >
              <div className="space-y-4">
                <StoreImageUpload
                  value={bannerUrl}
                  onChange={setBannerUrl}
                  folder="banners"
                  label="Banner Image"
                  hint="1920x600px recommended"
                  aspectRatio="banner"
                  maxWidth={1920}
                  maxHeight={600}
                />
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Banner Headline</label>
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    placeholder="Welcome to Our Store"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Announcement Text</label>
                  <input
                    type="text"
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="🔥 Free shipping on orders over $50!"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Store Info Section */}
            <AccordionSection
              title="Store Info"
              icon={Store}
              isOpen={openSection === 'info'}
              onToggle={() => setOpenSection(openSection === 'info' ? '' : 'info')}
            >
              <div className="space-y-4">
                <StoreImageUpload
                  value={logo}
                  onChange={setLogo}
                  folder="logos"
                  label="Store Logo"
                  aspectRatio="logo"
                  maxWidth={400}
                  maxHeight={400}
                />

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="support@store.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Social Links Section */}
            <AccordionSection
              title={language === 'bn' ? 'সোশ্যাল লিঙ্ক' : 'Social Links'}
              icon={Facebook}
              isOpen={openSection === 'social'}
              onToggle={() => setOpenSection(openSection === 'social' ? '' : 'social')}
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Facebook className="w-3 h-3 text-blue-600" /> Facebook
                  </label>
                  <input
                    type="url"
                    value={facebook}
                    onChange={(e) => setFacebook(e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Instagram className="w-3 h-3 text-pink-600" /> Instagram
                  </label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://instagram.com/yourprofile"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <MessageCircle className="w-3 h-3 text-green-600" /> WhatsApp
                  </label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </AccordionSection>

            {/* Header Layout Section */}
            <AccordionSection
              title={language === 'bn' ? 'হেডার লেআউট' : 'Header Layout'}
              icon={Menu}
              isOpen={openSection === 'header'}
              onToggle={() => setOpenSection(openSection === 'header' ? '' : 'header')}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Layout Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'centered', label: 'Centered', desc: 'Logo in center' },
                      { id: 'left-logo', label: 'Left Logo', desc: 'Classic layout' },
                      { id: 'minimal', label: 'Minimal', desc: 'Clean & simple' },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setHeaderLayout(layout.id as 'centered' | 'left-logo' | 'minimal')}
                        className={`p-2 rounded-lg border text-center transition ${
                          headerLayout === layout.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                        }`}
                      >
                        <span className="block text-xs font-medium text-gray-900">{layout.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headerShowSearch}
                      onChange={(e) => setHeaderShowSearch(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <Search className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Show Search</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={headerShowCart}
                      onChange={(e) => setHeaderShowCart(e.target.checked)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Show Cart</span>
                  </label>
                </div>
              </div>
            </AccordionSection>

            {/* Footer Section */}
            <AccordionSection
              title="Footer"
              icon={Rows}
              isOpen={openSection === 'footer'}
              onToggle={() => setOpenSection(openSection === 'footer' ? '' : 'footer')}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Footer Description</label>
                  <textarea
                    value={footerDescription}
                    onChange={(e) => setFooterDescription(e.target.value)}
                    placeholder="Your trusted online store..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Copyright Text</label>
                  <input
                    type="text"
                    value={copyrightText}
                    onChange={(e) => setCopyrightText(e.target.value)}
                    placeholder="© 2024 Your Store. All rights reserved."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Footer Columns */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-gray-700">Footer Columns</p>
                    <button
                      type="button"
                      onClick={() => setFooterColumns([...footerColumns, { title: 'New Column', links: [] }])}
                      className="text-xs text-purple-600 hover:text-purple-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Column
                    </button>
                  </div>
                  
                  {footerColumns.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-2">No footer columns yet</p>
                  )}

                  {footerColumns.map((column, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-3 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <input
                          type="text"
                          value={column.title}
                          onChange={(e) => {
                            const newColumns = [...footerColumns];
                            newColumns[idx].title = e.target.value;
                            setFooterColumns(newColumns);
                          }}
                          placeholder="Column Title"
                          className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setFooterColumns(footerColumns.filter((_, i) => i !== idx))}
                          className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">{column.links.length} links</p>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionSection>

            {/* Advanced Section */}
            <AccordionSection
              title="Custom CSS"
              icon={Code}
              isOpen={openSection === 'advanced'}
              onToggle={() => setOpenSection(openSection === 'advanced' ? '' : 'advanced')}
            >
              <div>
                <textarea
                  value={customCSS}
                  onChange={(e) => setCustomCSS(e.target.value)}
                  placeholder="/* Your custom CSS */"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-y"
                />
                <p className="text-xs text-gray-500 mt-1">⚠️ Invalid CSS may break layout</p>
              </div>
            </AccordionSection>
          </div>

          {/* Save Button - Fixed at bottom */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition ${
                hasChanges 
                  ? 'bg-purple-600 text-white hover:bg-purple-700' 
                  : 'bg-gray-200 text-gray-600'
              } disabled:opacity-50`}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : showSuccess ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {showSuccess ? 'Saved!' : 'Save Changes'}
              {hasChanges && !showSuccess && <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
            </button>
          </div>
        </Form>

        {/* Right Panel - Live Preview */}
        <main className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
          {/* Preview Header */}
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-gray-300 text-sm font-medium">Live Preview</span>
            <span className="text-gray-500 text-xs">
              {previewDevice === 'mobile' && '📱 430px'}
              {previewDevice === 'tablet' && '📱 768px'}
              {previewDevice === 'desktop' && '🖥️ 1200px'}
            </span>
          </div>
          
          {/* Preview Container */}
          <div className="flex-1 flex items-start justify-center overflow-auto p-2 md:p-4">
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden transition-all duration-300 relative"
              style={{
                width: previewDevice === 'mobile' ? '430px' : previewDevice === 'tablet' ? '768px' : '100%',
                maxWidth: previewDevice === 'desktop' ? '1200px' : undefined,
                height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '1024px' : 'calc(100vh - 140px)',
              }}
            >
              <iframe
                ref={iframeRef}
                src="/store-preview-frame"
                className="w-full h-full border-0"
                title="Store Preview"
              />
              {/* Loading overlay */}
              {!iframeReady && (
                <div className="absolute inset-0 bg-white flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Loading preview...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
