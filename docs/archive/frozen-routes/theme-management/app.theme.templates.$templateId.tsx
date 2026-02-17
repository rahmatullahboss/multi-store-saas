/**
 * Template Builder Route
 *
 * /app/theme/templates/:templateId
 * MVP_FROZEN_ARCHIVE_CANDIDATE: 2026-02-17
 *
 * ⚠️ DEPRECATED - This route is frozen for MVP.
 * All theme management should use: /app/store-settings
 *
 * Visual editor for customizing page templates (home, product, collection, cart, checkout).
 * Similar to the page builder but works with the theme template system.
 *
 * @see docs/MVP_DUAL_SYSTEM_ARCHIVE_UNIFY_CHECKLIST_2026-02-16.md
 */

import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { useLoaderData, useFetcher, useNavigate, Link } from '@remix-run/react';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { getStoreId } from '~/services/auth.server';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { products, themes, themeTemplates, themeSettingsDraft, stores } from '@db/schema';
import {
  getTemplateWithSections,
  addTemplateSection,
  toggleTemplateSection,
  updateTemplateSectionProps,
  deleteTemplateSection,
  reorderTemplateSections,
  duplicateTemplateSection,
  publishTemplate,
  initializeTemplateWithDefaults,
  type TemplateSection,
} from '~/lib/template-builder/actions.server';
import {
  isValidSectionType,
  getSectionMeta,
  AVAILABLE_SECTIONS,
} from '~/lib/page-builder/registry';
import type { SectionType } from '~/lib/page-builder/types';
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
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Copy,
  Monitor,
  Tablet,
  Smartphone,
  Loader2,
  ArrowLeft,
  Globe,
  Undo2,
  Redo2,
  Layout,
  ShoppingBag,
  Grid3X3,
  ShoppingCart,
  CreditCard,
  FileText,
  X,
  Check,
} from 'lucide-react';
import { useEditorHistory, useEditorKeyboardShortcuts } from '~/hooks/useEditorHistory';

// ============================================================================
// TYPES
// ============================================================================

interface ActionData {
  success: boolean;
  error?: string;
  section?: TemplateSection;
  newVersion?: number;
}

// Template key icons
const TEMPLATE_ICONS: Record<string, typeof Layout> = {
  home: Layout,
  product: ShoppingBag,
  collection: Grid3X3,
  cart: ShoppingCart,
  checkout: CreditCard,
  page: FileText,
};

// ============================================================================
// LOADER
// ============================================================================

export async function loader({ request, params, context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  const templateId = params.templateId;

  if (!templateId) {
    throw new Response('Template ID required', { status: 400 });
  }

  if (!storeId) {
    throw new Response('Store not found', { status: 404 });
  }

  const db = context.cloudflare.env.DB;
  const drizzleDb = drizzle(db);

  // Get store info
  const [store] = await drizzleDb.select().from(stores).where(eq(stores.id, storeId)).limit(1);

  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }

  // Get template with sections
  const template = await getTemplateWithSections(db, templateId, store.id);

  if (!template) {
    throw new Response('Template not found', { status: 404 });
  }

  // Initialize with default sections if empty
  if (template.sections.length === 0) {
    const defaultSections = await initializeTemplateWithDefaults(
      db,
      templateId,
      store.id,
      template.templateKey
    );
    template.sections = defaultSections;
  }

  // Get theme info
  const [theme] = await drizzleDb.select().from(themes).where(eq(themes.id, template.themeId));

  // Get theme settings
  const [settingsRow] = await drizzleDb
    .select()
    .from(themeSettingsDraft)
    .where(eq(themeSettingsDraft.themeId, template.themeId));

  let themeSettings = null;
  try {
    themeSettings = settingsRow?.settingsJson ? JSON.parse(settingsRow.settingsJson) : null;
  } catch {
    themeSettings = null;
  }

  // Load products for product selector (for product-related sections)
  const rawProducts = await drizzleDb
    .select({
      id: products.id,
      title: products.title,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.storeId, store.id));

  const storeProducts = rawProducts.map((p) => ({
    id: p.id,
    name: p.title,
    price: p.price,
    imageUrl: p.imageUrl,
  }));

  return json({
    template,
    sections: template.sections,
    theme,
    themeSettings,
    store: {
      id: store.id,
      name: store.name,
      subdomain: store.subdomain,
    },
    products: storeProducts,
  });
}

// ============================================================================
// ACTION
// ============================================================================

