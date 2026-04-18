/**
 * Page Builder v2 - Sortable Item Component
 * 
 * Individual section item in the sidebar list with drag handle.
 */

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Type,
  Star,
  MessageSquare,
  HelpCircle,
  Image,
  Video,
  ShoppingCart,
  ShieldCheck,
  CheckCircle,
  Layers,
  Truck,
  Shield,
  AlertCircle,
  Tag,
  ListOrdered,
  Box,
  type LucideIcon,
} from 'lucide-react';
import type { BuilderSection } from '~/lib/page-builder/types';
import { getSectionMeta } from '~/lib/page-builder/registry';

// Icon mapping
const ICON_MAP: Record<string, LucideIcon> = {
  Type,
  Star,
  MessageSquare,
  HelpCircle,
  Image,
  Video,
  ShoppingCart,
  ShieldCheck,
  CheckCircle,
  Layers,
  Truck,
  Shield,
  AlertCircle,
  Tag,
  ListOrdered,
  Box,
};


interface SortableItemProps {
  section: BuilderSection;
  isActive: boolean;
  onSelect: () => void;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

export function SortableItem({
  section,
  isActive,
  onSelect,
  onToggle,
  onDelete,
  onDuplicate,
}: SortableItemProps) {
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
    opacity: isDragging ? 0.5 : 1,
  };
  
  const meta = getSectionMeta(section.type);
  const IconComponent = meta ? ICON_MAP[meta.icon] : null;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex items-center gap-2 p-2 rounded-lg border transition-all
        ${isActive 
          ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' 
          : 'border-gray-200 bg-white hover:border-gray-300'
        }
        ${!section.enabled ? 'opacity-60' : ''}
        ${isDragging ? 'shadow-lg z-10' : ''}
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label="Drag to reorder section"
      >
        <GripVertical size={16} aria-hidden="true" />
      </button>
      
      {/* Icon */}
      {IconComponent && (
        <span className="text-gray-500" aria-hidden="true">
          <IconComponent size={16} />
        </span>
      )}
      
      {/* Name */}
      <button
        onClick={onSelect}
        className="flex-1 text-left text-sm font-medium text-gray-700 truncate rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
        aria-label={`Select ${meta?.name || section.type} section`}
      >
        {meta?.name || section.type}
      </button>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        {/* Toggle visibility */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!section.enabled);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title={section.enabled ? 'Hide' : 'Show'}
          aria-label={section.enabled ? 'Hide section' : 'Show section'}
        >
          {section.enabled ? <Eye size={14} aria-hidden="true" /> : <EyeOff size={14} aria-hidden="true" />}
        </button>
        
        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Duplicate"
          aria-label="Duplicate section"
        >
          <Copy size={14} aria-hidden="true" />
        </button>
        
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title="Delete"
          aria-label="Delete section"
        >
          <Trash2 size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
