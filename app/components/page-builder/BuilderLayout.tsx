/**
 * Page Builder v2 - Main Layout Component
 * 
 * Contains:
 * - Sidebar with section list (drag & drop)
 * - Properties panel
 * - Preview area
 * - Add section modal
 */

import { useState, useCallback, useEffect, useRef } from 'react';
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
} from '@dnd-kit/sortable';
import {
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Trash2,
  Copy,
  Settings,
  Smartphone,
  Monitor,
  Tablet,
  Save,
  Loader2,
  ArrowLeft,
  Globe,
  Undo2,
  Redo2,
  Settings2,
} from 'lucide-react';
import { Link } from '@remix-run/react';
import type { BuilderSection, SectionMeta, SectionType } from '~/lib/page-builder/types';
import { SortableItem } from './SortableItem';
import { PropertiesPanel } from './PropertiesPanel';
import { SectionRenderer } from './SectionRenderer';
import { AddSectionModal } from './AddSectionModal';
import { NewPageModal } from './NewPageModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { FloatingButtonSettingsPanel } from './FloatingButtonSettingsPanel';
import { getSectionMeta } from '~/lib/page-builder/registry';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  bundlePricing?: Array<{ qty: number; price: number; label: string; savings?: number }>;
}

interface BuilderLayoutProps {
  page: {
    id: string;
    slug: string;
    title: string | null;
    status: 'draft' | 'published';
    // Floating button settings
    whatsappEnabled?: number | null;
    whatsappNumber?: string | null;
    whatsappMessage?: string | null;
    callEnabled?: number | null;
    callNumber?: string | null;
    // Order button settings
    orderEnabled?: number | null;
    orderText?: string | null;
    orderBgColor?: string | null;
    orderTextColor?: string | null;
    buttonPosition?: string | null;
  } | null;
  sections: BuilderSection[];
  activeSectionId: string | null;
  isNew: boolean;
  isSaving: boolean;
  lastSaved?: Date | null;
  onSelectSection: (id: string | null) => void;
  onReorder: (orderedIds: string[]) => void;
  onToggle: (sectionId: string, enabled: boolean) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateProps: (sectionId: string, type: string, props: Record<string, unknown>, version: number) => void;
  onDuplicate: (sectionId: string) => void;
  onCreatePage: (slug: string, title: string) => void;
  onPublish?: () => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  availableSections: SectionMeta[];
  products?: Product[];
  // Undo/Redo
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  // Settings save
  onSaveSettings?: (settings: Record<string, unknown>) => void;
}

