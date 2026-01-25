/**
 * Page Builder v2 - Add Section Modal
 *
 * Modal to select a section type to add.
 * Includes search/filter functionality for quick access.
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;

    const query = searchQuery.toLowerCase().trim();
    return sections.filter(
      (section) =>
        section.name.toLowerCase().includes(query) ||
        section.nameEn.toLowerCase().includes(query) ||
        section.type.toLowerCase().includes(query)
    );
  }, [sections, searchQuery]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onKeyDown={handleKeyDown}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">সেকশন যোগ করুন</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="সেকশন খুঁজুন... (Hero, CTA, FAQ...)"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-xs text-gray-500">
              {filteredSections.length} টি সেকশন পাওয়া গেছে
            </p>
          )}
        </div>

        {/* Section Grid */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {filteredSections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">কোন সেকশন পাওয়া যায়নি</p>
              <p className="text-xs mt-1">অন্য কিছু খুঁজে দেখুন</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredSections.map((section) => {
                const IconComponent = ICON_MAP[section.icon];

                return (
                  <button
                    key={section.type}
                    onClick={() => onSelect(section.type)}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                      {IconComponent && (
                        <IconComponent
                          size={20}
                          className="text-gray-600 group-hover:text-indigo-600"
                        />
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
          )}
        </div>
      </div>
    </div>
  );
}
