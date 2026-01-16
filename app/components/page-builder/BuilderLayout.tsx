/**
 * Page Builder v2 - Main Layout Component
 * 
 * Contains:
 * - Sidebar with section list (drag & drop)
 * - Properties panel
 * - Preview area
 * - Add section modal
 */

import { useState, useCallback, useEffect } from 'react';
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
} from 'lucide-react';
import { Link } from '@remix-run/react';
import type { BuilderSection, SectionMeta, SectionType } from '~/lib/page-builder/types';
import { SortableItem } from './SortableItem';
import { PropertiesPanel } from './PropertiesPanel';
import { SectionRenderer } from './SectionRenderer';
import { AddSectionModal } from './AddSectionModal';
import { NewPageModal } from './NewPageModal';

interface BuilderLayoutProps {
  page: {
    id: string;
    slug: string;
    title: string | null;
    status: 'draft' | 'published';
  } | null;
  sections: BuilderSection[];
  activeSectionId: string | null;
  isNew: boolean;
  isSaving: boolean;
  onSelectSection: (id: string | null) => void;
  onReorder: (orderedIds: string[]) => void;
  onToggle: (sectionId: string, enabled: boolean) => void;
  onAddSection: (type: SectionType) => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateProps: (sectionId: string, type: string, props: Record<string, unknown>, version: number) => void;
  onDuplicate: (sectionId: string) => void;
  onCreatePage: (slug: string, title: string) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  availableSections: SectionMeta[];
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
  showAddModal,
  setShowAddModal,
  availableSections,
}: BuilderLayoutProps) {
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showNewPageModal, setShowNewPageModal] = useState(isNew);
  
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
      width: '375px',
      maxWidth: '375px',
      height: '812px', // iPhone X height
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
              to="/app/campaigns" 
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            {isSaving && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Loader2 size={12} className="animate-spin" />
                Saving...
              </span>
            )}
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
                      onToggle={(enabled) => onToggle(section.id, enabled)}
                      onDelete={() => onDeleteSection(section.id)}
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
              onUpdate={(props) => 
                onUpdateProps(activeSection.id, activeSection.type, props, activeSection.version)
              }
              onClose={() => onSelectSection(null)}
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
              className="flex items-center gap-1 px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Save size={16} />
              Publish
            </button>
          </div>
        </div>
        
        {/* Preview Frame */}
        <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center items-start">
          <div
            className={`bg-white shadow-lg transition-all duration-300 overflow-y-auto ${
              previewDevice === 'mobile' ? 'overflow-hidden' : ''
            }`}
            style={previewStyles[previewDevice]}
          >
            {previewDevice === 'mobile' && (
              <div className="h-8 bg-gray-900 flex items-center justify-center">
                <div className="w-20 h-1.5 bg-gray-700 rounded-full" />
              </div>
            )}
            <div className={previewDevice === 'mobile' ? 'h-[calc(100%-2rem)] overflow-y-auto' : ''}>
              <SectionRenderer
                sections={sections.filter(s => s.enabled)}
                activeSectionId={activeSectionId}
                onSelectSection={onSelectSection}
              />
            </div>
          </div>
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
    </div>
  );
}
