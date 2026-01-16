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
        className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      
      {/* Icon */}
      {IconComponent && (
        <span className="text-gray-500">
          <IconComponent size={16} />
        </span>
      )}
      
      {/* Name */}
      <button
        onClick={onSelect}
        className="flex-1 text-left text-sm font-medium text-gray-700 truncate"
      >
        {meta?.name || section.type}
      </button>
      
      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Toggle visibility */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!section.enabled);
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title={section.enabled ? 'Hide' : 'Show'}
        >
          {section.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        
        {/* Duplicate */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate();
          }}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        
        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
