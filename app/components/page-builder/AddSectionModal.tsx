/**
 * Page Builder v2 - Add Section Modal
 * 
 * Modal to select a section type to add.
 */

import { X } from 'lucide-react';
import {
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
import type { SectionMeta, SectionType } from '~/lib/page-builder/types';

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

interface AddSectionModalProps {
  sections: SectionMeta[];
  onSelect: (type: SectionType) => void;
  onClose: () => void;
}

export function AddSectionModal({ sections, onSelect, onClose }: AddSectionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Add Section</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Section Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {sections.map((section) => {
              const IconComponent = ICON_MAP[section.icon];
              
              return (
                <button
                  key={section.type}
                  onClick={() => onSelect(section.type)}
                  className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                    {IconComponent && (
                      <IconComponent size={20} className="text-gray-600 group-hover:text-indigo-600" />
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">{section.name}</div>
                    <div className="text-xs text-gray-500">{section.nameEn}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
