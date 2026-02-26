/**
 * SectionList — dnd-kit sortable left panel section list
 *
 * Shows all sections with drag handles, name badges, hover actions.
 */

import { useCallback, useState } from 'react';
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
import { Plus, Pencil, Copy, Trash2, Eye, EyeOff } from 'lucide-react';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

// ── Sortable item ─────────────────────────────────────────────────────────────

interface SortableItemProps {
  section: BuilderSection;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
}

function SortableItem({
  section,
  isActive,
  onSelect,
  onDelete,
  onDuplicate,
  onToggle,
}: SortableItemProps) {
  const [hovered, setHovered] = useState(false);
  const meta = getSectionMeta(section.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? 'bg-indigo-600/20 border border-indigo-500/40'
          : 'border border-transparent hover:bg-white/5'
      } ${!section.enabled ? 'opacity-50' : ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect(section.id)}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-gray-500 hover:text-gray-300 cursor-grab active:cursor-grabbing p-0.5 rounded"
        onClick={(e) => e.stopPropagation()}
        title="ড্র্যাগ করুন"
        aria-label="Drag section"
      >
        <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>

      {/* Section name + variant badge */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-200 truncate">
          {meta?.name ?? section.type}
        </p>
        {section.variant && (
          <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono mt-0.5">
            {section.variant}
          </span>
        )}
      </div>

      {/* Hover actions */}
      {hovered && (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onToggle(section.id, !section.enabled)}
            className="p-1 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/10 transition-colors"
            title={section.enabled ? 'লুকান' : 'দেখান'}
          >
            {section.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
          </button>
          <button
            onClick={() => onSelect(section.id)}
            className="p-1 rounded text-gray-400 hover:text-blue-400 hover:bg-white/10 transition-colors"
            title="সম্পাদনা করুন"
          >
            <Pencil size={13} />
          </button>
          <button
            onClick={() => onDuplicate(section.id)}
            className="p-1 rounded text-gray-400 hover:text-green-400 hover:bg-white/10 transition-colors"
            title="কপি করুন"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-1 rounded text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
            title="মুছুন"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main SectionList ──────────────────────────────────────────────────────────

export interface SectionListProps {
  sections: BuilderSection[];
  activeSectionId: string | null;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onOpenAddModal: () => void;
}

export function SectionList({
  sections,
  activeSectionId,
  onSelect,
  onReorder,
  onDelete,
  onDuplicate,
  onToggle,
  onOpenAddModal,
}: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = arrayMove(sections, oldIndex, newIndex);
      onReorder(reordered.map((s) => s.id));
    },
    [sections, onReorder]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 py-3 border-b border-white/10">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
          সেকশনসমূহ
        </p>
      </div>

      {/* Sortable list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-600 text-sm">
            <p>কোনো সেকশন নেই</p>
            <p className="text-xs mt-1">নিচের বাটনে ক্লিক করে যোগ করুন</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableItem
                  key={section.id}
                  section={section}
                  isActive={section.id === activeSectionId}
                  onSelect={onSelect}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onToggle={onToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Section button */}
      <div className="px-3 py-3 border-t border-white/10">
        <button
          onClick={onOpenAddModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-dashed border-white/20 text-gray-400 hover:text-white hover:border-indigo-500/60 hover:bg-indigo-500/10 transition-all text-sm font-medium"
        >
          <Plus size={15} />
          সেকশন যোগ করুন
        </button>
      </div>
    </div>
  );
}
