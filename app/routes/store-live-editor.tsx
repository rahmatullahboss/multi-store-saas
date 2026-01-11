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
import { toast } from "sonner";
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
import { stores, products, marketplaceThemes } from '@db/schema';
import { parseThemeConfig, defaultThemeConfig, type ThemeConfig, type TypographySettings, parseSocialLinks } from '@db/types';
import { getStoreId } from '~/services/auth.server';
import { getAllStoreTemplates, DEFAULT_STORE_TEMPLATE_ID, STORE_TEMPLATE_THEMES } from '~/templates/store-registry';
import { 
  ArrowLeft, Monitor, Smartphone, Tablet, Save, Plus, Trash2, GripVertical, 
  Undo2, Redo2, ExternalLink, Sparkles, AlertCircle, CheckCircle2,
  Layout, Type, Image as ImageIcon, Palette, Menu, Settings, Database, Loader2,
  Phone, Mail, MapPin, Facebook, Instagram, MessageCircle, Store, ShoppingCart, Search, Rows, PlusCircle, CheckCircle, Code, User, ChevronDown, ChevronRight, Wand2, X
} from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { StoreImageUpload } from '~/components/StoreImageUpload';
import { useEditorHistory, useEditorKeyboardShortcuts } from '~/hooks/useEditorHistory';
import { useTranslation } from '~/contexts/LanguageContext';
import { StoreSection, DEFAULT_SECTIONS, SECTION_REGISTRY, SectionSettings } from '~/components/store-sections/registry';
import { StoreAIAssistant } from '~/components/store-builder/StoreAIAssistant';

