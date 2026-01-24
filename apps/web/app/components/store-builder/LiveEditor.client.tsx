import { Form, useActionData, useNavigation, Link, useSubmit } from '@remix-run/react';
import { toast } from "sonner";
import { 
  ArrowLeft, Monitor, Smartphone, Tablet, Save, Plus, Trash2, GripVertical, 
  Sparkles, CheckCircle,
  Layout, Palette, Menu, Loader2,
  ShoppingCart, ChevronDown, ChevronRight,
  Store, Rows, Settings, X, MessageCircle, Phone, Search, Code
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import { type StoreSection, DEFAULT_SECTIONS, SECTION_REGISTRY, type SectionSettings } from '~/components/store-sections/registry';
import { StoreImageUpload } from '~/components/StoreImageUpload';
import { StoreAIAssistant } from '~/components/store-builder/StoreAIAssistant';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ThemeConfig, TypographySettings } from '@db/types';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function SortableSectionItem({ section, onSelect, onDelete, isActive }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const def = SECTION_REGISTRY[section.type];
  const SectionIcon = def?.icon === 'ShoppingBag' ? ShoppingCart :
                      def?.icon === 'Mail' ? MessageCircle :
                      Layout;

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-2 p-2 bg-white rounded border mb-2 group ${isActive ? 'border-purple-500 ring-1 ring-purple-500' : 'border-gray-200'}`}>
      <button {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-4 h-4" />
      </button>
      <button onClick={() => onSelect(section.id)} className="flex-1 text-left flex items-center gap-2 overflow-hidden">
        <SectionIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{section.settings.heading || def?.name || section.type}</span>
      </button>
      <button onClick={() => onDelete(section.id)} className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function AccordionSection({ 
  title, 
  icon: Icon, 
  isOpen, 
  onToggle, 
  children 
}: { 
  title: string; 
  icon: any; 
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

const COLOR_PRESETS = [
  { name: 'Indigo', primary: '#6366f1', accent: '#f59e0b', bg: '#f9fafb', text: '#111827' },
  { name: 'Emerald', primary: '#10b981', accent: '#f472b6', bg: '#ecfdf5', text: '#064e3b' },
  { name: 'Rose', primary: '#f43f5e', accent: '#8b5cf6', bg: '#fff1f2', text: '#4c1d1d' },
  { name: 'Amber', primary: '#f59e0b', accent: '#3b82f6', bg: '#fffbeb', text: '#78350f' },
  { name: 'Sky', primary: '#0ea5e9', accent: '#f97316', bg: '#f0f9ff', text: '#0c4a6e' },
  { name: 'Dark', primary: '#8b5cf6', accent: '#f59e0b', bg: '#1f2937', text: '#f9fafb' },
  { name: 'Ghorer Bazar', primary: '#F28C38', accent: '#FF6B35', bg: '#FFF8F0', text: '#2D2D2D' },
  { name: 'Daraz', primary: '#F85606', accent: '#FFB400', bg: '#FAFAFA', text: '#212121' },
];

function SectionEditor({ section, onUpdate, onBack, onDelete }: { section: StoreSection; onUpdate: (s: Partial<SectionSettings>) => void; onBack: () => void; onDelete: () => void }) {
  const def = SECTION_REGISTRY[section.type];
  const settings = section.settings || {};

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-2 p-4 border-b bg-white">
        <button onClick={onBack} className="p-1 hover:bg-gray-100 rounded">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="font-semibold text-sm">{def?.name || 'Edit Section'}</span>
        <button onClick={onDelete} className="ml-auto text-red-500 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Common Fields */}
        {settings.heading !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Heading</label>
            <input 
              type="text" 
              value={settings.heading} 
              onChange={(e) => onUpdate({ heading: e.target.value })}
              className="w-full text-xs border rounded p-2"
            />
          </div>
        )}
        
        {settings.subheading !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Subheading</label>
            <input 
              type="text" 
              value={settings.subheading} 
              onChange={(e) => onUpdate({ subheading: e.target.value })}
              className="w-full text-xs border rounded p-2"
            />
          </div>
        )}

        {settings.text !== undefined && (
          <div>
            <label className="text-xs font-medium text-gray-700 block mb-1">Text</label>
            <textarea 
              value={settings.text} 
              onChange={(e) => onUpdate({ text: e.target.value })}
              rows={3}
              className="w-full text-xs border rounded p-2"
            />
          </div>
        )}

        {/* Image Handling using keys that might contain 'image' or specific keys like 'banner' */}
        {Object.keys(settings).filter(k => k.toLowerCase().includes('image') && typeof settings[k] === 'string').map(key => (
           <StoreImageUpload 
             key={key}
             label={key.charAt(0).toUpperCase() + key.slice(1)}
             value={settings[key]}
             onChange={(val) => onUpdate({ [key]: val })}
             folder="sections"
           />
        ))}

        {settings.alignment && (
          <div>
             <label className="text-xs font-medium text-gray-700 block mb-1">Alignment</label>
             <div className="flex bg-white border rounded">
                {['left', 'center', 'right'].map(a => (
                   <button 
                     key={a}
                     type="button"
                     onClick={() => onUpdate({ alignment: a as any })}
                     className={`flex-1 py-1 text-xs capitalize ${settings.alignment === a ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600'}`}
                   >
                     {a}
                   </button>
                ))}
             </div>
          </div>
        )}

        {/* Product Count / Limit */}
        {(settings.productCount !== undefined || settings.limit !== undefined) && (
           <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Items to Show</label>
              <input 
                 type="number" 
                 value={settings.productCount ?? settings.limit ?? 8} 
                 onChange={(e) => onUpdate({ productCount: parseInt(e.target.value), limit: parseInt(e.target.value) })}
                 className="w-full text-xs border rounded p-2"
                 min={1}
                 max={24}
              />
           </div>
        )}
      </div>
    </div>
  );
}