export function BuilderLayout({
  page,
  sections,
  activeSectionId,
  isNew,
  isSaving,
  onSelectSection,
  onReorder,
  onToggle,
  onAddSection,
  onDeleteSection,
  onUpdateProps,
  onDuplicate,
  onCreatePage,
  onPublish,
  showAddModal,
  setShowAddModal,
  availableSections,
  products = [],
  lastSaved,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onSaveSettings,
}: BuilderLayoutProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Send sections data directly to preview iframe for instant updates
  // This avoids DB revalidation delays and caching issues
  const notifyPreview = useCallback((sectionsData: BuilderSection[]) => {
    if (iframeRef.current?.contentWindow) {
      const enabledSections = sectionsData.filter(s => s.enabled);
      iframeRef.current.contentWindow.postMessage({ 
        type: 'BUILDER_UPDATE',
        sections: enabledSections 
      }, '*');
    }
  }, []);
  
  // Send live preview on every sections change (instant real-time sync)
  useEffect(() => {
    // Small delay to batch rapid changes
    const timer = setTimeout(() => {
      notifyPreview(sections);
    }, 50);
    return () => clearTimeout(timer);
  }, [sections, notifyPreview]);
  
  const [showNewPageModal, setShowNewPageModal] = useState(isNew);
  
  // Delete confirmation state
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteSection = pendingDeleteId 
    ? sections.find(s => s.id === pendingDeleteId) 
    : null;
  
  // Floating button settings state - initialize from page data
  const [showFloatingSettings, setShowFloatingSettings] = useState(false);
  const [floatingSettings, setFloatingSettings] = useState(() => ({
    whatsappEnabled: page?.whatsappEnabled === 1,
    whatsappNumber: page?.whatsappNumber || '',
    whatsappMessage: page?.whatsappMessage || 'হ্যালো! আমি অর্ডার করতে চাই।',
    callEnabled: page?.callEnabled === 1,
    callNumber: page?.callNumber || '',
    orderEnabled: page?.orderEnabled === 1 || page?.orderEnabled === undefined,
    orderText: page?.orderText || 'অর্ডার করুন',
    orderBgColor: page?.orderBgColor || '#6366F1',
    orderTextColor: page?.orderTextColor || '#FFFFFF',
    position: (page?.buttonPosition || 'bottom-right') as 'bottom-right' | 'bottom-left' | 'bottom-center',
  }));
  
  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );
  
  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      const newOrder = arrayMove(sections, oldIndex, newIndex);
      onReorder(newOrder.map(s => s.id));
    }
  }, [sections, onReorder]);
  
  // Active section
  const activeSection = sections.find(s => s.id === activeSectionId);
  
  // Preview width based on device
  const previewStyles: Record<string, React.CSSProperties> = {
    desktop: { 
      width: '100%',
      maxWidth: '100%',
      height: '100%',
    },
    tablet: { 
      width: '768px',
      maxWidth: '768px',
      height: '100%',
    },
    mobile: { 
      width: '414px',  // iPhone Plus size for better content visibility
      maxWidth: '414px',
      height: '896px', // iPhone Plus height
      borderRadius: '2.5rem',
      border: '8px solid #1f2937',
      boxShadow: '0 0 0 3px #374151, 0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    },
  };
  
  // Hydration fix: only render DnD on client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // New page modal
  if (isNew && showNewPageModal) {
    return (
      <NewPageModal
        onClose={() => window.history.back()}
        onCreate={onCreatePage}
      />
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Link 
              to="/app/new-builder" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            {isSaving ? (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <Save size={12} />
                Saved
              </span>
            ) : null}
          </div>
          <h2 className="font-semibold text-gray-900 truncate">
            {page?.title || page?.slug || 'New Page'}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              page?.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {page?.status === 'published' ? 'Published' : 'Draft'}
            </span>
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
                items={sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {sections.map((section) => (
                    <SortableItem
                      key={section.id}
                      section={section}
                      isActive={activeSectionId === section.id}
                      onSelect={() => onSelectSection(section.id)}
                      onToggle={(enabled: boolean) => onToggle(section.id, enabled)}
                      onDelete={() => setPendingDeleteId(section.id)}
                      onDuplicate={() => onDuplicate(section.id)}
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
              onUpdate={(props: Record<string, unknown>) => 
                onUpdateProps(activeSection.id, activeSection.type, props, activeSection.version)
              }
              onClose={() => onSelectSection(null)}
              products={products}
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
                previewDevice === 'desktop' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Desktop"
            >
              <Monitor size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('tablet')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'tablet' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Tablet"
            >
              <Tablet size={18} />
            </button>
            <button
              onClick={() => setPreviewDevice('mobile')}
              className={`p-2 rounded-lg transition-colors ${
                previewDevice === 'mobile' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              }`}
              title="Mobile"
            >
              <Smartphone size={18} />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Undo/Redo */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-2 rounded-lg transition-colors ${
                canUndo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 size={18} />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-2 rounded-lg transition-colors ${
                canRedo ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-300 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo2 size={18} />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-1" />
            
            {/* Floating Button Settings */}
            <button
              onClick={() => setShowFloatingSettings(true)}
              className="p-2 rounded-lg transition-colors text-gray-600 hover:bg-gray-100"
              title="Floating Button Settings"
            >
              <Settings2 size={18} />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {page && (
              <a
                href={`/preview/${page.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Globe size={16} />
                Preview
              </a>
            )}
            <button
              onClick={onPublish}
              disabled={isSaving || page?.status === 'published'}
              className={`flex items-center gap-1 px-4 py-1.5 text-sm rounded-lg transition-colors ${
                page?.status === 'published'
                  ? 'bg-green-100 text-green-700 cursor-default'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {page?.status === 'published' ? (
                <>
                  <Eye size={16} />
                  Published
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
          {page ? (
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
              
              {/* Iframe for true viewport */}
              <iframe
                ref={iframeRef}
                key={`preview-${previewDevice}`}
                src={`/builder-preview/${page.id}`}
                className="w-full h-full border-0"
                style={{
                  paddingTop: previewDevice === 'mobile' ? '2rem' : 0,
                }}
                title="Page Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Create a page to see preview</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Section Modal */}
      {showAddModal && (
        <AddSectionModal
          sections={availableSections}
          onSelect={onAddSection}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={pendingDeleteId !== null}
        sectionName={pendingDeleteSection ? (getSectionMeta(pendingDeleteSection.type)?.name || pendingDeleteSection.type) : ''}
        onConfirm={() => {
          if (pendingDeleteId) {
            onDeleteSection(pendingDeleteId);
            setPendingDeleteId(null);
          }
        }}
        onCancel={() => setPendingDeleteId(null)}
      />
      
      {/* Floating Button Settings Modal */}
      <FloatingButtonSettingsPanel
        isOpen={showFloatingSettings}
        onClose={() => setShowFloatingSettings(false)}
        settings={floatingSettings}
        onSave={(newSettings) => {
          setFloatingSettings(newSettings);
          // Send to preview iframe
          if (iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: 'SETTINGS_UPDATE',
              settings: newSettings,
            }, '*');
          }
          // Persist to database - include all settings
          onSaveSettings?.({
            whatsappEnabled: newSettings.whatsappEnabled,
            whatsappNumber: newSettings.whatsappNumber,
            whatsappMessage: newSettings.whatsappMessage,
            callEnabled: newSettings.callEnabled,
            callNumber: newSettings.callNumber,
            orderEnabled: newSettings.orderEnabled,
            orderText: newSettings.orderText,
            orderBgColor: newSettings.orderBgColor,
            orderTextColor: newSettings.orderTextColor,
            buttonPosition: newSettings.position,
          });
        }}
      />
    </div>
  );
}
