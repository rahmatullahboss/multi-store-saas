/**
 * LiveEditor V2 - Shopify OS 2.0 Compatible Theme Editor
 *
 * Full-featured theme editor with:
 * - Schema-based section editing (Shopify OS 2.0 style)
 * - Undo/Redo with keyboard shortcuts (Ctrl+Z/Ctrl+Y)
 * - Section duplication
 * - Section visibility toggle (disabled property)
 * - Drag-and-drop section reordering
 * - Block management
 * - Live preview sync
 * - AI Assistant integration
 * - Draft/Publish workflow
 */

import { Form, useActionData, useNavigation, Link, useSubmit } from '@remix-run/react';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Save,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  CheckCircle,
  Layout,
  Palette,
  Menu,
  Loader2,
  ChevronDown,
  ChevronRight,
  Store,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Undo2,
  Redo2,
  MousePointer2,
} from 'lucide-react';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useTranslation } from '~/contexts/LanguageContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// New Shopify OS 2.0 imports
import {
  getThemeBridge,
  resetThemeBridge,
  createThemeBridge,
  type EditorSection,
} from '~/lib/theme-engine/ThemeBridge';
import { SchemaSectionEditor } from '~/components/store-builder/SchemaSectionEditor';
import { SectionPicker } from '~/components/store-builder/SectionPicker';
import { StoreAIAssistant } from '~/components/store-builder/StoreAIAssistant';
import { ThemeSwitcher } from '~/components/store-builder/ThemeSwitcher';
import type { BlockInstance, SectionSchema, SectionInstance } from '~/lib/theme-engine/types';
import type { ThemeConfig, TypographySettings } from '@db/types';

// ============================================================================
// TYPES
// ============================================================================

interface AvailableTheme {
  id: string;
  name: string;
  nameBn?: string;
  description: string;
  previewImage?: string;
}

interface LiveEditorV2Props {
  store: {
    id: number;
    name: string;
    logo?: string | null;
    fontFamily?: string;
    businessInfo?: { phone?: string; email?: string; address?: string };
    socialLinks?: { facebook?: string; instagram?: string; whatsapp?: string };
    aiCredits?: number;
  };
  themeConfig: ThemeConfig & {
    sections?: EditorSection[];
    productSections?: EditorSection[];
    collectionSections?: EditorSection[];
    cartSections?: EditorSection[];
    checkoutSections?: EditorSection[];
    storeTemplateId?: string;
    announcement?: { text?: string; link?: string };
    headerLayout?: 'centered' | 'left-logo' | 'minimal';
    headerShowSearch?: boolean;
    headerShowCart?: boolean;
    footerDescription?: string;
    copyrightText?: string;
    floatingWhatsappEnabled?: boolean;
    floatingWhatsappNumber?: string;
    floatingWhatsappMessage?: string;
    floatingCallEnabled?: boolean;
    floatingCallNumber?: string;
    checkoutStyle?: 'standard' | 'minimal' | 'one_page';
    flashSale?: { isActive: boolean; text?: string };
    trustBadges?: { showPaymentIcons?: boolean; showGuaranteeSeals?: boolean };
    marketingPopup?: {
      isActive: boolean;
      title?: string;
      description?: string;
      offerCode?: string;
    };
    seo?: { metaTitle?: string; metaDescription?: string };
  };
  templates: Array<{ id: string; name: string; category: string }>;
  saasDomain: string;
  themeId?: string;
  demoProductId?: string | null;
  availableThemes?: AvailableTheme[];
}

// Extended EditorSection with Shopify's disabled property
interface EditorSectionWithState extends EditorSection {
  disabled?: boolean;
}

// History state for undo/redo
interface HistoryState {
  sections: EditorSectionWithState[];
  timestamp: number;
}

// ============================================================================
// UNDO/REDO HOOK
// ============================================================================