const DEFAULT_STORE_TEMPLATE_ID = 'modern-standard';

interface LiveEditorProps {
  store: any;
  themeConfig: ThemeConfig;
  templates: any[];
  saasDomain: string;
  demoProductId?: string | null;
}

export function LiveEditor({ store, themeConfig, templates, saasDomain: _saasDomain, demoProductId }: LiveEditorProps) {
  const actionData = useActionData<any>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { lang: _language } = useTranslation();
  
  const isSubmitting = navigation.state === 'submitting';
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // State initialization
  const [selectedTemplateId, setSelectedTemplateId] = useState(themeConfig.storeTemplateId || DEFAULT_STORE_TEMPLATE_ID);
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#6366f1');
  const [accentColor, setAccentColor] = useState(themeConfig.accentColor || '#f59e0b');
  const [backgroundColor, setBackgroundColor] = useState(themeConfig.backgroundColor || '#f9fafb');
  const [textColor, setTextColor] = useState(themeConfig.textColor || '#111827');
  const [borderColor, setBorderColor] = useState(themeConfig.borderColor || '#e5e7eb');
  
  const [typography, setTypography] = useState<TypographySettings>(themeConfig.typography || {
    headingSize: 'medium', bodySize: 'medium', lineHeight: 'normal', letterSpacing: 'normal',
  });
  
  const [fontFamily, setFontFamily] = useState(store.fontFamily || 'inter');
  const [bannerUrl, setBannerUrl] = useState(themeConfig.bannerUrl || '');
  const [bannerText, setBannerText] = useState(themeConfig.bannerText || '');
  const [announcementText, setAnnouncementText] = useState(themeConfig.announcement?.text || '');
  const [announcementLink, setAnnouncementLink] = useState(themeConfig.announcement?.link || '');
  const [customCSS, setCustomCSS] = useState(themeConfig.customCSS || '');
  
  const [logo, setLogo] = useState(store.logo || '');
  const [phone, setPhone] = useState(store.businessInfo?.phone || '');
  const [email, setEmail] = useState(store.businessInfo?.email || '');
  const [address, setAddress] = useState(store.businessInfo?.address || '');
  const [facebook, setFacebook] = useState(store.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(store.socialLinks?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(store.socialLinks?.whatsapp || '');

  const [headerLayout, setHeaderLayout] = useState<'centered' | 'left-logo' | 'minimal'>(themeConfig.headerLayout || 'centered');
  const [headerShowSearch, setHeaderShowSearch] = useState(themeConfig.headerShowSearch !== false);
  const [headerShowCart, setHeaderShowCart] = useState(themeConfig.headerShowCart !== false);

  const [footerDescription, setFooterDescription] = useState(themeConfig.footerDescription || '');
  const [copyrightText, setCopyrightText] = useState(themeConfig.copyrightText || '');
  const [footerColumns, setFooterColumns] = useState<any[]>((themeConfig.footerColumns || [])); 

  const [floatingWhatsappEnabled, setFloatingWhatsappEnabled] = useState(themeConfig.floatingWhatsappEnabled ?? true);
  const [floatingWhatsappNumber, setFloatingWhatsappNumber] = useState(themeConfig.floatingWhatsappNumber || whatsapp || '');
  const [floatingWhatsappMessage, setFloatingWhatsappMessage] = useState(themeConfig.floatingWhatsappMessage || '');
  const [floatingCallEnabled, setFloatingCallEnabled] = useState(themeConfig.floatingCallEnabled ?? true);
  const [floatingCallNumber, setFloatingCallNumber] = useState(themeConfig.floatingCallNumber || phone || '');

  const [checkoutStyle, setCheckoutStyle] = useState<'standard' | 'minimal' | 'one_page'>(themeConfig.checkoutStyle || 'standard');

  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  
  type PageType = 'home' | 'product' | 'collection' | 'cart' | 'checkout';
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  
  const [homeSections, setHomeSections] = useState<StoreSection[]>((themeConfig as any).sections || DEFAULT_SECTIONS);
  const [productSections, setProductSections] = useState<StoreSection[]>((themeConfig as any).productSections || [
    { id: 'p-info', type: 'product-info', settings: {} },
  ]);
  const [collectionSections, setCollectionSections] = useState<StoreSection[]>((themeConfig as any).collectionSections || []);
  const [cartSections, setCartSections] = useState<StoreSection[]>((themeConfig as any).cartSections || []);
  const [checkoutSections, setCheckoutSections] = useState<StoreSection[]>((themeConfig as any).checkoutSections || []);

  const pageSectionsMap: Record<PageType, { get: StoreSection[]; set: React.Dispatch<React.SetStateAction<StoreSection[]>> }> = {
    home: { get: homeSections, set: setHomeSections },
    product: { get: productSections, set: setProductSections },
    collection: { get: collectionSections, set: setCollectionSections },
    cart: { get: cartSections, set: setCartSections },
    checkout: { get: checkoutSections, set: setCheckoutSections },
  };

  const sections = pageSectionsMap[currentPage].get;
  const setSections = (newSections: StoreSection[] | ((prev: StoreSection[]) => StoreSection[])) => {
    pageSectionsMap[currentPage].set(newSections);
  };

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  
  const [flashSale, setFlashSale] = useState(themeConfig.flashSale || { isActive: false, text: "Sale!" });
  const [trustBadges, setTrustBadges] = useState(themeConfig.trustBadges || { showPaymentIcons: true, showGuaranteeSeals: true });
  const [marketingPopup, setMarketingPopup] = useState(themeConfig.marketingPopup || { isActive: false, title: "Offer", description: "Details" });
  const [seoSettings, setSeoSettings] = useState(themeConfig.seo || {});

  const [openSection, setOpenSection] = useState<string>('sections');

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
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

  // Section Management
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
    if (confirm('Remove this section?')) {
      setSections(sections.filter(s => s.id !== id));
      if (selectedSectionId === id) setSelectedSectionId(null);
    }
  };

  // Preview Iframe
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const previewUrl = `/store-preview-frame?storeId=${store.id}${demoProductId ? `&demoProductId=${demoProductId}` : ''}`;

  // State Effect Listener
  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message || 'Saved!');
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  // Sync to Iframe
  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'STORE_PREVIEW_UPDATE',
        config: {
          storeTemplateId: selectedTemplateId,
          primaryColor, accentColor, backgroundColor, textColor, borderColor,
          typography, fontFamily, bannerUrl, bannerText,
          announcement: { text: announcementText, link: announcementLink },
          customCSS,
          sections: homeSections,
          productSections: productSections,
          logo,
          businessInfo: { phone, email, address },
          socialLinks: { facebook, instagram, whatsapp },
          headerLayout, headerShowSearch, headerShowCart,
          footerDescription, copyrightText, footerColumns,
          floatingWhatsappEnabled, floatingWhatsappNumber, floatingWhatsappMessage,
          floatingCallEnabled, floatingCallNumber,
          checkoutStyle,
          flashSale, trustBadges, marketingPopup,
        },
      }, '*');
    }
  }, [
    iframeReady, selectedTemplateId, primaryColor, accentColor, backgroundColor, textColor, borderColor,
    typography, fontFamily, bannerUrl, bannerText, announcementText, announcementLink, customCSS,
    homeSections, productSections, logo, phone, email, address, facebook, instagram, whatsapp,
    headerLayout, headerShowSearch, headerShowCart, footerDescription, copyrightText, footerColumns,
    floatingWhatsappEnabled, floatingWhatsappNumber, floatingWhatsappMessage, floatingCallEnabled,
    floatingCallNumber, checkoutStyle, flashSale, trustBadges, marketingPopup
  ]);

  // Sync navigation from Iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'STORE_PREVIEW_READY') setIframeReady(true);
      if (event.data?.type === 'STORE_PREVIEW_PAGE_CHANGE') {
        setCurrentPage(event.data.page);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handlePublish = () => {
    if (confirm('Publish this theme?')) {
        const formData = new FormData(document.getElementById('editor-form') as HTMLFormElement);
        formData.append('_action', 'publish');
        submit(formData, { method: 'post' });
    }
  };

  // AI Handlers (Simplified for refactor)
  const handleAIApplyConfig = (config: any) => {
     if (config.primaryColor) setPrimaryColor(config.primaryColor);
     if (config.accentColor) setAccentColor(config.accentColor);
     toast.success("AI Design Applied!");
  };
  const handleAICommand = (command: any) => {
     toast.success("AI Command Executed");
  };

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
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <button 
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-gray-200 hidden md:block" />
          <h1 className="font-bold text-gray-900 flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-600" />
            <span className="hidden sm:inline">Store Live Editor</span>
          </h1>
        </div>

        {/* Device Toggles */}
        <div className="flex bg-gray-100/50 p-1 rounded-lg border border-gray-200">
          <button onClick={() => setPreviewDevice('desktop')} className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white shadow' : ''}`}><Monitor className="w-4"/ ></button>
          <button onClick={() => setPreviewDevice('tablet')} className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-white shadow' : ''}`}><Tablet className="w-4"/ ></button>
          <button onClick={() => setPreviewDevice('mobile')} className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white shadow' : ''}`}><Smartphone className="w-4"/ ></button>
        </div>

        <div className="flex items-center gap-2">
           <button onClick={() => setIsAIAssistantOpen(true)} className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:opacity-90">
             <Sparkles className="w-4 h-4" /> AI Assistant
           </button>
           <button onClick={handlePublish} className="flex items-center gap-2 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50">
             <CheckCircle className="w-4 h-4" /> Publish
           </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR - EDITING CONTROLS */}
        <Form method="post" id="editor-form" className={`w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${isMobileDrawerOpen ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-xl' : 'hidden md:flex'}`}>
           <input type="hidden" name="sections" value={JSON.stringify(homeSections)} />
           <input type="hidden" name="productSections" value={JSON.stringify(productSections)} />
           <input type="hidden" name="primaryColor" value={primaryColor} />
           <input type="hidden" name="accentColor" value={accentColor} />
           <input type="hidden" name="backgroundColor" value={backgroundColor} />
           <input type="hidden" name="textColor" value={textColor} />
           <input type="hidden" name="borderColor" value={borderColor} />
           <input type="hidden" name="typography" value={JSON.stringify(typography)} />
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
           <input type="hidden" name="headerShowSearch" value={headerShowSearch ? 'true' : 'false'} />
           <input type="hidden" name="headerShowCart" value={headerShowCart ? 'true' : 'false'} />
           <input type="hidden" name="footerDescription" value={footerDescription} />
           <input type="hidden" name="copyrightText" value={copyrightText} />
           <input type="hidden" name="floatingWhatsappEnabled" value={floatingWhatsappEnabled ? 'true' : 'false'} />
           <input type="hidden" name="floatingWhatsappNumber" value={floatingWhatsappNumber} />
           <input type="hidden" name="floatingWhatsappMessage" value={floatingWhatsappMessage} />
           <input type="hidden" name="floatingCallEnabled" value={floatingCallEnabled ? 'true' : 'false'} />
           <input type="hidden" name="floatingCallNumber" value={floatingCallNumber} />
           <input type="hidden" name="checkoutStyle" value={checkoutStyle} />
           <input type="hidden" name="flashSale" value={JSON.stringify(flashSale)} />
           <input type="hidden" name="trustBadges" value={JSON.stringify(trustBadges)} />
           <input type="hidden" name="marketingPopup" value={JSON.stringify(marketingPopup)} />
           <input type="hidden" name="seo" value={JSON.stringify(seoSettings)} />
           
           <div className="flex-1 overflow-y-auto custom-scrollbar">
              {selectedSectionId ? (
                 <SectionEditor 
                    section={sections.find(s => s.id === selectedSectionId)!}
                    onUpdate={(newSettings) => updateSectionSettings(selectedSectionId, newSettings)}
                    onBack={() => setSelectedSectionId(null)}
                    onDelete={() => removeSection(selectedSectionId)}
                 />
              ) : (
                 <>
                  <AccordionSection title="Sections" icon={Layout} isOpen={openSection === 'sections'} onToggle={() => setOpenSection(openSection === 'sections' ? '' : 'sections')}>
                     <p className="text-xs text-gray-500 mb-2">Drag to reorder sections.</p>
                     <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                           {sections.map((section) => (
                              <SortableSectionItem 
                                 key={section.id} 
                                 section={section} 
                                 isActive={selectedSectionId === section.id}
                                 onSelect={setSelectedSectionId} 
                                 onDelete={removeSection} 
                              />
                           ))}
                        </SortableContext>
                     </DndContext>
                     <button type="button" onClick={() => setIsAddSectionOpen(true)} className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2 text-sm mt-2">
                        <Plus className="w-4 h-4" /> Add Section
                     </button>
                  </AccordionSection>
                  
                  <AccordionSection title="Template" icon={Layout} isOpen={openSection === 'template'} onToggle={() => setOpenSection(openSection === 'template' ? '' : 'template')}>
                     <div className="space-y-2">
                        {templates.map(t => (
                           <button key={t.id} type="button" onClick={() => setSelectedTemplateId(t.id)} className={`w-full text-left p-2 border rounded ${selectedTemplateId === t.id ? 'border-purple-500 bg-purple-50' : ''}`}>
                              <div className="font-medium text-sm">{t.name}</div>
                              <div className="text-xs text-gray-500">{t.category}</div>
                           </button>
                        ))}
                     </div>
                  </AccordionSection>

              <AccordionSection title="Banner & Announcement" icon={Layout} isOpen={openSection === 'banner'} onToggle={() => setOpenSection(openSection === 'banner' ? '' : 'banner')}>
                 <div className="space-y-4">
                    <StoreImageUpload value={bannerUrl} onChange={setBannerUrl} folder="banners" label="Banner Image" hint="1920x600px" aspectRatio="banner" maxWidth={1920} maxHeight={600} />
                    <div><label className="text-xs">Headline</label><input type="text" value={bannerText} onChange={e => setBannerText(e.target.value)} className="w-full text-xs border rounded p-2" placeholder="Welcome..." /></div>
                    <div><label className="text-xs">Announcement</label><input type="text" value={announcementText} onChange={e => setAnnouncementText(e.target.value)} className="w-full text-xs border rounded p-2" placeholder="Free Shipping..." /></div>
                    <div><label className="text-xs">Link</label><input type="text" value={announcementLink} onChange={e => setAnnouncementLink(e.target.value)} className="w-full text-xs border rounded p-2" placeholder="/products/sale" /></div>
                 </div>
              </AccordionSection>

              <AccordionSection title="Colors & Style" icon={Palette} isOpen={openSection === 'theme'} onToggle={() => setOpenSection(openSection === 'theme' ? '' : 'theme')}>
                 <div className="space-y-4">
                    <div>
                       <p className="text-xs font-medium text-gray-700 mb-2">Presets</p>
                       <div className="grid grid-cols-4 gap-2">
                          {COLOR_PRESETS.map(p => (
                             <button key={p.name} type="button" onClick={() => { setPrimaryColor(p.primary); setAccentColor(p.accent); setBackgroundColor(p.bg); setTextColor(p.text); }} className="p-1 border rounded hover:border-purple-500">
                                <div className="flex h-4 w-full rounded"><div style={{background: p.primary}} className="w-1/2"/><div style={{background: p.accent}} className="w-1/2"/></div>
                             </button>
                          ))}
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                       <div><label className="text-xs">Primary</label><input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-full h-8 rounded"/></div>
                       <div><label className="text-xs">Accent</label><input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-full h-8 rounded"/></div>
                       <div><label className="text-xs">Background</label><input type="color" value={backgroundColor} onChange={e => setBackgroundColor(e.target.value)} className="w-full h-8 rounded"/></div>
                       <div><label className="text-xs">Text</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-8 rounded"/></div>
                       <div><label className="text-xs">Border</label><input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-full h-8 rounded"/></div>
                    </div>
                    <div className="border-t pt-2 mt-2">
                       <p className="text-xs font-medium mb-1">Typography</p>
                       <div className="grid grid-cols-3 gap-1">
                          {['small', 'medium', 'large'].map((s:any) => (
                             <button key={s} type="button" onClick={() => setTypography({...typography, headingSize: s})} className={`text-xs border rounded p-1 ${typography.headingSize === s ? 'bg-purple-50 border-purple-500' : ''}`}>{s}</button>
                          ))}
                       </div>
                    </div>
                 </div>
              </AccordionSection>

              <AccordionSection title="Branding" icon={Store} isOpen={openSection === 'info'} onToggle={() => setOpenSection(openSection === 'info' ? '' : 'info')}>
                 <div className="space-y-4">
                    <StoreImageUpload value={logo} onChange={setLogo} folder="logos" label="Store Logo" aspectRatio="logo" maxWidth={400} maxHeight={400} />
                    <Link to="/app/settings" className="text-xs text-purple-600 flex items-center gap-1"><Settings className="w-3" /> Full Settings</Link>
                 </div>
              </AccordionSection>

              <AccordionSection title="Contact & Social" icon={Phone} isOpen={openSection === 'contact'} onToggle={() => setOpenSection(openSection === 'contact' ? '' : 'contact')}>
                 <div className="space-y-3">
                    <div><label className="text-xs">Phone</label><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full text-xs border rounded p-2" /></div>
                    <div><label className="text-xs">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full text-xs border rounded p-2" /></div>
                    <div><label className="text-xs">Address</label><textarea value={address} onChange={e => setAddress(e.target.value)} className="w-full text-xs border rounded p-2" rows={2} /></div>
                    <div className="border-t pt-2">
                       <p className="text-xs font-medium mb-2">Social Links</p>
                       <div className="space-y-2">
                          <input type="text" value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="Facebook URL" className="w-full text-xs border rounded p-2" />
                          <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="Instagram URL" className="w-full text-xs border rounded p-2" />
                          <input type="text" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="WhatsApp Number" className="w-full text-xs border rounded p-2" />
                       </div>
                    </div>
                 </div>
              </AccordionSection>

              <AccordionSection title="Header Layout" icon={Menu} isOpen={openSection === 'header'} onToggle={() => setOpenSection(openSection === 'header' ? '' : 'header')}>
                 <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                       {['centered', 'left-logo', 'minimal'].map((l:any) => (
                          <button key={l} type="button" onClick={() => setHeaderLayout(l)} className={`p-2 border rounded text-xs ${headerLayout === l ? 'bg-purple-50 border-purple-500' : ''}`}>{l}</button>
                       ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={headerShowSearch} onChange={e => setHeaderShowSearch(e.target.checked)} /> Show Search</label>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={headerShowCart} onChange={e => setHeaderShowCart(e.target.checked)} /> Show Cart</label>
                 </div>
              </AccordionSection>

              <AccordionSection title="Footer" icon={Rows} isOpen={openSection === 'footer'} onToggle={() => setOpenSection(openSection === 'footer' ? '' : 'footer')}>
                 <div className="space-y-2">
                    <textarea value={footerDescription} onChange={e => setFooterDescription(e.target.value)} className="w-full text-xs border rounded p-2" placeholder="Footer Description" rows={2} />
                    <input value={copyrightText} onChange={e => setCopyrightText(e.target.value)} className="w-full text-xs border rounded p-2" placeholder="Copyright Text" />
                 </div>
              </AccordionSection>

              <AccordionSection title="Checkout Style" icon={ShoppingCart} isOpen={openSection === 'checkout'} onToggle={() => setOpenSection(openSection === 'checkout' ? '' : 'checkout')}>
                 <div className="space-y-2">
                    {['standard', 'minimal', 'one_page'].map((s:any) => (
                       <button key={s} type="button" onClick={() => setCheckoutStyle(s)} className={`w-full text-left p-2 border rounded text-xs ${checkoutStyle === s ? 'bg-purple-50 border-purple-500' : ''}`}>
                          {s === 'standard' ? 'Standard (Split)' : s === 'minimal' ? 'Minimal' : 'One Page'}
                       </button>
                    ))}
                 </div>
              </AccordionSection>

              <AccordionSection title="Floating Buttons" icon={MessageCircle} isOpen={openSection === 'floating'} onToggle={() => setOpenSection(openSection === 'floating' ? '' : 'floating')}>
                 <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-medium"><input type="checkbox" checked={floatingWhatsappEnabled} onChange={e => setFloatingWhatsappEnabled(e.target.checked)} /> WhatsApp Button</label>
                    {floatingWhatsappEnabled && (
                       <div className="pl-4 space-y-2">
                          <input type="text" value={floatingWhatsappNumber} onChange={e => setFloatingWhatsappNumber(e.target.value)} placeholder="Number (e.g. 017...)" className="w-full text-xs border rounded p-2" />
                          <input type="text" value={floatingWhatsappMessage} onChange={e => setFloatingWhatsappMessage(e.target.value)} placeholder="Welcome Message" className="w-full text-xs border rounded p-2" />
                       </div>
                    )}
                    <label className="flex items-center gap-2 text-xs font-medium border-t pt-2 mt-2"><input type="checkbox" checked={floatingCallEnabled} onChange={e => setFloatingCallEnabled(e.target.checked)} /> Call Button</label>
                    {floatingCallEnabled && (
                       <div className="pl-4">
                          <input type="text" value={floatingCallNumber} onChange={e => setFloatingCallNumber(e.target.value)} placeholder="Phone Number" className="w-full text-xs border rounded p-2" />
                       </div>
                    )}
                 </div>
              </AccordionSection>

              <AccordionSection title="Marketing" icon={Sparkles} isOpen={openSection === 'marketing'} onToggle={() => setOpenSection(openSection === 'marketing' ? '' : 'marketing')}>
                 <div className="space-y-4">
                    <div className="p-2 bg-amber-50 border border-amber-100 rounded">
                       <label className="flex items-center gap-2 text-xs font-bold mb-2"><input type="checkbox" checked={flashSale.isActive} onChange={e => setFlashSale({...flashSale, isActive: e.target.checked})} /> Flash Sale Bar</label>
                       {flashSale.isActive && <input type="text" value={flashSale.text} onChange={e => setFlashSale({...flashSale, text: e.target.value})} className="w-full text-xs border rounded p-1" />}
                    </div>
                    <div className="p-2 border rounded">
                       <p className="text-xs font-bold mb-2">Trust Badges</p>
                       <label className="flex items-center gap-2 text-xs block mb-1"><input type="checkbox" checked={trustBadges.showPaymentIcons} onChange={e => setTrustBadges({...trustBadges, showPaymentIcons: e.target.checked})} /> Payment Icons</label>
                       <label className="flex items-center gap-2 text-xs block"><input type="checkbox" checked={trustBadges.showGuaranteeSeals} onChange={e => setTrustBadges({...trustBadges, showGuaranteeSeals: e.target.checked})} /> Guarantee Seals</label>
                    </div>
                    <div className="p-2 bg-purple-50 border border-purple-100 rounded">
                       <label className="flex items-center gap-2 text-xs font-bold mb-2"><input type="checkbox" checked={marketingPopup.isActive} onChange={e => setMarketingPopup({...marketingPopup, isActive: e.target.checked})} /> Popup Offer</label>
                       {marketingPopup.isActive && (
                          <div className="space-y-2">
                             <input type="text" value={marketingPopup.title} onChange={e => setMarketingPopup({...marketingPopup, title: e.target.value})} placeholder="Title" className="w-full text-xs border rounded p-1" />
                             <input type="text" value={marketingPopup.offerCode} onChange={e => setMarketingPopup({...marketingPopup, offerCode: e.target.value})} placeholder="Code" className="w-full text-xs border rounded p-1" />
                          </div>
                       )}
                    </div>
                 </div>
              </AccordionSection>

              <AccordionSection title="SEO Settings" icon={Search} isOpen={openSection === 'seo'} onToggle={() => setOpenSection(openSection === 'seo' ? '' : 'seo')}>
                 <div className="space-y-2">
                    <input type="text" value={seoSettings.metaTitle || ''} onChange={e => setSeoSettings({...seoSettings, metaTitle: e.target.value})} placeholder="Meta Title" className="w-full text-xs border rounded p-2" />
                    <textarea value={seoSettings.metaDescription || ''} onChange={e => setSeoSettings({...seoSettings, metaDescription: e.target.value})} placeholder="Meta Description" className="w-full text-xs border rounded p-2" rows={3} />
                 </div>
              </AccordionSection>

                  <AccordionSection title="Advanced" icon={Code} isOpen={openSection === 'advanced'} onToggle={() => setOpenSection(openSection === 'advanced' ? '' : 'advanced')}>
                     <div>
                        <textarea value={customCSS} onChange={e => setCustomCSS(e.target.value)} placeholder="/* Custom CSS */" className="w-full text-xs font-mono border rounded p-2" rows={6} />
                     </div>
                  </AccordionSection>
                 </>
              )}
           </div>

           <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50">
                 {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} Save Changes
              </button>
           </div>
        </Form>

        {/* RIGHT PANEL - PREVIEW */}
        <main className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
           <div className="bg-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
              <span className="text-gray-300 text-sm font-medium">Live Preview</span>
              <span className="text-gray-500 text-xs">
                 {previewDevice === 'mobile' && '📱 375px (Regular)'} 
                 {previewDevice === 'tablet' && '📱 768px'}
                 {previewDevice === 'desktop' && '🖥️ 100%'}
              </span>
           </div>
           
           <div className="flex-1 flex items-start justify-center overflow-auto p-4 md:p-8 bg-gray-900/50">
              <div 
                 className="bg-white shadow-2xl overflow-hidden transition-all duration-300 relative mx-auto"
                 style={{
                    width: previewDevice === 'mobile' ? '375px' : previewDevice === 'tablet' ? '768px' : '100%',
                    height: previewDevice === 'mobile' ? '667px' : previewDevice === 'tablet' ? '1024px' : 'calc(100vh - 140px)',
                    maxWidth: previewDevice === 'desktop' ? '1280px' : undefined,
                    borderRadius: previewDevice === 'mobile' ? '40px' : previewDevice === 'tablet' ? '24px' : '8px',
                    border: previewDevice !== 'desktop' ? '12px solid #1a1a1a' : 'none',
                 }}
              >
                 <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0" title="Store Preview" />
              </div>
           </div>
        </main>
      </div>

      <StoreAIAssistant 
        isOpen={isAIAssistantOpen} 
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyConfig={handleAIApplyConfig}
        onApplyCommand={handleAICommand}
        storeContext={storeContext}
        aiCredits={store.aiCredits}
      />
      
      {isAddSectionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
           <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl h-[80vh] flex flex-col">
              <div className="p-4 border-b flex justify-between items-center">
                 <h2 className="font-bold text-lg">Add Section</h2>
                 <button onClick={() => setIsAddSectionOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                 {Object.entries(SECTION_REGISTRY).map(([key, def]) => (
                    <button key={key} onClick={() => { addSection(key); setIsAddSectionOpen(false); }} className="text-left p-3 border rounded-lg hover:border-purple-500 hover:bg-purple-50 transition">
                       <div className="font-medium text-purple-900">{def.name}</div>
                       <div className="text-xs text-gray-500">{def.description}</div>
                    </button>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