export async function action({ request, params, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  const db = context.cloudflare.env.DB;
  const formData = await request.formData();
  const intent = formData.get('intent') as string;
  const templateId = params.templateId as string;

  if (!storeId) {
    return json({ success: false, error: 'Store not found' }, { status: 404 });
  }

  try {
    switch (intent) {
      // Add section
      case 'add-section': {
        const type = formData.get('type') as string;

        if (!isValidSectionType(type)) {
          return json({ success: false, error: 'Invalid section type' }, { status: 400 });
        }

        const result = await addTemplateSection(db, templateId, storeId, type);

        if ('error' in result) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, section: result });
      }

      // Toggle section visibility
      case 'toggle-section': {
        const sectionId = formData.get('sectionId') as string;
        const enabled = formData.get('enabled') === 'true';

        await toggleTemplateSection(db, sectionId, enabled);
        return json({ success: true });
      }

      // Update section props
      case 'update-props': {
        const sectionId = formData.get('sectionId') as string;
        const type = formData.get('type') as string;
        const propsJson = formData.get('props') as string;
        const version = formData.get('version');

        let props: unknown;
        try {
          props = JSON.parse(propsJson);
        } catch {
          return json({ success: false, error: 'Invalid props JSON' }, { status: 400 });
        }

        const result = await updateTemplateSectionProps(
          db,
          sectionId,
          type,
          props,
          version ? Number(version) : undefined
        );

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, newVersion: result.newVersion });
      }

      // Delete section
      case 'delete-section': {
        const sectionId = formData.get('sectionId') as string;
        await deleteTemplateSection(db, sectionId);
        return json({ success: true });
      }

      // Reorder sections
      case 'reorder-sections': {
        const orderedIdsJson = formData.get('orderedIds') as string;

        let orderedIds: string[];
        try {
          orderedIds = JSON.parse(orderedIdsJson);
        } catch {
          return json({ success: false, error: 'Invalid orderedIds' }, { status: 400 });
        }

        const result = await reorderTemplateSections(db, templateId, orderedIds);

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true });
      }

      // Duplicate section
      case 'duplicate-section': {
        const sectionId = formData.get('sectionId') as string;
        const result = await duplicateTemplateSection(db, sectionId);

        if ('error' in result) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true, section: result });
      }

      // Publish template
      case 'publish': {
        const result = await publishTemplate(db, templateId, storeId);

        if (!result.success) {
          return json({ success: false, error: result.error }, { status: 400 });
        }

        return json({ success: true });
      }

      default:
        return json({ success: false, error: 'Unknown intent' }, { status: 400 });
    }
  } catch (error) {
    console.error('Template builder action error:', error);
    return json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// SORTABLE SECTION ITEM
// ============================================================================

interface SortableItemProps {
  section: TemplateSection;
  isActive: boolean;
  onSelect: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableSectionItem({
  section,
  isActive,
  onSelect,
  onToggle,
  onDelete,
  onDuplicate,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const meta = getSectionMeta(section.type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 p-3 rounded-lg border transition-all cursor-pointer
        ${
          isActive
            ? 'border-indigo-500 bg-indigo-50 shadow-sm'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
        }
        ${!section.enabled ? 'opacity-50' : ''}
      `}
      onClick={onSelect}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical size={16} />
      </button>

      {/* Section Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{meta?.name || section.type}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!section.enabled);
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
          title={section.enabled ? 'Hide' : 'Show'}
        >
          {section.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1.5 text-gray-400 hover:text-gray-600 rounded"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 text-gray-400 hover:text-red-600 rounded"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// ADD SECTION MODAL
// ============================================================================

interface AddSectionModalProps {
  templateKey: string;
  onSelect: (type: SectionType) => void;
  onClose: () => void;
}

function AddSectionModal({ templateKey, onSelect, onClose }: AddSectionModalProps) {
  // Filter sections based on template type
  const allowedSections = AVAILABLE_SECTIONS.filter((section) => {
    if (!section.allowedPages) return true;
    return section.allowedPages.includes(templateKey as any);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add Section</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 gap-3">
            {allowedSections.map((section) => (
              <button
                key={section.type}
                onClick={() => onSelect(section.type)}
                className="flex items-start gap-3 p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Layout className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{section.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                </div>
              </button>
            ))}
          </div>

          {allowedSections.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No sections available for this template type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PROPERTIES PANEL
// ============================================================================

interface PropertiesPanelProps {
  section: TemplateSection;
  onUpdate: (props: Record<string, unknown>) => void;
  onClose: () => void;
}

function PropertiesPanel({ section, onUpdate, onClose }: PropertiesPanelProps) {
  const meta = getSectionMeta(section.type);
  const [localProps, setLocalProps] = useState(section.props);

  // Reset when section changes
  useEffect(() => {
    setLocalProps(section.props);
  }, [section.id, section.props]);

  // Debounced save
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = (key: string, value: unknown) => {
    const newProps = { ...localProps, [key]: value };
    setLocalProps(newProps);

    // Debounce save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(newProps);
    }, 500);
  };

  // Common field renderer
  const renderField = (key: string, value: unknown) => {
    if (typeof value === 'string') {
      // Multi-line for text/description fields
      if (key.toLowerCase().includes('text') || key.toLowerCase().includes('description')) {
        return (
          <textarea
            value={value}
            onChange={(e) => handleChange(key, e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        );
      }
      // Color picker
      if (key.toLowerCase().includes('color')) {
        return (
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-8 h-8 rounded border cursor-pointer"
            />
            <input
              type="text"
              value={value}
              onChange={(e) => handleChange(key, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
        );
      }
      // Default text input
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => handleChange(key, e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );
    }

    if (typeof value === 'number') {
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(key, Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      );
    }

    if (typeof value === 'boolean') {
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(key, e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-600">Enabled</span>
        </label>
      );
    }

    // For objects/arrays, show JSON editor
    return (
      <textarea
        value={JSON.stringify(value, null, 2)}
        onChange={(e) => {
          try {
            handleChange(key, JSON.parse(e.target.value));
          } catch {
            // Invalid JSON, don't update
          }
        }}
        rows={4}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    );
  };

  // Format key to label
  const formatLabel = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">{meta?.name || section.type}</h4>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {Object.entries(localProps).map(([key, value]) => {
          // Skip internal/complex fields
          if (key.startsWith('_') || key === 'bindings') return null;

          return (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {formatLabel(key)}
              </label>
              {renderField(key, value)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function TemplateBuilderPage() {
  const {
    template,
    sections: initialSections,
    theme,
    themeSettings,
    store,
    products,
  } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<ActionData>();
  const navigate = useNavigate();

  // Undo/redo history for sections
  const {
    state: sections,
    setState: setSections,
    pushHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useEditorHistory<TemplateSection[]>(initialSections as TemplateSection[], {
    maxHistory: 30,
  });

  // Enable keyboard shortcuts for undo/redo
  useEditorKeyboardShortcuts(undo, redo, canUndo, canRedo);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Track when saves complete
  const wasSubmittingRef = useRef(fetcher.state !== 'idle');
  useEffect(() => {
    const isSubmitting = fetcher.state !== 'idle';
    if (wasSubmittingRef.current && !isSubmitting && fetcher.data?.success) {
      setLastSaved(new Date());
    }
    wasSubmittingRef.current = isSubmitting;
  }, [fetcher.state, fetcher.data]);

  // Get active section
  const activeSection = useMemo(
    () => sections.find((s) => s.id === activeSectionId) || null,
    [sections, activeSectionId]
  );

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  // Handle drag end
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        pushHistory();
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);
        const newOrder = arrayMove(sections, oldIndex, newIndex);
        setSections(newOrder);

        // Submit to server
        fetcher.submit(
          { intent: 'reorder-sections', orderedIds: JSON.stringify(newOrder.map((s) => s.id)) },
          { method: 'post' }
        );
      }
    },
    [sections, fetcher, pushHistory]
  );

  // Handle toggle
  const handleToggle = useCallback(
    (sectionId: string, enabled: boolean) => {
      pushHistory();
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, enabled } : s)));

      fetcher.submit(
        { intent: 'toggle-section', sectionId, enabled: String(enabled) },
        { method: 'post' }
      );
    },
    [fetcher, pushHistory]
  );

  // Handle add section
  const handleAddSection = useCallback(
    (type: SectionType) => {
      fetcher.submit({ intent: 'add-section', type }, { method: 'post' });
      setShowAddModal(false);
    },
    [fetcher]
  );

  // Handle delete section
  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      pushHistory();
      setSections((prev) => prev.filter((s) => s.id !== sectionId));

      fetcher.submit({ intent: 'delete-section', sectionId }, { method: 'post' });

      if (activeSectionId === sectionId) {
        setActiveSectionId(null);
      }
      setPendingDeleteId(null);
    },
    [fetcher, activeSectionId, pushHistory]
  );

  // Handle update props
  const handleUpdateProps = useCallback(
    (sectionId: string, type: string, props: Record<string, unknown>, version: number) => {
      pushHistory();
      setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, props } : s)));

      fetcher.submit(
        {
          intent: 'update-props',
          sectionId,
          type,
          props: JSON.stringify(props),
          version: String(version),
        },
        { method: 'post' }
      );
    },
    [fetcher, pushHistory]
  );

  // Handle duplicate
  const handleDuplicate = useCallback(
    (sectionId: string) => {
      fetcher.submit({ intent: 'duplicate-section', sectionId }, { method: 'post' });
    },
    [fetcher]
  );

  // Handle publish
  const handlePublish = useCallback(() => {
    fetcher.submit({ intent: 'publish' }, { method: 'post' });
  }, [fetcher]);

  // Update sections when fetcher returns new data
  useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.section) {
      const newSection = fetcher.data.section as TemplateSection;
      if (!sections.find((s) => s.id === newSection.id)) {
        setSections((prev) => [...prev, newSection]);
      }
    }
  }, [fetcher.data]);

  // Send sections to preview iframe
  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      const enabledSections = sections.filter((s) => s.enabled);
      iframeRef.current.contentWindow.postMessage(
        {
          type: 'TEMPLATE_UPDATE',
          sections: enabledSections,
          themeSettings,
        },
        '*'
      );
    }
  }, [sections, themeSettings]);

  // Hydration fix
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const TemplateIcon = TEMPLATE_ICONS[template.templateKey] || Layout;

  // Preview width based on device
  const previewStyles: Record<string, React.CSSProperties> = {
    desktop: { width: '100%', maxWidth: '100%', height: '100%' },
    tablet: { width: '768px', maxWidth: '768px', height: '100%' },
    mobile: {
      width: '414px',
      maxWidth: '414px',
      height: '896px',
      borderRadius: '2.5rem',
      border: '8px solid #1f2937',
      boxShadow: '0 0 0 3px #374151, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/app/theme"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
              Back to Theme
            </Link>
            {fetcher.state !== 'idle' ? (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Check size={12} />
                Saved
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <TemplateIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {template.title ||
                  template.templateKey.charAt(0).toUpperCase() + template.templateKey.slice(1)}{' '}
                Template
              </h2>
              <p className="text-xs text-gray-500">{theme?.name || 'Default Theme'}</p>
            </div>
          </div>
        </div>

        {/* Sections List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">Sections</h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Add Section"
            >
              <Plus size={18} />
            </button>
          </div>

          {isMounted ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section) => (
                    <SortableSectionItem
                      key={section.id}
                      section={section}
                      isActive={activeSectionId === section.id}
                      onSelect={() => setActiveSectionId(section.id)}
                      onToggle={(enabled) => handleToggle(section.id, enabled)}
                      onDelete={() => setPendingDeleteId(section.id)}
                      onDuplicate={() => handleDuplicate(section.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.id} className="p-2 border border-gray-200 rounded-lg bg-white">
                  <span className="text-sm text-gray-600">{section.type}</span>
                </div>
              ))}
            </div>
          )}

          {sections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No sections yet</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-indigo-600 text-sm hover:underline"
              >
                Add your first section
              </button>
            </div>
          )}
        </div>

        {/* Properties Panel */}
        {activeSection && (
          <div className="border-t border-gray-200 max-h-[40vh] overflow-y-auto">
            <PropertiesPanel
              section={activeSection}
              onUpdate={(props) =>
                handleUpdateProps(
                  activeSection.id,
                  activeSection.type,
                  props,
                  activeSection.version
                )
              }
              onClose={() => setActiveSectionId(null)}
            />
          </div>
        )}
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex flex-col">
        {/* Preview Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewDevice('desktop')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'desktop'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Desktop"
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'tablet'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Tablet"
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'mobile'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Mobile"
            >
              <Smartphone size={18} />
            </button>

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Undo/Redo */}
            <button
              onClick={undo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePublish}
              disabled={fetcher.state !== 'idle'}
              className="flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg transition-colors bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {fetcher.state !== 'idle' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Globe size={16} />
                  Publish
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Frame */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center items-start">
          <div
            className={`bg-white shadow-lg transition-all duration-300 relative ${
              previewDevice === 'mobile' ? 'overflow-hidden' : ''
            }`}
            style={previewStyles[previewDevice]}
          >
            {/* Mobile notch */}
            {previewDevice === 'mobile' && (
              <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 flex items-center justify-center z-10 rounded-t-[2rem]">
                <div className="w-20 h-1.5 bg-gray-700 rounded-full" />
              </div>
            )}

            {/* Preview Iframe */}
            <iframe
              ref={iframeRef}
              src={`/template-preview/${template.id}`}
              className="w-full h-full border-0"
              title="Template Preview"
            />
          </div>
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          templateKey={template.templateKey}
          onSelect={handleAddSection}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Section?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. Are you sure you want to delete this section?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteSection(pendingDeleteId)}
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