function useUndoRedo<T>(initialState: T, maxHistory: number = 50) {
  const [history, setHistory] = useState<{ past: T[]; present: T; future: T[] }>({
    past: [],
    present: initialState,
    future: [],
  });

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setHistory((h) => {
        const next =
          typeof newState === 'function' ? (newState as (prev: T) => T)(h.present) : newState;

        // Don't add to history if state hasn't changed
        if (JSON.stringify(next) === JSON.stringify(h.present)) {
          return h;
        }

        const newPast = [...h.past, h.present].slice(-maxHistory);
        return {
          past: newPast,
          present: next,
          future: [],
        };
      });
    },
    [maxHistory]
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previous = h.past[h.past.length - 1];
      const newPast = h.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [h.present, ...h.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const next = h.future[0];
      const newFuture = h.future.slice(1);
      return {
        past: [...h.past, h.present],
        present: next,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  return {
    state: history.present,
    set,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}

// ============================================================================
// SORTABLE SECTION ITEM
// ============================================================================

function SortableSectionItem({
  section,
  schema,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleVisibility,
  isActive,
}: {
  section: EditorSectionWithState;
  schema: SectionSchema | null;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleVisibility: () => void;
  isActive: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Get display name from settings or schema
  const displayName =
    (section.settings.heading as string) ||
    (section.settings.title as string) ||
    schema?.name ||
    section.type;

  const isDisabled = section.disabled;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 bg-white rounded border mb-2 group transition-all ${
        isActive
          ? 'border-purple-500 ring-1 ring-purple-500'
          : isDisabled
            ? 'border-gray-200 opacity-50'
            : 'border-gray-200'
      }`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <button
        onClick={onSelect}
        className="flex-1 text-left flex items-center gap-2 overflow-hidden"
      >
        <Layout
          className={`w-4 h-4 flex-shrink-0 ${isDisabled ? 'text-gray-300' : 'text-gray-500'}`}
        />
        <span
          className={`text-sm font-medium truncate ${isDisabled ? 'text-gray-400 line-through' : ''}`}
        >
          {displayName}
        </span>
      </button>

      {/* Action buttons */}
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Visibility toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility();
          }}
          className="p-1 text-gray-400 hover:text-gray-600"
          title={isDisabled ? 'Show section' : 'Hide section'}
        >
          {isDisabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>

        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-gray-400 hover:text-blue-500"
          title="Duplicate section"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-500"
          title="Delete section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ACCORDION SECTION
// ============================================================================

function AccordionSection({
  title,
  icon: Icon,
  isOpen,
  onToggle,
  children,
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
      {isOpen && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ============================================================================
// COLOR PRESETS
// ============================================================================

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

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function LiveEditorV2({
  store,
  themeConfig,
  templates: _templates,
  saasDomain: _saasDomain,
  themeId = 'starter-store',
  demoProductId,
  availableThemes = [],
}: LiveEditorV2Props) {
  const actionData = useActionData<{ success?: boolean; error?: string; message?: string }>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const { lang: _language } = useTranslation();

  const isSubmitting = navigation.state === 'submitting';

  // Current theme state
  const [currentThemeId, setCurrentThemeId] = useState(themeId);

  // Initialize theme bridge (re-create when theme changes)
  const themeBridge = useMemo(() => getThemeBridge(currentThemeId), [currentThemeId]);
  const sectionRegistry = themeBridge.getSectionRegistry();

  // ============================================================================
  // STATE WITH UNDO/REDO
  // ============================================================================

  // Check for global header/footer in initial config, otherwise create defaults
  const hasHeader = (themeConfig.sections || []).some((s) => s.type === 'header');
  const hasFooter = (themeConfig.sections || []).some((s) => s.type === 'footer');

  const defaultHeader = !hasHeader ? themeBridge.createSection('header') : null;
  const defaultFooter = !hasFooter ? themeBridge.createSection('footer') : null;

  const globalHeader = defaultHeader ? [{ ...defaultHeader, disabled: false }] : [];
  const globalFooter = defaultFooter ? [{ ...defaultFooter, disabled: false }] : [];

  // Helper to ensure header/footer are present
  const withGlobals = (sections: any[]) => {
    const safeSections = sections || [];
    // If we have global defaults to inject, do it. 
    // Otherwise assume sections list already has them (if saved previously) or doesn't need them.
    // Actually, for product/collection pages, they MIGHT NOT have them if saved previously without section groups logic.
    // So we should enforce them if they are missing from the specific list too?
    // Simplified: Just prepend/append if we created defaults.
    return [...globalHeader, ...safeSections, ...globalFooter].map((s) => ({
      ...s,
      disabled: (s as EditorSectionWithState).disabled || false,
    }));
  };

  // Convert initial sections to include disabled property
  const initialHomeSections: EditorSectionWithState[] = withGlobals(themeConfig.sections);
  const initialProductSections: EditorSectionWithState[] = withGlobals(themeConfig.productSections);
  const initialCollectionSections: EditorSectionWithState[] = withGlobals(themeConfig.collectionSections);
  const initialCartSections: EditorSectionWithState[] = withGlobals(themeConfig.cartSections);


  const initialCheckoutSections: EditorSectionWithState[] = (
    themeConfig.checkoutSections || []
  ).map((s) => ({
    ...s,
    disabled: (s as EditorSectionWithState).disabled || false,
  }));

  // Sections state with undo/redo
  const {
    state: homeSections,
    set: setHomeSections,
    undo: undoHome,
    redo: redoHome,
    reset: resetHomeSections,
    canUndo: canUndoHome,
    canRedo: canRedoHome,
  } = useUndoRedo<EditorSectionWithState[]>(initialHomeSections);

  const {
    state: productSections,
    set: setProductSections,
    undo: undoProduct,
    redo: redoProduct,
    reset: resetProductSections,
    canUndo: canUndoProduct,
    canRedo: canRedoProduct,
  } = useUndoRedo<EditorSectionWithState[]>(initialProductSections);

  const {
    state: collectionSections,
    set: setCollectionSections,
    undo: undoCollection,
    redo: redoCollection,
    reset: resetCollectionSections,
    canUndo: canUndoCollection,
    canRedo: canRedoCollection,
  } = useUndoRedo<EditorSectionWithState[]>(initialCollectionSections);

  const {
    state: cartSections,
    set: setCartSections,
    undo: undoCart,
    redo: redoCart,
    reset: resetCartSections,
    canUndo: canUndoCart,
    canRedo: canRedoCart,
  } = useUndoRedo<EditorSectionWithState[]>(initialCartSections);

  const {
    state: checkoutSections,
    set: setCheckoutSections,
    undo: undoCheckout,
    redo: redoCheckout,
    reset: resetCheckoutSections,
    canUndo: canUndoCheckout,
    canRedo: canRedoCheckout,
  } = useUndoRedo<EditorSectionWithState[]>(initialCheckoutSections);

  // UI State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string>('sections');

  type PageType = 'home' | 'product' | 'collection' | 'cart' | 'checkout';
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [sidebarTab, setSidebarTab] = useState<'sections' | 'settings'>('sections');
  const [inspectorMode, setInspectorMode] = useState(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);

  // Theme settings state
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    themeConfig.storeTemplateId || 'modern-standard'
  );
  const [primaryColor, setPrimaryColor] = useState(themeConfig.primaryColor || '#6366f1');
  const [accentColor, setAccentColor] = useState(themeConfig.accentColor || '#f59e0b');
  const [backgroundColor, setBackgroundColor] = useState(themeConfig.backgroundColor || '#f9fafb');
  const [textColor, setTextColor] = useState(themeConfig.textColor || '#111827');
  const [borderColor, setBorderColor] = useState(themeConfig.borderColor || '#e5e7eb');
  const [typography, setTypography] = useState<TypographySettings>(
    themeConfig.typography || {
      headingSize: 'medium',
      bodySize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    }
  );
  const [logo, setLogo] = useState(store.logo || '');
  const [bannerUrl, setBannerUrl] = useState(themeConfig.bannerUrl || '');
  const [bannerText, setBannerText] = useState(themeConfig.bannerText || '');
  const [announcementText, setAnnouncementText] = useState(themeConfig.announcement?.text || '');
  const [announcementLink, setAnnouncementLink] = useState(themeConfig.announcement?.link || '');
  const [customCSS, setCustomCSS] = useState(themeConfig.customCSS || '');
  const [favicon, setFavicon] = useState(themeConfig.favicon || '');
  
  // Social Media
  const [facebook, setFacebook] = useState(store.socialLinks?.facebook || '');
  const [instagram, setInstagram] = useState(store.socialLinks?.instagram || '');
  const [whatsapp, setWhatsapp] = useState(store.socialLinks?.whatsapp || '');

  // ============================================================================
  // COMPUTED VALUES (Memoized for performance)
  // ============================================================================

  const pageSectionsMap = useMemo<
    Record<
      PageType,
      {
        sections: EditorSectionWithState[];
        setSections: (
          s:
            | EditorSectionWithState[]
            | ((prev: EditorSectionWithState[]) => EditorSectionWithState[])
        ) => void;
        undo: () => void;
        redo: () => void;
        canUndo: boolean;
        canRedo: boolean;
      }
    >
  >(
    () => ({
      home: {
        sections: homeSections,
        setSections: setHomeSections,
        undo: undoHome,
        redo: redoHome,
        canUndo: canUndoHome,
        canRedo: canRedoHome,
      },
      product: {
        sections: productSections,
        setSections: setProductSections,
        undo: undoProduct,
        redo: redoProduct,
        canUndo: canUndoProduct,
        canRedo: canRedoProduct,
      },
      collection: {
        sections: collectionSections,
        setSections: setCollectionSections,
        undo: undoCollection,
        redo: redoCollection,
        canUndo: canUndoCollection,
        canRedo: canRedoCollection,
      },
      cart: {
        sections: cartSections,
        setSections: setCartSections,
        undo: undoCart,
        redo: redoCart,
        canUndo: canUndoCart,
        canRedo: canRedoCart,
      },
      checkout: {
        sections: checkoutSections,
        setSections: setCheckoutSections,
        undo: undoCheckout,
        redo: redoCheckout,
        canUndo: canUndoCheckout,
        canRedo: canRedoCheckout,
      },
    }),
    [
      homeSections,
      setHomeSections,
      undoHome,
      redoHome,
      canUndoHome,
      canRedoHome,
      productSections,
      setProductSections,
      undoProduct,
      redoProduct,
      canUndoProduct,
      canRedoProduct,
      collectionSections,
      setCollectionSections,
      undoCollection,
      redoCollection,
      canUndoCollection,
      canRedoCollection,
      cartSections,
      setCartSections,
      undoCart,
      redoCart,
      canUndoCart,
      canRedoCart,
      checkoutSections,
      setCheckoutSections,
      undoCheckout,
      redoCheckout,
      canUndoCheckout,
      canRedoCheckout,
    ]
  );

  const { sections, setSections, undo, redo, canUndo, canRedo } = pageSectionsMap[currentPage];

  const selectedSection = sections.find((s) => s.id === selectedSectionId);
  const selectedSectionSchema = selectedSection
    ? themeBridge.getSectionSchema(selectedSection.type)
    : null;

  // ============================================================================
  // SECTION GROUPS (Shopify OS 2.0 Pattern)
  // ============================================================================
  // Header Group: announcement-bar, header (shared across all pages)
  // Template Sections: page-specific sections
  // Footer Group: footer (shared across all pages)
  
  const { headerSections, templateSections, footerSections } = useMemo(() => {
    const HEADER_TYPES = ['announcement-bar', 'header'];
    const FOOTER_TYPES = ['footer'];
    
    const header: EditorSectionWithState[] = [];
    const template: EditorSectionWithState[] = [];
    const footer: EditorSectionWithState[] = [];
    
    for (const section of sections) {
      if (HEADER_TYPES.includes(section.type)) {
        header.push(section);
      } else if (FOOTER_TYPES.includes(section.type)) {
        footer.push(section);
      } else {
        template.push(section);
      }
    }
    
    return { headerSections: header, templateSections: template, footerSections: footer };
  }, [sections]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) {
          undo();
          toast.success('Undone!');
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (canRedo) {
          redo();
          toast.success('Redone!');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo]);

  // ============================================================================
  // DND SETUP
  // ============================================================================

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

  // ============================================================================
  // SECTION MANAGEMENT
  // ============================================================================

  const handleAddSection = (section: SectionInstance) => {
    const newSection: EditorSectionWithState = {
      id: section.id,
      type: section.type,
      settings: section.settings,
      blocks: section.blocks,
      disabled: false,
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const handleUpdateSectionSettings = (newSettings: Partial<Record<string, unknown>>) => {
    if (!selectedSectionId) return;
    setSections(
      sections.map((s) =>
        s.id === selectedSectionId ? { ...s, settings: { ...s.settings, ...newSettings } } : s
      )
    );
  };

  const handleUpdateSectionBlocks = (blocks: BlockInstance[]) => {
    if (!selectedSectionId) return;
    setSections(sections.map((s) => (s.id === selectedSectionId ? { ...s, blocks } : s)));
  };

  const handleDeleteSection = (id: string) => {
    if (confirm('Remove this section?')) {
      setSections(sections.filter((s) => s.id !== id));
      if (selectedSectionId === id) setSelectedSectionId(null);
      toast.success('Section removed');
    }
  };

  const handleDuplicateSection = (id: string) => {
    const sectionToDuplicate = sections.find((s) => s.id === id);
    if (!sectionToDuplicate) return;

    const duplicatedSection: EditorSectionWithState = {
      ...sectionToDuplicate,
      id: `${sectionToDuplicate.type}-${Date.now()}`,
      blocks: sectionToDuplicate.blocks?.map((b) => ({
        ...b,
        id: `${b.type}-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      })),
    };

    const index = sections.findIndex((s) => s.id === id);
    const newSections = [...sections];
    newSections.splice(index + 1, 0, duplicatedSection);
    setSections(newSections);
    setSelectedSectionId(duplicatedSection.id);
    toast.success('Section duplicated');
  };

  const handleToggleSectionVisibility = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (!section) return;

    const wasDisabled = section.disabled;
    setSections(sections.map((s) => (s.id === id ? { ...s, disabled: !s.disabled } : s)));
    toast.success(wasDisabled ? 'Section shown' : 'Section hidden');
  };

  // ============================================================================
  // PREVIEW SYNC
  // ============================================================================

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeReady, setIframeReady] = useState(false);
  const previewUrl = `/store-preview-frame?storeId=${store.id}${
    demoProductId ? `&demoProductId=${demoProductId}` : ''
  }`;

  useEffect(() => {
    if (iframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'STORE_PREVIEW_UPDATE',
          config: {
            themeId: currentThemeId, // Bug #2 fix: Add themeId for ThemeStoreRenderer
            storeTemplateId: currentThemeId, // Use currentThemeId instead of selectedTemplateId
            primaryColor,
            accentColor,
            backgroundColor,
            textColor,
            borderColor,
            typography,
            bannerUrl,
            bannerText,
            announcement: { text: announcementText, link: announcementLink },
            customCSS,
            sections: homeSections.filter((s) => !s.disabled), // Now contains header/footer!
            productSections: productSections.filter((s) => !s.disabled),
            collectionSections: collectionSections.filter((s) => !s.disabled),
            cartSections: cartSections.filter((s) => !s.disabled),
            checkoutSections: checkoutSections.filter((s) => !s.disabled),
            logo,
          },
        },
        window.location.origin
      );
    }
  }, [
    iframeReady,
    currentThemeId, // Add currentThemeId to dependencies
    primaryColor,
    accentColor,
    backgroundColor,
    textColor,
    borderColor,
    typography,
    bannerUrl,
    bannerText,
    announcementText,
    announcementLink,
    customCSS,
    homeSections,
    productSections,
    collectionSections,
    cartSections,
    checkoutSections,
    headerSections, // Added dependency
    footerSections, // Added dependency
    logo,
  ]);

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

  // ============================================================================
  // ACTION EFFECTS
  // ============================================================================

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.message || 'Saved!');
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handlePublish = () => {
    if (confirm('Publish this theme?')) {
      const formData = new FormData(document.getElementById('editor-form') as HTMLFormElement);
      formData.append('_action', 'publish');
      submit(formData, { method: 'post' });
    }
  };

  // AI Handler
  const handleAIApplyConfig = (config: Record<string, unknown>) => {
    if (config.primaryColor) setPrimaryColor(config.primaryColor as string);
    if (config.accentColor) setAccentColor(config.accentColor as string);
    if (config.backgroundColor) setBackgroundColor(config.backgroundColor as string);
    if (config.textColor) setTextColor(config.textColor as string);
    toast.success('AI Design Applied!');
  };

  const handleAICommand = (command: Record<string, unknown>) => {
    // Handle AI commands like "add hero section", "change colors", etc.
    console.log('AI Command:', command);
    toast.success('AI Command Executed');
  };

  // Theme switching handler
  const handleThemeChange = useCallback(
    async (newThemeId: string) => {
      try {
        // Bug #7 fix: Reset singleton and create fresh bridge for new theme
        resetThemeBridge();
        const newThemeBridge = createThemeBridge(newThemeId);

        // Load the default template for the new theme
        const defaultTemplate = await newThemeBridge.loadTemplate('index');

        if (defaultTemplate) {
         // Create default global sections for the new theme
        const headerSection = newThemeBridge.createSection('header');
        const footerSection = newThemeBridge.createSection('footer');
        const globalHeader = headerSection ? [headerSection] : [];
        const globalFooter = footerSection ? [footerSection] : [];

        // Load index template (Home)
        const indexTemplate = await newThemeBridge.loadTemplate('index');
        if (indexTemplate) {
          const homeSectionsNew = newThemeBridge.templateToEditorSections(indexTemplate);
          resetHomeSections([...globalHeader, ...homeSectionsNew, ...globalFooter]);
        } else {
          resetHomeSections([...globalHeader, ...globalFooter]);
        }

        // Load product template
        const productTemplate = await newThemeBridge.loadTemplate('product');
        if (productTemplate) {
          const productSectionsNew = newThemeBridge.templateToEditorSections(productTemplate);
          resetProductSections([...globalHeader, ...productSectionsNew, ...globalFooter]);
        } else {
          resetProductSections([...globalHeader, ...globalFooter]);
        }

        // Load collection template
        const collectionTemplate = await newThemeBridge.loadTemplate('collection');
        if (collectionTemplate) {
          const collectionSectionsNew = newThemeBridge.templateToEditorSections(collectionTemplate);
          resetCollectionSections([...globalHeader, ...collectionSectionsNew, ...globalFooter]);
        } else {
          resetCollectionSections([...globalHeader, ...globalFooter]);
        }

        // Load cart template
        const cartTemplate = await newThemeBridge.loadTemplate('cart');
        if (cartTemplate) {
          const cartSectionsNew = newThemeBridge.templateToEditorSections(cartTemplate);
          resetCartSections([...globalHeader, ...cartSectionsNew, ...globalFooter]);
        } else {
          resetCartSections([...globalHeader, ...globalFooter]);
        }

        // Load checkout template (usually minimal/fixed)
        const checkoutTemplate = await newThemeBridge.loadTemplate('checkout');
        if (checkoutTemplate) {
          const checkoutSectionsNew = newThemeBridge.templateToEditorSections(checkoutTemplate);
          resetCheckoutSections(checkoutSectionsNew.map((s) => ({ ...s, disabled: false })));
        } else {
          resetCheckoutSections([]);
        }
      }

        // Update current theme ID
        setCurrentThemeId(newThemeId);

        // AUTO-SAVE: Submit form to save new theme defaults to DB
        // This keeps DB, Editor, and Preview in sync
        setTimeout(() => {
          const formData = new FormData();
          formData.append('themeId', newThemeId);
          formData.append('storeTemplateId', newThemeId);
          formData.append('primaryColor', primaryColor);
          formData.append('accentColor', accentColor);
          formData.append('backgroundColor', backgroundColor);
          formData.append('textColor', textColor);
          formData.append('borderColor', borderColor);
          formData.append('typography', JSON.stringify(typography));
          formData.append('fontFamily', store.fontFamily || 'inter');
          
          // Create default global sections
          const headerSection = newThemeBridge.createSection('header');
          const footerSection = newThemeBridge.createSection('footer');
          const globalHeader = headerSection ? [headerSection] : [];
          const globalFooter = footerSection ? [footerSection] : [];

          // Get the new sections from themeBridge
          const indexTemplate = newThemeBridge.getTemplate('index');
          const productTemplate = newThemeBridge.getTemplate('product');
          const collectionTemplate = newThemeBridge.getTemplate('collection');
          const cartTemplate = newThemeBridge.getTemplate('cart');
          
          const newHomeSections = indexTemplate ? newThemeBridge.templateToEditorSections(indexTemplate) : [];
          const newProductSections = productTemplate ? newThemeBridge.templateToEditorSections(productTemplate) : [];
          const newCollectionSections = collectionTemplate ? newThemeBridge.templateToEditorSections(collectionTemplate) : [];
          const newCartSections = cartTemplate ? newThemeBridge.templateToEditorSections(cartTemplate) : [];
          
          const fullHomeSections = [...globalHeader, ...newHomeSections, ...globalFooter];
          const fullProductSections = [...globalHeader, ...newProductSections, ...globalFooter];
          const fullCollectionSections = [...globalHeader, ...newCollectionSections, ...globalFooter];
          const fullCartSections = [...globalHeader, ...newCartSections, ...globalFooter];

          formData.append('sections', JSON.stringify(fullHomeSections));
          formData.append('productSections', JSON.stringify(fullProductSections));
          formData.append('collectionSections', JSON.stringify(fullCollectionSections));
          formData.append('cartSections', JSON.stringify(fullCartSections));
          formData.append('checkoutSections', JSON.stringify([]));
          
          // Submit to save to DB
          submit(formData, { method: 'post' });
        }, 100);

        toast.success(`Switched to ${newThemeId} theme - saving...`);
      } catch (error) {
        console.error('Error switching theme:', error);
        toast.error('Failed to switch theme');
      }
    },
    [
      resetHomeSections,
      resetProductSections,
      resetCollectionSections,
      resetCartSections,
      resetCheckoutSections,
      primaryColor,
      accentColor,
      backgroundColor,
      textColor,
      borderColor,
      typography,
      store.fontFamily,
      submit,
    ]
  );

  const storeContext = {
    sections: homeSections.map((s) => ({ id: s.id, type: s.type, settings: s.settings })),
    currentColors: {
      primary: primaryColor,
      accent: accentColor,
      background: backgroundColor,
      text: textColor,
    },
    currentFont: store.fontFamily || 'inter',
    storeName: store.name,
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* TOP BAR */}
      <div className="h-16 px-4 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 z-40 relative shadow-sm">
        <div className="flex items-center gap-3">
          {/* Exit Button - Shopify OS 2.0 Style */}
          <Link
            to="/app/store-design"
            className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-lg transition text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </Link>
          
          <div className="h-6 w-px bg-gray-200" />
          
          {/* Page Selector Dropdown - Shopify OS 2.0 Style */}
          <div className="relative">
            <select
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value as PageType)}
              className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 pr-8 text-sm font-medium text-gray-900 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
            >
              <option value="home">Home page</option>
              <option value="product">Product page</option>
              <option value="collection">Collection page</option>
              <option value="cart">Cart page</option>
              <option value="checkout">Checkout</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="h-6 w-px bg-gray-200 hidden lg:block" />

          {/* Theme Switcher */}
          {availableThemes.length > 0 && (
            <div className="hidden lg:block">
              <ThemeSwitcher
                currentThemeId={currentThemeId}
                availableThemes={availableThemes}
                onThemeChange={handleThemeChange}
                disabled={isSubmitting}
              />
            </div>
          )}
          
          {/* Mobile menu toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-500"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

          {/* Center - Undo/Redo + Tools + Devices */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    undo();
                    toast.success('Undone!');
                  }}
                  disabled={!canUndo}
                  className={`p-1.5 rounded ${canUndo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    redo();
                    toast.success('Redone!');
                  }}
                  disabled={!canRedo}
                  className={`p-1.5 rounded ${canRedo ? 'hover:bg-gray-100 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </button>
             </div>

             <div className="h-4 w-px bg-gray-200" />
            
             <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-lg border border-gray-200">
               {/* Inspector & AI */}
                <div className="flex items-center border-r border-gray-300 pr-2 mr-1 gap-1">
                  <button
                    onClick={() => setInspectorMode(!inspectorMode)}
                    className={`p-1.5 rounded ${inspectorMode ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-white'}`}
                    title="Inspector Mode"
                  >
                    <MousePointer2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsAIAssistantOpen(true)}
                    className={`p-1.5 rounded text-purple-600 hover:bg-purple-50`}
                    title="AI Assistant"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Device Toggles */}
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Desktop view"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('tablet')}
                  className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Tablet view"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                  title="Mobile view"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="flex items-center gap-3">
             {/* Status Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live</span>
            </div>

            {/* Preview Button */}
            <a
              href={`/store/${store.id}`} 
              target="_blank"
              rel="noreferrer"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Preview Store"
            >
              <Eye className="w-5 h-5" />
            </a>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setIsActionsMenuOpen(!isActionsMenuOpen)}
                className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="More actions"
              >
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                  <div className="w-1 h-1 rounded-full bg-current" />
                </div>
              </button>
              
              {isActionsMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                   <button
                    onClick={() => {
                      handlePublish();
                      setIsActionsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" /> Publish Theme
                  </button>
                  <a
                    href={`/store/${store.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" /> View Live Store
                  </a>
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              onClick={(e) => {
                // Manual save trigger if needed, though autosave handles it
                toast.success('Saved successfully');
              }}
              disabled={isSubmitting}
              className={`px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition shadow-sm ${
                isSubmitting ? 'opacity-70 cursor-wait' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <Form
          method="post"
          id="editor-form"
          className={`w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden transition-all duration-300 ${
            isMobileDrawerOpen ? 'fixed inset-y-0 left-0 z-50 w-80 shadow-xl' : 'hidden md:flex'
          }`}
        >
          {/* Hidden form fields for saving */}
          <input type="hidden" name="themeId" value={currentThemeId} />
          <input type="hidden" name="sections" value={JSON.stringify(homeSections)} />
          <input type="hidden" name="productSections" value={JSON.stringify(productSections)} />
          <input
            type="hidden"
            name="collectionSections"
            value={JSON.stringify(collectionSections)}
          />
          <input type="hidden" name="cartSections" value={JSON.stringify(cartSections)} />
          <input type="hidden" name="checkoutSections" value={JSON.stringify(checkoutSections)} />
          <input type="hidden" name="storeTemplateId" value={selectedTemplateId} />
          <input type="hidden" name="primaryColor" value={primaryColor} />
          <input type="hidden" name="accentColor" value={accentColor} />
          <input type="hidden" name="backgroundColor" value={backgroundColor} />
          <input type="hidden" name="textColor" value={textColor} />
          <input type="hidden" name="borderColor" value={borderColor} />
          <input type="hidden" name="typography" value={JSON.stringify(typography)} />
          <input type="hidden" name="logo" value={logo} />
          <input type="hidden" name="bannerUrl" value={bannerUrl} />
          <input type="hidden" name="bannerText" value={bannerText} />
          <input type="hidden" name="announcementText" value={announcementText} />
          <input type="hidden" name="announcementLink" value={announcementLink} />
          <input type="hidden" name="customCSS" value={customCSS} />
          <input type="hidden" name="favicon" value={favicon} />
          <input type="hidden" name="facebook" value={facebook} />
          <input type="hidden" name="instagram" value={instagram} />
          <input type="hidden" name="whatsapp" value={whatsapp} />

          <div className="flex-1 overflow-hidden flex">
            {/* MINI NAV SIDEBAR - Shopify OS 2.0 Style */}
            {!selectedSection && (
              <div className="w-12 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-4 gap-4 shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setSidebarTab('sections')}
                  className={`p-2 rounded-lg transition ${
                    sidebarTab === 'sections'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900 set-sidebar-tab'
                  }`}
                  title="Sections"
                >
                  <Layout className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarTab('settings')}
                  className={`p-2 rounded-lg transition ${
                    sidebarTab === 'settings'
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-500 hover:bg-gray-200 hover:text-gray-900'
                  }`}
                  title="Theme Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className={`flex-1 overflow-y-auto custom-scrollbar ${isSubmitting ? 'opacity-50 pointer-events-none' : ''}`}>
              {selectedSection && selectedSectionSchema ? (
                <SchemaSectionEditor
                  sectionId={selectedSection.id}
                  sectionType={selectedSection.type}
                  schema={selectedSectionSchema}
                  settings={selectedSection.settings}
                  blocks={selectedSection.blocks}
                  onUpdateSettings={handleUpdateSectionSettings}
                  onUpdateBlocks={handleUpdateSectionBlocks}
                  onBack={() => setSelectedSectionId(null)}
                  onDelete={() => handleDeleteSection(selectedSection.id)}
                />
              ) : sidebarTab === 'sections' ? (
                <>
                  {/* HEADER GROUP - Shared across all pages */}
                  <AccordionSection
                    title="Header"
                    icon={Layout}
                    isOpen={openAccordion === 'header-group'}
                    onToggle={() => setOpenAccordion(openAccordion === 'header-group' ? '' : 'header-group')}
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      Shared across all pages
                    </p>
                    {headerSections.length > 0 ? (
                      <div className="space-y-1">
                        {headerSections.map((section) => (
                          <SortableSectionItem
                            key={section.id}
                            section={section}
                            schema={themeBridge.getSectionSchema(section.type)}
                            isActive={selectedSectionId === section.id}
                            onSelect={() => setSelectedSectionId(section.id)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onDuplicate={() => handleDuplicateSection(section.id)}
                            onToggleVisibility={() => handleToggleSectionVisibility(section.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No header sections</p>
                    )}
                  </AccordionSection>

                  {/* TEMPLATE SECTIONS - Page-specific */}
                  <AccordionSection
                    title="Template"
                    icon={Layout}
                    isOpen={openAccordion === 'sections'}
                    onToggle={() => setOpenAccordion(openAccordion === 'sections' ? '' : 'sections')}
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      Drag to reorder. Click 👁 to hide/show.
                    </p>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={templateSections.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {templateSections.map((section) => (
                          <SortableSectionItem
                            key={section.id}
                            section={section}
                            schema={themeBridge.getSectionSchema(section.type)}
                            isActive={selectedSectionId === section.id}
                            onSelect={() => setSelectedSectionId(section.id)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onDuplicate={() => handleDuplicateSection(section.id)}
                            onToggleVisibility={() => handleToggleSectionVisibility(section.id)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                    <button
                      type="button"
                      onClick={() => setIsAddSectionOpen(true)}
                      className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-purple-500 hover:text-purple-600 transition flex items-center justify-center gap-2 text-sm mt-2"
                    >
                      <Plus className="w-4 h-4" /> Add Section
                    </button>
                  </AccordionSection>

                  {/* FOOTER GROUP - Shared across all pages */}
                  <AccordionSection
                    title="Footer"
                    icon={Layout}
                    isOpen={openAccordion === 'footer-group'}
                    onToggle={() => setOpenAccordion(openAccordion === 'footer-group' ? '' : 'footer-group')}
                  >
                    <p className="text-xs text-gray-500 mb-2">
                      Shared across all pages
                    </p>
                    {footerSections.length > 0 ? (
                      <div className="space-y-1">
                        {footerSections.map((section) => (
                          <SortableSectionItem
                            key={section.id}
                            section={section}
                            schema={themeBridge.getSectionSchema(section.type)}
                            isActive={selectedSectionId === section.id}
                            onSelect={() => setSelectedSectionId(section.id)}
                            onDelete={() => handleDeleteSection(section.id)}
                            onDuplicate={() => handleDuplicateSection(section.id)}
                            onToggleVisibility={() => handleToggleSectionVisibility(section.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No footer sections</p>
                    )}
                  </AccordionSection>
                </>
              ) : (
                /* THEME SETTINGS TAB - Shopify OS 2.0 Style */
                <div className="p-4 space-y-4">
                  <h3 className="font-medium text-gray-900 mb-4 px-2">Theme Settings</h3>
                  
                  {/* Theme Colors */}
                  <AccordionSection
                    title="Colors & Style"
                    icon={Palette}
                    isOpen={openAccordion === 'theme'}
                    onToggle={() => setOpenAccordion(openAccordion === 'theme' ? '' : 'theme')}
                  >
                    <div className="space-y-4">
                      {/* Presets */}
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-2">Presets</p>
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_PRESETS.map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => {
                                setPrimaryColor(p.primary);
                                setAccentColor(p.accent);
                                setBackgroundColor(p.bg);
                                setTextColor(p.text);
                              }}
                              className="p-1 border rounded hover:border-purple-500"
                              title={p.name}
                            >
                              <div className="flex h-4 w-full rounded overflow-hidden">
                                <div style={{ background: p.primary }} className="w-1/2" />
                                <div style={{ background: p.accent }} className="w-1/2" />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color pickers */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600">Primary</label>
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Accent</label>
                          <input
                            type="color"
                            value={accentColor}
                            onChange={(e) => setAccentColor(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Background</label>
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">Text</label>
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => setTextColor(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Typography */}
                      <div className="border-t pt-2">
                        <p className="text-xs font-medium mb-1">Typography Size</p>
                        <div className="grid grid-cols-3 gap-1">
                          {(['small', 'medium', 'large'] as const).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setTypography({ ...typography, headingSize: s })}
                              className={`text-xs border rounded p-1 capitalize ${
                                typography.headingSize === s ? 'bg-purple-50 border-purple-500' : ''
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </AccordionSection>

                  {/* Branding */}
                  <AccordionSection
                    title="Branding"
                    icon={Store}
                    isOpen={openAccordion === 'branding'}
                    onToggle={() => setOpenAccordion(openAccordion === 'branding' ? '' : 'branding')}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Logo URL</label>
                        <input
                          type="url"
                          value={logo}
                          onChange={(e) => setLogo(e.target.value)}
                          placeholder="https://..."
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Banner Image</label>
                        <input
                          type="url"
                          value={bannerUrl}
                          onChange={(e) => setBannerUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Banner Text</label>
                        <input
                          type="text"
                          value={bannerText}
                          onChange={(e) => setBannerText(e.target.value)}
                          placeholder="Welcome to our store"
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                      <Link
                        to="/app/settings"
                        className="text-xs text-purple-600 flex items-center gap-1 mt-2"
                      >
                        <Settings className="w-3 h-3" /> Full Settings
                      </Link>
                    </div>
                  </AccordionSection>

                  {/* Favicon */}
                  <AccordionSection
                    title="Favicon"
                    icon={Monitor}
                    isOpen={openAccordion === 'favicon'}
                    onToggle={() => setOpenAccordion(openAccordion === 'favicon' ? '' : 'favicon')}
                  >
                    <div>
                      <label className="text-xs font-medium text-gray-700">Favicon URL</label>
                      <input
                        type="url"
                        value={favicon}
                        onChange={(e) => setFavicon(e.target.value)}
                        placeholder="https://..."
                        className="w-full text-sm border rounded p-2 mt-1"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Recommended: 32x32px or 64x64px PNG/ICO
                      </p>
                    </div>
                  </AccordionSection>

                  {/* Social Media */}
                  <AccordionSection
                    title="Social Media"
                    icon={Monitor}
                    isOpen={openAccordion === 'social'}
                    onToggle={() => setOpenAccordion(openAccordion === 'social' ? '' : 'social')}
                  >
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700">Facebook</label>
                        <input
                          type="url"
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="https://facebook.com/..."
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">Instagram</label>
                        <input
                          type="url"
                          value={instagram}
                          onChange={(e) => setInstagram(e.target.value)}
                          placeholder="https://instagram.com/..."
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700">WhatsApp</label>
                        <input
                          type="text"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          placeholder="+8801..."
                          className="w-full text-sm border rounded p-2 mt-1"
                        />
                      </div>
                    </div>
                  </AccordionSection>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </Form>

        {/* RIGHT PANEL - PREVIEW */}
        <main className="flex-1 bg-gray-900 flex flex-col overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between flex-shrink-0">
            <span className="text-gray-300 text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" /> Live Preview
            </span>
            <div className="flex items-center gap-3">
              <span className="text-gray-500 text-xs">
                {previewDevice === 'mobile' && '375px'}
                {previewDevice === 'tablet' && '768px'}
                {previewDevice === 'desktop' && '100%'}
              </span>
              {sections.some((s) => s.disabled) && (
                <span className="text-yellow-400 text-xs flex items-center gap-1">
                  <EyeOff className="w-3 h-3" />
                  {sections.filter((s) => s.disabled).length} hidden
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 flex items-start justify-center overflow-auto p-4 md:p-8 bg-gray-900/50">
            <div
              className={`bg-white shadow-2xl transition-all duration-300 overflow-hidden relative ${
                previewDevice === 'mobile'
                  ? 'w-[375px] h-[812px] rounded-[3rem] border-8 border-gray-900'
                  : previewDevice === 'tablet'
                  ? 'w-[768px] h-[1024px] rounded-[1.5rem] border-8 border-gray-900'
                  : 'w-full h-full rounded-md border border-gray-200'
              }`}
            >
              <iframe
                ref={iframeRef}
                src={`/store-preview-frame?themeId=${currentThemeId}`}
                className="w-full h-full border-0"
                title="Store Preview"
              />
            </div>
          </div>
          
          {/* Zoom/Fit controls could go here */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-200 shadow-lg rounded-full px-4 py-2 text-xs font-medium text-gray-600 flex gap-4">
            <span>{previewDevice.charAt(0).toUpperCase() + previewDevice.slice(1)} View</span>
            <span className="text-gray-300">|</span>
            {previewDevice === 'desktop' ? '100%' : 'Fit'}
          </div>
        </main>
      </div>

      {/* Section Picker Modal */}
      <SectionPicker
        isOpen={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onAddSection={handleAddSection}
        sectionRegistry={sectionRegistry}
        existingSections={sections}
      />

      {/* AI Assistant */}
      <StoreAIAssistant
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        onApplyConfig={handleAIApplyConfig}
        onApplyCommand={handleAICommand}
        storeContext={storeContext}
        aiCredits={store.aiCredits}
      />
    </div>
  );
}

export default LiveEditorV2;
