/**
 * Add Section Modal Component
 * 
 * Modal that displays available section templates for users to add
 * to their landing page. Shows sections in a categorized grid.
 */

import { useState } from 'react';
import { X, Layout, Star, Users, ShoppingCart, Layers, Type, Video, Image, MessageSquare, HelpCircle, ShieldCheck, Truck, Tag, Box, ListOrdered, CheckCircle } from 'lucide-react';
import { LANDING_SECTIONS } from './SectionManager';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSection: (sectionId: string) => void;
  existingSections: string[];
  language?: 'bn' | 'en';
}

// Section categories for filtering
const SECTION_CATEGORIES = [
  { id: 'all', name: 'সব', nameEn: 'All', icon: Layers },
  { id: 'hero', name: 'হিরো', nameEn: 'Hero', icon: Type },
  { id: 'content', name: 'কন্টেন্ট', nameEn: 'Content', icon: Layout },
  { id: 'social', name: 'সোশ্যাল প্রুফ', nameEn: 'Social Proof', icon: Users },
  { id: 'sales', name: 'সেলস', nameEn: 'Sales', icon: ShoppingCart },
];

// Map sections to categories
const SECTION_CATEGORY_MAP: Record<string, string> = {
  'hero': 'hero',
  'trust': 'social',
  'features': 'content',
  'gallery': 'content',
  'video': 'content',
  'benefits': 'content',
  'comparison': 'content',
  'testimonials': 'social',
  'social': 'social',
  'delivery': 'sales',
  'faq': 'content',
  'guarantee': 'sales',
  'cta': 'sales',
  'pricing': 'sales',
  'how-to-order': 'sales',
  'showcase': 'content',
};

export function AddSectionModal({
  isOpen,
  onClose,
  onAddSection,
  existingSections,
  language = 'bn',
}: AddSectionModalProps) {
  const [activeCategory, setActiveCategory] = useState('all');

  if (!isOpen) return null;

  // Filter sections by category
  const filteredSections = LANDING_SECTIONS.filter((section) => {
    if (activeCategory === 'all') return true;
    return SECTION_CATEGORY_MAP[section.id] === activeCategory;
  });

  // Check if section is already added
  const isSectionAdded = (sectionId: string) => existingSections.includes(sectionId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            {language === 'bn' ? '➕ সেকশন যোগ করুন' : '➕ Add Section'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1 p-3 border-b border-gray-100 overflow-x-auto">
          {SECTION_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {language === 'bn' ? cat.name : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Section Grid */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredSections.map((section) => {
              const isAdded = isSectionAdded(section.id);
              const Icon = section.icon;
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    if (!isAdded) {
                      onAddSection(section.id);
                      onClose();
                    }
                  }}
                  disabled={isAdded}
                  className={`group relative p-4 rounded-xl border-2 text-left transition ${
                    isAdded
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-gray-200 hover:border-emerald-400 hover:shadow-md hover:bg-emerald-50/50'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    isAdded ? 'bg-gray-200' : 'bg-emerald-100 group-hover:bg-emerald-200'
                  }`}>
                    <Icon className={`w-5 h-5 ${isAdded ? 'text-gray-400' : 'text-emerald-600'}`} />
                  </div>

                  {/* Name */}
                  <h3 className="font-medium text-gray-900 text-sm mb-1">
                    {language === 'bn' ? section.name : section.nameEn}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {language === 'bn' ? section.description : section.descriptionEn}
                  </p>

                  {/* Added Badge */}
                  {isAdded && (
                    <span className="absolute top-2 right-2 text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                      {language === 'bn' ? 'যুক্ত' : 'Added'}
                    </span>
                  )}

                  {/* Required Badge */}
                  {section.required && (
                    <span className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {language === 'bn' ? 'আবশ্যিক' : 'Required'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredSections.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Layers className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>{language === 'bn' ? 'এই ক্যাটাগরিতে কোনো সেকশন নেই' : 'No sections in this category'}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-500 text-center">
            {language === 'bn' 
              ? 'সেকশন যোগ করতে ক্লিক করুন। যোগ করার পর সেকশন অর্ডার দিয়ে সাজাতে পারবেন।'
              : 'Click a section to add it. You can reorder sections after adding.'}
          </p>
        </div>
      </div>
    </div>
  );
}

export default AddSectionModal;