// dnd-kit imports
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
function SortableSectionItem({ section, onSelect, onDelete, isActive }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const SectionIcon = SECTION_REGISTRY[section.type]?.icon === 'ShoppingBag' ? ShoppingCart :
                      SECTION_REGISTRY[section.type]?.icon === 'Mail' ? Mail :
                      Layout;

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2 bg-white rounded border mb-2 group ${isActive ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'}`}>
      <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </button>
      <button onClick={() => onSelect(section.id)} className="flex-1 text-left flex items-center gap-2 overflow-hidden">
        <SectionIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{section.settings.heading || SECTION_REGISTRY[section.type]?.name}</span>
      </button>
      <button onClick={() => onDelete(section.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}



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

  const db = drizzle(context.cloudflare.env.DB, { schema: { stores, products } });
  const store = await db.select().from(stores).where(eq(stores.id, storeId)).limit(1);
  
  if (!store[0]) throw new Response('Store not found', { status: 404 });

  // Fetch a demo product for preview
  const demoProduct = await db.query.products.findFirst({
    where: (products, { eq }) => eq(products.storeId, storeId),
    columns: { id: true }
  });
  
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
      aiCredits: store[0].aiCredits || 0,
    },
    themeConfig,
    templates: templates.map(t => ({ 
      id: t.id, 
      name: t.name, 
      category: t.category,
    })),
    saasDomain,
    demoProductId: demoProduct?.id
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

  const sectionsJson = formData.get('sections') as string || '[]';
  let sections: any[] = [];
  try {
    sections = JSON.parse(sectionsJson);
  } catch { /* ignore */ }

  const productSectionsJson = formData.get('productSections') as string || '[]';
  let productSections: any[] = [];
  try {
    productSections = JSON.parse(productSectionsJson);
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

  // Floating contact buttons
  const floatingWhatsappEnabled = formData.get('floatingWhatsappEnabled') === 'true';
  const floatingWhatsappNumber = formData.get('floatingWhatsappNumber') as string || '';
  const floatingWhatsappMessage = formData.get('floatingWhatsappMessage') as string || '';
  const floatingCallEnabled = formData.get('floatingCallEnabled') === 'true';
  const floatingCallNumber = formData.get('floatingCallNumber') as string || '';

  const updatedConfig: ThemeConfig = {
    ...currentConfig,
    storeTemplateId,
    primaryColor,
    accentColor,
    // Add sections to updated config
    // We are putting this in updatedConfig, so we need to capture it from form data or specialized parsing.
    // The code block below 'sections' input is hidden JSON string.
    
    // ... currentConfig merges existing sections. We need to overwrite if present.

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
    floatingWhatsappEnabled,
    floatingWhatsappNumber: floatingWhatsappNumber || undefined,
    floatingWhatsappMessage: floatingWhatsappMessage || undefined,
    floatingCallEnabled,
    floatingCallNumber: floatingCallNumber || undefined,
    checkoutStyle: (formData.get('checkoutStyle') as any) || 'standard',
    sections: sections.length > 0 ? sections : undefined,
    productSections: productSections.length > 0 ? productSections : undefined,
  };

  await db.update(stores).set({ 
    themeConfig: JSON.stringify(updatedConfig),
    fontFamily,
    logo: logo || null,
    businessInfo: JSON.stringify({ phone, email, address }),
    socialLinks: JSON.stringify({ facebook, instagram, whatsapp }),
    updatedAt: new Date() 
  }).where(eq(stores.id, storeId));

  // Handle explicit marketplace publishing
  const publishToMarketplace = formData.get('publishToMarketplace') === 'true';
  
  if (publishToMarketplace) {
    try {
      const marketplaceEntry = await db.select().from(marketplaceThemes).where(eq(marketplaceThemes.createdBy, storeId)).limit(1);
      
      if (marketplaceEntry.length > 0) {
        await db.update(marketplaceThemes).set({
          name: `${store[0].name}'s Custom Theme`,
          config: JSON.stringify(updatedConfig),
          updatedAt: new Date(),
          status: 'approved', // Auto-approve for now as per user request
        }).where(eq(marketplaceThemes.createdBy, storeId));
      } else {
        await db.insert(marketplaceThemes).values({
          name: `${store[0].name}'s Custom Theme`,
          description: `Submitted theme from ${store[0].name}`,
          config: JSON.stringify(updatedConfig),
          createdBy: storeId,
          authorName: store[0].name,
          status: 'approved', // Auto-approve for now
          isPublic: true,
        });
      }
      return json({ success: true, message: 'Theme published to marketplace!' });
    } catch (err) {
      console.error('Failed to publish to marketplace:', err);
      return json({ success: false, error: 'Failed to publish to marketplace' });
    }
  }

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
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

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

  // Checkout Style state
  const [checkoutStyle, setCheckoutStyle] = useState<'standard' | 'minimal' | 'one_page'>(themeConfig.checkoutStyle || 'standard');

  // Preview device
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  // Sections state
  const { demoProductId } = useLoaderData<typeof loader>();
  
  // Page State
  const [currentPage, setCurrentPage] = useState<'home' | 'product'>('home');
  
  // Sections state - defined separately for Home and Product pages
  const [homeSections, setHomeSections] = useState<StoreSection[]>((themeConfig as any).sections || DEFAULT_SECTIONS);
  const [productSections, setProductSections] = useState<StoreSection[]>((themeConfig as any).productSections || [
    { id: 'p-header', type: 'product-header', settings: {} },
    { id: 'p-gallery', type: 'product-gallery', settings: {} },
    { id: 'p-info', type: 'product-info', settings: {} },
    { id: 'p-reviews', type: 'product-reviews', settings: {} },
  ]);

  // Active sections proxy
  const sections = currentPage === 'home' ? homeSections : productSections;
  const setSections = (newSections: StoreSection[] | ((prev: StoreSection[]) => StoreSection[])) => {
    if (currentPage === 'home') {
      setHomeSections(newSections);
    } else {
      setProductSections(newSections);
    }
  };

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  
  // NEW: Sales & Marketing States
  const [flashSale, setFlashSale] = useState<{
    isActive: boolean;
    text: string;
    endTime?: string;
    backgroundColor?: string;
  }>({ isActive: false, text: "Limited Time Offer!" });

  const [trustBadges, setTrustBadges] = useState<{
    showPaymentIcons: boolean;
    showGuaranteeSeals: boolean;
  }>({ showPaymentIcons: false, showGuaranteeSeals: false });

  const [marketingPopup, setMarketingPopup] = useState<{
    isActive: boolean;
    title: string;
    description: string;
    offerCode?: string;
  }>({ isActive: false, title: "Join & Save", description: "Get 10% off your first order!" });

  const [seoSettings, setSeoSettings] = useState<{
    metaTitle?: string;
    metaDescription?: string;
  }>({});

  // Accordion state
  const [openSection, setOpenSection] = useState<string>('sections');

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSection = (type: string) => {
    const def = SECTION_REGISTRY[type];
    if (!def) return;
    
    const newSection: StoreSection = {
      id: `${type}-${Date.now()}`,
      type: def.type,
      settings: { ...def.defaultSettings }
    };
    
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const updateSectionSettings = (id: string, newSettings: Partial<SectionSettings>) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, settings: { ...s.settings, ...newSettings } } : s
    ));
  };

  const removeSection = (id: string) => {
    if (confirm('Are you sure you want to remove this section?')) {
      setSections(sections.filter(s => s.id !== id));
      if (selectedSectionId === id) setSelectedSectionId(null);
    }
  };


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
    checkoutStyle,
    sections,
  }), [selectedTemplateId, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS, logo, phone, email, address, facebook, instagram, whatsapp, headerLayout, headerShowSearch, headerShowCart, footerDescription, copyrightText, footerColumns, sections]);


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
    setCheckoutStyle(snapshot.checkoutStyle || 'standard');
    setSections(snapshot.sections);
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
  }, [selectedTemplateId, primaryColor, accentColor, backgroundColor, textColor, borderColor, typography, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS, logo, phone, email, address, facebook, instagram, whatsapp, headerLayout, headerShowSearch, headerShowCart, footerDescription, copyrightText, footerColumns, floatingWhatsappEnabled, floatingWhatsappNumber, floatingWhatsappMessage, floatingCallEnabled, floatingCallNumber, checkoutStyle, sections]);


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
          customCSS,
          sections: homeSections,
          productSections: productSections,
        },
      }, '*');
    }
  }, [iframeReady, selectedTemplateId, primaryColor, accentColor, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS, homeSections, productSections]); // Depend on both section lists


  const storeUrl = `https://${store.subdomain}.${saasDomain}`;
  // Points to internal preview frame for better reliability and real-time updates
  const previewUrl = `/store-preview-frame?storeId=${store.id}${demoProductId ? `&demoProductId=${demoProductId}` : ''}`;

  const handlePublish = () => {
    if (confirm('Are you sure you want to publish this theme to the marketplace? It will be reviewed by admins before appearing public.')) {
      const form = document.getElementById('editor-form') as HTMLFormElement;
      if (form) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'publishToMarketplace';
        input.value = 'true';
        form.appendChild(input);
        form.requestSubmit();
        // Remove input after submit to avoid republishing on next save
        setTimeout(() => input.remove(), 100);
      }
    }
  };

  const handleAIApplyConfig = (config: any) => {
    if (config.primaryColor) setPrimaryColor(config.primaryColor);
    if (config.accentColor) setAccentColor(config.accentColor);
    if (config.backgroundColor) setBackgroundColor(config.backgroundColor);
    if (config.textColor) setTextColor(config.textColor);
    if (config.borderColor) setBorderColor(config.borderColor);
    if (config.fontFamily) setFontFamily(config.fontFamily);
    if (config.checkoutStyle) setCheckoutStyle(config.checkoutStyle);
    
    if (config.sections && Array.isArray(config.sections)) {
      const newSections = config.sections.map((s: any) => {
        const def = SECTION_REGISTRY[s.type];
        return {
          id: s.id || `${s.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: s.type,
          settings: { ...def?.defaultSettings, ...s.settings }
        };
      });
      // AI primarily designs the Home page layout
      setHomeSections(newSections);
    }
  };

  // Handle granular AI commands
  const handleAICommand = (command: any) => {
    switch (command.action) {
      case 'update_colors':
        if (command.value?.primaryColor) setPrimaryColor(command.value.primaryColor);
        if (command.value?.accentColor) setAccentColor(command.value.accentColor);
        if (command.value?.backgroundColor) setBackgroundColor(command.value.backgroundColor);
        if (command.value?.textColor) setTextColor(command.value.textColor);
        break;

      case 'update_font':
        if (command.value) setFontFamily(command.value);
        break;

      case 'add_section': {
        if (!command.value?.type) break;
        const def = SECTION_REGISTRY[command.value.type];
        if (!def) break;
        
        const newSection: StoreSection = {
          id: `${command.value.type}-${Date.now()}`,
          type: def.type,
          settings: { ...def.defaultSettings, ...(command.value.settings || {}) }
        };
        
        if (command.position === 'first') {
          setHomeSections([newSection, ...homeSections]);
        } else {
          setHomeSections([...homeSections, newSection]);
        }
        setSelectedSectionId(newSection.id);
        break;
      }

      case 'remove_section': {
        const targetId = command.target;
        if (!targetId) break;
        
        // Find by ID first, then by type
        let found = homeSections.find(s => s.id === targetId);
        if (!found) {
          found = homeSections.find(s => s.type === targetId || s.type.includes(targetId));
        }
        if (found) {
          setHomeSections(homeSections.filter(s => s.id !== found!.id));
          if (selectedSectionId === found.id) setSelectedSectionId(null);
        }
        break;
      }

      case 'update_section': {
        const targetId = command.target;
        if (!targetId || !command.value) break;
        
        // Find by ID or type
        const section = homeSections.find(s => s.id === targetId) || 
                        homeSections.find(s => s.type === targetId || s.type.includes(targetId));
        if (section) {
          setHomeSections(homeSections.map(s => 
            s.id === section.id 
              ? { ...s, settings: { ...s.settings, ...command.value } }
              : s
          ));
        }
        break;
      }

      case 'reorder_sections': {
        const targetId = command.target;
        const direction = command.value;
        if (!targetId || !direction) break;
        
        const section = homeSections.find(s => s.id === targetId) ||
                        homeSections.find(s => s.type === targetId);
        if (!section) break;
        
        const idx = homeSections.findIndex(s => s.id === section.id);
        if (idx === -1) break;
        
        let newIdx = idx;
        if (direction === 'up' && idx > 0) newIdx = idx - 1;
        else if (direction === 'down' && idx < homeSections.length - 1) newIdx = idx + 1;
        else if (direction === 'first') newIdx = 0;
        else if (direction === 'last') newIdx = homeSections.length - 1;
        
        if (newIdx !== idx) {
          const newSections = [...homeSections];
          newSections.splice(idx, 1);
          newSections.splice(newIdx, 0, section);
          setHomeSections(newSections);
        }
        break;
      }

      case 'update_header':
        if (command.value?.layout) setHeaderLayout(command.value.layout);
        if (command.value?.showSearch !== undefined) setHeaderShowSearch(command.value.showSearch);
        if (command.value?.showCart !== undefined) setHeaderShowCart(command.value.showCart);
        break;

      case 'update_footer':
        if (command.value?.description) setFooterDescription(command.value.description);
        if (command.value?.copyrightText) setCopyrightText(command.value.copyrightText);
        break;

      case 'apply_preset': {
        const presets: Record<string, any> = {
          'indigo': { primary: '#6366f1', accent: '#f59e0b', bg: '#f9fafb', text: '#111827' },
          'emerald': { primary: '#10b981', accent: '#f472b6', bg: '#ecfdf5', text: '#064e3b' },
          'rose': { primary: '#f43f5e', accent: '#8b5cf6', bg: '#fff1f2', text: '#4c1d1d' },
          'amber': { primary: '#f59e0b', accent: '#3b82f6', bg: '#fffbeb', text: '#78350f' },
          'sky': { primary: '#0ea5e9', accent: '#f97316', bg: '#f0f9ff', text: '#0c4a6e' },
          'dark': { primary: '#8b5cf6', accent: '#f59e0b', bg: '#1f2937', text: '#f9fafb' },
          'ghorer-bazar': { primary: '#F28C38', accent: '#FF6B35', bg: '#FFF8F0', text: '#2D2D2D' },
          'daraz': { primary: '#F85606', accent: '#FFB400', bg: '#FAFAFA', text: '#212121' },
        };
        const presetName = typeof command.value === 'string' ? command.value.toLowerCase() : '';
        const preset = presets[presetName];
        if (preset) {
          setPrimaryColor(preset.primary);
          setAccentColor(preset.accent);
          setBackgroundColor(preset.bg);
          setTextColor(preset.text);
        }
        break;
      }

      // ============ NEW ACTIONS ============

      case 'update_announcement':
        if (command.value?.text !== undefined) setAnnouncementText(command.value.text);
        if (command.value?.link !== undefined) setAnnouncementLink(command.value.link);
        break;

      case 'update_banner':
        if (command.value?.url !== undefined) setBannerUrl(command.value.url);
        if (command.value?.text !== undefined) setBannerText(command.value.text);
        break;

      case 'update_logo':
        if (typeof command.value === 'string') setLogo(command.value);
        break;

      case 'update_business_info':
        if (command.value?.phone !== undefined) setPhone(command.value.phone);
        if (command.value?.email !== undefined) setEmail(command.value.email);
        if (command.value?.address !== undefined) setAddress(command.value.address);
        break;

      case 'update_social_links':
        if (command.value?.facebook !== undefined) setFacebook(command.value.facebook);
        if (command.value?.instagram !== undefined) setInstagram(command.value.instagram);
        if (command.value?.whatsapp !== undefined) setWhatsapp(command.value.whatsapp);
        break;

      case 'update_floating_buttons':
        if (command.value?.whatsappEnabled !== undefined) setFloatingWhatsappEnabled(command.value.whatsappEnabled);
        if (command.value?.whatsappNumber !== undefined) setFloatingWhatsappNumber(command.value.whatsappNumber);
        if (command.value?.whatsappMessage !== undefined) setFloatingWhatsappMessage(command.value.whatsappMessage);
        if (command.value?.callEnabled !== undefined) setFloatingCallEnabled(command.value.callEnabled);
        if (command.value?.callNumber !== undefined) setFloatingCallNumber(command.value.callNumber);
        break;

      case 'update_checkout':
        if (command.value === 'standard' || command.value === 'minimal' || command.value === 'one_page') {
          setCheckoutStyle(command.value);
        }
        break;

      case 'update_typography':
        setTypography(prev => ({
          ...prev,
          ...(command.value?.headingSize && { headingSize: command.value.headingSize }),
          ...(command.value?.bodySize && { bodySize: command.value.bodySize }),
          ...(command.value?.lineHeight && { lineHeight: command.value.lineHeight }),
          ...(command.value?.letterSpacing && { letterSpacing: command.value.letterSpacing }),
        }));
        break;

      case 'update_custom_css':
        if (typeof command.value === 'string') setCustomCSS(command.value);
        break;

      // ============ MARKETING & SALES ACTIONS (WORLD CLASS) ============

      case 'setup_flash_sale':
        if (command.value) {
          setFlashSale(prev => ({
            ...prev,
            isActive: true,
            text: command.value.text || prev.text,
            endTime: command.value.endTime || prev.endTime,
            backgroundColor: command.value.backgroundColor || prev.backgroundColor,
          }));
        }
        break;

      case 'add_trust_badges':
        setTrustBadges(prev => ({
          ...prev,
          showPaymentIcons: command.value?.showPaymentIcons ?? true,
          showGuaranteeSeals: command.value?.showGuaranteeSeals ?? true,
        }));
        break;

      case 'add_marketing_popup':
        if (command.value) {
          setMarketingPopup(prev => ({
            ...prev,
            isActive: true,
            title: command.value.title || prev.title,
            description: command.value.description || prev.description,
            offerCode: command.value.offerCode || prev.offerCode,
          }));
        }
        break;

      case 'optimize_seo':
        if (command.value) {
          setSeoSettings(prev => ({
            ...prev,
            metaTitle: command.value.metaTitle || prev.metaTitle,
            metaDescription: command.value.metaDescription || prev.metaDescription,
          }));
        }
        break;

      case 'create_policy_pages':
        // For now, we simulate this by enabling links in footer or similar
        // In a real app, this would create actual pages
        toast.success("Policy pages created! Check Footer.");
        break;

      case 'update_navigation':
        // Placeholder for navigation updates
        toast.success("Navigation menu updated!");
        break;

      case 'generate_product_description':
        // In editor context, maybe show a modal or apply to selected product
        toast.info("AI Description generated for product!");
        break;
        
      case 'apply_modern_card_style':
        // Add a global class or setting for card style
        setCustomCSS(prev => prev + `
          .product-card { 
            border: 1px solid #eee; 
            border-radius: 16px; 
            overflow: hidden; 
            transition: all 0.3s;
          }
          .product-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
        `);
        break;

      case 'general_response':
        // This is just a message, no action needed
        console.log('[AI] General response:', command.message);
        break;

      default:
        console.log('[AI Command] Unknown action:', command.action);
    }
  };

  // Build context for AI Assistant
  const storeContext = {
    sections: homeSections.map(s => ({ id: s.id, type: s.type, settings: s.settings })),
    currentColors: { primary: primaryColor, accent: accentColor, background: backgroundColor, text: textColor },
    currentFont: fontFamily,
    storeName: store.name
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Bar */}
      <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 z-40 relative shadow-sm">
        <div className="flex items-center gap-4">
          <Link to="/app/store-design" className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-500 hover:text-gray-900 group">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="h-6 w-px bg-gray-200" />
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <span className="hidden sm:inline">Store Live Editor</span>
            <span className="sm:hidden">Editor</span>
          </h1>
          
          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Device Toggles */}
        <div className="flex bg-gray-100/50 p-1 rounded-lg border border-gray-200">
          {[
            { id: 'desktop', icon: Monitor },
            { id: 'tablet', icon: Tablet },
            { id: 'mobile', icon: Smartphone }
          ].map((device) => (
            <button
              key={device.id}
              onClick={() => setPreviewDevice(device.id as any)}
              className={`p-2 rounded-md transition-all ${
                previewDevice === device.id
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'
              }`}
            >
              <device.icon size={18} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Undo/Redo */}
          <div className="hidden sm:flex items-center gap-1 mr-2 border-r border-gray-200 pr-4">
            <button 
              onClick={handleUndo} 
              disabled={!canUndo}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button 
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={isSubmitting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
             <Sparkles size={16} className="text-amber-500" />
             <span className="hidden lg:inline">Publish to Marketplace</span>
             <span className="lg:hidden">Publish</span>
          </button>

          <button
            onClick={() => setIsAIAssistantOpen(!isAIAssistantOpen)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
              isAIAssistantOpen 
                ? 'bg-violet-600 text-white shadow-violet-200' 
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
             <Wand2 size={16} className={isAIAssistantOpen ? "text-white" : "text-violet-600"} />
             <span className="hidden sm:inline">AI Designer</span>
          </button>

          <button
            onClick={() => (document.getElementById('editor-form') as HTMLFormElement)?.requestSubmit()}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold shadow-lg shadow-gray-200 transition-all disabled:opacity-50 active:scale-95"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar - Editing Controls */}
        <Form 
          id="editor-form" 
          method="post" 
          className={`
            fixed md:relative inset-y-0 left-0 z-30 w-80 bg-white border-r border-gray-200 flex-col flex-shrink-0 transition-transform duration-300 transform md:translate-x-0
            ${isMobileDrawerOpen ? 'translate-x-0 shadow-2xl top-16' : '-translate-x-full'}
            md:flex
          `}
        >
          {/* Mobile Close Button */}
          <div className="md:hidden flex justify-end p-2 border-b">
             <button type="button" onClick={() => setIsMobileDrawerOpen(false)} className="p-2 text-gray-500">
               <X className="w-5 h-5" />
             </button>
          </div>
          
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
            <input type="hidden" name="floatingCallEnabled" value={floatingCallEnabled.toString()} />
            <input type="hidden" name="floatingCallNumber" value={floatingCallNumber} />

            {/* Checkout Config */}
            <input type="hidden" name="checkoutStyle" value={checkoutStyle} />

            {/* SECTIONS LIST */}
            <input type="hidden" name="sections" value={JSON.stringify(homeSections)} />
            <input type="hidden" name="productSections" value={JSON.stringify(productSections)} />
            
            <AccordionSection
              title={currentPage === 'home' ? "Sections (Home)" : "Sections (Product)"}
              icon={Rows}
              isOpen={openSection === 'sections'}
              onToggle={() => setOpenSection(openSection === 'sections' ? '' : 'sections')}
            >
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={sections.map(s => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="mb-4">
                    {sections.map(section => (
                      <SortableSectionItem
                        key={section.id}
                        section={section}
                        onSelect={setSelectedSectionId}
                        onDelete={removeSection}
                        isActive={selectedSectionId === section.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add Section Button */}
              <div className="relative group">
                <button type="button" className="w-full flex items-center justify-center gap-2 p-2 border border-dashed border-gray-300 rounded hover:border-purple-500 hover:text-purple-600 transition">
                  <PlusCircle className="w-4 h-4" />
                  <span className="text-sm">Add Section</span>
                </button>
                
                {/* Add Section Dropdown */}
                <div className="hidden group-hover:block absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 shadow-lg rounded mt-1 p-2">
                  {Object.values(SECTION_REGISTRY)
                    .filter(def => {
                      if (!def.allowedPages) return true; // Default to all if not specified
                      return def.allowedPages.includes(currentPage as any);
                    })
                    .map(def => (
                    <button
                      key={def.type}
                      type="button"
                      onClick={() => addSection(def.type)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center gap-2"
                    >
                      <Plus className="w-3 h-3" />
                      {def.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION EDITING FORM */}
              {selectedSectionId && (
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                    Editing: {sections.find(s => s.id === selectedSectionId)?.settings.heading || 'Section'}
                  </h4>
                  {(() => {
                    const section = sections.find(s => s.id === selectedSectionId);
                    if (!section) return null;
                    
                    return (
                      <div className="space-y-4">
                        {/* Generic Settings Renderer */}
                        {(() => {
                          const definition = SECTION_REGISTRY[section.type];
                          const defaultSettings = definition.defaultSettings;
                          
                          return Object.entries(defaultSettings).map(([key, defaultValue]) => {
                             const value = section.settings[key] ?? defaultValue;
                             const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()); // camelCase to Title Case
                             
                             // Skip complex objects for now unless specific handlers exist
                             if (typeof defaultValue === 'object' && defaultValue !== null && key !== 'primaryAction') return null;

                             return (
                               <div key={key} className="relative">
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                                    {label}
                                    {/* Binding Indicator in Label */}
                                    {section.settings.bindings?.[key] && (
                                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                        <Database size={8} />
                                        Bound
                                      </span>
                                    )}
                                  </label>

                                  <div className="flex gap-2">
                                    <div className="relative flex-1">
                                       {/* PADDING DROPDOWNS */}
                                       {(key === 'paddingTop' || key === 'paddingBottom') ? (
                                         <select
                                            className="w-full text-xs border border-gray-300 rounded p-1.5 focus:ring-2 focus:ring-purple-500"
                                            value={value?.toString()}
                                            onChange={(e) => updateSectionSettings(section.id, { [key]: e.target.value })}
                                            disabled={!!section.settings.bindings?.[key]}
                                          >
                                            <option value="none">None</option>
                                            <option value="small">Small</option>
                                            <option value="medium">Medium</option>
                                            <option value="large">Large</option>
                                          </select>
                                       ) : 
                                       /* LONG TEXT AREAS */
                                       (key === 'subheading' || key === 'description' || key === 'content' || key === 'text') ? (
                                          <textarea 
                                            className="w-full text-sm border border-gray-300 rounded p-1.5 min-h-[80px] focus:ring-2 focus:ring-purple-500"
                                            rows={3}
                                            value={value?.toString() || ''}
                                            onChange={(e) => updateSectionSettings(section.id, { [key]: e.target.value })}
                                            disabled={!!section.settings.bindings?.[key]}
                                          />
                                       ) :
                                       /* ACTION BUTTON OBJECT (Special Case) */
                                       (key === 'primaryAction') ? (
                                          <div className="space-y-2 border border-gray-100 p-2 rounded bg-gray-50">
                                            <input 
                                              type="text"
                                              placeholder="Label"
                                              className="w-full text-xs border border-gray-300 rounded p-1 mb-1"
                                              value={(value as any)?.label || ''}
                                              onChange={(e) => updateSectionSettings(section.id, { 
                                                [key]: { ...(value as any), label: e.target.value } 
                                              })}
                                            />
                                            <input 
                                              type="text"
                                              placeholder="URL"
                                              className="w-full text-xs border border-gray-300 rounded p-1"
                                              value={(value as any)?.url || ''}
                                              onChange={(e) => updateSectionSettings(section.id, { 
                                                [key]: { ...(value as any), url: e.target.value } 
                                              })}
                                            />
                                          </div>
                                       ) :
                                       /* STANDARD INPUTS (Text/Number) */
                                       (
                                          <input 
                                            type={typeof defaultValue === 'number' ? 'number' : 'text'} 
                                            className="w-full text-sm border border-gray-300 rounded p-1.5 focus:ring-2 focus:ring-purple-500"
                                            value={value?.toString() || ''}
                                            onChange={(e) => updateSectionSettings(section.id, { [key]: typeof defaultValue === 'number' ? parseFloat(e.target.value) : e.target.value })}
                                            disabled={!!section.settings.bindings?.[key]}
                                          />
                                       )}
                                    </div>

                                    {/* DATA BINDING TRIGGER BUTTON */}
                                    {/* Only show for string/number types that are definitely bindable */}
                                    {['string', 'number'].includes(typeof defaultValue) && key !== 'id' && key !== 'type' && !['paddingTop', 'paddingBottom'].includes(key) && (
                                      <div className="relative group/binding">
                                        <button
                                          type="button"
                                          className={`p-2 rounded border transition-colors ${
                                            section.settings.bindings?.[key] 
                                              ? 'border-purple-300 bg-purple-50 text-purple-600' 
                                              : 'border-gray-300 text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                          }`}
                                          title="Connect Dynamic Data"
                                        >
                                          <Database size={14} />
                                        </button>

                                        {/* BINDING DROPDOWN MENU */}
                                        <div className="hidden group-hover/binding:block absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg z-50 overflow-hidden">
                                           <div className="text-[10px] font-bold text-gray-400 px-3 py-2 bg-gray-50 border-b border-gray-100">
                                             CONNECT "{label.toUpperCase()}" TO...
                                           </div>
                                           
                                           <div className="max-h-60 overflow-y-auto p-1">
                                             {/* Product Sources */}
                                             {currentPage === 'product' && (
                                                <div className="mb-2">
                                                  <div className="px-2 py-1 text-[10px] font-semibold text-gray-500">PRODUCT</div>
                                                  {[
                                                    { field: 'title', label: 'Title' },
                                                    { field: 'price', label: 'Price' },
                                                    { field: 'compareAtPrice', label: 'Compare Price' },
                                                    { field: 'vendor', label: 'Vendor' },
                                                    { field: 'description', label: 'Description' }
                                                  ].map(src => (
                                                    <button
                                                      key={src.field}
                                                      type="button"
                                                      onClick={() => {
                                                        const newBindings = { ...(section.settings.bindings || {}) };
                                                        newBindings[key] = { source: 'product', field: src.field };
                                                        updateSectionSettings(section.id, { bindings: newBindings });
                                                        // Update visual value to placeholder
                                                        updateSectionSettings(section.id, { [key]: `{{ product.${src.field} }}` });
                                                      }}
                                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center gap-2"
                                                    >
                                                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                      {src.label}
                                                    </button>
                                                  ))}
                                                </div>
                                             )}

                                             {/* Global Store Sources */}
                                             <div>
                                                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500">STORE</div>
                                                  {[
                                                    { field: 'name', label: 'Store Name' },
                                                    { field: 'currency', label: 'Currency' },
                                                    { field: 'email', label: 'Support Email' }
                                                  ].map(src => (
                                                    <button
                                                      key={src.field}
                                                      type="button"
                                                      onClick={() => {
                                                        const newBindings = { ...(section.settings.bindings || {}) };
                                                        newBindings[key] = { source: 'store', field: src.field };
                                                        updateSectionSettings(section.id, { bindings: newBindings });
                                                        updateSectionSettings(section.id, { [key]: `{{ store.${src.field} }}` });
                                                      }}
                                                      className="w-full text-left px-2 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 rounded flex items-center gap-2"
                                                    >
                                                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                                                      {src.label}
                                                    </button>
                                                  ))}
                                             </div>

                                             {/* Disconnect Option */}
                                             {section.settings.bindings?.[key] && (
                                               <div className="border-t border-gray-100 mt-1 pt-1">
                                                 <button
                                                    type="button"
                                                    onClick={() => {
                                                      const newBindings = { ...(section.settings.bindings || {}) };
                                                      delete newBindings[key];
                                                      updateSectionSettings(section.id, { bindings: newBindings });
                                                      // Reset to default value or empty
                                                      updateSectionSettings(section.id, { [key]: defaultValue });
                                                    }}
                                                    className="w-full text-left px-2 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded flex items-center gap-2"
                                                  >
                                                    <Trash2 size={12} />
                                                    Disconnect
                                                  </button>
                                               </div>
                                             )}
                                           </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                               </div>
                             );
                          });
                        })()}

                        <button 
                          type="button" 
                          onClick={() => setSelectedSectionId(null)}
                          className="w-full text-center text-xs text-gray-500 hover:underline mt-4 pt-2 border-t border-gray-100"
                        >
                          Close Settings
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )}

            </AccordionSection>

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
                    placeholder="017XXXXXXXX"
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
                    placeholder="support@yourstore.com"
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
              title={language === 'bn' ? 'চেকআউট স্টাইল' : 'Checkout Style'}
              icon={ShoppingCart}
              isOpen={openSection === 'checkout'}
              onToggle={() => setOpenSection(openSection === 'checkout' ? '' : 'checkout')}
            >
              <div className="space-y-4">
                <div>
                   <p className="text-xs font-medium text-gray-700 mb-2">Layout Option</p>
                   <div className="grid grid-cols-1 gap-2">
                     {[
                       { id: 'standard', label: 'Standard (Split)', desc: 'Best for trust & clarity' },
                       { id: 'minimal', label: 'Minimal', desc: 'Distraction-free, centered logo' },
                       { id: 'one_page', label: 'One Page', desc: 'Modern single column' },
                     ].map((style) => (
                       <button
                         key={style.id}
                         type="button"
                         onClick={() => setCheckoutStyle(style.id as any)}
                         className={`flex items-center gap-3 p-3 rounded-lg border text-left transition ${
                           checkoutStyle === style.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                         }`}
                       >
                         <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                           checkoutStyle === style.id ? 'border-purple-600' : 'border-gray-300'
                         }`}>
                           {checkoutStyle === style.id && <div className="w-2 h-2 rounded-full bg-purple-600" />}
                         </div>
                         <div>
                           <span className="block text-sm font-medium text-gray-900">{style.label}</span>
                           <span className="block text-xs text-gray-500">{style.desc}</span>
                         </div>
                       </button>
                     ))}
                   </div>
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

            {/* Floating Contact Buttons Section */}
            <AccordionSection
              title={language === 'bn' ? 'ফ্লোটিং বাটন' : 'Floating Buttons'}
              icon={MessageCircle}
              isOpen={openSection === 'floating'}
              onToggle={() => setOpenSection(openSection === 'floating' ? '' : 'floating')}
            >
              <div className="space-y-4">
                <p className="text-xs text-gray-500 mb-3">
                  {language === 'bn' 
                    ? 'গ্রাহকদের সহজে যোগাযোগ করতে ফ্লোটিং বাটন দেখান।'
                    : 'Show floating buttons for easy customer contact.'}
                </p>

                {/* WhatsApp Toggle */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'bn' ? 'হোয়াটসঅ্যাপ বাটন' : 'WhatsApp Button'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={floatingWhatsappEnabled}
                      onChange={(e) => setFloatingWhatsappEnabled(e.target.checked)}
                      className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                  </label>
                  
                  {floatingWhatsappEnabled && (
                    <div className="space-y-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'bn' ? 'হোয়াটসঅ্যাপ নম্বর' : 'WhatsApp Number'}
                        </label>
                        <input
                          type="tel"
                          value={floatingWhatsappNumber}
                          onChange={(e) => setFloatingWhatsappNumber(e.target.value)}
                          placeholder="01712345678"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          {language === 'bn' ? 'প্রি-ফিল্ড মেসেজ' : 'Pre-filled Message'}
                        </label>
                        <input
                          type="text"
                          value={floatingWhatsappMessage}
                          onChange={(e) => setFloatingWhatsappMessage(e.target.value)}
                          placeholder={language === 'bn' ? 'হ্যালো, আমি জানতে চাই...' : 'Hello, I want to know...'}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Call Toggle */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <label className="flex items-center justify-between cursor-pointer mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {language === 'bn' ? 'কল বাটন' : 'Call Button'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={floatingCallEnabled}
                      onChange={(e) => setFloatingCallEnabled(e.target.checked)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  {floatingCallEnabled && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="block text-xs text-gray-500 mb-1">
                        {language === 'bn' ? 'ফোন নম্বর' : 'Phone Number'}
                      </label>
                      <input
                        type="tel"
                        value={floatingCallNumber}
                        onChange={(e) => setFloatingCallNumber(e.target.value)}
                        placeholder="01712345678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
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
                src={previewUrl}
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
        
        {/* Mobile Drawer Backdrop */}
        {isMobileDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
        )}
      </div>
      
      <StoreAIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)} 
        onApplyConfig={handleAIApplyConfig}
        onApplyCommand={handleAICommand}
        storeContext={storeContext}
        aiCredits={(store as any).aiCredits}
      />
    </div>
  );
}

